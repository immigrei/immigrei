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
  CFR_248_1_B:
    'Except in the case of an alien applying to obtain V nonimmigrant ' +
    'status, a change of status may not be approved for an alien who ' +
    'failed to maintain the previously accorded status or where such ' +
    'status expired before the application or petition was filed.',
  FAM_302_9_4_B_3_G:
    "If an alien violates or engages in conduct inconsistent with his or " +
    "her nonimmigrant status within 90 days of entry, you may presume " +
    "that the applicant's representations about engaging in only " +
    "status-compliant activity were willful misrepresentations of his or " +
    "her intention in seeking a visa or entry.",
  CFR_214_2_F_1_I_A:
    'A nonimmigrant student must present a SEVIS Form I-20 issued in his ' +
    'or her own name by a school approved by the Service for attendance ' +
    'by foreign students.',
  CFR_214_13_A_4:
    'An alien seeking a change of status to F-1, F-3, M-1, or M-3 must ' +
    'pay the SEVIS fee to SEVP, unless exempt.',
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
export function ruleI94Valid(i94ExpiresOn: Date, today: Date): RuleOutcome {
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
export function rule90Days(entryDate: Date, today: Date): RuleOutcome {
  const days = Math.floor(
    (toUtcDateOnly(today).getTime() - toUtcDateOnly(entryDate).getTime()) / DAY
  );
  if (days >= 90) return { status: 'pass', ruleCode: 'DOS_90_DAY_WINDOW' };
  return {
    status: 'disclosure_ack_required',
    ruleCode: 'DOS_90_DAY_WINDOW',
    citation: '9 FAM 302.9-4(B)(3)(g)',
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
// Fonte: 8 CFR § 214.13(a)(4).
export function ruleI901FeePaid(feePaid: boolean): RuleOutcome {
  if (feePaid) return { status: 'pass', ruleCode: 'SEVIS_FEE_UNPAID' };
  return {
    status: 'hard_block',
    ruleCode: 'SEVIS_FEE_UNPAID',
    citation: '8 CFR § 214.13(a)(4)',
    officialText: OFFICIAL_TEXT.CFR_214_13_A_4,
    sourceUrl: 'https://www.ecfr.gov/current/title-8/section-214.13',
    uiMessageKey: 'block.sevis_fee_unpaid',
    referral: 'partner_attorney',
  };
}

// Matrícula antecipada: início de curso em B1/B2 antes da aprovação viola o
// status. Fonte: 8 CFR § 214.2(b)(7).
export function ruleNoEarlyEnrollment(enrolledBeforeApproval: boolean): RuleOutcome {
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
export function ruleNoUnauthorizedWork(workedWithoutAuthorization: boolean): RuleOutcome {
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
