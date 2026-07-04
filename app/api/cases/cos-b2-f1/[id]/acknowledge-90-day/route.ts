/**
 * POST /api/cases/cos-b2-f1/[id]/acknowledge-90-day
 *
 * Registra a ciência do usuário sobre 9 FAM 302.9-4(B)(3)(g) (RFC-001 §3.3,
 * disclosure_ack_required). dos_90_day_acknowledged_at é imutável uma vez
 * definido — protegido tanto aqui (guard antes do write) quanto pelo
 * trigger protect_90_day_ack() no banco (migration 010).
 *
 * Requires authenticated Clerk session; o usuário só pode reconhecer no
 * próprio caso.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const ALREADY_ACKNOWLEDGED_ERROR = {
  error: "A ciência da regra dos 90 dias já foi registrada e não pode ser alterada.",
};

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
    .select("id, user_id, dos_90_day_acknowledged_at")
    .eq("id", id)
    .single();

  // supabaseAdmin ignora RLS: confirmamos a posse do caso aqui. Caso não
  // encontrado ou pertencente a outro usuário => 404 (nunca 403).
  if (fetchError || !kase || kase.user_id !== userId) {
    return NextResponse.json({ error: "Caso não encontrado." }, { status: 404 });
  }

  if (kase.dos_90_day_acknowledged_at !== null) {
    return NextResponse.json(ALREADY_ACKNOWLEDGED_ERROR, { status: 409 });
  }

  // .is(...) fecha a corrida com outra requisição concorrente: só o write
  // cuja leitura ainda encontrar null é aplicado. O trigger protect_90_day_ack()
  // no banco é a segunda camada de proteção — se disparar mesmo assim,
  // a mensagem contém "immutable" e tratamos como 409; qualquer outro erro
  // de banco é uma falha real (500), não uma tentativa de reescrita.
  const { data: updatedRows, error: updateError } = await supabaseAdmin
    .from("cos_b2_f1_cases")
    .update({ dos_90_day_acknowledged_at: new Date().toISOString() })
    .eq("id", id)
    .is("dos_90_day_acknowledged_at", null)
    .select("dos_90_day_acknowledged_at");

  if (updateError) {
    if (updateError.message?.includes("immutable")) {
      return NextResponse.json(ALREADY_ACKNOWLEDGED_ERROR, { status: 409 });
    }
    console.error("dos_90_day_acknowledged_at update error:", updateError);
    return NextResponse.json(
      { error: "Falha ao registrar a ciência da regra dos 90 dias." },
      { status: 500 },
    );
  }

  if (!updatedRows || updatedRows.length === 0) {
    return NextResponse.json(ALREADY_ACKNOWLEDGED_ERROR, { status: 409 });
  }

  return NextResponse.json({ acknowledgedAt: updatedRows[0].dos_90_day_acknowledged_at });
}
