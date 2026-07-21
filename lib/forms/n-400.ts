/**
 * N-400 — Application for Naturalization.
 *
 * Data-driven spec for citizenship applications. WHO FILLS THIS FORM: the
 * APPLICANT — the green card holder seeking naturalization.
 *
 * Field names extracted from the official edition 01/20/25 asset at
 * public/forms/n-400.pdf (14 pages). This PDF's internal field-name prefix
 * (`P2_`, `P4_`, `P7_`...) does NOT reliably match the printed Part number —
 * USCIS's own field tooltips (TU) are inconsistent in places (e.g. some
 * fields under the internal `P9_` prefix say "Part 6", others "Part 9" for
 * the same prefix). Every field below was verified against its own specific
 * tooltip text and against a real filled-PDF readback, not against the
 * field-name prefix alone.
 *
 * One field (`Line12.c_Checkbox`) has a literal period in its PDF node name;
 * pdf-lib requires it escaped as `Line12\.c_Checkbox` in the fully-qualified
 * path — verified against the real asset before use.
 *
 * Scope (MVP): Part 1 (eligibility), Part 2 (identity, name change, SSN
 * update), Part 3 (residence, 5yr history), Part 4 (biographic), Part 5
 * (employment/schools, 5yr history), Part 6 (marital history), Part 7
 * (children), Part 8 (time outside the US), Part 9 (the Yes/No
 * eligibility/moral-character screening — the bulk of the form) and Part 10
 * (applicant contact info). Interpreter, preparer, and both signature parts
 * (14 overflow, 15 in-person interview, 16 oath) are out of scope — those are
 * completed by hand or at the USCIS interview. The engine is ministerial: it
 * transcribes; it never decides eligibility or advises which basis to check.
 */

import type { FormSpec, Question } from "./types";

const F = "form1[0].";
const S0 = `${F}#subform[0].`; // page 1 (Part 1 eligibility, Part 2 name)
const S1 = `${F}#subform[1].`; // page 2 (Part 2 continued)
const S2 = `${F}#subform[2].`; // page 3 (Part 3 residence tail, Part 4 biographic)
const S3 = `${F}#subform[3].`; // page 4 (Part 3 mailing address dup, Part 7 marital start)
const S4 = `${F}#subform[4].`; // page 5 (Part 5 employment, Part 6 children, Part 7 marital cont.)
const S5 = `${F}#subform[5].`; // page 6 (Part 8 time outside US, Part 9 items 1-5)
const S6 = `${F}#subform[6].`; // page 7 (Part 9 items 6-14)
const S7 = `${F}#subform[7].`; // page 8-9 (Part 9 items 15-16, crime table)
const S8 = `${F}#subform[8].`; // page 10-12 (Part 9 items 17-25)
const S9 = `${F}#subform[9].`; // page 13 (Part 9 items 26-37, contact start)
const S10 = `${F}#subform[10].`; // page 14 (contact)

// ISO yyyy-mm-dd (how we store dates) -> USCIS mm/dd/yyyy text.
function isoToUsDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

/**
 * One Part 9 Yes/No item. `yes`/`no` are the exact checkbox fields — this
 * PDF's own tooltip (TU) text is unreliable here (several items have both
 * checkboxes labeled "Select Yes", or labels copy-pasted from a different
 * item entirely). Every yes/no pair below was resolved by the checkbox's
 * real widget x-position instead: this form consistently places the Yes box
 * at x≈498-499 and the No box at x≈540, verified across the whole Part 9
 * block. Never trust the TU text alone for this section.
 */
function p9(
  id: string,
  labelPt: string,
  yes: string,
  no: string,
  opts: { helpPt?: string; showWhen?: Question["showWhen"] } = {}
): Question {
  return {
    id,
    labelPt,
    helpPt: opts.helpPt,
    type: "radio",
    required: true,
    showWhen: opts.showWhen,
    options: [
      { value: "no", labelPt: "Não" },
      { value: "yes", labelPt: "Sim" },
    ],
    pdf: { kind: "checkboxChoice", fieldByValue: { yes, no } },
  };
}

