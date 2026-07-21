-- Backs lib/rate-limit.ts: a generic sliding-window rate limiter shared by
-- API routes (public and authenticated). Keyed by an arbitrary string
-- (route:userId or route:ip) — no Redis/Upstash needed, reuses the
-- supabaseAdmin connection every route already has.
create table if not exists rate_limit_hits (
  id         uuid primary key default gen_random_uuid(),
  rl_key     text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_key_idx
  on rate_limit_hits (rl_key, created_at);

alter table rate_limit_hits enable row level security;
-- No policies: only supabaseAdmin (service role, bypasses RLS) touches this
-- table — it's internal bookkeeping, never read/written from the client.
