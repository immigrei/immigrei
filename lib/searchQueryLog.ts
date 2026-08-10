import { createServiceClient } from "@/lib/supabase";

// Logs a search query that neither the catalog nor the FAQ bank matched
// confidently (see SearchWithAnswer.weakMatch in lib/searchIndex.ts) —
// the signal for content gaps: what people search for that we don't have
// a guia/kit/FAQ for yet. Never awaited by the request path and never
// throws — a logging failure must not affect what the user sees.
export function logWeakSearchQuery(params: {
  userId: string;
  query: string;
  resultsCount: number;
  hadFaqAnswer: boolean;
}): void {
  const supabaseAdmin = createServiceClient();
  supabaseAdmin
    .from("search_query_log")
    .insert({
      user_id: params.userId,
      query: params.query,
      results_count: params.resultsCount,
      had_faq_answer: params.hadFaqAnswer,
    })
    .then(({ error }) => {
      if (error) console.warn("Failed to log weak search query:", error.message);
    });
}
