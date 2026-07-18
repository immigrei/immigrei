/**
 * I-765 (c)(9) — Employment Authorization for a pending adjustment of status.
 *
 * The same official I-765 PDF as the OPT spec, but scoped to the familia-ir
 * adjustment flow: WHO FILLS THIS FORM is the APPLICANT — the person with a
 * pending I-485 (who will receive the green card) asking for the work permit
 * (EAD) while the case is decided. Category: (c)(9).
 *
 * Implementation: derives from the OPT spec (lib/forms/i-765.ts) — the
 * personal-data sections and their verified field mappings are identical.
 * Only the category section is replaced ((c)(9) instead of (c)(3)) and the
 * F-1-specific defaults/requirements are overridden (SEVIS number does not
 * apply to adjustment applicants).
 */

import { I765 } from "./i-765";
import type { FormSpec, FormSection, Question } from "./types";

// AcroForm field-name prefixes (same PDF as the OPT spec).
const F = "form1[0].";
const P3 = `${F}Page3[0].`;

// Per-question overrides on top of the OPT spec: adjustment applicants are
// not F-1 students, so the student defaults and the SEVIS requirement drop.
const OVERRIDES: Record<string, Partial<Question>> = {
  status_at_entry: {
    default: undefined,
    helpPt: "Como você entrou (em inglês). Ex.: B-2 visitor, F-1 student.",
  },
  current_status: {
    default: undefined,
    helpPt: "Seu status atual (em inglês). Ex.: Adjustment applicant, B-2 overstay.",
  },
  sevis_number: {
    required: false,
    helpPt: "Só para quem foi estudante F/M. A maioria dos requerentes de ajuste deixa em branco.",
  },
};

function adaptSection(section: FormSection): FormSection {
  return {
    ...section,
    questions: section.questions.map((q) => (OVERRIDES[q.id] ? { ...q, ...OVERRIDES[q.id] } : q)),
  };
}

// Item 27 category boxes: (c)(9) — adjustment-of-status applicant.
const categorySection: FormSection = {
  id: "tipo",
  titlePt: "Que permissão de trabalho é esta",
  descriptionPt:
    "⚠️ Este pedido é de VOCÊ, o requerente do ajuste (quem vai receber o green card): a permissão de " +
    "trabalho (EAD) categoria (c)(9), válida enquanto seu I-485 está pendente. Protocolada junto com o " +
    "I-485, não tem taxa adicional.",
  questions: [
    {
      id: "eligibility_category",
      labelPt: "Categoria de elegibilidade",
      type: "radio",
      required: true,
      default: "c9",
      options: [{ value: "c9", labelPt: "(c)(9) — Tenho um I-485 (ajuste de status) pendente" }],
      // Item 27: three boxes → (c)(9).
      pdf: [
        { kind: "text", field: `${P3}#area[1].section_1[0]`, transform: () => "(c)" },
        { kind: "text", field: `${P3}#area[1].section_2[0]`, transform: () => "(9)" },
        { kind: "text", field: `${P3}#area[1].section_3[0]`, transform: () => "" },
      ],
    },
    // Part 1, item 1 — same checkboxes as the OPT spec.
    I765.sections[0].questions.find((q) => q.id === "reason")!,
  ],
};

export const I765AOS: FormSpec = {
  ...I765,
  id: "i-765-aos",
  namePt: "Autorização de Trabalho durante o ajuste (preenchida por quem vai receber o green card)",
  attachTo: { vistoId: "familia-ir", documentoId: "i765aos" },
  disclaimerPt:
    "Este formulário é preenchido por VOCÊ, o requerente do ajuste de status — quem vai receber o green card. " +
    "A Immigrei é uma ferramenta de preenchimento — não presta serviços jurídicos e não revisa o mérito do " +
    "seu caso. Confira cada campo e assine à mão antes de enviar ao USCIS.",
  sections: [categorySection, ...I765.sections.slice(1).map(adaptSection)],
};
