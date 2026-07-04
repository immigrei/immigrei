// lib/rules/caseStatus.ts — deriva o status persistido em
// cos_b2_f1_cases.status a partir dos RuleOutcome do submit (RFC-001 §3.4).
// Pura, sem I/O: qualquer hard_block bloqueia o caso; pass/disclosure não
// impedem o protocolo.
import type { RuleOutcome } from './cosB2F1';

export type CaseStatus = 'validated' | 'blocked';

export function deriveCaseStatus(outcomes: RuleOutcome[]): CaseStatus {
  return outcomes.some((o) => o.status === 'hard_block') ? 'blocked' : 'validated';
}
