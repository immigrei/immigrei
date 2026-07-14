/**
 * Initial answers for a form: profile data we already hold wins, then the
 * Brazilian-first defaults, then empty. The user reviews everything before
 * exporting — nothing here is authoritative, it's a head start.
 */

import { allQuestions, type Answers, type FormSpec, type ProfilePrefillKey } from "./types";

export type ProfileForPrefill = Partial<Record<ProfilePrefillKey, string | null>>;

export function initialAnswers(form: FormSpec, profile: ProfileForPrefill): Answers {
  const answers: Answers = {};
  for (const q of allQuestions(form)) {
    const fromProfile = q.prefillFrom ? profile[q.prefillFrom] : null;
    if (fromProfile) {
      answers[q.id] = fromProfile;
    } else if (q.default !== undefined) {
      answers[q.id] = q.default;
    }
  }
  return answers;
}

/** Merge saved answers over the prefill so a resumed draft keeps its edits. */
export function mergeAnswers(form: FormSpec, profile: ProfileForPrefill, saved: Answers | null): Answers {
  return { ...initialAnswers(form, profile), ...(saved ?? {}) };
}
