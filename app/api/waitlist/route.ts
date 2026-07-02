import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendWaitlistWelcome } from "@/lib/notifications";

export async function POST(req: Request) {
  let email: unknown;
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  const normalized = email.toLowerCase().trim();

  const { data: existing } = await supabaseAdmin
    .from("waitlist")
    .select("id")
    .eq("email", normalized)
    .maybeSingle();

  const { error } = await supabaseAdmin
    .from("waitlist")
    .upsert({ email: normalized }, { onConflict: "email" });

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
