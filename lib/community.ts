// lib/community.ts — shared rules for the closed community.
// The contact-info filter runs in the composer (live feedback) and again in
// the API route (the barrier that counts). It blocks the lazy 90% of contact
// sharing; manual moderation catches the creative rest.

export const TITLE_MAX = 120;
export const BODY_MAX = 5000;
export const BODY_MIN = 80;
export const MAX_VISAS_PER_REPORT = 4;
export const MAX_REPORTS_PER_DAY = 3;

// US states where the community lives (PT-BR labels), plus Brasil for
// members reporting from outside the US.
export const AUTHOR_STATES = [
  "Alabama", "Alasca", "Arizona", "Arkansas", "Califórnia", "Carolina do Norte",
  "Carolina do Sul", "Colorado", "Connecticut", "Dakota do Norte", "Dakota do Sul",
  "Delaware", "Flórida", "Geórgia", "Havaí", "Idaho", "Illinois", "Indiana",
  "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
  "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska",
  "Nevada", "New Hampshire", "Nova Jersey", "Nova York", "Novo México", "Ohio",
  "Oklahoma", "Oregon", "Pensilvânia", "Rhode Island", "Tennessee", "Texas",
  "Utah", "Vermont", "Virgínia", "Virgínia Ocidental", "Washington",
  "Washington D.C.", "Wisconsin", "Wyoming", "Brasil",
] as const;

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]{2,}/;
// Phone: BR/US formats with separators — at least 8 digits total so prices
// ("R$ 1.500,00") and years don't trip it.
const PHONE = /(\+?\d{1,3}[\s.\-]?)?\(?\d{2,3}\)?[\s.\-]?\d{3,5}[\s.\-]?\d{4}\b/;
const LINK = /(https?:\/\/|www\.|wa\.me|bit\.ly|t\.me|linktr\.ee|calendly\.com)/i;
const HANDLE = /(^|\s)@[\w.]{3,}/;
const CONTACT_WORDS =
  /\b(whats\s?app|whats|zap(zap)?|telegram|insta(gram)?|direct|\bdm\b|me\s+(chama|add|adiciona|procura)|meu\s+(número|numero|contato|e-?mail|email|insta|zap))\b/i;

export type ContactViolation = "email" | "telefone" | "link" | "rede social";

/** Returns what kind of contact info the text contains, or null if clean. */
export function findContactInfo(text: string): ContactViolation | null {
  if (EMAIL.test(text)) return "email";
  if (LINK.test(text)) return "link"; // before PHONE: wa.me/55119... digits also look like a phone
  if (PHONE.test(text)) return "telefone";
  if (HANDLE.test(text) || CONTACT_WORDS.test(text)) return "rede social";
  return null;
}

export const CONTACT_BLOCKED_MESSAGE =
  "Para proteger a comunidade, relatos não podem conter telefone, e-mail, links ou contatos de redes sociais.";

// UPL (unauthorized practice of law) signals for the twice-weekly review
// cron (app/api/cron/community-review). Cheap regex pass, not a legal
// judgment — it only flags for a human to read, never auto-removes. Catches
// posters giving other members personalized legal instructions/guarantees,
// which is what turns a personal story into practicing law without a
// license.
const UPL_PATTERNS: RegExp[] = [
  /\bsou\s+advogad[oa]\b/i,
  /\bsou\s+consultor(a)?\s+de\s+imigra[çc][ãa]o\b/i,
  /\b(eu\s+)?garanto\s+(que\s+)?(vai|sua|seu)\b/i,
  /\bn[ãa]o\s+precisa\s+de\s+advogado\b/i,
  /\bpode\s+confiar\s+em\s+mim,?\s+(no\s+seu\s+caso|sobre\s+o\s+seu\s+caso)\b/i,
  /\bno\s+seu\s+caso,?\s+(voc[êe]\s+deve|entra\s+com|preencha|use\s+o\s+formul[áa]rio)\b/i,
];

/** Returns the UPL patterns a report's text matched, or [] if clean. */
export function findUplSignals(text: string): string[] {
  return UPL_PATTERNS.filter((re) => re.test(text)).map((re) => re.source);
}
