-- Perfil: questionário de enriquecimento (Parte 1 — básico/carreira,
-- Parte 2 — perguntas abertas). Tudo opcional, nada bloqueia onboarding
-- nem gate de plano. Só coleta por enquanto — não altera getStrategy().
alter table profiles
  add column if not exists birth_date          date,
  add column if not exists birth_city          text,
  add column if not exists birth_country       text,
  add column if not exists current_city        text,
  add column if not exists current_state       text,
  add column if not exists gender              text,
  add column if not exists english_level       text check (english_level in ('basico', 'intermediario', 'avancado', 'fluente')),
  add column if not exists english_test_taken  boolean,
  add column if not exists english_test_name   text,
  add column if not exists english_test_score  text,
  add column if not exists education_level     text check (education_level in ('ensino_medio', 'graduacao_andamento', 'graduacao_completa', 'pos_graduacao', 'mestrado', 'doutorado')),
  add column if not exists profession          text,
  add column if not exists experience_years    text check (experience_years in ('0-2', '3-5', '6-10', '10+')),
  add column if not exists achievements        text,
  add column if not exists bio_situation       text,
  add column if not exists bio_concern         text,
  add column if not exists bio_tried           text;
