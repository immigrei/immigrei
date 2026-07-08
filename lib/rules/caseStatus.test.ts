import { describe, expect, it } from 'vitest';
import { deriveCaseStatus } from './caseStatus';
import type { RuleOutcome } from './cosB2F1';

const pass = (ruleCode: string): RuleOutcome => ({ status: 'pass', ruleCode });

const hardBlock = (ruleCode: string): RuleOutcome => ({
  status: 'hard_block',
  ruleCode,
  citation: 'citation',
  officialText: 'text',
  sourceUrl: 'https://example.com',
  uiMessageKey: 'block.example',
  referral: 'partner_attorney',
});

const disclosure = (ruleCode: string): RuleOutcome => ({
  status: 'disclosure_ack_required',
  ruleCode,
  citation: 'citation',
  officialText: 'text',
  sourceUrl: 'https://example.com',
  uiMessageKey: 'disclosure.example',
  referral: 'partner_attorney_optional',
});

const ACK = '2026-07-07T00:00:00Z';

describe('deriveCaseStatus', () => {
  it('retorna validated quando todas as regras passam', () => {
    const outcomes = [pass('A'), pass('B'), pass('C')];
    expect(deriveCaseStatus(outcomes, null)).toBe('validated');
  });

  it('retorna draft quando há disclosure sem ciência registrada', () => {
    const outcomes = [pass('A'), disclosure('B'), pass('C')];
    expect(deriveCaseStatus(outcomes, null)).toBe('draft');
  });

  it('retorna validated quando a disclosure já tem ciência registrada', () => {
    const outcomes = [pass('A'), disclosure('B'), pass('C')];
    expect(deriveCaseStatus(outcomes, ACK)).toBe('validated');
  });

  it('retorna blocked quando há ao menos um hard_block (mesmo com ciência)', () => {
    const outcomes = [pass('A'), hardBlock('B'), disclosure('C')];
    expect(deriveCaseStatus(outcomes, ACK)).toBe('blocked');
  });

  it('retorna blocked mesmo com um único hard_block entre 6 outcomes', () => {
    const outcomes = [
      pass('I94_EXPIRED'),
      pass('DOS_90_DAY_WINDOW'),
      pass('I20_MISSING'),
      pass('SEVIS_FEE_UNPAID'),
      hardBlock('B2_STUDY_STARTED'),
      pass('UNAUTHORIZED_WORK'),
    ];
    expect(deriveCaseStatus(outcomes, null)).toBe('blocked');
  });

  it('retorna validated para uma lista vazia (nenhum hard_block presente)', () => {
    expect(deriveCaseStatus([], null)).toBe('validated');
  });
});
