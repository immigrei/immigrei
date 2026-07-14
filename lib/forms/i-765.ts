/**
 * I-765 — Application for Employment Authorization (OPT).
 *
 * Data-driven spec for the F-1 -> OPT work-permission form. PT-BR questions the
 * user answers; each answer maps to the exact AcroForm field of the official
 * USCIS PDF (field names extracted from the real edition 08/21/25 asset at
 * public/forms/i-765.pdf — never guessed).
 *
 * Scope (MVP): standard OPT for an F-1 student — post-completion (c)(3)(B) and
 * pre-completion (c)(3)(A). STEM (c)(3)(C) and other categories are additive
 * later. The engine is ministerial: it transcribes and translates what the
 * user enters. It never decides eligibility. Signature/attestation boxes in
 * Part 3 are intentionally left blank — the applicant signs by hand.
 */

import type { FormSpec } from "./types";

// AcroForm field-name prefix on every I-765 field.
const F = "form1[0].";
const P1 = `${F}Page1[0].`;
const P2 = `${F}Page2[0].`;
const P3 = `${F}Page3[0].`;
const P4 = `${F}Page4[0].`;

// ISO yyyy-mm-dd (how we store dates) -> USCIS mm/dd/yyyy text.
function isoToUsDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

export const I765: FormSpec = {
  id: "i-765",
  code: "I-765",
  officialName: "Application for Employment Authorization",
  namePt: "Autorização de Trabalho (OPT)",
  agency: "USCIS",
  officialUrl: "https://www.uscis.gov/i-765",
  edition: "08/21/25",
  exportKind: "pdf",
  pdfAssetPath: "forms/i-765.pdf",
  attachTo: { vistoId: "f1-opt", documentoId: "i765" },
  disclaimerPt:
    "Este formulário foi preenchido por você com as informações que você forneceu. " +
    "A Immigrei é uma ferramenta de preenchimento — não presta serviços jurídicos " +
    "e não revisa o mérito do seu caso. Confira cada campo e assine à mão antes de enviar ao USCIS.",

  sections: [
    // ── 1. Tipo de OPT (define a categoria de elegibilidade) ────────────────
    {
      id: "tipo",
      titlePt: "Qual OPT você está pedindo?",
      descriptionPt:
        "Isso define sua categoria de elegibilidade (item 27 do formulário).",
      questions: [
        {
          id: "opt_type",
          labelPt: "Tipo de OPT",
          helpPt:
            "Pós-conclusão é o mais comum: até 12 meses de trabalho depois de formar. " +
            "Pré-conclusão é trabalhar durante o curso.",
          type: "radio",
          required: true,
          default: "pos",
          options: [
            { value: "pos", labelPt: "Pós-conclusão — depois de formar", valueEn: "(c)(3)(B)" },
            { value: "pre", labelPt: "Pré-conclusão — durante o curso", valueEn: "(c)(3)(A)" },
          ],
          // Item 27: three boxes → (c)(3)(B) ou (c)(3)(A).
          pdf: [
            { kind: "text", field: `${P3}#area[1].section_1[0]`, transform: () => "(c)" },
            { kind: "text", field: `${P3}#area[1].section_2[0]`, transform: () => "(3)" },
            {
              kind: "text",
              field: `${P3}#area[1].section_3[0]`,
              transform: (v) => (v === "pre" ? "(A)" : "(B)"),
            },
          ],
        },
        {
          id: "reason",
          labelPt: "Motivo do pedido",
          helpPt: "Para o primeiro EAD do seu OPT, é a permissão inicial.",
          type: "radio",
          required: true,
          default: "initial",
          options: [
            { value: "initial", labelPt: "Permissão inicial de trabalho" },
            { value: "replacement", labelPt: "Substituição de EAD perdido/roubado/danificado" },
            { value: "renewal", labelPt: "Renovação de permissão anterior" },
          ],
          // Part 1, item 1: three separate checkboxes.
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              initial: `${P1}Part1_Checkbox[0]`,
              replacement: `${P1}Part1_Checkbox[1]`,
              renewal: `${P1}Part1_Checkbox[2]`,
            },
          },
        },
      ],
    },

    // ── 2. Nome legal completo (Part 2, item 1) ─────────────────────────────
    {
      id: "nome",
      titlePt: "Seu nome legal completo",
      descriptionPt: "Exatamente como aparece no seu passaporte.",
      questions: [
        {
          id: "family_name",
          labelPt: "Sobrenome (Family Name)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${P1}Line1a_FamilyName[0]` },
        },
        {
          id: "given_name",
          labelPt: "Nome (Given Name)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${P1}Line1b_GivenName[0]` },
        },
        {
          id: "middle_name",
          labelPt: "Nome do meio (Middle Name)",
          helpPt: "Deixe em branco se não tiver.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${P1}Line1c_MiddleName[0]` },
        },
      ],
    },

    // ── 3. Nascimento e cidadania (Part 2, itens 14–16) ─────────────────────
    {
      id: "nascimento",
      titlePt: "Nascimento e cidadania",
      questions: [
        {
          id: "dob",
          labelPt: "Data de nascimento",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${P3}Line19_DOB[0]`, transform: isoToUsDate },
        },
        {
          id: "citizenship_country",
          labelPt: "País de cidadania",
          helpPt: "Escreva em inglês (ex.: Brazil).",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${P2}Line17a_CountryOfBirth[0]` },
        },
        {
          id: "birth_city",
          labelPt: "Cidade de nascimento",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${P3}Line18a_CityTownOfBirth[0]` },
        },
        {
          id: "birth_state",
          labelPt: "Estado de nascimento",
          helpPt: "Ex.: Sao Paulo, Minas Gerais.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${P3}Line18b_CityTownOfBirth[0]` },
        },
        {
          id: "birth_country",
          labelPt: "País de nascimento",
          helpPt: "Escreva em inglês (ex.: Brazil).",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${P3}Line18c_CountryOfBirth[0]` },
        },
      ],
    },

    // ── 4. Endereço nos EUA (Part 2, itens 5–7) ─────────────────────────────
    {
      id: "endereco",
      titlePt: "Seu endereço nos EUA",
      descriptionPt: "Endereço onde você recebe correspondência (mailing address).",
      questions: [
        {
          id: "mail_in_care_of",
          labelPt: "Aos cuidados de (In Care Of)",
          helpPt: "Opcional. Nome de quem recebe por você, se for o caso.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${P2}Line4a_InCareofName[0]` },
        },
        {
          id: "mail_street",
          labelPt: "Rua e número",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${P2}Line4b_StreetNumberName[0]` },
        },
        {
          id: "mail_unit",
          labelPt: "Complemento (apto/sala/andar)",
          helpPt: "Opcional.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${P2}Pt2Line5_AptSteFlrNumber[0]` },
        },
        {
          id: "mail_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${P2}Pt2Line5_CityOrTown[0]` },
        },
        {
          id: "mail_state",
          labelPt: "Estado (sigla de 2 letras)",
          helpPt: "Ex.: FL, MA, CA.",
          type: "text",
          required: true,
          placeholder: "FL",
          validate: { pattern: /^[A-Za-z]{2}$/, messagePt: "Use a sigla de 2 letras do estado (ex.: FL)." },
          pdf: {
            kind: "dropdown",
            field: `${P2}Pt2Line5_State[0]`,
          },
        },
        {
          id: "mail_zip",
          labelPt: "ZIP Code",
          type: "text",
          required: true,
          placeholder: "33101",
          validate: { pattern: /^\d{5}(-\d{4})?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          pdf: { kind: "text", field: `${P2}Pt2Line5_ZipCode[0]` },
        },
        {
          id: "mail_same_as_physical",
          labelPt: "Esse é também o endereço onde você mora?",
          helpPt: "Item 6 do formulário.",
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
              yes: `${P2}Part2Line5_Checkbox[1]`,
              no: `${P2}Part2Line5_Checkbox[0]`,
            },
          },
        },
        // Endereço físico — só quando difere do de correspondência (item 7).
        {
          id: "phys_street",
          labelPt: "Endereço onde você mora — rua e número",
          type: "text",
          required: true,
          passthroughEn: true,
          showWhen: { questionId: "mail_same_as_physical", equals: "no" },
          pdf: { kind: "text", field: `${P2}Pt2Line7_StreetNumberName[0]` },
        },
        {
          id: "phys_unit",
          labelPt: "Complemento (apto/sala/andar)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "mail_same_as_physical", equals: "no" },
          pdf: { kind: "text", field: `${P2}Pt2Line7_AptSteFlrNumber[0]` },
        },
        {
          id: "phys_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          showWhen: { questionId: "mail_same_as_physical", equals: "no" },
          pdf: { kind: "text", field: `${P2}Pt2Line7_CityOrTown[0]` },
        },
        {
          id: "phys_state",
          labelPt: "Estado (sigla de 2 letras)",
          type: "text",
          required: true,
          placeholder: "FL",
          validate: { pattern: /^[A-Za-z]{2}$/, messagePt: "Use a sigla de 2 letras do estado (ex.: FL)." },
          showWhen: { questionId: "mail_same_as_physical", equals: "no" },
          pdf: { kind: "dropdown", field: `${P2}Pt2Line7_State[0]` },
        },
        {
          id: "phys_zip",
          labelPt: "ZIP Code",
          type: "text",
          required: true,
          validate: { pattern: /^\d{5}(-\d{4})?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          showWhen: { questionId: "mail_same_as_physical", equals: "no" },
          pdf: { kind: "text", field: `${P2}Pt2Line7_ZipCode[0]` },
        },
      ],
    },

    // ── 5. Chegada e status atual (Part 2, itens 17–26) ─────────────────────
    {
      id: "chegada",
      titlePt: "Sua última entrada nos EUA e status atual",
      descriptionPt: "Você encontra o número do I-94 em i94.cbp.dhs.gov.",
      questions: [
        {
          id: "i94_number",
          labelPt: "Número do I-94 (11 dígitos)",
          helpPt: "Está no seu registro em i94.cbp.dhs.gov.",
          type: "text",
          pdf: { kind: "text", field: `${P3}Line20a_I94Number[0]` },
        },
        {
          id: "passport_number",
          labelPt: "Número do passaporte",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${P3}Line20b_Passport[0]` },
        },
        {
          id: "passport_country",
          labelPt: "País que emitiu o passaporte",
          helpPt: "Escreva em inglês (ex.: Brazil).",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${P3}Line20d_CountryOfIssuance[0]` },
        },
        {
          id: "passport_expiry",
          labelPt: "Validade do passaporte",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${P3}Line20e_ExpDate[0]`, transform: isoToUsDate },
        },
        {
          id: "last_entry_date",
          labelPt: "Data da sua última entrada nos EUA",
          type: "date",
          required: true,
          prefillFrom: "arrival_date",
          pdf: { kind: "text", field: `${P3}Line21_DateOfLastEntry[0]`, transform: isoToUsDate },
        },
        {
          id: "place_of_entry",
          labelPt: "Local da última entrada",
          helpPt: "Cidade/aeroporto por onde você entrou (ex.: Miami, FL).",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${P3}place_entry[0]` },
        },
        {
          id: "status_at_entry",
          labelPt: "Status na sua última entrada",
          helpPt: "Ex.: B-2 visitor, F-1 student.",
          type: "text",
          passthroughEn: true,
          default: "F-1 student",
          pdf: { kind: "text", field: `${P3}Line23_StatusLastEntry[0]` },
        },
        {
          id: "current_status",
          labelPt: "Seu status atual",
          helpPt: "Ex.: F-1 student.",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "F-1 student",
          pdf: { kind: "text", field: `${P3}Line24_CurrentStatus[0]` },
        },
        {
          id: "sevis_number",
          labelPt: "Número SEVIS",
          helpPt: "Começa com N e está no seu I-20 (ex.: N0012345678).",
          type: "text",
          required: true,
          pdf: { kind: "text", field: `${P3}Line26_SEVISnumber[0]` },
        },
      ],
    },

    // ── 6. Outras informações (Part 2, itens 8–13) ──────────────────────────
    {
      id: "outras",
      titlePt: "Outras informações",
      questions: [
        {
          id: "sex",
          labelPt: "Sexo (como no passaporte)",
          type: "radio",
          required: true,
          options: [
            { value: "female", labelPt: "Feminino" },
            { value: "male", labelPt: "Masculino" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              female: `${P2}Line9_Checkbox[0]`,
              male: `${P2}Line9_Checkbox[1]`,
            },
          },
        },
        {
          id: "marital_status",
          labelPt: "Estado civil",
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
              widowed: `${P2}Line10_Checkbox[0]`,
              divorced: `${P2}Line10_Checkbox[1]`,
              single: `${P2}Line10_Checkbox[2]`,
              married: `${P2}Line10_Checkbox[3]`,
            },
          },
        },
        {
          id: "previously_filed",
          labelPt: "Você já enviou um Formulário I-765 antes?",
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
              no: `${P2}Line19_Checkbox[0]`,
              yes: `${P2}Line19_Checkbox[1]`,
            },
          },
        },
        {
          id: "a_number",
          labelPt: "Número do estrangeiro (A-Number)",
          helpPt: "Opcional. A maioria dos estudantes F-1 não tem — deixe em branco se for o caso.",
          type: "text",
          pdf: { kind: "text", field: `${P2}Line7_AlienNumber[0]` },
        },
        {
          id: "uscis_online_account",
          labelPt: "Número da conta online do USCIS",
          helpPt: "Opcional. Só se você já criou uma conta em my.uscis.gov.",
          type: "text",
          pdf: { kind: "text", field: `${P2}Line8_ElisAccountNumber[0]` },
        },
        {
          id: "ssn",
          labelPt: "Número do Social Security (SSN)",
          helpPt: "Opcional. Só se você já tiver um.",
          type: "text",
          pdf: { kind: "text", field: `${P2}Line12b_SSN[0]` },
        },
      ],
    },

    // ── 7. Contato (Part 3) ─────────────────────────────────────────────────
    {
      id: "contato",
      titlePt: "Seu contato",
      descriptionPt:
        "A assinatura você faz à mão, na versão impressa — o Immigrei nunca assina por você.",
      questions: [
        {
          id: "daytime_phone",
          labelPt: "Telefone durante o dia",
          type: "text",
          pdf: { kind: "text", field: `${P4}Pt3Line3_DaytimePhoneNumber1[0]` },
        },
        {
          id: "mobile_phone",
          labelPt: "Celular",
          type: "text",
          pdf: { kind: "text", field: `${P4}Pt3Line4_MobileNumber1[0]` },
        },
        {
          id: "email",
          labelPt: "E-mail",
          type: "text",
          prefillFrom: "email",
          pdf: { kind: "text", field: `${P4}Pt3Line5_Email[0]` },
        },
      ],
    },
  ],
};
