import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { getStripe, planFromPriceId, PLANS } from "@/lib/stripe";
import { notifySlackAlert } from "@/lib/slack-alert";
import {
  sendSubscriptionConfirmed,
  sendSubscriptionCancelled,
  sendRetentionNudge,
  sendPlanCycleChanged,
  sendAccessEnded,
  sendSubscriptionReactivated,
} from "@/lib/notifications";

const CYCLE_LABEL: Record<string, string> = { monthly: "mensal", annual: "anual" };

function formatUSD(amount: number) {
  return `US$ ${amount.toFixed(2).replace(".", ",")}`;
}

function formatDatePT(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

async function getProfile(userId: string) {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("email, full_name, visa_type")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  return data as { email: string | null; full_name: string | null; visa_type: string | null } | null;
}

/**
 * Stripe webhook — keeps the subscriptions table in sync.
 * Register in the Stripe dashboard:
 *   endpoint: https://immigrei.vercel.app/api/webhooks/stripe
 *   events:   checkout.session.completed,
 *             customer.subscription.updated, customer.subscription.deleted,
 *             invoice.payment_failed
 * Then set STRIPE_WEBHOOK_SECRET (whsec_...) in Vercel.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "webhook not configured" }, { status: 500 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id ?? session.metadata?.clerk_user_id;
        if (!userId || session.mode !== "subscription") break;
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await upsertSubscription(userId, sub);
        const plan = planFromPriceId(sub.items.data[0]?.price.id ?? "");
        await notifySlackAlert(
          `:moneybag: Nova assinatura — ${plan ? PLANS[plan].name + " (" + plan + ")" : "plano desconhecido"}${session.customer_details?.email ? ` — ${session.customer_details.email}` : ""}`,
          process.env.SLACK_STRIPE_WEBHOOK_URL,
        );

        // Flow 06 — subscription confirmation email (see
        // content/marketing/email-flows/06-confirmacao-assinatura.md).
        // session.customer_details.email is already on the event payload, but
        // the display name only lives in profiles — one lookup to personalize
        // the greeting, same pattern the other templates use.
        const to = session.customer_details?.email;
        if (to && plan) {
          const profile = await getProfile(userId);
          const item = sub.items.data[0];
          let invoiceUrl: string | undefined;
          if (session.invoice) {
            const invoice = await stripe.invoices.retrieve(session.invoice as string);
            invoiceUrl = invoice.hosted_invoice_url ?? undefined;
          }
          await sendSubscriptionConfirmed({
            to,
            userName: profile?.full_name ?? "",
            planName: PLANS[plan].name,
            isAnnual: plan === "annual",
            amountFormatted: formatUSD(PLANS[plan].amount),
            currentPeriodEndFormatted: item?.current_period_end
              ? formatDatePT(new Date(item.current_period_end * 1000))
              : "",
            invoiceUrl,
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId = sub.metadata?.clerk_user_id;
        if (userId) await upsertSubscription(userId, sub);

        if (event.type === "customer.subscription.deleted") {
          await notifySlackAlert(
            `:wave: Assinatura cancelada — customer ${sub.customer as string}`,
            process.env.SLACK_STRIPE_WEBHOOK_URL,
          );

          // Flow 10 — access ended (see
          // content/marketing/email-flows/10-acesso-encerrado.md). Fires for
          // both a voluntary cancellation reaching its period end and a
          // dunning-exhausted involuntary cancellation — same event either
          // way, spec says one email covers both.
          if (userId) {
            const profile = await getProfile(userId);
            if (profile?.email) {
              await sendAccessEnded({ to: profile.email, userName: profile.full_name ?? "" });
            }
          }
        } else {
          // The billing portal's default "cancel" doesn't delete the subscription —
          // it schedules the cancellation and the sub keeps running until the
          // period ends. That's the moment the team actually wants to know about,
          // since customer.subscription.deleted won't fire until later (or never,
          // if the customer changes their mind). previous_attributes lets us alert
          // only on the flip, not on every unrelated update to the subscription.
          //
          // Confirmed against a real portal-cancel event on this account's API
          // version (2026-04-22.dahlia, Aug 10 2026): the portal sets `cancel_at`
          // to the period-end timestamp and leaves `cancel_at_period_end` at
          // false — the older flag this used to key off of. Checking both keeps
          // this working regardless of which field a given API version uses.
          const previous = event.data.previous_attributes as Partial<Stripe.Subscription> | undefined;
          const cancelJustScheduled =
            (sub.cancel_at_period_end && previous && "cancel_at_period_end" in previous) ||
            (!!sub.cancel_at && previous && "cancel_at" in previous && !previous.cancel_at);
          const justReactivated =
            (!sub.cancel_at_period_end && previous?.cancel_at_period_end === true) ||
            (!sub.cancel_at && previous && "cancel_at" in previous && !!previous.cancel_at);

          if (cancelJustScheduled) {
            await notifySlackAlert(
              `:hourglass_flowing_sand: Cancelamento agendado — customer ${sub.customer as string}, vigente até ${new Date(sub.items.data[0]?.current_period_end * 1000).toLocaleDateString("pt-BR")}`,
              process.env.SLACK_STRIPE_WEBHOOK_URL,
            );

            // Flow 08 — cancellation confirmed (see
            // content/marketing/email-flows/08-cancelamento-confirmado.md).
            if (userId) {
              const profile = await getProfile(userId);
              const periodEnd = sub.items.data[0]?.current_period_end;
              if (profile?.email && periodEnd) {
                const accessUntilFormatted = formatDatePT(new Date(periodEnd * 1000));
                await sendSubscriptionCancelled({
                  to: profile.email,
                  userName: profile.full_name ?? "",
                  accessUntilFormatted,
                });

                // Retention nudge — separate email, sent right after the
                // receipt above (kept apart from flow 08 on purpose, see
                // sendRetentionNudge's comment in lib/notifications.ts).
                const planId = planFromPriceId(sub.items.data[0]?.price.id ?? "");
                if (planId) {
                  await sendRetentionNudge({
                    to: profile.email,
                    userName: profile.full_name ?? "",
                    accessUntilFormatted,
                    planId,
                    visaType: profile.visa_type,
                  });
                }
              }
            }
          } else if (justReactivated) {
            await notifySlackAlert(
              `:tada: Assinatura reativada — customer ${sub.customer as string}`,
              process.env.SLACK_STRIPE_WEBHOOK_URL,
            );

            // Flow 12 — subscription reactivated (see
            // content/marketing/email-flows/12-reativacao-de-assinatura.md).
            if (userId) {
              const profile = await getProfile(userId);
              const periodEnd = sub.items.data[0]?.current_period_end;
              if (profile?.email && periodEnd) {
                await sendSubscriptionReactivated({
                  to: profile.email,
                  userName: profile.full_name ?? "",
                  currentPeriodEndFormatted: formatDatePT(new Date(periodEnd * 1000)),
                });
              }
            }
          } else {
            // Flow 09 — billing cycle changed (see
            // content/marketing/email-flows/09-troca-de-ciclo.md). Stripe's
            // previous_attributes ships the *entire* previous items array
            // when a subscription item changes (not a partial diff), per the
            // spec's own caveat to verify against a real test-mode event —
            // reading items.data[0].price.id off it here matches that shape.
            const previousItems = (event.data.previous_attributes as Partial<Stripe.Subscription>)?.items?.data;
            const previousPriceId = previousItems?.[0]?.price?.id;
            const currentPriceId = sub.items.data[0]?.price.id;
            if (previousPriceId && currentPriceId && previousPriceId !== currentPriceId) {
              const fromPlan = planFromPriceId(previousPriceId);
              const toPlan = planFromPriceId(currentPriceId);
              if (fromPlan && toPlan && fromPlan !== toPlan) {
                await notifySlackAlert(
                  `:repeat: Troca de ciclo — customer ${sub.customer as string}, ${fromPlan} → ${toPlan}`,
                  process.env.SLACK_STRIPE_WEBHOOK_URL,
                );
                if (userId) {
                  const profile = await getProfile(userId);
                  const periodEnd = sub.items.data[0]?.current_period_end;
                  if (profile?.email && periodEnd) {
                    await sendPlanCycleChanged({
                      to: profile.email,
                      userName: profile.full_name ?? "",
                      fromCycleLabel: CYCLE_LABEL[fromPlan] ?? fromPlan,
                      toCycleLabel: CYCLE_LABEL[toPlan] ?? toPlan,
                      newAmountFormatted: formatUSD(PLANS[toPlan].amount),
                      currentPeriodEndFormatted: formatDatePT(new Date(periodEnd * 1000)),
                      switchedToAnnual: toPlan === "annual",
                    });
                  }
                }
              }
            }
          }
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await notifySlackAlert(
          `:x: Falha de cobrança — customer ${invoice.customer as string}${invoice.customer_email ? ` (${invoice.customer_email})` : ""}, valor ${(invoice.amount_due / 100).toFixed(2)}`,
          process.env.SLACK_STRIPE_WEBHOOK_URL,
        );
        break;
      }
    }
  } catch (err) {
    console.error("stripe webhook failed:", event.type, err);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(userId: string, sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  const priceId = item?.price.id ?? "";
  const plan = planFromPriceId(priceId);
  if (!plan) {
    // Throw instead of returning: swallowing this would answer 200, Stripe
    // would mark the event delivered, and the customer would have paid for
    // access they never get — with no signal anywhere. Failing loudly puts it
    // in Stripe's failed-webhook list. Usual cause is a STRIPE_PRICE_* env var
    // drifting away from the price that is actually live.
    const known = Object.values(PLANS).map((p) => p.priceId).join(", ");
    throw new Error(`unknown price ${priceId} — expected one of: ${known}`);
  }
  const periodEnd = item?.current_period_end;
  const { error } = await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: sub.customer as string,
      stripe_subscription_id: sub.id,
      plan,
      status: sub.status,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);
}
