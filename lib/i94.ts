// Shared I-94 deadline math — used by the início field, /painel and the
// deadline cron, so the three never drift on how "days left" is computed.

export function daysUntilI94Expiry(dateStr: string, today: Date = new Date()): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  const due = new Date(year, month - 1, day);
  const ref = new Date(today);
  ref.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
}
