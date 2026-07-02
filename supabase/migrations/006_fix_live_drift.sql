-- Fixes live-DB drift found 2026-07-02 after the project was unpaused:
--  1. Tables missing live: case_history, consulate_events, consulate_subscriptions.
--  2. RLS from schema.sql never applied — anon key could read all profiles.
--  3. Migration 004 `location` column never applied.
-- Fully idempotent: safe to re-run. Create tables FIRST so RLS statements can't fail.

-- ─── 1. Create missing tables (from schema.sql) ─────────────────────────────
create table if not exists case_history (
  id             uuid primary key default gen_random_uuid(),
  case_id        uuid not null references user_cases(id) on delete cascade,
  status         text not null,
  status_date    text,
  description    text,
  recorded_at    timestamptz default now()
);

create table if not exists consulate_events (
  id           uuid primary key default gen_random_uuid(),
  consulado    text not null check (consulado in ('miami','nyc')),
  titulo       text not null,
  descricao    text,
  data_inicio  date,
  data_fim     date,
  cidade       text,
  estado       text,
  servicos     text[] default '{}',
  url_fonte    text,
  tipo         text default 'outro' check (tipo in ('itinerante','aviso','horario','outro')),
  scraped_at   timestamptz default now(),
  created_at   timestamptz default now()
);

create table if not exists consulate_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null unique references profiles(clerk_user_id) on delete cascade,
  consulados  text[] default '{}',
  active      boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── 2. Missing columns (migration 004) ─────────────────────────────────────
alter table profiles
  add column if not exists location text check (location in ('brasil', 'eua'));

-- ─── 3. Enable RLS everywhere ───────────────────────────────────────────────
alter table profiles                enable row level security;
alter table user_cases              enable row level security;
alter table case_history            enable row level security;
alter table consulate_events        enable row level security;
alter table consulate_subscriptions enable row level security;

-- ─── 4. Policies (service role bypasses RLS; these govern the anon key) ─────
drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile"
  on profiles for select
  using (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

drop policy if exists "Users can read own cases" on user_cases;
create policy "Users can read own cases"
  on user_cases for select
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

drop policy if exists "Users can read own case history" on case_history;
create policy "Users can read own case history"
  on case_history for select
  using (case_id in (
    select id from user_cases
    where user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

drop policy if exists "Consulate events are public" on consulate_events;
create policy "Consulate events are public"
  on consulate_events for select using (true);

drop policy if exists "Users can read own consulate subscription" on consulate_subscriptions;
create policy "Users can read own consulate subscription"
  on consulate_subscriptions for select
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
