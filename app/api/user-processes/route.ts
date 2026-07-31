/**
 * GET  /api/user-processes        — list the user's active parallel processes
 * POST /api/user-processes        — create one (or update it, if the same
 *                                    kit_id is confirmed again)
 *
 * A user can be running more than one immigration process at once (e.g. a
 * B-1/B-2 extension while also filing I-130/I-485). Ordered by soonest
 * deadline first so the Início/Painel summary surfaces whichever process
 * needs attention next, not just the main journey's.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";
import { getUserPlan } from "@/lib/plan";

const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const CreateBodySchema = z.object({
  kitId: z.string().nullable().optional(),
  label: z.string().min(1),
  status: z.enum(["ativo", "consideracao"]).optional(),
  deadlineDate: DateStringSchema.nullable().optional(),
  deadlineLabel: z.string().nullable().optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plan = await getUserPlan(userId);
  if (plan === "free") {
    return NextResponse.json({ error: "Processos em paralelo são exclusivos para assinantes." }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("user_processes")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("deadline_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("List user_processes error:", error);
    return NextResponse.json({ error: "Failed to list" }, { status: 500 });
  }
  return NextResponse.json({ processes: data });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plan = await getUserPlan(userId);
  if (plan === "free") {
    return NextResponse.json({ error: "Processos em paralelo são exclusivos para assinantes." }, { status: 403 });
  }

  const rawBody = await req.json().catch(() => ({}));
  const parsed = CreateBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }
  const { kitId, label, status, deadlineDate, deadlineLabel } = parsed.data;

  await ensureProfile(userId);

  const row = {
    user_id: userId,
    kit_id: kitId ?? null,
    label,
    status: status ?? (kitId ? "ativo" : "consideracao"),
    deadline_date: deadlineDate ?? null,
    deadline_label: deadlineLabel ?? null,
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  // Confirming the same kit twice updates the existing row instead of
  // duplicating it. Done as a manual find-then-write rather than
  // .upsert(onConflict) — the (user_id, kit_id) unique index is partial
  // (only covers active rows with a kit_id), and Postgres's ON CONFLICT
  // shorthand can't target a partial index, so upsert() 500s with
  // "no unique or exclusion constraint matching the ON CONFLICT
  // specification" every time.
  let existingId: string | null = null;
  if (kitId) {
    const { data: existing } = await supabaseAdmin
      .from("user_processes")
      .select("id")
      .eq("user_id", userId)
      .eq("kit_id", kitId)
      .eq("is_active", true)
      .maybeSingle();
    existingId = existing?.id ?? null;
  }

  const query = existingId
    ? supabaseAdmin.from("user_processes").update(row).eq("id", existingId)
    : supabaseAdmin.from("user_processes").insert(row);

  const { data, error } = await query.select().single();

  if (error) {
    console.error("Create user_processes error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
  return NextResponse.json({ process: data });
}
