import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { getStripe, planFromPriceId } from "@/lib/stripe";

/**
 * Stripe webhook — keeps the subscriptions table in sync.
 * Register in the Stripe dashboard:
 *   endpoint: https://immigrei.vercel.app/api/webhooks/stripe
 *   events:   checkout.session.completed,
 *             customer.subscription.updated, customer.subscription.deleted
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
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId = sub.metadata?.clerk_user_id;
        if (userId) await upsertSubscription(userId, sub);
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
  const plan = planFromPriceId(item?.price.id ?? "");
  if (!plan) {
    console.error("stripe webhook: unknown price", item?.price.id);
    return;
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
