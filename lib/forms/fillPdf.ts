/**
 * fillPdf — writes a set of answers onto the official USCIS PDF.
 *
 * Loads the versioned, decrypted AcroForm asset (produced by
 * scripts/prepare-form-asset.mjs from the official source) and sets each field
 * per the FormSpec's deterministic mapping. Purely mechanical: it transcribes
 * what the user entered. It never invents values.
 *
 * The result keeps the form fields editable (not flattened) so the user can
 * still fix anything in a PDF reader before signing and submitting.
 */

import { PDFDocument, type PDFForm } from "pdf-lib";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  allQuestions,
  englishValue,
  isVisible,
  type Answers,
  type FormSpec,
  type PdfMapping,
  type Question,
} from "./types";

function applyMapping(form: PDFForm, mapping: PdfMapping, q: Question, answers: Answers) {
  const value = answers[q.id];

  switch (mapping.kind) {
    case "text": {
      const out = mapping.transform
        ? mapping.transform(value, answers)
        : englishValue(q, value);
      if (out) safe(() => form.getTextField(mapping.field).setText(out));
      break;
    }
    case "dropdown": {
      const out = englishValue(q, value).toUpperCase();
      if (out) safe(() => form.getDropdown(mapping.field).select(out));
      break;
    }
    case "checkbox": {
      const on = mapping.onWhen ? mapping.onWhen(value) : Boolean(value);
      if (on) safe(() => form.getCheckBox(mapping.field).check());
      break;
    }
    case "checkboxChoice": {
      const field = typeof value === "string" ? mapping.fieldByValue[value] : undefined;
      if (field) safe(() => form.getCheckBox(field).check());
      break;
    }
    case "dateParts": {
      const iso = typeof value === "string" ? value : "";
      const [y, m, d] = iso.split("-");
      if (y && m && d) {
        safe(() => form.getTextField(mapping.month).setText(m));
        safe(() => form.getTextField(mapping.day).setText(d));
        safe(() => form.getTextField(mapping.year).setText(y));
      }
      break;
    }
  }
}

// A single mis-typed field name must not abort the whole export — log and skip.
function safe(fn: () => void) {
  try {
    fn();
  } catch (err) {
    console.error("fillPdf field error:", err instanceof Error ? err.message : err);
  }
}

/** Fills `form`'s official PDF with `answers` and returns the PDF bytes. */
export async function fillPdf(form: FormSpec, answers: Answers): Promise<Uint8Array> {
  if (form.exportKind !== "pdf" || !form.pdfAssetPath) {
    throw new Error(`Form ${form.id} has no fillable PDF asset.`);
  }

  const assetPath = path.join(process.cwd(), "public", form.pdfAssetPath);
  const bytes = await readFile(assetPath);
  const pdf = await PDFDocument.load(bytes);
  const acro = pdf.getForm();

  for (const q of allQuestions(form)) {
    if (!q.pdf) continue;
    if (!isVisible(q, answers)) continue; // skip hidden conditional fields
    const mappings = Array.isArray(q.pdf) ? q.pdf : [q.pdf];
    for (const m of mappings) applyMapping(acro, m, q, answers);
  }

  return pdf.save();
}
