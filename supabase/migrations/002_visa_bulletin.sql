-- Visa Bulletin snapshots
-- The monthly cron fetches the latest bulletin from travel.state.gov
-- and saves the parsed priority dates here.

create table if not exists public.visa_bulletin (
  id            uuid primary key default gen_random_uuid(),
  bulletin_month text not null,           -- e.g. "2025-07"
  bulletin_url  text,                     -- source URL
  published_at  date,                     -- official publish date

  -- Family-based priority dates (JSON: { "F1": { "brazil": "01JAN20", "all": "...", ... } })
  family_dates  jsonb default '{}',

  -- Employment-based priority dates (JSON: { "EB1": { "brazil": "C", ... } })
  employment_dates jsonb default '{}',

  -- Full raw text for fallback / display
  raw_text      text,

  fetched_at    timestamptz default now(),
  created_at    timestamptz default now(),

  constraint unique_bulletin_month unique (bulletin_month)
);

create index if not exists idx_visa_bulletin_month on public.visa_bulletin (bulletin_month desc);

-- Public read (no auth needed — this is public data)
alter table public.visa_bulletin enable row level security;
create policy "visa bulletin is public"
  on public.visa_bulletin for select using (true);

-- Only service role can insert/update (cron job)
