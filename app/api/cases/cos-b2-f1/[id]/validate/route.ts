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

  const today = new Date();
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

  const caseStatus = deriveCaseStatus(outcomes);

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
