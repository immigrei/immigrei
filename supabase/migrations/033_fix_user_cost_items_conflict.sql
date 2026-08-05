-- 032's partial unique index (where item_id is not null) can't be used as
-- an ON CONFLICT target by PostgREST's upsert. A plain unique constraint on
-- (user_id, item_id) works instead — Postgres never treats two NULLs as
-- conflicting, so manual cost items (item_id null) are still unaffected.
drop index if exists user_cost_items_user_item_idx;

alter table user_cost_items
  add constraint user_cost_items_user_item_key unique (user_id, item_id);
