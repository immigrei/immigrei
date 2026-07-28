/**
 * EOIR-29 — Notice of Appeal to the Board of Immigration Appeals from a
 * Decision of a DHS Officer.
 *
 * Data-driven spec for the family-petition appeal (I-130/I-360 Widow(er)
 * denial). PT-BR questions the user answers; each answer maps to the exact
 * AcroForm field of the official DOJ/EOIR PDF (field names extracted from
 * the real Rev. 02/2026 asset at public/forms/eoir-29.pdf via pdf-lib —
 * never guessed; the two-widget "DHS Appeal" checkbox and the "Address" /
 * "A-Number, if any" fields were resolved by widget rectangle position
 * against the printed labels, same discipline as the I-539 spec).
 *
 * Scope (MVP): only the visa-petition appeal path (item 1, box A on the
 * real form — "I am filing an appeal from a decision of a DHS Officer
 * (e.g., Form I-130 or Form I-360 Widow(er) petition decision)"), because
 * that is the only scenario the denial-exit matrix covers
 * (content/leis/negativas/familia-negado.md). The form's other path
 * ("different type of appeal" — carrier/fine, INA 212(d)(3) waiver, bond
 * decisions) is out of scope and intentionally not built.
 *
 * "DHS Appeal" is a single AcroForm field with two widgets sharing one
 * name but different on-values ("Yes" for the visa-petition box, "No" for
 * the other-appeal-type box) — a quirk of how the government authored the
 * PDF, not a real yes/no question. Since only the visa-petition path is in
 * scope, the field is hardcoded checked via the ordinary `checkbox` mapping
 * (which uses the field's default on-value, "Yes") — no question needed.
 *
 * Per the general instructions on page 3 of the form: only the Form I-130
 * petitioner, Form I-360 Widow(er) self-petitioner, or their
 * attorney/representative signs this form — never the beneficiary. The
 * "Reasons" field (item 3) is the substantive legal argument and is
 * strictly user-authored (ministerial engine, never machine-drafted) —
 * USCIS requires it to specifically identify an erroneous conclusion of
 * law or fact in the denial, not just disagreement with the outcome.
 */

import type { FormSpec } from "./types";

function isoToUsDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

