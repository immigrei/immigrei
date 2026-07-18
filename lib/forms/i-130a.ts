/**
 * I-130A — Supplemental Information for Spouse Beneficiary.
 *
 * Data-driven spec for the I-130 supplement. WHO FILLS THIS FORM: the SPOUSE
 * BENEFICIARY — the person who WILL RECEIVE the green card (the immigrant),
 * when the I-130 petition is for a spouse. It travels in the same envelope as
 * the I-130 filed by the petitioner. Every PT-BR label makes that explicit,
 * per product decision (Jul/2026). If the beneficiary lives outside the US,
 * the form does not need to be signed (per the official instructions printed
 * on page 1).
 *
 * Field names extracted from the official edition 04/01/24 asset at
 * public/forms/i-130a.pdf and disambiguated by widget position. Quirks:
 *   - Parent 1's residence fields are mislabeled internally:
 *     `Pt1Line14_CountryofBirth[0]` is actually item 15 (city of residence);
 *     `Pt1Line13_CountryofBirth[0]` is item 14 (country of birth).
 *   - Parent 2's fields are shifted one line down the same way
 *     (`Pt1Line17_DateofBirth` = item 18, `Pt1Line19_CountryofBirth` = item 21,
 *     `Pt1Line20_CityTownVillageofRes` = item 22, etc.).
 *   - The name and A-Number repeat on page 6 (Part 7 header) as index [1].
 *
 * Ministerial engine: transcribes only. Signature, interpreter (Part 5) and
 * preparer (Part 6) blocks are intentionally left blank.
 */

import type { FormSpec, Question } from "./types";

// AcroForm subform prefixes (one per page of the I-130A).
const F = "form1[0].";
const S0 = `${F}#subform[0].`; // page 1
const S1 = `${F}#subform[1].`; // page 2
const S2 = `${F}#subform[2].`; // page 3
const S5 = `${F}#subform[5].`; // page 6 (Part 7 header)

// ISO yyyy-mm-dd (how we store dates) -> USCIS mm/dd/yyyy text.
function isoToUsDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
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
};

