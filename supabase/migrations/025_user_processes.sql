-- Parallel immigration processes the user is tracking alongside their main
-- journey (profile.visa_type / getStrategy). A user can have more than one
-- process running at once — e.g. a B-1/B-2 extension while also filing
-- I-130/I-485 after marrying — and each can carry its own deadline, so the
-- Início/Painel summary can surface whichever date is soonest instead of
-- only the main journey's.
--
-- kit_id is optional: "consideracao" entries can exist before any formal
-- kit is chosen (e.g. "building an O-1 portfolio"), so this is intentionally
-- decoupled from documentos/[vistoId]'s catalog rather than requiring it.
create table if not exists user_processes (
  id             uuid primary key default gen_random_uuid(),
  user_id        text not null references profiles(clerk_user_id) on delete cascade,
  kit_id         text,
  label          text not null,
  status         text not null default 'ativo' check (status in ('ativo', 'consideracao')),
  deadline_date  date,
  deadline_label text,
  is_active      boolean not null default true,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- Confirming the same kit twice updates the existing row instead of
-- duplicating it (see POST /api/user-processes).
create unique index if not exists user_processes_user_kit_idx
  on user_processes (user_id, kit_id)
  where kit_id is not null and is_active;

create index if not exists user_processes_user_idx
  on user_processes (user_id, is_active);

alter table user_processes enable row level security;

drop policy if exists "Users can read own processes" on user_processes;
create policy "Users can read own processes"
  on user_processes for select
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
