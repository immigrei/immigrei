/**
 * G-1145 — e-Notification of Application/Petition Acceptance.
 *
 * One-page opt-in for USCIS to text/email you when they accept your paper
 * filing. WHO FILLS THIS FORM: the applicant/petitioner — same person filing
 * the immigration form it's clipped to. It carries no eligibility questions
 * and grants no benefit by itself; it just gets you a faster heads-up than
 * waiting for the mailed I-797C receipt.
 *
 * Field names extracted from the official edition 09/26/14 asset at
 * public/forms/g-1145.pdf — a single page, five fields, no ambiguity.
 */

import type { FormSpec } from "./types";

const F = "form1[0].#subform[0].";

export const G1145: FormSpec = {
  id: "g-1145",
  code: "G-1145",
  officialName: "e-Notification of Application/Petition Acceptance",
  namePt: "Aviso por E-mail/SMS quando o USCIS Receber seu Pacote",
  agency: "USCIS",
  officialUrl: "https://www.uscis.gov/g-1145",
  edition: "09/26/14",
  exportKind: "pdf",
  pdfAssetPath: "forms/g-1145.pdf",
  attachTo: { vistoId: "familia-ir", documentoId: "g1145" },
  disclaimerPt:
    "Este formulário é opcional e é preenchido por VOCÊ, quem está protocolando o pacote — grampeie-o na " +
    "frente de qualquer formulário em papel. Ele não garante nenhum status ou benefício, só antecipa um " +
    "aviso por e-mail/SMS quando o USCIS aceitar seu pacote (o recibo oficial I-797C ainda chega pelo correio " +
    "em até 10 dias). A Immigrei é uma ferramenta de preenchimento — não presta serviços jurídicos.",

  sections: [
    {
      id: "contato",
      titlePt: "Seus dados para o aviso",
      descriptionPt:
        "Grampeie esta página na frente de CADA formulário do seu pacote — você recebe um aviso por formulário protocolado.",
      questions: [
        {
          id: "family_name",
          labelPt: "Sobrenome (como no formulário principal)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${F}LastName[0]` },
        },
        {
          id: "given_name",
          labelPt: "Nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${F}FirstName[0]` },
        },
        {
          id: "middle_name",
          labelPt: "Nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${F}MiddleName[0]` },
        },
        {
          id: "email",
          labelPt: "E-mail",
          type: "text",
          required: true,
          prefillFrom: "email",
          pdf: { kind: "text", field: `${F}Email[0]` },
        },
        {
          id: "mobile_phone",
          labelPt: "Celular (para receber por SMS — só funciona dentro dos EUA)",
          helpPt: "Fora dos EUA, você recebe só por e-mail.",
          type: "text",
          pdf: { kind: "text", field: `${F}MobilePhoneNumber[0]` },
        },
      ],
    },
  ],
};
