/**
 * I-131 — Application for Travel Documents, Parole Documents, and
 * Arrival/Departure Records.
 *
 * Data-driven spec covering the two application types Immigrei routes users
 * into: Advance Parole while an I-485 is pending (familia-ir/k1 adjustment
 * flow — WHO FILLS THIS: the applicant themselves, who will receive the
 * green card) and the Reentry Permit for existing green card holders (the
 * "i131" maintenance kit). Leaving the US during a pending I-485 without
 * advance parole abandons the application; that warning leads the wizard.
 *
 * Field names extracted from the official edition 01/20/25 asset at
 * public/forms/i-131.pdf (14 pages), disambiguated by widget position. This
 * PDF names its first pages `P1[0]..P7[0]` and then switches to
 * `#subform[7..13]` — both prefixes appear below. The Part 1 application-type
 * checkboxes reuse the name `CB_AppType[n]` per page.
 *
 * Part 7 ("Information About Your Proposed Travel") is explicitly Advance
 * Parole-only per the PDF's own field tooltips — gated with `showWhen` so it
 * neither shows nor writes for Reentry Permit applicants. Part 5 ("Complete
 * Only If Applying for a Reentry Permit") is the mirror: gated the other way.
 *
 * Scope (MVP): Advance Parole (Part 1, Item 5.A) and Reentry Permit (Part 1,
 * Item 1). Refugee travel documents, TPS travel authorization and the
 * mail-to-an-address-abroad option (Part 4, items 8-9) are out of scope —
 * print and complete those by hand. The engine is ministerial: it
 * transcribes; it never decides eligibility. Signature, interpreter and
 * preparer blocks stay blank.
 */

import type { FormSpec } from "./types";

// Page prefixes: named pages P1-P7, then #subform[7]+ from page 8 on.
const F = "form1[0].";
const P1 = `${F}P1[0].`;
const P5 = `${F}P5[0].`;
const P7 = `${F}P7[0].`;
const S8 = `${F}#subform[8].`; // page 9 (reentry permit — time outside US)
const S9 = `${F}#subform[9].`; // page 10 (travel info)
const S10 = `${F}#subform[10].`; // page 11 (contact)
const S13 = `${F}#subform[13].`; // page 14 (Part 13 header)

// ISO yyyy-mm-dd (how we store dates) -> USCIS mm/dd/yyyy text.
function isoToUsDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

