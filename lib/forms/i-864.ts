/**
 * I-864 — Affidavit of Support Under Section 213A of the INA.
 *
 * Data-driven spec for the financial-sponsorship contract that accompanies
 * every family petition. WHO FILLS THIS FORM: the SPONSOR — in the familia-ir
 * flow, the same US citizen / green-card relative who filed the I-130
 * (petitioner). The immigrant who will receive the green card appears as the
 * "principal immigrant" (Part 3) but does not sign. PT-BR labels keep that
 * explicit, matching the I-130/I-130A convention.
 *
 * Field names extracted from the official edition 10/17/24 asset at
 * public/forms/i-864.pdf, disambiguated by widget position. This PDF's
 * internal prefixes are scrambled (verified positionally):
 *   - The SPONSOR's name/address/birth/SSN fields use the `P4_Line*` prefix
 *     (pages 1-2), e.g. `P4_Line1a_FamilyName` = Part 2 Item 1.
 *   - The PRINCIPAL IMMIGRANT (Part 3) uses `P2_Line*` (page 3).
 *   - The sponsored family members of Part 4 use `P3_Line*` (pages 3-4).
 *   - Part 1's six basis checkboxes are one array, `P1_Line1a-f_CB[0..5]`.
 *   - The sponsor's citizen/national/LPR boxes are `P4_Line11a/b/c_Checkbox`.
 *
 * Scope (MVP): petitioner-sponsor filing for the principal immigrant alone
 * (the familia-ir consular flow). Joint sponsors, I-864A household-member
 * income (Part 6 items 8-14) and extra sponsored family members are left for
 * the applicant to complete by hand — the engine never computes eligibility,
 * poverty-guideline math included (the sponsor copies totals from their own
 * documents). Signature, interpreter and preparer blocks stay blank.
 */

import type { FormSpec } from "./types";

// AcroForm subform prefixes (one per page of the I-864).
const F = "form1[0].";
const S0 = `${F}#subform[0].`; // page 1
const S1 = `${F}#subform[1].`; // page 2
const S2 = `${F}#subform[2].`; // page 3
const S4 = `${F}#subform[4].`; // page 5
const S5 = `${F}#subform[5].`; // page 6
const S6 = `${F}#subform[6].`; // page 7
const S9 = `${F}#subform[9].`; // page 10

// ISO yyyy-mm-dd (how we store dates) -> USCIS mm/dd/yyyy text.
function isoToUsDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

