// Blindagem UPL para a copy dos formulários (mesma disciplina de
// lib/rules/messages.upl-guard.test.ts): nenhuma pergunta, ajuda, opção ou
// aviso pode conter verbo de conselho/estratégia. O preenchedor é ministerial —
// transcreve e traduz o que o usuário informa, nunca aconselha.
import { describe, expect, it } from "vitest";
import { FORMS } from "./registry";
import type { FormSpec } from "./types";
import checklists from "@/app/documentos/[vistoId]/data";

const ADVICE_TERMS = [
  "recomend",
  "aconselh",
  "sugir",
  "deveria",
  "devia",
  "melhor opç",
  "melhor caminho",
  "suas chances",
  "probabilidade de aprova",
  "vale a pena",
];

function copyStrings(form: FormSpec): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];
  const push = (where: string, text?: string) => {
    if (text) out.push({ where, text });
  };
  push(`${form.id}.namePt`, form.namePt);
  push(`${form.id}.disclaimerPt`, form.disclaimerPt);
  for (const s of form.sections) {
    push(`${form.id}.${s.id}.titlePt`, s.titlePt);
    push(`${form.id}.${s.id}.descriptionPt`, s.descriptionPt);
    for (const q of s.questions) {
      push(`${form.id}.${q.id}.labelPt`, q.labelPt);
      push(`${form.id}.${q.id}.helpPt`, q.helpPt);
      push(`${form.id}.${q.id}.validate`, q.validate?.messagePt);
      for (const o of q.options ?? []) push(`${form.id}.${q.id}.opt.${o.value}`, o.labelPt);
    }
  }
  return out;
}

describe("blindagem UPL — copy dos formulários", () => {
  for (const form of Object.values(FORMS)) {
    for (const { where, text } of copyStrings(form)) {
      for (const term of ADVICE_TERMS) {
        it(`"${where}" não contém "${term}"`, () => {
          expect(text.toLowerCase()).not.toContain(term.toLowerCase());
        });
      }
    }
  }
});

describe("cada FormSpec está bem formado", () => {
  for (const form of Object.values(FORMS)) {
    it(`${form.id} tem edição, asset e destino no cofre`, () => {
      if (form.exportKind === "pdf") {
        // Printed USCIS forms pin a real edition date and asset; online-only
        // forms (DS-160, ESTA) have neither — there's no PDF to go stale.
        expect(form.edition).toMatch(/^\d{2}\/\d{2}\/\d{2}$/);
        expect(form.pdfAssetPath).toBeTruthy();
      } else {
        expect(form.edition).toBeTruthy();
      }
      expect(form.attachTo.vistoId).toBeTruthy();
      expect(form.attachTo.documentoId).toBeTruthy();
    });

    it(`${form.id} aponta para um item de checklist que existe`, () => {
      const kit = checklists[form.attachTo.vistoId];
      expect(kit, `kit ${form.attachTo.vistoId} não existe em data.ts`).toBeTruthy();
      const ids = kit.grupos.flatMap((g) => g.documentos.map((d) => d.id));
      expect(ids).toContain(form.attachTo.documentoId);
    });
  }
});
