/**
 * I-129F — Petition for Alien Fiancé(e).
 *
 * Data-driven spec for the K-1 fiancé(e) visa petition. WHO FILLS THIS FORM:
 * the PETITIONER — the US citizen. The BENEFICIARY (the fiancé(e) abroad who
 * will travel on the K-1 visa) is described in Part 2 but does not sign this
 * form. PT-BR labels keep the "quem é quem" explicit, matching the
 * I-130/I-130A convention.
 *
 * Scope: the K-1 fiancé(e) classification only (not the K-3 spouse-while-
 * I-130-pending route, item 4.b — out of scope for this MVP since K-3 is
 * rarely used in practice now that I-130 processing is faster). Field names
 * extracted from the official edition 01/20/25 asset at public/forms/i-129f.pdf
 * (12 pages), disambiguated by widget position.
 *
 * Known quirks (all verified positionally):
 *   - Employer 2's employment dates spill onto page 3 as `Pt1Line20a/20b`
 *     even though the employer's own fields (name/address/occupation) are
 *     `Pt1Line17-19` on page 2.
 *   - "Country of birth/citizenship" fields are named `..._CountryOfCitzOrNationality`
 *     regardless of which concept the item actually asks — a generic label
 *     reused across the whole form; trust the item number, not the field name.
 *   - Items 42.a-42.c (citizenship certificate) sit on page 4 as
 *     `Pt1Line21a/b/c` — reusing "Line21", already used for sex on page 3.
 *   - Item 20 checkboxes (previously filed I-129F for another beneficiary)
 *     are `Pt1Line20_Checkboxes` on page 3, DIFFERENT from the `Pt1Line20a/b`
 *     date fields on the same page (item 43 in the printed text — the PDF's
 *     internal item-43 checkbox literally carries the name "Line20").
 *
 * The engine is ministerial: it transcribes what the user enters, never
 * decides eligibility. Signature, interpreter (Part 6) and preparer
 * (Part 7) blocks are intentionally left blank — signed by hand.
 */

import type { FormSpec, Question } from "./types";

const F = "form1[0].";
const S0 = `${F}#subform[0].`;
const S1 = `${F}#subform[1].`;
const S2 = `${F}#subform[2].`;
const S3 = `${F}#subform[3].`;
const S4 = `${F}#subform[4].`;
const S5 = `${F}#subform[5].`;
const S6 = `${F}#subform[6].`;
const S7 = `${F}#subform[7].`;
const S8 = `${F}#subform[8].`;
const S9 = `${F}#subform[9].`;

function isoToUsDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

function yn(
  id: string,
  labelPt: string,
  yes: string,
  no: string,
  opts: { helpPt?: string; showWhen?: Question["showWhen"]; required?: boolean; default?: string } = {}
): Question {
  return {
    id,
    labelPt,
    helpPt: opts.helpPt,
    type: "radio",
    required: opts.required ?? true,
    default: opts.default,
    showWhen: opts.showWhen,
    options: [
      { value: "no", labelPt: "Não" },
      { value: "yes", labelPt: "Sim" },
    ],
    pdf: { kind: "checkboxChoice", fieldByValue: { yes, no } },
  };
}

type AddressFieldNames = {
  street: string;
  unitApt: string;
  unitSte: string;
  unitFlr: string;
  unitNumber: string;
  city: string;
  state?: string;
  zip?: string;
  province?: string;
  postal?: string;
  country?: string;
  inCareOf?: string;
};