export const I131: FormSpec = {
  id: "i-131",
  code: "I-131",
  officialName: "Application for Travel Documents, Parole Documents, and Arrival/Departure Records",
  namePt: "Permissão de Viagem — Advance Parole ou Reentry Permit",
  agency: "USCIS",
  officialUrl: "https://www.uscis.gov/i-131",
  edition: "01/20/25",
  exportKind: "pdf",
  pdfAssetPath: "forms/i-131.pdf",
  attachTo: { vistoId: "familia-ir", documentoId: "i131" },
  disclaimerPt:
    "Este formulário é preenchido por VOCÊ — quem vai receber o documento de viagem. " +
    "⚠️ Com I-485 pendente: sair dos EUA SEM o advance parole aprovado faz o USCIS considerar seu pedido " +
    "ABANDONADO. Com Green Card: o Reentry Permit precisa ser protocolado ANTES de você sair do país — não dá " +
    "para pedir já estando fora. A Immigrei é uma ferramenta de preenchimento — não presta serviços jurídicos " +
    "e não revisa o mérito do seu caso. Confira cada campo e assine à mão antes de enviar.",

  sections: [
    // ── 1. Tipo de pedido (Part 1, itens 1 e 5.A) ───────────────────────────
    {
      id: "tipo",
      titlePt: "O que você está pedindo",
      descriptionPt:
        "Dois pedidos diferentes usam o mesmo formulário. ⚠️ REENTRY PERMIT: precisa ser protocolado ANTES de " +
        "sair dos EUA — não dá para pedir já estando fora. ⚠️ ADVANCE PAROLE é opcional: a regra geral do " +
        "ajuste é protocolar o I-485 e FICAR nos EUA até o green card chegar; sair sem ele APROVADO e em mãos " +
        "= pedido abandonado. Quem tem tempo de permanência irregular não deve viajar de jeito nenhum, nem " +
        "com o parole: a saída pode ativar as barras de 3/10 anos.",
      questions: [
        {
          id: "app_type",
          labelPt: "Base do pedido",
          type: "radio",
          required: true,
          default: "pending_i485",
          options: [
            {
              value: "reentry_permit",
              labelPt: "Tenho Green Card (ou residência condicional) e quero o Reentry Permit",
            },
            {
              value: "pending_i485",
              labelPt: "Tenho um I-485 pendente e quero o advance parole para viajar",
            },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { reentry_permit: `${P1}CB_AppType[0]`, pending_i485: `${P1}CB_AppType[4]` },
          },
        },
        {
          id: "i485_receipt",
          labelPt: "Número de recibo do seu I-485 (se estiver protocolando este I-131 separado)",
          helpPt: "Ex.: IOE0123456789. Se o I-131 vai no mesmo envelope do I-485, deixe em branco.",
          type: "text",
          showWhen: { questionId: "app_type", equals: "pending_i485" },
          pdf: { kind: "text", field: `${P1}P1_Line5A[0]` },
        },
      ],
    },

    // ── 2. Seus dados (Part 2, itens 1–11) ──────────────────────────────────
    {
      id: "dados",
      titlePt: "Seus dados",
      questions: [
        {
          id: "family_name",
          labelPt: "Seu sobrenome (como no passaporte)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: [
            { kind: "text", field: `${F}P4[0].Part2_Line1_FamilyName[0]` },
            { kind: "text", field: `${S13}Part2_Line1_FamilyName[0]` },
          ],
        },
        {
          id: "given_name",
          labelPt: "Seu nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: [
            { kind: "text", field: `${F}P4[0].Part2_Line1_GivenName[0]` },
            { kind: "text", field: `${S13}Part2_Line1_GivenName[0]` },
          ],
        },
        {
          id: "middle_name",
          labelPt: "Seu nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${F}P4[0].Part2_Line1_MiddleName[0]` },
        },
        {
          id: "other_family_name",
          labelPt: "Outros nomes que você já usou — sobrenome",
          helpPt: "Nome de solteira, aliases. Em branco se não houver.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${P5}Part2_Line2_FamilyName1[0]` },
        },
        {
          id: "other_given_name",
          labelPt: "Outros nomes — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${P5}Part2_Line2_GivenName1[0]` },
        },
        {
          id: "refugee_status",
          labelPt: "Você tem status de refugiado (ou green card derivado de refúgio)?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${F}P4[0].P1_Line13_YesNo[0]`, no: `${F}P4[0].P1_Line13_YesNo[1]` },
          },
        },
        {
          id: "mail_in_care_of",
          labelPt: "Aos cuidados de (In Care Of) — opcional",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${P5}Part2_Line3_InCareofName[0]` },
        },
        {
          id: "mail_street",
          labelPt: "Endereço de correspondência — rua e número",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${P5}Part2_Line3_StreetNumberName[0]` },
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
              ste: `${P5}Part2_Line3_Unit[0]`,
              apt: `${P5}Part2_Line3_Unit[1]`,
              flr: `${P5}Part2_Line3_Unit[2]`,
            },
          },
        },
        {
          id: "mail_unit_number",
          labelPt: "Número do complemento",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${P5}Part2_Line3_AptSteFlrNumber[0]` },
        },
        {
          id: "mail_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${P5}Part2_Line3_CityTown[0]` },
        },
        {
          id: "mail_state",
          labelPt: "Estado (sigla de 2 letras)",
          type: "text",
          required: true,
          placeholder: "FL",
          validate: { pattern: /^[A-Za-z]{2}$/, messagePt: "Use a sigla de 2 letras do estado (ex.: FL)." },
          pdf: { kind: "dropdown", field: `${P5}Part2_Line3_State[0]` },
        },
        {
          id: "mail_zip",
          labelPt: "ZIP Code",
          type: "text",
          required: true,
          validate: { pattern: /^\d{5}(-\d{4})?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          pdf: { kind: "text", field: `${P5}Part2_Line3_ZipCode[0]` },
        },
        {
          id: "mail_country",
          labelPt: "País (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "United States",
          pdf: { kind: "text", field: `${P5}Part2_Line3_Country[0]` },
        },
        {
          id: "phys_street",
          labelPt: "Endereço onde você mora — rua e número (se diferente do acima)",
          helpPt: "Em branco se for o mesmo.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${P5}Part2_Line4_StreetNumberName[0]` },
        },
        {
          id: "phys_city",
          labelPt: "Cidade",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${P5}Part2_Line4_CityTown[0]` },
        },
        {
          id: "phys_state",
          labelPt: "Estado (sigla)",
          type: "text",
          validate: { pattern: /^([A-Za-z]{2})?$/, messagePt: "Use a sigla de 2 letras (ex.: FL)." },
          pdf: { kind: "dropdown", field: `${P5}Part2_Line4_State[0]` },
        },
        {
          id: "phys_zip",
          labelPt: "ZIP Code",
          type: "text",
          validate: { pattern: /^(\d{5}(-\d{4})?)?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          pdf: { kind: "text", field: `${P5}Part2_Line4_ZipCode[0]` },
        },
        {
          id: "a_number",
          labelPt: "Seu A-Number (se tiver)",
          type: "text",
          pdf: [
            { kind: "text", field: `${P5}#area[0].Part2_Line5_AlienNumber[0]` },
            { kind: "text", field: `${S13}Global_ANumber[0].Part2_Line5_AlienNumber[0]` },
          ],
        },
        {
          id: "birth_country",
          labelPt: "Seu país de nascimento (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${P5}Part2_Line6_CountryOfBirth[0]` },
        },
        {
          id: "citizenship_country",
          labelPt: "Seu país de cidadania (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${P5}Part2_Line7_CountryOfCitizenshiporNationality[0]` },
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
            fieldByValue: { female: `${P5}Part2_Line8_Gender[0]`, male: `${P5}Part2_Line8_Gender[1]` },
          },
        },
        {
          id: "dob",
          labelPt: "Sua data de nascimento",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${P5}Part2_Line9_DateOfBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "ssn",
          labelPt: "Seu SSN (se tiver)",
          type: "text",
          pdf: { kind: "text", field: `${P5}#area[1].Part2_Line10_SSN[0]` },
        },
        {
          id: "uscis_account",
          labelPt: "Sua conta online do USCIS (se tiver)",
          type: "text",
          pdf: { kind: "text", field: `${P5}Part2_Line11_USCISOnlineAcctNumber[0]` },
        },
        {
          id: "class_of_admission",
          labelPt: "Sua classe de admissão na última entrada (em inglês, ex.: B2, F1)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${P5}Part2_Line12_ClassofAdmission[0]` },
        },
        {
          id: "i94_number",
          labelPt: "Número do I-94 mais recente (se tiver)",
          type: "text",
          pdf: { kind: "text", field: `${P5}Part2_Line13_I94RecordNo[0]` },
        },
        {
          id: "i94_expiry",
          labelPt: "Validade da estadia no I-94 (data mm/dd/yyyy ou D/S)",
          type: "text",
          pdf: { kind: "text", field: `${F}P6[0].Part2_Line14_I94ExpDate[0]` },
        },
      ],
    },

    // ── 3. Biográficos (Part 3) ─────────────────────────────────────────────
    {
      id: "biografico",
      titlePt: "Informações biográficas",
      descriptionPt: "De quem vai receber o documento de viagem — você.",
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
              not_hispanic: `${P7}P3_Line1_Ethnicity[0]`,
              hispanic: `${P7}P3_Line1_Ethnicity[1]`,
            },
          },
        },
        {
          id: "race_white",
          labelPt: "Raça — Branca",
          helpPt: "Pode marcar mais de uma.",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${P7}P3_Line2_Race_White[0]` },
        },
        {
          id: "race_black",
          labelPt: "Raça — Negra ou afro-americana",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${P7}P3_Line2_Race_Black[0]` },
        },
        {
          id: "race_asian",
          labelPt: "Raça — Asiática",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${P7}P3_Line2_Race_Asian[0]` },
        },
        {
          id: "race_indigenous",
          labelPt: "Raça — Indígena americana ou nativa do Alasca",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${P7}P3_Line2_Race_American[0]` },
        },
        {
          id: "race_pacific",
          labelPt: "Raça — Nativa do Havaí ou ilhas do Pacífico",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${P7}P3_Line2_Race_Hawaiian[0]` },
        },
        {
          id: "height_feet",
          labelPt: "Altura — pés",
          helpPt: "1,70m ≈ 5 pés e 7 polegadas.",
          type: "select",
          required: true,
          options: ["2", "3", "4", "5", "6", "7", "8"].map((v) => ({ value: v, labelPt: v })),
          pdf: { kind: "dropdown", field: `${P7}P3_Line3_HeightFeet[0]` },
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
          pdf: { kind: "dropdown", field: `${P7}P3_Line3_HeightInches[0]` },
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
              field: `${P7}P3_Line4_Pound1[0]`,
              transform: (v) => String(v ?? "").padStart(3, "0").charAt(0),
            },
            {
              kind: "text",
              field: `${P7}P3_Line4_Pound2[0]`,
              transform: (v) => String(v ?? "").padStart(3, "0").charAt(1),
            },
            {
              kind: "text",
              field: `${P7}P3_Line4_Pound3[0]`,
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
              brown: `${P7}P3_Line5_EyeColor[0]`,
              gray: `${P7}P3_Line5_EyeColor[1]`,
              maroon: `${P7}P3_Line5_EyeColor[2]`,
              other: `${P7}P3_Line5_EyeColor[3]`,
              pink: `${P7}P3_Line5_EyeColor[4]`,
              hazel: `${P7}P3_Line5_EyeColor[5]`,
              green: `${P7}P3_Line5_EyeColor[6]`,
              blue: `${P7}P3_Line5_EyeColor[7]`,
              black: `${P7}P3_Line5_EyeColor[8]`,
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
              bald: `${P7}P3_Line6_HairColor[0]`,
              blond: `${P7}P3_Line6_HairColor[1]`,
              gray: `${P7}P3_Line6_HairColor[2]`,
              sandy: `${P7}P3_Line6_HairColor[3]`,
              other: `${P7}P3_Line6_HairColor[4]`,
              white: `${P7}P3_Line6_HairColor[5]`,
              red: `${P7}P3_Line6_HairColor[6]`,
              brown: `${P7}P3_Line6_HairColor[7]`,
              black: `${P7}P3_Line6_HairColor[8]`,
            },
          },
        },
      ],
    },

    // ── 4. Processamento (Part 4, itens 1–4) ────────────────────────────────
    {
      id: "processamento",
      titlePt: "Histórico de documentos de viagem",
      questions: [
        {
          id: "in_proceedings",
          labelPt: "Você já esteve em processo de exclusão, deportação, remoção ou rescisão?",
          helpPt: "Se sim, converse com um profissional antes de viajar — mesmo com advance parole.",
          type: "radio",
          required: true,
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${P7}P4_Line1_YesNo[0]`, no: `${P7}P4_Line1_YesNo[1]` },
          },
        },
        {
          id: "prior_reentry_permit",
          labelPt: "Já recebeu um Reentry Permit ou Refugee Travel Document?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${P7}P4_Line2a_YesNo[0]`, no: `${P7}P4_Line2a_YesNo[1]` },
          },
        },
        {
          id: "prior_advance_parole",
          labelPt: "Já recebeu um Advance Parole antes?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${P7}P4_Line3a_YesNo[0]`, no: `${P7}P4_Line3a_YesNo[1]` },
          },
        },
        {
          id: "prior_ap_date",
          labelPt: "Data de emissão do último advance parole",
          type: "date",
          showWhen: { questionId: "prior_advance_parole", equals: "yes" },
          pdf: { kind: "text", field: `${P7}P4_Line3b_DateIssued[0]`, transform: isoToUsDate },
        },
        {
          id: "prior_ap_disposition",
          labelPt: "Situação desse documento (em inglês: attached, lost, still in my possession)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "prior_advance_parole", equals: "yes" },
          pdf: { kind: "text", field: `${P7}P4_Line3c_Disposition[0]` },
        },
        {
          id: "is_replacement",
          labelPt: "Este pedido é para SUBSTITUIR um documento (perdido, roubado, com erro)?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não, é um pedido novo" },
            { value: "yes", labelPt: "Sim, é substituição" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${P7}P4_Line4_YesNo[0]`, no: `${P7}P4_Line4_YesNo[1]` },
          },
        },
      ],
    },

    // ── 5. Tempo fora dos EUA (Part 5) — só Reentry Permit ──────────────────
    {
      id: "tempo_fora",
      titlePt: "Tempo fora dos EUA",
      descriptionPt: "Só quem está pedindo o Reentry Permit preenche esta parte (Part 5 do formulário).",
      questions: [
        {
          id: "time_outside_us",
          labelPt:
            "Desde que virou residente permanente (ou nos últimos 5 anos, o que for mais curto), " +
            "quanto tempo no total você já passou fora dos EUA?",
          type: "radio",
          required: true,
          showWhen: { questionId: "app_type", equals: "reentry_permit" },
          options: [
            { value: "lt6", labelPt: "Menos de 6 meses" },
            { value: "6to12", labelPt: "De 6 meses a 1 ano" },
            { value: "1to2", labelPt: "De 1 a 2 anos" },
            { value: "2to3", labelPt: "De 2 a 3 anos" },
            { value: "3to4", labelPt: "De 3 a 4 anos" },
            { value: "gt4", labelPt: "Mais de 4 anos" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              lt6: `${S8}P5_Line1_Lessthan6[0]`,
              "6to12": `${S8}P5_Line1_6months[0]`,
              "1to2": `${S8}P5_Line1_1to2[0]`,
              "2to3": `${S8}P5_Line1_2to3[0]`,
              "3to4": `${S8}P5_Line1_3to4[0]`,
              gt4: `${S8}P5_Line1_morethan[0]`,
            },
          },
        },
      ],
    },

    // ── 6. Viagem pretendida (Part 7) — só Advance Parole ───────────────────
    {
      id: "viagem",
      titlePt: "Sua viagem pretendida",
      descriptionPt: "Só quem está pedindo o Advance Parole preenche esta parte (Part 7 do formulário).",
      questions: [
        {
          id: "departure_date",
          labelPt: "Data pretendida de saída dos EUA",
          type: "date",
          required: true,
          showWhen: { questionId: "app_type", equals: "pending_i485" },
          pdf: { kind: "text", field: `${S9}P7_Line1_DateOfDeparture[0]`, transform: isoToUsDate },
        },
        {
          id: "trip_purpose",
          labelPt: "Motivo da viagem (em inglês)",
          helpPt: "Ex.: Visit family in Brazil; attend grandmother's funeral.",
          type: "text",
          required: true,
          passthroughEn: true,
          showWhen: { questionId: "app_type", equals: "pending_i485" },
          pdf: { kind: "text", field: `${S9}P7_Line2_Purpose[0]` },
        },
        {
          id: "countries",
          labelPt: "Países que pretende visitar (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          showWhen: { questionId: "app_type", equals: "pending_i485" },
          pdf: { kind: "text", field: `${S9}P7_Line3_ListCountries[0]` },
        },
        {
          id: "number_of_trips",
          labelPt: "Quantas viagens você pretende fazer com este documento?",
          type: "radio",
          required: true,
          default: "multiple",
          showWhen: { questionId: "app_type", equals: "pending_i485" },
          options: [
            { value: "one", labelPt: "Uma viagem" },
            { value: "multiple", labelPt: "Mais de uma viagem" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { one: `${S9}P7_Line4_CB[0]`, multiple: `${S9}P7_Line4_CB[1]` },
          },
        },
        {
          id: "trip_length",
          labelPt: "Duração esperada da viagem (em dias)",
          type: "number",
          required: true,
          showWhen: { questionId: "app_type", equals: "pending_i485" },
          pdf: { kind: "text", field: `${S9}P7_Line5_ExpectedLengthTrip[0]` },
        },
      ],
    },

    // ── 6. Contato (Part 10) ────────────────────────────────────────────────
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
          pdf: { kind: "text", field: `${S10}Part10_Line1_DayPhone[0]` },
        },
        {
          id: "mobile_phone",
          labelPt: "Seu celular",
          type: "text",
          pdf: { kind: "text", field: `${S10}Part10_Line2_MobilePhone[0]` },
        },
        {
          id: "email",
          labelPt: "Seu e-mail",
          type: "text",
          prefillFrom: "email",
          pdf: { kind: "text", field: `${S10}Part10_Line3_Email[0]` },
        },
      ],
    },
  ],
};
