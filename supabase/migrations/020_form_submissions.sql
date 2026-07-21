-- Form-filler drafts: the PT-BR answers a user gives while filling an official
-- form (I-765, and future forms). One resumable draft per (user, form) for the
-- MVP. Answers are stored as JSONB so the schema of each form lives in code
-- (lib/forms/*), not in columns. The generated PDF lands in the document vault
-- (user_documents) — this table only holds the answers behind it.
create table if not exists form_submissions (
  id           uuid primary key default gen_random_uuid(),
  user_id      text not null references profiles(clerk_user_id) on delete cascade,
  form_id      text not null,
  visto_id     text not null,
  answers      jsonb not null default '{}'::jsonb,
  status       text not null default 'draft' check (status in ('draft', 'exported')),
  exported_at  timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (user_id, form_id)
);

create index if not exists form_submissions_user_idx
  on form_submissions (user_id, form_id);

alter table form_submissions enable row level security;

drop policy if exists "Users can read own form submissions" on form_submissions;
create policy "Users can read own form submissions"
  on form_submissions for select
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
