/**
 * GET /api/consulados/events
 * Returns upcoming consulate events from Supabase.
 * Query params: ?consulado=miami|nyc&tipo=itinerante
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const allowed = await checkRateLimit(`consulados-events:${clientIp(req)}`, { max: 30, windowMs: 60_000 });
  if (!allowed) return NextResponse.json({ error: "too many requests" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const consulado = searchParams.get("consulado");
  const tipo      = searchParams.get("tipo");

  let query = supabaseAdmin
    .from("consulate_events")
    .select("*")
    .gte("data_inicio", new Date().toISOString().split("T")[0])
    .order("data_inicio", { ascending: true })
    .limit(30);

  if (consulado) query = query.eq("consulado", consulado);
  if (tipo)      query = query.eq("tipo", tipo);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ events: data ?? [] });
}
