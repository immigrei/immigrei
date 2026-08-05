-- Users can have more than one process running in parallel (e.g. F-1
-- extension + a family I-130 petition) — the cost calculator should total
-- official fees across every process they're tracking, not just one visto
-- at a time. Nullable array; null/empty means "not set yet, fall back to
-- the profile's visa_type" (see CustosClient.tsx).
alter table user_cost_settings
  add column if not exists vistos_ativos text[];
