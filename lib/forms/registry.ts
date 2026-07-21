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
import { I131 } from "./i-131";
import { I90 } from "./i-90";
import { N400 } from "./n-400";
import { I765AOS } from "./i-765-aos";
import { G1145 } from "./g-1145";
import { I129F } from "./i-129f";
import { DS160 } from "./ds-160";
import { ESTA } from "./esta";

export const FORMS: Record<string, FormSpec> = {
  [I765.id]: I765,
  [I539.id]: I539,
  [I130.id]: I130,
  [I130A.id]: I130A,
  [I864.id]: I864,
  [I485.id]: I485,
  [I131.id]: I131,
  [I90.id]: I90,
  [N400.id]: N400,
  [I765AOS.id]: I765AOS,
  [G1145.id]: G1145,
  [I129F.id]: I129F,
  [DS160.id]: DS160,
  [ESTA.id]: ESTA,
};

export function getForm(formId: string): FormSpec | undefined {
  return FORMS[formId];
}

/** Forms attached to a given documents-vault kit, keyed by checklist item id. */
export function formsForKit(vistoId: string): FormSpec[] {
  return Object.values(FORMS).filter((f) => f.attachTo.vistoId === vistoId);
}
