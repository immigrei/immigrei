/**
 * GET /api/escolas
 * Searches the SEVP-certified school directory (static data, no DB).
 * Query params: ?q=texto&state=FL&tipo=f|m&page=1
 */

import { NextRequest, NextResponse } from "next/server";
import { searchEscolas, statesWithCampuses } from "@/lib/escolas";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q     = searchParams.get("q") ?? undefined;
  const state = searchParams.get("state")?.toUpperCase() ?? undefined;
  const tipo  = searchParams.get("tipo");
  const page  = Math.max(1, Number(searchParams.get("page")) || 1);

  const result = searchEscolas({
    q,
    state,
    tipo: tipo === "f" || tipo === "m" ? tipo : undefined,
    page,
  });

  return NextResponse.json({
    ...result,
    states: statesWithCampuses(),
  });
}
