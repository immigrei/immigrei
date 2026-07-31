-- Cidadania principal (citizenship_country, já existente) fica ambígua sozinha
-- — pode dar a entender que é a única. Muitos brasileiros têm dupla cidadania
-- (ex: italiana, portuguesa), o que muda elegibilidade pra vistos de tratado
-- (E-1/E-2) mesmo o Brasil não sendo país de tratado.
alter table profiles
  add column if not exists has_other_citizenship boolean,
  add column if not exists other_citizenship_country text;
