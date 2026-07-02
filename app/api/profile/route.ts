import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Partial upsert: the onboarding flow saves in stages (questionnaire →
// visa selection), so any subset of fields may arrive. visa_type marks
// the journey as chosen and completes onboarding.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const body = await req.json().catch(() => ({}));
  const { visa_type, arrival_date, main_goal, location, nationality } = body;

  if (!visa_type && !arrival_date && !main_goal && !location && !nationality) {
    return NextResponse.json({ error: "No fields to save" }, { status: 400 });
  }

  const row: Record<string, unknown> = {
    clerk_user_id: userId,
    full_name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
    email: user?.emailAddresses[0]?.emailAddress ?? null,
    updated_at: new Date().toISOString(),
  };
  if (visa_type) {
    row.visa_type = visa_type;
    row.onboarding_completed = true;
  }
  if (arrival_date) row.arrival_date = arrival_date;
  if (main_goal) row.main_goal = main_goal;
  if (location) row.location = location;
  if (nationality) row.nationality = nationality;

  const { error } = await supabaseAdmin
    .from("profiles")
    .upsert(row, { onConflict: "clerk_user_id" });

  if (error) {
    console.error("Supabase upsert error:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (error) return NextResponse.json({ profile: null });
  return NextResponse.json({ profile: data });
}
