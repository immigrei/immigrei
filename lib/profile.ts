import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Ensures a `profiles` row exists for the signed-in Clerk user.
 *
 * Decouples profile creation from the Clerk webhook (which only fires in
 * production and needs CLERK_WEBHOOK_SECRET). Safe to call on every
 * authenticated server render: it's an idempotent upsert that syncs the
 * identity fields from Clerk and never touches the onboarding fields
 * (visa_type, main_goal, arrival_date, onboarding_completed).
 */
export async function ensureProfile(userId: string) {
  const user = await currentUser();

  const { error } = await supabaseAdmin.from("profiles").upsert(
    {
      clerk_user_id: userId,
      full_name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null,
      email: user?.emailAddresses?.[0]?.emailAddress ?? null,
      avatar_url: user?.imageUrl ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id" }
  );

  if (error) {
    console.error("ensureProfile upsert error:", error.message, error.code ?? "");
  }
}
