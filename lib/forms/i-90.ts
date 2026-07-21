/**
 * I-90 — Application to Replace Permanent Resident Card.
 *
 * Data-driven spec for green card renewal/replacement. WHO FILLS THIS FORM:
 * the APPLICANT — the lawful permanent (or conditional permanent) resident
 * whose card is expiring, lost, stolen, mutilated, or shows wrong data.
 *
 * Field names extracted from the official edition 01/20/25 asset at
 * public/forms/i-90.pdf (7 pages), disambiguated by widget position. Unlike
 * the I-131, this PDF's pages are all named `#subform[0]..#subform[6]` —
 * there is no `P1[0]`-style page node.
 *
 * Scope (MVP): Part 1 (applicant info), Part 2 (application type/reason),
 * Part 3 (processing + biographic), Part 4 (disability accommodations) and
 * Part 5's applicant statement/contact info. Part 6 (interpreter), Part 7
 * (preparer) and Part 8 (additional-information overflow) are out of scope —
 * print and complete those by hand. The engine is ministerial: it
 * transcribes; it never decides eligibility. Signature and date stay blank.
 */

import type { FormSpec } from "./types";

// This PDF's pages are all `#subform[n]` — no `P1[0]`-style page node.
const F = "form1[0].";
const S0 = `${F}#subform[0].`; // page 1 (name, mailing + physical address)
const S1 = `${F}#subform[1].`; // page 2 (additional info, sex, Part 2 status/reason A)
const S2 = `${F}#subform[2].`; // page 3-4 (Part 2 reason B, Part 3, Part 4 start)
const S3 = `${F}#subform[3].`; // page 4-5 (Part 4 cont., Part 5 statement/contact)

// ISO yyyy-mm-dd (how we store dates) -> USCIS mm/dd/yyyy text.
function isoToUsDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

