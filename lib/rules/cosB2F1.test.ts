import { describe, expect, it } from 'vitest';
import {
  ruleI94Valid,
  rule90Days,
  ruleI20Present,
  ruleI901FeePaid,
  ruleNoEarlyEnrollment,
  ruleNoUnauthorizedWork,
  runCosB2F1Rules,
  type CosB2F1CaseFacts,
} from './cosB2F1';

const DAY = 86_400_000;

describe('ruleI94Valid', () => {
  it('bloqueia I-94 vencido ontem', () => {
    const today = new Date('2026-07-04T00:00:00Z');
    const i94ExpiresOn = new Date('2026-07-03T00:00:00Z');
    const result = ruleI94Valid(i94ExpiresOn, today);
    expect(result.status).toBe('hard_block');
    if (result.status === 'hard_block') {
      expect(result.ruleCode).toBe('I94_EXPIRED');
      expect(result.citation).toBe('8 CFR § 248.1(b)');
      expect(result.referral).toBe('partner_attorney');
    }
  });

  it('aprova I-94 que vence hoje mesmo (data-limite ainda não passou)', () => {
    const today = new Date('2026-07-04T00:00:00Z');
    const i94ExpiresOn = new Date('2026-07-04T00:00:00Z');
    const result = ruleI94Valid(i94ExpiresOn, today);
    expect(result).toEqual({ status: 'pass', ruleCode: 'I94_EXPIRED' });
  });

  it('aprova I-94 que vence no futuro', () => {
    const today = new Date('2026-07-04T00:00:00Z');
    const i94ExpiresOn = new Date('2026-07-05T00:00:00Z');
    const result = ruleI94Valid(i94ExpiresOn, today);
    expect(result.status).toBe('pass');
  });

  it('aprova I-94 que vence hoje mesmo mesmo com horário avançado no "today" (compara data-calendário, não timestamp)', () => {
    const today = new Date('2026-07-04T15:54:00Z');
    const i94ExpiresOn = new Date('2026-07-04T00:00:00Z');
    const result = ruleI94Valid(i94ExpiresOn, today);
    expect(result).toEqual({ status: 'pass', ruleCode: 'I94_EXPIRED' });
  });

  it('bloqueia (dado ausente) quando i94ExpiresOn é null, sem lançar exceção', () => {
    const today = new Date('2026-07-04T00:00:00Z');
    const result = ruleI94Valid(null, today);
    expect(result.status).toBe('hard_block');
    if (result.status === 'hard_block') {
      expect(result.ruleCode).toBe('I94_EXPIRED');
      expect(result.citation).toBe('8 CFR § 248.1(b)');
      expect(result.uiMessageKey).toBe('block.i94_missing');
      expect(result.referral).toBe('partner_attorney');
    }
  });
});

describe('rule90Days', () => {
  it('exige ciência (disclosure) em exatamente 89 dias', () => {
    const today = new Date('2026-07-04T00:00:00Z');
    const entryDate = new Date(today.getTime() - 89 * DAY);
    const result = rule90Days(entryDate, today);
    expect(result.status).toBe('disclosure_ack_required');
    if (result.status === 'disclosure_ack_required') {
      expect(result.ruleCode).toBe('DOS_90_DAY_WINDOW');
      expect(result.citation).toBe('9 FAM 302.9-4(B)(3)(g)(2)');
      expect(result.referral).toBe('partner_attorney_optional');
    }
  });

  it('aprova em exatamente 90 dias', () => {
    const today = new Date('2026-07-04T00:00:00Z');
    const entryDate = new Date(today.getTime() - 90 * DAY);
    const result = rule90Days(entryDate, today);
    expect(result).toEqual({ status: 'pass', ruleCode: 'DOS_90_DAY_WINDOW' });
  });

  it('aprova com mais de 90 dias', () => {
    const today = new Date('2026-07-04T00:00:00Z');
    const entryDate = new Date(today.getTime() - 200 * DAY);
    const result = rule90Days(entryDate, today);
    expect(result.status).toBe('pass');
  });

  it('bloqueia (dado ausente) quando entryDate é null, sem lançar exceção', () => {
    const today = new Date('2026-07-04T00:00:00Z');
    const result = rule90Days(null, today);
    expect(result.status).toBe('hard_block');
    if (result.status === 'hard_block') {
      expect(result.ruleCode).toBe('DOS_90_DAY_WINDOW');
      expect(result.citation).toBe('9 FAM 302.9-4(B)(3)(g)(2)');
      expect(result.uiMessageKey).toBe('block.last_entry_date_missing');
      expect(result.referral).toBe('partner_attorney');
    }
  });
});

