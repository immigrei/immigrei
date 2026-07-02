import Stripe from "stripe";

let _stripe: Stripe | null = null;
export function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

// Test-mode price ids created 2026-07-02; override via env when the
// account goes live and new prices are created.
export const PLANS = {
  base: {
    name: "Immigrei Base",
    priceId: process.env.STRIPE_PRICE_BASE ?? "price_1TobIA37xtqeymVrF4h4a4FC",
    amount: 9,
  },
  core: {
    name: "Immigrei Core",
    priceId: process.env.STRIPE_PRICE_CORE ?? "price_1TobIB37xtqeymVrmdCwr9jH",
    amount: 29,
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function planFromPriceId(priceId: string): PlanId | null {
  for (const [id, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return id as PlanId;
  }
  return null;
}
