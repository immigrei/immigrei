import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { getStripe, planFromPriceId, PLANS } from "@/lib/stripe";
import { notifySlackAlert } from "@/lib/slack-alert";

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
        );
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId = sub.metadata?.clerk_user_id;
        if (userId) await upsertSubscription(userId, sub);
        if (event.type === "customer.subscription.deleted") {
          await notifySlackAlert(`:wave: Assinatura cancelada — customer ${sub.customer as string}`);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await notifySlackAlert(
          `:x: Falha de cobrança — customer ${invoice.customer as string}${invoice.customer_email ? ` (${invoice.customer_email})` : ""}, valor ${(invoice.amount_due / 100).toFixed(2)}`,
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
