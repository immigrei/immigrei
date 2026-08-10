-- Logs search queries that the in-app search (lupa) couldn't answer
-- confidently — no keyword hit and no catalog/FAQ entry cleared the
-- semantic threshold (see lib/searchIndex.ts). This is the signal for
-- content gaps: what people actually search for that we don't have a
-- guia/kit/FAQ for yet. Only weak-match queries are logged (not every
-- search) to keep the table meaningful and small.
CREATE TABLE IF NOT EXISTS search_query_log (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id text NOT NULL,
  query text NOT NULL,
  results_count integer NOT NULL,
  had_faq_answer boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_search_query_log_created_at ON search_query_log(created_at DESC);
CREATE INDEX idx_search_query_log_query ON search_query_log(query);

ALTER TABLE search_query_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access" ON search_query_log
  AS PERMISSIVE FOR ALL TO service_role
  USING (true) WITH CHECK (true);
