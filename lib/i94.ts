// Shared I-94 deadline math — used by the início field, /painel and the
// deadline cron, so the three never drift on how "days left" is computed.

export function daysUntilI94Expiry(dateStr: string, today: Date = new Date()): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  const due = new Date(year, month - 1, day);
  const ref = new Date(today);
  ref.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
}

// Same color rule for any deadline badge in the app (I-94 field/card, and
// the parallel-processes summary) — one place so they can't drift apart.
export function urgencyStyle(days: number): { text: string; badge: string } {
  if (days < 0) return { text: "text-clay", badge: "bg-clay/10 text-clay" };
  if (days <= 30) return { text: "text-amber-deep", badge: "bg-amber-tint text-amber-deep" };
  return { text: "text-ink", badge: "bg-pine-tint text-pine-deep" };
}
