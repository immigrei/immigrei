/**
 * I-539 — Application to Extend/Change Nonimmigrant Status.
 *
 * Data-driven spec for the change-of-status / extension form. PT-BR questions
 * the user answers; each answer maps to the exact AcroForm field of the
 * official USCIS PDF (field names extracted from the real edition 08/28/24
 * asset at public/forms/i-539.pdf — never guessed; ambiguous names were
 * resolved by widget position against the printed labels).
 *
 * Scope (MVP): a single applicant filing for themselves — extension of stay or
 * change of status (the B-2 -> F-1 kit's core form). Co-applicants (Form
 * I-539A) are additive later. The engine is ministerial: it transcribes what
 * the user enters. It never decides eligibility. Signature, interpreter
 * (Part 6) and preparer (Part 7) blocks are intentionally left blank — the
 * applicant signs by hand.
 *
 * Field-name quirks of this PDF (all verified positionally):
 *   - The mailing-address block uses `Part2_Item11_*` names and the Apt/Ste/Flr
 *     boxes use `Part1_Item4_Unit[0..2]`.
 *   - `SupA_Line1k_Passport[1]` is the school name (Part 2, Item 5) and
 *     `SupA_Line1k_Passport[2]` is the SEVIS ID (Part 2, Item 6).
 *   - `P4_Line1a_CountryOfIssuance[1]` is the current passport NUMBER;
 *     `[0]` is the country of issuance.
 *   - Part 4's yes/no battery is `P4_checkboxN_Yes/No` where N runs 3..20 over
 *     items 3, 4, 5, 6, 7a-7e, 8a-8b, 9, 10, 11, 12, 13, 14, 15 in order.
 */

import type { FormSpec, Option } from "./types";

// AcroForm subform prefixes (one per page of the I-539).
const F = "form1[0].";
const S0 = `${F}#subform[0].`; // page 1
const S1 = `${F}#subform[1].`; // page 2
const S2 = `${F}#subform[2].`; // page 3
const S3 = `${F}#subform[3].`; // page 4
const S4 = `${F}#subform[4].`; // page 5
const S6 = `${F}#subform[6].`; // page 7 (Part 8 additional info)

// ISO yyyy-mm-dd (how we store dates) -> USCIS mm/dd/yyyy text.
function isoToUsDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

// Exact option strings of the PDF's status dropdowns (note the leading space —
// it is part of the stored option value and must match verbatim).
const CURRENT_STATUS_OPTIONS: Option[] = [
  { value: "b1", labelPt: "B-1 — visitante de negócios", valueEn: " B1 - TEMPORARY VISITOR FOR BUSINESS" },
  { value: "b2", labelPt: "B-2 — turista", valueEn: " B2 - TEMPORARY VISITOR FOR PLEASURE" },
  { value: "f1", labelPt: "F-1 — estudante acadêmico", valueEn: " F1 - STUDENT - ACADEMIC" },
  { value: "f2", labelPt: "F-2 — dependente de F-1", valueEn: " F2 - SPOUSE-CHILD OF F-1" },
  { value: "m1", labelPt: "M-1 — estudante vocacional", valueEn: " M1 - STUDENT - VOCATIONAL-NON-ACAD." },
  { value: "m2", labelPt: "M-2 — dependente de M-1", valueEn: " M2 - SPOUSE-CHILD OF M-1" },
  { value: "j1", labelPt: "J-1 — intercambista", valueEn: " J1 - EXCHANGE VISITOR - OTHERS" },
  { value: "j2", labelPt: "J-2 — dependente de J-1", valueEn: " J2 - SPOUSE-CHILD OF J-1" },
  { value: "h1b", labelPt: "H-1B — trabalhador especializado", valueEn: " H1B - SPECIALITY OCCUPATION" },
  { value: "h4", labelPt: "H-4 — dependente de H", valueEn: " H4 - SPS OR CHLD OF H1,H2,H3 OR H2R" },
  { value: "o1", labelPt: "O-1 — habilidade extraordinária", valueEn: " O1 - ALIEN W-EXTRAORDINARY ABILITY" },
  { value: "o3", labelPt: "O-3 — dependente de O-1/O-2", valueEn: " O3 - SPOUSE-CHILD OF O-1, O-2" },
  { value: "l2", labelPt: "L-2 — dependente de L-1", valueEn: " L2 - SPOUSE-CHILD OF L-1" },
  { value: "e1", labelPt: "E-1 — treaty trader (ou dependente)", valueEn: " E1 - TREATY TRADER-SPOUSE-CHILDREN" },
  { value: "e2", labelPt: "E-2 — treaty investor (ou dependente)", valueEn: " E2 - TREATY INVESTOR-SPOUSE-CHILD" },
];

