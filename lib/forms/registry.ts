/**
 * Form registry — the closed set of forms the filler knows.
 * Adding a form = importing its FormSpec here.
 */

import type { FormSpec } from "./types";
import { I765 } from "./i-765";
import { I539 } from "./i-539";
import { I130 } from "./i-130";
import { I130A } from "./i-130a";
import { I864 } from "./i-864";
import { I485 } from "./i-485";

export const FORMS: Record<string, FormSpec> = {
  [I765.id]: I765,
  [I539.id]: I539,
  [I130.id]: I130,
  [I130A.id]: I130A,
  [I864.id]: I864,
  [I485.id]: I485,
};

export function getForm(formId: string): FormSpec | undefined {
  return FORMS[formId];
}

/** Forms attached to a given documents-vault kit, keyed by checklist item id. */
export function formsForKit(vistoId: string): FormSpec[] {
  return Object.values(FORMS).filter((f) => f.attachTo.vistoId === vistoId);
}
