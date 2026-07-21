/**
 * POST /api/uscis/case-status
 *
 * Manual lookup — called when the user adds or refreshes a case.
 * Requires authenticated Clerk session.
 *
 * Body: { receiptNumber: string }
 * Returns: CaseStatusResult
 *
 * Data source: uscis.gov only.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { fetchCaseStatus, isValidReceiptNumber, normalizeReceiptNumber } from "@/lib/uscis";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

const CaseStatusBodySchema = z.object({
  receiptNumber: z.string(),
  visaType: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  // Auth check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const allowed = await checkRateLimit(`uscis-case-status:${userId}`, { max: 10, windowMs: 5 * 60_000 });
  if (!allowed) {
    return NextResponse.json({ error: "Muitas consultas seguidas. Tente novamente em instantes." }, { status: 429 });
  }

  const rawBody = await req.json().catch(() => ({}));
  const parsedBody = CaseStatusBodySchema.safeParse(rawBody);

  if (!parsedBody.success || !isValidReceiptNumber(parsedBody.data.receiptNumber)) {
    return NextResponse.json(
      { error: "Número de recibo inválido. Use o formato: IOE0123456789" },
      { status: 400 },
    );
  }

  const { receiptNumber: raw, visaType, label } = parsedBody.data;
  const receiptNumber = normalizeReceiptNumber(raw);

  // Fetch from USCIS
  const result = await fetchCaseStatus(receiptNumber);

  // Upsert into Supabase (create or update case record)
  if (!result.error || result.error === "invalid_format") {
    await supabaseAdmin
      .from("user_cases")
      .upsert(
        {
          user_id:          userId,
          receipt_number:   receiptNumber,
          visa_type:        visaType ?? null,
          label:            label ?? null,
          last_status:      result.status,
          last_status_date: result.statusDate,
          last_checked_at:  result.fetchedAt,
          check_error:      result.error ?? null,
          is_active:        true,
        },
        { onConflict: "user_id,receipt_number" },
      );
  }

  return NextResponse.json(result);
}

// GET /api/uscis/case-status — list all cases for the current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("user_cases")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ cases: data });
}
