/**
 * POST /api/consulados/subscribe
 * Toggle subscription for consulate alerts.
 * Body: { consulados: ("miami" | "nyc")[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";

const ConsuladosSchema = z.array(z.enum(["miami", "nyc"]));

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ConsuladosSchema.safeParse(body.consulados);
  if (!parsed.success) {
    return NextResponse.json({ error: "consulados must be an array of \"miami\"|\"nyc\"" }, { status: 400 });
  }
  const consulados = parsed.data;

  const { error } = await supabaseAdmin
    .from("consulate_subscriptions")
    .upsert(
      { user_id: userId, consulados, active: consulados.length > 0, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, consulados });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabaseAdmin
    .from("consulate_subscriptions")
    .select("consulados, active")
    .eq("user_id", userId)
    .maybeSingle();

  return NextResponse.json({ consulados: data?.consulados ?? [], active: data?.active ?? false });
}
