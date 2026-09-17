/**
 * GET /api/cron/check-cases
 *
 * Weekly cron job — every Monday at 08:00 UTC.
 * Loops through all active cases in Supabase, queries USCIS for each,
 * and sends an email notification if the status changed.
 *
 * Protected by CRON_SECRET header (set in Vercel env vars).
 * Only uscis.gov is consulted — no third-party sources.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchCaseStatus, isRealStatusChange } from "@/lib/uscis";
import { sendCaseStatusUpdate } from "@/lib/notifications";
import { clerkClient } from "@clerk/nextjs/server";
import { notifySlackAlert } from "@/lib/slack-alert";

// Allow long runs — with 1.5s per case the default timeout would cut the
// job after a handful of cases (300s = Vercel Hobby ceiling, ~180 cases)
export const maxDuration = 300;

// Delay between each USCIS request to avoid rate-limiting
const DELAY_MS = 1_500;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();
  let checked = 0, updated = 0, errors = 0;
  let supabaseError: string | null = null;

  // `errors` only ever counted thrown exceptions. A 404/429/503 from USCIS
  // comes back as a resolved CaseStatusResult carrying `error`, so a run where
  // every single case failed could still report `errors: 0`. Count those by
  // code — by type only, never by receipt number, so the summary carries no
  // user data.
  const errorsByType: Record<string, number> = {};

  // Fetch all active cases — paginate in batches of 100
  let from = 0;
  const PAGE = 100;

  while (true) {
    const { data: cases, error } = await supabaseAdmin
      .from("user_cases")
      .select("id, user_id, receipt_number, visa_type, label, last_status")
      .eq("is_active", true)
      .order("last_checked_at", { ascending: true, nullsFirst: true })
      .range(from, from + PAGE - 1);

    if (error) {
      console.error("[check-cases] Supabase error:", error.message);
      supabaseError = error.message;
      break;
    }
    if (!cases || cases.length === 0) break;

    for (const c of cases) {
      try {
        await sleep(DELAY_MS); // respect USCIS rate limits

        const result = await fetchCaseStatus(c.receipt_number);
        checked++;
        if (result.error) {
          errorsByType[result.error] = (errorsByType[result.error] ?? 0) + 1;
        }

        const statusChanged = isRealStatusChange(result, c.last_status);

        // Always update last_checked_at; update last_status only if it changed
        await supabaseAdmin
          .from("user_cases")
          .update({
            last_checked_at:  result.fetchedAt,
            check_error:      result.error ?? null,
            ...(statusChanged ? {
              last_status:      result.status,
              last_status_date: result.statusDate,
            } : {}),
          })
          .eq("id", c.id);

        if (statusChanged) {
          updated++;

          // Get user email from Clerk
          try {
            const clerk = await clerkClient();
            const user  = await clerk.users.getUser(c.user_id);
            const email = user.emailAddresses?.[0]?.emailAddress;
            const name  = user.firstName ?? "";

            if (email) {
              await sendCaseStatusUpdate({
                to:            email,
                userName:      name,
                receiptNumber: c.receipt_number,
                visaType:      c.visa_type ?? undefined,
                label:         c.label     ?? undefined,
                oldStatus:     c.last_status ?? "",
                newStatus:     result.status,
                statusDate:    result.statusDate,
                description:   result.description,
                isApproved:    result.isApproved,
                isDenied:      result.isDenied,
              });
            }
          } catch (notifErr) {
            console.error(`[check-cases] Notification error for user ${c.user_id}:`, notifErr);
          }
        }

      } catch (err) {
        errors++;
        console.error(`[check-cases] Error checking ${c.receipt_number}:`, err);
      }
    }

    if (cases.length < PAGE) break;
    from += PAGE;
  }

  const failed = Object.values(errorsByType).reduce((a, b) => a + b, 0);
  const summary = {
    startedAt,
    finishedAt: new Date().toISOString(),
    checked,
    updated,
    errors,        // cases that threw
    failed,        // cases USCIS answered with an error code
    errorsByType,
  };

  console.log("[check-cases] Completed:", summary);
  if (supabaseError) {
    await notifySlackAlert(`🔴 [check-cases] Erro no Supabase, cron pode ter parado cedo: ${supabaseError}`);
  } else if (errors > 0 || failed > 0) {
    await notifySlackAlert(`⚠️ [check-cases] Rodou com ${errors} exceção(ões) e ${failed} resposta(s) de erro do USCIS — ver logs da Vercel. Resumo: ${JSON.stringify(summary)}`);
  }
  return NextResponse.json(summary);
}
