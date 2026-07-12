-- Closed community: free-form stories written by members. Reading requires a
-- signed-in user (RLS); publishing/reacting requires an active subscription
-- (checked in the API routes via lib/plan.ts). Every report is moderated
-- before it appears (status pending -> approved).

create table if not exists community_reports (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null references profiles(clerk_user_id) on delete cascade,
  title         text not null,
  body          text not null,
  is_anonymous  boolean not null default true,
  author_name   text,              -- captured at post time when not anonymous
  author_state  text not null,     -- always visible, even for anonymous posts
  status        text not null default 'pending'
                  check (status in ('pending', 'approved', 'rejected')),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists community_reports_status_idx
  on community_reports (status, created_at desc);

-- A report can reference several visas (ids from lib/vistosCatalog).
create table if not exists report_visas (
  report_id  uuid not null references community_reports(id) on delete cascade,
  visto_id   text not null,
  primary key (report_id, visto_id)
);

create index if not exists report_visas_visto_idx on report_visas (visto_id);

-- "Me ajudou" — one per user per report.
create table if not exists report_reactions (
  report_id   uuid not null references community_reports(id) on delete cascade,
  user_id     text not null references profiles(clerk_user_id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (report_id, user_id)
);

alter table community_reports enable row level security;
alter table report_visas      enable row level security;
alter table report_reactions  enable row level security;

-- Signed-in users read approved reports; authors always see their own.
drop policy if exists "Authenticated users read approved reports" on community_reports;
create policy "Authenticated users read approved reports"
  on community_reports for select
  using (
    status = 'approved'
    or user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

drop policy if exists "Authenticated users read report visas" on report_visas;
create policy "Authenticated users read report visas"
  on report_visas for select
  using (current_setting('request.jwt.claims', true)::json->>'sub' is not null);

drop policy if exists "Authenticated users read reactions" on report_reactions;
create policy "Authenticated users read reactions"
  on report_reactions for select
  using (current_setting('request.jwt.claims', true)::json->>'sub' is not null);

-- No insert/update policies on purpose: all writes go through API routes
-- (service role), where plan, contact-info filter and rate limit are enforced.
