import Stripe from "stripe";

let _stripe: Stripe | null = null;
export function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

// Live price ids created 2026-07-28 — single subscription tier, billed
// monthly or annually. Override via env if prices are ever recreated.
export const PLANS = {
  monthly: {
    name: "Immigrei",
    priceId: process.env.STRIPE_PRICE_MONTHLY ?? "price_1Ty5wp4BxAIRzYfOnpJku6Xb",
    amount: 29.9,
  },
  annual: {
    name: "Immigrei",
    priceId: process.env.STRIPE_PRICE_ANNUAL ?? "price_1Ty5wp4BxAIRzYfOtgyBbThC",
    amount: 269.0,
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function planFromPriceId(priceId: string): PlanId | null {
  for (const [id, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return id as PlanId;
  }
  return null;
}
