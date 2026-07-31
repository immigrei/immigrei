import { supabaseAdmin } from "@/lib/supabase";
import type { PlanId } from "@/lib/stripe";

export type UserPlan = PlanId | "free";

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

/** Server-side only. Returns the user's current plan ("free" if none). */
export async function getUserPlan(clerkUserId: string): Promise<UserPlan> {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", clerkUserId)
    .maybeSingle();

  if (!data || !ACTIVE_STATUSES.has(data.status)) return "free";

  // A missed webhook (customer.subscription.deleted never delivered) leaves
  // the row saying "active" forever. current_period_end already having
  // passed is the giveaway — Stripe doesn't rewind it during dunning
  // retries, so this doesn't clip a legitimate past_due grace period.
  if (data.current_period_end && new Date(data.current_period_end) < new Date()) {
    return "free";
  }

  return data.plan as PlanId;
}
