/**
 * I-485 — Application to Register Permanent Residence or Adjust Status.
 *
 * Data-driven spec for the green-card application filed from INSIDE the US.
 * WHO FILLS THIS FORM: the APPLICANT — the immigrant who will receive the
 * green card (in the familia-ir flow, the I-130 beneficiary adjusting status;
 * the petitioner does not sign this one). PT-BR labels keep the "quem é quem"
 * explicit, matching the I-130/I-130A/I-864 convention.
 *
 * Field names extracted from the official edition 01/20/25 asset at
 * public/forms/i-485.pdf (24 pages), disambiguated by widget position.
 * Scrambled-name quirks verified positionally:
 *   - The I-94 name fields on page 3 are `P1Line12_FamilyName`/`P1Line13_GivenName`.
 *   - `Pt5Line8_DateofBirth[1]` is the CURRENT SPOUSE's date of birth (Part 6
 *     item 6), `[2]` is the date of marriage (item 10) and `[3]` the prior
 *     spouse's date of birth — all reusing the parent-2 field name.
 *   - Part 8 biographic fields use the `Pt7Line*` prefix.
 *   - The header A-Number repeats on every page as `AlienNumber[0..23]`.
 *
 * Scope: principal applicant adjusting through a FAMILY category
 * (spouse/child/parent of a US citizen, or spouse/child of a green-card
 * holder) — Parts 1-10, INCLUDING the full Part 9 (General Eligibility and
 * Inadmissibility Grounds, items 1-86). Part 9's Yes/No fields carry
 * internally scrambled names (Pt8/Pt9 mixed, shifted numbering) and
 * per-item swapped [0]/[1] indexes; every single item was mapped by widget
 * position (items are strictly sequential top-to-bottom per page: page 14 =
 * items 10-22, page 15 = 23-37, page 16 = 38-45, page 17 = 46-55, page 19 =
 * 56-64, page 20 = 65-75, page 21 = 76-86) and Yes/No sides were resolved by
 * x-coordinate (Yes ≈ x498, No ≈ x540). The item-65/66 detail tables stay
 * manual (only relevant after a "Yes" on 63/64). The engine remains
 * ministerial: it transcribes, never decides eligibility. Signature,
 * interpreter and preparer blocks stay blank.
 */

import type { FormSpec, PdfMapping, Question } from "./types";

// AcroForm subform prefixes (#subform[N] is page N+1; page 20 is skipped —
// subform indexes jump from [18] (page 19) to [20] (page 20)).
const F = "form1[0].";
const S0 = `${F}#subform[0].`;
const S1 = `${F}#subform[1].`;
const S2 = `${F}#subform[2].`;
const S3 = `${F}#subform[3].`;
const S4 = `${F}#subform[4].`;
const S7 = `${F}#subform[7].`;
const S8 = `${F}#subform[8].`;
const S9 = `${F}#subform[9].`;
const S10 = `${F}#subform[10].`;
const S11 = `${F}#subform[11].`;
const S12 = `${F}#subform[12].`;
const S13 = `${F}#subform[13].`;
const S14 = `${F}#subform[14].`;
const S15 = `${F}#subform[15].`;
const S16 = `${F}#subform[16].`;
const S18 = `${F}#subform[18].`;
const S20 = `${F}#subform[20].`;
const S21 = `${F}#subform[21].`;
const S22 = `${F}#subform[22].`;

// ISO yyyy-mm-dd (how we store dates) -> USCIS mm/dd/yyyy text.
function isoToUsDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

// The page-header A-Number repeats on all 24 pages as AlienNumber[0..23],
// spread across subforms 0-18 and 20-24 (indexes follow page order).
const HEADER_SUBFORMS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24];
const headerANumberMappings: PdfMapping[] = HEADER_SUBFORMS.map((sub, i) => ({
  kind: "text",
  field: `${F}#subform[${sub}].AlienNumber[${i}]`,
}));

// One Part 9 Yes/No item. `yes`/`no` are the exact checkbox fields — their
// [0]/[1] indexes vary PER ITEM on this PDF (verified one by one against the
// widget x-coordinates: Yes boxes sit at x≈498, No boxes at x≈540). Never
// assume [0]=Yes. No defaults on purpose: the applicant must actively answer.
function p9(
  id: string,
  labelPt: string,
  yes: string,
  no: string,
  opts: { helpPt?: string; showWhen?: Question["showWhen"]; required?: boolean } = {}
): Question {
  return {
    id,
    labelPt,
    helpPt: opts.helpPt,
    type: "radio",
    required: opts.required ?? true,
    showWhen: opts.showWhen,
    options: [
      { value: "no", labelPt: "Não" },
      { value: "yes", labelPt: "Sim" },
    ],
    pdf: { kind: "checkboxChoice", fieldByValue: { yes, no } },
  };
}

