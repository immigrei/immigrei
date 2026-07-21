/**
 * fillWorksheet — generates a bilingual cheat-sheet PDF for online-only forms
 * (DS-160, ESTA) that have no official fillable PDF to write onto.
 *
 * Unlike fillPdf, this doesn't load a government asset: it draws a fresh
 * document from scratch, one line per question, grouped by section in the
 * same order the official online form asks them — PT-BR label on top, the
 * exact English value to type into the government site below it. The user
 * still fills the real DS-160/ESTA themselves; this is a printable reference
 * to keep open in a second tab, not a submission.
 *
 * Ministerial, like fillPdf: transcribes and translates deterministically,
 * never invents an answer.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { englishValue, isVisible, type Answers, type FormSpec, type Question } from "./types";

const PAGE_WIDTH = 612; // US Letter
const PAGE_HEIGHT = 792;
const MARGIN = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function isoToUsDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return String(value ?? "");
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

function answerText(q: Question, value: Answers[string]): string {
  if (value === null || value === undefined || value === "") return "";
  if (q.type === "date") return isoToUsDate(value);
  if (q.type === "checkbox") return value ? "Yes" : "No";
  return englishValue(q, value);
}

// Break `text` into lines no wider than `maxWidth` at the given font/size.
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

/** Generates the bilingual worksheet PDF and returns its bytes. */
export async function fillWorksheet(form: FormSpec, answers: Answers): Promise<Uint8Array> {
  if (form.exportKind !== "worksheet") {
    throw new Error(`Form ${form.id} is not a worksheet-kind form.`);
  }

  const pdf = await PDFDocument.create();
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function newPage() {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  }

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN) newPage();
  }

  function drawWrapped(text: string, font: PDFFont, size: number, color = rgb(0, 0, 0), lineGap = 4) {
    const lines = wrapText(text, font, size, CONTENT_WIDTH);
    for (const line of lines) {
      ensureSpace(size + lineGap);
      page.drawText(line, { x: MARGIN, y, size, font, color });
      y -= size + lineGap;
    }
  }

  // Cover.
  drawWrapped(form.namePt, bold, 18);
  y -= 4;
  drawWrapped(`Colinha para preencher em ${form.officialUrl}`, regular, 10, rgb(0.35, 0.35, 0.35));
  y -= 10;
  drawWrapped(form.disclaimerPt, regular, 9, rgb(0.4, 0.4, 0.4));
  y -= 16;

  for (const section of form.sections) {
    const visibleQuestions = section.questions.filter(
      (q) => isVisible(q, answers) && answerText(q, answers[q.id]) !== ""
    );
    if (visibleQuestions.length === 0) continue;

    ensureSpace(30);
    y -= 6;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
    y -= 16;
    drawWrapped(section.titlePt, bold, 12, rgb(0.06, 0.29, 0.24)); // pine

    for (const q of visibleQuestions) {
      const answer = answerText(q, answers[q.id]);
      ensureSpace(28);
      drawWrapped(q.labelPt, regular, 9, rgb(0.33, 0.38, 0.35)); // ink-soft
      drawWrapped(answer, bold, 11);
      y -= 4;
    }
  }

  return pdf.save();
}
