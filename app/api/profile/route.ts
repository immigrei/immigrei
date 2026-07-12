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
  const { visa_type, arrival_date, main_goal, location, nationality, chosen_school } = body;

  if (!visa_type && !arrival_date && !main_goal && !location && !nationality && chosen_school === undefined) {
    return NextResponse.json({ error: "No fields to save" }, { status: 400 });
  }

  // chosen_school: campus snapshot from /escolas, or null to clear it.
  if (chosen_school !== undefined && chosen_school !== null) {
    const s = chosen_school;
    if (typeof s !== "object" || !s.school_name || !s.city || !s.state || !s.campus_code) {
      return NextResponse.json({ error: "Invalid chosen_school" }, { status: 400 });
    }
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
  if (chosen_school !== undefined) {
    row.chosen_school = chosen_school === null ? null : {
      school_name: String(chosen_school.school_name),
      campus_name: String(chosen_school.campus_name ?? chosen_school.school_name),
      city:        String(chosen_school.city),
      state:       String(chosen_school.state),
      campus_code: String(chosen_school.campus_code),
      accepts_f:   Boolean(chosen_school.accepts_f),
      accepts_m:   Boolean(chosen_school.accepts_m),
      chosen_at:   new Date().toISOString(),
    };
  }

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
