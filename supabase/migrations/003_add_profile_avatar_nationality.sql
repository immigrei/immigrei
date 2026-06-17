-- Align the live `profiles` table with schema.sql.
-- The table was created before `avatar_url` and `nationality` were added to
-- the schema, so the live DB is missing them. ensureProfile() and the Clerk
-- webhook both write avatar_url, which failed with 42703 until this ran.
-- Idempotent — safe to run multiple times.

alter table profiles add column if not exists avatar_url  text;
alter table profiles add column if not exists nationality text;
