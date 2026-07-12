-- Document vault: files the user attaches to checklist items in the kits.
-- Uploads/downloads go only through API routes (service role); the bucket
-- is private and files are served via short-lived signed URLs.
create table if not exists user_documents (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null references profiles(clerk_user_id) on delete cascade,
  visto_id      text not null,
  documento_id  text not null,
  file_name     text not null,
  storage_path  text not null unique,
  mime_type     text not null,
  size_bytes    bigint not null,
  created_at    timestamptz default now()
);

create index if not exists user_documents_user_visto_idx
  on user_documents (user_id, visto_id);

alter table user_documents enable row level security;

drop policy if exists "Users can read own documents" on user_documents;
create policy "Users can read own documents"
  on user_documents for select
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Private bucket for the files (no-op if it already exists).
insert into storage.buckets (id, name, public)
  values ('user-documents', 'user-documents', false)
  on conflict (id) do nothing;