export const I90: FormSpec = {
  id: "i-90",
  code: "I-90",
  officialName: "Application to Replace Permanent Resident Card",
  namePt: "Renovação ou Substituição do Green Card",
  agency: "USCIS",
  officialUrl: "https://www.uscis.gov/i-90",
  edition: "01/20/25",
  exportKind: "pdf",
  pdfAssetPath: "forms/i-90.pdf",
  attachTo: { vistoId: "i90", documentoId: "i90-formulario" },
  disclaimerPt:
    "Este formulário é preenchido por VOCÊ, o titular do Green Card. A Immigrei é uma ferramenta de " +
    "preenchimento — não presta serviços jurídicos e não revisa o mérito do seu caso. Confira cada campo " +
    "e assine à mão antes de enviar.",

  sections: [
    // ── 1. Seu nome (Part 1, itens 2-5) ─────────────────────────────────────
    {
      id: "identificacao",
      titlePt: "Seus dados",
      questions: [
        {
          id: "a_number",
          labelPt: "Seu A-Number (Alien Registration Number)",
          type: "text",
          required: true,
          pdf: { kind: "text", field: `${S0}#area[1].P1_Line1_AlienNumber[0]` },
        },
        {
          id: "uscis_account",
          labelPt: "Sua conta online do USCIS (se tiver)",
          type: "text",
          pdf: { kind: "text", field: `${S0}P1_Line2_AcctIdentifier[0]` },
        },
        {
          id: "family_name",
          labelPt: "Seu sobrenome (como deve aparecer no novo cartão)",
          helpPt: "O cartão será emitido com este nome.",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P1_Line3a_FamilyName[0]` },
        },
        {
          id: "given_name",
          labelPt: "Seu nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P1_Line3b_GivenName[0]` },
        },
        {
          id: "middle_name",
          labelPt: "Seu nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P1_Line3c_MiddleName[0]` },
        },
        {
          id: "name_changed",
          labelPt: "Seu nome mudou legalmente desde que seu Green Card atual foi emitido?",
          helpPt: "Anexe a prova da mudança de nome (certidão de casamento, decisão judicial etc).",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
            { value: "na", labelPt: "Não se aplica — nunca recebi o cartão anterior" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S0}P1_checkbox4[0]`, no: `${S0}P1_checkbox4[1]`, na: `${S0}P1_checkbox4[2]` },
          },
        },
        {
          id: "prior_family_name",
          labelPt: "Sobrenome exatamente como está no seu Green Card atual",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "name_changed", equals: "yes" },
          pdf: { kind: "text", field: `${S0}P1_Line5a_FamilyName[0]` },
        },
        {
          id: "prior_given_name",
          labelPt: "Nome exatamente como está no seu Green Card atual",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "name_changed", equals: "yes" },
          pdf: { kind: "text", field: `${S0}P1_Line5b_GivenName[0]` },
        },
        {
          id: "prior_middle_name",
          labelPt: "Nome do meio exatamente como está no seu Green Card atual",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "name_changed", equals: "yes" },
          pdf: { kind: "text", field: `${S0}P1_Line5c_MiddleName[0]` },
        },
      ],
    },

    // ── 2. Endereço (Part 1, itens 6-7) ─────────────────────────────────────
    {
      id: "endereco",
      titlePt: "Seu endereço",
      questions: [
        {
          id: "mail_in_care_of",
          labelPt: "Aos cuidados de (In Care Of) — opcional",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P1_Line6a_InCareofName[0]` },
        },
        {
          id: "mail_street",
          labelPt: "Endereço de correspondência — rua e número",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P1_Line6b_StreetNumberName[0]` },
        },
        {
          id: "mail_unit_type",
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
              apt: `${S0}P1_checkbox6c_Unit[0]`,
              ste: `${S0}P1_checkbox6c_Unit[1]`,
              flr: `${S0}P1_checkbox6c_Unit[2]`,
            },
          },
        },
        {
          id: "mail_unit_number",
          labelPt: "Número do complemento",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P1_Line6c_AptSteFlrNumber[0]` },
        },
        {
          id: "mail_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P1_Line6d_CityOrTown[0]` },
        },
        {
          id: "mail_state",
          labelPt: "Estado (sigla de 2 letras)",
          type: "text",
          required: true,
          placeholder: "FL",
          validate: { pattern: /^[A-Za-z]{2}$/, messagePt: "Use a sigla de 2 letras do estado (ex.: FL)." },
          pdf: { kind: "dropdown", field: `${S0}P1_Line6e_State[0]` },
        },
        {
          id: "mail_zip",
          labelPt: "ZIP Code",
          type: "text",
          required: true,
          validate: { pattern: /^\d{5}(-\d{4})?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          pdf: { kind: "text", field: `${S0}P1_Line6f_ZipCode[0]` },
        },
        {
          id: "mail_province",
          labelPt: "Província (endereço fora dos EUA)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P1_Line6g_Province[0]` },
        },
        {
          id: "mail_postal_code",
          labelPt: "Código postal (endereço fora dos EUA)",
          type: "text",
          pdf: { kind: "text", field: `${S0}P1_Line6h_PostalCode[0]` },
        },
        {
          id: "mail_country",
          labelPt: "País (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "United States",
          pdf: { kind: "text", field: `${S0}P1_Line6i_Country[0]` },
        },
        {
          id: "phys_street",
          labelPt: "Endereço onde você mora — rua e número (se diferente do de correspondência)",
          helpPt: "Em branco se for o mesmo.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P1_Line7a_StreetNumberName[0]` },
        },
        {
          id: "phys_unit_type",
          labelPt: "Tipo de complemento (endereço físico)",
          type: "radio",
          options: [
            { value: "apt", labelPt: "Apt." },
            { value: "ste", labelPt: "Ste." },
            { value: "flr", labelPt: "Flr." },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              apt: `${S0}P1_checkbox7b_Unit[0]`,
              ste: `${S0}P1_checkbox7b_Unit[1]`,
              flr: `${S0}P1_checkbox7b_Unit[2]`,
            },
          },
        },
        {
          id: "phys_unit_number",
          labelPt: "Número do complemento (endereço físico)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P1_Line7b_AptSteFlrNumber[0]` },
        },
        {
          id: "phys_city",
          labelPt: "Cidade (endereço físico)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P1_Line7c_CityOrTown[0]` },
        },
        {
          id: "phys_state",
          labelPt: "Estado (sigla, endereço físico)",
          type: "text",
          validate: { pattern: /^([A-Za-z]{2})?$/, messagePt: "Use a sigla de 2 letras (ex.: FL)." },
          pdf: { kind: "dropdown", field: `${S0}P1_Line7d_State[0]` },
        },
        {
          id: "phys_zip",
          labelPt: "ZIP Code (endereço físico)",
          type: "text",
          validate: { pattern: /^(\d{5}(-\d{4})?)?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          pdf: { kind: "text", field: `${S0}P1_Line7e_ZipCode[0]` },
        },
        {
          id: "phys_province",
          labelPt: "Província (endereço físico fora dos EUA)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P1_Line7f_Province[0]` },
        },
        {
          id: "phys_postal_code",
          labelPt: "Código postal (endereço físico fora dos EUA)",
          type: "text",
          pdf: { kind: "text", field: `${S0}P1_Line7g_PostalCode[0]` },
        },
        {
          id: "phys_country",
          labelPt: "País (endereço físico, em inglês)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P1_Line7h_Country[0]` },
        },
      ],
    },

    // ── 3. Dados adicionais (Part 1, itens 8-16) ────────────────────────────
    {
      id: "dados_pessoais",
      titlePt: "Dados adicionais",
      questions: [
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
            fieldByValue: { male: `${S1}P1_Line8_male[0]`, female: `${S1}P1_Line8_female[0]` },
          },
        },
        {
          id: "dob",
          labelPt: "Sua data de nascimento",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S1}P1_Line9_DateOfBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "birth_city",
          labelPt: "Cidade/vila de nascimento",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}P1_Line10_CityTownOfBirth[0]` },
        },
        {
          id: "birth_country",
          labelPt: "País de nascimento (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S1}P1_Line11_CountryofBirth[0]` },
        },
        {
          id: "mother_given_name",
          labelPt: "Nome da sua mãe",
          helpPt: "Opcional.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}P1_Line12_MotherGivenName[0]` },
        },
        {
          id: "father_given_name",
          labelPt: "Nome do seu pai",
          helpPt: "Opcional.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}P1_Line13_FatherGivenName[0]` },
        },
        {
          id: "class_of_admission",
          labelPt: "Sua classe de admissão como residente (em inglês, ex.: IR1, F2A)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}P1_Line14_ClassOfAdmission[0]` },
        },
        {
          id: "date_of_admission",
          labelPt: "Data em que virou residente permanente",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S1}P1_Line15_DateOfAdmission[0]`, transform: isoToUsDate },
        },
        {
          id: "ssn",
          labelPt: "Seu SSN (se tiver)",
          type: "text",
          pdf: { kind: "text", field: `${S1}P1_Line16_SSN[0]` },
        },
      ],
    },

    // ── 4. Tipo de pedido (Part 2) ───────────────────────────────────────────
    {
      id: "tipo_pedido",
      titlePt: "Por que você está pedindo",
      descriptionPt: "O motivo certo depende do seu status atual — escolha o status primeiro.",
      questions: [
        {
          id: "status",
          labelPt: "Seu status",
          type: "radio",
          required: true,
          default: "lpr",
          options: [
            { value: "lpr", labelPt: "Residente permanente (Green Card comum)" },
            { value: "commuter", labelPt: "Residente permanente em status de commuter" },
            { value: "conditional", labelPt: "Residente permanente condicional" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              lpr: `${S1}P2_checkbox1[0]`,
              commuter: `${S1}P2_checkbox1[1]`,
              conditional: `${S1}P2_checkbox1[2]`,
            },
          },
        },
        {
          id: "reason_a",
          labelPt: "Motivo do pedido",
          type: "radio",
          required: true,
          showWhen: { questionId: "status", equals: ["lpr", "commuter"] },
          options: [
            { value: "lost_stolen_destroyed", labelPt: "Meu cartão anterior foi perdido, roubado ou destruído" },
            { value: "never_received", labelPt: "Meu cartão anterior foi emitido, mas nunca recebi" },
            { value: "mutilated", labelPt: "Meu cartão atual está danificado" },
            { value: "incorrect_data", labelPt: "Meu cartão tem dado incorreto por erro do DHS" },
            { value: "name_changed_card", labelPt: "Meu nome ou outro dado biográfico mudou desde a emissão do cartão" },
            { value: "expiring_6mo", labelPt: "Meu cartão já venceu ou vence nos próximos 6 meses" },
            { value: "turned14_after16", labelPt: "Completei 14 anos e meu cartão vence DEPOIS dos meus 16 anos" },
            { value: "turned14_before16", labelPt: "Completei 14 anos e meu cartão vence ANTES dos meus 16 anos" },
            { value: "commuter_taking_residence", labelPt: "Sou commuter e passei a residir de fato nos EUA" },
            { value: "resident_taking_commuter", labelPt: "Sou residente e passei a status de commuter" },
            { value: "auto_converted", labelPt: "Fui convertido automaticamente para residente permanente" },
            { value: "other_prior_edition", labelPt: "Tenho uma edição antiga do cartão, ou nenhum motivo acima se aplica" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              name_changed_card: `${S1}P2_checkbox2[0]`,
              expiring_6mo: `${S1}P2_checkbox2[1]`,
              turned14_after16: `${S1}P2_checkbox2[2]`,
              turned14_before16: `${S1}P2_checkbox2[3]`,
              incorrect_data: `${S1}P2_checkbox2[4]`,
              lost_stolen_destroyed: `${S1}P2_checkbox2[5]`,
              never_received: `${S1}P2_checkbox2[6]`,
              mutilated: `${S1}P2_checkbox2[7]`,
              other_prior_edition: `${S1}P2_checkbox2[8]`,
              commuter_taking_residence: `${S1}P2_checkbox2[9]`,
              auto_converted: `${S1}P2_checkbox2[10]`,
              resident_taking_commuter: `${S1}P2_checkbox2[11]`,
            },
          },
        },
        {
          id: "reason_a_poe",
          labelPt: "Seu novo porto de entrada nos EUA será — cidade e estado (em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "reason_a", equals: "resident_taking_commuter" },
          pdf: { kind: "text", field: `${S1}P2_Line2h1_CityandState[0]` },
        },
        {
          id: "reason_b",
          labelPt: "Motivo do pedido (residente condicional)",
          type: "radio",
          required: true,
          showWhen: { questionId: "status", equals: "conditional" },
          options: [
            { value: "lost_stolen_destroyed", labelPt: "Meu cartão anterior foi perdido, roubado ou destruído" },
            { value: "never_received", labelPt: "Meu cartão anterior foi emitido, mas nunca recebi" },
            { value: "mutilated", labelPt: "Meu cartão atual está danificado" },
            { value: "incorrect_data", labelPt: "Meu cartão tem dado incorreto por erro do DHS" },
            { value: "name_bio_changed", labelPt: "Meu nome ou outro dado biográfico mudou desde a emissão do cartão" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              never_received: `${S2}P2_checkbox3[0]`,
              mutilated: `${S2}P2_checkbox3[1]`,
              incorrect_data: `${S2}P2_checkbox3[2]`,
              name_bio_changed: `${S2}P2_checkbox3[3]`,
              lost_stolen_destroyed: `${S2}P2_checkbox3[4]`,
            },
          },
        },
      ],
    },

    // ── 5. Processamento e biográficos (Part 3) ─────────────────────────────
    {
      id: "processamento",
      titlePt: "Histórico de imigração e dados biográficos",
      questions: [
        {
          id: "location_applied_visa",
          labelPt: "Onde você pediu o visto de imigrante ou o ajuste de status",
          helpPt: "Opcional se você não lembra ou não se aplica.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P3_Line1_LocationAppliedVisa[0]` },
        },
        {
          id: "location_issued_visa",
          labelPt: "Onde seu visto de imigrante foi emitido, ou o escritório do USCIS que aprovou seu ajuste",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P3_Line2_LocationIssuedVisa[0]` },
        },
        {
          id: "poe_city_state",
          labelPt: "Porto de entrada onde você foi admitido — cidade e estado (se entrou com visto de imigrante)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P3_Line3a1_CityandState[0]` },
        },
        {
          id: "poe_destination",
          labelPt: "Destino nos EUA na época dessa entrada",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P3_Line3a_Destination[0]` },
        },
        {
          id: "ever_removal_proceedings",
          labelPt: "Você já esteve em processo de exclusão, deportação ou remoção, ou já foi ordenado a sair dos EUA?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S2}P3_checkbox4[0]`, yes: `${S2}P3_checkbox4[1]` },
          },
        },
        {
          id: "ever_abandoned_status",
          labelPt: "Desde que virou residente permanente, você já protocolou o I-407 ou foi considerado como tendo abandonado o status?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S2}P3_checkbox5[0]`, yes: `${S2}P3_checkbox5[1]` },
          },
        },
        {
          id: "ethnicity",
          labelPt: "Etnia",
          type: "radio",
          required: true,
          options: [
            { value: "not_hispanic", labelPt: "Não hispânico ou latino" },
            { value: "hispanic", labelPt: "Hispânico ou latino" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { not_hispanic: `${S2}P3_checkbox6[0]`, hispanic: `${S2}P3_checkbox6[1]` },
          },
        },
        {
          id: "race_white",
          labelPt: "Raça — Branca",
          helpPt: "Pode marcar mais de uma.",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S2}P3_checkbox7_White[0]` },
        },
        {
          id: "race_black",
          labelPt: "Raça — Negra ou afro-americana",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S2}P3_checkbox7_Black[0]` },
        },
        {
          id: "race_asian",
          labelPt: "Raça — Asiática",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S2}P3_checkbox7_Asian[0]` },
        },
        {
          id: "race_indigenous",
          labelPt: "Raça — Indígena americana ou nativa do Alasca",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S2}P3_checkbox7_Indian[0]` },
        },
        {
          id: "race_pacific",
          labelPt: "Raça — Nativa do Havaí ou ilhas do Pacífico",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S2}P3_checkbox7_Hawaiian[0]` },
        },
        {
          id: "height_feet",
          labelPt: "Altura — pés",
          helpPt: "1,70m ≈ 5 pés e 7 polegadas.",
          type: "select",
          required: true,
          options: ["2", "3", "4", "5", "6", "7", "8"].map((v) => ({ value: v, labelPt: v })),
          pdf: { kind: "dropdown", field: `${S2}P3_Line8_HeightFeet[0]` },
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
          pdf: { kind: "dropdown", field: `${S2}P3_Line8_HeightInches[0]` },
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
              field: `${S2}P3_Line9_HeightInches1[0]`,
              transform: (v) => String(v ?? "").padStart(3, "0").charAt(0),
            },
            {
              kind: "text",
              field: `${S2}P3_Line9_HeightInches2[0]`,
              transform: (v) => String(v ?? "").padStart(3, "0").charAt(1),
            },
            {
              kind: "text",
              field: `${S2}P3_Line9_HeightInches3[0]`,
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
            { value: "blue", labelPt: "Azuis" },
            { value: "green", labelPt: "Verdes" },
            { value: "hazel", labelPt: "Avelã (mel)" },
            { value: "pink", labelPt: "Rosados" },
            { value: "maroon", labelPt: "Castanho-avermelhados" },
            { value: "brown", labelPt: "Castanhos" },
            { value: "black", labelPt: "Pretos" },
            { value: "other", labelPt: "Outra/não sei" },
            { value: "gray", labelPt: "Cinzas" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              blue: `${S2}P3_checkbox10[0]`,
              green: `${S2}P3_checkbox10[1]`,
              hazel: `${S2}P3_checkbox10[2]`,
              pink: `${S2}P3_checkbox10[3]`,
              maroon: `${S2}P3_checkbox10[4]`,
              brown: `${S2}P3_checkbox10[5]`,
              black: `${S2}P3_checkbox10[6]`,
              other: `${S2}P3_checkbox10[7]`,
              gray: `${S2}P3_checkbox10[8]`,
            },
          },
        },
        {
          id: "hair_color",
          labelPt: "Cor do cabelo",
          type: "radio",
          required: true,
          options: [
            { value: "bald", labelPt: "Careca (sem cabelo)" },
            { value: "blond", labelPt: "Loiro" },
            { value: "gray", labelPt: "Grisalho" },
            { value: "sandy", labelPt: "Castanho-claro (sandy)" },
            { value: "other", labelPt: "Outra/não sei" },
            { value: "white", labelPt: "Branco" },
            { value: "red", labelPt: "Ruivo" },
            { value: "brown", labelPt: "Castanho" },
            { value: "black", labelPt: "Preto" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              bald: `${S2}P3_checkbox11[0]`,
              blond: `${S2}P3_checkbox11[1]`,
              gray: `${S2}P3_checkbox11[2]`,
              sandy: `${S2}P3_checkbox11[3]`,
              other: `${S2}P3_checkbox11[4]`,
              white: `${S2}P3_checkbox11[5]`,
              red: `${S2}P3_checkbox11[6]`,
              brown: `${S2}P3_checkbox11[7]`,
              black: `${S2}P3_checkbox11[8]`,
            },
          },
        },
      ],
    },

    // ── 6. Acomodações por deficiência (Part 4) ─────────────────────────────
    {
      id: "acomodacoes",
      titlePt: "Acomodações por deficiência ou limitação",
      descriptionPt: "Só preencha se você precisar de alguma acomodação na entrevista ou biometria.",
      questions: [
        {
          id: "requesting_accommodation",
          labelPt: "Você está pedindo alguma acomodação por deficiência ou limitação?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S2}P4_checkbox1[0]`, yes: `${S2}P4_checkbox1[1]` },
          },
        },
        {
          id: "accommodation_deaf",
          labelPt: "Sou surdo ou tenho dificuldade de audição",
          type: "checkbox",
          showWhen: { questionId: "requesting_accommodation", equals: "yes" },
          pdf: { kind: "checkbox", field: `${S2}P4_checkbox1a[0]` },
        },
        {
          id: "accommodation_deaf_language",
          labelPt: "Se pedir intérprete de língua de sinais, qual língua (em inglês, ex.: American Sign Language)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "requesting_accommodation", equals: "yes" },
          pdf: { kind: "text", field: `${S2}P4_Line1a_AccomodationRequested[0]` },
        },
        {
          id: "accommodation_blind",
          labelPt: "Sou cego ou tenho baixa visão",
          type: "checkbox",
          showWhen: { questionId: "requesting_accommodation", equals: "yes" },
          pdf: { kind: "checkbox", field: `${S3}P4_checkbox1b[0]` },
        },
        {
          id: "accommodation_blind_detail",
          labelPt: "Acomodação solicitada (em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "requesting_accommodation", equals: "yes" },
          pdf: { kind: "text", field: `${S3}P4_Line1b_AccomodationRequested[0]` },
        },
        {
          id: "accommodation_other",
          labelPt: "Tenho outro tipo de deficiência ou limitação",
          type: "checkbox",
          showWhen: { questionId: "requesting_accommodation", equals: "yes" },
          pdf: { kind: "checkbox", field: `${S3}P4_checkbox1c[0]` },
        },
        {
          id: "accommodation_other_detail",
          labelPt: "Descreva a limitação e a acomodação solicitada (em inglês)",
          type: "textarea",
          passthroughEn: true,
          showWhen: { questionId: "requesting_accommodation", equals: "yes" },
          pdf: { kind: "text", field: `${S3}P4_Line1c_AccomodationRequested[0]` },
        },
      ],
    },

    // ── 7. Declaração e contato (Part 5) ────────────────────────────────────
    {
      id: "contato",
      titlePt: "Sua declaração e contato",
      descriptionPt: "A assinatura é à mão, na versão impressa — o Immigrei nunca assina por você.",
      questions: [
        {
          id: "language_ability",
          labelPt: "Como você está declarando ter entendido este formulário",
          type: "radio",
          required: true,
          default: "english",
          options: [
            { value: "english", labelPt: "Eu leio e entendo inglês, e li e entendi cada pergunta" },
            { value: "interpreter", labelPt: "Um intérprete leu e traduziu cada pergunta para mim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { english: `${S3}P5_Checkbox1a[0]`, interpreter: `${S3}P5_Checkbox1b[0]` },
          },
        },
        {
          id: "interpreter_language",
          labelPt: "Língua usada pelo intérprete (em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "language_ability", equals: "interpreter" },
          pdf: { kind: "text", field: `${S3}P5_Line1b_Language[0]` },
        },
        {
          id: "daytime_phone",
          labelPt: "Seu telefone",
          type: "text",
          required: true,
          pdf: { kind: "text", field: `${S3}P5_Line3_DaytimePhoneNumber[0]` },
        },
        {
          id: "mobile_phone",
          labelPt: "Seu celular",
          type: "text",
          pdf: { kind: "text", field: `${S3}P5_Line4_MobilePhoneNumber[0]` },
        },
        {
          id: "email",
          labelPt: "Seu e-mail",
          type: "text",
          prefillFrom: "email",
          pdf: { kind: "text", field: `${S3}P5_Line5_EmailAddress[0]` },
        },
      ],
    },
  ],
};
