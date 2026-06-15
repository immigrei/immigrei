-- Immigrei — Supabase Schema
-- Run this in the Supabase SQL Editor (once)

-- ─── profiles ───────────────────────────────────────────────────────────────
create table if not exists profiles (
  id                   uuid primary key default gen_random_uuid(),
  clerk_user_id        text unique not null,
  full_name            text,
  email                text,
  avatar_url           text,
  visa_type            text,
  arrival_date         date,
  main_goal            text,
  nationality          text,
  onboarding_completed boolean default false,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ─── user_cases ─────────────────────────────────────────────────────────────
create table if not exists user_cases (
  id                uuid primary key default gen_random_uuid(),
  user_id           text not null references profiles(clerk_user_id) on delete cascade,
  receipt_number    text not null,
  visa_type         text,
  label             text,
  last_status       text,
  last_status_date  text,
  last_checked_at   timestamptz,
  check_error       text,
  is_active         boolean default true,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  unique(user_id, receipt_number)
);

-- ─── case_history ───────────────────────────────────────────────────────────
-- Stores every status change so we can show a timeline
create table if not exists case_history (
  id             uuid primary key default gen_random_uuid(),
  case_id        uuid not null references user_cases(id) on delete cascade,
  status         text not null,
  status_date    text,
  description    text,
  recorded_at    timestamptz default now()
);

-- ─── consulate_events ───────────────────────────────────────────────────────
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

-- ─── consulate_subscriptions ─────────────────────────────────────────────────
create table if not exists consulate_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null unique references profiles(clerk_user_id) on delete cascade,
  consulados  text[] default '{}',
  active      boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── RLS policies ───────────────────────────────────────────────────────────
alter table profiles   enable row level security;
alter table user_cases enable row level security;
alter table case_history enable row level security;

-- Service role bypasses RLS (used by our API routes) — no policy needed for it.
-- These policies cover direct client-side access if ever needed.

create policy "Users can read own profile"
  on profiles for select using (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users can read own cases"
  on user_cases for select using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users can read own case history"
  on case_history for select
  using (case_id in (
    select id from user_cases
    where user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));
