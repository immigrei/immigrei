-- User immigration cases
-- Stores only the receipt number + last known status.
-- The weekly cron job updates last_status and notifies the user on change.

create table if not exists public.user_cases (
  id               uuid primary key default gen_random_uuid(),
  user_id          text not null,          -- Clerk user ID
  receipt_number   text not null,          -- e.g. IOE0123456789
  visa_type        text,                   -- e.g. H-1B, F-1 (display only)
  label            text,                   -- user-defined name, e.g. "Meu H-1B"
  last_status      text,                   -- last status text from USCIS
  last_status_date text,                   -- date string from USCIS response
  last_checked_at  timestamptz,            -- when we last queried USCIS
  check_error      text,                   -- last error message if query failed
  is_active        boolean default true,   -- false = user archived the case
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),

  constraint unique_user_receipt unique (user_id, receipt_number)
);

-- Index for weekly cron (loop all active cases)
create index if not exists idx_user_cases_active on public.user_cases (is_active, last_checked_at);
create index if not exists idx_user_cases_user   on public.user_cases (user_id);

-- Row Level Security
alter table public.user_cases enable row level security;

-- Users can only see their own cases
create policy "users can manage own cases"
  on public.user_cases
  for all
  using  (user_id = requesting_user_id())
  with check (user_id = requesting_user_id());

-- Service role bypasses RLS (used by cron job)
-- (service role key already bypasses RLS by default in Supabase)

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_user_cases_updated_at
  before update on public.user_cases
  for each row execute function public.set_updated_at();