export const I485: FormSpec = {
  id: "i-485",
  code: "I-485",
  officialName: "Application to Register Permanent Residence or Adjust Status",
  namePt: "Ajuste de Status (preenchido por quem vai receber o green card)",
  agency: "USCIS",
  officialUrl: "https://www.uscis.gov/i-485",
  edition: "01/20/25",
  exportKind: "pdf",
  pdfAssetPath: "forms/i-485.pdf",
  attachTo: { vistoId: "familia-ir", documentoId: "i485" },
  disclaimerPt:
    "Este formulário é preenchido e assinado por VOCÊ, o requerente — quem vai receber o green card " +
    "(nas petições de família, o beneficiário do I-130 que está dentro dos EUA). A Immigrei é uma " +
    "ferramenta de preenchimento — não presta serviços jurídicos e não revisa o mérito do seu caso. " +
    "Nas perguntas de elegibilidade (Parte 9), responda com total sinceridade; qualquer \"Sim\" merece " +
    "orientação profissional antes do protocolo. Confira cada campo e assine à mão antes de enviar ao USCIS.",

  sections: [
    // ── 1. Quem preenche + identificação (Part 1, itens 1–9) ────────────────
    {
      id: "identificacao",
      titlePt: "Quem preenche este formulário",
      descriptionPt:
        "⚠️ O I-485 é preenchido por VOCÊ, o REQUERENTE — quem VAI RECEBER o green card, estando dentro " +
        "dos EUA. Na petição de família, é o beneficiário do I-130 (o parente cidadão/residente NÃO " +
        "preenche este). Todas as perguntas a seguir são sobre você.",
      questions: [
        {
          id: "a_number",
          labelPt: "Seu A-Number (se tiver)",
          helpPt: "Aparece em notificações do USCIS. Sem processos anteriores, você provavelmente não tem — deixe em branco.",
          type: "text",
          pdf: [...headerANumberMappings, { kind: "text", field: `${S1}Pt1Line4_AlienNumber[0]` }],
        },
        {
          id: "has_a_number",
          labelPt: "Você tem um A-Number?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S1}Pt1Line4_YN[0]`, no: `${S1}Pt1Line4_YN[1]` },
          },
        },
        {
          id: "other_a_number",
          labelPt: "Já usou ou recebeu OUTRO A-Number?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S1}Pt1Line5_YN[0]`, no: `${S1}Pt1Line5_YN[1]` },
          },
        },
        {
          id: "family_name",
          labelPt: "Seu sobrenome legal atual (sem apelidos)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: [
            { kind: "text", field: `${S0}Pt1Line1_FamilyName[0]` },
            { kind: "text", field: `${F}#subform[24].Pt1Line1_FamilyName[1]` },
          ],
        },
        {
          id: "given_name",
          labelPt: "Seu nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: [
            { kind: "text", field: `${S0}Pt1Line1_GivenName[0]` },
            { kind: "text", field: `${F}#subform[24].Pt1Line1_GivenName[1]` },
          ],
        },
        {
          id: "middle_name",
          labelPt: "Seu nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Pt1Line1_MiddleName[0]` },
        },
        {
          id: "other_family_name",
          labelPt: "Outros nomes que você já usou — sobrenome (nome de solteira, aliases)",
          helpPt: "Em branco se nunca usou outro nome.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Pt1Line2_FamilyName[0]` },
        },
        {
          id: "other_given_name",
          labelPt: "Outros nomes — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Pt1Line2_GivenName[0]` },
        },
        {
          id: "dob",
          labelPt: "Sua data de nascimento",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S0}Pt1Line3_DOB[0]`, transform: isoToUsDate },
        },
        {
          id: "other_dob",
          labelPt: "Já usou outra data de nascimento?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S0}Pt1Line3_YN[0]`, no: `${S0}Pt1Line3_YN[1]` },
          },
        },
        {
          id: "sex",
          labelPt: "Sexo (como nos seus documentos)",
          type: "radio",
          required: true,
          options: [
            { value: "male", labelPt: "Masculino" },
            { value: "female", labelPt: "Feminino" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { female: `${S1}Pt1Line6_CB_Sex[0]`, male: `${S1}Pt1Line6_CB_Sex[1]` },
          },
        },
        {
          id: "birth_city",
          labelPt: "Sua cidade de nascimento",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt1Line7_CityTownOfBirth[0]` },
        },
        {
          id: "birth_country",
          labelPt: "Seu país de nascimento (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S1}Pt1Line7_CountryOfBirth[0]` },
        },
        {
          id: "citizenship_country",
          labelPt: "Seu país de cidadania (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S1}Pt1Line8_CountryofCitizenshipNationality[0]` },
        },
        {
          id: "uscis_account",
          labelPt: "Sua conta online do USCIS (se tiver)",
          type: "text",
          pdf: { kind: "text", field: `${S1}Pt1Line9_USCISAccountNumber[0]` },
        },
      ],
    },

    // ── 2. Última entrada nos EUA (Part 1, itens 10–17) ─────────────────────
    {
      id: "entrada",
      titlePt: "Sua última entrada nos EUA",
      questions: [
        {
          id: "passport_number",
          labelPt: "Passaporte usado na última entrada — número",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt1Line10_PassportNum[0]` },
        },
        {
          id: "passport_expiry",
          labelPt: "Validade desse passaporte",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S1}Pt1Line10_ExpDate[0]`, transform: isoToUsDate },
        },
        {
          id: "passport_country",
          labelPt: "País que emitiu o passaporte (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S1}Pt1Line10_Passport[0]` },
        },
        {
          id: "visa_number",
          labelPt: "Número do visto usado na última entrada (se houver)",
          helpPt: "O número vermelho no canto do visto no passaporte.",
          type: "text",
          pdf: { kind: "text", field: `${S1}Pt1Line10_VisaNum[0]` },
        },
        {
          id: "visa_issued_date",
          labelPt: "Data de emissão desse visto",
          type: "date",
          pdf: { kind: "text", field: `${S1}Pt1Line10_NonImmDate[0]`, transform: isoToUsDate },
        },
        {
          id: "arrival_city",
          labelPt: "Cidade da última entrada",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt1Line10_CityTown[0]` },
        },
        {
          id: "arrival_state",
          labelPt: "Estado da entrada (sigla de 2 letras)",
          type: "text",
          validate: { pattern: /^([A-Za-z]{2})?$/, messagePt: "Use a sigla de 2 letras (ex.: FL)." },
          pdf: { kind: "dropdown", field: `${S1}Pt1Line10_State[0]` },
        },
        {
          id: "arrival_date",
          labelPt: "Data da última entrada",
          type: "date",
          required: true,
          prefillFrom: "arrival_date",
          pdf: { kind: "text", field: `${S1}Pt1Line10_DateofArrival[0]`, transform: isoToUsDate },
        },
        {
          id: "entry_manner",
          labelPt: "Na última entrada, você:",
          type: "radio",
          required: true,
          options: [
            { value: "admitted", labelPt: "Foi inspecionado e ADMITIDO (com visto: turista, estudante, etc.)" },
            { value: "paroled", labelPt: "Foi inspecionado e recebeu PAROLE" },
            { value: "ewi", labelPt: "Entrou sem inspeção (sem admissão nem parole)" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              admitted: `${S1}Pt2Line11_CB[0]`,
              paroled: `${S1}Pt2Line11_CB[1]`,
              ewi: `${S1}Pt2Line11_CB[2]`,
            },
          },
        },
        {
          id: "admitted_as",
          labelPt: "Admitido como (em inglês, ex.: B-2 visitor, F-1 student)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "entry_manner", equals: "admitted" },
          pdf: { kind: "text", field: `${S1}Pt1Line11_Admitted[0]` },
        },
        {
          id: "i94_family_name",
          labelPt: "Sobrenome como está no I-94",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P1Line12_FamilyName[0]` },
        },
        {
          id: "i94_given_name",
          labelPt: "Nome como está no I-94",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P1Line13_GivenName[0]` },
        },
        {
          id: "i94_number",
          labelPt: "Número do I-94 (11 dígitos)",
          helpPt: "Em i94.cbp.dhs.gov.",
          type: "text",
          pdf: { kind: "text", field: `${S2}P1Line12_I94[0]` },
        },
        {
          id: "i94_expiry",
          labelPt: "Validade da estadia no I-94 (data mm/dd/yyyy ou D/S)",
          type: "text",
          pdf: { kind: "text", field: `${S2}Pt1Line12_Date[0]` },
        },
        {
          id: "i94_status",
          labelPt: "Status no I-94 (em inglês, ex.: B2, F1)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt1Line12_Status[0]` },
        },
        {
          id: "first_time_in_us",
          labelPt: "Essa última chegada foi a primeira vez que você esteve nos EUA?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", labelPt: "Sim" },
            { value: "no", labelPt: "Não" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S2}Pt1Line13_YN[0]`, no: `${S2}Pt1Line13_YN[1]` },
          },
        },
        {
          id: "current_status",
          labelPt: "Seu status atual (se mudou desde a chegada; em inglês)",
          helpPt: "Ex.: F-1 student, B-2 overstay. Em branco se não mudou.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt1Line14_Status[0]` },
        },
        {
          id: "current_status_expiry",
          labelPt: "Validade do status atual (data mm/dd/yyyy ou D/S)",
          type: "text",
          pdf: { kind: "text", field: `${S2}Pt1Line15_Date[0]` },
        },
        {
          id: "crewman_visa",
          labelPt: "Já recebeu visto de tripulante (\"alien crewman\")?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S2}Pt1Line16_YN[0]`, no: `${S2}Pt1Line16_YN[1]` },
          },
        },
        {
          id: "arrived_as_crewman",
          labelPt: "Sua última chegada foi para trabalhar em navio ou aeronave (tripulação)?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S2}Pt1Line17_YN[0]`, no: `${S2}Pt1Line17_YN[1]` },
          },
        },
      ],
    },

    // ── 3. Endereços (Part 1, item 18) ──────────────────────────────────────
    {
      id: "enderecos",
      titlePt: "Seus endereços",
      questions: [
        {
          id: "us_in_care_of",
          labelPt: "Aos cuidados de (In Care Of) — opcional",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Part1_Item18_InCareOfName[0]` },
        },
        {
          id: "us_street",
          labelPt: "Endereço físico atual nos EUA — rua e número",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt1Line18_StreetNumberName[0]` },
        },
        {
          id: "us_unit_type",
          labelPt: "Tipo de complemento",
          helpPt: "Opcional. Apt. = apartamento, Ste. = sala, Flr. = andar.",
          type: "radio",
          options: [
            { value: "apt", labelPt: "Apt." },
            { value: "ste", labelPt: "Ste." },
            { value: "flr", labelPt: "Flr." },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              apt: `${S2}Pt1Line18US_Unit[2]`,
              ste: `${S2}Pt1Line18US_Unit[1]`,
              flr: `${S2}Pt1Line18US_Unit[0]`,
            },
          },
        },
        {
          id: "us_unit_number",
          labelPt: "Número do complemento",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt1Line18US_AptSteFlrNumber[0]` },
        },
        {
          id: "us_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt1Line18_CityOrTown[0]` },
        },
        {
          id: "us_state",
          labelPt: "Estado (sigla de 2 letras)",
          type: "text",
          required: true,
          placeholder: "FL",
          validate: { pattern: /^[A-Za-z]{2}$/, messagePt: "Use a sigla de 2 letras do estado (ex.: FL)." },
          pdf: { kind: "dropdown", field: `${S2}Pt1Line18_State[0]` },
        },
        {
          id: "us_zip",
          labelPt: "ZIP Code",
          type: "text",
          required: true,
          validate: { pattern: /^\d{5}(-\d{4})?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          pdf: { kind: "text", field: `${S2}Pt1Line18_ZipCode[0]` },
        },
        {
          id: "us_since",
          labelPt: "Morando nesse endereço desde",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S2}Pt1Line18_Date[0]`, transform: isoToUsDate },
        },
        {
          id: "mail_same",
          labelPt: "Esse é também seu endereço de correspondência?",
          type: "radio",
          required: true,
          default: "yes",
          options: [
            { value: "yes", labelPt: "Sim" },
            { value: "no", labelPt: "Não" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S2}Pt1Line18_YN[0]`, no: `${S2}Pt1Line18_YN[1]` },
          },
        },
        {
          id: "mail_street",
          labelPt: "Endereço de correspondência — rua e número",
          type: "text",
          required: true,
          passthroughEn: true,
          showWhen: { questionId: "mail_same", equals: "no" },
          pdf: { kind: "text", field: `${S2}Pt1Line18_CurrentStreetNumberName[0]` },
        },
        {
          id: "mail_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          showWhen: { questionId: "mail_same", equals: "no" },
          pdf: { kind: "text", field: `${S2}Pt1Line18_CurrentCityOrTown[0]` },
        },
        {
          id: "mail_state",
          labelPt: "Estado (sigla)",
          type: "text",
          required: true,
          validate: { pattern: /^[A-Za-z]{2}$/, messagePt: "Use a sigla de 2 letras (ex.: FL)." },
          showWhen: { questionId: "mail_same", equals: "no" },
          pdf: { kind: "dropdown", field: `${S2}Pt1Line18_CurrentState[0]` },
        },
        {
          id: "mail_zip",
          labelPt: "ZIP Code",
          type: "text",
          required: true,
          validate: { pattern: /^\d{5}(-\d{4})?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          showWhen: { questionId: "mail_same", equals: "no" },
          pdf: { kind: "text", field: `${S2}Pt1Line18_CurrentZipCode[0]` },
        },
        {
          id: "five_years_same_address",
          labelPt: "Você mora no endereço atual há pelo menos 5 anos?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", labelPt: "Sim" },
            { value: "no", labelPt: "Não" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S3}Pt1Line18_last5yrs_YN[0]`, no: `${S3}Pt1Line18_last5yrs_YN[1]` },
          },
        },
        {
          id: "prior_street",
          labelPt: "Endereço anterior (últimos 5 anos) — rua e número",
          helpPt: "Mais endereços: adicione à mão na Parte 14.",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "five_years_same_address", equals: "no" },
          pdf: { kind: "text", field: `${S3}Pt1Line18_PriorStreetName[0]` },
        },
        {
          id: "prior_city",
          labelPt: "Cidade",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "five_years_same_address", equals: "no" },
          pdf: { kind: "text", field: `${S3}Pt1Line18_PriorCity[0]` },
        },
        {
          id: "prior_state",
          labelPt: "Estado americano (sigla — em branco se fora dos EUA)",
          type: "text",
          validate: { pattern: /^([A-Za-z]{2})?$/, messagePt: "Use a sigla de 2 letras (ex.: FL)." },
          showWhen: { questionId: "five_years_same_address", equals: "no" },
          pdf: { kind: "dropdown", field: `${S3}Pt1Line18_PriorState[0]` },
        },
        {
          id: "prior_zip",
          labelPt: "ZIP Code (EUA)",
          type: "text",
          validate: { pattern: /^(\d{5}(-\d{4})?)?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          showWhen: { questionId: "five_years_same_address", equals: "no" },
          pdf: { kind: "text", field: `${S3}Pt1Line18_PriorZipCode[0]` },
        },
        {
          id: "prior_province",
          labelPt: "Estado/Província (fora dos EUA)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "five_years_same_address", equals: "no" },
          pdf: { kind: "text", field: `${S3}Pt1Line18_PriorProvince[0]` },
        },
        {
          id: "prior_postal",
          labelPt: "CEP / Postal Code",
          type: "text",
          showWhen: { questionId: "five_years_same_address", equals: "no" },
          pdf: { kind: "text", field: `${S3}Pt1Line18_PriorPostalCode[0]` },
        },
        {
          id: "prior_country",
          labelPt: "País (em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "five_years_same_address", equals: "no" },
          pdf: { kind: "text", field: `${S3}Pt1Line18_PriorCountry[0]` },
        },
        {
          id: "prior_from",
          labelPt: "Morou aí de",
          type: "date",
          showWhen: { questionId: "five_years_same_address", equals: "no" },
          pdf: { kind: "text", field: `${S3}Pt1Line18_PriorDateFrom[0]`, transform: isoToUsDate },
        },
        {
          id: "prior_to",
          labelPt: "até",
          type: "date",
          showWhen: { questionId: "five_years_same_address", equals: "no" },
          pdf: { kind: "text", field: `${S3}Pt1Line18PriorDateTo[0]`, transform: isoToUsDate },
        },
        {
          id: "abroad_street",
          labelPt: "Último endereço FORA dos EUA onde morou 1+ ano — rua e número",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S3}Pt1Line18_RecentStreetName[0]` },
        },
        {
          id: "abroad_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S3}Pt1Line18_RecentCity[0]` },
        },
        {
          id: "abroad_province",
          labelPt: "Estado/Província",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S3}Pt1Line18_RecentProvince[0]` },
        },
        {
          id: "abroad_postal",
          labelPt: "CEP / Postal Code",
          type: "text",
          pdf: { kind: "text", field: `${S3}Pt1Line18_RecentPostalCode[0]` },
        },
        {
          id: "abroad_country",
          labelPt: "País (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S3}Pt1Line18_RecentCountry[0]` },
        },
        {
          id: "abroad_from",
          labelPt: "Morou aí de",
          type: "date",
          pdf: { kind: "text", field: `${S3}Pt1Line18_RecentDateFrom[0]`, transform: isoToUsDate },
        },
        {
          id: "abroad_to",
          labelPt: "até",
          type: "date",
          pdf: { kind: "text", field: `${S3}Pt1Line18_RecentDateTo[0]`, transform: isoToUsDate },
        },
      ],
    },

    // ── 4. Social Security (Part 1, item 19) ────────────────────────────────
    {
      id: "ssn",
      titlePt: "Social Security",
      questions: [
        {
          id: "has_ssn_card",
          labelPt: "A Social Security Administration já emitiu um cartão para você?",
          type: "radio",
          required: true,
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S3}Pt1Line19_YN[0]`, yes: `${S3}Pt1Line19_YN[1]` },
          },
        },
        {
          id: "ssn_number",
          labelPt: "Seu SSN",
          type: "text",
          showWhen: { questionId: "has_ssn_card", equals: "yes" },
          validate: { pattern: /^\d{9}$/, messagePt: "Digite os 9 dígitos do SSN, sem traços." },
          pdf: { kind: "text", field: `${S3}Pt1Line19_SSN[0]` },
        },
        {
          id: "want_ssn_card",
          labelPt: "Quer que a SSA emita um cartão de Social Security para você?",
          type: "radio",
          required: true,
          default: "yes",
          options: [
            { value: "yes", labelPt: "Sim" },
            { value: "no", labelPt: "Não" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S3}Pt1Line19_SSA_YN[0]`, no: `${S3}Pt1Line19_SSA_YN[1]` },
          },
        },
        {
          id: "ssa_consent",
          labelPt: "Autoriza o compartilhamento dos seus dados com a SSA para emitir o cartão?",
          helpPt: "Se pediu o cartão acima, a resposta precisa ser Sim.",
          type: "radio",
          required: true,
          default: "yes",
          options: [
            { value: "yes", labelPt: "Sim" },
            { value: "no", labelPt: "Não" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S3}Pt1Line19_Consent_YN[0]`, no: `${S3}Pt1Line19_Consent_YN[1]` },
          },
        },
      ],
    },

    // ── 5. Categoria do pedido (Part 2) ─────────────────────────────────────
    {
      id: "categoria",
      titlePt: "Categoria do seu pedido",
      descriptionPt: "No fluxo da família, a categoria vem da petição I-130 protocolada pelo seu parente.",
      questions: [
        {
          id: "in_removal",
          labelPt: "Você está pedindo o ajuste dentro de um processo de remoção (na corte de imigração/EOIR)?",
          helpPt: "Se sim, este caminho exige advogado — não protocole por conta própria.",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S4}Pt2Line1_YN[0]`, no: `${S4}Pt2Line1_YN[1]` },
          },
        },
        {
          id: "receipt_number",
          labelPt: "Número de recibo da petição I-130 (se já protocolada)",
          helpPt: "Ex.: IOE0123456789 ou MSC2190012345. Se protocolar o I-130 junto, deixe em branco.",
          type: "text",
          pdf: { kind: "text", field: `${S4}Pt2Line2_Receipt[0]` },
        },
        {
          id: "priority_date",
          labelPt: "Priority date da petição (se houver)",
          helpPt: "Parentes imediatos de cidadão não dependem de fila — pode deixar em branco.",
          type: "date",
          pdf: { kind: "text", field: `${S4}Pt2Line2_Date[0]`, transform: isoToUsDate },
        },
        {
          id: "applicant_type",
          labelPt: "Você é o requerente principal?",
          type: "radio",
          required: true,
          default: "principal",
          options: [
            { value: "principal", labelPt: "Sim, sou o requerente principal" },
            { value: "derivative", labelPt: "Não, sou derivado (dependente do requerente principal)" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              principal: `${S4}Pt2Line2_CB[0]`,
              derivative: `${S4}Pt2Line2_CB[1]`,
            },
          },
        },
        {
          id: "category",
          labelPt: "Sua categoria de ajuste (família)",
          type: "radio",
          required: true,
          options: [
            { value: "spouse_usc", labelPt: "Cônjuge de cidadão americano" },
            { value: "child_usc", labelPt: "Filho(a) solteiro(a) menor de 21 de cidadão" },
            { value: "parent_usc", labelPt: "Pai/mãe de cidadão (cidadão com 21+)" },
            { value: "spouse_lpr", labelPt: "Cônjuge de residente permanente (green card)" },
            { value: "child_lpr", labelPt: "Filho(a) solteiro(a) menor de 21 de residente" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              spouse_usc: `${S4}Pt2Line3a_CB[0]`,
              child_usc: `${S4}Pt2Line3a_CB[1]`,
              parent_usc: `${S4}Pt2Line3a_CB[2]`,
              spouse_lpr: `${S4}Pt2Line3a_CB[9]`,
              child_lpr: `${S4}Pt2Line3a_CB[10]`,
            },
          },
        },
      ],
    },

    // ── 6. Histórico consular + emprego (Part 4) ────────────────────────────
    {
      id: "historico",
      titlePt: "Histórico de pedidos e trabalho",
      questions: [
        {
          id: "prior_visa_abroad",
          labelPt: "Já pediu visto de imigrante em consulado americano no exterior?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S7}Pt4Line1_YN[0]`, yes: `${S7}Pt4Line1_YN[1]` },
          },
        },
        {
          id: "prior_permanent_residence",
          labelPt: "Já pediu residência permanente estando dentro dos EUA?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S7}Pt4Line5_YN[0]`, yes: `${S7}Pt4Line5_YN[1]` },
          },
        },
        {
          id: "lpr_rescinded",
          labelPt: "Já teve green card que foi rescindido (INA 246)?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S7}Pt4Line6_YN[0]`, yes: `${S7}Pt4Line6_YN[1]` },
          },
        },
        {
          id: "employer1_name",
          labelPt: "Empregador ou escola atual (ou mais recente)",
          helpPt: "Desempregado(a): escreva Unemployed e informe a fonte de sustento no campo de ocupação.",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S7}Pt4Line7_EmployerName[0]` },
        },
        {
          id: "employer1_occupation",
          labelPt: "Sua ocupação",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S7}Pt4Line7_EmployerName[2]` },
        },
        {
          id: "employer1_street",
          labelPt: "Endereço do empregador/escola — rua e número",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S8}Part4Line7_StreetName[0]` },
        },
        {
          id: "employer1_city",
          labelPt: "Cidade",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S8}P4Line7_City[0]` },
        },
        {
          id: "employer1_state",
          labelPt: "Estado americano (sigla — em branco se fora dos EUA)",
          type: "text",
          validate: { pattern: /^([A-Za-z]{2})?$/, messagePt: "Use a sigla de 2 letras (ex.: FL)." },
          pdf: { kind: "dropdown", field: `${S8}P4Line7_State[0]` },
        },
        {
          id: "employer1_zip",
          labelPt: "ZIP Code (EUA)",
          type: "text",
          validate: { pattern: /^(\d{5}(-\d{4})?)?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          pdf: { kind: "text", field: `${S8}P4Line7_ZipCode[0]` },
        },
        {
          id: "employer1_country",
          labelPt: "País (em inglês)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S8}P4Line7_Country[0]` },
        },
        {
          id: "employer1_from",
          labelPt: "Desde",
          type: "date",
          pdf: { kind: "text", field: `${S8}Pt4Line7_DateFrom[0]`, transform: isoToUsDate },
        },
        {
          id: "employer2_name",
          labelPt: "Empregador/escola mais recente FORA dos EUA (se não listado acima)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S8}Pt4Line8_EmployerName[0]` },
        },
        {
          id: "employer2_occupation",
          labelPt: "Ocupação lá",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S8}Pt4Line8_Occupation[0]` },
        },
        {
          id: "employer2_from",
          labelPt: "De",
          type: "date",
          pdf: { kind: "text", field: `${S8}Pt4Line8_DateFrom[0]`, transform: isoToUsDate },
        },
        {
          id: "employer2_to",
          labelPt: "até",
          type: "date",
          pdf: { kind: "text", field: `${S8}Pt4Line8_DateTo[0]`, transform: isoToUsDate },
        },
      ],
    },

    // ── 7. Seus pais (Part 5) ───────────────────────────────────────────────
    {
      id: "pais",
      titlePt: "Seus pais",
      questions: [
        {
          id: "parent1_family",
          labelPt: "Pai/Mãe 1 — sobrenome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S8}Pt5Line1_FamilyName[0]` },
        },
        {
          id: "parent1_given",
          labelPt: "Pai/Mãe 1 — nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S8}Pt5Line1_GivenName[0]` },
        },
        {
          id: "parent1_birth_family",
          labelPt: "Pai/Mãe 1 — sobrenome de nascimento (se diferente)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S8}Pt5Line2_FamilyName[0]` },
        },
        {
          id: "parent1_dob",
          labelPt: "Pai/Mãe 1 — data de nascimento",
          type: "date",
          pdf: { kind: "text", field: `${S8}Pt5Line3_DateofBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "parent1_birth_city",
          labelPt: "Pai/Mãe 1 — cidade de nascimento",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S9}Pt5Line5_CityTownOfBirth[0]` },
        },
        {
          id: "parent2_family",
          labelPt: "Pai/Mãe 2 — sobrenome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S9}Pt5Line6_FamilyName[0]` },
        },
        {
          id: "parent2_given",
          labelPt: "Pai/Mãe 2 — nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S9}Pt5Line6_GivenName[0]` },
        },
        {
          id: "parent2_birth_family",
          labelPt: "Pai/Mãe 2 — sobrenome de nascimento (se diferente)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S9}Pt5Line7_FamilyName[0]` },
        },
        {
          id: "parent2_dob",
          labelPt: "Pai/Mãe 2 — data de nascimento",
          type: "date",
          pdf: { kind: "text", field: `${S9}Pt5Line8_DateofBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "parent2_birth_city",
          labelPt: "Pai/Mãe 2 — cidade de nascimento",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S9}Pt5Line10_CityTownOfBirth[0]` },
        },
      ],
    },

    // ── 8. Estado civil (Part 6) ────────────────────────────────────────────
    {
      id: "civil",
      titlePt: "Seu estado civil",
      questions: [
        {
          id: "marital_status",
          labelPt: "Estado civil atual",
          type: "radio",
          required: true,
          options: [
            { value: "single", labelPt: "Solteiro(a), nunca casou" },
            { value: "married", labelPt: "Casado(a)" },
            { value: "divorced", labelPt: "Divorciado(a)" },
            { value: "widowed", labelPt: "Viúvo(a)" },
            { value: "annulled", labelPt: "Casamento anulado" },
            { value: "separated", labelPt: "Legalmente separado(a)" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              divorced: `${S9}Pt6Line1_MaritalStatus[0]`,
              single: `${S9}Pt6Line1_MaritalStatus[1]`,
              widowed: `${S9}Pt6Line1_MaritalStatus[2]`,
              married: `${S9}Pt6Line1_MaritalStatus[3]`,
              annulled: `${S9}Pt6Line1_MaritalStatus[4]`,
              separated: `${S9}Pt6Line1_MaritalStatus[5]`,
            },
          },
        },
        {
          id: "spouse_military",
          labelPt: "Se casado(a): seu cônjuge é militar da ativa dos EUA?",
          type: "radio",
          options: [
            { value: "na", labelPt: "Não se aplica (não sou casado)" },
            { value: "yes", labelPt: "Sim" },
            { value: "no", labelPt: "Não" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              no: `${S9}Pt5Line2_YNNA[0]`,
              yes: `${S9}Pt5Line2_YNNA[1]`,
              na: `${S9}Pt5Line2_YNNA[2]`,
            },
          },
        },
        {
          id: "times_married",
          labelPt: "Quantas vezes você já se casou (contando o casamento atual)?",
          type: "number",
          required: true,
          pdf: { kind: "text", field: `${S9}Pt6Line3_TimesMarried[0]` },
        },
        {
          id: "spouse_family_name",
          labelPt: "Cônjuge atual — sobrenome",
          helpPt: "Na petição de cônjuge, é o seu peticionário.",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "marital_status", equals: "married" },
          pdf: { kind: "text", field: `${S9}Pt6Line4_FamilyName[0]` },
        },
        {
          id: "spouse_given_name",
          labelPt: "Cônjuge atual — nome",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "marital_status", equals: "married" },
          pdf: { kind: "text", field: `${S9}Pt6Line4_GivenName[0]` },
        },
        {
          id: "spouse_a_number",
          labelPt: "A-Number do cônjuge (se tiver)",
          type: "text",
          showWhen: { questionId: "marital_status", equals: "married" },
          pdf: { kind: "text", field: `${S9}Pt6Line5_AlienNumber[0]` },
        },
        {
          id: "spouse_dob",
          labelPt: "Data de nascimento do cônjuge",
          type: "date",
          showWhen: { questionId: "marital_status", equals: "married" },
          pdf: { kind: "text", field: `${S9}Pt5Line8_DateofBirth[1]`, transform: isoToUsDate },
        },
        {
          id: "spouse_birth_country",
          labelPt: "País de nascimento do cônjuge (em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "marital_status", equals: "married" },
          pdf: { kind: "text", field: `${S9}Pt6Line7_Country[0]` },
        },
        {
          id: "marriage_city",
          labelPt: "Cidade do casamento",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "marital_status", equals: "married" },
          pdf: { kind: "text", field: `${S10}Pt6Line10_CityTownOfBirth[0]` },
        },
        {
          id: "marriage_state_province",
          labelPt: "Estado/Província do casamento",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "marital_status", equals: "married" },
          pdf: { kind: "text", field: `${S10}Pt6Line10_State[0]` },
        },
        {
          id: "marriage_country",
          labelPt: "País do casamento (em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "marital_status", equals: "married" },
          pdf: { kind: "text", field: `${S10}Pt6Line10_Country[0]` },
        },
        {
          id: "marriage_date",
          labelPt: "Data do casamento atual",
          type: "date",
          showWhen: { questionId: "marital_status", equals: "married" },
          pdf: { kind: "text", field: `${S10}Pt5Line8_DateofBirth[2]`, transform: isoToUsDate },
        },
        {
          id: "spouse_applying_too",
          labelPt: "Seu cônjuge também está pedindo o ajuste junto com você?",
          type: "radio",
          showWhen: { questionId: "marital_status", equals: "married" },
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S10}Pt6Line11_YN[0]`, yes: `${S10}Pt6Line11_YN[1]` },
          },
        },
        {
          id: "prior_spouse_family",
          labelPt: "Cônjuge anterior (se houver) — sobrenome de solteiro(a)",
          helpPt: "Em branco se não houver. Mais de um: adicione à mão na Parte 14.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S10}Pt6Line12_FamilyName[0]` },
        },
        {
          id: "prior_spouse_given",
          labelPt: "Cônjuge anterior — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S10}Pt6Line12_GivenName[0]` },
        },
        {
          id: "prior_marriage_end_date",
          labelPt: "Data em que o casamento anterior terminou legalmente",
          type: "date",
          pdf: { kind: "text", field: `${S10}Pt6Line16_DateofBirth[1]`, transform: isoToUsDate },
        },
        {
          id: "prior_marriage_how_ended",
          labelPt: "Como terminou",
          type: "radio",
          options: [
            { value: "divorced", labelPt: "Divórcio" },
            { value: "deceased", labelPt: "Falecimento do cônjuge" },
            { value: "annulled", labelPt: "Anulação" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              deceased: `${S10}Pt6Line19_MaritalStatus[0]`,
              annulled: `${S10}Pt6Line19_MaritalStatus[1]`,
              divorced: `${S10}Pt6Line19_MaritalStatus[3]`,
            },
          },
        },
      ],
    },

    // ── 9. Filhos (Part 7) ──────────────────────────────────────────────────
    {
      id: "filhos",
      titlePt: "Seus filhos",
      descriptionPt:
        "Conte TODOS os filhos vivos (biológicos, adotivos e enteados, de qualquer idade, em qualquer país). Mais de 2: adicione à mão na Parte 14.",
      questions: [
        {
          id: "total_children",
          labelPt: "Número total de filhos vivos (0 se nenhum)",
          type: "number",
          required: true,
          default: 0,
          pdf: { kind: "text", field: `${S11}Pt6Line1_TotalChildren[0]` },
        },
        {
          id: "child1_family",
          labelPt: "Filho(a) 1 — sobrenome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S11}Pt7Line2_FamilyName[0]` },
        },
        {
          id: "child1_given",
          labelPt: "Filho(a) 1 — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S11}Pt7Line2_GivenName[0]` },
        },
        {
          id: "child1_dob",
          labelPt: "Filho(a) 1 — data de nascimento",
          type: "date",
          pdf: { kind: "text", field: `${S11}Pt7Line2_DateofBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "child1_country",
          labelPt: "Filho(a) 1 — país de nascimento (em inglês)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S11}Pt7Line2_Country[0]` },
        },
        {
          id: "child1_relationship",
          labelPt: "Filho(a) 1 — relação (em inglês: biological child, stepchild, adopted child)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S11}Pt7Line2_Relationship[0]` },
        },
        {
          id: "child1_applying",
          labelPt: "Filho(a) 1 também está pedindo ajuste em I-485 próprio?",
          type: "radio",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S11}Pt7Line2_YN[0]`, yes: `${S11}Pt7Line2_YN[1]` },
          },
        },
        {
          id: "child2_family",
          labelPt: "Filho(a) 2 — sobrenome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S11}Pt7Line3_FamilyName[0]` },
        },
        {
          id: "child2_given",
          labelPt: "Filho(a) 2 — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S11}Pt7Line3_GivenName[0]` },
        },
        {
          id: "child2_dob",
          labelPt: "Filho(a) 2 — data de nascimento",
          type: "date",
          pdf: { kind: "text", field: `${S11}Pt7Line3_DateofBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "child2_country",
          labelPt: "Filho(a) 2 — país de nascimento (em inglês)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S11}Pt7Line3_Country[0]` },
        },
      ],
    },

    // ── 10. Informações biográficas (Part 8) ────────────────────────────────
    {
      id: "biografico",
      titlePt: "Informações biográficas",
      questions: [
        {
          id: "ethnicity",
          labelPt: "Etnia",
          type: "radio",
          required: true,
          options: [
            { value: "hispanic", labelPt: "Hispânico ou latino" },
            { value: "not_hispanic", labelPt: "Não hispânico ou latino" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              hispanic: `${S12}Pt7Line1_Ethnicity[0]`,
              not_hispanic: `${S12}Pt7Line1_Ethnicity[1]`,
            },
          },
        },
        {
          id: "race_white",
          labelPt: "Raça — Branca",
          helpPt: "Pode marcar mais de uma.",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S12}Pt7Line2_Race[1]` },
        },
        {
          id: "race_black",
          labelPt: "Raça — Negra ou afro-americana",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S12}Pt7Line2_Race[2]` },
        },
        {
          id: "race_asian",
          labelPt: "Raça — Asiática",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S12}Pt7Line2_Race[0]` },
        },
        {
          id: "race_indigenous",
          labelPt: "Raça — Indígena americana ou nativa do Alasca",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S12}Pt7Line2_Race[3]` },
        },
        {
          id: "race_pacific",
          labelPt: "Raça — Nativa do Havaí ou ilhas do Pacífico",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S12}Pt7Line2_Race[4]` },
        },
        {
          id: "height_feet",
          labelPt: "Altura — pés",
          helpPt: "1,70m ≈ 5 pés e 7 polegadas.",
          type: "select",
          required: true,
          options: ["2", "3", "4", "5", "6", "7", "8"].map((v) => ({ value: v, labelPt: v })),
          pdf: { kind: "dropdown", field: `${S12}Pt7Line3_HeightFeet[0]` },
        },
        {
          id: "height_inches",
          labelPt: "Altura — polegadas (0 a 11)",
          type: "select",
          required: true,
          options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"].map((v) => ({
            value: v,
            labelPt: v,
          })),
          pdf: { kind: "dropdown", field: `${S12}Pt7Line3_HeightInches[0]` },
        },
        {
          id: "weight",
          labelPt: "Peso em libras (1kg = 2,2 lb)",
          type: "number",
          required: true,
          validate: { pattern: /^\d{2,3}$/, messagePt: "Digite o peso em libras (2 ou 3 dígitos)." },
          pdf: [
            {
              kind: "text",
              field: `${S12}Pt7Line4_Weight1[0]`,
              transform: (v) => String(v ?? "").padStart(3, "0").charAt(0),
            },
            {
              kind: "text",
              field: `${S12}Pt7Line4_Weight2[0]`,
              transform: (v) => String(v ?? "").padStart(3, "0").charAt(1),
            },
            {
              kind: "text",
              field: `${S12}Pt7Line4_Weight3[0]`,
              transform: (v) => String(v ?? "").padStart(3, "0").charAt(2),
            },
          ],
        },
        {
          id: "eye_color",
          labelPt: "Cor dos olhos",
          type: "radio",
          required: true,
          options: [
            { value: "brown", labelPt: "Castanhos" },
            { value: "black", labelPt: "Pretos" },
            { value: "blue", labelPt: "Azuis" },
            { value: "green", labelPt: "Verdes" },
            { value: "hazel", labelPt: "Avelã (mel)" },
            { value: "gray", labelPt: "Cinzas" },
            { value: "maroon", labelPt: "Castanho-avermelhados" },
            { value: "pink", labelPt: "Rosados" },
            { value: "other", labelPt: "Outra/não sei" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              blue: `${S12}Pt7Line5_Eyecolor[0]`,
              black: `${S12}Pt7Line5_Eyecolor[1]`,
              brown: `${S12}Pt7Line5_Eyecolor[2]`,
              gray: `${S12}Pt7Line5_Eyecolor[3]`,
              green: `${S12}Pt7Line5_Eyecolor[4]`,
              hazel: `${S12}Pt7Line5_Eyecolor[5]`,
              maroon: `${S12}Pt7Line5_Eyecolor[6]`,
              pink: `${S12}Pt7Line5_Eyecolor[7]`,
              other: `${S12}Pt7Line5_Eyecolor[8]`,
            },
          },
        },
        {
          id: "hair_color",
          labelPt: "Cor do cabelo",
          type: "radio",
          required: true,
          options: [
            { value: "black", labelPt: "Preto" },
            { value: "brown", labelPt: "Castanho" },
            { value: "blond", labelPt: "Loiro" },
            { value: "gray", labelPt: "Grisalho" },
            { value: "red", labelPt: "Ruivo" },
            { value: "sandy", labelPt: "Castanho-claro (sandy)" },
            { value: "white", labelPt: "Branco" },
            { value: "bald", labelPt: "Careca (sem cabelo)" },
            { value: "other", labelPt: "Outra/não sei" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              bald: `${S12}Pt7Line6_Haircolor[0]`,
              black: `${S12}Pt7Line6_Haircolor[1]`,
              blond: `${S12}Pt7Line6_Haircolor[2]`,
              brown: `${S12}Pt7Line6_Haircolor[3]`,
              gray: `${S12}Pt7Line6_Haircolor[4]`,
              red: `${S12}Pt7Line6_Haircolor[5]`,
              sandy: `${S12}Pt7Line6_Haircolor[6]`,
              white: `${S12}Pt7Line6_Haircolor[7]`,
              other: `${S12}Pt7Line6_Haircolor[8]`,
            },
          },
        },
      ],
    },

    // ── 11. Parte 9 — organizações (itens 1–9) ──────────────────────────────
    {
      id: "parte9-organizacoes",
      titlePt: "Parte 9 — Organizações e grupos",
      descriptionPt:
        "⚠️ Começam aqui as perguntas de elegibilidade do USCIS. Responda com total sinceridade — mentir aqui " +
        "é pior que qualquer resposta \"Sim\". Se QUALQUER resposta sua for \"Sim\", explique na Parte 14 " +
        "(à mão) e converse com um profissional antes de protocolar.",
      questions: [
        p9(
          "p9_orgs",
          "Você JÁ foi membro ou se envolveu com alguma organização, associação, fundação, partido, clube ou grupo (nos EUA ou em qualquer país)?",
          `${S12}Pt8Line1_YesNo[1]`,
          `${S12}Pt8Line1_YesNo[0]`,
          { helpPt: "Vale para qualquer grupo: sindicato, partido político, ONG, igreja com cargo formal. Participação comum em igreja não costuma contar — na dúvida, liste." }
        ),
        {
          id: "org1_name",
          labelPt: "Organização 1 — nome",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "p9_orgs", equals: "yes" },
          pdf: { kind: "text", field: `${S12}Pt9Line2_Organization1[0]` },
        },
        {
          id: "org1_city",
          labelPt: "Cidade",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "p9_orgs", equals: "yes" },
          pdf: { kind: "text", field: `${S12}Pt9Line3_CityTownOfBirth[0]` },
        },
        {
          id: "org1_state_province",
          labelPt: "Estado/Província",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "p9_orgs", equals: "yes" },
          pdf: { kind: "text", field: `${S12}Pt9Line3_State[0]` },
        },
        {
          id: "org1_country",
          labelPt: "País (em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "p9_orgs", equals: "yes" },
          pdf: { kind: "text", field: `${S12}Pt9Line3_Country[0]` },
        },
        {
          id: "org1_nature",
          labelPt: "Natureza da organização (em inglês, ex.: labor union, political party)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "p9_orgs", equals: "yes" },
          pdf: { kind: "text", field: `${S12}Pt9Line4_FamilyName[0]` },
        },
        {
          id: "org1_involvement",
          labelPt: "Seu papel/envolvimento (em inglês, ex.: member, volunteer)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "p9_orgs", equals: "yes" },
          pdf: { kind: "text", field: `${S12}Pt9Line4_Involvement[0]` },
        },
        {
          id: "org1_from",
          labelPt: "Membro de",
          type: "date",
          showWhen: { questionId: "p9_orgs", equals: "yes" },
          pdf: { kind: "text", field: `${S12}Pt9Line5_DateFrom[0]`, transform: isoToUsDate },
        },
        {
          id: "org1_to",
          labelPt: "até",
          helpPt: "Mais de uma organização: a segunda vai nos campos da Organização 2 impressos, ou na Parte 14.",
          type: "date",
          showWhen: { questionId: "p9_orgs", equals: "yes" },
          pdf: { kind: "text", field: `${S12}Pt9Line5_DateTo[0]`, transform: isoToUsDate },
        },
      ],
    },

    // ── 12. Parte 9 — histórico imigratório (itens 10–22) ───────────────────
    {
      id: "parte9-imigracao",
      titlePt: "Parte 9 — Histórico imigratório",
      descriptionPt:
        "Estas perguntas cobrem negativas e violações de status. \"Sim\" aqui não significa negação automática " +
        "— no caminho de cônjuge de cidadão, overstay e trabalho sem autorização costumam ser perdoados — mas " +
        "TODO \"Sim\" precisa de explicação na Parte 14 e de orientação profissional.",
      questions: [
        p9("p9_10", "Você JÁ teve admissão negada nos EUA (barrado na entrada)?", `${S13}Pt9Line10_YesNo[1]`, `${S13}Pt9Line10_YesNo[0]`),
        p9("p9_11", "Você JÁ teve um visto americano negado?", `${S13}Pt9Line11_YesNo[0]`, `${S13}Pt9Line11_YesNo[1]`),
        p9("p9_12", "Você JÁ trabalhou nos EUA sem autorização?", `${S13}Pt9Line12_YesNo[0]`, `${S13}Pt9Line12_YesNo[1]`),
        p9("p9_13", "Você JÁ violou os termos do seu status de não imigrante (ex.: ficou além do prazo)?", `${S13}Pt8Line13_YesNo[1]`, `${S13}Pt8Line13_YesNo[0]`),
        p9("p9_14", "Você está ou JÁ esteve em processo de remoção, exclusão, rescisão ou deportação?", `${S13}Pt8Line18_YesNo[0]`, `${S13}Pt8Line18_YesNo[1]`),
        p9("p9_15", "Você JÁ recebeu uma ordem final de exclusão, deportação ou remoção?", `${S13}Pt8Line19_YesNo[1]`, `${S13}Pt8Line19_YesNo[0]`),
        p9("p9_16", "Você JÁ teve uma ordem final de remoção reativada (reinstated)?", `${S13}Pt8Line20_YesNo[0]`, `${S13}Pt8Line20_YesNo[1]`),
        p9("p9_17", "Você JÁ recebeu saída voluntária e NÃO saiu no prazo?", `${S13}Pt8Line17_YesNo[0]`, `${S13}Pt8Line17_YesNo[1]`),
        p9("p9_18", "Você JÁ pediu qualquer proteção contra remoção, exclusão ou deportação?", `${S13}Pt8Line23_YesNo[1]`, `${S13}Pt8Line23_YesNo[0]`),
        p9("p9_19", "Você JÁ foi intercambista J-1/J-2 sujeito à regra dos 2 anos no país de origem?", `${S13}Pt8Line24a_YesNo[0]`, `${S13}Pt8Line24a_YesNo[1]`),
        p9("p9_20", "Se sim ao item anterior: você cumpriu os 2 anos no país de origem?", `${S13}Pt8Line24b_YesNo[1]`, `${S13}Pt8Line24b_YesNo[0]`, { showWhen: { questionId: "p9_19", equals: "yes" }, required: false }),
        p9("p9_21", "Se não cumpriu: recebeu waiver (ou carta favorável do Departamento de Estado)?", `${S13}Pt8Line24c_YesNo[0]`, `${S13}Pt8Line24c_YesNo[1]`, { showWhen: { questionId: "p9_19", equals: "yes" }, required: false }),
        p9(
          "p9_22",
          "Você JÁ foi preso(a), detido(a), citado(a), acusado(a) ou entrou em programa de desvio penal por QUALQUER autoridade, em QUALQUER país?",
          `${S13}Pt8Line22_YesNo[0]`,
          `${S13}Pt8Line22_YesNo[1]`,
          { helpPt: "Vale mesmo se o registro foi selado ou se disseram que você \"não tem ficha\". Inclui autoridades de imigração." }
        ),
      ],
    },

    // ── 13. Parte 9 — atos criminais (itens 23–37) ──────────────────────────
    {
      id: "parte9-criminal",
      titlePt: "Parte 9 — Atos criminais",
      descriptionPt:
        "Responda \"Sim\" mesmo para registros apagados, selados ou perdoados — o USCIS tem acesso a tudo. " +
        "Qualquer \"Sim\": explique na Parte 14 e procure um profissional.",
      questions: [
        p9("p9_23", "Você JÁ cometeu um crime de qualquer tipo (mesmo sem prisão ou condenação)?", `${S14}Pt9Line23_YesNo[1]`, `${S14}Pt9Line23_YesNo[0]`),
        p9("p9_24", "Você JÁ se declarou culpado(a) ou foi condenado(a) por crime (mesmo com registro apagado ou perdão)?", `${S14}Pt9Line24_YesNo[0]`, `${S14}Pt9Line24_YesNo[1]`),
        p9("p9_25", "Você JÁ recebeu punição judicial ou restrição de liberdade (prisão, condicional, serviço comunitário, tratamento obrigatório)?", `${S14}Pt8Line25_YesNo[1]`, `${S14}Pt8Line25_YesNo[0]`),
        p9("p9_26", "Você JÁ violou (ou tentou/conspirou violar) qualquer lei de substâncias controladas (drogas)?", `${S14}Pt8Line26_YesNo[1]`, `${S14}Pt8Line26_YesNo[0]`),
        p9("p9_27", "Você JÁ traficou drogas ou ajudou/conspirou no tráfico?", `${S14}Pt8Line27_YesNo[1]`, `${S14}Pt8Line27_YesNo[0]`),
        p9("p9_28", "Você é cônjuge ou filho(a) de traficante e recebeu benefício financeiro dessa atividade nos últimos 5 anos?", `${S14}Pt8Line28_YesNo[1]`, `${S14}Pt8Line28_YesNo[0]`),
        p9("p9_29", "Se sim: você sabia (ou tinha como saber) da origem do benefício?", `${S14}Pt8Line29_YesNo[1]`, `${S14}Pt8Line29_YesNo[0]`, { showWhen: { questionId: "p9_28", equals: "yes" }, required: false }),
        p9("p9_30", "Você JÁ se envolveu em prostituição (ou vem aos EUA para isso)?", `${S14}Pt8Line30_YesNo[1]`, `${S14}Pt8Line30_YesNo[0]`),
        p9("p9_31", "Você JÁ agenciou ou tentou agenciar pessoas para prostituição?", `${S14}Pt8Line31_YesNo[0]`, `${S14}Pt8Line31_YesNo[1]`),
        p9("p9_32", "Você JÁ recebeu dinheiro de prostituição?", `${S14}Pt8Line32_YesNo[0]`, `${S14}Pt8Line32_YesNo[1]`),
        p9("p9_33", "Você pretende praticar jogo ilegal ou outro vício comercializado nos EUA?", `${S14}Pt8Line33_YesNo[0]`, `${S14}Pt8Line33_YesNo[1]`),
        p9("p9_34", "Você JÁ usou imunidade (diplomática ou outra) para escapar de processo criminal nos EUA?", `${S14}Pt8Line34_YesNo[1]`, `${S14}Pt8Line34_YesNo[0]`),
        p9("p9_35a", "Você JÁ serviu como autoridade de governo estrangeiro?", `${S14}Pt8Line35a_YesNo[0]`, `${S14}Pt8Line35a_YesNo[1]`),
        p9("p9_35b", "Se sim: você foi responsável por (ou executou) violações de liberdade religiosa?", `${S14}Pt8Line35b_YesNo[1]`, `${S14}Pt8Line35b_YesNo[0]`, { showWhen: { questionId: "p9_35a", equals: "yes" }, required: false }),
        p9("p9_36", "Você JÁ induziu (por força, fraude ou coerção) tráfico sexual de qualquer pessoa?", `${S14}Pt8Line36_YesNo[1]`, `${S14}Pt8Line36_YesNo[0]`),
        p9("p9_37", "Você JÁ traficou pessoa para servidão involuntária, escravidão ou trabalho forçado?", `${S14}Pt8Line37_YesNo[1]`, `${S14}Pt8Line37_YesNo[0]`),
      ],
    },

    // ── 14. Parte 9 — segurança (itens 38–55) ───────────────────────────────
    {
      id: "parte9-seguranca",
      titlePt: "Parte 9 — Segurança",
      descriptionPt:
        "Perguntas padrão de segurança nacional — para a imensa maioria, é \"Não\" em todas. Leia cada uma mesmo assim.",
      questions: [
        p9("p9_38", "Você JÁ ajudou/conspirou no tráfico de pessoas (sexual ou trabalho forçado)?", `${S15}Pt8Line38_YesNo[0]`, `${S15}Pt8Line38_YesNo[1]`),
        p9("p9_39", "Você é cônjuge/filho(a) de traficante de pessoas e recebeu benefício disso nos últimos 5 anos?", `${S15}Pt9Line39_YesNo[1]`, `${S15}Pt9Line39_YesNo[0]`),
        p9("p9_40", "Se sim: você sabia (ou tinha como saber) da origem do benefício?", `${S15}Pt8Line40_YesNo[1]`, `${S15}Pt8Line40_YesNo[0]`, { showWhen: { questionId: "p9_39", equals: "yes" }, required: false }),
        p9("p9_41", "Você JÁ se envolveu em lavagem de dinheiro (ou vem aos EUA para isso)?", `${S15}Pt8Line41_YesNo[0]`, `${S15}Pt8Line41_YesNo[1]`),
        p9("p9_42a", "Você pretende: praticar espionagem ou sabotagem nos EUA?", `${S15}Pt8Line42\\.a_YesNo[0]`, `${S15}Pt8Line42\\.a_YesNo[1]`),
        p9("p9_42b", "Você pretende: violar leis de exportação de tecnologia ou informação sensível?", `${S15}Pt8Line42\\.b_YesNo[1]`, `${S15}Pt8Line42\\.b_YesNo[0]`),
        p9("p9_42c", "Você pretende: se envolver em atividade para derrubar o governo americano à força?", `${S15}Pt8Line42c_YesNo[1]`, `${S15}Pt8Line42c_YesNo[0]`),
        p9("p9_42d", "Você pretende: praticar qualquer outra atividade ilegal nos EUA?", `${S15}Pt8Line42d_YesNo[0]`, `${S15}Pt8Line42d_YesNo[1]`),
        p9("p9_43a", "Você JÁ recebeu treinamento com armas, paramilitar ou de tipo militar?", `${S15}Pt8Line43a_YesNo[1]`, `${S15}Pt8Line43a_YesNo[0]`, { helpPt: "Serviço militar obrigatório também conta — responda Sim e explique na Parte 14." }),
        p9("p9_43b", "Você JÁ cometeu sequestro, assassinato, pirataria ou sabotagem de veículo/aeronave?", `${S15}Pt8Line43b_YesNo[0]`, `${S15}Pt8Line43b_YesNo[1]`),
        p9("p9_43c", "Você JÁ usou arma ou explosivo com intenção de ferir pessoas ou causar danos?", `${S15}Pt8Line43c_YesNo[0]`, `${S15}Pt8Line43c_YesNo[1]`),
        p9("p9_43d", "Você JÁ ameaçou, tentou, conspirou ou planejou algo dos itens anteriores (43.b–43.c)?", `${S15}Pt8Line43d_YesNo[0]`, `${S15}Pt8Line43d_YesNo[1]`),
        p9("p9_43e", "Você JÁ incitou (com intenção de causar morte/dano grave) os atos dos itens 43.b–43.c?", `${S15}Pt8Line43e_YesNo[0]`, `${S15}Pt8Line43e_YesNo[1]`),
        p9("p9_43f", "Você JÁ participou ou foi membro de grupo/organização que fez algo dos itens 43.b–43.e?", `${S15}Pt8Line43fYesNo[0]`, `${S15}Pt8Line43fYesNo[1]`),
        p9("p9_43g", "Você JÁ recrutou membros ou arrecadou dinheiro para grupo que fez algo dos itens 43.b–43.e?", `${S15}Pt8Line43g_YesNo[0]`, `${S15}Pt8Line43g_YesNo[1]`),
        p9("p9_43h", "Você JÁ deu dinheiro, serviços ou apoio para ATIVIDADES dos itens 43.b–43.e?", `${S15}Pt8Line43h_YesNo[1]`, `${S15}Pt8Line43h_YesNo[0]`),
        p9("p9_43i", "Você JÁ deu dinheiro, serviços ou apoio para PESSOA/GRUPO que fez algo dos itens 43.b–43.e?", `${S15}Pt8Line43i_YesNo[1]`, `${S15}Pt8Line43i_YesNo[0]`),
        p9("p9_44", "Você pretende praticar qualquer atividade dos itens 43.b–43.e?", `${S15}Pt8Line44_YesNo[0]`, `${S15}Pt8Line44_YesNo[1]`),
        p9("p9_45", "Você pretende praticar atividade que ameace o bem-estar ou a segurança dos EUA?", `${S15}Pt8Line45_YesNo[1]`, `${S15}Pt8Line45_YesNo[0]`),
        p9("p9_46", "Você é cônjuge ou filho(a) de alguém que fez algo dos itens 43.b–43.i?", `${S16}Pt8Line46_YesNo[0]`, `${S16}Pt8Line46_YesNo[1]`),
        p9("p9_47", "Você JÁ vendeu, forneceu ou transportou armas que sabia que seriam usadas contra alguém?", `${S16}Pt8Line47_YesNo[1]`, `${S16}Pt8Line47_YesNo[0]`),
        p9("p9_48", "Você JÁ trabalhou/serviu em prisão, campo de detenção ou lugar onde pessoas eram detidas?", `${S16}Pt8Line48_YesNo[1]`, `${S16}Pt8Line48_YesNo[0]`),
        p9("p9_49", "Você JÁ foi membro de grupo que usou armas contra pessoas ou ameaçou usá-las?", `${S16}Pt8Line49_YesNo[0]`, `${S16}Pt8Line49_YesNo[1]`),
        p9("p9_50", "Você JÁ serviu, foi membro ou ajudou alguma unidade MILITAR ou POLICIAL?", `${S16}Pt8Line50_YesNo[1]`, `${S16}Pt8Line50_YesNo[0]`, { helpPt: "Serviço militar obrigatório no Brasil conta: responda Sim e detalhe país, unidade, patente e datas na Parte 14." }),
        p9("p9_51", "Você JÁ serviu ou participou de grupo ARMADO (paramilitar, guerrilha, milícia, autodefesa)?", `${S16}Pt8Line51_YesNo[0]`, `${S16}Pt8Line51_YesNo[1]`),
        p9("p9_52", "Você JÁ foi membro ou afiliado do Partido Comunista ou de partido totalitário (em qualquer país)?", `${S16}Pt8Line52_YesNo[1]`, `${S16}Pt8Line52_YesNo[0]`),
        p9("p9_53a", "Você JÁ ordenou, incitou, ajudou ou participou de: tortura?", `${S16}Pt8Line53a_YesNo[0]`, `${S16}Pt8Line53a_YesNo[1]`),
        p9("p9_53b", "…genocídio?", `${S16}Pt8Line53b_YesNo[0]`, `${S16}Pt8Line53b_YesNo[1]`),
        p9("p9_53c", "…matar (ou tentar matar) alguém?", `${S16}Pt8Line53c_YesNo[0]`, `${S16}Pt8Line53c_YesNo[1]`),
        p9("p9_53d", "…ferir gravemente (ou tentar ferir) alguém de propósito?", `${S16}Pt8Line53d_YesNo[1]`, `${S16}Pt8Line53d_YesNo[0]`),
        p9("p9_54", "Você JÁ recrutou ou usou menores de 15 anos para servir em força armada ou grupo armado?", `${S16}Pt8Line54_YesNo[1]`, `${S16}Pt8Line54_YesNo[0]`),
        p9("p9_55", "Você JÁ usou menores de 15 anos em hostilidades (combate ou apoio a combate)?", `${S16}Pt8Line55_YesNo[0]`, `${S16}Pt8Line55_YesNo[1]`),
      ],
    },

    // ── 15. Parte 9 — public charge (itens 56–66) ───────────────────────────
    {
      id: "parte9-public-charge",
      titlePt: "Parte 9 — Situação financeira (public charge)",
      descriptionPt:
        "O USCIS avalia se você tende a depender do governo. No caminho de família você NÃO é isento — " +
        "responda os itens abaixo (o I-864 do seu patrocinador também cobre isso).",
      questions: [
        {
          id: "p9_56_exempt",
          labelPt: "Categoria de public charge",
          helpPt: "No ajuste por família, a resposta padrão é \"não sou isento\". As categorias isentas (asilo, VAWA, T/U) não passam por este wizard.",
          type: "radio",
          required: true,
          default: "not_exempt",
          options: [{ value: "not_exempt", labelPt: "Não sou isento — vou responder os itens 57–66" }],
          pdf: { kind: "checkboxChoice", fieldByValue: { not_exempt: `${S18}Pt9Line56_CB[23]` } },
        },
        {
          id: "p9_57_household",
          labelPt: "Tamanho da sua família/household (contando você)",
          type: "number",
          required: true,
          pdf: { kind: "text", field: `${S18}Pt9Line57_HouseholdSize[0]` },
        },
        {
          id: "p9_58_income",
          labelPt: "Renda anual do household",
          type: "radio",
          required: true,
          options: [
            { value: "b0", labelPt: "US$0 – 27.000" },
            { value: "b1", labelPt: "US$27.001 – 52.000" },
            { value: "b2", labelPt: "US$52.001 – 85.000" },
            { value: "b3", labelPt: "US$85.001 – 141.000" },
            { value: "b4", labelPt: "Acima de US$141.000" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              b0: `${S18}Pt9Line53_CB[0]`,
              b1: `${S18}Pt9Line53_CB[1]`,
              b2: `${S18}Pt9Line53_CB[2]`,
              b3: `${S18}Pt9Line53_CB[3]`,
              b4: `${S18}Pt9Line53_CB[4]`,
            },
          },
        },
        {
          id: "p9_59_assets",
          labelPt: "Valor total dos bens do household",
          type: "radio",
          required: true,
          options: [
            { value: "a0", labelPt: "US$0 – 18.400" },
            { value: "a1", labelPt: "US$18.401 – 136.000" },
            { value: "a2", labelPt: "US$136.001 – 321.400" },
            { value: "a3", labelPt: "US$321.401 – 707.100" },
            { value: "a4", labelPt: "Acima de US$707.100" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              a0: `${S18}Pt9Line59_CB[0]`,
              a1: `${S18}Pt9Line59_CB[1]`,
              a2: `${S18}Pt9Line59_CB[2]`,
              a3: `${S18}Pt9Line59_CB[3]`,
              a4: `${S18}Pt9Line59_CB[4]`,
            },
          },
        },
        {
          id: "p9_60_liabilities",
          labelPt: "Valor total das dívidas do household",
          type: "radio",
          required: true,
          options: [
            { value: "l0", labelPt: "US$0" },
            { value: "l1", labelPt: "US$1 – 10.100" },
            { value: "l2", labelPt: "US$10.101 – 57.700" },
            { value: "l3", labelPt: "US$57.701 – 186.800" },
            { value: "l4", labelPt: "Acima de US$186.800" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              l0: `${S18}Pt9Line60_CB[0]`,
              l1: `${S18}Pt9Line60_CB[1]`,
              l2: `${S18}Pt9Line60_CB[2]`,
              l3: `${S18}Pt9Line60_CB[3]`,
              l4: `${S18}Pt9Line60_CB[4]`,
            },
          },
        },
        {
          id: "p9_61_education",
          labelPt: "Sua maior escolaridade",
          type: "radio",
          required: true,
          options: [
            { value: "less_hs", labelPt: "Menos que ensino médio completo" },
            { value: "hs", labelPt: "Ensino médio completo (ou GED)" },
            { value: "some_college", labelPt: "Faculdade incompleta (1+ ano de créditos)" },
            { value: "associate", labelPt: "Tecnólogo (Associate's)" },
            { value: "bachelor", labelPt: "Graduação (Bachelor's)" },
            { value: "master", labelPt: "Mestrado" },
            { value: "professional", labelPt: "Grau profissional (JD, MD...)" },
            { value: "doctorate", labelPt: "Doutorado" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              less_hs: `${S18}Pt9Line61_CB[0]`,
              hs: `${S18}Pt9Line61_CB[2]`,
              some_college: `${S18}Pt9Line61_CB[1]`,
              associate: `${S18}Pt9Line61_CB[3]`,
              bachelor: `${S18}Pt9Line61_CB[7]`,
              master: `${S18}Pt9Line61_CB[4]`,
              professional: `${S18}Pt9Line61_CB[5]`,
              doctorate: `${S18}Pt9Line61_CB[6]`,
            },
          },
        },
        {
          id: "p9_61_grade",
          labelPt: "Última série concluída",
          type: "text",
          showWhen: { questionId: "p9_61_education", equals: "less_hs" },
          pdf: { kind: "text", field: `${S18}Pt9Line61_diploma[0]` },
        },
        {
          id: "p9_62_certs",
          labelPt: "Certificações, licenças e habilidades profissionais (em inglês; \"None\" se nenhuma)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "None",
          pdf: { kind: "text", field: `${S18}Table1[0].Row1[0].TextField1[0]` },
        },
        p9(
          "p9_63",
          "Você JÁ recebeu SSI, TANF ou outro benefício governamental em dinheiro para sustento?",
          `${S18}Pt9Line63_YesNo[0]`,
          `${S18}Pt9Line63_YesNo[1]`,
          { helpPt: "Se sim, liste os detalhes (benefício, datas, valores) à mão na tabela do item 65." }
        ),
        p9(
          "p9_64",
          "Você JÁ ficou internado(a) em instituição de longo prazo às custas do governo?",
          `${S18}Pt9Line64_YesNo[0]`,
          `${S18}Pt9Line64_YesNo[1]`,
          { helpPt: "Se sim, preencha a tabela do item 66 à mão na versão impressa." }
        ),
      ],
    },

    // ── 16. Parte 9 — violações imigratórias (itens 67–78) ──────────────────
    {
      id: "parte9-violacoes",
      titlePt: "Parte 9 — Entradas e permanência",
      descriptionPt:
        "Atenção redobrada aqui se o seu caminho envolve overstay: responda com precisão — para cônjuge de " +
        "cidadão, permanência irregular costuma ser perdoada no ajuste, mas mentir sobre ela não é.",
      questions: [
        p9("p9_67", "Você JÁ faltou (ou se recusou a comparecer) a audiência de remoção depois de 1/abr/1997?", `${S20}Pt9Line67_YesNo[1]`, `${S20}Pt9Line67_YesNo[0]`),
        p9("p9_68", "Você JÁ apresentou documento falso/adulterado a autoridade americana para obter benefício imigratório?", `${S20}Pt9Line68_YesNo[0]`, `${S20}Pt9Line68_YesNo[1]`),
        p9("p9_69", "Você JÁ mentiu ou omitiu informação em pedido de visto, entrada ou benefício imigratório?", `${S20}Pt9Line69_YesNo[1]`, `${S20}Pt9Line69_YesNo[0]`),
        p9("p9_70", "Você JÁ alegou falsamente ser cidadão americano (por escrito ou de qualquer forma)?", `${S20}Pt9Line70_YesNo[0]`, `${S20}Pt9Line70_YesNo[1]`),
        p9("p9_71", "Você JÁ entrou como clandestino (stowaway) em navio ou avião?", `${S20}Pt9Line71_YesNo[1]`, `${S20}Pt9Line71_YesNo[0]`),
        p9("p9_72", "Você JÁ ajudou alguém a entrar (ou tentar entrar) ilegalmente nos EUA?", `${S20}Pt9Line72_YesNo[0]`, `${S20}Pt9Line72_YesNo[1]`),
        p9("p9_73", "Você está sob ordem final de multa civil por uso de documentos fraudulentos (INA 274C)?", `${S20}Pt9Line73_YesNo[1]`, `${S20}Pt9Line73_YesNo[0]`),
        p9("p9_74", "Você JÁ foi excluído(a), deportado(a) ou removido(a) dos EUA (ou saiu por conta após ordem)?", `${S20}Pt9Line74_YesNo[1]`, `${S20}Pt9Line74_YesNo[0]`),
        p9("p9_75", "Você JÁ entrou nos EUA sem ser inspecionado(a) e admitido(a)/parolado(a)?", `${S20}Pt9Line75_YesNo[0]`, `${S20}Pt9Line75_YesNo[1]`),
        p9(
          "p9_76",
          "Desde 1/abr/1997, você esteve em permanência irregular nos EUA (além do prazo autorizado)?",
          `${S21}Pt9Line76_YesNo[1]`,
          `${S21}Pt9Line76_YesNo[0]`,
          { helpPt: "Se sim, liste as datas de permanência irregular à mão na Parte 14." }
        ),
        p9("p9_77", "Se sim: o tráfico severo de pessoas foi uma razão central dessa permanência?", `${S21}Pt9Line77_YesNo[0]`, `${S21}Pt9Line77_YesNo[1]`, { showWhen: { questionId: "p9_76", equals: "yes" }, required: false }),
        p9("p9_78a", "Desde 1/abr/1997, você reentrou (ou tentou reentrar) sem inspeção APÓS mais de 1 ano de permanência irregular acumulada?", `${S21}Pt9Line78a_YesNo[1]`, `${S21}Pt9Line78a_YesNo[0]`),
        p9("p9_78b", "…ou APÓS ter sido deportado(a), excluído(a) ou removido(a)?", `${S21}Pt9Line78b_YesNo[0]`, `${S21}Pt9Line78b_YesNo[1]`),
      ],
    },

    // ── 17. Parte 9 — condutas diversas (itens 79–86) ───────────────────────
    {
      id: "parte9-condutas",
      titlePt: "Parte 9 — Condutas diversas",
      questions: [
        p9("p9_79", "Você planeja praticar poligamia nos EUA?", `${S21}Pt9Line79_YesNo[0]`, `${S21}Pt9Line79_YesNo[1]`),
        p9("p9_80", "Você está acompanhando um estrangeiro inadmissível e incapaz (doença/deficiência/infância) que depende da sua guarda?", `${S21}Pt9Line80_YesNo[1]`, `${S21}Pt9Line80_YesNo[0]`),
        p9("p9_81", "Você JÁ ajudou a reter fora dos EUA uma criança cidadã americana, contra quem tinha a guarda?", `${S21}Pt9Line81_YesNo[0]`, `${S21}Pt9Line81_YesNo[1]`),
        p9("p9_82", "Você JÁ votou nos EUA em violação de qualquer lei ou regulamento?", `${S21}Pt9Line82_YesNo[1]`, `${S21}Pt9Line82_YesNo[0]`),
        p9("p9_83", "Você JÁ renunciou à cidadania americana para evitar impostos?", `${S21}Pt9Line83_YesNo[0]`, `${S21}Pt9Line83_YesNo[1]`),
        p9("p9_84a", "Você JÁ pediu isenção do serviço militar americano por ser estrangeiro?", `${S21}Pt9Line84a_YesNo[1]`, `${S21}Pt9Line84a_YesNo[0]`),
        p9("p9_84b", "Você JÁ foi dispensado desse serviço por ser estrangeiro?", `${S21}Pt9Line84b_YesNo[1]`, `${S21}Pt9Line84b_YesNo[0]`),
        p9("p9_84c", "Você JÁ foi condenado(a) por deserção das forças armadas americanas?", `${S21}Pt9Line84c_YesNo[1]`, `${S21}Pt9Line84c_YesNo[0]`),
        p9("p9_85", "Você JÁ saiu (ou ficou fora) dos EUA para evitar servir nas forças armadas em tempo de guerra?", `${S21}Pt9Line85_YesNo[1]`, `${S21}Pt9Line85_YesNo[0]`),
        {
          id: "p9_86_nationality",
          labelPt: "Se sim: qual era sua nacionalidade/status imigratório antes de sair? (em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "p9_85", equals: "yes" },
          pdf: { kind: "text", field: `${S21}Pt9Line86_Nationality[0]` },
        },
      ],
    },

    // ── 12. Contato (Part 10) ───────────────────────────────────────────────
    {
      id: "contato",
      titlePt: "Seu contato",
      descriptionPt: "A assinatura é à mão, na versão impressa — o Immigrei nunca assina por você.",
      questions: [
        {
          id: "daytime_phone",
          labelPt: "Seu telefone",
          type: "text",
          required: true,
          pdf: { kind: "text", field: `${S22}Pt3Line3_DaytimePhoneNumber1[0]` },
        },
        {
          id: "mobile_phone",
          labelPt: "Seu celular",
          type: "text",
          pdf: { kind: "text", field: `${S22}Pt3Line4_MobileNumber1[0]` },
        },
        {
          id: "email",
          labelPt: "Seu e-mail",
          type: "text",
          prefillFrom: "email",
          pdf: { kind: "text", field: `${S22}Pt3Line5_Email[0]` },
        },
      ],
    },
  ],
};