describe('ruleI20Present', () => {
  it('aprova SEVIS ID bem formado (N + 10 dígitos)', () => {
    const result = ruleI20Present('N0012345678');
    expect(result).toEqual({ status: 'pass', ruleCode: 'I20_MISSING' });
  });

  it('bloqueia SEVIS ID nulo', () => {
    const result = ruleI20Present(null);
    expect(result.status).toBe('hard_block');
    if (result.status === 'hard_block') {
      expect(result.ruleCode).toBe('I20_MISSING');
    }
  });

  it.each([
    ['prefixo errado', 'X0012345678'],
    ['dígitos insuficientes', 'N001234567'],
    ['dígitos em excesso', 'N00123456789'],
    ['sem prefixo N', '0012345678'],
    ['caracteres não numéricos', 'N00123ABCDE'],
    ['string vazia', ''],
    ['minúsculo', 'n0012345678'],
  ])('bloqueia SEVIS ID malformado: %s (%s)', (_label, sevisId) => {
    const result = ruleI20Present(sevisId);
    expect(result.status).toBe('hard_block');
    if (result.status === 'hard_block') {
      expect(result.ruleCode).toBe('I20_MISSING');
      expect(result.citation).toBe('8 CFR § 214.2(f)(1)(i)(A)');
    }
  });
});

describe('ruleI901FeePaid', () => {
  it('aprova quando a taxa I-901 foi paga', () => {
    expect(ruleI901FeePaid(true)).toEqual({
      status: 'pass',
      ruleCode: 'SEVIS_FEE_UNPAID',
    });
  });

  it('bloqueia quando a taxa I-901 não foi paga', () => {
    const result = ruleI901FeePaid(false);
    expect(result.status).toBe('hard_block');
    if (result.status === 'hard_block') {
      expect(result.ruleCode).toBe('SEVIS_FEE_UNPAID');
      expect(result.citation).toBe('8 CFR § 214.13(a)(3)');
      expect(result.referral).toBe('partner_attorney');
    }
  });
});

describe('ruleNoEarlyEnrollment', () => {
  it('aprova quando não houve matrícula antes da aprovação', () => {
    expect(ruleNoEarlyEnrollment(false)).toEqual({
      status: 'pass',
      ruleCode: 'B2_STUDY_STARTED',
    });
  });

  it('bloqueia quando houve matrícula antecipada', () => {
    const result = ruleNoEarlyEnrollment(true);
    expect(result.status).toBe('hard_block');
    if (result.status === 'hard_block') {
      expect(result.ruleCode).toBe('B2_STUDY_STARTED');
      expect(result.citation).toBe('8 CFR § 214.2(b)(7)');
    }
  });

  it('aprova quando o fato ainda não foi declarado (null => tratado como false)', () => {
    expect(ruleNoEarlyEnrollment(null)).toEqual({
      status: 'pass',
      ruleCode: 'B2_STUDY_STARTED',
    });
  });
});

describe('ruleNoUnauthorizedWork', () => {
  it('aprova quando não houve trabalho não autorizado', () => {
    expect(ruleNoUnauthorizedWork(false)).toEqual({
      status: 'pass',
      ruleCode: 'UNAUTHORIZED_WORK',
    });
  });

  it('bloqueia quando houve trabalho não autorizado', () => {
    const result = ruleNoUnauthorizedWork(true);
    expect(result.status).toBe('hard_block');
    if (result.status === 'hard_block') {
      expect(result.ruleCode).toBe('UNAUTHORIZED_WORK');
      expect(result.citation).toBe('8 CFR § 214.1(e); INA § 248(a)(1)');
    }
  });

  it('aprova quando o fato ainda não foi declarado (null => tratado como false)', () => {
    expect(ruleNoUnauthorizedWork(null)).toEqual({
      status: 'pass',
      ruleCode: 'UNAUTHORIZED_WORK',
    });
  });
});

describe('runCosB2F1Rules', () => {
  const today = new Date('2026-07-04T00:00:00Z');

  const completeFacts: CosB2F1CaseFacts = {
    i94AdmitUntil: new Date('2026-08-01T00:00:00Z'),
    lastEntryDate: new Date('2026-01-01T00:00:00Z'),
    sevisId: 'N0012345678',
    i901FeePaid: true,
    enrolledBeforeApproval: false,
    workedWithoutAuthorization: false,
  };

  it('retorna 6 outcomes, todos pass, para um caso completo e conforme', () => {
    const outcomes = runCosB2F1Rules(completeFacts, today);
    expect(outcomes).toHaveLength(6);
    expect(outcomes.every((o) => o.status === 'pass')).toBe(true);
  });

  it('bloqueia por dado ausente quando i94AdmitUntil e lastEntryDate são null, sem lançar exceção', () => {
    const facts: CosB2F1CaseFacts = {
      ...completeFacts,
      i94AdmitUntil: null,
      lastEntryDate: null,
    };
    const outcomes = runCosB2F1Rules(facts, today);
    expect(outcomes).toHaveLength(6);
    const [i94Outcome, days90Outcome] = outcomes;
    expect(i94Outcome).toMatchObject({ status: 'hard_block', ruleCode: 'I94_EXPIRED' });
    expect(days90Outcome).toMatchObject({ status: 'hard_block', ruleCode: 'DOS_90_DAY_WINDOW' });
  });
});
