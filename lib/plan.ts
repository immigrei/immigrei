import { supabaseAdmin } from "@/lib/supabase";
import type { PlanId } from "@/lib/stripe";

export type UserPlan = PlanId | "free";

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

/** Server-side only. Returns the user's current plan ("free" if none). */
export async function getUserPlan(clerkUserId: string): Promise<UserPlan> {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", clerkUserId)
    .maybeSingle();

  if (data && ACTIVE_STATUSES.has(data.status)) return data.plan as PlanId;
  return "free";
}
