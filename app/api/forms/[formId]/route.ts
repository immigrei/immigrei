/**
 * GET/POST /api/forms/[formId]
 *
 * Draft answers for a form-filler session. GET returns the saved answers merged
 * over the profile prefill (Brazilian-first defaults + identity we already
 * hold). POST autosaves the full answers object. One draft per (user, form) —
 * partial upsert done in code, mirroring app/api/cases/cos-b2-f1/route.ts.
 *
 * Requires an authenticated Clerk session; while logged out the client keeps
 * the draft in local state and this route just 401s (non-blocking).
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";
import { getForm } from "@/lib/forms/registry";
import { mergeAnswers, type ProfileForPrefill } from "@/lib/forms/prefill";
import type { Answers } from "@/lib/forms/types";

export const runtime = "nodejs";

async function loadProfile(userId: string): Promise<ProfileForPrefill> {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("full_name, email, nationality, arrival_date")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  return data ?? {};
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ formId: string }> }) {
  const { formId } = await ctx.params;
  const form = getForm(formId);
  if (!form) return NextResponse.json({ error: "Formulário não encontrado." }, { status: 404 });

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const [profile, { data: submission }] = await Promise.all([
    loadProfile(userId),
    supabaseAdmin
      .from("form_submissions")
      .select("answers, status, exported_at")
      .eq("user_id", userId)
      .eq("form_id", formId)
      .maybeSingle(),
  ]);

  const saved = (submission?.answers ?? null) as Answers | null;
  return NextResponse.json({
    answers: mergeAnswers(form, profile, saved),
    status: submission?.status ?? "draft",
    exportedAt: submission?.exported_at ?? null,
  });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ formId: string }> }) {
  const { formId } = await ctx.params;
  const form = getForm(formId);
  if (!form) return NextResponse.json({ error: "Formulário não encontrado." }, { status: 404 });

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const answers = (body?.answers ?? null) as Answers | null;
  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "Respostas ausentes." }, { status: 400 });
  }

  const { data: existing } = await supabaseAdmin
    .from("form_submissions")
    .select("id")
    .eq("user_id", userId)
    .eq("form_id", formId)
    .maybeSingle();

  if (!existing) await ensureProfile(userId);

  const row = {
    answers,
    visto_id: form.attachTo.vistoId,
    updated_at: new Date().toISOString(),
  };

  const query = existing
    ? supabaseAdmin.from("form_submissions").update(row).eq("id", existing.id)
    : supabaseAdmin.from("form_submissions").insert({ user_id: userId, form_id: formId, ...row });

  let { error } = await query;

  // 23505 = concurrent first-insert race (two tabs); the loser becomes update.
  if (error?.code === "23505" && !existing) {
    ({ error } = await supabaseAdmin
      .from("form_submissions")
      .update(row)
      .eq("user_id", userId)
      .eq("form_id", formId));
  }

  if (error) {
    console.error("form_submissions upsert error:", error);
    return NextResponse.json({ error: "Falha ao salvar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
