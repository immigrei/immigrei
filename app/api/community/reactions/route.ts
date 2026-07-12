import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUserPlan } from "@/lib/plan";

// "Me ajudou" toggle. Reacting, like publishing, is a subscriber action.

// POST { reportId } → toggles the viewer's reaction, returns the new state.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plan = await getUserPlan(userId);
  if (plan === "free") {
    return NextResponse.json(
      { error: "Reagir aos relatos é exclusivo para assinantes." },
      { status: 403 }
    );
  }

  const { reportId } = await req.json().catch(() => ({}));
  if (typeof reportId !== "string") {
    return NextResponse.json({ error: "reportId required" }, { status: 400 });
  }

  const { data: report } = await supabaseAdmin
    .from("community_reports")
    .select("id, status")
    .eq("id", reportId)
    .single();
  if (!report || report.status !== "approved") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: existing } = await supabaseAdmin
    .from("report_reactions")
    .select("report_id")
    .eq("report_id", reportId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseAdmin
      .from("report_reactions")
      .delete()
      .eq("report_id", reportId)
      .eq("user_id", userId);
    if (error) {
      console.error("Remove reaction error:", error);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
    return NextResponse.json({ helped: false });
  }

  const { error } = await supabaseAdmin
    .from("report_reactions")
    .insert({ report_id: reportId, user_id: userId });
  if (error) {
    console.error("Add reaction error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
  return NextResponse.json({ helped: true });
}