// Statuses one can REQUEST via I-539 (principal work statuses like H-1B/L-1/O-1
// require Form I-129 and are deliberately absent — as on the official PDF).
const NEW_STATUS_OPTIONS: Option[] = [
  { value: "f1", labelPt: "F-1 — estudante acadêmico", valueEn: " F1 - STUDENT - ACADEMIC" },
  { value: "f2", labelPt: "F-2 — dependente de F-1", valueEn: " F2 - SPOUSE-CHILD OF F-1" },
  { value: "m1", labelPt: "M-1 — estudante vocacional", valueEn: " M1 - STUDENT - VOCATIONAL-NON-ACAD." },
  { value: "m2", labelPt: "M-2 — dependente de M-1", valueEn: " M2 - SPOUSE-CHILD OF M-1" },
  { value: "j1", labelPt: "J-1 — intercambista", valueEn: " J1 - EXCHANGE VISITOR - OTHERS" },
  { value: "j2", labelPt: "J-2 — dependente de J-1", valueEn: " J2 - SPOUSE-CHILD OF J-1" },
  { value: "b1", labelPt: "B-1 — visitante de negócios", valueEn: " B1 - TEMPORARY VISITOR FOR BUSINESS" },
  { value: "b2", labelPt: "B-2 — turista", valueEn: " B2 - TEMPORARY VISITOR FOR PLEASURE" },
  { value: "h4", labelPt: "H-4 — dependente de H", valueEn: " H4 - SPS OR CHLD OF H1,H2,H3 OR H2R" },
];

// One yes/no question of the Part 4 battery, mapped to its checkbox pair.
function yesNo(id: string, n: number, labelPt: string, helpPt?: string) {
  const page = n <= 5 ? S2 : S3; // items 3-5 sit on page 3, the rest on page 4
  return {
    id,
    labelPt,
    helpPt,
    type: "radio" as const,
    required: true,
    options: [
      { value: "no", labelPt: "Não" },
      { value: "yes", labelPt: "Sim" },
    ],
    pdf: {
      kind: "checkboxChoice" as const,
      fieldByValue: {
        yes: `${page}P4_checkbox${n}_Yes[0]`,
        no: `${page}P4_checkbox${n}_No[0]`,
      },
    },
  };
}

