-- Persisted checklist checkmarks: which kit items the user marked as done.
-- Feeds two surfaces: the kit page (checkmarks survive reload) and the
-- journey timeline on /painel (steps only turn green from real user input).
create table if not exists user_checklist_items (
  user_id       text not null references profiles(clerk_user_id) on delete cascade,
  visto_id      text not null,
  documento_id  text not null,
  checked_at    timestamptz default now(),
  primary key (user_id, visto_id, documento_id)
);

alter table user_checklist_items enable row level security;

drop policy if exists "Users can read own checklist items" on user_checklist_items;
create policy "Users can read own checklist items"
  on user_checklist_items for select
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
