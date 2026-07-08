/**
 * POST /api/cases/cos-b2-f1/[id]/validate
 *
 * Roda o motor de regras do pathway B1/B2 -> F-1 (RFC-001 §3.4) sobre os
 * fatos de um caso, persiste cada RuleOutcome em case_rule_results
 * (append-only) e atualiza cos_b2_f1_cases.status.
 *
 * Requires authenticated Clerk session; o usuário só pode validar o próprio
 * caso.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  runCosB2F1Rules,
  citationFor,
  type CosB2F1CaseFacts,
} from "@/lib/rules/cosB2F1";
import { deriveCaseStatus } from "@/lib/rules/caseStatus";

function toDateOrNull(value: string | null): Date | null {
  return value ? new Date(value) : null;
}

const DAY_MS = 86_400_000;

function resolveToday(clientToday: unknown): Date {
  const serverToday = new Date();
  if (typeof clientToday !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(clientToday)) {
    return serverToday;
  }
  const parsed = new Date(clientToday);
  if (Number.isNaN(parsed.getTime())) return serverToday;
  if (Math.abs(parsed.getTime() - serverToday.getTime()) > 2 * DAY_MS) return serverToday;
  return parsed;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;

  const { data: kase, error: fetchError } = await supabaseAdmin
    .from("cos_b2_f1_cases")
    .select("*")
    .eq("id", id)
    .single();

  // supabaseAdmin ignora RLS: confirmamos a posse do caso aqui. Caso não
  // encontrado ou pertencente a outro usuário => 404 (nunca 403, para não
  // revelar a existência do caso a quem não é o dono).
  if (fetchError || !kase || kase.user_id !== userId) {
    return NextResponse.json({ error: "Caso não encontrado." }, { status: 404 });
  }

  const facts: CosB2F1CaseFacts = {
    i94AdmitUntil: toDateOrNull(kase.i94_admit_until),
    lastEntryDate: toDateOrNull(kase.last_entry_date),
    sevisId: kase.sevis_id,
    i901FeePaid: kase.i901_fee_paid,
    enrolledBeforeApproval: kase.enrolled_before_approval,
    workedWithoutAuthorization: kase.worked_without_authorization,
  };

  // "Hoje" na data LOCAL do usuário quando o cliente informa (YYYY-MM-DD);
  // new Date() no servidor é UTC e vira o dia seguinte à noite nas Américas,
  // expirando I-94/janela de 90 dias um dia antes do real. Aceitamos no
  // máximo 1 dia de desvio do relógio do servidor (faixa de fusos reais).
  const body = await req.json().catch(() => ({}));
  const today = resolveToday(body?.clientToday);
  const outcomes = runCosB2F1Rules(facts, today);

  const resultRows = outcomes.map((outcome) => ({
    case_id: id,
    rule_code: outcome.ruleCode,
    outcome: outcome.status,
    citation: citationFor(outcome),
  }));

  const { error: insertError } = await supabaseAdmin
    .from("case_rule_results")
    .insert(resultRows);

  if (insertError) {
    console.error("case_rule_results insert error:", insertError);
    return NextResponse.json(
      { error: "Falha ao registrar os resultados da validação." },
      { status: 500 },
    );
  }

  const caseStatus = deriveCaseStatus(outcomes, kase.dos_90_day_acknowledged_at);

  const { error: updateError } = await supabaseAdmin
    .from("cos_b2_f1_cases")
    .update({ status: caseStatus, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    console.error("cos_b2_f1_cases status update error:", updateError);
    return NextResponse.json(
      { error: "Falha ao atualizar o status do caso." },
      { status: 500 },
    );
  }

  return NextResponse.json({ outcomes, caseStatus });
}
