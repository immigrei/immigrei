import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getUserPlan } from "@/lib/plan";
import { searchCatalogs } from "@/lib/searchIndex";
import { embedQuery } from "@/lib/voyage";

// In-app search — vistos, kits de protocolo e caminhos (v1 scope). Results
// are hybrid-ranked (keyword + semantic) in lib/searchIndex.ts; this route
// only handles auth, rate limiting, input validation and wiring the plan +
// query embedding through.

const QuerySchema = z.object({ q: z.string().trim().min(1).max(80) });

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = await checkRateLimit(`search:${userId}`, { max: 60, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Muitas buscas seguidas. Tente novamente em instantes." },
      { status: 429 }
    );
  }

  const parsed = QuerySchema.safeParse({ q: req.nextUrl.searchParams.get("q") ?? "" });
  if (!parsed.success) return NextResponse.json({ results: [] });

  const [plan, queryEmbedding] = await Promise.all([
    getUserPlan(userId),
    embedQuery(parsed.data.q), // null if Voyage isn't configured or the call failed — searchCatalogs degrades to keyword-only
  ]);

  return NextResponse.json({ results: searchCatalogs(parsed.data.q, plan, queryEmbedding) });
}
