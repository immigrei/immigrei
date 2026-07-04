-- 010 — Pathway âncora do MVP: Change of Status B1/B2 -> F-1 (Form I-539 + I-20)
-- Arquitetura "grounded": cada coluna/constraint de validação cita a fonte
-- oficial (8 CFR, 9 FAM, INA, USCIS) via COMMENT ON. Ver docs/rfc-001.
--
-- Design: esta tabela guarda FATOS declarados/documentais. Vereditos de regra
-- ficam em case_rule_results (append-only), gerados por validate_cos_b2_f1(),
-- porque regras dependentes de current_date (I-94 vigente, 90 dias) precisam
-- ser reavaliáveis ao longo do tempo — um CHECK só roda no write.

-- ─── compliance_rules: catálogo das normas oficiais ─────────────────────────
create table if not exists compliance_rules (
  code           text primary key,
  citation       text not null,
  official_text  text not null,
  source_url     text not null,
  severity       text not null check (severity in ('hard_block', 'disclosure')),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

comment on table compliance_rules is
  'Catálogo de regras federais que o compilador valida. official_text é o trecho VERBATIM da norma — a UI exibe a norma, nunca uma paráfrase aplicada ao caso do usuário (blindagem UPL).';
comment on column compliance_rules.severity is
  'hard_block = impossibilidade técnica de compilar protocolo válido; disclosure = fato oficial relevante que não impede o protocolo (exige ciência do usuário). O app nunca emite recomendação.';

insert into compliance_rules (code, citation, official_text, source_url, severity) values
  ('I94_EXPIRED', '8 CFR § 248.1(b)',
   'Except in the case of an alien applying to obtain V nonimmigrant status, a change of status may not be approved for an alien who failed to maintain the previously accorded status or where such status expired before the application or petition was filed.',
   'https://www.ecfr.gov/current/title-8/section-248.1', 'hard_block'),
  ('DOS_90_DAY_WINDOW', '9 FAM 302.9-4(B)(3)(g)',
   'If an alien violates or engages in conduct inconsistent with his or her nonimmigrant status within 90 days of entry, you may presume that the applicant''s representations about engaging in only status-compliant activity were willful misrepresentations of his or her intention in seeking a visa or entry.',
   'https://fam.state.gov/FAM/09FAM/09FAM030209.html', 'disclosure'),
  ('I20_MISSING', '8 CFR § 214.2(f)(1)(i)(A)',
   'A nonimmigrant student must present a SEVIS Form I-20 issued in his or her own name by a school approved by the Service for attendance by foreign students.',
   'https://www.ecfr.gov/current/title-8/section-214.2', 'hard_block'),
  ('SEVIS_FEE_UNPAID', '8 CFR § 214.13(a)(4)',
   'An alien seeking a change of status to F-1, F-3, M-1, or M-3 must pay the SEVIS fee to SEVP, unless exempt.',
   'https://www.ecfr.gov/current/title-8/section-214.13', 'hard_block'),
  ('B2_STUDY_STARTED', '8 CFR § 214.2(b)(7)',
   'An alien who is admitted as, or changes status to, a B-1 or B-2 nonimmigrant on or after April 12, 2002, or who files a request to extend the period of authorized stay in B-1 or B-2 nonimmigrant status on or after such date, violates the conditions of his or her B-1 or B-2 status if the alien enrolls in a course of study.',
   'https://www.ecfr.gov/current/title-8/section-214.2', 'hard_block'),
  ('UNAUTHORIZED_WORK', '8 CFR § 214.1(e); INA § 248(a)(1)',
   'A nonimmigrant in the United States in a class defined in section 101(a)(15)(B) of the Act as a temporary visitor for pleasure, or section 101(a)(15)(C) of the Act as an alien in transit through this country, may not engage in any employment.',
   'https://www.ecfr.gov/current/title-8/section-214.1', 'hard_block')
on conflict (code) do nothing;

-- ─── cos_b2_f1_cases: fatos do caso ──────────────────────────────────────────
create table if not exists cos_b2_f1_cases (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  text not null references profiles(clerk_user_id) on delete cascade,

  -- Registro de entrada (CBP)
  i94_number               text
    constraint i94_number_format check (i94_number is null or i94_number ~ '^[0-9A-Za-z]{11}$'),
  last_entry_date          date,
  i94_admit_until          date,
  current_status           text not null default 'B2'
    constraint current_status_b_only check (current_status in ('B1', 'B2')),

  -- Escola / SEVP
  sevis_id                 text
    constraint sevis_id_format check (sevis_id is null or sevis_id ~ '^N[0-9]{10}$'),
  i20_program_start_date   date,
  i901_fee_paid            boolean not null default false,

  -- Declarações do usuário (autorrelato; o app não investiga nem julga)
  enrolled_before_approval boolean,
  worked_without_authorization boolean,

  -- Ciência da disclosure dos 90 dias (imutável após set; ver trigger)
  dos_90_day_acknowledged_at timestamptz,

  status                   text not null default 'draft'
    check (status in ('draft', 'validated', 'blocked', 'compiled')),
  created_at               timestamptz default now(),
  updated_at               timestamptz default now(),
  unique (user_id, sevis_id)
);

comment on table cos_b2_f1_cases is
  'Fatos declarados/documentais do pathway B1/B2 -> F-1 via Form I-539. Guarda apenas fatos; vereditos vivem em case_rule_results. O usuário escolhe o pathway sozinho — o app não sugere caminhos (blindagem UPL / automação ministerial).';

comment on column cos_b2_f1_cases.i94_number is
  'Número do Arrival/Departure Record I-94 (11 caracteres alfanuméricos), emitido pelo CBP na admissão. Fonte: CBP, i94.cbp.dhs.gov ("Get Most Recent I-94").';
comment on column cos_b2_f1_cases.last_entry_date is
  'Data da última admissão nos EUA registrada no I-94 (CBP). Base de cálculo da janela de 90 dias do DOS — 9 FAM 302.9-4(B)(3)(g): presunção de willful misrepresentation por conduta inconsistente com o status nos primeiros 90 dias após a entrada.';
comment on column cos_b2_f1_cases.i94_admit_until is
  'Data "Admit Until" do I-94 = fim do Authorized Period of Stay definido pelo CBP. O I-539 de mudança de status deve ser protocolado antes desta data: 8 CFR § 248.1(b) (status expirado antes do filing impede aprovação) e 8 CFR § 214.1(c)(4). Regra reavaliada no tempo por validate_cos_b2_f1(), não por CHECK.';
comment on constraint current_status_b_only on cos_b2_f1_cases is
  'Este pathway cobre exclusivamente B1/B2 -> F-1. Outros status de origem têm regras distintas de elegibilidade sob INA § 248 e ficam fora do MVP (RFC-001, Entregável 1).';
comment on column cos_b2_f1_cases.sevis_id is
  'SEVIS ID do Form I-20 (formato N + 10 dígitos), emitido por escola certificada pelo SEVP/ICE. Exigência: 8 CFR § 214.2(f)(1)(i)(A). Verificação de escolas: ICE SEVP School Search (studyinthestates.dhs.gov).';
comment on constraint sevis_id_format on cos_b2_f1_cases is
  'Formato oficial do SEVIS ID (N + 10 dígitos) conforme SEVP/ICE (Study in the States, "What is a SEVIS ID?").';
comment on column cos_b2_f1_cases.i20_program_start_date is
  'Data de início do programa no Form I-20. Desde a atualização de política do USCIS de 23/abr/2021 (B -> F-1 COS), não são mais exigidos "bridge filings" até 30 dias do início do programa; a data permanece necessária para o preenchimento do I-539.';
comment on column cos_b2_f1_cases.i901_fee_paid is
  'Comprovante de pagamento da taxa SEVIS I-901 (fmjfee.com). Exigência para mudança de status para F-1: 8 CFR § 214.13(a)(4).';
comment on column cos_b2_f1_cases.enrolled_before_approval is
  'Autorrelato: matriculou-se/iniciou curso antes da aprovação da mudança de status. Matrícula em B1/B2 viola o status: 8 CFR § 214.2(b)(7). true => hard_block + encaminhamento a advogado parceiro.';
comment on column cos_b2_f1_cases.worked_without_authorization is
  'Autorrelato: exerceu trabalho sem autorização. B1/B2 não pode exercer emprego (8 CFR § 214.1(e)); falha em manter status impede mudança de status (INA § 248(a)(1); 8 CFR § 248.1(b)). true => hard_block + encaminhamento a advogado parceiro. O app registra o fato declarado; não julga nem aconselha.';
comment on column cos_b2_f1_cases.dos_90_day_acknowledged_at is
  'Timestamp em que o usuário registrou ciência do texto verbatim de 9 FAM 302.9-4(B)(3)(g) exibido pela UI. A regra do DOS não proíbe o protocolo — por isso é disclosure, não bloqueio. O app exibe a norma e registra a decisão do usuário; não recomenda esperar nem prosseguir (isso seria UPL).';

-- ─── case_rule_results: vereditos append-only ────────────────────────────────
create table if not exists case_rule_results (
  id            uuid primary key default gen_random_uuid(),
  case_id       uuid not null references cos_b2_f1_cases(id) on delete cascade,
  rule_code     text not null references compliance_rules(code),
  outcome       text not null check (outcome in ('pass', 'hard_block', 'disclosure_ack_required')),
  citation      text not null,
  evaluated_at  timestamptz not null default now()
);

comment on table case_rule_results is
  'Trilha de auditoria de compliance: cada execução de validate_cos_b2_f1() grava o veredito de cada regra com a citação vigente no momento. Append-only; escrito apenas pelo service role. O usuário nunca edita um veredito.';

create index if not exists idx_case_rule_results_case on case_rule_results(case_id, evaluated_at desc);

-- ─── validate_cos_b2_f1: motor de regras temporais ───────────────────────────
create or replace function validate_cos_b2_f1(p_case_id uuid)
returns setof case_rule_results
language plpgsql
security definer
set search_path = public
as $$
declare
  c cos_b2_f1_cases%rowtype;
begin
  select * into c from cos_b2_f1_cases where id = p_case_id;
  if not found then
    raise exception 'case % not found', p_case_id;
  end if;

  -- 8 CFR § 248.1(b): I-94 precisa estar vigente na data do protocolo.
  return query insert into case_rule_results (case_id, rule_code, outcome, citation)
    values (p_case_id, 'I94_EXPIRED',
      case when c.i94_admit_until is not null and c.i94_admit_until >= current_date
           then 'pass' else 'hard_block' end,
      '8 CFR § 248.1(b)')
    returning *;

  -- 9 FAM 302.9-4(B)(3)(g): janela de 90 dias => disclosure, nunca bloqueio.
  return query insert into case_rule_results (case_id, rule_code, outcome, citation)
    values (p_case_id, 'DOS_90_DAY_WINDOW',
      case when c.last_entry_date is not null
                and current_date - c.last_entry_date >= 90
           then 'pass' else 'disclosure_ack_required' end,
      '9 FAM 302.9-4(B)(3)(g)')
    returning *;

  -- 8 CFR § 214.2(f)(1)(i)(A): Form I-20 / SEVIS ID de escola SEVP.
  return query insert into case_rule_results (case_id, rule_code, outcome, citation)
    values (p_case_id, 'I20_MISSING',
      case when c.sevis_id is not null then 'pass' else 'hard_block' end,
      '8 CFR § 214.2(f)(1)(i)(A)')
    returning *;

  -- 8 CFR § 214.13(a)(4): taxa SEVIS I-901 paga.
  return query insert into case_rule_results (case_id, rule_code, outcome, citation)
    values (p_case_id, 'SEVIS_FEE_UNPAID',
      case when c.i901_fee_paid then 'pass' else 'hard_block' end,
      '8 CFR § 214.13(a)(4)')
    returning *;

  -- 8 CFR § 214.2(b)(7): matrícula antes da aprovação viola o status B.
  return query insert into case_rule_results (case_id, rule_code, outcome, citation)
    values (p_case_id, 'B2_STUDY_STARTED',
      case when coalesce(c.enrolled_before_approval, false) then 'hard_block' else 'pass' end,
      '8 CFR § 214.2(b)(7)')
    returning *;

  -- 8 CFR § 214.1(e) / INA § 248(a)(1): trabalho não autorizado.
  return query insert into case_rule_results (case_id, rule_code, outcome, citation)
    values (p_case_id, 'UNAUTHORIZED_WORK',
      case when coalesce(c.worked_without_authorization, false) then 'hard_block' else 'pass' end,
      '8 CFR § 214.1(e); INA § 248(a)(1)')
    returning *;
end;
$$;

comment on function validate_cos_b2_f1(uuid) is
  'Motor ministerial: reavalia as regras temporais (I-94 vigente, janela de 90 dias) e documentais do pathway B1/B2 -> F-1, gravando vereditos auditáveis. Executado no submit e por cron (I-94 expira com o tempo). Nunca produz recomendação — apenas pass / hard_block / disclosure.';

-- ─── ciência dos 90 dias é imutável após registrada ─────────────────────────
create or replace function protect_90_day_ack()
returns trigger language plpgsql as $$
begin
  if old.dos_90_day_acknowledged_at is not null
     and new.dos_90_day_acknowledged_at is distinct from old.dos_90_day_acknowledged_at then
    raise exception 'dos_90_day_acknowledged_at is immutable once set';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_90_day_ack on cos_b2_f1_cases;
create trigger trg_protect_90_day_ack
  before update on cos_b2_f1_cases
  for each row execute function protect_90_day_ack();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table cos_b2_f1_cases  enable row level security;
alter table case_rule_results enable row level security;
alter table compliance_rules  enable row level security;

-- Usuário lê/edita apenas o próprio caso (padrão Clerk: claim sub do JWT).
drop policy if exists "Users can read own cos case" on cos_b2_f1_cases;
create policy "Users can read own cos case"
  on cos_b2_f1_cases for select
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

drop policy if exists "Users can insert own cos case" on cos_b2_f1_cases;
create policy "Users can insert own cos case"
  on cos_b2_f1_cases for insert
  with check (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

drop policy if exists "Users can update own cos case" on cos_b2_f1_cases;
create policy "Users can update own cos case"
  on cos_b2_f1_cases for update
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  with check (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

drop policy if exists "Users can delete own cos case" on cos_b2_f1_cases;
create policy "Users can delete own cos case"
  on cos_b2_f1_cases for delete
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Vereditos: usuário só lê os do próprio caso. Escrita fica com o service
-- role (que ignora RLS) via validate_cos_b2_f1 — nenhuma policy de
-- insert/update/delete para usuários, de propósito.
drop policy if exists "Users can read own rule results" on case_rule_results;
create policy "Users can read own rule results"
  on case_rule_results for select
  using (exists (
    select 1 from cos_b2_f1_cases c
    where c.id = case_rule_results.case_id
      and c.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Catálogo de normas é público-leitura (a UI exibe o texto oficial verbatim).
drop policy if exists "Anyone can read compliance rules" on compliance_rules;
create policy "Anyone can read compliance rules"
  on compliance_rules for select
  using (true);
