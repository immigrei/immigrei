import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getStripe, PLANS, type PlanId } from "@/lib/stripe";

// Creates a Stripe Checkout session for a subscription plan.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json().catch(() => ({}));
  if (plan !== "base" && plan !== "core") {
    return NextResponse.json({ error: "invalid plan" }, { status: 400 });
  }
  const planId = plan as PlanId;

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://immigrei.vercel.app";
  const stripe = getStripe();

  // Reuse the Stripe customer if the user subscribed before.
  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: PLANS[planId].priceId, quantity: 1 }],
    ...(existing?.stripe_customer_id
      ? { customer: existing.stripe_customer_id }
      : { customer_email: email }),
    client_reference_id: userId,
    metadata: { clerk_user_id: userId, plan: planId },
    subscription_data: { metadata: { clerk_user_id: userId, plan: planId } },
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/planos?checkout=cancelled`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
