// lib/rules/cosB2F1.ts — motor de regras do pathway B1/B2 -> F-1 (RFC-001,
// Entregável 3). Regras puras, sem I/O — recebem fatos, devolvem um
// RuleOutcome fechado. Espelham as 6 regras de
// supabase/migrations/010_pathway_b2_f1_grounded.sql (compliance_rules /
// validate_cos_b2_f1). O motor nunca compara caminhos nem estima mérito;
// hard_block = "o compilador não produz este protocolo", nunca "seu caso é
// ruim".

const DAY = 86_400_000;

// Normaliza para data-calendário em UTC (zera horário), para paridade com
// validate_cos_b2_f1() no Postgres, que compara contra current_date — uma
// data pura, sem componente de horário/fuso.
function toUtcDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export type RuleOutcome =
  | { status: 'pass'; ruleCode: string }
  | {
      // Impossibilidade técnica objetiva: o compilador não consegue
      // produzir um protocolo válido segundo a regra citada. Trava o fluxo.
      status: 'hard_block';
      ruleCode: string;
      citation: string;
      officialText: string;
      sourceUrl: string;
      uiMessageKey: string;
      referral: 'partner_attorney';
    }
  | {
      // Fato oficial relevante que NÃO impede o protocolo. Exibimos a norma
      // verbatim e exigimos ciência. Não recomendamos nada.
      status: 'disclosure_ack_required';
      ruleCode: string;
      citation: string;
      officialText: string;
      sourceUrl: string;
      uiMessageKey: string;
      referral: 'partner_attorney_optional';
    };

// Trechos verbatim da norma oficial, espelhando compliance_rules.official_text
// (migration 010). A UI exibe este texto — nunca uma paráfrase aplicada ao
// caso do usuário (blindagem UPL).
export const OFFICIAL_TEXT = {
  // Verificado verbatim contra a API oficial do eCFR em 2026-07-04
  // (migration 011 espelha estas correções no banco).
  CFR_248_1_B:
    'Except in the case of an alien applying to obtain V nonimmigrant ' +
    'status in the United States under § 214.15(f) of this chapter, a ' +
    'change of status may not be approved for an alien who failed to ' +
    'maintain the previously accorded status or whose status expired ' +
    'before the application or petition was filed, except that failure ' +
    'to file before the period of previously authorized status expired ' +
    'may be excused in the discretion of USCIS, and without separate ' +
    'application, where it is demonstrated at the time of filing that: ' +
    '(1) The failure to file a timely application was due to ' +
    'extraordinary circumstances beyond the control of the applicant or ' +
    'petitioner, and USCIS finds the delay commensurate with the ' +
    'circumstances; (2) The alien has not otherwise violated his or her ' +
    'nonimmigrant status; (3) The alien remains a bona fide nonimmigrant; ' +
    'and (4) The alien is not the subject of removal proceedings under ' +
    '8 CFR part 240.',
  // Rev. CT:VISA-2002 (05-31-2024) — fam.state.gov, 9 FAM 302.9-4(B)(3)(g)(2)(a).
  FAM_302_9_4_B_3_G:
    'If an individual engages in conduct inconsistent with their ' +
    'nonimmigrant status within 90 days of visa application or admission ' +
    'to the United States, as described in subparagraph (2)(b) below, ' +
    "you may presume that the applicant made a willful misrepresentation " +
    "(i.e., you may presume that the applicant's representations about " +
    'engaging in only status-compliant activity were willful ' +
    'misrepresentations of their true intentions in seeking a visa or ' +
    'admission to the United States). You must provide the applicant ' +
    'with the opportunity to rebut the presumption of misrepresentation ' +
    'by verbally presenting the applicant with your factual findings as ' +
    'to why you believe they are ineligible 6C1.',
  CFR_214_2_F_1_I_A:
    'A nonimmigrant student may be admitted into the United States in ' +
    'nonimmigrant status under section 101(a)(15)(F) of the Act, if: ' +
    "(A) The student presents a Form I-20 or successor form issued in " +
    "the student's name by a school certified by the Student and " +
    'Exchange Visitor Program (SEVP) for attendance by F-1 foreign ' +
    'students.',
  CFR_214_13_A_3:
    'A nonimmigrant alien in the United States seeking a change of ' +
    'status to F-1, F-3, J-1, M-1, or M-3 must pay the fee to DHS before ' +
    'the alien is granted the change of nonimmigrant status, except as ' +
    'provided in paragraph (e)(4) of this section.',
  CFR_214_2_B_7:
    'An alien who is admitted as, or changes status to, a B-1 or B-2 ' +
    'nonimmigrant on or after April 12, 2002, or who files a request to ' +
    'extend the period of authorized stay in B-1 or B-2 nonimmigrant ' +
    'status on or after such date, violates the conditions of his or her ' +
    'B-1 or B-2 status if the alien enrolls in a course of study.',
  CFR_214_1_E_INA_248_A_1:
    'A nonimmigrant in the United States in a class defined in section ' +
    '101(a)(15)(B) of the Act as a temporary visitor for pleasure, or ' +
    'section 101(a)(15)(C) of the Act as an alien in transit through this ' +
    'country, may not engage in any employment.',
} as const;