export const N400: FormSpec = {
  id: "n-400",
  code: "N-400",
  officialName: "Application for Naturalization",
  namePt: "Pedido de Naturalização (Cidadania Americana)",
  agency: "USCIS",
  officialUrl: "https://www.uscis.gov/n-400",
  edition: "01/20/25",
  exportKind: "pdf",
  pdfAssetPath: "forms/n-400.pdf",
  attachTo: { vistoId: "n400", documentoId: "n400-formulario" },
  disclaimerPt:
    "Este formulário é preenchido por VOCÊ, o requerente da cidadania. A Immigrei é uma ferramenta de " +
    "preenchimento — não presta serviços jurídicos, não avalia seu caso e não decide qual base de " +
    "elegibilidade marcar. Confira cada campo com atenção e assine à mão antes de enviar.",

  sections: [
    // ── 1. Elegibilidade (Part 1) ────────────────────────────────────────────
    {
      id: "elegibilidade",
      titlePt: "Sua base de elegibilidade",
      descriptionPt:
        "Marque só uma opção — o USCIS pode atrasar ou rejeitar o formulário se mais de uma for marcada. " +
        "Se você não tem certeza de qual se aplica ao seu caso, converse com um profissional antes de escolher.",
      questions: [
        {
          id: "eligibility_basis",
          labelPt: "Base do seu pedido",
          type: "radio",
          required: true,
          options: [
            { value: "general", labelPt: "Regra geral (5 anos de Green Card, ou 3 anos casado(a) com cidadão americano com quem mora)" },
            { value: "spouse_citizen", labelPt: "Cônjuge de cidadão americano (elegibilidade específica de 3 anos)" },
            { value: "vawa", labelPt: "VAWA — cônjuge, ex-cônjuge ou filho(a) de cidadão americano" },
            { value: "spouse_citizen_abroad", labelPt: "Cônjuge de cidadão americano em emprego qualificado fora dos EUA" },
            { value: "military_hostilities", labelPt: "Serviço militar durante período de hostilidades" },
            { value: "military_one_year", labelPt: "Pelo menos 1 ano de serviço militar honorável" },
            { value: "other", labelPt: "Outro motivo não listado acima" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              general: `${S0}Part1_Eligibility[2]`,
              spouse_citizen: `${S0}Part1_Eligibility[1]`,
              vawa: `${S0}Part1_Eligibility[0]`,
              spouse_citizen_abroad: `${S0}Part1_Eligibility[6]`,
              military_hostilities: `${S0}Part1_Eligibility[3]`,
              military_one_year: `${S0}Part1_Eligibility[4]`,
              other: `${S0}Part1_Eligibility[5]`,
            },
          },
        },
        {
          id: "eligibility_other_explain",
          labelPt: "Se marcou \"Outro motivo\": explique (em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "eligibility_basis", equals: "other" },
          pdf: { kind: "text", field: `${S0}Part1Line5_OtherExplain[0]` },
        },
        {
          id: "a_number",
          labelPt: "Seu A-Number (Alien Registration Number, 9 dígitos)",
          type: "text",
          required: true,
          pdf: [
            { kind: "text", field: `${S0}#area[0].Line1_AlienNumber[0]` },
            { kind: "text", field: `${S1}#area[1].Line1_AlienNumber[1]` },
          ],
        },
      ],
    },

    // ── 2. Seu nome (Part 2, itens 1-3) ─────────────────────────────────────
    {
      id: "identificacao",
      titlePt: "Seu nome",
      questions: [
        {
          id: "family_name",
          labelPt: "Seu sobrenome legal atual",
          helpPt: "Não use apelido.",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P2_Line1_FamilyName[0]` },
        },
        {
          id: "given_name",
          labelPt: "Seu nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P2_Line1_GivenName[0]` },
        },
        {
          id: "middle_name",
          labelPt: "Seu nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}P2_Line1_MiddleName[0]` },
        },
        {
          id: "other_name1_family",
          labelPt: "Outro nome que você já usou desde o nascimento — sobrenome",
          helpPt: "Nome de solteira, aliases. Em branco se não houver.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Line2_FamilyName1[0]` },
        },
        {
          id: "other_name1_given",
          labelPt: "Outro nome — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Line3_GivenName1[0]` },
        },
        {
          id: "other_name1_middle",
          labelPt: "Outro nome — nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Line3_MiddleName1[0]` },
        },
        {
          id: "other_name2_family",
          labelPt: "Um segundo nome já usado (se houver) — sobrenome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Line2_FamilyName2[0]` },
        },
        {
          id: "other_name2_given",
          labelPt: "Segundo nome já usado — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Line3_GivenName2[0]` },
        },
        {
          id: "other_name2_middle",
          labelPt: "Segundo nome já usado — nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Line3_MiddleName2[0]` },
        },
        {
          id: "wants_name_change",
          labelPt: "Você quer mudar seu nome legalmente ao naturalizar?",
          helpPt: "Opcional — a mudança de nome pelo N-400 só acontece na cerimônia de juramento.",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S1}P2_Line34_NameChange[0]`, yes: `${S1}P2_Line34_NameChange[1]` },
          },
        },
        {
          id: "new_family_name",
          labelPt: "Novo sobrenome desejado",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "wants_name_change", equals: "yes" },
          pdf: { kind: "text", field: `${S1}Part2Line3_FamilyName[0]` },
        },
        {
          id: "new_given_name",
          labelPt: "Novo nome desejado",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "wants_name_change", equals: "yes" },
          pdf: { kind: "text", field: `${S1}Part2Line4a_GivenName[0]` },
        },
        {
          id: "new_middle_name",
          labelPt: "Novo nome do meio desejado",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "wants_name_change", equals: "yes" },
          pdf: { kind: "text", field: `${S1}Part2Line4a_MiddleName[0]` },
        },
      ],
    },

    // ── 3. Dados pessoais (Part 2, itens 4-11) ──────────────────────────────
    {
      id: "dados_pessoais",
      titlePt: "Seus dados",
      questions: [
        {
          id: "uscis_account",
          labelPt: "Sua conta online do USCIS (se tiver)",
          type: "text",
          pdf: { kind: "text", field: `${S1}P2_Line6_USCISELISAcctNumber[0]` },
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
            fieldByValue: { male: `${S1}P2_Line7_Gender[0]`, female: `${S1}P2_Line7_Gender[1]` },
          },
        },
        {
          id: "dob",
          labelPt: "Sua data de nascimento",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S1}P2_Line8_DateOfBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "birth_country",
          labelPt: "País de nascimento (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S1}P2_Line10_CountryOfBirth[0]` },
        },
        {
          id: "citizenship_country",
          labelPt: "País de cidadania ou nacionalidade (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S1}P2_Line11_CountryOfNationality[0]` },
        },
        {
          id: "date_became_lpr",
          labelPt: "Data em que você virou residente permanente",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S1}P2_Line9_DateBecamePermanentResident[0]`, transform: isoToUsDate },
        },
        {
          id: "parent_us_citizen_before_18",
          labelPt: "Sua mãe ou seu pai (inclusive adotivo) já foi cidadão americano antes de você completar 18 anos?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S1}P2_Line10_claimdisability[0]`, yes: `${S1}P2_Line10_claimdisability[1]` },
          },
        },
        {
          id: "disability_exception",
          labelPt:
            "Você tem alguma deficiência física, de desenvolvimento, ou transtorno mental que te impede de " +
            "demonstrar conhecimento de inglês e/ou civismo para a naturalização?",
          helpPt: "Se sim, é preciso anexar o formulário N-648 preenchido por um profissional de saúde.",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S1}P2_Line11_claimdisability[0]`, yes: `${S1}P2_Line11_claimdisability[1]` },
          },
        },
        {
          id: "ssn_update",
          labelPt:
            "Você quer que o Social Security (SSA) emita ou atualize seu cartão de Social Security " +
            "quando você for naturalizado?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S1}Line12a_Checkbox[0]`, yes: `${S1}Line12a_Checkbox[1]` },
          },
        },
        {
          id: "ssn",
          labelPt: "Seu SSN (se tiver)",
          type: "text",
          showWhen: { questionId: "ssn_update", equals: "yes" },
          pdf: { kind: "text", field: `${S1}Line12b_SSN[0]` },
        },
        {
          id: "ssn_disclosure_consent",
          labelPt: "Você autoriza o USCIS a compartilhar seus dados com o SSA para esse fim?",
          helpPt: "Precisa ser \"Sim\" para o SSA emitir o cartão.",
          type: "radio",
          required: true,
          default: "yes",
          showWhen: { questionId: "ssn_update", equals: "yes" },
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S1}Line12\\.c_Checkbox[0]`, yes: `${S1}Line12\\.c_Checkbox[1]` },
          },
        },
      ],
    },

    // ── 4. Residência (Part 3) ───────────────────────────────────────────────
    {
      id: "endereco",
      titlePt: "Onde você morou nos últimos 5 anos",
      descriptionPt: "Comece pelo endereço atual e liste os anteriores. Deixe as linhas extras em branco se não se aplicarem.",
      questions: [
        {
          id: "phys1_street",
          labelPt: "Endereço atual — rua e número",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P4_Line3_PhysicalAddress1[0]` },
        },
        {
          id: "phys1_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P4_Line3_CityTown1[0]` },
        },
        {
          id: "phys1_state",
          labelPt: "Estado (sigla) ou província",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P4_Line3_State1[0]` },
        },
        {
          id: "phys1_zip",
          labelPt: "ZIP ou código postal",
          type: "text",
          required: true,
          pdf: { kind: "text", field: `${S2}P4_Line3_ZipCode1[0]` },
        },
        {
          id: "phys1_country",
          labelPt: "País (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "United States",
          pdf: { kind: "text", field: `${S2}P4_Line3_Country1[0]` },
        },
        {
          id: "phys1_from",
          labelPt: "Desde quando mora nesse endereço",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S2}P4_Line3_From1[0]`, transform: isoToUsDate },
        },
        {
          id: "phys2_street",
          labelPt: "Endereço anterior — rua e número",
          helpPt: "Deixe em branco se você só morou no endereço atual nos últimos 5 anos.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P4_Line3_PhysicalAddress2[0]` },
        },
        {
          id: "phys2_city",
          labelPt: "Cidade",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P4_Line3_CityTown2[0]` },
        },
        {
          id: "phys2_state",
          labelPt: "Estado (sigla) ou província",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P4_Line3_State2[0]` },
        },
        {
          id: "phys2_zip",
          labelPt: "ZIP ou código postal",
          type: "text",
          pdf: { kind: "text", field: `${S2}P4_Line3_ZipCode2[0]` },
        },
        {
          id: "phys2_country",
          labelPt: "País (em inglês)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P4_Line3_Country2[0]` },
        },
        {
          id: "phys2_from",
          labelPt: "De (data)",
          type: "date",
          pdf: { kind: "text", field: `${S2}P4_Line3_From2[0]`, transform: isoToUsDate },
        },
        {
          id: "phys2_to",
          labelPt: "Até (data)",
          type: "date",
          pdf: { kind: "text", field: `${S2}P4_Line3_To2[0]`, transform: isoToUsDate },
        },
        {
          id: "phys3_street",
          labelPt: "Mais um endereço anterior — rua e número",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P4_Line3_PhysicalAddress3[0]` },
        },
        {
          id: "phys3_city",
          labelPt: "Cidade",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P4_Line3_CityTown3[0]` },
        },
        {
          id: "phys3_state",
          labelPt: "Estado (sigla) ou província",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P4_Line3_State3[0]` },
        },
        {
          id: "phys3_zip",
          labelPt: "ZIP ou código postal",
          type: "text",
          pdf: { kind: "text", field: `${S2}P4_Line3_ZipCode3[0]` },
        },
        {
          id: "phys3_country",
          labelPt: "País (em inglês)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P4_Line3_Country3[0]` },
        },
        {
          id: "phys3_from",
          labelPt: "De (data)",
          type: "date",
          pdf: { kind: "text", field: `${S2}P4_Line3_From3[0]`, transform: isoToUsDate },
        },
        {
          id: "phys3_to",
          labelPt: "Até (data)",
          type: "date",
          pdf: { kind: "text", field: `${S2}P4_Line3_To3[0]`, transform: isoToUsDate },
        },
        {
          id: "mail_in_care_of",
          labelPt: "Endereço de correspondência — aos cuidados de (opcional)",
          type: "text",
          passthroughEn: true,
          pdf: [
            { kind: "text", field: `${S2}P4_Line1_InCareOfName[0]` },
            { kind: "text", field: `${S3}P5_Line1b_InCareOfName[0]` },
          ],
        },
        {
          id: "mail_street",
          labelPt: "Endereço de correspondência — rua e número",
          helpPt: "Pode ser o mesmo do endereço atual.",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: [
            { kind: "text", field: `${S2}P4_Line1_StreetName[0]` },
            { kind: "text", field: `${S3}P5_Line1b_StreetName[0]` },
          ],
        },
        {
          id: "mail_unit_type",
          labelPt: "Tipo de complemento",
          type: "radio",
          options: [
            { value: "floor", labelPt: "Andar" },
            { value: "suite", labelPt: "Sala" },
            { value: "apt", labelPt: "Apartamento" },
          ],
          pdf: [
            {
              kind: "checkboxChoice",
              fieldByValue: {
                floor: `${S2}P4_Line1_Unit[0]`,
                suite: `${S2}P4_Line1_Unit[1]`,
                apt: `${S2}P4_Line1_Unit[2]`,
              },
            },
            {
              kind: "checkboxChoice",
              fieldByValue: {
                floor: `${S3}P5_Line1b_Unit[0]`,
                suite: `${S3}P5_Line1b_Unit[1]`,
                apt: `${S3}P5_Line1b_Unit[2]`,
              },
            },
          ],
        },
        {
          id: "mail_unit_number",
          labelPt: "Número do complemento",
          type: "text",
          passthroughEn: true,
          pdf: [
            { kind: "text", field: `${S2}P4_Line1_Number[0]` },
            { kind: "text", field: `${S3}P5_Line1b_Number[0]` },
          ],
        },
        {
          id: "mail_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: [
            { kind: "text", field: `${S2}P4_Line1_City[0]` },
            { kind: "text", field: `${S3}P5_Line1b_City[0]` },
          ],
        },
        {
          id: "mail_state",
          labelPt: "Estado (sigla de 2 letras)",
          type: "text",
          required: true,
          placeholder: "FL",
          validate: { pattern: /^[A-Za-z]{2}$/, messagePt: "Use a sigla de 2 letras do estado (ex.: FL)." },
          pdf: [
            { kind: "dropdown", field: `${S2}P4_Line1_State[0]` },
            { kind: "dropdown", field: `${S3}P4_Line1_State[1]` },
          ],
        },
        {
          id: "mail_zip",
          labelPt: "ZIP Code",
          type: "text",
          required: true,
          validate: { pattern: /^\d{5}(-\d{4})?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          pdf: [
            { kind: "text", field: `${S2}P4_Line1_ZipCode[0]` },
            { kind: "text", field: `${S3}P5_Line1b_ZipCode[0]` },
          ],
        },
        {
          id: "mail_province",
          labelPt: "Província (endereço fora dos EUA)",
          type: "text",
          passthroughEn: true,
          pdf: [
            { kind: "text", field: `${S2}P4_Line1_Province[0]` },
            { kind: "text", field: `${S3}P5_Line1b_Province[0]` },
          ],
        },
        {
          id: "mail_postal_code",
          labelPt: "Código postal (endereço fora dos EUA)",
          type: "text",
          pdf: [
            { kind: "text", field: `${S2}P4_Line1_PostalCode[0]` },
            { kind: "text", field: `${S3}P5_Line1b_PostalCode[0]` },
          ],
        },
        {
          id: "mail_country",
          labelPt: "País (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "United States",
          pdf: [
            { kind: "text", field: `${S2}P4_Line1_Country[0]` },
            { kind: "text", field: `${S3}P5_Line1b_Country[0]` },
          ],
        },
      ],
    },

    // ── 5. Informações biográficas (Part 4) ─────────────────────────────────
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
            { value: "not_hispanic", labelPt: "Não hispânico ou latino" },
            { value: "hispanic", labelPt: "Hispânico ou latino" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { not_hispanic: `${S2}P7_Line1_Ethnicity[0]`, hispanic: `${S2}P7_Line1_Ethnicity[1]` },
          },
        },
        {
          id: "race_indigenous",
          labelPt: "Raça — Indígena americana ou nativa do Alasca",
          helpPt: "Pode marcar mais de uma.",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S2}P7_Line2_Race[0]` },
        },
        {
          id: "race_asian",
          labelPt: "Raça — Asiática",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S2}P7_Line2_Race[1]` },
        },
        {
          id: "race_black",
          labelPt: "Raça — Negra ou afro-americana",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S2}P7_Line2_Race[2]` },
        },
        {
          id: "race_pacific",
          labelPt: "Raça — Nativa do Havaí ou ilhas do Pacífico",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S2}P7_Line2_Race[3]` },
        },
        {
          id: "race_white",
          labelPt: "Raça — Branca",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S2}P7_Line2_Race[4]` },
        },
        {
          id: "height_feet",
          labelPt: "Altura — pés",
          helpPt: "1,70m ≈ 5 pés e 7 polegadas.",
          type: "select",
          required: true,
          options: ["2", "3", "4", "5", "6", "7", "8"].map((v) => ({ value: v, labelPt: v })),
          pdf: { kind: "dropdown", field: `${S2}P7_Line3_HeightFeet[0]` },
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
          pdf: { kind: "dropdown", field: `${S2}P7_Line3_HeightInches[0]` },
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
              field: `${S2}P7_Line4_Pounds1[0]`,
              transform: (v) => String(v ?? "").padStart(3, "0").charAt(0),
            },
            {
              kind: "text",
              field: `${S2}P7_Line4_Pounds2[0]`,
              transform: (v) => String(v ?? "").padStart(3, "0").charAt(1),
            },
            {
              kind: "text",
              field: `${S2}P7_Line4_Pounds3[0]`,
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
            { value: "blue", labelPt: "Azuis" },
            { value: "green", labelPt: "Verdes" },
            { value: "hazel", labelPt: "Avelã (mel)" },
            { value: "gray", labelPt: "Cinzas" },
            { value: "black", labelPt: "Pretos" },
            { value: "pink", labelPt: "Rosados" },
            { value: "maroon", labelPt: "Castanho-avermelhados" },
            { value: "other", labelPt: "Outra/não sei" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              brown: `${S2}P7_Line5_Eye[0]`,
              blue: `${S2}P7_Line5_Eye[1]`,
              green: `${S2}P7_Line5_Eye[2]`,
              hazel: `${S2}P7_Line5_Eye[3]`,
              gray: `${S2}P7_Line5_Eye[4]`,
              black: `${S2}P7_Line5_Eye[5]`,
              pink: `${S2}P7_Line5_Eye[6]`,
              maroon: `${S2}P7_Line5_Eye[7]`,
              other: `${S2}P7_Line5_Eye[8]`,
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
            { value: "sandy", labelPt: "Castanho-claro (sandy)" },
            { value: "red", labelPt: "Ruivo" },
            { value: "white", labelPt: "Branco" },
            { value: "gray", labelPt: "Grisalho" },
            { value: "blond", labelPt: "Loiro" },
            { value: "brown", labelPt: "Castanho" },
            { value: "black", labelPt: "Preto" },
            { value: "other", labelPt: "Outra/não sei" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              bald: `${S2}P7_Line6_Hair[0]`,
              sandy: `${S2}P7_Line6_Hair[1]`,
              red: `${S2}P7_Line6_Hair[2]`,
              white: `${S2}P7_Line6_Hair[3]`,
              gray: `${S2}P7_Line6_Hair[4]`,
              blond: `${S2}P7_Line6_Hair[5]`,
              brown: `${S2}P7_Line6_Hair[6]`,
              black: `${S2}P7_Line6_Hair[7]`,
              other: `${S2}P7_Line6_Hair[8]`,
            },
          },
        },
      ],
    },

    // ── 6. Trabalho e escolas (Part 5) ──────────────────────────────────────
    {
      id: "emprego",
      titlePt: "Seu trabalho e escolas nos últimos 5 anos",
      descriptionPt: "Comece pelo emprego ou escola atual. Deixe as linhas extras em branco se não se aplicarem.",
      questions: [
        {
          id: "job1_name",
          labelPt: "Empregador ou escola atual — nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P5_EmployerName1[0]` },
        },
        {
          id: "job1_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P7_City1[0]` },
        },
        {
          id: "job1_state",
          labelPt: "Estado (sigla) ou província",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P7_State1[0]` },
        },
        {
          id: "job1_zip",
          labelPt: "ZIP ou código postal",
          type: "text",
          pdf: { kind: "text", field: `${S4}P7_ZipCode1[0]` },
        },
        {
          id: "job1_country",
          labelPt: "País (em inglês)",
          type: "text",
          passthroughEn: true,
          default: "United States",
          pdf: { kind: "text", field: `${S4}P7_Country1[0]` },
        },
        {
          id: "job1_occupation",
          labelPt: "Ocupação ou curso",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P7_OccupationFieldStudy1[2]` },
        },
        {
          id: "job1_from",
          labelPt: "Desde quando",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S4}P7_From1[1]`, transform: isoToUsDate },
        },
        {
          id: "job2_name",
          labelPt: "Empregador ou escola anterior — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P5_EmployerName2[0]` },
        },
        {
          id: "job2_city",
          labelPt: "Cidade",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P7_City2[0]` },
        },
        {
          id: "job2_state",
          labelPt: "Estado (sigla) ou província",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P7_State2[0]` },
        },
        {
          id: "job2_zip",
          labelPt: "ZIP ou código postal",
          type: "text",
          pdf: { kind: "text", field: `${S4}P7_ZipCode2[0]` },
        },
        {
          id: "job2_country",
          labelPt: "País (em inglês)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P7_Country2[0]` },
        },
        {
          id: "job2_occupation",
          labelPt: "Ocupação ou curso",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P7_OccupationFieldStudy2[2]` },
        },
        {
          id: "job2_from",
          labelPt: "De (data)",
          type: "date",
          pdf: { kind: "text", field: `${S4}P7_From2[1]`, transform: isoToUsDate },
        },
        {
          id: "job2_to",
          labelPt: "Até (data)",
          type: "date",
          pdf: { kind: "text", field: `${S4}P7_To2[0]`, transform: isoToUsDate },
        },
        {
          id: "job3_name",
          labelPt: "Mais um empregador ou escola anterior — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P5_EmployerName3[0]` },
        },
        {
          id: "job3_city",
          labelPt: "Cidade",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P7_City3[0]` },
        },
        {
          id: "job3_state",
          labelPt: "Estado (sigla) ou província",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P7_State3[0]` },
        },
        {
          id: "job3_zip",
          labelPt: "ZIP ou código postal",
          type: "text",
          pdf: { kind: "text", field: `${S4}P7_ZipCode3[0]` },
        },
        {
          id: "job3_country",
          labelPt: "País (em inglês)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P7_Country3[0]` },
        },
        {
          id: "job3_occupation",
          labelPt: "Ocupação ou curso",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P7_OccupationFieldStudy3[2]` },
        },
        {
          id: "job3_from",
          labelPt: "De (data)",
          type: "date",
          pdf: { kind: "text", field: `${S4}P7_From3[1]`, transform: isoToUsDate },
        },
        {
          id: "job3_to",
          labelPt: "Até (data)",
          type: "date",
          pdf: { kind: "text", field: `${S4}P7_To3[0]`, transform: isoToUsDate },
        },
      ],
    },

    // ── 7. Histórico marital (Part 7) ───────────────────────────────────────
    {
      id: "historico_marital",
      titlePt: "Seu histórico marital",
      questions: [
        {
          id: "marital_status",
          labelPt: "Seu estado civil atual",
          type: "radio",
          required: true,
          options: [
            { value: "single", labelPt: "Solteiro(a), nunca casei" },
            { value: "married", labelPt: "Casado(a)" },
            { value: "divorced", labelPt: "Divorciado(a)" },
            { value: "widowed", labelPt: "Viúvo(a)" },
            { value: "annulled", labelPt: "Casamento anulado" },
            { value: "separated", labelPt: "Separado(a)" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              divorced: `${S3}P10_Line1_MaritalStatus[0]`,
              single: `${S3}P10_Line1_MaritalStatus[1]`,
              widowed: `${S3}P10_Line1_MaritalStatus[2]`,
              married: `${S3}P10_Line1_MaritalStatus[3]`,
              annulled: `${S3}P10_Line1_MaritalStatus[4]`,
              separated: `${S3}P10_Line1_MaritalStatus[5]`,
            },
          },
        },
        {
          id: "times_married",
          labelPt: "Quantas vezes você já se casou",
          type: "number",
          required: true,
          pdf: { kind: "text", field: `${S3}Part9Line3_TimesMarried[0]` },
        },
        {
          id: "spouse_military",
          labelPt: "Se casado(a): seu cônjuge atual é membro das Forças Armadas americanas?",
          type: "radio",
          showWhen: { questionId: "marital_status", equals: ["married", "separated"] },
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S3}P7_Line2_Forces[0]`, yes: `${S3}P7_Line2_Forces[1]` },
          },
        },
        {
          id: "spouse_family_name",
          labelPt: "Sobrenome do cônjuge atual",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "marital_status", equals: ["married", "separated"] },
          pdf: { kind: "text", field: `${S3}P10_Line4a_FamilyName[0]` },
        },
        {
          id: "spouse_given_name",
          labelPt: "Nome do cônjuge atual",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "marital_status", equals: ["married", "separated"] },
          pdf: { kind: "text", field: `${S3}P10_Line4a_GivenName[0]` },
        },
        {
          id: "spouse_middle_name",
          labelPt: "Nome do meio do cônjuge atual",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "marital_status", equals: ["married", "separated"] },
          pdf: { kind: "text", field: `${S3}P10_Line4a_MiddleName[0]` },
        },
        {
          id: "spouse_dob",
          labelPt: "Data de nascimento do cônjuge atual",
          type: "date",
          showWhen: { questionId: "marital_status", equals: ["married", "separated"] },
          pdf: { kind: "text", field: `${S3}P10_Line4d_DateofBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "marriage_date",
          labelPt: "Data em que você se casou com o cônjuge atual",
          type: "date",
          showWhen: { questionId: "marital_status", equals: ["married", "separated"] },
          pdf: { kind: "text", field: `${S3}P10_Line4e_DateEnterMarriage[0]`, transform: isoToUsDate },
        },
        {
          id: "spouse_a_number",
          labelPt: "A-Number do cônjuge atual (se tiver)",
          type: "text",
          showWhen: { questionId: "marital_status", equals: ["married", "separated"] },
          pdf: { kind: "text", field: `${S4}#area[5].P7_Line6_ANumber[0]` },
        },
        {
          id: "spouse_same_address",
          labelPt: "O endereço físico atual do seu cônjuge é o mesmo que o seu?",
          type: "radio",
          showWhen: { questionId: "marital_status", equals: ["married", "separated"] },
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S3}P10_Line5_Citizen[0]`, yes: `${S3}P10_Line5_Citizen[1]` },
          },
        },
        {
          id: "spouse_times_married",
          labelPt: "Quantas vezes seu cônjuge atual já se casou",
          type: "number",
          showWhen: { questionId: "marital_status", equals: ["married", "separated"] },
          pdf: { kind: "text", field: `${S4}P10_Line4g_Employer[0]` },
        },
        {
          id: "spouse_employer",
          labelPt: "Empregador ou empresa atual do seu cônjuge",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "marital_status", equals: ["married", "separated"] },
          pdf: { kind: "text", field: `${S4}TextField1[0]` },
        },
        {
          id: "spouse_is_citizen",
          labelPt: "Seu cônjuge atual é cidadão americano?",
          helpPt: "Isso controla se as próximas duas perguntas se aplicam.",
          type: "radio",
          showWhen: { questionId: "marital_status", equals: ["married", "separated"] },
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
        },
        {
          id: "spouse_citizen_since",
          labelPt: "Como seu cônjuge se tornou cidadão americano",
          type: "radio",
          showWhen: { questionId: "spouse_is_citizen", equals: "yes" },
          options: [
            { value: "by_birth", labelPt: "De nascimento, nos EUA" },
            { value: "other", labelPt: "Outra forma (naturalização, por exemplo)" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { by_birth: `${S3}P10_Line5a_When[0]`, other: `${S3}P10_Line5a_When[1]` },
          },
        },
        {
          id: "spouse_citizen_date",
          labelPt: "Data em que seu cônjuge virou cidadão americano",
          type: "date",
          showWhen: { questionId: "spouse_citizen_since", equals: "other" },
          pdf: { kind: "text", field: `${S3}P10_Line5b_DateBecame[0]`, transform: isoToUsDate },
        },
      ],
    },

    // ── 8. Filhos (Part 6) ──────────────────────────────────────────────────
    {
      id: "filhos",
      titlePt: "Seus filhos",
      descriptionPt:
        "Liste até 3 filhos aqui — com mais que isso, use o espaço da Part 14 do formulário impresso. " +
        "Residência: escreva exatamente \"Resides with me\", \"Does not reside with me\", \"Unknown/Missing\" ou \"Deceased\". " +
        "Relação: escreva exatamente \"Biological son or daughter\", \"Stepchild\" ou \"Legally Adopted son or daughter\".",
      questions: [
        {
          id: "child1_name",
          labelPt: "Filho(a) 1 — nome completo",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P7_EmployerName1[0]` },
        },
        {
          id: "child1_dob",
          labelPt: "Data de nascimento",
          type: "date",
          pdf: { kind: "text", field: `${S4}P7_From1[0]`, transform: isoToUsDate },
        },
        {
          id: "child1_residence",
          labelPt: "Residência (em inglês, frase exata)",
          type: "text",
          passthroughEn: true,
          placeholder: "Resides with me",
          pdf: { kind: "text", field: `${S4}P7_OccupationFieldStudy1[0]` },
        },
        {
          id: "child1_relationship",
          labelPt: "Relação (em inglês, frase exata)",
          type: "text",
          passthroughEn: true,
          placeholder: "Biological son or daughter",
          pdf: { kind: "text", field: `${S4}P7_OccupationFieldStudy1[1]` },
        },
        {
          id: "child1_support",
          labelPt: "Você presta suporte financeiro a esse(a) filho(a)?",
          type: "radio",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S4}P9_Line5a[0]`, no: `${S4}P9_Line5a[1]` },
          },
        },
        {
          id: "child2_name",
          labelPt: "Filho(a) 2 — nome completo",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P7_EmployerName2[0]` },
        },
        {
          id: "child2_dob",
          labelPt: "Data de nascimento",
          type: "date",
          pdf: { kind: "text", field: `${S4}P7_From2[0]`, transform: isoToUsDate },
        },
        {
          id: "child2_residence",
          labelPt: "Residência (em inglês, frase exata)",
          type: "text",
          passthroughEn: true,
          placeholder: "Resides with me",
          pdf: { kind: "text", field: `${S4}P7_OccupationFieldStudy2[0]` },
        },
        {
          id: "child2_relationship",
          labelPt: "Relação (em inglês, frase exata)",
          type: "text",
          passthroughEn: true,
          placeholder: "Biological son or daughter",
          pdf: { kind: "text", field: `${S4}P7_OccupationFieldStudy2[1]` },
        },
        {
          id: "child2_support",
          labelPt: "Você presta suporte financeiro a esse(a) filho(a)?",
          type: "radio",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S4}P6_ChildTwo[0]`, yes: `${S4}P6_ChildTwo[1]` },
          },
        },
        {
          id: "child3_name",
          labelPt: "Filho(a) 3 — nome completo",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P7_EmployerName3[0]` },
        },
        {
          id: "child3_dob",
          labelPt: "Data de nascimento",
          type: "date",
          pdf: { kind: "text", field: `${S4}P7_From3[0]`, transform: isoToUsDate },
        },
        {
          id: "child3_residence",
          labelPt: "Residência (em inglês, frase exata)",
          type: "text",
          passthroughEn: true,
          placeholder: "Resides with me",
          pdf: { kind: "text", field: `${S4}P7_OccupationFieldStudy3[0]` },
        },
        {
          id: "child3_relationship",
          labelPt: "Relação (em inglês, frase exata)",
          type: "text",
          passthroughEn: true,
          placeholder: "Biological son or daughter",
          pdf: { kind: "text", field: `${S4}P7_OccupationFieldStudy3[1]` },
        },
        {
          id: "child3_support",
          labelPt: "Você presta suporte financeiro a esse(a) filho(a)?",
          type: "radio",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { no: `${S4}P6_ChildThree[0]`, yes: `${S4}P6_ChildThree[1]` },
          },
        },
      ],
    },

    // ── 9. Viagens fora dos EUA (Part 8) ────────────────────────────────────
    {
      id: "viagens",
      titlePt: "Viagens fora dos EUA nos últimos 5 anos",
      descriptionPt: "Comece pela mais recente. Não inclua viagens de um dia (menos de 24 horas).",
      questions: (["1", "2", "3", "4", "5", "6"] as const).flatMap((n) => [
        {
          id: `trip${n}_countries`,
          labelPt: `Viagem ${n} — países visitados (em inglês)`,
          type: "text" as const,
          passthroughEn: true,
          pdf: {
            kind: "text" as const,
            field: n === "1" ? `${S5}P9_Line1_Countries1[0]` : `${S5}P8_Line1_Countries${n}[0]`,
          },
        },
        {
          id: `trip${n}_left`,
          labelPt: `Viagem ${n} — data de saída dos EUA`,
          type: "date" as const,
          pdf: { kind: "text" as const, field: `${S5}P8_Line1_DateLeft${n}[0]`, transform: isoToUsDate },
        },
        {
          id: `trip${n}_return`,
          labelPt: `Viagem ${n} — data de retorno aos EUA`,
          type: "date" as const,
          pdf: { kind: "text" as const, field: `${S5}P8_Line1_DateReturn${n}[0]`, transform: isoToUsDate },
        },
      ]),
    },

    // ── 10. Informações adicionais — Part 9 (elegibilidade e caráter moral) ──
    {
      id: "adicional",
      titlePt: "Informações adicionais sobre você",
      descriptionPt:
        "Estas perguntas são do próprio formulário oficial (Part 9) — o USCIS exige resposta honesta a todas, " +
        "\"alguma vez\" inclui fatos de qualquer época da sua vida, dentro ou fora dos EUA. A Immigrei apenas " +
        "transcreve o que você responder; a escolha da resposta é inteiramente sua.",
      questions: [
        p9("claimed_us_citizen", "Você já alegou ser cidadão americano (por escrito ou de qualquer outra forma)?", `${S5}P9_Line1[1]`, `${S5}P9_Line1[0]`),
        p9("voted_in_us", "Você já se registrou para votar ou votou em alguma eleição federal, estadual ou local nos EUA?", `${S5}P9_Line2[1]`, `${S5}P9_Line2[0]`),
        p9("owes_taxes", "Você deve atualmente algum imposto federal, estadual ou local em atraso nos EUA?", `${S5}P9_Line3[0]`, `${S5}P9_Line3[1]`),
        p9("claimed_nonresident_tax", "Desde que virou residente permanente, você já se declarou \"não residente dos EUA\" numa declaração de imposto, ou deixou de declarar por se considerar não residente?", `${S5}P9_Line4[0]`, `${S5}P9_Line4[1]`),
        p9("communist_party_member", "Você já foi membro de, ou de alguma forma associado a, algum partido comunista ou totalitário em qualquer lugar do mundo?", `${S5}P9_5a[0]`, `${S5}P9_5a[1]`),
        p9("subversive_group_member", "Você já foi membro de, ou associado a, algum grupo que prega a oposição a todo governo organizado, o comunismo mundial, a derrubada do governo dos EUA por força ou meios inconstitucionais, o assassinato de autoridades do governo, dano a propriedade, ou sabotagem?", `${S5}P9_5b[0]`, `${S5}P9_5b[1]`),
        p9("group_weapon_harm", "Você já foi membro de, associado a, ou prestou dinheiro, bens, serviços ou qualquer outra ajuda a um grupo que usou arma ou explosivo com intenção de ferir pessoa ou danificar propriedade?", `${S6}P12_6a[1]`, `${S6}P12_6a[0]`),
        p9("group_kidnap_hijack", "Esse grupo já se envolveu em sequestro, assassinato, ou sabotagem/sequestro de avião, navio ou veículo?", `${S6}P12_6b[0]`, `${S6}P12_6b[1]`),
        p9("threatened_or_planned_above", "Você já ameaçou, tentou, planejou com outros, preparou, defendeu ou incentivou alguém a cometer os atos das duas perguntas anteriores?", `${S6}P12_6c[1]`, `${S6}P12_6c[0]`),
        p9("torture", "Você já ordenou, incitou, cometeu, ajudou ou participou de tortura?", `${S6}P9_Line7a[1]`, `${S6}P9_Line7a[0]`),
        p9("genocide", "Você já ordenou, incitou, cometeu, ajudou ou participou de genocídio?", `${S6}P9_Line7\\.b\\.[1]`, `${S6}P9_Line7\\.b\\.[0]`),
        p9("killing", "Você já ordenou, incitou, cometeu, ajudou ou participou de matar ou tentar matar alguém?", `${S6}P9_Line7\\.c[1]`, `${S6}P9_Line7\\.c[0]`),
        p9("severe_injury", "Você já ordenou, incitou, cometeu, ajudou ou participou de ferir gravemente ou tentar ferir gravemente alguém, intencionalmente?", `${S6}P11_7d[1]`, `${S6}P11_7d[0]`),
        p9("nonconsensual_sexual_contact", "Você já ordenou, incitou, cometeu, ajudou ou participou de contato sexual sem consentimento de alguém, ou com alguém incapaz de consentir, ou sob ameaça?", `${S6}P9_Line7\\.e[1]`, `${S6}P9_Line7\\.e[0]`),
        p9("religious_persecution", "Você já impediu alguém de praticar sua religião?", `${S6}P9_Line7\\.f[1]`, `${S6}P9_Line7\\.f[0]`),
        p9("harm_based_on_group", "Você já causou dano ou sofrimento a alguém por causa de raça, religião, origem nacional, grupo social ou opinião política?", `${S6}P9_Line7\\.g[1]`, `${S6}P9_Line7\\.g[0]`),
        p9("armed_group_member", "Você já serviu, foi membro, ajudou ou participou de algum grupo armado (unidade militar, paramilitar, policial, de autodefesa, vigilante, rebelde ou guerrilha)?", `${S6}P9_Line8a[1]`, `${S6}P9_Line8a[0]`, { helpPt: "Se \"Sim\", inclua o país, o nome do grupo, sua função e as datas de envolvimento numa explicação separada." }),
        p9("group_used_weapon_against_person", "Você já foi parte de, ou ajudou, algum grupo que usou arma contra alguém, ou ameaçou fazer isso?", `${S6}P9_Line10a[1]`, `${S6}P9_Line10a[0]`),
        p9("personally_used_weapon", "Enquanto parte desse grupo (pergunta anterior), você já usou uma arma contra alguém?", `${S6}P9_Line10b[1]`, `${S6}P9_Line10b[0]`),
        p9("personally_threatened_weapon", "Enquanto parte desse grupo, você já ameaçou usar uma arma contra alguém?", `${S6}P9_Line10c[0]`, `${S6}P9_Line10c[1]`),
        p9("detained_people", "Você já trabalhou, foi voluntário ou serviu em algum lugar onde pessoas eram detidas (prisão, campo de prisioneiros, centro de detenção), ou dirigiu/participou de qualquer atividade envolvendo deter pessoas?", `${S6}P9_Line9[1]`, `${S6}P9_Line9[0]`),
        p9("sold_transported_weapons", "Você já vendeu, forneceu ou transportou armas, ou ajudou alguém a fazer isso, sabendo ou acreditando que seriam usadas contra outra pessoa?", `${S6}P9_Line11[1]`, `${S6}P9_Line11[0]`),
        p9("weapons_training", "Você já recebeu treinamento com armas, paramilitar, ou de tipo militar?", `${S6}P9_Line12[1]`, `${S6}P9_Line12[0]`),
        p9("recruited_child_soldiers", "Você já recrutou, alistou ou usou alguém menor de 15 anos para servir ou ajudar um grupo armado?", `${S6}P9_Line13[1]`, `${S6}P9_Line13[0]`),
        p9("used_child_in_hostilities", "Você já usou alguém menor de 15 anos para participar de hostilidades (combate ou serviços relacionados, como carregar suprimentos)?", `${S6}P9_Line14[1]`, `${S6}P9_Line14[0]`),
        p9("committed_uncharged_crime", "Você já cometeu, concordou em cometer, pediu a alguém para cometer, ajudou a cometer, ou tentou cometer um crime pelo qual você NÃO foi preso?", `${S7}P9_Line15a[1]`, `${S7}P9_Line15a[0]`),
        p9("ever_arrested_or_charged", "Você já foi preso, detido, multado ou notificado de investigação por qualquer autoridade (nos EUA ou fora), ou acusado de um crime?", `${S7}P9_Line15b[1]`, `${S7}P9_Line15b[0]`, { helpPt: "Se \"Sim\", você vai precisar detalhar cada ocorrência — mesmo que o registro tenha sido selado, anulado (expunged) ou você tenha sido informado que não precisa declarar." }),
        {
          id: "crime1_what",
          labelPt: "Qual foi o crime ou infração (em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "ever_arrested_or_charged", equals: "yes" },
          pdf: { kind: "text", field: `${S7}P12_Line29_why1[0]` },
        },
        {
          id: "crime1_date",
          labelPt: "Data do crime ou infração",
          type: "date",
          showWhen: { questionId: "ever_arrested_or_charged", equals: "yes" },
          pdf: { kind: "text", field: `${S7}P12_Line29_Date1[0]`, transform: isoToUsDate },
        },
        {
          id: "crime1_place",
          labelPt: "Local (cidade, estado, país — em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "ever_arrested_or_charged", equals: "yes" },
          pdf: { kind: "text", field: `${S7}P12_Line29_Outcome1[1]` },
        },
        {
          id: "crime1_outcome",
          labelPt: "Resultado (em inglês — ex.: No Charges Filed, Convicted, Charges Dismissed)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "ever_arrested_or_charged", equals: "yes" },
          pdf: { kind: "text", field: `${S7}P12_Line29_Outcome1[0]` },
        },
        {
          id: "crime1_sentence",
          labelPt: "Sentença, se houve condenação (em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "ever_arrested_or_charged", equals: "yes" },
          pdf: { kind: "text", field: `${S7}P12_Line29_Outcome1[2]` },
        },
        {
          id: "crime1_conviction_date",
          labelPt: "Data da condenação ou do plea, se houve",
          type: "date",
          showWhen: { questionId: "ever_arrested_or_charged", equals: "yes" },
          pdf: { kind: "text", field: `${S7}P12_Line29_DateOfConv1[0]`, transform: isoToUsDate },
        },
        p9("completed_sentence", "Se você recebeu sentença suspensa, ficou em condicional (probation) ou em liberdade condicional (parole): você já completou o período?", `${S7}P12_Line16[1]`, `${S7}P12_Line16[0]`),
        p9("prostitution", "Você já se envolveu com prostituição (praticou, tentou procurar/importar pessoas, ou recebeu proventos dessa atividade)?", `${S8}P11_Line17A[1]`, `${S8}P11_Line17A[0]`),
        p9("drug_trafficking", "Você já fabricou, produziu, distribuiu, vendeu ou contrabandeou substâncias controladas, drogas ilegais ou parafernália, em violação de alguma lei?", `${S8}P11_Line17B[1]`, `${S8}P11_Line17B[0]`),
        p9("bigamy", "Você já foi casado(a) com mais de uma pessoa ao mesmo tempo?", `${S8}P11_Line17C[1]`, `${S8}P11_Line17C[0]`),
        p9("married_for_benefit", "Você já se casou com alguém para obter um benefício de imigração?", `${S8}P12_Line17d[1]`, `${S8}P12_Line17d[0]`),
        p9("helped_illegal_entry", "Você já ajudou alguém a entrar, ou tentar entrar, ilegalmente nos EUA?", `${S8}P12_Line17e[1]`, `${S8}P12_Line17e[0]`),
        p9("illegal_gambling", "Você já apostou ilegalmente ou recebeu renda de jogo ilegal?", `${S8}P12_Line17f[0]`, `${S8}P12_Line17f[1]`),
        p9("failed_child_support", "Você já deixou de sustentar seus dependentes (pensão de filhos) ou pagar pensão alimentícia determinada por um tribunal?", `${S8}P12_Line17g[1]`, `${S8}P12_Line17g[0]`),
        p9("misrepresented_public_benefit", "Você já fez alguma declaração falsa para obter benefício público nos EUA?", `${S8}P12_Line17h[1]`, `${S8}P12_Line17h[0]`),
        p9("false_info_to_government", "Você já deu informação ou documentação falsa, fraudulenta ou enganosa a autoridades do governo dos EUA?", `${S8}P12_Line18[0]`, `${S8}P12_Line18[1]`),
        p9("lied_for_immigration_benefit", "Você já mentiu para autoridades do governo dos EUA para conseguir entrada ou algum benefício de imigração?", `${S8}P12_Line19[0]`, `${S8}P12_Line19[1]`),
        p9("in_removal_proceedings", "Você já foi colocado em processo de remoção, rescisão ou deportação?", `${S8}P12_Line20[1]`, `${S8}P12_Line20[0]`),
        p9("ever_removed_deported", "Você já foi removido ou deportado dos EUA?", `${S8}P12_Line21[1]`, `${S8}P12_Line21[0]`),
        p9("male_18_to_26_in_us", "Você é homem e morou nos EUA (exceto como não-imigrante) entre os 18 e os 26 anos?", `${S8}P9_Line22a[1]`, `${S8}P9_Line22a[0]`),
        p9("registered_selective_service", "Se sim à pergunta anterior: você se registrou no Selective Service?", `${S8}Pt9_Line22b[1]`, `${S8}Pt9_Line22b[0]`, { showWhen: { questionId: "male_18_to_26_in_us", equals: "yes" } }),
        {
          id: "selective_service_date",
          labelPt: "Data do registro no Selective Service",
          type: "date",
          showWhen: { questionId: "registered_selective_service", equals: "yes" },
          pdf: { kind: "text", field: `${S8}P9_Line22c_Date[0]`, transform: isoToUsDate },
        },
        {
          id: "selective_service_number",
          labelPt: "Número do Selective Service",
          type: "text",
          showWhen: { questionId: "registered_selective_service", equals: "yes" },
          pdf: { kind: "text", field: `${S8}P9_Line22c_SSNumber[0]` },
        },
        p9("avoided_draft", "Você já saiu dos EUA para evitar ser convocado para as Forças Armadas?", `${S8}P12_Line23[1]`, `${S8}P12_Line23[0]`),
        p9("applied_military_exemption", "Você já pediu isenção de serviço militar nas Forças Armadas dos EUA?", `${S8}P12_Line24[1]`, `${S8}P12_Line24[0]`),
        p9("ever_served_military", "Você já serviu nas Forças Armadas dos EUA?", `${S8}P12_Line25[1]`, `${S8}P12_Line25[0]`, { helpPt: "Se \"Não\", as próximas perguntas de serviço militar não se aplicam." }),
        p9("currently_in_military", "Você é atualmente membro das Forças Armadas dos EUA?", `${S9}P12_Line26a[1]`, `${S9}P12_Line26a[0]`, { showWhen: { questionId: "ever_served_military", equals: "yes" } }),
        p9("deploying_soon", "Você está programado para ser destacado para fora dos EUA nos próximos 3 meses?", `${S9}P12_Line26b[1]`, `${S9}P12_Line26b[0]`, { showWhen: { questionId: "currently_in_military", equals: "yes" } }),
        p9("stationed_outside_us", "Você está atualmente baseado fora dos EUA?", `${S9}P12_Line26c[1]`, `${S9}P12_Line26c[0]`, { showWhen: { questionId: "currently_in_military", equals: "yes" } }),
        p9("court_martialed_or_bad_discharge", "Você já foi julgado em corte marcial, ou recebeu dispensa caracterizada como não-honrosa, por má conduta, ou desonrosa?", `${S9}P12_Line27[0]`, `${S9}P12_Line27[1]`, { showWhen: { questionId: "ever_served_military", equals: "yes" } }),
        p9("discharged_for_being_alien", "Você já foi dispensado do treinamento ou serviço nas Forças Armadas por ser estrangeiro?", `${S9}P12_Line28[0]`, `${S9}P12_Line28[1]`, { showWhen: { questionId: "ever_served_military", equals: "yes" } }),
        p9("deserted_military", "Você já desertou das Forças Armadas dos EUA?", `${S9}P9_Line29[1]`, `${S9}P9_Line29[0]`, { showWhen: { questionId: "ever_served_military", equals: "yes" } }),
        p9("has_noble_title", "Você tem, ou já teve, um título hereditário ou de nobreza em algum país estrangeiro?", `${S9}P12_Line30a[0]`, `${S9}P12_Line30a[1]`),
        p9("willing_renounce_title", "Se sim: você está disposto(a) a renunciar a esse título na cerimônia de naturalização?", `${S9}P12_Line30b[0]`, `${S9}P12_Line30b[1]`, { showWhen: { questionId: "has_noble_title", equals: "yes" } }),
        p9("supports_constitution", "Você apoia a Constituição e a forma de governo dos Estados Unidos?", `${S9}P12_Line31[1]`, `${S9}P12_Line31[0]`),
        p9("understands_oath", "Você entende o Juramento de Fidelidade completo (veja a Part 15)?", `${S9}P12_Line32[0]`, `${S9}P12_Line32[1]`),
        p9("disability_exempt_from_oath", "Você é incapaz de prestar o Juramento por causa de deficiência física, de desenvolvimento, ou transtorno mental?", `${S9}P12_Line33[0]`, `${S9}P12_Line33[1]`, { helpPt: "Se \"Sim\", as próximas 4 perguntas (sobre o próprio juramento) não se aplicam — veja a seção sobre representante legal nas instruções." }),
        p9("willing_take_oath", "Você está disposto(a) a prestar o Juramento de Fidelidade completo?", `${S9}P12_Line34[1]`, `${S9}P12_Line34[0]`, { showWhen: { questionId: "disability_exempt_from_oath", equals: "no" } }),
        p9("willing_bear_arms", "Se a lei exigir: você está disposto(a) a pegar em armas em nome dos EUA?", `${S9}P12_Line35[0]`, `${S9}P12_Line35[1]`, { showWhen: { questionId: "disability_exempt_from_oath", equals: "no" } }),
        p9("willing_noncombatant_service", "Se a lei exigir: você está disposto(a) a prestar serviço não-combatente nas Forças Armadas?", `${S9}P12_Line36[1]`, `${S9}P12_Line36[0]`, { showWhen: { questionId: "disability_exempt_from_oath", equals: "no" } }),
        p9("willing_civilian_work", "Se a lei exigir: você está disposto(a) a prestar trabalho de importância nacional sob direção civil?", `${S9}P12_Line37[0]`, `${S9}P12_Line37[1]`, { showWhen: { questionId: "disability_exempt_from_oath", equals: "no" } }),
      ],
    },

    // ── 11. Contato (Part 10) ───────────────────────────────────────────────
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
          pdf: { kind: "text", field: `${S10}P12_Line3_Telephone[0]` },
        },
        {
          id: "mobile_phone",
          labelPt: "Seu celular",
          type: "text",
          pdf: { kind: "text", field: `${S10}P12_Line3_Mobile[0]` },
        },
        {
          id: "email",
          labelPt: "Seu e-mail",
          type: "text",
          prefillFrom: "email",
          pdf: { kind: "text", field: `${S10}P12_Line5_Email[0]` },
        },
      ],
    },
  ],
};
