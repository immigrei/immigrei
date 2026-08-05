-- Cost calculator (/documentos/custos): remembers which official fees the
-- user has toggled on/off, any manual extra costs they added (translation,
-- lawyer, etc.), and their preferred USD/BRL exchange rate — so it's the
-- same every time they open the app, not recomputed from scratch.
create table if not exists user_cost_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      text not null references profiles(clerk_user_id) on delete cascade,
  -- Item do catálogo (data.ts, campo taxaUsd) quando é uma taxa oficial
  -- reconhecida; null para custos extras adicionados manualmente.
  item_id      text,
  -- Só preenchido em custos manuais (tradução, advogado etc.) — itens do
  -- catálogo resolvem o nome no cliente a partir do checklist.
  titulo       text,
  valor_usd    numeric not null,
  selecionado  boolean not null default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  constraint user_cost_items_origin_check check (
    (item_id is not null and titulo is null)
    or
    (item_id is null and titulo is not null)
  )
);

create unique index if not exists user_cost_items_user_item_idx
  on user_cost_items (user_id, item_id)
  where item_id is not null;

alter table user_cost_items enable row level security;

drop policy if exists "Users can read own cost items" on user_cost_items;
create policy "Users can read own cost items"
  on user_cost_items for select
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create table if not exists user_cost_settings (
  user_id     text primary key references profiles(clerk_user_id) on delete cascade,
  cambio_brl  numeric not null default 5.60,
  updated_at  timestamptz default now()
);

alter table user_cost_settings enable row level security;

drop policy if exists "Users can read own cost settings" on user_cost_settings;
create policy "Users can read own cost settings"
  on user_cost_settings for select
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