// EDGE CASE 1 — I-94 vencido (ex.: venceu ontem)
// Fonte: 8 CFR § 248.1(b) (timely filing / manutenção de status);
//        CBP, "Arrival/Departure Record" (o I-94 define o Authorized Period of Stay).
// i94ExpiresOn null = dado obrigatório ausente (fato ainda não coletado do
// usuário) — trava o fluxo como hard_block, nunca lança exceção.
export function ruleI94Valid(i94ExpiresOn: Date | null, today: Date): RuleOutcome {
  if (i94ExpiresOn === null) {
    return {
      status: 'hard_block',
      ruleCode: 'I94_EXPIRED',
      citation: '8 CFR § 248.1(b)',
      officialText: OFFICIAL_TEXT.CFR_248_1_B,
      sourceUrl: 'https://www.ecfr.gov/current/title-8/section-248.1',
      uiMessageKey: 'block.i94_missing',
      referral: 'partner_attorney',
    };
  }
  if (toUtcDateOnly(i94ExpiresOn).getTime() >= toUtcDateOnly(today).getTime()) {
    return { status: 'pass', ruleCode: 'I94_EXPIRED' };
  }
  return {
    status: 'hard_block',
    ruleCode: 'I94_EXPIRED',
    citation: '8 CFR § 248.1(b)',
    officialText: OFFICIAL_TEXT.CFR_248_1_B,
    sourceUrl: 'https://www.ecfr.gov/current/title-8/section-248.1',
    uiMessageKey: 'block.i94_expired',
    referral: 'partner_attorney',
  };
}

// EDGE CASE 2 — Menos de 90 dias desde a entrada
// Fonte: 9 FAM 302.9-4(B)(3)(g) (presunção de willful misrepresentation por
// conduta inconsistente nos primeiros 90 dias). NÃO é proibição de protocolo:
// não existe regra que impeça o filing. Por isso NÃO é hard_block — é
// disclosure com ciência obrigatória.
// entryDate null = dado obrigatório ausente — trava o fluxo como hard_block
// (diferente da disclosure de "ainda não completou 90 dias": aqui não há
// dado nenhum para calcular a janela).
export function rule90Days(entryDate: Date | null, today: Date): RuleOutcome {
  if (entryDate === null) {
    return {
      status: 'hard_block',
      ruleCode: 'DOS_90_DAY_WINDOW',
      citation: '9 FAM 302.9-4(B)(3)(g)(2)',
      officialText: OFFICIAL_TEXT.FAM_302_9_4_B_3_G,
      sourceUrl: 'https://fam.state.gov/FAM/09FAM/09FAM030209.html',
      uiMessageKey: 'block.last_entry_date_missing',
      referral: 'partner_attorney',
    };
  }
  const days = Math.floor(
    (toUtcDateOnly(today).getTime() - toUtcDateOnly(entryDate).getTime()) / DAY
  );
  if (days >= 90) return { status: 'pass', ruleCode: 'DOS_90_DAY_WINDOW' };
  return {
    status: 'disclosure_ack_required',
    ruleCode: 'DOS_90_DAY_WINDOW',
    citation: '9 FAM 302.9-4(B)(3)(g)(2)',
    officialText: OFFICIAL_TEXT.FAM_302_9_4_B_3_G,
    sourceUrl: 'https://fam.state.gov/FAM/09FAM/09FAM030209.html',
    uiMessageKey: 'disclosure.dos_90_day',
    referral: 'partner_attorney_optional',
  };
}

// EDGE CASE 3 — Sem I-20 / SEVIS ID emitido (ou formato inválido)
// Fonte: 8 CFR § 214.2(f)(1)(i)(A) (F-1 exige Form I-20 emitido por escola
// certificada pelo SEVP); Instruções oficiais do Form I-539 (evidência inicial).
export function ruleI20Present(sevisId: string | null): RuleOutcome {
  if (sevisId && /^N\d{10}$/.test(sevisId)) {
    return { status: 'pass', ruleCode: 'I20_MISSING' };
  }
  return {
    status: 'hard_block',
    ruleCode: 'I20_MISSING',
    citation: '8 CFR § 214.2(f)(1)(i)(A)',
    officialText: OFFICIAL_TEXT.CFR_214_2_F_1_I_A,
    sourceUrl: 'https://www.ecfr.gov/current/title-8/section-214.2',
    uiMessageKey: 'block.i20_missing',
    referral: 'partner_attorney',
  };
}

