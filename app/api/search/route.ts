import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getUserPlan } from "@/lib/plan";
import { searchWithAnswer } from "@/lib/searchIndex";
import { embedQuery } from "@/lib/voyage";
import { logWeakSearchQuery } from "@/lib/searchQueryLog";

// In-app search — vistos, kits de protocolo e caminhos (v1 scope), plus a
// curated FAQ-bank answer (lib/faqBank.ts) when the query matches one.
// Results are hybrid-ranked (keyword + semantic) in lib/searchIndex.ts;
// this route only handles auth, rate limiting, input validation and wiring
// the plan + query embedding through.

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
  if (!parsed.success) return NextResponse.json({ answer: null, results: [] });

  const [plan, queryEmbedding] = await Promise.all([
    getUserPlan(userId),
    embedQuery(parsed.data.q), // null if Voyage isn't configured or the call failed — searchCatalogs degrades to keyword-only
  ]);

  const { weakMatch, ...body } = searchWithAnswer(parsed.data.q, plan, queryEmbedding);
  if (weakMatch) {
    // Fire-and-forget — a logging failure must never affect the search response.
    logWeakSearchQuery({ userId, query: parsed.data.q, resultsCount: body.results.length, hadFaqAnswer: body.answer !== null });
  }

  return NextResponse.json(body);
}
