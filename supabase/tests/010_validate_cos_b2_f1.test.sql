-- supabase/tests/010_validate_cos_b2_f1.test.sql
--
-- Prova, num Postgres real e descartável, que
-- supabase/migrations/010_pathway_b2_f1_grounded.sql funciona: a função
-- validate_cos_b2_f1() produz os vereditos esperados e o trigger
-- protect_90_day_ack() bloqueia a segunda alteração de
-- dos_90_day_acknowledged_at. Ver docs/rfc-001-mvp-pathways-grounded-validation.md §3.4.
--
-- NUNCA rode isto contra o Supabase de produção — é feito para um Postgres
-- local descartável.
--
-- ─── Como rodar (Postgres 15 em Docker, descartável) ───────────────────────
--
--   docker run --rm -d --name immigrei-pg-test \
--     -e POSTGRES_PASSWORD=postgres -p 5433:5432 postgres:15
--
--   docker exec -i immigrei-pg-test psql -U postgres -v ON_ERROR_STOP=1 \
--     < supabase/schema.sql
--
--   docker exec -i immigrei-pg-test psql -U postgres -v ON_ERROR_STOP=1 \
--     < supabase/migrations/010_pathway_b2_f1_grounded.sql
--
--   docker exec -i immigrei-pg-test psql -U postgres -v ON_ERROR_STOP=1 \
--     < supabase/tests/010_validate_cos_b2_f1.test.sql
--
--   docker stop immigrei-pg-test   # --rm já remove o container ao parar
--
-- Saída esperada: uma linha "NOTICE:  PASS: ..." por asserção, sem nenhum
-- "ERROR:". O script roda inteiro dentro de uma transação com ROLLBACK no
-- final — não deixa dado nenhum no banco, mesmo se rodado várias vezes
-- seguidas contra o mesmo container.

\set ON_ERROR_STOP on

begin;

-- ─── helpers de asserção (escopo da sessão; somem no ROLLBACK) ─────────────
create or replace function pg_temp.assert_equals(actual text, expected text, description text)
returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception 'FAIL: % — esperado %, obtido %', description, expected, actual;
  end if;
  raise notice 'PASS: %', description;
end;
$$;

create or replace function pg_temp.assert_true(condition boolean, description text)
returns void language plpgsql as $$
begin
  if not condition then
    raise exception 'FAIL: %', description;
  end if;
  raise notice 'PASS: %', description;
end;
$$;

-- ─── fixture: profile dono dos casos de teste ──────────────────────────────
insert into profiles (clerk_user_id, full_name, email)
values ('test_user_010', 'Test User 010', 'test-010@example.com')
on conflict (clerk_user_id) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════
-- CASO (a) — I-94 vencido ontem, sem SEVIS ID, taxa I-901 não paga
-- Espera: hard_block em I94_EXPIRED, I20_MISSING e SEVIS_FEE_UNPAID.
-- last_entry_date fica bem no passado (200 dias) só para não poluir este
-- caso com a disclosure dos 90 dias, que não é o foco aqui.
-- ═══════════════════════════════════════════════════════════════════════════
insert into cos_b2_f1_cases (
  id, user_id, last_entry_date, i94_admit_until, sevis_id, i901_fee_paid
) values (
  'a0000000-0000-0000-0000-000000000001', 'test_user_010',
  current_date - 200,
  current_date - 1,
  null,
  false
);

create temporary table results_a as
select * from validate_cos_b2_f1('a0000000-0000-0000-0000-000000000001');

select pg_temp.assert_equals(
  (select outcome from results_a where rule_code = 'I94_EXPIRED'),
  'hard_block',
  'caso (a): I94_EXPIRED = hard_block (I-94 vencido ontem)'
);

select pg_temp.assert_equals(
  (select outcome from results_a where rule_code = 'I20_MISSING'),
  'hard_block',
  'caso (a): I20_MISSING = hard_block (sem SEVIS ID)'
);

