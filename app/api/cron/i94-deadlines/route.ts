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
import { sendI94DeadlineAlert } from "@/lib/notifications";
import { clerkClient } from "@clerk/nextjs/server";

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

  const summary = { startedAt, finishedAt: new Date().toISOString(), scanned, sent, errors };
  console.log("[i94-deadlines] Completed:", summary);
  return NextResponse.json(summary);
}