export const I864: FormSpec = {
  id: "i-864",
  code: "I-864",
  officialName: "Affidavit of Support Under Section 213A of the INA",
  namePt: "Termo de Sustento (preenchido pelo parente cidadão/residente)",
  agency: "USCIS",
  officialUrl: "https://www.uscis.gov/i-864",
  edition: "10/17/24",
  exportKind: "pdf",
  pdfAssetPath: "forms/i-864.pdf",
  attachTo: { vistoId: "familia-ir", documentoId: "i864" },
  disclaimerPt:
    "Este formulário é preenchido e assinado pelo PATROCINADOR — o mesmo parente cidadão/residente " +
    "que protocolou o I-130. Ao assinar, ele assume um contrato financeiro com o governo americano. " +
    "A Immigrei é uma ferramenta de preenchimento — não presta serviços jurídicos, não calcula " +
    "elegibilidade de renda e não revisa o mérito do seu caso. Confira os valores com a tabela " +
    "I-864P (Federal Poverty Guidelines) e assine à mão antes de enviar.",

  sections: [
    // ── 1. Quem é quem + base do patrocínio (Part 1) ────────────────────────
    {
      id: "base",
      titlePt: "Quem preenche e por quê",
      descriptionPt:
        "⚠️ O I-864 é preenchido pelo PATROCINADOR: o parente cidadão/green card que fez o I-130 " +
        "(no nosso fluxo, a mesma pessoa). Quem vai receber o green card entra como \"imigrante principal\" " +
        "e não assina. Ao assinar, o patrocinador se compromete a manter o imigrante em pelo menos 125% " +
        "da linha de pobreza federal — é um contrato de verdade.",
      questions: [
        {
          id: "basis",
          labelPt: "Por que você está apresentando este termo de sustento?",
          type: "radio",
          required: true,
          default: "petitioner",
          options: [
            { value: "petitioner", labelPt: "Sou o peticionário — protocolei o I-130 para meu parente" },
            { value: "joint_only", labelPt: "Sou o único patrocinador conjunto (joint sponsor)" },
            { value: "substitute", labelPt: "O peticionário original faleceu — sou o patrocinador substituto" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              petitioner: `${S0}P1_Line1a-f_CB[0]`,
              joint_only: `${S0}P1_Line1a-f_CB[3]`,
              substitute: `${S0}P1_Line1a-f_CB[5]`,
            },
          },
        },
        {
          id: "substitute_relationship",
          labelPt: "Se substituto: sua relação com o imigrante (em inglês, ex.: brother)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "basis", equals: "substitute" },
          pdf: { kind: "text", field: `${S0}P1_Line1f_Relationship[0]` },
        },
      ],
    },

    // ── 2. Patrocinador — identificação e endereço (Part 2, itens 1–4) ──────
    {
      id: "patrocinador",
      titlePt: "Patrocinador — seus dados",
      descriptionPt: "Nome legal completo, sem apelidos — como nos seus documentos americanos.",
      questions: [
        {
          id: "sp_family_name",
          labelPt: "Seu sobrenome (Family Name)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P4_Line1a_FamilyName[0]` },
        },
        {
          id: "sp_given_name",
          labelPt: "Seu nome (Given Name)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P4_Line1b_GivenName[0]` },
        },
        {
          id: "sp_middle_name",
          labelPt: "Seu nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P4_Line1c_MiddleName[0]` },
        },
        {
          id: "sp_in_care_of",
          labelPt: "Aos cuidados de (In Care Of) — opcional",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}P4_Line2a_InCareOf[0]` },
        },
        {
          id: "sp_mail_street",
          labelPt: "Endereço de correspondência — rua e número",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}P4_Line2b_StreetNumberName[0]` },
        },
        {
          id: "sp_mail_unit_type",
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
              apt: `${S1}P4_Line2c_Unit[0]`,
              ste: `${S1}P4_Line2c_Unit[1]`,
              flr: `${S1}P4_Line2c_Unit[2]`,
            },
          },
        },
        {
          id: "sp_mail_unit_number",
          labelPt: "Número do complemento",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}P4_Line2d_AptSteFlrNumber[0]` },
        },
        {
          id: "sp_mail_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}P4_Line2e_CityOrTown[0]` },
        },
        {
          id: "sp_mail_state",
          labelPt: "Estado americano (sigla de 2 letras)",
          type: "text",
          required: true,
          placeholder: "FL",
          validate: { pattern: /^[A-Za-z]{2}$/, messagePt: "Use a sigla de 2 letras do estado (ex.: FL)." },
          pdf: { kind: "dropdown", field: `${S1}P4_Line2f_State[0]` },
        },
        {
          id: "sp_mail_zip",
          labelPt: "ZIP Code",
          type: "text",
          required: true,
          validate: { pattern: /^\d{5}(-\d{4})?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          pdf: { kind: "text", field: `${S1}P4_Line2g_ZipCode[0]` },
        },
        {
          id: "sp_mail_country",
          labelPt: "País (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "United States",
          pdf: { kind: "text", field: `${S1}P4_Line2j_Country[0]` },
        },
        {
          id: "sp_mail_same_as_physical",
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
            fieldByValue: {
              yes: `${S1}P1_Line3_Checkbox[0]`,
              no: `${S1}P1_Line3_Checkbox[1]`,
            },
          },
        },
        {
          id: "sp_phys_street",
          labelPt: "Endereço onde você mora — rua e número",
          type: "text",
          required: true,
          passthroughEn: true,
          showWhen: { questionId: "sp_mail_same_as_physical", equals: "no" },
          pdf: { kind: "text", field: `${S1}P4_Line4a_StreetNumberName[0]` },
        },
        {
          id: "sp_phys_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          showWhen: { questionId: "sp_mail_same_as_physical", equals: "no" },
          pdf: { kind: "text", field: `${S1}P4_Line4d_CityOrTown[0]` },
        },
        {
          id: "sp_phys_state",
          labelPt: "Estado (sigla de 2 letras)",
          type: "text",
          required: true,
          validate: { pattern: /^[A-Za-z]{2}$/, messagePt: "Use a sigla de 2 letras (ex.: FL)." },
          showWhen: { questionId: "sp_mail_same_as_physical", equals: "no" },
          pdf: { kind: "dropdown", field: `${S1}P4_Line4e_State[0]` },
        },
        {
          id: "sp_phys_zip",
          labelPt: "ZIP Code",
          type: "text",
          required: true,
          validate: { pattern: /^\d{5}(-\d{4})?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          showWhen: { questionId: "sp_mail_same_as_physical", equals: "no" },
          pdf: { kind: "text", field: `${S1}P4_Line4f_ZipCode[0]` },
        },
      ],
    },

    // ── 3. Patrocinador — nascimento, SSN e status (Part 2, itens 5–14) ─────
    {
      id: "patrocinador-status",
      titlePt: "Patrocinador — nascimento e status",
      questions: [
        {
          id: "sp_domicile",
          labelPt: "País de domicílio (onde você mantém sua residência principal)",
          helpPt: "Para patrocinar, seu domicílio precisa ser os EUA na maioria dos casos.",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "United States",
          pdf: { kind: "text", field: `${S1}P4_Line5_CountryOfDomicile[0]` },
        },
        {
          id: "sp_dob",
          labelPt: "Sua data de nascimento",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S1}P4_Line6_DateOfBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "sp_birth_city",
          labelPt: "Sua cidade de nascimento",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}P4_Line7_CityofBirth[0]` },
        },
        {
          id: "sp_ssn",
          labelPt: "Seu Social Security Number (obrigatório neste formulário)",
          type: "text",
          required: true,
          validate: { pattern: /^\d{9}$/, messagePt: "Digite os 9 dígitos do SSN, sem traços." },
          pdf: { kind: "text", field: `${S1}P4_Line10_SocialSecurityNumber[0]` },
        },
        {
          id: "sp_status",
          labelPt: "Seu status",
          type: "radio",
          required: true,
          options: [
            { value: "citizen", labelPt: "Cidadão americano" },
            { value: "national", labelPt: "Nacional americano (US national)" },
            { value: "lpr", labelPt: "Residente permanente (green card)" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              citizen: `${S1}P4_Line11a_Checkbox[0]`,
              national: `${S1}P4_Line11b_Checkbox[0]`,
              lpr: `${S1}P4_Line11c_Checkbox[0]`,
            },
          },
        },
        {
          id: "sp_a_number",
          labelPt: "Seu A-Number (se tiver)",
          helpPt: "Residentes têm; cidadãos normalmente não — deixe em branco.",
          type: "text",
          pdf: { kind: "text", field: `${S1}#area[1].P4_Line12_AlienNumber[0]` },
        },
        {
          id: "sp_military",
          labelPt: "Você está na ativa das Forças Armadas ou Guarda Costeira dos EUA?",
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
              yes: `${S1}P4_Line14_Checkboxes[0]`,
              no: `${S1}P4_Line14_Checkboxes[1]`,
            },
          },
        },
      ],
    },

    // ── 4. Imigrante principal (Part 3) ─────────────────────────────────────
    {
      id: "imigrante",
      titlePt: "Imigrante principal — quem vai receber o green card",
      descriptionPt:
        "Os dados de quem você está patrocinando — o beneficiário do I-130. Ele(a) não assina este formulário.",
      questions: [
        {
          id: "im_family_name",
          labelPt: "Sobrenome do imigrante (como no passaporte)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P2_Line1a_FamilyName[0]` },
        },
        {
          id: "im_given_name",
          labelPt: "Nome do imigrante",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P2_Line1b_GivenName[0]` },
        },
        {
          id: "im_middle_name",
          labelPt: "Nome do meio do imigrante",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P2_Line1c_MiddleName[0]` },
        },
        {
          id: "im_in_care_of",
          labelPt: "Aos cuidados de (In Care Of) — opcional",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P2_Line2_InCareOf[0]` },
        },
        {
          id: "im_street",
          labelPt: "Endereço atual do imigrante — rua e número",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P2_Line2_StreetNumberName[0]` },
        },
        {
          id: "im_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P2_Line2_CityOrTown[0]` },
        },
        {
          id: "im_state",
          labelPt: "Estado americano (sigla — deixe em branco se fora dos EUA)",
          type: "text",
          validate: { pattern: /^([A-Za-z]{2})?$/, messagePt: "Use a sigla de 2 letras (ex.: FL)." },
          pdf: { kind: "dropdown", field: `${S2}P2_Line2_State[0]` },
        },
        {
          id: "im_zip",
          labelPt: "ZIP Code (só nos EUA)",
          type: "text",
          validate: { pattern: /^(\d{5}(-\d{4})?)?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          pdf: { kind: "text", field: `${S2}P2_Line2_ZipCode[0]` },
        },
        {
          id: "im_province",
          labelPt: "Estado/Província (fora dos EUA)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P2_Line2_Province[0]` },
        },
        {
          id: "im_postal",
          labelPt: "CEP / Postal Code (fora dos EUA)",
          type: "text",
          pdf: { kind: "text", field: `${S2}P2_Line2_PostalCode[0]` },
        },
        {
          id: "im_country",
          labelPt: "País (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S2}P2_Line2_Country[0]` },
        },
        {
          id: "im_citizenship",
          labelPt: "País de cidadania do imigrante (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S2}P2_Line3_CountryCitizenship[0]` },
        },
        {
          id: "im_dob",
          labelPt: "Data de nascimento do imigrante",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S2}P2_Line4_DateOfBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "im_a_number",
          labelPt: "A-Number do imigrante (se tiver)",
          type: "text",
          pdf: { kind: "text", field: `${S2}#area[2].P2_Line5_AlienNumber[0]` },
        },
        {
          id: "im_daytime_phone",
          labelPt: "Telefone do imigrante",
          type: "text",
          required: true,
          pdf: { kind: "text", field: `${S2}P2_Line7_DaytimePhoneNumber[0]` },
        },
        {
          id: "sponsoring_principal",
          labelPt: "Você está patrocinando o imigrante principal indicado acima?",
          helpPt: "No fluxo do kit da família, a resposta é Sim.",
          type: "radio",
          required: true,
          default: "yes",
          options: [
            { value: "yes", labelPt: "Sim" },
            {
              value: "no",
              labelPt: "Não (segundo patrocinador conjunto / familiares que imigram depois)",
            },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              yes: `${S2}P3_Line1_Checkbox[0]`,
              no: `${S2}P3_Line1_Checkbox[1]`,
            },
          },
        },
      ],
    },

    // ── 5. Tamanho do domicílio (Part 4 item 8 + Part 5) ────────────────────
    {
      id: "domicilio",
      titlePt: "Tamanho do seu domicílio (household)",
      descriptionPt:
        "É este número que define a renda mínima exigida na tabela I-864P. Não conte ninguém duas vezes. " +
        "Familiares extras patrocinados neste mesmo termo: adicione à mão na Parte 4/Parte 11.",
      questions: [
        {
          id: "hh_immigrants",
          labelPt: "Quantos imigrantes você está patrocinando neste termo?",
          helpPt: "Patrocinando só o imigrante principal: 1.",
          type: "number",
          required: true,
          default: 1,
          pdf: { kind: "text", field: `${S4}P3_Line28_TotalNumberofImmigrants[0]` },
        },
        {
          id: "hh_spouse",
          labelPt: "Seu cônjuge (1 se casado e ainda não contado acima; senão 0)",
          helpPt: "Numa petição de cônjuge, ele(a) já foi contado como imigrante — escreva 0.",
          type: "number",
          required: true,
          default: 0,
          pdf: { kind: "text", field: `${S4}P5_Line3_Married[0]` },
        },
        {
          id: "hh_children",
          labelPt: "Seus filhos dependentes (não contados acima)",
          type: "number",
          required: true,
          default: 0,
          pdf: { kind: "text", field: `${S4}P5_Line4_DependentChildren[0]` },
        },
        {
          id: "hh_other_dependents",
          labelPt: "Outros dependentes seus",
          type: "number",
          required: true,
          default: 0,
          pdf: { kind: "text", field: `${S4}P5_Line5_OtherDependents[0]` },
        },
        {
          id: "hh_prior_sponsored",
          labelPt: "Pessoas que você já patrocinou em outro I-864 e ainda sustenta",
          type: "number",
          required: true,
          default: 0,
          pdf: { kind: "text", field: `${S4}P5_Line6_Sponsors[0]` },
        },
        {
          id: "hh_combining",
          labelPt: "Parentes na mesma casa combinando renda com você via I-864A",
          type: "number",
          required: true,
          default: 0,
          pdf: { kind: "text", field: `${S4}P5_Line7_SameResidence[0]` },
        },
        {
          id: "hh_yourself_note",
          labelPt: "Total do domicílio (some tudo acima + 1 por você mesmo)",
          helpPt:
            "Item 2 (você) já vale 1. Ex.: você + cônjuge imigrante = 2. Confira a renda mínima para esse total na tabela I-864P.",
          type: "number",
          required: true,
          default: 2,
          pdf: [
            { kind: "text", field: `${S4}P5_Line2_Yourself[0]`, transform: () => "1" },
            { kind: "text", field: `${S4}Override[0]` },
          ],
        },
      ],
    },

    // ── 6. Emprego e renda (Part 6, itens 1–7 + impostos) ───────────────────
    {
      id: "renda",
      titlePt: "Seu emprego e renda",
      descriptionPt:
        "A renda anual individual atual precisa alcançar 125% da linha de pobreza para o tamanho do seu domicílio " +
        "(tabela I-864P). Renda de outros membros do domicílio (I-864A): preencha à mão os itens 8–14 se precisar.",
      questions: [
        {
          id: "employment_kind",
          labelPt: "Atualmente você está:",
          type: "radio",
          required: true,
          options: [
            { value: "employed", labelPt: "Empregado(a)" },
            { value: "self", labelPt: "Autônomo(a) / dono(a) de negócio" },
            { value: "retired", labelPt: "Aposentado(a)" },
            { value: "unemployed", labelPt: "Desempregado(a)" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              employed: `${S4}P6_Line1_Checkbox[0]`,
              self: `${S4}P6_Line4_Checkbox[0]`,
              retired: `${S4}P6_Line5_Checkbox[0]`,
              unemployed: `${S4}P6_Line6_Checkbox[0]`,
            },
          },
        },
        {
          id: "employed_as",
          labelPt: "Empregado como (ocupação, em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "employment_kind", equals: "employed" },
          pdf: { kind: "text", field: `${S4}P6_Line1a_NameofEmployer[0]` },
        },
        {
          id: "employer1_name",
          labelPt: "Nome do empregador 1",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "employment_kind", equals: "employed" },
          pdf: { kind: "text", field: `${S4}P6_Line1a1_NameofEmployer[0]` },
        },
        {
          id: "employer2_name",
          labelPt: "Nome do empregador 2 (se houver)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "employment_kind", equals: "employed" },
          pdf: { kind: "text", field: `${S4}P6_Line1a2_NameofEmployer[0]` },
        },
        {
          id: "self_employed_as",
          labelPt: "Autônomo como (ocupação, em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "employment_kind", equals: "self" },
          pdf: { kind: "text", field: `${S4}P6_Line4a_SelfEmployedAs[0]` },
        },
        {
          id: "retired_since",
          labelPt: "Aposentado desde",
          type: "date",
          showWhen: { questionId: "employment_kind", equals: "retired" },
          pdf: { kind: "text", field: `${S4}P6_Line5a_DateRetired[0]`, transform: isoToUsDate },
        },
        {
          id: "unemployed_since",
          labelPt: "Desempregado desde",
          type: "date",
          showWhen: { questionId: "employment_kind", equals: "unemployed" },
          pdf: { kind: "text", field: `${S4}P6_Line6a_DateofUnemployment[0]`, transform: isoToUsDate },
        },
        {
          id: "individual_income",
          labelPt: "Sua renda anual individual atual (US$, só números)",
          type: "number",
          required: true,
          validate: { pattern: /^\d+$/, messagePt: "Digite só números, sem $ nem vírgulas." },
          pdf: { kind: "text", field: `${S4}P6_Line2_TotalIncome[0]` },
        },
        {
          id: "household_income",
          labelPt: "Renda anual total do domicílio (US$)",
          helpPt: "Sem I-864A de outros membros, repita sua renda individual.",
          type: "number",
          required: true,
          validate: { pattern: /^\d+$/, messagePt: "Digite só números, sem $ nem vírgulas." },
          pdf: { kind: "text", field: `${S5}P6_Line15_TotalHouseholdIncome[0]` },
        },
        {
          id: "filed_taxes",
          labelPt: "Você declarou imposto de renda federal nos últimos 3 anos?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", labelPt: "Sim" },
            { value: "no", labelPt: "Não" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              yes: `${S5}P6_Line18a_Checkbox[0]`,
              no: `${S5}P6_Line18a_Checkbox[1]`,
            },
          },
        },
        {
          id: "tax_year_1",
          labelPt: "Ano fiscal mais recente (ex.: 2025)",
          helpPt: "Anexe cópia ou transcript da declaração desse ano — é obrigatório.",
          type: "text",
          required: true,
          validate: { pattern: /^\d{4}$/, messagePt: "Digite o ano com 4 dígitos." },
          pdf: { kind: "text", field: `${S6}P6_Line19a_TaxYear[0]` },
        },
        {
          id: "tax_income_1",
          labelPt: "Renda total declarada nesse ano (US$; \"zero\" ou \"N/A\" se for o caso)",
          type: "text",
          required: true,
          pdf: { kind: "text", field: `${S6}P6_Line19a_TotalIncome[0]` },
        },
        {
          id: "tax_year_2",
          labelPt: "2º ano mais recente (opcional)",
          type: "text",
          pdf: { kind: "text", field: `${S6}P6_Line19b_TaxYear[0]` },
        },
        {
          id: "tax_income_2",
          labelPt: "Renda desse ano",
          type: "text",
          pdf: { kind: "text", field: `${S6}P6_Line19b_TotalIncome[0]` },
        },
        {
          id: "tax_year_3",
          labelPt: "3º ano mais recente (opcional)",
          type: "text",
          pdf: { kind: "text", field: `${S6}P6_Line19c_TaxYear[0]` },
        },
        {
          id: "tax_income_3",
          labelPt: "Renda desse ano",
          type: "text",
          pdf: { kind: "text", field: `${S6}P6_Line19c_TotalIncome[0]` },
        },
        {
          id: "not_required_to_file",
          labelPt: "Não fui obrigado a declarar (renda abaixo do mínimo do IRS) — anexarei prova",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S6}P6_Line17_IWasNotReq[0]` },
        },
      ],
    },

    // ── 7. Patrimônio (Part 7 — opcional) ───────────────────────────────────
    {
      id: "patrimonio",
      titlePt: "Patrimônio para complementar a renda (opcional)",
      descriptionPt:
        "Só preencha se sua renda NÃO alcança a exigida na tabela I-864P. Para cônjuge de cidadão, " +
        "o patrimônio precisa valer 3x a diferença (5x nos demais casos).",
      questions: [
        {
          id: "use_assets",
          labelPt: "Sua renda alcança o mínimo exigido?",
          type: "radio",
          required: true,
          default: "yes",
          options: [
            { value: "yes", labelPt: "Sim — pular esta parte" },
            { value: "no", labelPt: "Não — vou usar patrimônio para complementar" },
          ],
        },
        {
          id: "assets_cash",
          labelPt: "Saldo total em contas (poupança + corrente), US$",
          type: "number",
          showWhen: { questionId: "use_assets", equals: "no" },
          pdf: { kind: "text", field: `${S6}P7_Line1_BalanceofAccounts[0]` },
        },
        {
          id: "assets_real_estate",
          labelPt: "Valor líquido de imóveis (valor - hipoteca), US$",
          type: "number",
          showWhen: { questionId: "use_assets", equals: "no" },
          pdf: { kind: "text", field: `${S6}P7_Line2_RealEstate[0]` },
        },
        {
          id: "assets_stocks",
          labelPt: "Ações, títulos, CDs e outros ativos, US$",
          type: "number",
          showWhen: { questionId: "use_assets", equals: "no" },
          pdf: { kind: "text", field: `${S6}P7_Line3_StocksBonds[0]` },
        },
        {
          id: "assets_total",
          labelPt: "Total do seu patrimônio (soma dos 3 acima), US$",
          type: "number",
          showWhen: { questionId: "use_assets", equals: "no" },
          pdf: [
            { kind: "text", field: `${S6}P7_Line4_Total[0]` },
            { kind: "text", field: `${S6}P7_Line5_TotalAssetsHouseholdMembers[0]` },
          ],
        },
      ],
    },

    // ── 8. Contato (Part 8) ─────────────────────────────────────────────────
    {
      id: "contato",
      titlePt: "Seu contato",
      descriptionPt:
        "A assinatura é à mão, na versão impressa — ao assinar, você aceita o contrato de sustento descrito na Parte 8.",
      questions: [
        {
          id: "sp_daytime_phone",
          labelPt: "Seu telefone",
          type: "text",
          required: true,
          pdf: { kind: "text", field: `${S9}P8_Line3_DaytimeTelephoneNumber[0]` },
        },
        {
          id: "sp_mobile_phone",
          labelPt: "Seu celular",
          type: "text",
          pdf: { kind: "text", field: `${S9}P8_Line4_MobileTelephoneNumber[0]` },
        },
        {
          id: "sp_email",
          labelPt: "Seu e-mail",
          type: "text",
          prefillFrom: "email",
          pdf: { kind: "text", field: `${S9}P7Line7_EmailAddress[0]` },
        },
      ],
    },
  ],
};
