/**
 * GET /api/cron/community-review
 *
 * Twice a week — re-scans community reports approved (auto-published)
 * since the last run for contact-info leaks and UPL signals
 * (lib/community.ts). Anything that matches gets deleted outright — this
 * is the same filter that already blocks submission, run again over the
 * live text as a safety net, so a hit here is a false negative in the
 * submit-time filter, not a judgment call. The full text goes to Slack
 * before deletion so there's a record of what was removed and why.
 *
 * Protected by CRON_SECRET.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { findContactInfo, findUplSignals } from "@/lib/community";
import { notifySlackAlert } from "@/lib/slack-alert";

const LOOKBACK_DAYS = 5; // > the 3-4 day gap between twice-weekly runs, so a slow cron never skips a report

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: reports, error } = await supabaseAdmin
    .from("community_reports")
    .select("id, title, body")
    .eq("status", "approved")
    .gte("created_at", since);

  if (error) {
    console.error("[community-review] Failed to list reports:", error);
    await notifySlackAlert(`🔴 [community-review] Erro no Supabase: ${error.message}`);
    return NextResponse.json({ error: "Failed to list" }, { status: 500 });
  }

  const removed: { id: string; title: string; body: string; reason: string }[] = [];

  for (const r of reports ?? []) {
    const text = `${r.title}\n${r.body}`;
    const contact = findContactInfo(text);
    const upl = findUplSignals(text);
    if (!contact && upl.length === 0) continue;

    const reason = contact
      ? `contato (${contact})`
      : `sinal de aconselhamento jurídico personalizado`;
    removed.push({ id: r.id, title: r.title, body: r.body, reason });
  }

  for (const r of removed) {
    const { error: deleteError } = await supabaseAdmin
      .from("community_reports")
      .delete()
      .eq("id", r.id);
    if (deleteError) {
      console.error(`[community-review] Failed to delete report ${r.id}:`, deleteError);
    }
  }

  const summary = {
    finishedAt: new Date().toISOString(),
    scanned: reports?.length ?? 0,
    removed: removed.length,
  };

  console.log("[community-review] Completed:", summary);

  if (removed.length > 0) {
    const lines = removed
      .map((r) => `• "${r.title}" — ${r.reason} (id ${r.id})\n${r.body.slice(0, 300)}`)
      .join("\n\n");
    await notifySlackAlert(
      `🚩 [community-review] ${removed.length} relato(s) removido(s) automaticamente:\n\n${lines}`
    );
  }

  return NextResponse.json(summary);
}
