-- 011 — Correções de grounding após auditoria contra as fontes oficiais
-- (2026-07-04, eCFR API + fam.state.gov). A migration 010 semeou 4 textos
-- desatualizados/truncados e 1 citação errada; esta migration corrige os
-- dados e a função. Achados:
--   1. 8 CFR 248.1(b): texto atual diz "whose status expired" (não "where
--      such"), inclui a referência a § 214.15(f) e a exceção discricionária
--      de late filing com 4 condições — que havíamos truncado.
--   2. 8 CFR 214.2(f)(1)(i)(A): redação atual usa "Form I-20 or successor
--      form ... school certified by the Student and Exchange Visitor
--      Program (SEVP)" (a antiga "SEVIS Form I-20 ... approved by the
--      Service" foi substituída).
--   3. Taxa SEVIS para mudança de status é 8 CFR 214.13(a)(3) — NÃO (a)(4),
--      que trata de mudança de categoria de J-1. Texto também corrigido
--      ("fee to DHS before the alien is granted the change").
--   4. Regra dos 90 dias: citação precisa é 9 FAM 302.9-4(B)(3)(g)(2);
--      texto vigente (rev. CT:VISA-2002, 05-31-2024) fala "individual",
--      "90 days of visa application or admission" e garante oportunidade
--      de refutação.

-- ─── correções no catálogo ───────────────────────────────────────────────────
update compliance_rules set
  official_text = 'Except in the case of an alien applying to obtain V nonimmigrant status in the United States under § 214.15(f) of this chapter, a change of status may not be approved for an alien who failed to maintain the previously accorded status or whose status expired before the application or petition was filed, except that failure to file before the period of previously authorized status expired may be excused in the discretion of USCIS, and without separate application, where it is demonstrated at the time of filing that: (1) The failure to file a timely application was due to extraordinary circumstances beyond the control of the applicant or petitioner, and USCIS finds the delay commensurate with the circumstances; (2) The alien has not otherwise violated his or her nonimmigrant status; (3) The alien remains a bona fide nonimmigrant; and (4) The alien is not the subject of removal proceedings under 8 CFR part 240.',
  updated_at = now()
where code = 'I94_EXPIRED';

update compliance_rules set
  citation = '9 FAM 302.9-4(B)(3)(g)(2)',
  official_text = 'If an individual engages in conduct inconsistent with their nonimmigrant status within 90 days of visa application or admission to the United States, as described in subparagraph (2)(b) below, you may presume that the applicant made a willful misrepresentation (i.e., you may presume that the applicant''s representations about engaging in only status-compliant activity were willful misrepresentations of their true intentions in seeking a visa or admission to the United States). You must provide the applicant with the opportunity to rebut the presumption of misrepresentation by verbally presenting the applicant with your factual findings as to why you believe they are ineligible 6C1.',
  updated_at = now()
where code = 'DOS_90_DAY_WINDOW';

update compliance_rules set
  official_text = 'A nonimmigrant student may be admitted into the United States in nonimmigrant status under section 101(a)(15)(F) of the Act, if: (A) The student presents a Form I-20 or successor form issued in the student''s name by a school certified by the Student and Exchange Visitor Program (SEVP) for attendance by F-1 foreign students.',
  updated_at = now()
where code = 'I20_MISSING';

update compliance_rules set
  citation = '8 CFR § 214.13(a)(3)',
  official_text = 'A nonimmigrant alien in the United States seeking a change of status to F-1, F-3, J-1, M-1, or M-3 must pay the fee to DHS before the alien is granted the change of nonimmigrant status, except as provided in paragraph (e)(4) of this section.',
  updated_at = now()
where code = 'SEVIS_FEE_UNPAID';

-- ─── função reescrita com as citações corrigidas ─────────────────────────────
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

  return query insert into case_rule_results (case_id, rule_code, outcome, citation)
    values (p_case_id, 'I94_EXPIRED',
      case when c.i94_admit_until is not null and c.i94_admit_until >= current_date
           then 'pass' else 'hard_block' end,
      '8 CFR § 248.1(b)')
    returning *;

  return query insert into case_rule_results (case_id, rule_code, outcome, citation)
    values (p_case_id, 'DOS_90_DAY_WINDOW',
      case when c.last_entry_date is not null
                and current_date - c.last_entry_date >= 90
           then 'pass' else 'disclosure_ack_required' end,
      '9 FAM 302.9-4(B)(3)(g)(2)')
    returning *;

  return query insert into case_rule_results (case_id, rule_code, outcome, citation)
    values (p_case_id, 'I20_MISSING',
      case when c.sevis_id is not null then 'pass' else 'hard_block' end,
      '8 CFR § 214.2(f)(1)(i)(A)')
    returning *;

  return query insert into case_rule_results (case_id, rule_code, outcome, citation)
    values (p_case_id, 'SEVIS_FEE_UNPAID',
      case when c.i901_fee_paid then 'pass' else 'hard_block' end,
      '8 CFR § 214.13(a)(3)')
    returning *;

  return query insert into case_rule_results (case_id, rule_code, outcome, citation)
    values (p_case_id, 'B2_STUDY_STARTED',
      case when coalesce(c.enrolled_before_approval, false) then 'hard_block' else 'pass' end,
      '8 CFR § 214.2(b)(7)')
    returning *;

  return query insert into case_rule_results (case_id, rule_code, outcome, citation)
    values (p_case_id, 'UNAUTHORIZED_WORK',
      case when coalesce(c.worked_without_authorization, false) then 'hard_block' else 'pass' end,
      '8 CFR § 214.1(e); INA § 248(a)(1)')
    returning *;
end;
$$;

-- ─── comentários corrigidos ──────────────────────────────────────────────────
comment on column cos_b2_f1_cases.i901_fee_paid is
  'Comprovante de pagamento da taxa SEVIS I-901 (fmjfee.com). Exigência para mudança de status para F-1: 8 CFR § 214.13(a)(3) (fee a DHS antes da concessão da mudança de status). Citação corrigida pela migration 011 — (a)(4) trata de mudança de categoria J-1.';
comment on column cos_b2_f1_cases.last_entry_date is
  'Data da última admissão nos EUA registrada no I-94 (CBP). Base de cálculo da janela de 90 dias do DOS — 9 FAM 302.9-4(B)(3)(g)(2) (rev. 05/2024): presunção refutável de willful misrepresentation por conduta inconsistente com o status nos 90 dias após pedido de visto ou admissão.';
comment on column cos_b2_f1_cases.dos_90_day_acknowledged_at is
  'Timestamp em que o usuário registrou ciência do texto verbatim de 9 FAM 302.9-4(B)(3)(g)(2) exibido pela UI. A regra do DOS não proíbe o protocolo — por isso é disclosure, não bloqueio. O app exibe a norma e registra a decisão do usuário; não recomenda esperar nem prosseguir (isso seria UPL).';
