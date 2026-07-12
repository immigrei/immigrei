-- Chosen SEVP school, picked on /escolas and shown on the /painel journey.
-- Snapshot of the campus data (name, city, state, campus_code) so the
-- journey keeps working even if the school leaves a future SEVP list.
alter table profiles
  add column if not exists chosen_school jsonb;
