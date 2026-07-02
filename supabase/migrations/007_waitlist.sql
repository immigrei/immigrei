-- Waitlist signups from the pre-launch landing page (immigrei.com).
create table if not exists waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  created_at  timestamptz default now()
);

-- Service role only — no anon read/write.
alter table waitlist enable row level security;