export const EOIR29: FormSpec = {
  id: "eoir-29",
  code: "EOIR-29",
  officialName: "Notice of Appeal to the Board of Immigration Appeals from a Decision of a DHS Officer",
  namePt: "Apelação da negativa da I-130 ao Board of Immigration Appeals",
  agency: "EOIR",
  officialUrl: "https://www.uscis.gov/eoir-29",
  edition: "02/2026",
  exportKind: "pdf",
  pdfAssetPath: "forms/eoir-29.pdf",
  attachTo: { vistoId: "familia-ir", documentoId: "eoir-29" },
  disclaimerPt:
    "Este formulário foi preenchido por você com as informações que você forneceu. " +
    "A Immigrei é uma ferramenta de preenchimento — não presta serviços jurídicos " +
    "e não avalia se sua apelação tem mérito. Só o peticionário (não o beneficiário) " +
    "assina este formulário — confira cada campo e assine à mão antes de enviar ao USCIS.",

  sections: [
    // ── 1. A petição negada ──────────────────────────────────────────────
    {
      id: "peticao-negada",
      titlePt: "A petição que foi negada",
      descriptionPt:
        "Este formulário cobre a apelação de negativa de I-130 (petição familiar) ou I-360 Widow(er). " +
        "Dados do beneficiário — a pessoa em favor de quem a petição foi protocolada.",
      questions: [
        {
          id: "dhs_appeal_marker",
          labelPt: "Confirmação",
          helpPt:
            "Este formulário já está configurado para apelar uma negativa de petição familiar (I-130/I-360). " +
            "Não precisa escolher nada aqui.",
          type: "radio",
          required: true,
          default: "peticao",
          options: [{ value: "peticao", labelPt: "Apelar negativa de petição familiar (I-130/I-360)" }],
          pdf: { kind: "checkbox", field: "DHS Appeal" },
        },
        {
          id: "beneficiary_name",
          labelPt: "Nome completo do beneficiário",
          helpPt: "A pessoa em favor de quem a I-130 foi protocolada — não o peticionário.",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: "DHS Name" },
        },
        {
          id: "beneficiary_a_number",
          labelPt: "Número de estrangeiro (A-Number) do beneficiário, se houver",
          helpPt: "Opcional — muitos beneficiários fora dos EUA ainda não têm um.",
          type: "text",
          pdf: { kind: "text", field: "DHS Anumber" },
        },
        {
          id: "petition_receipt_number",
          labelPt: "Número de recibo da petição (Receipt Number)",
          helpPt: "Está na carta de negativa e em qualquer notificação anterior do USCIS. Ex.: EAC1234567890.",
          type: "text",
          required: true,
          pdf: { kind: "text", field: "DHS Petition" },
        },
      ],
    },

    // ── 2. A decisão que está sendo apelada ──────────────────────────────
    {
      id: "decisao",
      titlePt: "A decisão que você está apelando",
      descriptionPt: "Esses dados estão no cabeçalho ou rodapé da carta de negativa do USCIS.",
      questions: [
        {
          id: "officer_title",
          labelPt: "Cargo de quem assinou a decisão",
          helpPt: "Ex.: Director, ou Field Office Director — está na assinatura da carta.",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: "Title of DHS Officer" },
        },
        {
          id: "office_issued",
          labelPt: "Escritório do USCIS que emitiu a decisão",
          helpPt: "Ex.: USCIS Texas Service Center, USCIS Miami Field Office.",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: "Office Where DHS Decision was Issued" },
        },
        {
          id: "decision_date",
          labelPt: "Data da decisão",
          type: "date",
          required: true,
          pdf: { kind: "text", field: "Date of DHS Decision", transform: isoToUsDate },
        },
      ],
    },

    // ── 3. Motivo da apelação ─────────────────────────────────────────────
    {
      id: "motivo",
      titlePt: "Motivo da apelação",
      descriptionPt:
        "A parte mais importante do formulário. O USCIS exige que você aponte especificamente qual foi o " +
        "erro de fato ou de direito na decisão — discordar do resultado, sem apontar o erro, pode levar ao " +
        "arquivamento sumário (summary dismissal) da apelação. Escreva em inglês; use frases completas.",
      questions: [
        {
          id: "reasons",
          labelPt: "Explique o erro de fato ou de direito na decisão",
          helpPt:
            "Ex.: quais provas o oficial ignorou, qual regra ou precedente foi aplicado incorretamente. " +
            "Se precisar de mais espaço, você pode anexar folhas extras ao protocolar — inclua seu nome e " +
            "o número de recibo em cada folha adicional.",
          type: "textarea",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: "Reasons" },
        },
      ],
    },

    // ── 4. Argumentação oral e memorial (brief) ──────────────────────────
    {
      id: "argumentacao",
      titlePt: "Argumentação oral e memorial (brief)",
      questions: [
        {
          id: "oral_argument",
          labelPt: "Você deseja argumentação oral perante o Board of Immigration Appeals?",
          helpPt: "É incomum e raramente concedida — a maioria dos casos é decidida só com base no que foi escrito.",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              yes: "Enter Yes - Oral Argument",
              no: "Enter No - Oral Argument",
            },
          },
        },
        {
          id: "separate_brief",
          labelPt: "Você pretende protocolar um memorial (brief) separado depois desta apelação?",
          helpPt:
            "Atenção: se você marcar \"Sim\" e não enviar o memorial no prazo, a apelação pode ser " +
            "arquivada sumariamente. Só marque \"Sim\" se você realmente for enviar.",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              yes: "Enter Yes - Brief",
              no: "Enter No - Brief",
            },
          },
        },
      ],
    },

    // ── 5. Quem assina (o peticionário) ───────────────────────────────────
    {
      id: "peticionario",
      titlePt: "Seus dados (peticionário)",
      descriptionPt:
        "Importante: só o peticionário da I-130 (o parente cidadão ou residente) ou seu advogado assina " +
        "este formulário — nunca o beneficiário. A assinatura você faz à mão, na versão impressa.",
      questions: [
        {
          id: "petitioner_name",
          labelPt: "Nome completo do peticionário",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: "Name" },
        },
        {
          id: "in_care_of",
          labelPt: "Aos cuidados de (In Care Of)",
          helpPt: "Opcional. Nome de quem recebe a correspondência por você, se for o caso.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: "Address" },
        },
        {
          id: "mail_street",
          labelPt: "Rua e número",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: "Street Number and Name" },
        },
        {
          id: "mail_unit",
          labelPt: "Apartamento ou unidade (se houver)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: "Apartment Number or Unit Number (if any)" },
        },
        {
          id: "mail_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: "City" },
        },
        {
          id: "mail_state",
          labelPt: "Estado (sigla de 2 letras)",
          helpPt: "Ex.: FL, MA, CA.",
          type: "text",
          required: true,
          placeholder: "FL",
          validate: { pattern: /^[A-Za-z]{2}$/, messagePt: "Use a sigla de 2 letras do estado (ex.: FL)." },
          pdf: { kind: "text", field: "State" },
        },
        {
          id: "mail_zip",
          labelPt: "ZIP Code",
          type: "text",
          required: true,
          placeholder: "33101",
          validate: { pattern: /^\d{5}(-\d{4})?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          pdf: { kind: "text", field: "Zip Code" },
        },
      ],
    },
  ],
};