function addressQuestions(
  idPrefix: string,
  labelPt: string,
  f: AddressFieldNames,
  opts: { required?: boolean; showWhen?: Question["showWhen"]; helpPt?: string } = {}
): Question[] {
  const { required = false, showWhen, helpPt } = opts;
  const qs: Question[] = [];
  if (f.inCareOf) {
    qs.push({
      id: `${idPrefix}_in_care_of`,
      labelPt: "Aos cuidados de (In Care Of) — opcional",
      type: "text",
      passthroughEn: true,
      showWhen,
      pdf: { kind: "text", field: f.inCareOf },
    });
  }
  qs.push(
    {
      id: `${idPrefix}_street`,
      labelPt: `${labelPt} — rua e número`,
      helpPt,
      type: "text",
      required,
      passthroughEn: true,
      showWhen,
      pdf: { kind: "text", field: f.street },
    },
    {
      id: `${idPrefix}_unit_type`,
      labelPt: "Tipo de complemento",
      helpPt: "Opcional. Apt. = apartamento, Ste. = sala, Flr. = andar.",
      type: "radio",
      options: [
        { value: "apt", labelPt: "Apt." },
        { value: "ste", labelPt: "Ste." },
        { value: "flr", labelPt: "Flr." },
      ],
      showWhen,
      pdf: { kind: "checkboxChoice", fieldByValue: { apt: f.unitApt, ste: f.unitSte, flr: f.unitFlr } },
    },
    {
      id: `${idPrefix}_unit_number`,
      labelPt: "Número do complemento",
      type: "text",
      passthroughEn: true,
      showWhen,
      pdf: { kind: "text", field: f.unitNumber },
    },
    {
      id: `${idPrefix}_city`,
      labelPt: "Cidade",
      type: "text",
      required,
      passthroughEn: true,
      showWhen,
      pdf: { kind: "text", field: f.city },
    }
  );
  if (f.state) {
    qs.push({
      id: `${idPrefix}_state`,
      labelPt: "Estado americano (sigla — em branco se fora dos EUA)",
      type: "text",
      validate: { pattern: /^([A-Za-z]{2})?$/, messagePt: "Use a sigla de 2 letras do estado (ex.: FL)." },
      showWhen,
      pdf: { kind: "dropdown", field: f.state },
    });
  }
  if (f.zip) {
    qs.push({
      id: `${idPrefix}_zip`,
      labelPt: "ZIP Code (só para endereço nos EUA)",
      type: "text",
      validate: { pattern: /^(\d{5}(-\d{4})?)?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
      showWhen,
      pdf: { kind: "text", field: f.zip },
    });
  }
  if (f.province) {
    qs.push({
      id: `${idPrefix}_province`,
      labelPt: "Estado/Província (fora dos EUA)",
      type: "text",
      passthroughEn: true,
      showWhen,
      pdf: { kind: "text", field: f.province },
    });
  }
  if (f.postal) {
    qs.push({
      id: `${idPrefix}_postal`,
      labelPt: "CEP / Postal Code (fora dos EUA)",
      type: "text",
      showWhen,
      pdf: { kind: "text", field: f.postal },
    });
  }
  if (f.country) {
    qs.push({
      id: `${idPrefix}_country`,
      labelPt: "País (em inglês)",
      type: "text",
      required,
      passthroughEn: true,
      showWhen,
      pdf: { kind: "text", field: f.country },
    });
  }
  return qs;
}

export const I129F: FormSpec = {
  id: "i-129f",
  code: "I-129F",
  officialName: "Petition for Alien Fiancé(e)",
  namePt: "Petição de Noivo(a) K-1 (preenchida pelo cidadão americano)",
  agency: "USCIS",
  officialUrl: "https://www.uscis.gov/i-129f",
  edition: "01/20/25",
  exportKind: "pdf",
  pdfAssetPath: "forms/i-129f.pdf",
  attachTo: { vistoId: "k1", documentoId: "i129f" },
  disclaimerPt:
    "Este formulário é preenchido e assinado pelo PETICIONÁRIO — o cidadão americano. O(a) NOIVO(A) " +
    "(quem vai receber o visto K-1 e viajar para os EUA) só entra como informação. A Immigrei é uma " +
    "ferramenta de preenchimento — não presta serviços jurídicos e não revisa o mérito do seu caso. " +
    "Confira cada campo e assine à mão antes de enviar ao USCIS.",

  sections: [
    // ── 1. Classificação + peticionário (Part 1, itens 1–6) ─────────────────
    {
      id: "classificacao",
      titlePt: "Quem é quem neste formulário",
      descriptionPt:
        "⚠️ O I-129F é preenchido pelo PETICIONÁRIO: o CIDADÃO AMERICANO. Quem vai receber o visto K-1 " +
        "é o(a) NOIVO(A) — ele(a) só entra como informação (não assina este formulário). " +
        "Este wizard cobre a via K-1 (noivo/a fora dos EUA).",
      questions: [
        {
          id: "pet_a_number",
          labelPt: "Seu A-Number (se tiver)",
          type: "text",
          pdf: { kind: "text", field: `${S0}Pt1Line1_AlienNumber[0]` },
        },
        {
          id: "pet_uscis_account",
          labelPt: "Sua conta online do USCIS (se tiver)",
          type: "text",
          pdf: { kind: "text", field: `${S0}Pt1Line2_AcctIdentifier[0]` },
        },
        {
          id: "pet_ssn",
          labelPt: "Seu Social Security Number",
          type: "text",
          pdf: { kind: "text", field: `${S0}Pt1Line3_SSN[0]` },
        },
        {
          id: "pet_family_name",
          labelPt: "Seu sobrenome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: [
            { kind: "text", field: `${S0}Pt1Line6a_FamilyName[0]` },
            { kind: "text", field: `${F}#subform[11].Pt1Line6a_FamilyName[1]` },
          ],
        },
        {
          id: "pet_given_name",
          labelPt: "Seu nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: [
            { kind: "text", field: `${S0}Pt1Line6b_GivenName[0]` },
            { kind: "text", field: `${F}#subform[11].Pt1Line6b_GivenName[1]` },
          ],
        },
        {
          id: "pet_middle_name",
          labelPt: "Seu nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: [
            { kind: "text", field: `${S0}Pt1Line6c_MiddleName[0]` },
            { kind: "text", field: `${F}#subform[11].Pt1Line6c_MiddleName[1]` },
          ],
        },
        {
          id: "pet_other_family_name",
          labelPt: "Outros nomes que você já usou — sobrenome",
          helpPt: "Em branco se nunca usou outro nome.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Pt1Line7a_FamilyName[0]` },
        },
        {
          id: "pet_other_given_name",
          labelPt: "Outros nomes — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Pt1Line7b_GivenName[0]` },
        },
      ],
    },

    // ── 2. Peticionário — endereço de correspondência (Part 1, item 8) ──────
    {
      id: "peticionario-endereco",
      titlePt: "Peticionário — seu endereço de correspondência",
      questions: [
        ...addressQuestions("pet_mail", "Endereço de correspondência", {
          inCareOf: `${S0}Pt1Line8_InCareofName[0]`,
          street: `${S0}Pt1Line8_StreetNumberName[0]`,
          unitApt: `${S0}Pt1Line8_Unit[1]`,
          unitSte: `${S0}Pt1Line8_Unit[2]`,
          unitFlr: `${S0}Pt1Line8_Unit[0]`,
          unitNumber: `${S0}Pt1Line8_AptSteFlrNumber[0]`,
          city: `${S0}Pt1Line8_CityOrTown[0]`,
          state: `${S0}Pt1Line8_State[0]`,
          zip: `${S0}Pt1Line8_ZipCode[0]`,
          province: `${S0}Pt1Line8_Province[0]`,
          postal: `${S0}Pt1Line8_PostalCode[0]`,
          country: `${S0}Pt1Line8_Country[0]`,
        }, { required: true }),
        {
          id: "pet_mail_same_as_physical",
          labelPt: "Esse é também o endereço onde você mora?",
          type: "radio",
          required: true,
          default: "yes",
          options: [
            { value: "yes", labelPt: "Sim, é o mesmo" },
            { value: "no", labelPt: "Não, moro em outro endereço" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S0}Pt1Line8j_Checkboxes[1]`, no: `${S0}Pt1Line8j_Checkboxes[0]` },
          },
        },
        ...addressQuestions("pet_phys1", "Endereço físico atual", {
          street: `${S1}Pt1Line9_StreetNumberName[0]`,
          unitApt: `${S1}Pt1Line9_Unit[1]`,
          unitSte: `${S1}Pt1Line9_Unit[2]`,
          unitFlr: `${S1}Pt1Line9_Unit[0]`,
          unitNumber: `${S1}Pt1Line9_AptSteFlrNumber[0]`,
          city: `${S1}Pt1Line9_CityOrTown[0]`,
          state: `${S1}Pt1Line9_State[0]`,
          zip: `${S1}Pt1Line9_ZipCode[0]`,
          province: `${S1}Pt1Line9_Province[0]`,
          postal: `${S1}Pt1Line9_PostalCode[0]`,
          country: `${S1}Pt1Line9_Country[0]`,
        }, { required: true, showWhen: { questionId: "pet_mail_same_as_physical", equals: "no" } }),
        {
          id: "pet_phys1_from",
          labelPt: "Morando nesse endereço desde",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S1}Pt1Line10a_DateFrom[0]`, transform: isoToUsDate },
        },
      ],
    },

    // ── 3. Peticionário — emprego (Part 1, itens 13–19) ─────────────────────
    {
      id: "peticionario-emprego",
      titlePt: "Peticionário — seu trabalho atual",
      descriptionPt: "Se desempregado, escreva Unemployed. Últimos 5 anos — mais empregos: adicione à mão na Parte 8.",
      questions: [
        {
          id: "pet_employer1_name",
          labelPt: "Empregador atual (ou \"Unemployed\")",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt1Line13_NameofEmployer[0]` },
        },
        ...addressQuestions("pet_employer1", "Endereço do empregador", {
          street: `${S1}Pt1Line14_StreetNumberName[0]`,
          unitApt: `${S1}Pt1Line14_Unit[1]`,
          unitSte: `${S1}Pt1Line14_Unit[2]`,
          unitFlr: `${S1}Pt1Line14_Unit[0]`,
          unitNumber: `${S1}Pt1Line14_AptSteFlrNumber[0]`,
          city: `${S1}Pt1Line14_CityOrTown[0]`,
          state: `${S1}Pt1Line14_State[0]`,
          zip: `${S1}Pt1Line14_ZipCode[0]`,
          province: `${S1}Pt1Line14_Province[0]`,
          postal: `${S1}Pt1Line14_PostalCode[0]`,
          country: `${S1}Pt1Line14_Country[0]`,
        }),
        {
          id: "pet_employer1_occupation",
          labelPt: "Sua ocupação",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt1Line15_Occupation[0]` },
        },
        {
          id: "pet_employer1_from",
          labelPt: "Trabalhando aí desde",
          type: "date",
          pdf: { kind: "text", field: `${S1}Pt1Line16a_DateFrom[0]`, transform: isoToUsDate },
        },
      ],
    },

    // ── 4. Peticionário — nascimento, sexo, estado civil (Part 1, 21–23) ────
    {
      id: "peticionario-pessoal",
      titlePt: "Peticionário — seus dados pessoais",
      questions: [
        {
          id: "pet_sex",
          labelPt: "Sexo (como nos seus documentos)",
          type: "radio",
          required: true,
          options: [
            { value: "male", labelPt: "Masculino" },
            { value: "female", labelPt: "Feminino" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { male: `${S2}Pt1Line21_Checkbox[0]`, female: `${S2}Pt1Line21_Checkbox[1]` },
          },
        },
        {
          id: "pet_dob",
          labelPt: "Sua data de nascimento",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S2}Pt1Line22_DateofBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "pet_marital_status",
          labelPt: "Seu estado civil atual",
          type: "radio",
          required: true,
          options: [
            { value: "single", labelPt: "Solteiro(a)" },
            { value: "married", labelPt: "Casado(a)" },
            { value: "divorced", labelPt: "Divorciado(a)" },
            { value: "widowed", labelPt: "Viúvo(a)" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              widowed: `${S2}Pt1Line23_Checkbox[0]`,
              divorced: `${S2}Pt1Line23_Checkbox[1]`,
              single: `${S2}Pt1Line23_Checkbox[2]`,
              married: `${S2}Pt1Line23_Checkbox[3]`,
            },
          },
        },
        {
          id: "pet_birth_city",
          labelPt: "Sua cidade de nascimento",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt1Line24_CityTownOfBirth[0]` },
        },
        {
          id: "pet_birth_state_province",
          labelPt: "Estado/Província de nascimento",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt1Line25_ProvinceOrStateOfBirth[0]` },
        },
        {
          id: "pet_birth_country",
          labelPt: "Seu país de nascimento (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S2}Pt1Line26_CountryOfCitzOrNationality[0]` },
        },
      ],
    },

    // ── 5. Peticionário — pais (Part 1, itens 27–36) ────────────────────────
    {
      id: "peticionario-pais",
      titlePt: "Peticionário — seus pais",
      questions: [
        {
          id: "pet_parent1_family",
          labelPt: "Pai/Mãe 1 — sobrenome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt1Line27a_FamilyName[0]` },
        },
        {
          id: "pet_parent1_given",
          labelPt: "Pai/Mãe 1 — nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt1Line27b_GivenName[0]` },
        },
        {
          id: "pet_parent1_dob",
          labelPt: "Pai/Mãe 1 — data de nascimento",
          type: "date",
          pdf: { kind: "text", field: `${S2}Pt1Line28_DateofBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "pet_parent1_sex",
          labelPt: "Pai/Mãe 1 — sexo",
          type: "radio",
          options: [
            { value: "male", labelPt: "Masculino" },
            { value: "female", labelPt: "Feminino" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { male: `${S2}Pt1Line29_Checkbox[0]`, female: `${S2}Pt1Line29_Checkbox[1]` },
          },
        },
        {
          id: "pet_parent1_birth_country",
          labelPt: "Pai/Mãe 1 — país de nascimento (em inglês)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt1Line30_CountryOfCitzOrNationality[0]` },
        },
        {
          id: "pet_parent1_res_city",
          labelPt: "Pai/Mãe 1 — cidade onde mora (ou \"Deceased\")",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt1Line31_CityTownOfBirth[0]` },
        },
        {
          id: "pet_parent1_res_country",
          labelPt: "Pai/Mãe 1 — país onde mora",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt1Line31_CountryOfCitzOrNationality[0]` },
        },
        {
          id: "pet_parent2_family",
          labelPt: "Pai/Mãe 2 — sobrenome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt1Line32a_FamilyName[0]` },
        },
        {
          id: "pet_parent2_given",
          labelPt: "Pai/Mãe 2 — nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt1Line32b_GivenName[0]` },
        },
        {
          id: "pet_parent2_dob",
          labelPt: "Pai/Mãe 2 — data de nascimento",
          type: "date",
          pdf: { kind: "text", field: `${S2}Pt1Line33_DateofBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "pet_parent2_sex",
          labelPt: "Pai/Mãe 2 — sexo",
          type: "radio",
          options: [
            { value: "male", labelPt: "Masculino" },
            { value: "female", labelPt: "Feminino" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { male: `${S2}Pt1Line34_Checkbox[0]`, female: `${S2}Pt1Line34_Checkbox[1]` },
          },
        },
        {
          id: "pet_parent2_birth_country",
          labelPt: "Pai/Mãe 2 — país de nascimento (em inglês)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt1Line35_CountryOfCitzOrNationality[0]` },
        },
        {
          id: "pet_parent2_res_city",
          labelPt: "Pai/Mãe 2 — cidade onde mora (ou \"Deceased\")",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt1Line36a_CityTownOfBirth[0]` },
        },
        {
          id: "pet_parent2_res_country",
          labelPt: "Pai/Mãe 2 — país onde mora",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt1Line36b_CountryOfCitzOrNationality[0]` },
        },
      ],
    },

    // ── 6. Peticionário — casamento anterior e cidadania (37–42) ────────────
    {
      id: "peticionario-civil-cidadania",
      titlePt: "Peticionário — casamento anterior e cidadania",
      questions: [
        yn("pet_previously_married", "Você já foi casado(a) antes?", `${S2}Pt1Line37_Checkboxes[0]`, `${S2}Pt1Line37_Checkboxes[1]`, { default: "no" }),
        {
          id: "pet_prior_spouse_family",
          labelPt: "Cônjuge anterior — sobrenome",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "pet_previously_married", equals: "yes" },
          pdf: { kind: "text", field: `${S2}Pt1Line38a_FamilyName[0]` },
        },
        {
          id: "pet_prior_spouse_given",
          labelPt: "Cônjuge anterior — nome",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "pet_previously_married", equals: "yes" },
          pdf: { kind: "text", field: `${S2}Pt1Line38b_GivenName[0]` },
        },
        {
          id: "pet_prior_marriage_ended",
          labelPt: "Data em que o casamento terminou",
          type: "date",
          showWhen: { questionId: "pet_previously_married", equals: "yes" },
          pdf: { kind: "text", field: `${S2}Pt1Line39_DateMarriageEnded[0]`, transform: isoToUsDate },
        },
        {
          id: "pet_citizenship_via",
          labelPt: "Você é cidadão americano através de:",
          type: "radio",
          required: true,
          options: [
            { value: "birth", labelPt: "Nascimento nos EUA" },
            { value: "naturalization", labelPt: "Naturalização" },
            { value: "parents", labelPt: "Pais cidadãos americanos" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              birth: `${S2}Pt1Line40_Checkbox[0]`,
              naturalization: `${S2}Pt1Line40_Checkbox[1]`,
              parents: `${S2}Pt1Line40_Checkbox[2]`,
            },
          },
        },
        yn(
          "pet_has_certificate",
          "Você tem Certificado de Naturalização ou de Cidadania em seu nome?",
          `${S3}Pt1Line43_Checkboxes[0]`,
          `${S3}Pt1Line43_Checkboxes[1]`,
          { showWhen: { questionId: "pet_citizenship_via", equals: "naturalization" } }
        ),
        {
          id: "pet_certificate_number",
          labelPt: "Número do certificado",
          type: "text",
          showWhen: { questionId: "pet_has_certificate", equals: "yes" },
          pdf: { kind: "text", field: `${S3}Pt1Line21a_CertificateNumber[0]` },
        },
        {
          id: "pet_certificate_place",
          labelPt: "Local de emissão",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "pet_has_certificate", equals: "yes" },
          pdf: { kind: "text", field: `${S3}Pt1Line21b_PlaceofIssuance[0]` },
        },
        {
          id: "pet_certificate_date",
          labelPt: "Data de emissão",
          type: "date",
          showWhen: { questionId: "pet_has_certificate", equals: "yes" },
          pdf: { kind: "text", field: `${S3}Pt1Line21c_DateOfIssuance[0]`, transform: isoToUsDate },
        },
      ],
    },

    // ── 7. Peticionário — petições anteriores e filhos (43–51) ──────────────
    {
      id: "peticionario-outros",
      titlePt: "Peticionário — outras informações",
      questions: [
        yn(
          "pet_prior_i129f",
          "Você já protocolou um I-129F para outro(a) beneficiário(a) antes?",
          `${S3}Pt1Line43_Checkboxes[0]`,
          `${S3}Pt1Line43_Checkboxes[1]`,
          { default: "no", helpPt: "Restrições de \"multiple filer\" podem exigir um waiver — se sim, converse com um profissional." }
        ),
        {
          id: "prior_ben_family",
          labelPt: "Beneficiário(a) anterior — sobrenome",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "pet_prior_i129f", equals: "yes" },
          pdf: { kind: "text", field: `${S3}Pt1Line45a_FamilyName[0]` },
        },
        {
          id: "prior_ben_given",
          labelPt: "Beneficiário(a) anterior — nome",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "pet_prior_i129f", equals: "yes" },
          pdf: { kind: "text", field: `${S3}Pt1Line45b_GivenName[0]` },
        },
        {
          id: "prior_ben_a_number",
          labelPt: "A-Number do beneficiário anterior (se houver)",
          type: "text",
          showWhen: { questionId: "pet_prior_i129f", equals: "yes" },
          pdf: { kind: "text", field: `${S3}Pt1Line44_AlienNumber[0]` },
        },
        {
          id: "prior_i129f_filing_date",
          labelPt: "Data do protocolo",
          type: "date",
          showWhen: { questionId: "pet_prior_i129f", equals: "yes" },
          pdf: { kind: "text", field: `${S3}Pt1Line46_DateOfFiling[0]`, transform: isoToUsDate },
        },
        {
          id: "prior_i129f_result",
          labelPt: "O que o USCIS decidiu (em inglês: approved, denied, revoked)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "pet_prior_i129f", equals: "yes" },
          pdf: { kind: "text", field: `${S3}Pt1Line47_Result[0]` },
        },
        yn("pet_has_children", "Você tem filhos menores de 18 anos?", `${S3}Pt1Line48_Checkboxes[0]`, `${S3}Pt1Line48_Checkboxes[1]`, { default: "no" }),
        {
          id: "pet_child1_age",
          labelPt: "Idade do filho(a) 1",
          type: "number",
          showWhen: { questionId: "pet_has_children", equals: "yes" },
          pdf: { kind: "text", field: `${S3}Pt1Line49a_Age[0]` },
        },
        {
          id: "pet_child2_age",
          labelPt: "Idade do filho(a) 2 (se houver — mais filhos: adicione à mão na Parte 8)",
          type: "number",
          showWhen: { questionId: "pet_has_children", equals: "yes" },
          pdf: { kind: "text", field: `${S3}Pt1Line49b_Age[0]` },
        },
        {
          id: "pet_residence1_state",
          labelPt: "Estados americanos onde você já morou desde os 18 anos — estado 1",
          type: "text",
          required: true,
          pdf: { kind: "dropdown", field: `${S3}Pt1Line50a_State[0]` },
        },
        {
          id: "pet_residence2_state",
          labelPt: "Estado 2 (se houver)",
          type: "text",
          pdf: { kind: "dropdown", field: `${S3}Pt1Line51a_State[0]` },
        },
      ],
    },

    // ── 8. Noivo(a) — identificação (Part 2, itens 1–10) ────────────────────
    {
      id: "noivo-identificacao",
      titlePt: "Noivo(a) — quem vai receber o visto K-1",
      descriptionPt: "Agora os dados do seu NOIVO(A) — a pessoa para quem você está peticionando.",
      questions: [
        {
          id: "ben_family_name",
          labelPt: "Sobrenome do(a) noivo(a) (como no passaporte)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S3}Pt2Line1a_FamilyName[0]` },
        },
        {
          id: "ben_given_name",
          labelPt: "Nome do(a) noivo(a)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S3}Pt2Line1b_GivenName[0]` },
        },
        {
          id: "ben_middle_name",
          labelPt: "Nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S3}Pt2Line1c_MiddleName[0]` },
        },
        {
          id: "ben_a_number",
          labelPt: "A-Number do(a) noivo(a) (se tiver)",
          type: "text",
          pdf: { kind: "text", field: `${S3}Pt2Line2_AlienNumber[0]` },
        },
        {
          id: "ben_ssn",
          labelPt: "SSN do(a) noivo(a) (se tiver)",
          type: "text",
          pdf: { kind: "text", field: `${S3}Pt2Line3_SSN[0]` },
        },
        {
          id: "ben_dob",
          labelPt: "Data de nascimento do(a) noivo(a)",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S3}Pt2Line4_DateOfBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "ben_sex",
          labelPt: "Sexo do(a) noivo(a)",
          type: "radio",
          required: true,
          options: [
            { value: "male", labelPt: "Masculino" },
            { value: "female", labelPt: "Feminino" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { male: `${S3}Pt2Line5_Checkboxes[0]`, female: `${S3}Pt2Line5_Checkboxes[1]` },
          },
        },
        {
          id: "ben_marital_status",
          labelPt: "Estado civil atual do(a) noivo(a)",
          type: "radio",
          required: true,
          options: [
            { value: "single", labelPt: "Solteiro(a)" },
            { value: "married", labelPt: "Casado(a)" },
            { value: "divorced", labelPt: "Divorciado(a)" },
            { value: "widowed", labelPt: "Viúvo(a)" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              widowed: `${S3}Pt2Line6_Checkboxes[0]`,
              divorced: `${S3}Pt2Line6_Checkboxes[1]`,
              single: `${S3}Pt2Line6_Checkboxes[2]`,
              married: `${S3}Pt2Line6_Checkboxes[3]`,
            },
          },
        },
        {
          id: "ben_birth_city",
          labelPt: "Cidade de nascimento do(a) noivo(a)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S3}Pt2Line7_CityTownOfBirth[0]` },
        },
        {
          id: "ben_birth_country",
          labelPt: "País de nascimento (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S3}Pt2Line8_CountryOfBirth[0]` },
        },
        {
          id: "ben_citizenship_country",
          labelPt: "País de cidadania (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S3}Pt2Line9_CountryofCitzOrNationality[0]` },
        },
        {
          id: "ben_other_family_name",
          labelPt: "Outros nomes que o(a) noivo(a) já usou — sobrenome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S3}Pt2Line10a_FamilyName[0]` },
        },
        {
          id: "ben_other_given_name",
          labelPt: "Outros nomes — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S3}Pt2Line10b_GivenName[0]` },
        },
      ],
    },

    // ── 9. Noivo(a) — endereços (Part 2, itens 11–15) ───────────────────────
    {
      id: "noivo-enderecos",
      titlePt: "Noivo(a) — endereços",
      questions: [
        ...addressQuestions("ben_mail", "Endereço de correspondência do(a) noivo(a)", {
          inCareOf: `${S4}Pt2Line11_InCareOfName[0]`,
          street: `${S4}Pt2Line11_StreetNumberName[0]`,
          unitApt: `${S4}Pt2Line11_Unit[2]`,
          unitSte: `${S4}Pt2Line11_Unit[0]`,
          unitFlr: `${S4}Pt2Line11_Unit[1]`,
          unitNumber: `${S4}Pt2Line11_AptSteFlrNumber[0]`,
          city: `${S4}Pt2Line11_CityOrTown[0]`,
          state: `${S4}Pt2Line11_State[0]`,
          zip: `${S4}Pt2Line11_ZipCode[0]`,
          province: `${S4}Pt2Line11_Province[0]`,
          postal: `${S4}Pt2Line11_PostalCode[0]`,
          country: `${S4}Pt2Line11_Country[0]`,
        }, { required: true }),
        ...addressQuestions("ben_phys1", "Endereço físico atual (se diferente do de correspondência)", {
          street: `${S4}Pt2Line12_StreetNumberName[0]`,
          unitApt: `${S4}Pt2Line12_Unit[1]`,
          unitSte: `${S4}Pt2Line12_Unit[2]`,
          unitFlr: `${S4}Pt2Line12_Unit[0]`,
          unitNumber: `${S4}Pt2Line12_AptSteFlrNumber[0]`,
          city: `${S4}Pt2Line12_CityOrTown[0]`,
          state: `${S4}Pt2Line12_State[0]`,
          zip: `${S4}Pt2Line12_ZipCode[0]`,
          province: `${S4}Pt2Line12_Province[0]`,
          postal: `${S4}Pt2Line12_PostalCode[0]`,
          country: `${S4}Pt2Line12_Country[0]`,
        }),
        {
          id: "ben_phys1_from",
          labelPt: "Morando aí desde",
          type: "date",
          pdf: { kind: "text", field: `${S4}Pt2Line13a_DateFrom[0]`, transform: isoToUsDate },
        },
      ],
    },

    // ── 10. Noivo(a) — emprego e pais (Part 2, itens 16, 24–33) ─────────────
    {
      id: "noivo-emprego-pais",
      titlePt: "Noivo(a) — trabalho e pais",
      questions: [
        {
          id: "ben_employer1_name",
          labelPt: "Empregador atual do(a) noivo(a) (ou \"Unemployed\")",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}Pt2Line16_NameofEmployer[0]` },
        },
        {
          id: "ben_employer1_occupation",
          labelPt: "Ocupação",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}Pt2Line18_Occupation[0]` },
        },
        {
          id: "ben_employer1_from",
          labelPt: "Trabalhando aí desde",
          type: "date",
          pdf: { kind: "text", field: `${S4}Pt2Line19a_DateFrom[0]`, transform: isoToUsDate },
        },
        {
          id: "ben_parent1_family",
          labelPt: "Pai/Mãe 1 do(a) noivo(a) — sobrenome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S5}Pt2Line24a_FamilyName[0]` },
        },
        {
          id: "ben_parent1_given",
          labelPt: "Pai/Mãe 1 — nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S5}Pt2Line24b_GivenName[0]` },
        },
        {
          id: "ben_parent1_birth_country",
          labelPt: "Pai/Mãe 1 — país de nascimento (em inglês)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S5}Pt2Line27_CountryOfCitzOrNationality[0]` },
        },
        {
          id: "ben_parent2_family",
          labelPt: "Pai/Mãe 2 do(a) noivo(a) — sobrenome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S5}Pt2Line29a_FamilyName[0]` },
        },
        {
          id: "ben_parent2_given",
          labelPt: "Pai/Mãe 2 — nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S5}Pt2Line29b_GivenName[0]` },
        },
        {
          id: "ben_parent2_birth_country",
          labelPt: "Pai/Mãe 2 — país de nascimento (em inglês)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S5}Pt2Line32_CountryOfCitzOrNationality[0]` },
        },
      ],
    },

    // ── 11. Noivo(a) — casamento anterior e entrada nos EUA (34–39) ─────────
    {
      id: "noivo-civil-entrada",
      titlePt: "Noivo(a) — casamento anterior e histórico nos EUA",
      questions: [
        yn(
          "ben_previously_married",
          "O(a) noivo(a) já foi casado(a) antes?",
          `${S5}Pt2Line34_Checkboxes[0]`,
          `${S5}Pt2Line34_Checkboxes[1]`,
          { default: "no" }
        ),
        {
          id: "ben_prior_spouse_family",
          labelPt: "Cônjuge anterior — sobrenome",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "ben_previously_married", equals: "yes" },
          pdf: { kind: "text", field: `${S5}Pt2Line35a_FamilyName[0]` },
        },
        {
          id: "ben_prior_marriage_ended",
          labelPt: "Data em que o casamento terminou",
          type: "date",
          showWhen: { questionId: "ben_previously_married", equals: "yes" },
          pdf: { kind: "text", field: `${S5}Pt2Line36_DateMarriageEnded[0]`, transform: isoToUsDate },
        },
        yn("ben_ever_in_us", "O(a) noivo(a) já esteve nos EUA?", `${S5}Pt2Line37_Checkboxes[0]`, `${S5}Pt2Line37_Checkboxes[1]`, { default: "no" }),
        {
          id: "ben_last_entry_as",
          labelPt: "Se sim: entrou como (em inglês — ex.: visitor, student)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "ben_ever_in_us", equals: "yes" },
          pdf: { kind: "text", field: `${S5}Pt2Line38a_LastArrivedAs[0]` },
        },
        {
          id: "ben_i94_number",
          labelPt: "Número do I-94 dessa entrada",
          type: "text",
          showWhen: { questionId: "ben_ever_in_us", equals: "yes" },
          pdf: { kind: "text", field: `${S5}Pt2Line38b_ArrivalDeparture[0]` },
        },
        {
          id: "ben_arrival_date",
          labelPt: "Data dessa chegada",
          type: "date",
          showWhen: { questionId: "ben_ever_in_us", equals: "yes" },
          pdf: { kind: "text", field: `${S5}Pt2Line38c_DateofArrival[0]`, transform: isoToUsDate },
        },
      ],
    },

    // ── 12. Noivo(a) — passaporte e endereços EUA/exterior (40–48) ──────────
    {
      id: "noivo-passaporte",
      titlePt: "Noivo(a) — passaporte e onde vai morar",
      questions: [
        {
          id: "ben_i94_expiry",
          labelPt: "Validade da estadia (I-94), se já esteve nos EUA",
          type: "text",
          showWhen: { questionId: "ben_ever_in_us", equals: "yes" },
          pdf: { kind: "text", field: `${S6}Pt2Line38d_DateExpired[0]` },
        },
        {
          id: "ben_passport_number",
          labelPt: "Número do passaporte",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S6}Pt2Line38e_Passport[0]` },
        },
        {
          id: "ben_travel_doc",
          labelPt: "Documento de viagem (se não for passaporte)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S6}Pt2Line38f_TravelDoc[0]` },
        },
        {
          id: "ben_passport_country",
          labelPt: "País emissor do passaporte (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S6}Pt2Line38g_CountryOfIssuance[0]` },
        },
        {
          id: "ben_passport_expiry",
          labelPt: "Validade do passaporte",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S6}Pt2Line38h_ExpDate[0]`, transform: isoToUsDate },
        },
        yn("ben_has_children", "O(a) noivo(a) tem filhos?", `${S6}Pt2Line39_Checkboxes[0]`, `${S6}Pt2Line39_Checkboxes[1]`, { default: "no" }),
        {
          id: "ben_child1_family",
          labelPt: "Filho(a) 1 do(a) noivo(a) — sobrenome",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "ben_has_children", equals: "yes" },
          pdf: { kind: "text", field: `${S6}Pt2Line40a_FamilyName[0]` },
        },
        {
          id: "ben_child1_given",
          labelPt: "Filho(a) 1 — nome",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "ben_has_children", equals: "yes" },
          pdf: { kind: "text", field: `${S6}Pt2Line40b_GivenName[0]` },
        },
        {
          id: "ben_child1_country",
          labelPt: "Filho(a) 1 — país de nascimento (em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "ben_has_children", equals: "yes" },
          pdf: { kind: "text", field: `${S6}Pt2Line41_CountryOfBirth[0]` },
        },
        {
          id: "ben_child1_dob",
          labelPt: "Filho(a) 1 — data de nascimento",
          type: "date",
          showWhen: { questionId: "ben_has_children", equals: "yes" },
          pdf: { kind: "text", field: `${S6}Pt2Line42_DateofBirth[0]`, transform: isoToUsDate },
        },
        yn(
          "ben_child1_resides_with",
          "Esse filho(a) mora com o(a) noivo(a)?",
          `${S6}Pt2Line43_Checkboxes[0]`,
          `${S6}Pt2Line43_Checkboxes[1]`,
          { showWhen: { questionId: "ben_has_children", equals: "yes" }, required: false }
        ),
        ...addressQuestions("ben_us_address", "Endereço nos EUA onde o(a) noivo(a) pretende morar", {
          street: `${S6}Pt2Line45a_StreetNumberName[0]`,
          unitApt: `${S6}Pt2Line45b_Unit[2]`,
          unitSte: `${S6}Pt2Line45b_Unit[0]`,
          unitFlr: `${S6}Pt2Line45b_Unit[1]`,
          unitNumber: `${S6}Pt2Line45b_AptSteFlrNumber[0]`,
          city: `${S6}Pt2Line45c_CityOrTown[0]`,
          state: `${S6}Pt2Line45d_State[0]`,
          zip: `${S6}Pt2Line45e_ZipCode[0]`,
        }, { required: true }),
        {
          id: "ben_us_daytime_phone",
          labelPt: "Telefone de contato do(a) noivo(a)",
          type: "text",
          pdf: { kind: "text", field: `${S6}Pt2Line46_DayTimeTelephoneNumber[0]` },
        },
        ...addressQuestions("ben_abroad_address", "Endereço físico do(a) noivo(a) no exterior", {
          street: `${S6}Pt2Line47_StreetNumberName[0]`,
          unitApt: `${S6}Pt2Line47_Unit[2]`,
          unitSte: `${S6}Pt2Line47_Unit[0]`,
          unitFlr: `${S6}Pt2Line47_Unit[1]`,
          unitNumber: `${S6}Pt2Line47_AptSteFlrNumber[0]`,
          city: `${S6}Pt2Line47_CityOrTown[0]`,
          province: `${S6}Pt2Line47_Province[0]`,
          postal: `${S6}Pt2Line47_PostalCode[0]`,
          country: `${S6}Pt2Line47_Country[0]`,
        }, { required: true }),
      ],
    },

    // ── 13. Relação, encontro pessoal e IMB (Part 2, itens 51–61) ───────────
    {
      id: "relacao-encontro",
      titlePt: "Sua relação com o(a) noivo(a)",
      descriptionPt:
        "O USCIS exige prova de que vocês se encontraram PESSOALMENTE nos últimos 2 anos antes do protocolo " +
        "— guarde fotos, passagens e carimbos de passaporte como evidência.",
      questions: [
        yn(
          "related_to_beneficiary",
          "Você e o(a) noivo(a) são parentes entre si?",
          `${S7}Pt2Line51_Checkboxes[0]`,
          `${S7}Pt2Line51_Checkboxes[1]`,
          { default: "no", helpPt: "Casamento entre parentes próximos pode não ser reconhecido — se sim, converse com um profissional." }
        ),
        {
          id: "relationship_degree",
          labelPt: "Se parentes: qual o grau (em inglês, ex.: third cousin)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "related_to_beneficiary", equals: "yes" },
          pdf: { kind: "text", field: `${S7}Pt2Line52_Relationship[0]` },
        },
        {
          id: "met_in_person",
          labelPt: "Vocês se encontraram PESSOALMENTE nos últimos 2 anos antes deste protocolo?",
          type: "radio",
          required: true,
          default: "yes",
          options: [
            { value: "yes", labelPt: "Sim" },
            { value: "no", labelPt: "Não" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S7}Pt2Line53_Checkboxes[0]`, no: `${S7}Pt2Line53_Checkboxes[1]` },
          },
        },
        {
          id: "met_in_person_description",
          labelPt: "Descreva as circunstâncias do encontro (onde, quando, por quanto tempo)",
          type: "text",
          required: true,
          showWhen: { questionId: "met_in_person", equals: "yes" },
          pdf: { kind: "text", field: `${S7}Pt2Line54_Describe[0]` },
        },
        {
          id: "met_in_person_exemption",
          labelPt: "Se NÃO se encontraram: explique o motivo da exceção",
          helpPt: "Exceções raras (costume religioso extremo, risco de saúde grave) — precisam de evidência forte. Converse com um profissional.",
          type: "text",
          showWhen: { questionId: "met_in_person", equals: "no" },
          pdf: { kind: "text", field: `${S7}Pt2Line54_Describe[0]` },
        },
        yn(
          "used_imb",
          "Vocês se conheceram através de um agente/site internacional de casamentos (International Marriage Broker)?",
          `${S7}Pt2Line55_Checkboxes[0]`,
          `${S7}Pt2Line55_Checkboxes[1]`,
          { default: "no" }
        ),
        {
          id: "imb_name",
          labelPt: "Nome do IMB (se houver)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "used_imb", equals: "yes" },
          pdf: { kind: "text", field: `${S7}Pt2Line56_IMBName[0]` },
        },
        {
          id: "imb_website",
          labelPt: "Site do IMB",
          type: "text",
          showWhen: { questionId: "used_imb", equals: "yes" },
          pdf: { kind: "text", field: `${S7}Pt2Line59_IMBWebsite[0]` },
        },
      ],
    },

    // ── 14. Processamento consular (Part 2, item 62) ────────────────────────
    {
      id: "processamento",
      titlePt: "Onde o(a) noivo(a) vai pedir o visto",
      questions: [
        {
          id: "consulate_city",
          labelPt: "Cidade do consulado americano",
          helpPt: "No Brasil, vistos K-1 são processados no Rio de Janeiro.",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Rio de Janeiro",
          pdf: { kind: "text", field: `${S7}Pt2Line62a_CityTown[0]` },
        },
        {
          id: "consulate_country",
          labelPt: "País do consulado (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S7}Pt2Line62b_Country[0]` },
        },
      ],
    },

    // ── 15. Parte 3 — histórico criminal (itens 1–4) ────────────────────────
    {
      id: "historico-criminal",
      titlePt: "Histórico criminal do peticionário",
      descriptionPt:
        "⚠️ Responda com sinceridade total — o objetivo dessas perguntas (exigidas pela lei IMBRA) é proteger " +
        "o(a) noivo(a). Registro apagado ou selado ainda conta. QUALQUER \"Sim\": converse com um profissional " +
        "antes de protocolar.",
      questions: [
        yn(
          "protection_order",
          "Você JÁ foi alvo de uma ordem de proteção ou restrição (temporária ou permanente, civil ou criminal)?",
          `${S7}Pt3Line1_Checkboxes[0]`,
          `${S7}Pt3Line1_Checkboxes[1]`,
          { default: "no" }
        ),
        yn(
          "crime_domestic",
          "Você JÁ foi preso(a) ou condenado(a) por violência doméstica, agressão sexual, abuso/negligência infantil, stalking ou tentativa desses crimes?",
          `${S7}P3Line2a_Checkboxes[0]`,
          `${S7}P3Line2a_Checkboxes[1]`,
          { default: "no" }
        ),
        yn(
          "crime_violent",
          "Você JÁ foi preso(a) ou condenado(a) por homicídio, estupro, tráfico de pessoas, sequestro ou tentativa desses crimes?",
          `${S8}P3Line2b_Checkboxes[0]`,
          `${S8}P3Line2b_Checkboxes[1]`,
          { default: "no" }
        ),
        yn(
          "crime_substance",
          "Você JÁ teve 3+ prisões/condenações (não do mesmo ato) por crimes de substância controlada ou álcool?",
          `${S8}P3Line2c_Checkboxes[0]`,
          `${S8}P3Line2c_Checkboxes[1]`,
          { default: "no" }
        ),
      ],
    },

    // ── 16. Parte 4 — biográfico (itens 1–6) ────────────────────────────────
    {
      id: "biografico",
      titlePt: "Peticionário — informações biográficas",
      questions: [
        {
          id: "pet_ethnicity",
          labelPt: "Etnia",
          type: "radio",
          required: true,
          options: [
            { value: "hispanic", labelPt: "Hispânico ou latino" },
            { value: "not_hispanic", labelPt: "Não hispânico ou latino" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { hispanic: `${S8}Pt4Line1_Checkbox[1]`, not_hispanic: `${S8}Pt4Line1_Checkbox[0]` },
          },
        },
        {
          id: "pet_race_white",
          labelPt: "Raça — Branca",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S8}Pt4Line2_Checkbox[2]` },
        },
        {
          id: "pet_race_black",
          labelPt: "Raça — Negra ou afro-americana",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S8}Pt4Line2_Checkbox[4]` },
        },
        {
          id: "pet_race_asian",
          labelPt: "Raça — Asiática",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S8}Pt4Line2_Checkbox[3]` },
        },
        {
          id: "pet_race_indigenous",
          labelPt: "Raça — Indígena americana ou nativa do Alasca",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S8}Pt4Line2_Checkbox[1]` },
        },
        {
          id: "pet_race_pacific",
          labelPt: "Raça — Nativa do Havaí ou ilhas do Pacífico",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S8}Pt4Line2_Checkbox[0]` },
        },
        {
          id: "pet_height_feet",
          labelPt: "Altura — pés",
          type: "select",
          required: true,
          options: ["2", "3", "4", "5", "6", "7", "8"].map((v) => ({ value: v, labelPt: v })),
          pdf: { kind: "dropdown", field: `${S8}Pt4Line3_HeightFeet[0]` },
        },
        {
          id: "pet_height_inches",
          labelPt: "Altura — polegadas (0 a 11)",
          type: "select",
          required: true,
          options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"].map((v) => ({
            value: v,
            labelPt: v,
          })),
          pdf: { kind: "dropdown", field: `${S8}Pt4Line3_HeightInches[0]` },
        },
        {
          id: "pet_weight",
          labelPt: "Peso em libras (1kg = 2,2 lb)",
          type: "number",
          required: true,
          validate: { pattern: /^\d{2,3}$/, messagePt: "Digite o peso em libras (2 ou 3 dígitos)." },
          pdf: [
            {
              kind: "text",
              field: `${S8}Pt4Line4_HeightInches1[0]`,
              transform: (v) => String(v ?? "").padStart(3, "0").charAt(0),
            },
            {
              kind: "text",
              field: `${S8}Pt4Line4_HeightInches2[0]`,
              transform: (v) => String(v ?? "").padStart(3, "0").charAt(1),
            },
            {
              kind: "text",
              field: `${S8}Pt4Line4_HeightInches3[0]`,
              transform: (v) => String(v ?? "").padStart(3, "0").charAt(2),
            },
          ],
        },
        {
          id: "pet_eye_color",
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
              blue: `${S8}Pt4Line5_Checkbox[0]`,
              gray: `${S8}Pt4Line5_Checkbox[1]`,
              hazel: `${S8}Pt4Line5_Checkbox[2]`,
              pink: `${S8}Pt4Line5_Checkbox[3]`,
              maroon: `${S8}Pt4Line5_Checkbox[4]`,
              green: `${S8}Pt4Line5_Checkbox[5]`,
              brown: `${S8}Pt4Line5_Checkbox[6]`,
              black: `${S8}Pt4Line5_Checkbox[7]`,
              other: `${S8}Pt4Line5_Checkbox[8]`,
            },
          },
        },
        {
          id: "pet_hair_color",
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
              bald: `${S8}Pt4Line6_HairColor[0]`,
              blond: `${S8}Pt4Line6_HairColor[1]`,
              gray: `${S8}Pt4Line6_HairColor[2]`,
              sandy: `${S8}Pt4Line6_HairColor[3]`,
              other: `${S8}Pt4Line6_HairColor[4]`,
              white: `${S8}Pt4Line6_HairColor[5]`,
              red: `${S8}Pt4Line6_HairColor[6]`,
              brown: `${S8}Pt4Line6_HairColor[7]`,
              black: `${S8}Pt4Line6_HairColor[8]`,
            },
          },
        },
        yn(
          "pet_ever_arrested",
          "Você JÁ foi preso(a), citado(a), acusado(a), indiciado(a), condenado(a), multado(a) ou preso(a) por violar qualquer lei (fora infrações de trânsito comuns)?",
          `${S8}Part3Line4a_Checkboxes[1]`,
          `${S8}Part3Line4a_Checkboxes[0]`,
          { default: "no", helpPt: "Infração de trânsito só conta se envolveu álcool/drogas ou multa de US$500+." }
        ),
        {
          id: "pet_arrest_details",
          labelPt: "Se sim: descreva cada ocorrência (datas, local, resultado)",
          type: "text",
          showWhen: { questionId: "pet_ever_arrested", equals: "yes" },
          pdf: { kind: "text", field: `${S8}Pt3Line4B_Describe[0]` },
        },
      ],
    },

    // ── 17. Contato do peticionário (Part 5) ────────────────────────────────
    {
      id: "contato",
      titlePt: "Seu contato",
      descriptionPt: "A assinatura é à mão, na versão impressa — o Immigrei nunca assina por você.",
      questions: [
        {
          id: "pet_daytime_phone",
          labelPt: "Seu telefone",
          type: "text",
          required: true,
          pdf: { kind: "text", field: `${S9}Pt5Line1_DaytimePhoneNumber1[0]` },
        },
        {
          id: "pet_mobile_phone",
          labelPt: "Seu celular",
          type: "text",
          pdf: { kind: "text", field: `${S9}Pt5Line2_MobileNumber1[0]` },
        },
        {
          id: "pet_email",
          labelPt: "Seu e-mail",
          type: "text",
          prefillFrom: "email",
          pdf: { kind: "text", field: `${S9}Pt5Line3_Email[0]` },
        },
      ],
    },
  ],
};
