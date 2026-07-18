// F-1 -> OPT eligibility math — one full academic year of full-time enrollment
// before post-completion OPT (8 CFR 214.2(f)(10), USCIS Policy Manual Vol. 2,
// Part F, Ch. 6). "Academic year" is defined by the student's school (usually
// two semesters, ~9 months), not a fixed 365-day count — so the target date
// here is an estimate the user can override once their DSO confirms it.

const ESTIMATED_ACADEMIC_YEAR_MONTHS = 9;

export function estimatedOptEligibleDate(programStartDateStr: string): string {
  const [year, month, day] = programStartDateStr.split("-").map(Number);
  const target = new Date(year, month - 1 + ESTIMATED_ACADEMIC_YEAR_MONTHS, day);
  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, "0");
  const d = String(target.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysUntilOptEligible(eligibleDateStr: string, today: Date = new Date()): number {
  const [year, month, day] = eligibleDateStr.split("-").map(Number);
  const due = new Date(year, month - 1, day);
  const ref = new Date(today);
  ref.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
}
