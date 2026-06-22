alter table profiles
  add column if not exists location text check (location in ('brasil', 'eua'));
