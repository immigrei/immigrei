/**
 * GET/POST /api/cases/cos-b2-f1
 *
 * Fatos do caso do pathway B1/B2 -> F-1 (RFC-001 §3.4). MVP: um caso por
 * usuário. cos_b2_f1_cases não tem unique constraint em user_id sozinho
 * (só em (user_id, sevis_id) — migration 010), então o upsert parcial é
 * feito em código: lê o caso existente do usuário e faz UPDATE; se não
 * existir, faz INSERT. Segue o padrão de upsert parcial de
 * app/api/profile/route.ts.
 *
 * Requires authenticated Clerk session.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";

const UPSERTABLE_FIELDS = [
  "i94_number",
  "i94_admit_until",
  "last_entry_date",
  "sevis_id",
  "i901_fee_paid",
  "enrolled_before_approval",
  "worked_without_authorization",
] as const;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("cos_b2_f1_cases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Caso não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ case: data });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const fields: Record<string, unknown> = {};
  for (const key of UPSERTABLE_FIELDS) {
    if (body[key] !== undefined) fields[key] = body[key];
  }

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "Nenhum campo para salvar." }, { status: 400 });
  }

  fields.updated_at = new Date().toISOString();

  const { data: existing } = await supabaseAdmin
    .from("cos_b2_f1_cases")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  // user_id tem FK para profiles(clerk_user_id); quem chega por deep link
  // sem passar pelo dashboard ainda não tem perfil — garante antes do insert.
  if (!existing) {
    await ensureProfile(userId);
  }

  const query = existing
    ? supabaseAdmin.from("cos_b2_f1_cases").update(fields).eq("id", existing.id)
    : supabaseAdmin.from("cos_b2_f1_cases").insert({ user_id: userId, ...fields });

  let { data, error } = await query.select().single();

  // 23505 = corrida de dois inserts simultâneos (duas abas). O índice único
  // de user_id (migration 012) garante uma linha; o perdedor vira update.
  if (error?.code === "23505" && !existing) {
    const { data: winner } = await supabaseAdmin
      .from("cos_b2_f1_cases")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (winner) {
      ({ data, error } = await supabaseAdmin
        .from("cos_b2_f1_cases")
        .update(fields)
        .eq("id", winner.id)
        .select()
        .single());
    }
  }

  if (error) {
    // 23514 = check_violation (ex.: SEVIS ID ou I-94 number em formato
    // inválido) — erro do usuário, não falha de servidor.
    if (error.code === "23514") {
      return NextResponse.json(
        { error: "Um dos campos está em formato inválido." },
        { status: 400 },
      );
    }
    console.error("cos_b2_f1_cases upsert error:", error);
    return NextResponse.json({ error: "Falha ao salvar o caso." }, { status: 500 });
  }

  return NextResponse.json({ case: data });
}