select pg_temp.assert_equals(
  (select outcome from results_a where rule_code = 'SEVIS_FEE_UNPAID'),
  'hard_block',
  'caso (a): SEVIS_FEE_UNPAID = hard_block (taxa I-901 não paga)'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- CASO (b) — 100% conforme: I-94 futuro, entrada há mais de 90 dias, SEVIS
-- válido, taxa paga, sem violações declaradas.
-- Espera: as 6 regras retornam pass, E as 6 linhas 'pass' são persistidas
-- em case_rule_results sem violar a FK rule_code -> compliance_rules(code).
-- ═══════════════════════════════════════════════════════════════════════════
insert into cos_b2_f1_cases (
  id, user_id, last_entry_date, i94_admit_until, sevis_id, i901_fee_paid,
  enrolled_before_approval, worked_without_authorization
) values (
  'b0000000-0000-0000-0000-000000000002', 'test_user_010',
  current_date - 150,
  current_date + 60,
  'N0012345678',
  true,
  false,
  false
);

create temporary table results_b as
select * from validate_cos_b2_f1('b0000000-0000-0000-0000-000000000002');

select pg_temp.assert_true(
  (select count(*) from results_b) = 6,
  'caso (b): validate_cos_b2_f1 retornou exatamente 6 linhas'
);

select pg_temp.assert_true(
  (select count(*) from results_b where outcome <> 'pass') = 0,
  'caso (b): todas as 6 regras retornaram pass (caso 100% conforme)'
);

select pg_temp.assert_true(
  (select count(*) from case_rule_results
     where case_id = 'b0000000-0000-0000-0000-000000000002' and outcome = 'pass') = 6,
  'caso (b): as 6 linhas pass foram persistidas em case_rule_results — FK rule_code -> compliance_rules(code) aceita outcome=pass'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- CASO (c) — entrada há 30 dias (< 90).
-- Espera: DOS_90_DAY_WINDOW = disclosure_ack_required (nunca hard_block —
-- não existe regra que proíba o filing, só a exigência de ciência).
-- ═══════════════════════════════════════════════════════════════════════════
insert into cos_b2_f1_cases (
  id, user_id, last_entry_date, i94_admit_until, sevis_id, i901_fee_paid
) values (
  'c0000000-0000-0000-0000-000000000003', 'test_user_010',
  current_date - 30,
  current_date + 60,
  'N0099999999',
  true
);

create temporary table results_c as
select * from validate_cos_b2_f1('c0000000-0000-0000-0000-000000000003');

select pg_temp.assert_equals(
  (select outcome from results_c where rule_code = 'DOS_90_DAY_WINDOW'),
  'disclosure_ack_required',
  'caso (c): DOS_90_DAY_WINDOW = disclosure_ack_required (entrada há 30 dias)'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- CASO (d) — trigger protect_90_day_ack: dos_90_day_acknowledged_at é
-- imutável uma vez definido. Reaproveita o caso (c).
-- ═══════════════════════════════════════════════════════════════════════════
update cos_b2_f1_cases
set dos_90_day_acknowledged_at = now()
where id = 'c0000000-0000-0000-0000-000000000003';

select pg_temp.assert_true(
  (select dos_90_day_acknowledged_at from cos_b2_f1_cases
     where id = 'c0000000-0000-0000-0000-000000000003') is not null,
  'caso (d): primeira gravação de dos_90_day_acknowledged_at é permitida'
);

do $$
declare
  v_first_ack timestamptz;
begin
  select dos_90_day_acknowledged_at into v_first_ack
  from cos_b2_f1_cases where id = 'c0000000-0000-0000-0000-000000000003';

  begin
    update cos_b2_f1_cases
    set dos_90_day_acknowledged_at = v_first_ack + interval '1 hour'
    where id = 'c0000000-0000-0000-0000-000000000003';

    -- se o UPDATE acima não lançou erro, o trigger falhou em proteger o campo.
    raise exception 'trigger protect_90_day_ack não bloqueou a segunda alteração';
  exception
    when others then
      if sqlerrm like '%immutable%' then
        raise notice 'PASS: caso (d): trigger protect_90_day_ack bloqueou a segunda alteração (mensagem: %)', sqlerrm;
      else
        raise; -- erro inesperado (não é a exceção de imutabilidade) — deixa propagar como falha do script
      end if;
  end;
end;
$$;

rollback;
