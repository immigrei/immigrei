-- Perfil: sinais estruturados que podem virar gatilho de caminho de visto —
-- critérios de habilidade extraordinária (O-1A/EB-1A, 8 CFR §214.2(o)(3)),
-- investidor (E-2/EB-5) e transferência intracompanhia (L-1). Continua só
-- coleta por enquanto — não altera getStrategy() hoje.

-- english_test_name vira lista fechada (era texto livre) — os testes
-- realmente aceitos nos EUA, confirmados em fonte oficial (SEVP não regula
-- lista própria; aceitação é por escola, mas esses 4 são os mais comuns).
alter table profiles drop constraint if exists profiles_english_test_name_check;
alter table profiles add constraint profiles_english_test_name_check
  check (english_test_name in ('TOEFL', 'IELTS', 'Duolingo English Test', 'PTE Academic', 'Outro'));

alter table profiles
  -- Critérios de habilidade extraordinária — array de chaves marcadas,
  -- detalhamento continua no campo `achievements` já existente.
  add column if not exists o1_criteria               text[],
  -- Investidor (E-2/EB-5)
  add column if not exists investor_capital_available boolean,
  add column if not exists investor_capital_range     text check (investor_capital_range in ('menos_50k', '50k_100k', '100k_500k', '500k_mais')),
  add column if not exists business_owner_experience  boolean,
  -- Transferência intracompanhia (L-1)
  add column if not exists l1_us_br_operations         boolean,
  add column if not exists l1_leadership_years         text check (l1_leadership_years in ('menos_1', '1_3', '3_mais'));
