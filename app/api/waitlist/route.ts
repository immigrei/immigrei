import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { sendWaitlistWelcome } from "@/lib/notifications";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const EmailSchema = z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

export async function POST(req: Request) {
  const allowed = await checkRateLimit(`waitlist:${clientIp(req)}`, { max: 5, windowMs: 10 * 60_000 });
  if (!allowed) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  let email: unknown;
  let momento: unknown;
  try {
    ({ email, momento } = await req.json());
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const parsedEmail = EmailSchema.safeParse(email);
  if (!parsedEmail.success) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  const MOMENTOS = ["turista", "estudante", "trabalho", "green_card", "no_brasil", "outro"];
  const momentoValue =
    typeof momento === "string" && MOMENTOS.includes(momento) ? momento : null;

  const normalized = parsedEmail.data.toLowerCase().trim();

  const { data: existing } = await supabaseAdmin
    .from("waitlist")
    .select("id")
    .eq("email", normalized)
    .maybeSingle();

  let { error } = await supabaseAdmin
    .from("waitlist")
    .upsert(
      momentoValue ? { email: normalized, momento: momentoValue } : { email: normalized },
      { onConflict: "email" },
    );

  // PGRST204/42703 = momento column not migrated yet — retry without it so
  // the signup itself never depends on migration 009.
  if ((error?.code === "PGRST204" || error?.code === "42703") && momentoValue) {
    ({ error } = await supabaseAdmin
      .from("waitlist")
      .upsert({ email: normalized }, { onConflict: "email" }));
  }

  if (error) {
    console.error("waitlist insert failed:", error.message);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }

  // Welcome email only on first signup; a failure here shouldn't fail the
  // signup itself.
  if (!existing) {
    try {
      await sendWaitlistWelcome(normalized);
    } catch (err) {
      console.error("waitlist welcome email failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