function addressQuestions(
  idPrefix: string,
  labelPt: string,
  f: AddressFieldNames,
  opts: { required?: boolean; helpPt?: string } = {}
): Question[] {
  const { required = false, helpPt } = opts;
  const qs: Question[] = [
    {
      id: `${idPrefix}_street`,
      labelPt: `${labelPt} — rua e número`,
      helpPt,
      type: "text",
      required,
      passthroughEn: true,
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
      pdf: {
        kind: "checkboxChoice",
        fieldByValue: { apt: f.unitApt, ste: f.unitSte, flr: f.unitFlr },
      },
    },
    {
      id: `${idPrefix}_unit_number`,
      labelPt: "Número do complemento",
      type: "text",
      passthroughEn: true,
      pdf: { kind: "text", field: f.unitNumber },
    },
    {
      id: `${idPrefix}_city`,
      labelPt: "Cidade",
      type: "text",
      required,
      passthroughEn: true,
      pdf: { kind: "text", field: f.city },
    },
  ];
  if (f.state) {
    qs.push({
      id: `${idPrefix}_state`,
      labelPt: "Estado americano (sigla — deixe em branco se fora dos EUA)",
      type: "text",
      placeholder: "FL",
      validate: { pattern: /^([A-Za-z]{2})?$/, messagePt: "Use a sigla de 2 letras do estado (ex.: FL)." },
      pdf: { kind: "dropdown", field: f.state },
    });
  }
  if (f.zip) {
    qs.push({
      id: `${idPrefix}_zip`,
      labelPt: "ZIP Code (só nos EUA)",
      type: "text",
      validate: { pattern: /^(\d{5}(-\d{4})?)?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
      pdf: { kind: "text", field: f.zip },
    });
  }
  if (f.province) {
    qs.push({
      id: `${idPrefix}_province`,
      labelPt: "Estado/Província (fora dos EUA)",
      type: "text",
      passthroughEn: true,
      pdf: { kind: "text", field: f.province },
    });
  }
  if (f.postal) {
    qs.push({
      id: `${idPrefix}_postal`,
      labelPt: "CEP / Postal Code (fora dos EUA)",
      type: "text",
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
      pdf: { kind: "text", field: f.country },
    });
  }
  return qs;
}

export const I130A: FormSpec = {
  id: "i-130a",
  code: "I-130A",
  officialName: "Supplemental Information for Spouse Beneficiary",
  namePt: "Suplemento do Cônjuge (preenchido por quem vai receber o green card)",
  agency: "USCIS",
  officialUrl: "https://www.uscis.gov/i-130",
  edition: "04/01/24",
  exportKind: "pdf",
  pdfAssetPath: "forms/i-130a.pdf",
  attachTo: { vistoId: "familia-ir", documentoId: "i130a" },
  disclaimerPt:
    "Este formulário é preenchido pelo CÔNJUGE BENEFICIÁRIO — quem vai receber o green card. " +
    "Ele acompanha o I-130 protocolado pelo cônjuge cidadão/residente, no mesmo envelope. " +
    "A Immigrei é uma ferramenta de preenchimento — não presta serviços jurídicos e não revisa " +
    "o mérito do seu caso. Confira cada campo antes de enviar. Se você mora fora dos EUA, não precisa assinar.",

  sections: [
    // ── 1. Quem preenche + identificação (Part 1, itens 1–3) ────────────────
    {
      id: "identificacao",
      titlePt: "Quem preenche este formulário",
      descriptionPt:
        "⚠️ O I-130A é preenchido por VOCÊ, o cônjuge BENEFICIÁRIO — quem VAI RECEBER o green card. " +
        "O seu cônjuge cidadão/residente (o peticionário) preenche o I-130; este suplemento vai junto. " +
        "Todas as perguntas a seguir são sobre VOCÊ, o beneficiário.",
      questions: [
        {
          id: "a_number",
          labelPt: "Seu A-Number (se tiver)",
          helpPt: "A maioria de quem nunca teve processo nos EUA não tem — deixe em branco.",
          type: "text",
          pdf: [
            { kind: "text", field: `${S0}Pt1Line1_AlienNumber[0]` },
            { kind: "text", field: `${S5}Pt1Line1_AlienNumber[1]` },
          ],
        },
        {
          id: "uscis_account",
          labelPt: "Sua conta online do USCIS (se tiver)",
          type: "text",
          pdf: { kind: "text", field: `${S0}#area[1].Pt2Line3_USCISELISActNumber[0]` },
        },
        {
          id: "family_name",
          labelPt: "Seu sobrenome (como no passaporte)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: [
            { kind: "text", field: `${S0}Pt1Line3a_FamilyName[0]` },
            { kind: "text", field: `${S5}Pt1Line3a_FamilyName[1]` },
          ],
        },
        {
          id: "given_name",
          labelPt: "Seu nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: [
            { kind: "text", field: `${S0}Pt1Line3b_GivenName[0]` },
            { kind: "text", field: `${S5}Pt1Line3b_GivenName[1]` },
          ],
        },
        {
          id: "middle_name",
          labelPt: "Seu nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: [
            { kind: "text", field: `${S0}Pt1Line3c_MiddleName[0]` },
            { kind: "text", field: `${S5}Pt1Line3c_MiddleName[1]` },
          ],
        },
      ],
    },

    // ── 2. Histórico de endereços (Part 1, itens 4–8) ───────────────────────
    {
      id: "enderecos",
      titlePt: "Seus endereços — últimos 5 anos",
      descriptionPt:
        "O USCIS pede onde você morou nos últimos 5 anos, começando pelo endereço atual. " +
        "Mais endereços que os dois abaixo: adicione à mão na Parte 7.",
      questions: [
        ...addressQuestions("addr1", "Endereço atual", {
          street: `${S0}Pt1Line4a_StreetNumberName[0]`,
          unitApt: `${S0}Pt1Line4b_Unit[0]`,
          unitSte: `${S0}Pt1Line4b_Unit[1]`,
          unitFlr: `${S0}Pt1Line4b_Unit[2]`,
          unitNumber: `${S0}Pt1Line4b_AptSteFlrNumber[0]`,
          city: `${S0}Pt1Line4c_CityOrTown[0]`,
          state: `${S0}Pt1Line4d_State[0]`,
          zip: `${S0}Pt1Line4e_ZipCode[0]`,
          province: `${S0}Pt1Line4f_Province[0]`,
          postal: `${S0}Pt1Line4g_PostalCode[0]`,
          country: `${S0}Pt1Line4h_Country[0]`,
        }, { required: true }),
        {
          id: "addr1_from",
          labelPt: "Morando aí desde",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S0}Pt1Line5a_DateFrom[0]`, transform: isoToUsDate },
        },
        ...addressQuestions("addr2", "Endereço anterior (se houver, dentro dos últimos 5 anos)", {
          street: `${S0}Pt1Line6a_StreetNumberName[0]`,
          unitApt: `${S0}Pt1Line6b_Unit[0]`,
          unitSte: `${S0}Pt1Line6b_Unit[1]`,
          unitFlr: `${S0}Pt1Line6b_Unit[2]`,
          unitNumber: `${S0}Pt1Line6b_AptSteFlrNumber[0]`,
          city: `${S0}Pt1Line6c_CityOrTown[0]`,
          state: `${S0}Pt1Line6d_State[0]`,
          zip: `${S0}Pt1Line6e_ZipCode[0]`,
          province: `${S0}Pt1Line6f_Province[0]`,
          postal: `${S0}Pt1Line6g_PostalCode[0]`,
          country: `${S0}Pt1Line6h_Country[0]`,
        }),
        {
          id: "addr2_from",
          labelPt: "Endereço anterior — de",
          type: "date",
          pdf: { kind: "text", field: `${S0}Pt1Line7a_DateFrom[0]`, transform: isoToUsDate },
        },
        {
          id: "addr2_to",
          labelPt: "Endereço anterior — até",
          type: "date",
          pdf: { kind: "text", field: `${S0}Pt1Line7b_DateTo[0]`, transform: isoToUsDate },
        },
        {
          id: "last_abroad_street",
          labelPt: "Último endereço FORA dos EUA onde morou por mais de 1 ano — rua e número",
          helpPt: "Mesmo que já esteja listado acima. Se você mora no Brasil, repita o endereço atual.",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Pt1Line8a_StreetNumberName[0]` },
        },
        {
          id: "last_abroad_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Pt1Line8c_CityOrTown[0]` },
        },
        {
          id: "last_abroad_province",
          labelPt: "Estado/Província",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Pt1Line8d_Province[0]` },
        },
        {
          id: "last_abroad_postal",
          labelPt: "CEP / Postal Code",
          type: "text",
          pdf: { kind: "text", field: `${S0}Pt1Line8e_PostalCode[0]` },
        },
        {
          id: "last_abroad_country",
          labelPt: "País (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S0}Pt1Line8f_Country[0]` },
        },
        {
          id: "last_abroad_from",
          labelPt: "Morou aí de",
          type: "date",
          pdf: { kind: "text", field: `${S1}Pt1Line9a_DateFrom[0]`, transform: isoToUsDate },
        },
        {
          id: "last_abroad_to",
          labelPt: "até",
          type: "date",
          pdf: { kind: "text", field: `${S1}Pt1Line9b_DateTo[0]`, transform: isoToUsDate },
        },
      ],
    },

    // ── 3. Seus pais (Part 1, itens 10–23) ──────────────────────────────────
    {
      id: "pais",
      titlePt: "Seus pais",
      descriptionPt: "Dados dos SEUS pais (do beneficiário). Falecidos: escreva \"Deceased\" na residência.",
      questions: [
        {
          id: "parent1_family",
          labelPt: "Pai/Mãe 1 — sobrenome (de solteira, se mãe)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt1Line10_FamilyName[0]` },
        },
        {
          id: "parent1_given",
          labelPt: "Pai/Mãe 1 — nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt1Line10_GivenName[0]` },
        },
        {
          id: "parent1_middle",
          labelPt: "Pai/Mãe 1 — nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt1Line10_MiddleName[0]` },
        },
        {
          id: "parent1_dob",
          labelPt: "Pai/Mãe 1 — data de nascimento",
          type: "date",
          pdf: { kind: "text", field: `${S1}Pt1Line11_DateofBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "parent1_sex",
          labelPt: "Pai/Mãe 1 — sexo",
          type: "radio",
          options: [
            { value: "male", labelPt: "Masculino" },
            { value: "female", labelPt: "Feminino" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { male: `${S1}Pt1Line12_Male[0]`, female: `${S1}Pt1Line12_Female[0]` },
          },
        },
        {
          id: "parent1_birth_city",
          labelPt: "Pai/Mãe 1 — cidade de nascimento",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt1Line12CityTownOfBirth[0]` },
        },
        {
          id: "parent1_birth_country",
          labelPt: "Pai/Mãe 1 — país de nascimento (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S1}Pt1Line13_CountryofBirth[0]` },
        },
        {
          id: "parent1_res_city",
          labelPt: "Pai/Mãe 1 — cidade onde mora (ou \"Deceased\")",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt1Line14_CountryofBirth[0]` },
        },
        {
          id: "parent1_res_country",
          labelPt: "Pai/Mãe 1 — país onde mora",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt1Line15_CountryofResidence[0]` },
        },
        {
          id: "parent2_family",
          labelPt: "Pai/Mãe 2 — sobrenome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt1Line16_FamilyName[0]` },
        },
        {
          id: "parent2_given",
          labelPt: "Pai/Mãe 2 — nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt1Line16_GivenName[0]` },
        },
        {
          id: "parent2_middle",
          labelPt: "Pai/Mãe 2 — nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt1Line16_MiddleName[0]` },
        },
        {
          id: "parent2_dob",
          labelPt: "Pai/Mãe 2 — data de nascimento",
          type: "date",
          pdf: { kind: "text", field: `${S1}Pt1Line17_DateofBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "parent2_sex",
          labelPt: "Pai/Mãe 2 — sexo",
          type: "radio",
          options: [
            { value: "male", labelPt: "Masculino" },
            { value: "female", labelPt: "Feminino" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { male: `${S1}Pt1Line19_Male[0]`, female: `${S1}Pt1Line19_Female[0]` },
          },
        },
        {
          id: "parent2_birth_city",
          labelPt: "Pai/Mãe 2 — cidade de nascimento",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt1Line18_CityTownOfBirth[0]` },
        },
        {
          id: "parent2_birth_country",
          labelPt: "Pai/Mãe 2 — país de nascimento (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S1}Pt1Line19_CountryofBirth[0]` },
        },
        {
          id: "parent2_res_city",
          labelPt: "Pai/Mãe 2 — cidade onde mora (ou \"Deceased\")",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt1Line20_CityTownVillageofRes[0]` },
        },
        {
          id: "parent2_res_country",
          labelPt: "Pai/Mãe 2 — país onde mora",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt1Line21_CountryofResidence[0]` },
        },
      ],
    },

    // ── 4. Seu trabalho (Part 2 + Part 3) ───────────────────────────────────
    {
      id: "emprego",
      titlePt: "Seu trabalho — últimos 5 anos",
      descriptionPt:
        "Comece pelo emprego atual. Se estiver desempregado(a), escreva \"Unemployed\" no nome do empregador. " +
        "Mais empregos: adicione à mão na Parte 7.",
      questions: [
        {
          id: "employer1_name",
          labelPt: "Empregador atual (ou \"Unemployed\")",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt2Line1_EmployerOrCompName[0]` },
        },
        ...addressQuestions("employer1", "Endereço do empregador atual", {
          street: `${S1}Pt2Line2a_StreetNumberName[0]`,
          unitApt: `${S1}Pt2Line2b_Unit[0]`,
          unitSte: `${S1}Pt2Line2b_Unit[1]`,
          unitFlr: `${S1}Pt2Line2b_Unit[2]`,
          unitNumber: `${S1}Pt2Line2b_AptSteFlrNumber[0]`,
          city: `${S1}Pt2Line2c_CityOrTown[0]`,
          state: `${S1}Pt2Line2d_State[0]`,
          zip: `${S1}Pt2Line2e_ZipCode[0]`,
          province: `${S1}Pt2Line2f_Province[0]`,
          postal: `${S1}Pt2Line2g_PostalCode[0]`,
          country: `${S1}Pt2Line2h_Country[0]`,
        }),
        {
          id: "employer1_occupation",
          labelPt: "Sua ocupação",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt2Line3_Occupation[0]` },
        },
        {
          id: "employer1_from",
          labelPt: "Trabalhando aí desde",
          type: "date",
          pdf: { kind: "text", field: `${S1}Pt2Line4a_DateFrom[0]`, transform: isoToUsDate },
        },
        {
          id: "employer2_name",
          labelPt: "Empregador anterior (se houver, nos últimos 5 anos)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt2Line5_EmployerOrCompName[0]` },
        },
        {
          id: "employer2_occupation",
          labelPt: "Ocupação nesse emprego",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt2Line7_Occupation[0]` },
        },
        {
          id: "employer2_from",
          labelPt: "De",
          type: "date",
          pdf: { kind: "text", field: `${S2}Pt2Line8a_DateFrom[0]`, transform: isoToUsDate },
        },
        {
          id: "employer2_to",
          labelPt: "até",
          type: "date",
          pdf: { kind: "text", field: `${S2}Pt2Line8b_DateTo[0]`, transform: isoToUsDate },
        },
        {
          id: "abroad_employer_name",
          labelPt: "Seu último emprego FORA dos EUA (se não listado acima) — empregador",
          helpPt: "Se você mora e trabalha no Brasil, o emprego atual acima já cobre isto — deixe em branco.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt3Line1_EmployerOrCompName[0]` },
        },
        {
          id: "abroad_employer_occupation",
          labelPt: "Ocupação nesse emprego",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt3Line3_Occupation[0]` },
        },
        {
          id: "abroad_employer_from",
          labelPt: "De",
          type: "date",
          pdf: { kind: "text", field: `${S2}Pt3Line4a_DateFrom[0]`, transform: isoToUsDate },
        },
        {
          id: "abroad_employer_to",
          labelPt: "até",
          type: "date",
          pdf: { kind: "text", field: `${S2}Pt3Line4b_DateTo[0]`, transform: isoToUsDate },
        },
      ],
    },

    // ── 5. Seu contato (Part 4) ─────────────────────────────────────────────
    {
      id: "contato",
      titlePt: "Seu contato",
      descriptionPt:
        "A assinatura é à mão, na versão impressa — e se você mora FORA dos EUA, o I-130A nem precisa ser assinado.",
      questions: [
        {
          id: "daytime_phone",
          labelPt: "Seu telefone",
          type: "text",
          required: true,
          pdf: { kind: "text", field: `${S2}Pt4Line3_DaytimePhoneNumber1[0]` },
        },
        {
          id: "mobile_phone",
          labelPt: "Seu celular",
          type: "text",
          pdf: { kind: "text", field: `${S2}Pt4Line4_MobileNumber1[0]` },
        },
        {
          id: "email",
          labelPt: "Seu e-mail",
          type: "text",
          prefillFrom: "email",
          pdf: { kind: "text", field: `${S2}Pt4Line5_Email[0]` },
        },
      ],
    },
  ],
};
