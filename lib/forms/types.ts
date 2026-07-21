/**
 * Form-filler engine — shared types.
 *
 * A `FormSpec` is a data-driven description of one official immigration form:
 * PT-BR questions the user answers, plus a deterministic map from each answer
 * to the official form's fields (the AcroForm field names of the USCIS PDF, or
 * the columns of a bilingual worksheet for online-only forms like the DS-160).
 *
 * Design guardrails (mirrors the UPL discipline of lib/rules/*):
 *   - The engine is MINISTERIAL: it transcribes and translates what the user
 *     enters. It never decides eligibility, never picks a form, never fills a
 *     merit/subjective field on the user's behalf. The user is the author.
 *   - Translation PT->EN is DETERMINISTIC: enumerated answers carry their own
 *     `valueEn`; proper nouns / user-authored strings pass through verbatim
 *     (`passthroughEn`). We never machine-translate a user's words.
 *   - `validate` is FORMAT-ONLY (a date looks like a date). Never eligibility.
 *
 * Adding a new form = adding one file under lib/forms/ and registering it.
 */

export type FieldValue = string | boolean | number | null;

export type Answers = Record<string, FieldValue>;

export type FieldType =
  | "text"
  | "textarea"
  | "date" // stored as ISO yyyy-mm-dd
  | "select"
  | "radio"
  | "checkbox"
  | "number";

/** Identity fields we already hold on the profile row and can prefill. */
export type ProfilePrefillKey = "full_name" | "email" | "nationality" | "arrival_date";

export type Option = {
  /** Stable key persisted in answers (locale-independent). */
  value: string;
  /** Shown to the user, PT-BR. */
  labelPt: string;
  /**
   * What gets written to the official (English) form. Defaults to `value`.
   * This is the deterministic PT->EN translation — a reviewed lookup, not AI.
   */
  valueEn?: string;
};

/**
 * How one answer is written onto the official PDF's AcroForm fields.
 * `field` is the exact field name inside the USCIS PDF (extracted from the
 * real asset, never guessed).
 */
export type PdfMapping =
  | {
      kind: "text";
      field: string;
      /** Override the exported string (defaults to the English value). */
      transform?: (value: FieldValue, answers: Answers) => string;
    }
  | {
      /** Select a value on a PDF dropdown (e.g. the 2-letter US state). */
      kind: "dropdown";
      field: string;
    }
  | {
      kind: "checkbox";
      field: string;
      /** When true, the box is checked. Defaults to a truthy value. */
      onWhen?: (value: FieldValue) => boolean;
    }
  | {
      /**
       * Single-choice question rendered on the PDF as a set of separate
       * checkboxes (USCIS style, e.g. Sex, Marital Status, Reason). Checks
       * exactly the box mapped to the chosen option value.
       */
      kind: "checkboxChoice";
      fieldByValue: Record<string, string>;
    }
  | {
      /** One date split across three PDF text boxes, USCIS mm/dd/yyyy style. */
      kind: "dateParts";
      month: string;
      day: string;
      year: string;
    };

export type ValidationRule = {
  /** Format check only — NEVER eligibility or merit. */
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  messagePt: string;
};

export type Question = {
  id: string;
  labelPt: string;
  helpPt?: string;
  type: FieldType;
  options?: Option[];
  required?: boolean;
  placeholder?: string;
  /**
   * Seed value when the user hasn't answered yet and there's no profile
   * prefill. Used for the Brazilian-first defaults (e.g. country = "Brazil").
   * `prefillFrom` (real profile data) always wins over this.
   */
  default?: FieldValue;
  /** Prefill from the profile row (identity we already hold). */
  prefillFrom?: ProfilePrefillKey;
  validate?: ValidationRule;
  /** Conditional display: only shown when a prior answer matches (one value, or any of several). */
  showWhen?: { questionId: string; equals: FieldValue | FieldValue[] };
  /** How this answer is written onto the official PDF. */
  pdf?: PdfMapping | PdfMapping[];
  /**
   * Free-text that appears in English on the official form but is a proper
   * noun / user-authored string (name, employer, address) → written verbatim.
   */
  passthroughEn?: boolean;
};

export type FormSection = {
  id: string;
  titlePt: string;
  descriptionPt?: string;
  questions: Question[];
};

export type ExportKind = "pdf" | "worksheet";

export type FormSpec = {
  /** Slug used in URLs and the registry, e.g. "i-765". */
  id: string;
  /** Official code, e.g. "I-765". */
  code: string;
  officialName: string;
  namePt: string;
  agency: "USCIS" | "DOS" | "DOL" | "CBP";
  officialUrl: string;
  /**
   * Edition date printed on the official form ("mm/dd/yy"). USCIS rejects
   * outdated editions, so we pin it and monitor the official page for changes
   * (see lib/forms/freshness.ts) — never silently ship a stale edition.
   */
  edition: string;
  exportKind: ExportKind;
  /** Path (relative to /public) to the versioned official PDF asset. */
  pdfAssetPath?: string;
  /** Where the generated file is attached in the documents vault. */
  attachTo: { vistoId: string; documentoId: string };
  disclaimerPt: string;
  sections: FormSection[];
};

/** Flattened list of every question in a form, in order. */
export function allQuestions(form: FormSpec): Question[] {
  return form.sections.flatMap((s) => s.questions);
}

/**
 * The English value written to the official form for a given answer.
 * Enumerated answers resolve through their Option.valueEn (deterministic
 * PT->EN); everything else is the raw value coerced to string (passthrough).
 */
export function englishValue(question: Question, value: FieldValue): string {
  if (value === null || value === undefined || value === "") return "";
  if (question.options) {
    const opt = question.options.find((o) => o.value === value);
    if (opt) return opt.valueEn ?? opt.value;
  }
  return String(value);
}

/**
 * Whether a question is visible given the current answers (conditional logic).
 */
export function isVisible(question: Question, answers: Answers): boolean {
  if (!question.showWhen) return true;
  const { questionId, equals } = question.showWhen;
  const actual = answers[questionId];
  return Array.isArray(equals) ? equals.includes(actual) : actual === equals;
}
