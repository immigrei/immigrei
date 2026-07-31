-- Perfil: mora fora do Brasil? país/estado de residência separados de
-- birth_country/current_state; cidadania (relevante pra E-2, que exige país
-- de tratado); e quebra da pergunta L-1 em sim/não antes do tempo.
alter table profiles
  add column if not exists lives_outside_brazil boolean,
  add column if not exists residence_country     text,
  add column if not exists citizenship_country    text,
  add column if not exists l1_in_leadership_role  boolean,
  -- Estado de nascimento (BR) — dropdown fechado, diferente de current_state
  -- (onde mora hoje), que continua texto livre.
  add column if not exists birth_state           text;
