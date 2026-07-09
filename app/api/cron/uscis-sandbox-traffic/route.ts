/**
 * GET /api/cron/uscis-sandbox-traffic
 *
 * Weekday cron (15:30 UTC = dentro do horário do sandbox, M-F 7AM-8PM EST).
 * O USCIS exige, antes de liberar produção: "Minimum of 5 consecutive
 * calendar days of API traffic" com respostas 200 e 4xx exercitadas
 * (developer.uscis.gov, Case Status API). Este cron gera esse tráfego com
 * os staging receipts oficiais + um receipt inexistente (404).
 *
 * Só roda contra o sandbox (isUscisSandbox) — em produção vira no-op.
 * Protected by CRON_SECRET header (set in Vercel env vars).
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchCaseStatus, isUscisSandbox } from "@/lib/uscis";

// Staging receipts oficiais (spec do Case Status API em developer.uscis.gov)
const STAGING_RECEIPTS = [
  "EAC9999103403", // com hist_case_data
  "LIN9999106498", // com hist_case_data
  "SRC9999102777", // com hist_case_data
  "EAC9999103400", // sem hist_case_data
];

// Receipt bem-formado mas inexistente no sandbox — exercita o 404
const NOT_FOUND_RECEIPT = "IOE0000000001";

const DELAY_MS = 1_500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isUscisSandbox()) {
    return NextResponse.json({ skipped: "production base — no sandbox traffic needed" });
  }

  const results: { receipt: string; status: string; error?: string }[] = [];
  for (const receipt of [...STAGING_RECEIPTS, NOT_FOUND_RECEIPT]) {
    const r = await fetchCaseStatus(receipt);
    results.push({ receipt, status: r.status, error: r.error });
    await sleep(DELAY_MS);
  }

  return NextResponse.json({ ranAt: new Date().toISOString(), results });
}
