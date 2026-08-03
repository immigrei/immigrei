import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
import { checkRateLimit } from "@/lib/rate-limit";

// Creates a Stripe Billing Portal session — lets the user cancel, change
// plan, update payment method or see invoices on Stripe's own hosted page,
// without us building/maintaining that flow ourselves.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = await checkRateLimit(`stripe-portal:${userId}`, { max: 5, windowMs: 10 * 60_000 });
  if (!allowed) return NextResponse.json({ error: "too many requests" }, { status: 429 });

  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data?.stripe_customer_id) {
    return NextResponse.json({ error: "no subscription found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://immigrei.vercel.app";
  const stripe = getStripe();

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${appUrl}/perfil`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Most common cause in a fresh Stripe account: the Customer Portal was
    // never activated in the Dashboard (Settings → Billing → Customer
    // portal) — Stripe rejects the session request until that's done once.
    console.error("stripe billing portal failed:", err);
    return NextResponse.json({ error: "portal unavailable" }, { status: 500 });
  }
}
