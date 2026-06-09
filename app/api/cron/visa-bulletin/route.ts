/**
 * GET /api/cron/visa-bulletin
 *
 * Monthly cron job — 10th of every month at 10:00 UTC.
 * Fetches the latest Visa Bulletin from travel.state.gov (NVC/Dept. of State),
 * parses it, and upserts into Supabase.
 *
 * Protected by CRON_SECRET.
 * Source: travel.state.gov only — no forums, no Reddit, no unofficial sites.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchLatestBulletin } from "@/lib/visa-bulletin";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bulletin = await fetchLatestBulletin();

    // Check if we already have this month's bulletin
    const { data: existing } = await supabaseAdmin
      .from("visa_bulletin")
      .select("id, bulletin_month")
      .eq("bulletin_month", bulletin.bulletinMonth)
      .single();

    if (existing) {
      return NextResponse.json({
        status: "already_current",
        bulletinMonth: bulletin.bulletinMonth,
        message: "Boletim deste mês já está salvo.",
      });
    }

    // Save to Supabase
    const { error } = await supabaseAdmin
      .from("visa_bulletin")
      .upsert({
        bulletin_month:    bulletin.bulletinMonth,
        bulletin_url:      bulletin.bulletinUrl,
        published_at:      bulletin.publishedAt,
        family_dates:      bulletin.familyDates,
        employment_dates:  bulletin.employmentDates,
        raw_text:          bulletin.rawText,
        fetched_at:        new Date().toISOString(),
      }, { onConflict: "bulletin_month" });

    if (error) {
      throw new Error("Supabase upsert error: " + error.message);
    }

    console.log(`[visa-bulletin] Saved bulletin ${bulletin.bulletinMonth}`);

    return NextResponse.json({
      status:        "updated",
      bulletinMonth: bulletin.bulletinMonth,
      bulletinUrl:   bulletin.bulletinUrl,
      publishedAt:   bulletin.publishedAt,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[visa-bulletin] Error:", message);
    return NextResponse.json({ status: "error", error: message }, { status: 500 });
  }
}
