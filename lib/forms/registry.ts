/**
 * Form registry — the closed set of forms the filler knows.
 * Adding a form = importing its FormSpec here.
 */

import type { FormSpec } from "./types";
import { I765 } from "./i-765";
import { I539 } from "./i-539";

export const FORMS: Record<string, FormSpec> = {
  [I765.id]: I765,
  [I539.id]: I539,
};

export function getForm(formId: string): FormSpec | undefined {
  return FORMS[formId];
}

/** Forms attached to a given documents-vault kit, keyed by checklist item id. */
export function formsForKit(vistoId: string): FormSpec[] {
  return Object.values(FORMS).filter((f) => f.attachTo.vistoId === vistoId);
}