// Taxa SEVIS I-901 paga.
// Fonte: 8 CFR § 214.13(a)(3) — (a)(4) trata de mudança de categoria J-1;
// citação corrigida na auditoria de grounding de 2026-07-04 (migration 011).
export function ruleI901FeePaid(feePaid: boolean): RuleOutcome {
  if (feePaid) return { status: 'pass', ruleCode: 'SEVIS_FEE_UNPAID' };
  return {
    status: 'hard_block',
    ruleCode: 'SEVIS_FEE_UNPAID',
    citation: '8 CFR § 214.13(a)(3)',
    officialText: OFFICIAL_TEXT.CFR_214_13_A_3,
    sourceUrl: 'https://www.ecfr.gov/current/title-8/section-214.13',
    uiMessageKey: 'block.sevis_fee_unpaid',
    referral: 'partner_attorney',
  };
}

// Matrícula antecipada: início de curso em B1/B2 antes da aprovação viola o
// status. Fonte: 8 CFR § 214.2(b)(7).
// null (fato ainda não declarado) => tratado como false, espelhando
// coalesce(c.enrolled_before_approval, false) em validate_cos_b2_f1().
export function ruleNoEarlyEnrollment(enrolledBeforeApproval: boolean | null): RuleOutcome {
  if (!enrolledBeforeApproval) {
    return { status: 'pass', ruleCode: 'B2_STUDY_STARTED' };
  }
  return {
    status: 'hard_block',
    ruleCode: 'B2_STUDY_STARTED',
    citation: '8 CFR § 214.2(b)(7)',
    officialText: OFFICIAL_TEXT.CFR_214_2_B_7,
    sourceUrl: 'https://www.ecfr.gov/current/title-8/section-214.2',
    uiMessageKey: 'block.b2_study_started',
    referral: 'partner_attorney',
  };
}

// Trabalho não autorizado em B1/B2 impede mudança de status.
// Fonte: 8 CFR § 214.1(e); INA § 248(a)(1).
// null (fato ainda não declarado) => tratado como false, espelhando
// coalesce(c.worked_without_authorization, false) em validate_cos_b2_f1().
export function ruleNoUnauthorizedWork(workedWithoutAuthorization: boolean | null): RuleOutcome {
  if (!workedWithoutAuthorization) {
    return { status: 'pass', ruleCode: 'UNAUTHORIZED_WORK' };
  }
  return {
    status: 'hard_block',
    ruleCode: 'UNAUTHORIZED_WORK',
    citation: '8 CFR § 214.1(e); INA § 248(a)(1)',
    officialText: OFFICIAL_TEXT.CFR_214_1_E_INA_248_A_1,
    sourceUrl: 'https://www.ecfr.gov/current/title-8/section-214.1',
    uiMessageKey: 'block.unauthorized_work',
    referral: 'partner_attorney',
  };
}

// Citações verbatim por rule_code, para as linhas 'pass' persistidas em
// case_rule_results (citation é NOT NULL na migration mesmo quando outcome é
// 'pass' — a variante 'pass' de RuleOutcome não carrega citation por design
// do contrato do RFC-001 §3.1, então o valor é resolvido aqui).
export const RULE_CITATIONS: Record<string, string> = {
  I94_EXPIRED: '8 CFR § 248.1(b)',
  DOS_90_DAY_WINDOW: '9 FAM 302.9-4(B)(3)(g)(2)',
  I20_MISSING: '8 CFR § 214.2(f)(1)(i)(A)',
  SEVIS_FEE_UNPAID: '8 CFR § 214.13(a)(3)',
  B2_STUDY_STARTED: '8 CFR § 214.2(b)(7)',
  UNAUTHORIZED_WORK: '8 CFR § 214.1(e); INA § 248(a)(1)',
};

export function citationFor(outcome: RuleOutcome): string {
  return outcome.status === 'pass' ? RULE_CITATIONS[outcome.ruleCode] : outcome.citation;
}

// Fatos do caso, já tipados (Date/boolean), independentes de como o chamador
// os obteve (Supabase, service role, etc.) — a orquestração abaixo continua
// sem I/O.
export interface CosB2F1CaseFacts {
  i94AdmitUntil: Date | null;
  lastEntryDate: Date | null;
  sevisId: string | null;
  i901FeePaid: boolean;
  enrolledBeforeApproval: boolean | null;
  workedWithoutAuthorization: boolean | null;
}

// Roda as 6 regras espelhando, na mesma ordem, validate_cos_b2_f1() da
// migration 010 — reutilizável tanto no submit quanto num futuro cron de
// reavaliação (RFC-001 §3.4).
export function runCosB2F1Rules(facts: CosB2F1CaseFacts, today: Date): RuleOutcome[] {
  return [
    ruleI94Valid(facts.i94AdmitUntil, today),
    rule90Days(facts.lastEntryDate, today),
    ruleI20Present(facts.sevisId),
    ruleI901FeePaid(facts.i901FeePaid),
    ruleNoEarlyEnrollment(facts.enrolledBeforeApproval),
    ruleNoUnauthorizedWork(facts.workedWithoutAuthorization),
  ];
}
