// lib/rules/caseStatus.ts — deriva o status persistido em
// cos_b2_f1_cases.status a partir dos RuleOutcome do submit (RFC-001 §3.4).
// Pura, sem I/O: qualquer hard_block bloqueia o caso; uma disclosure com
// ciência obrigatória ainda não registrada mantém o caso em 'draft' — o
// caso só é 'validated' depois que todo gate (regras E ciências) fechou.
import type { RuleOutcome } from './cosB2F1';

export type CaseStatus = 'draft' | 'validated' | 'blocked';

export function deriveCaseStatus(
  outcomes: RuleOutcome[],
  dos90DayAcknowledgedAt: string | null,
): CaseStatus {
  if (outcomes.some((o) => o.status === 'hard_block')) return 'blocked';
  const needsAck = outcomes.some((o) => o.status === 'disclosure_ack_required');
  if (needsAck && !dos90DayAcknowledgedAt) return 'draft';
  return 'validated';
}
