-- Manual I-94 expiry date, filled by the user (found at i94.cbp.dhs.gov).
-- Powers real deadline countdowns for B-1/B-2 and other admit-until visa
-- types instead of generic "confira o prazo" advice.
alter table profiles
  add column if not exists i94_expiry_date date;
