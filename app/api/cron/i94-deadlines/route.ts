/**
 * GET /api/cron/i94-deadlines
 *
 * Daily cron job. Scans every profile with a manually-entered
 * i94_expiry_date and emails the user when the deadline hits one of a
 * fixed set of milestones (days left). Milestones — not "days left <= N"
 * — so each user gets exactly one email per threshold instead of one
 * every day for the rest of their stay.
 *
 * Protected by CRON_SECRET header (set in Vercel env vars).
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { daysUntilI94Expiry } from "@/lib/i94";
import { sendI94DeadlineAlert, sendI94ReminderToFillIn } from "@/lib/notifications";
import { clerkClient } from "@clerk/nextjs/server";
import { notifySlackAlert } from "@/lib/slack-alert";

export const maxDuration = 300;

// Alert once at each of these — the day after expiry ("-1") is a single
// "you're overdue" notice, not a repeated daily nag.
const MILESTONES = new Set([30, 14, 7, 3, 1, 0, -1]);

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();
  const today = new Date();
  let scanned = 0, sent = 0, errors = 0;
  let supabaseError: string | null = null;

  let from = 0;
  const PAGE = 100;

  while (true) {
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("clerk_user_id, full_name, i94_expiry_date")
      .not("i94_expiry_date", "is", null)
      .range(from, from + PAGE - 1);

    if (error) {
      console.error("[i94-deadlines] Supabase error:", error.message);
      supabaseError = error.message;
      break;
    }
    if (!profiles || profiles.length === 0) break;

    for (const p of profiles) {
      scanned++;
      try {
        const daysLeft = daysUntilI94Expiry(p.i94_expiry_date as string, today);
        if (!MILESTONES.has(daysLeft)) continue;

        const clerk = await clerkClient();
        const user  = await clerk.users.getUser(p.clerk_user_id);
        const email = user.emailAddresses?.[0]?.emailAddress;
        if (!email) continue;

        await sendI94DeadlineAlert({
          to:            email,
          userName:      p.full_name ?? user.firstName ?? "",
          daysLeft,
          i94ExpiryDate: p.i94_expiry_date as string,
        });
        sent++;
      } catch (err) {
        errors++;
        console.error(`[i94-deadlines] Error for user ${p.clerk_user_id}:`, err);
      }
    }

    if (profiles.length < PAGE) break;
    from += PAGE;
  }

  // Second pass: nudge profiles that never filled in the I-94 date at all —
  // one-time only (i94_reminder_sent_at gates it), so this never becomes a
  // recurring nag. Separate from the milestone loop above because it scans
  // the opposite condition (date IS null) and writes back a marker instead
  // of just reading.
  //
  // Gated by onboarding_completed + account age so this doesn't reach
  // someone who just signed up and hasn't even chosen a visa type yet —
  // same 7-day early-stage window as flow 02's activation nudge (see
  // content/marketing/email-flows/02-activation-nudge.md and
  // 11-prazo-i94.md, adjusted from 3 to 7 days on 2026-08-07).
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  let remindScanned = 0, remindSent = 0, remindErrors = 0;
  from = 0;
  while (true) {
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("clerk_user_id, full_name")
      .is("i94_expiry_date", null)
      .is("i94_reminder_sent_at", null)
      .eq("onboarding_completed", true)
      .lte("created_at", sevenDaysAgo)
      .range(from, from + PAGE - 1);

    if (error) {
      console.error("[i94-deadlines] Supabase error (reminder pass):", error.message);
      supabaseError = supabaseError ?? error.message;
      break;
    }
    if (!profiles || profiles.length === 0) break;

    for (const p of profiles) {
      remindScanned++;
      try {
        const clerk = await clerkClient();
        const user  = await clerk.users.getUser(p.clerk_user_id);
        const email = user.emailAddresses?.[0]?.emailAddress;
        if (!email) continue;

        await sendI94ReminderToFillIn({
          to:       email,
          userName: p.full_name ?? user.firstName ?? "",
        });
        await supabaseAdmin
          .from("profiles")
          .update({ i94_reminder_sent_at: new Date().toISOString() })
          .eq("clerk_user_id", p.clerk_user_id);
        remindSent++;
      } catch (err) {
        remindErrors++;
        console.error(`[i94-deadlines] Reminder error for user ${p.clerk_user_id}:`, err);
      }
    }

    if (profiles.length < PAGE) break;
    from += PAGE;
  }

  const summary = {
    startedAt,
    finishedAt: new Date().toISOString(),
    scanned, sent, errors,
    remindScanned, remindSent, remindErrors,
  };
  console.log("[i94-deadlines] Completed:", summary);
  if (supabaseError) {
    await notifySlackAlert(`🔴 [i94-deadlines] Erro no Supabase, cron pode ter parado cedo: ${supabaseError}`);
  } else if (errors + remindErrors > 0) {
    await notifySlackAlert(`⚠️ [i94-deadlines] Rodou com ${errors + remindErrors} erro(s) — ver logs da Vercel. Resumo: ${JSON.stringify(summary)}`);
  }
  return NextResponse.json(summary);
}
