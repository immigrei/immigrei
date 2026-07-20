-- F-1 program start date, filled by the user (from the I-20). Powers the
-- OPT eligibility countdown (one full academic year of full-time enrollment
-- required before post-completion OPT — 8 CFR 214.2(f)(10)).
alter table profiles
  add column if not exists f1_program_start_date date;
