import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";

const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const FamilyTiesSchema = z.enum(["spouse_citizen", "parent_child_citizen", "family_gc", "none"]);
const ChosenSchoolSchema = z.object({
  school_name: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  campus_code: z.string().min(1),
}).passthrough();

// Partial upsert: the onboarding flow saves in stages (questionnaire →
// visa selection), so any subset of fields may arrive. visa_type marks
// the journey as chosen and completes onboarding.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const body = await req.json().catch(() => ({}));
  const { visa_type, arrival_date, main_goal, location, nationality, chosen_school, i94_expiry_date, family_ties, f1_program_start_date } = body;

  if (
    !visa_type && !arrival_date && !main_goal && !location && !nationality &&
    chosen_school === undefined && i94_expiry_date === undefined && family_ties === undefined &&
    f1_program_start_date === undefined
  ) {
    return NextResponse.json({ error: "No fields to save" }, { status: 400 });
  }

  if (i94_expiry_date !== undefined && i94_expiry_date !== null && !DateStringSchema.safeParse(i94_expiry_date).success) {
    return NextResponse.json({ error: "Invalid i94_expiry_date" }, { status: 400 });
  }

  if (f1_program_start_date !== undefined && f1_program_start_date !== null && !DateStringSchema.safeParse(f1_program_start_date).success) {
    return NextResponse.json({ error: "Invalid f1_program_start_date" }, { status: 400 });
  }

  if (family_ties !== undefined && family_ties !== null && !FamilyTiesSchema.safeParse(family_ties).success) {
    return NextResponse.json({ error: "Invalid family_ties" }, { status: 400 });
  }

  // chosen_school: campus snapshot from /escolas, or null to clear it.
  if (chosen_school !== undefined && chosen_school !== null && !ChosenSchoolSchema.safeParse(chosen_school).success) {
    return NextResponse.json({ error: "Invalid chosen_school" }, { status: 400 });
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
  if (i94_expiry_date !== undefined) row.i94_expiry_date = i94_expiry_date;
  if (family_ties !== undefined) row.family_ties = family_ties;
  if (f1_program_start_date !== undefined) row.f1_program_start_date = f1_program_start_date;
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

// Reset onboarding: clears only the journey fields so the user can redo the
// questionnaire. Never deletes the row — user_documents, user_checklist_items
// and community tables cascade on profile deletion, and the vault must survive.
export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      visa_type: null,
      arrival_date: null,
      main_goal: null,
      location: null,
      nationality: null,
      chosen_school: null,
      i94_expiry_date: null,
      family_ties: null,
      f1_program_start_date: null,
      onboarding_completed: false,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_user_id", userId);

  if (error) {
    console.error("Supabase reset error:", error);
    return NextResponse.json({ error: "Failed to reset onboarding" }, { status: 500 });
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
