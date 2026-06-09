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
import { fetchCaseStatus } from "@/lib/uscis";
import { sendCaseStatusUpdate } from "@/lib/notifications";
import { clerkClient } from "@clerk/nextjs/server";

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
      break;
    }
    if (!cases || cases.length === 0) break;

    for (const c of cases) {
      try {
        await sleep(DELAY_MS); // respect USCIS rate limits

        const result = await fetchCaseStatus(c.receipt_number);
        checked++;

        const statusChanged = result.status &&
          result.status !== c.last_status &&
          result.status !== "Verificação indisponível" &&
          result.status !== "Status não encontrado";

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

  const summary = {
    startedAt,
    finishedAt: new Date().toISOString(),
    checked,
    updated,
    errors,
  };

  console.log("[check-cases] Completed:", summary);
  return NextResponse.json(summary);
}