export const I539: FormSpec = {
  id: "i-539",
  code: "I-539",
  officialName: "Application to Extend/Change Nonimmigrant Status",
  namePt: "Extensão ou Mudança de Status (dentro dos EUA)",
  agency: "USCIS",
  officialUrl: "https://www.uscis.gov/i-539",
  edition: "08/28/24",
  exportKind: "pdf",
  pdfAssetPath: "forms/i-539.pdf",
  attachTo: { vistoId: "f1-cos", documentoId: "i539" },
  disclaimerPt:
    "Este formulário foi preenchido por você com as informações que você forneceu. " +
    "A Immigrei é uma ferramenta de preenchimento — não presta serviços jurídicos " +
    "e não revisa o mérito do seu caso. Confira cada campo e assine à mão antes de enviar ao USCIS.",

  sections: [
    // ── 1. O que você está pedindo (Part 2 + Part 3 item 1) ─────────────────
    {
      id: "pedido",
      titlePt: "O que você está pedindo?",
      descriptionPt:
        "O I-539 serve para estender sua estadia no status atual ou mudar para outro status sem sair dos EUA.",
      questions: [
        {
          id: "application_type",
          labelPt: "Tipo de pedido",
          type: "radio",
          required: true,
          options: [
            { value: "mudanca", labelPt: "Mudança de status (ex.: B-2 → F-1)" },
            { value: "extensao", labelPt: "Extensão da estadia no status atual" },
            { value: "reintegracao", labelPt: "Reintegração ao status de estudante (reinstatement)" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              extensao: `${S1}P2_checkbox[0]`,
              mudanca: `${S1}P2_checkbox[1]`,
              reintegracao: `${S1}P2_checkbox[2]`,
            },
          },
        },
        {
          id: "new_status",
          labelPt: "Para qual status você quer mudar?",
          helpPt:
            "Statuses de trabalho principais (H-1B, L-1, O-1) não usam o I-539 — o empregador protocola o I-129.",
          type: "select",
          required: true,
          options: NEW_STATUS_OPTIONS,
          showWhen: { questionId: "application_type", equals: "mudanca" },
          pdf: { kind: "dropdown", field: `${S1}Pt2Line2a_NewStatus[0]` },
        },
        {
          id: "effective_date",
          labelPt: "A partir de quando você pede a mudança?",
          type: "date",
          showWhen: { questionId: "application_type", equals: "mudanca" },
          pdf: { kind: "text", field: `${S1}Pt2Line2b_EffectiveDate[0]`, transform: isoToUsDate },
        },
        {
          id: "extend_until",
          labelPt: "Até quando você pede que o status seja estendido?",
          helpPt: "Item 1 da Parte 3. Para mudança para F-1/M-1, normalmente a data de término do I-20.",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S1}P3_Line1a_DateExtended[0]`, transform: isoToUsDate },
        },
        {
          id: "applicants",
          labelPt: "Quem está neste pedido?",
          helpPt:
            "Por enquanto o Immigrei preenche o pedido individual. Familiares juntos exigem um I-539A por pessoa — em breve.",
          type: "radio",
          required: true,
          default: "self",
          options: [{ value: "self", labelPt: "Somente eu" }],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { self: `${S1}P2_checkbox4[0]` },
          },
        },
        {
          id: "school_name",
          labelPt: "Nome da escola que você vai frequentar",
          helpPt: "Só para F-1, M-1 ou J-1. Deixe em branco se não se aplica.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}SupA_Line1k_Passport[1]` },
        },
        {
          id: "sevis_id",
          labelPt: "Número SEVIS (se aplicável)",
          helpPt: "Começa com N e está no seu I-20 ou DS-2019 (ex.: N0012345678).",
          type: "text",
          pdf: { kind: "text", field: `${S1}SupA_Line1k_Passport[2]` },
        },
      ],
    },

    // ── 2. Nome legal completo (Part 1, item 1 + Part 8 header) ─────────────
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
          pdf: [
            { kind: "text", field: `${S0}P1Line1a_FamilyName[0]` },
            { kind: "text", field: `${S6}P1Line1a_FamilyName[1]` },
          ],
        },
        {
          id: "given_name",
          labelPt: "Nome (Given Name)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: [
            { kind: "text", field: `${S0}P1_Line1b_GivenName[0]` },
            { kind: "text", field: `${S6}P1_Line1b_GivenName[1]` },
          ],
        },
        {
          id: "middle_name",
          labelPt: "Nome do meio (Middle Name)",
          helpPt: "Deixe em branco se não tiver.",
          type: "text",
          passthroughEn: true,
          pdf: [
            { kind: "text", field: `${S0}P1_Line1c_MiddleName[0]` },
            { kind: "text", field: `${S6}P1_Line1c_MiddleName[1]` },
          ],
        },
        {
          id: "a_number",
          labelPt: "Número do estrangeiro (A-Number)",
          helpPt: "Opcional. A maioria dos visitantes e estudantes não tem — deixe em branco se for o caso.",
          type: "text",
          pdf: [
            { kind: "text", field: `${S0}Pt1Line2_AlienNumber[0]` },
            { kind: "text", field: `${S6}P8_Line2_ANumber[0].Pt1Line2_AlienNumber[1]` },
          ],
        },
        {
          id: "uscis_online_account",
          labelPt: "Número da conta online do USCIS",
          helpPt: "Opcional. Só se você já criou uma conta em my.uscis.gov.",
          type: "text",
          pdf: { kind: "text", field: `${S0}Pt1Line2_USCISOnlineAcctNumber[0]` },
        },
      ],
    },

    // ── 3. Endereços nos EUA (Part 1, itens 4–6) ────────────────────────────
    {
      id: "endereco",
      titlePt: "Seus endereços nos EUA",
      descriptionPt: "Endereço onde você recebe correspondência (mailing address).",
      questions: [
        {
          id: "mail_in_care_of",
          labelPt: "Aos cuidados de (In Care Of)",
          helpPt: "Opcional. Nome de quem recebe por você, se for o caso.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Part2_Item11_InCareOfName[0]` },
        },
        {
          id: "mail_street",
          labelPt: "Rua e número",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Part2_Item11_StreetName[0]` },
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
              apt: `${S0}Part1_Item4_Unit[0]`,
              ste: `${S0}Part1_Item4_Unit[1]`,
              flr: `${S0}Part1_Item4_Unit[2]`,
            },
          },
        },
        {
          id: "mail_unit_number",
          labelPt: "Número do complemento",
          helpPt: "Opcional.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Part1_Item4_Number[0]` },
        },
        {
          id: "mail_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Part2_Item11_City[0]` },
        },
        {
          id: "mail_state",
          labelPt: "Estado (sigla de 2 letras)",
          helpPt: "Ex.: FL, MA, CA.",
          type: "text",
          required: true,
          placeholder: "FL",
          validate: { pattern: /^[A-Za-z]{2}$/, messagePt: "Use a sigla de 2 letras do estado (ex.: FL)." },
          pdf: { kind: "dropdown", field: `${S0}Part2_Item11_State[0]` },
        },
        {
          id: "mail_zip",
          labelPt: "ZIP Code",
          type: "text",
          required: true,
          placeholder: "33101",
          validate: { pattern: /^\d{5}(-\d{4})?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          pdf: { kind: "text", field: `${S0}Part2_Item11_ZipCode[0]` },
        },
        {
          id: "mail_same_as_physical",
          labelPt: "Esse é também o endereço onde você mora?",
          helpPt: "Item 5 do formulário.",
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
              yes: `${S0}P1_checkbox5[1]`,
              no: `${S0}P1_checkbox5[0]`,
            },
          },
        },
        {
          id: "phys_street",
          labelPt: "Endereço onde você mora — rua e número",
          type: "text",
          required: true,
          passthroughEn: true,
          showWhen: { questionId: "mail_same_as_physical", equals: "no" },
          pdf: { kind: "text", field: `${S0}Part1_Item6_StreetName[0]` },
        },
        {
          id: "phys_unit_type",
          labelPt: "Tipo de complemento",
          type: "radio",
          options: [
            { value: "apt", labelPt: "Apt." },
            { value: "ste", labelPt: "Ste." },
            { value: "flr", labelPt: "Flr." },
          ],
          showWhen: { questionId: "mail_same_as_physical", equals: "no" },
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              apt: `${S0}Part1_Item6_Unit[0]`,
              ste: `${S0}Part1_Item6_Unit[1]`,
              flr: `${S0}Part1_Item6_Unit[2]`,
            },
          },
        },
        {
          id: "phys_unit_number",
          labelPt: "Número do complemento",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "mail_same_as_physical", equals: "no" },
          pdf: { kind: "text", field: `${S0}Part1_Item6_Number[0]` },
        },
        {
          id: "phys_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          showWhen: { questionId: "mail_same_as_physical", equals: "no" },
          pdf: { kind: "text", field: `${S0}Part1_Item6_City[0]` },
        },
        {
          id: "phys_state",
          labelPt: "Estado (sigla de 2 letras)",
          type: "text",
          required: true,
          placeholder: "FL",
          validate: { pattern: /^[A-Za-z]{2}$/, messagePt: "Use a sigla de 2 letras do estado (ex.: FL)." },
          showWhen: { questionId: "mail_same_as_physical", equals: "no" },
          pdf: { kind: "dropdown", field: `${S0}Part1_Item6_State[0]` },
        },
        {
          id: "phys_zip",
          labelPt: "ZIP Code",
          type: "text",
          required: true,
          validate: { pattern: /^\d{5}(-\d{4})?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          showWhen: { questionId: "mail_same_as_physical", equals: "no" },
          pdf: { kind: "text", field: `${S0}Part1_Item6_ZipCode[0]` },
        },
      ],
    },

    // ── 4. Nascimento e cidadania (Part 1, itens 6–9) ───────────────────────
    {
      id: "nascimento",
      titlePt: "Nascimento e cidadania",
      questions: [
        {
          id: "birth_country",
          labelPt: "País de nascimento",
          helpPt: "Escreva em inglês (ex.: Brazil).",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S1}P1_Line6_CountryOfBirth[0]` },
        },
        {
          id: "citizenship_country",
          labelPt: "País de cidadania",
          helpPt: "Escreva em inglês (ex.: Brazil).",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S1}P1_Line7_CountryOfCitizenship[0]` },
        },
        {
          id: "dob",
          labelPt: "Data de nascimento",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S1}P1_Line8_DateOfBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "ssn",
          labelPt: "Número do Social Security (SSN)",
          helpPt: "Opcional. Só se você já tiver um.",
          type: "text",
          pdf: { kind: "text", field: `${S1}P1_Line9_SSN[0]` },
        },
      ],
    },

    // ── 5. Última entrada e status atual (Part 1, itens 10–12) ──────────────
    {
      id: "entrada",
      titlePt: "Sua última entrada nos EUA e status atual",
      descriptionPt: "Você encontra o número do I-94 em i94.cbp.dhs.gov.",
      questions: [
        {
          id: "last_entry_date",
          labelPt: "Data da sua última entrada nos EUA",
          type: "date",
          required: true,
          prefillFrom: "arrival_date",
          pdf: { kind: "text", field: `${S1}SupA_Line1i_DateOfArrival[0]`, transform: isoToUsDate },
        },
        {
          id: "i94_number",
          labelPt: "Número do I-94 (11 dígitos)",
          helpPt: "Está no seu registro em i94.cbp.dhs.gov.",
          type: "text",
          required: true,
          pdf: { kind: "text", field: `${S1}SupA_Line1j_ArrivalDeparture[0]` },
        },
        {
          id: "passport_number",
          labelPt: "Número do passaporte",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}SupA_Line1k_Passport[0]` },
        },
        {
          id: "travel_doc_number",
          labelPt: "Número de documento de viagem (se houver)",
          helpPt: "Opcional. Só se você viajou com documento que não é passaporte.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}SupA_Line1l_TravelDoc[0]` },
        },
        {
          id: "passport_country",
          labelPt: "País que emitiu o passaporte",
          helpPt: "Escreva em inglês (ex.: Brazil).",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S1}SupA_Line1m_CountryOfIssuance[0]` },
        },
        {
          id: "passport_expiry",
          labelPt: "Validade do passaporte",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S1}SupA_Line1n_ExpDate[0]`, transform: isoToUsDate },
        },
        {
          id: "current_status",
          labelPt: "Seu status atual",
          type: "select",
          required: true,
          options: CURRENT_STATUS_OPTIONS,
          pdf: { kind: "dropdown", field: `${S1}Pt1Line15a_NewStatus[0]` },
        },
        {
          id: "status_expiry_kind",
          labelPt: "Seu I-94 tem data de validade ou D/S?",
          helpPt:
            "Estudantes F-1/J-1 normalmente têm \"D/S\" (Duration of Status). Turistas B-1/B-2 têm uma data.",
          type: "radio",
          required: true,
          options: [
            { value: "date", labelPt: "Tem uma data de validade" },
            { value: "ds", labelPt: "D/S — Duration of Status" },
          ],
          pdf: {
            kind: "checkbox",
            field: `${S1}P1_Checkbox12c[0]`,
            onWhen: (v) => v === "ds",
          },
        },
        {
          id: "status_expiry_date",
          labelPt: "Data em que seu status expira (do I-94)",
          type: "date",
          required: true,
          showWhen: { questionId: "status_expiry_kind", equals: "date" },
          pdf: { kind: "text", field: `${S1}SupA_Line1p_DateExpires[0]`, transform: isoToUsDate },
        },
      ],
    },

    // ── 6. Pedidos relacionados (Part 3, itens 2–7) ─────────────────────────
    {
      id: "processamento",
      titlePt: "Pedidos relacionados da sua família",
      descriptionPt:
        "Se o seu pedido depende de um pedido do seu cônjuge, pai/mãe ou filho, informe aqui. Se você está pedindo sozinho, responda \"Não\" e siga em frente.",
      questions: [
        {
          id: "based_on_family_grant",
          labelPt:
            "Este pedido é baseado em uma extensão ou mudança de status JÁ CONCEDIDA ao seu cônjuge, filho ou pai/mãe?",
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
              yes: `${S1}P3_checkbox2a[1]`,
              no: `${S1}P3_checkbox2a[0]`,
            },
          },
        },
        {
          id: "separate_petition",
          labelPt:
            "Este pedido é baseado em uma petição separada PENDENTE ou PROTOCOLADA JUNTO para dar status ao seu cônjuge, filho ou pai/mãe?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "with_this", labelPt: "Sim — protocolada junto com este I-539" },
            { value: "pending", labelPt: "Sim — protocolada antes e pendente no USCIS" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              no: `${S2}P3_checkbox1[0]`,
              with_this: `${S2}P3_checkbox1[1]`,
              pending: `${S2}P3_checkbox1[2]`,
            },
          },
        },
        {
          id: "petition_form_type",
          labelPt: "Qual formulário é a base do pedido?",
          helpPt: "Responda só se você marcou \"Sim\" em uma das duas perguntas acima.",
          type: "radio",
          options: [
            { value: "i539", labelPt: "Form I-539 — Extensão/Mudança de Status" },
            { value: "i129", labelPt: "Form I-129 — Petição de Trabalhador" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              i539: `${S2}P3_checkbox4[0]`,
              i129: `${S2}P3_checkbox4[1]`,
            },
          },
        },
        {
          id: "petition_receipt",
          labelPt: "Receipt Number do pedido base (se houver)",
          helpPt: "Responda só se marcou \"Sim\" acima. Formato: 3 letras + 10 números.",
          type: "text",
          pdf: { kind: "text", field: `${S2}P3_Line5_ReceiptNumber[0]` },
        },
        {
          id: "petition_date_filed",
          labelPt: "Data de protocolo do pedido base (se pendente)",
          type: "date",
          pdf: { kind: "text", field: `${S2}P3_Line5_DateFiled[0]`, transform: isoToUsDate },
        },
        {
          id: "petition_beneficiary_last",
          labelPt: "Sobrenome do beneficiário/requerente do pedido base",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P3_Line4_NameofPetitioner[0]` },
        },
        {
          id: "petition_beneficiary_first",
          labelPt: "Nome do beneficiário/requerente do pedido base",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P3_Line4_NameofPetitioner[1]` },
        },
      ],
    },

    // ── 7. Passaporte atual e endereço no exterior (Part 4, itens 1–2) ──────
    {
      id: "passaporte-endereco",
      titlePt: "Passaporte atual e endereço no exterior",
      questions: [
        {
          id: "passport_changed",
          labelPt: "Seu passaporte atual é diferente do informado acima?",
          helpPt: "Ex.: você renovou o passaporte depois da última entrada nos EUA.",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não, é o mesmo" },
            { value: "yes", labelPt: "Sim, tenho um passaporte novo" },
          ],
        },
        {
          id: "cur_passport_number",
          labelPt: "Número do passaporte atual",
          type: "text",
          required: true,
          passthroughEn: true,
          showWhen: { questionId: "passport_changed", equals: "yes" },
          pdf: { kind: "text", field: `${S2}P4_Line1a_CountryOfIssuance[1]` },
        },
        {
          id: "cur_passport_country",
          labelPt: "País que emitiu o passaporte atual",
          helpPt: "Escreva em inglês (ex.: Brazil).",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          showWhen: { questionId: "passport_changed", equals: "yes" },
          pdf: { kind: "text", field: `${S2}P4_Line1a_CountryOfIssuance[0]` },
        },
        {
          id: "cur_passport_expiry",
          labelPt: "Validade do passaporte atual",
          type: "date",
          required: true,
          showWhen: { questionId: "passport_changed", equals: "yes" },
          pdf: { kind: "text", field: `${S2}P4_Line1b_ExpirationDate[0]`, transform: isoToUsDate },
        },
        {
          id: "abroad_street",
          labelPt: "Seu endereço no exterior — rua e número",
          helpPt: "Endereço físico no seu país (ex.: no Brasil).",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P2_Line10_StreetName[0]` },
        },
        {
          id: "abroad_unit_type",
          labelPt: "Tipo de complemento",
          type: "radio",
          options: [
            { value: "apt", labelPt: "Apt." },
            { value: "ste", labelPt: "Ste." },
            { value: "flr", labelPt: "Flr." },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              apt: `${S2}P2_Line10_Unit[0]`,
              ste: `${S2}P2_Line10_Unit[1]`,
              flr: `${S2}P2_Line10_Unit[2]`,
            },
          },
        },
        {
          id: "abroad_unit_number",
          labelPt: "Número do complemento",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P2_Line10_Number[0]` },
        },
        {
          id: "abroad_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P2_Line10_City[0]` },
        },
        {
          id: "abroad_province",
          labelPt: "Estado/Província",
          helpPt: "Ex.: Sao Paulo.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}P2_Line10_Province[0]` },
        },
        {
          id: "abroad_postal",
          labelPt: "CEP / Postal Code",
          type: "text",
          pdf: { kind: "text", field: `${S2}P2_Line10_PostalCode[0]` },
        },
        {
          id: "abroad_country",
          labelPt: "País",
          helpPt: "Escreva em inglês (ex.: Brazil).",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S2}P2_Line10_Country[0]` },
        },
      ],
    },

    // ── 8. Perguntas obrigatórias do USCIS (Part 4, itens 3–15) ─────────────
    {
      id: "perguntas",
      titlePt: "Perguntas obrigatórias do USCIS",
      descriptionPt:
        "O USCIS exige que TODAS sejam respondidas. Se responder \"Sim\" a qualquer uma, explique no campo final desta seção — e considere falar com um profissional antes de enviar.",
      questions: [
        yesNo("q3_immigrant_visa", 3, "Você é requerente de um visto de imigrante?"),
        yesNo("q4_immigrant_petition", 4, "Alguma petição de imigrante já foi protocolada em seu favor?"),
        yesNo(
          "q5_i485",
          5,
          "Você JÁ protocolou o Formulário I-485 (registro de residência permanente / ajuste de status)?"
        ),
        yesNo("q6_arrested", 6, "Você foi preso ou condenado por algum crime desde a última entrada nos EUA?"),
        yesNo("q7a_torture", 7, "Você JÁ participou, ajudou ou incitou atos de tortura ou genocídio?"),
        yesNo("q7b_killing", 8, "Você JÁ participou, ajudou ou incitou o assassinato de qualquer pessoa?"),
        yesNo("q7c_injuring", 9, "Você JÁ feriu intencional e gravemente alguém?"),
        yesNo(
          "q7d_sexual_contact",
          10,
          "Você JÁ teve contato sexual com alguém sem consentimento ou sob força/ameaça?"
        ),
        yesNo(
          "q7e_religious_freedom",
          11,
          "Você JÁ limitou ou negou a alguém o exercício de crenças religiosas?"
        ),
        yesNo(
          "q8a_armed_group",
          12,
          "Você JÁ serviu ou participou de unidade militar, paramilitar, policial, milícia, guerrilha ou grupo armado?"
        ),
        yesNo(
          "q8b_detention_facility",
          13,
          "Você JÁ trabalhou ou serviu em prisão, campo de detenção, campo de trabalho ou situação de detenção de pessoas?"
        ),
        yesNo(
          "q9_weapons_group",
          14,
          "Você JÁ foi membro ou ajudou grupo/organização que usou ou ameaçou usar armas contra pessoas?"
        ),
        yesNo(
          "q10_weapons_transport",
          15,
          "Você JÁ vendeu, forneceu ou transportou armas sabendo que seriam usadas contra alguém?"
        ),
        yesNo("q11_weapons_training", 16, "Você JÁ recebeu treinamento com armas, paramilitar ou de tipo militar?"),
        yesNo("q12_removal", 17, "Você está atualmente em processo de remoção (removal proceedings)?"),
        yesNo("q13_violated_status", 18, "Você JÁ violou os termos do status que possui agora?"),
        yesNo(
          "q14_employed",
          19,
          "Você trabalhou nos EUA desde a última admissão ou extensão/mudança de status?",
          "Se \"Não\", descreva no campo final como você se sustenta. Se \"Sim\", descreva os períodos de trabalho e se havia autorização do USCIS."
        ),
        yesNo(
          "q15_j_visitor",
          20,
          "Você é ou já foi intercambista J-1 ou dependente J-2?",
          "Se \"Sim\", informe no campo final as datas em que manteve status J-1/J-2."
        ),
        {
          id: "additional_info",
          labelPt: "Explicações adicionais (Parte 8 do formulário)",
          helpPt:
            "Use para explicar qualquer \"Sim\" acima, como você se sustenta (se não trabalha) ou datas de status J. Escreva em inglês.",
          type: "textarea",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S6}P8_Line3_D_AdditionalInfo[0]` },
        },
      ],
    },

    // ── 9. Contato (Part 5) ─────────────────────────────────────────────────
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
          required: true,
          pdf: { kind: "text", field: `${S4}P5_Line3_DaytimePhoneNumber[0]` },
        },
        {
          id: "mobile_phone",
          labelPt: "Celular",
          type: "text",
          pdf: { kind: "text", field: `${S4}P5_Line4_MobilePhoneNumber[0]` },
        },
        {
          id: "email",
          labelPt: "E-mail",
          type: "text",
          prefillFrom: "email",
          pdf: { kind: "text", field: `${S4}P5_Line5_EmailAddress[0]` },
        },
      ],
    },
  ],
};
