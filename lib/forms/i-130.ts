/**
 * I-130 — Petition for Alien Relative.
 *
 * Data-driven spec for the family petition. WHO FILLS THIS FORM: the
 * PETITIONER — the relative who is a US citizen or green-card holder. The
 * BENEFICIARY (the immigrant who will receive the green card) is described in
 * Part 4 but does not sign this form (a spouse beneficiary files the separate
 * I-130A). Every PT-BR label makes that distinction explicit, per product
 * decision (Jul/2026).
 *
 * Field names extracted from the official edition 04/01/24 asset at
 * public/forms/i-130.pdf and disambiguated by widget position — never guessed.
 * Known quirks of this PDF (all verified positionally):
 *   - Part 2 employment fields are shifted: `Pt2Line40_EmployerOrCompName` is
 *     item 42 (Employer 1), the `Pt2Line41_*` address block is item 43, and so
 *     on through `Pt2Line47a/b` for item 49.
 *   - Part 4 family-member fields are shifted the same way: Person 1 (items
 *     25-28) lives in `Pt4Line30a..32` + `Pt4Line49_CountryOfBirth[0]`, and
 *     Person 2 (items 29-32) in `Pt4Line34a..37`.
 *   - The citizenship-acquired boxes (item 37) are `Pt2Line23a/b/c_checkbox`;
 *     the naturalization-certificate Yes/No (item 38) reuses `Pt2Line36_Yes/No`.
 *   - Part 5 item 1 ("previously filed?") is `Part4Line1_Yes/No`; the other
 *     relatives of Part 5 items 6-9 are `Pt4Line6a..9` on pages 8-9.
 *
 * Scope (MVP): one petitioner + one beneficiary, the consular flow of the
 * familia-ir kit (adjustment venue also supported). Repeating groups beyond
 * what the engine handles today (extra spouses, >2 children, Part 9 overflow)
 * are left for the applicant to complete by hand if needed. The engine is
 * ministerial: it transcribes; it never decides eligibility. Signatures,
 * interpreter and preparer blocks stay blank — signed by hand.
 */

import type { FormSpec, Option, Question } from "./types";

// AcroForm subform prefixes (one per page of the I-130).
const F = "form1[0].";
const S0 = `${F}#subform[0].`; // page 1
const S1 = `${F}#subform[1].`; // page 2
const S2 = `${F}#subform[2].`; // page 3
const S3 = `${F}#subform[3].`; // page 4
const S4 = `${F}#subform[4].`; // page 5
const S5 = `${F}#subform[5].`; // page 6
const S6 = `${F}#subform[6].`; // page 7
const S7 = `${F}#subform[7].`; // page 8
const S8 = `${F}#subform[8].`; // page 9

// ISO yyyy-mm-dd (how we store dates) -> USCIS mm/dd/yyyy text.
function isoToUsDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

// Exact option strings of the PDF's class-of-admission dropdown (no leading
// space on this form, unlike the I-539's status dropdowns).
const CLASS_OF_ADMISSION_OPTIONS: Option[] = [
  { value: "b2", labelPt: "B-2 — turista", valueEn: "B2 - TEMPORARY VISITOR FOR PLEASURE" },
  { value: "b1", labelPt: "B-1 — visitante de negócios", valueEn: "B1 - TEMPORARY VISITOR FOR BUSINESS" },
  { value: "wt", labelPt: "WT — Visa Waiver (turismo/ESTA)", valueEn: "WT - VISITOR FOR PLEASURE - VWPP" },
  { value: "wb", labelPt: "WB — Visa Waiver (negócios/ESTA)", valueEn: "WB - VISITOR FOR BUSINESS - VWPP/VWP" },
  { value: "f1", labelPt: "F-1 — estudante acadêmico", valueEn: "F1 - STUDENT - ACADEMIC" },
  { value: "f2", labelPt: "F-2 — dependente de F-1", valueEn: "F2 - SPOUSE-CHILD OF F-1" },
  { value: "m1", labelPt: "M-1 — estudante vocacional", valueEn: "M1 - STUDENT - VOCATIONAL-NON-ACAD." },
  { value: "j1", labelPt: "J-1 — intercambista", valueEn: "J1 - EXCHANGE VISITOR - OTHERS" },
  { value: "h1b", labelPt: "H-1B — trabalhador especializado", valueEn: "H1B - SPECIALITY OCCUPATION" },
  { value: "h4", labelPt: "H-4 — dependente de H", valueEn: "H4 - SPS OR CHLD OF H1,H2,H3 OR H2R" },
  { value: "l1", labelPt: "L-1 — transferência entre empresas", valueEn: "L1 - INTRA-COMPANY TRANSFEREE" },
  { value: "l2", labelPt: "L-2 — dependente de L-1", valueEn: "L2 - SPOUSE-CHILD OF L-1" },
  { value: "o1", labelPt: "O-1 — habilidade extraordinária", valueEn: "O1 - ALIEN W-EXTRAORDINARY ABILITY" },
  { value: "k1", labelPt: "K-1 — noivo(a) de cidadão", valueEn: "K1 - ALIEN FIANCE(E) OF USC" },
  { value: "e2", labelPt: "E-2 — treaty investor", valueEn: "E2 - TREATY INVESTOR-SPOUSE-CHILD" },
  { value: "ewi", labelPt: "Entrada sem inspeção (EWI)", valueEn: "EWI - ENTRY WITHOUT INSPECTION" },
];

// One US-style address block written onto a set of same-prefix PDF fields.
// `p` is the field prefix up to the underscore (e.g. `${S1}Pt2Line10`).
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
  opts: { required?: boolean; showWhen?: Question["showWhen"]; helpPt?: string } = {}
): Question[] {
  const { required = false, showWhen, helpPt } = opts;
  const qs: Question[] = [
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
    },
  ];
  if (f.state) {
    qs.push({
      id: `${idPrefix}_state`,
      labelPt: "Estado americano (sigla de 2 letras — deixe em branco se fora dos EUA)",
      type: "text",
      placeholder: "FL",
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
      labelPt: "Estado/Província (para endereço fora dos EUA)",
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

export const I130: FormSpec = {
  id: "i-130",
  code: "I-130",
  officialName: "Petition for Alien Relative",
  namePt: "Petição de Parente (preenchida pelo cidadão/residente)",
  agency: "USCIS",
  officialUrl: "https://www.uscis.gov/i-130",
  edition: "04/01/24",
  exportKind: "pdf",
  pdfAssetPath: "forms/i-130.pdf",
  attachTo: { vistoId: "familia-ir", documentoId: "i130" },
  disclaimerPt:
    "Este formulário é preenchido e assinado pelo PETICIONÁRIO — o parente que é cidadão americano " +
    "ou residente permanente (green card). A Immigrei é uma ferramenta de preenchimento — não presta " +
    "serviços jurídicos e não revisa o mérito do seu caso. Confira cada campo e assine à mão antes de enviar ao USCIS.",

  sections: [
    // ── 1. Quem é quem + relação (Part 1) ───────────────────────────────────
    {
      id: "relacao",
      titlePt: "Quem é quem neste formulário",
      descriptionPt:
        "⚠️ O I-130 é preenchido pelo PETICIONÁRIO: o parente que É cidadão americano ou tem green card. " +
        "Quem VAI RECEBER o green card é o BENEFICIÁRIO — ele só entra como informação (e, se for cônjuge, " +
        "preenche o formulário I-130A separado). Todas as perguntas a seguir falam com o peticionário.",
      questions: [
        {
          id: "relationship",
          labelPt: "O beneficiário (quem vai receber o green card) é seu:",
          type: "radio",
          required: true,
          options: [
            { value: "spouse", labelPt: "Cônjuge (marido/esposa)" },
            { value: "parent", labelPt: "Pai ou mãe" },
            { value: "child", labelPt: "Filho(a)" },
            { value: "sibling", labelPt: "Irmão ou irmã" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              spouse: `${S0}Pt1Line1_Spouse[0]`,
              parent: `${S0}Pt1Line1_Parent[0]`,
              child: `${S0}Pt1Line1_Child[0]`,
              sibling: `${S0}Pt1Line1_Siblings[0]`,
            },
          },
        },
        {
          id: "child_parent_detail",
          labelPt: "Se a petição é para filho(a) ou pai/mãe, qual descreve a relação?",
          helpPt: "Responda só se marcou Filho(a) ou Pai/Mãe acima. Item 2 do formulário.",
          type: "radio",
          options: [
            { value: "in_wedlock", labelPt: "Filho(a) nascido(a) de pais casados entre si" },
            { value: "out_of_wedlock", labelPt: "Filho(a) nascido(a) de pais não casados entre si" },
            { value: "stepchild", labelPt: "Enteado(a) / padrasto / madrasta" },
            { value: "adopted", labelPt: "Filho(a) adotivo(a) (não órfão/Convenção de Haia)" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              in_wedlock: `${S0}Pt1Line2_InWedlock[0]`,
              out_of_wedlock: `${S0}Pt1Line2_OutOfWedlock[0]`,
              stepchild: `${S0}Pt1Line2_Stepchild[0]`,
              adopted: `${S0}Pt1Line2_AdoptedChild[0]`,
            },
          },
        },
        {
          id: "sibling_by_adoption",
          labelPt: "Se o beneficiário é seu irmão/irmã: vocês são parentes por adoção?",
          type: "radio",
          showWhen: { questionId: "relationship", equals: "sibling" },
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S0}Pt1Line3_Yes[0]`, no: `${S0}Pt1Line3_No[0]` },
          },
        },
        {
          id: "status_through_adoption",
          labelPt: "Você (peticionário) obteve sua residência ou cidadania por adoção?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S0}Pt1Line4_Yes[0]`, no: `${S0}Pt1Line4_No[0]` },
          },
        },
      ],
    },

    // ── 2. Peticionário — identificação (Part 2, itens 1–5) ─────────────────
    {
      id: "peticionario-nome",
      titlePt: "Peticionário — seus dados (o parente cidadão/residente)",
      descriptionPt: "Nome exatamente como nos seus documentos americanos.",
      questions: [
        {
          id: "pet_a_number",
          labelPt: "Seu A-Number (se tiver)",
          helpPt: "Residentes permanentes têm; cidadãos por nascimento normalmente não — deixe em branco.",
          type: "text",
          pdf: { kind: "text", field: `${S0}#area[4].Pt2Line1_AlienNumber[0]` },
        },
        {
          id: "pet_uscis_account",
          labelPt: "Sua conta online do USCIS (se tiver)",
          type: "text",
          pdf: { kind: "text", field: `${S0}#area[5].Pt2Line2_USCISOnlineActNumber[0]` },
        },
        {
          id: "pet_ssn",
          labelPt: "Seu Social Security Number (SSN)",
          type: "text",
          pdf: { kind: "text", field: `${S0}Pt2Line11_SSN[0]` },
        },
        {
          id: "pet_family_name",
          labelPt: "Seu sobrenome (Family Name)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Pt2Line4a_FamilyName[0]` },
        },
        {
          id: "pet_given_name",
          labelPt: "Seu nome (Given Name)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Pt2Line4b_GivenName[0]` },
        },
        {
          id: "pet_middle_name",
          labelPt: "Seu nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S0}Pt2Line4c_MiddleName[0]` },
        },
        {
          id: "pet_other_family_name",
          labelPt: "Outros nomes que você já usou — sobrenome (ex.: nome de solteira)",
          helpPt: "Deixe em branco se nunca usou outro nome.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt2Line5a_FamilyName[0]` },
        },
        {
          id: "pet_other_given_name",
          labelPt: "Outros nomes — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt2Line5b_GivenName[0]` },
        },
        {
          id: "pet_other_middle_name",
          labelPt: "Outros nomes — nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt2Line5c_MiddleName[0]` },
        },
      ],
    },

    // ── 3. Peticionário — nascimento (Part 2, itens 6–9) ────────────────────
    {
      id: "peticionario-nascimento",
      titlePt: "Peticionário — nascimento",
      questions: [
        {
          id: "pet_birth_city",
          labelPt: "Sua cidade de nascimento",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt2Line6_CityTownOfBirth[0]` },
        },
        {
          id: "pet_birth_country",
          labelPt: "Seu país de nascimento (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt2Line7_CountryofBirth[0]` },
        },
        {
          id: "pet_dob",
          labelPt: "Sua data de nascimento",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S1}Pt2Line8_DateofBirth[0]`, transform: isoToUsDate },
        },
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
            fieldByValue: { male: `${S1}Pt2Line9_Male[0]`, female: `${S1}Pt2Line9_Female[0]` },
          },
        },
      ],
    },

    // ── 4. Peticionário — endereços (Part 2, itens 10–15) ───────────────────
    {
      id: "peticionario-endereco",
      titlePt: "Peticionário — seus endereços",
      descriptionPt: "Endereço de correspondência e, se for diferente, onde você mora.",
      questions: [
        {
          id: "pet_mail_in_care_of",
          labelPt: "Aos cuidados de (In Care Of) — opcional",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S1}Pt2Line10_InCareofName[0]` },
        },
        ...addressQuestions("pet_mail", "Endereço de correspondência", {
          street: `${S1}Pt2Line10_StreetNumberName[0]`,
          unitApt: `${S1}Pt2Line10_Unit[0]`,
          unitSte: `${S1}Pt2Line10_Unit[1]`,
          unitFlr: `${S1}Pt2Line10_Unit[2]`,
          unitNumber: `${S1}Pt2Line10_AptSteFlrNumber[0]`,
          city: `${S1}Pt2Line10_CityOrTown[0]`,
          state: `${S1}Pt2Line10_State[0]`,
          zip: `${S1}Pt2Line10_ZipCode[0]`,
          province: `${S1}Pt2Line10_Province[0]`,
          postal: `${S1}Pt2Line10_PostalCode[0]`,
          country: `${S1}Pt2Line10_Country[0]`,
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
            fieldByValue: { yes: `${S1}Pt2Line11_Yes[0]`, no: `${S1}Pt2Line11_No[0]` },
          },
        },
        ...addressQuestions("pet_phys", "Endereço onde você mora", {
          street: `${S1}Pt2Line12_StreetNumberName[0]`,
          unitApt: `${S1}Pt2Line12_Unit[0]`,
          unitSte: `${S1}Pt2Line12_Unit[1]`,
          unitFlr: `${S1}Pt2Line12_Unit[2]`,
          unitNumber: `${S1}Pt2Line12_AptSteFlrNumber[0]`,
          city: `${S1}Pt2Line12_CityOrTown[0]`,
          state: `${S1}Pt2Line12_State[0]`,
          zip: `${S1}Pt2Line12_ZipCode[0]`,
          province: `${S1}Pt2Line12_Province[0]`,
          postal: `${S1}Pt2Line12_PostalCode[0]`,
          country: `${S1}Pt2Line12_Country[0]`,
        }, { required: true, showWhen: { questionId: "pet_mail_same_as_physical", equals: "no" } }),
        {
          id: "pet_phys_date_from",
          labelPt: "Morando nesse endereço desde",
          helpPt: "O USCIS pede seu histórico de endereços dos últimos 5 anos. Endereços anteriores podem ser adicionados à mão na Parte 9.",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S1}Pt2Line13a_DateFrom[0]`, transform: isoToUsDate },
        },
      ],
    },

    // ── 5. Peticionário — estado civil e casamento (Part 2, itens 16–23) ────
    {
      id: "peticionario-civil",
      titlePt: "Peticionário — estado civil",
      questions: [
        {
          id: "pet_marriage_count",
          labelPt: "Quantas vezes você já se casou? (0 se nunca)",
          type: "number",
          required: true,
          pdf: { kind: "text", field: `${S1}Pt2Line16_NumberofMarriages[0]` },
        },
        {
          id: "pet_marital_status",
          labelPt: "Seu estado civil atual",
          type: "radio",
          required: true,
          options: [
            { value: "single", labelPt: "Solteiro(a), nunca casou" },
            { value: "married", labelPt: "Casado(a)" },
            { value: "divorced", labelPt: "Divorciado(a)" },
            { value: "widowed", labelPt: "Viúvo(a)" },
            { value: "separated", labelPt: "Separado(a)" },
            { value: "annulled", labelPt: "Casamento anulado" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              single: `${S1}Pt2Line17_Single[0]`,
              married: `${S1}Pt2Line17_Married[0]`,
              divorced: `${S1}Pt2Line17_Divorced[0]`,
              widowed: `${S1}Pt2Line17_Widowed[0]`,
              separated: `${S1}Pt2Line17_Separated[0]`,
              annulled: `${S1}Pt2Line17_Annulled[0]`,
            },
          },
        },
        {
          id: "pet_marriage_date",
          labelPt: "Data do casamento atual",
          type: "date",
          required: true,
          showWhen: { questionId: "pet_marital_status", equals: "married" },
          pdf: { kind: "text", field: `${S2}Pt2Line18_DateOfMarriage[0]`, transform: isoToUsDate },
        },
        {
          id: "pet_marriage_city",
          labelPt: "Cidade do casamento atual",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "pet_marital_status", equals: "married" },
          pdf: { kind: "text", field: `${S2}Pt2Line19a_CityTown[0]` },
        },
        {
          id: "pet_marriage_state",
          labelPt: "Estado americano do casamento (sigla — em branco se fora dos EUA)",
          type: "text",
          validate: { pattern: /^([A-Za-z]{2})?$/, messagePt: "Use a sigla de 2 letras (ex.: FL)." },
          showWhen: { questionId: "pet_marital_status", equals: "married" },
          pdf: { kind: "dropdown", field: `${S2}Pt2Line19b_State[0]` },
        },
        {
          id: "pet_marriage_province",
          labelPt: "Estado/Província do casamento (fora dos EUA)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "pet_marital_status", equals: "married" },
          pdf: { kind: "text", field: `${S2}Pt2Line19c_Province[0]` },
        },
        {
          id: "pet_marriage_country",
          labelPt: "País do casamento (em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "pet_marital_status", equals: "married" },
          pdf: { kind: "text", field: `${S2}Pt2Line19d_Country[0]` },
        },
        {
          id: "pet_spouse1_family",
          labelPt: "Cônjuge atual (ou mais recente) — sobrenome",
          helpPt: "Se a petição é para seu cônjuge, este é o beneficiário. Deixe em branco se nunca casou.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}PtLine20a_FamilyName[0]` },
        },
        {
          id: "pet_spouse1_given",
          labelPt: "Cônjuge atual — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt2Line20b_GivenName[0]` },
        },
        {
          id: "pet_spouse1_middle",
          labelPt: "Cônjuge atual — nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt2Line20c_MiddleName[0]` },
        },
        {
          id: "pet_prior_spouse_family",
          labelPt: "Cônjuge anterior (se houver) — sobrenome",
          helpPt: "Deixe em branco se não houver. Mais de um casamento anterior: adicione à mão na Parte 9.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt2Line22a_FamilyName[0]` },
        },
        {
          id: "pet_prior_spouse_given",
          labelPt: "Cônjuge anterior — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt2Line22b_GivenName[0]` },
        },
        {
          id: "pet_prior_marriage_ended",
          labelPt: "Data em que o casamento anterior terminou",
          type: "date",
          pdf: { kind: "text", field: `${S2}Pt2Line23_DateMarriageEnded[0]`, transform: isoToUsDate },
        },
      ],
    },

    // ── 6. Peticionário — pais (Part 2, itens 24–35) ────────────────────────
    {
      id: "peticionario-pais",
      titlePt: "Peticionário — seus pais",
      descriptionPt: "O USCIS pede os dados dos seus pais (mesmo falecidos — escreva \"Deceased\" na residência).",
      questions: [
        {
          id: "pet_parent1_family",
          labelPt: "Pai/Mãe 1 — sobrenome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt2Line24_FamilyName[0]` },
        },
        {
          id: "pet_parent1_given",
          labelPt: "Pai/Mãe 1 — nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt2Line24_GivenName[0]` },
        },
        {
          id: "pet_parent1_middle",
          labelPt: "Pai/Mãe 1 — nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt2Line24_MiddleName[0]` },
        },
        {
          id: "pet_parent1_dob",
          labelPt: "Pai/Mãe 1 — data de nascimento",
          type: "date",
          pdf: { kind: "text", field: `${S2}Pt2Line25_DateofBirth[0]`, transform: isoToUsDate },
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
            fieldByValue: { male: `${S2}Pt2Line26_Male[0]`, female: `${S2}Pt2Line26_Female[0]` },
          },
        },
        {
          id: "pet_parent1_birth_country",
          labelPt: "Pai/Mãe 1 — país de nascimento (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt2Line27_CountryofBirth[0]` },
        },
        {
          id: "pet_parent1_res_city",
          labelPt: "Pai/Mãe 1 — cidade onde mora (ou \"Deceased\")",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt2Line28_CityTownOrVillageOfResidence[0]` },
        },
        {
          id: "pet_parent1_res_country",
          labelPt: "Pai/Mãe 1 — país onde mora",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt2Line29_CountryOfResidence[0]` },
        },
        {
          id: "pet_parent2_family",
          labelPt: "Pai/Mãe 2 — sobrenome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt2Line30a_FamilyName[0]` },
        },
        {
          id: "pet_parent2_given",
          labelPt: "Pai/Mãe 2 — nome",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt2Line30b_GivenName[0]` },
        },
        {
          id: "pet_parent2_middle",
          labelPt: "Pai/Mãe 2 — nome do meio",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt2Line30c_MiddleName[0]` },
        },
        {
          id: "pet_parent2_dob",
          labelPt: "Pai/Mãe 2 — data de nascimento",
          type: "date",
          pdf: { kind: "text", field: `${S2}Pt2Line31_DateofBirth[0]`, transform: isoToUsDate },
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
            fieldByValue: { male: `${S2}Pt2Line32_Male[0]`, female: `${S2}Pt2Line32_Female[0]` },
          },
        },
        {
          id: "pet_parent2_birth_country",
          labelPt: "Pai/Mãe 2 — país de nascimento (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt2Line33_CountryofBirth[0]` },
        },
        {
          id: "pet_parent2_res_city",
          labelPt: "Pai/Mãe 2 — cidade onde mora (ou \"Deceased\")",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt2Line34_CityTownOrVillageOfResidence[0]` },
        },
        {
          id: "pet_parent2_res_country",
          labelPt: "Pai/Mãe 2 — país onde mora",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S2}Pt2Line35_CountryOfResidence[0]` },
        },
      ],
    },

    // ── 7. Peticionário — cidadão ou green card (Part 2, itens 36–41) ───────
    {
      id: "peticionario-status",
      titlePt: "Peticionário — você é cidadão ou residente?",
      descriptionPt: "É isto que dá o direito de peticionar: cidadania americana ou green card.",
      questions: [
        {
          id: "pet_status",
          labelPt: "Você é:",
          type: "radio",
          required: true,
          options: [
            { value: "citizen", labelPt: "Cidadão americano" },
            { value: "lpr", labelPt: "Residente permanente (green card)" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              citizen: `${S2}Pt2Line36_USCitizen[0]`,
              lpr: `${S2}Pt2Line36_LPR[0]`,
            },
          },
        },
        {
          id: "pet_citizenship_via",
          labelPt: "Sua cidadania foi adquirida por:",
          type: "radio",
          required: true,
          showWhen: { questionId: "pet_status", equals: "citizen" },
          options: [
            { value: "birth", labelPt: "Nascimento nos EUA" },
            { value: "naturalization", labelPt: "Naturalização" },
            { value: "parents", labelPt: "Pais (cidadania derivada)" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              birth: `${S2}Pt2Line23a_checkbox[0]`,
              naturalization: `${S2}Pt2Line23b_checkbox[0]`,
              parents: `${S2}Pt2Line23c_checkbox[0]`,
            },
          },
        },
        {
          id: "pet_has_certificate",
          labelPt: "Você tem Certificado de Naturalização ou de Cidadania?",
          type: "radio",
          showWhen: { questionId: "pet_status", equals: "citizen" },
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S2}Pt2Line36_Yes[0]`, no: `${S2}Pt2Line36_No[0]` },
          },
        },
        {
          id: "pet_certificate_number",
          labelPt: "Número do certificado",
          type: "text",
          showWhen: { questionId: "pet_has_certificate", equals: "yes" },
          pdf: { kind: "text", field: `${S2}Pt2Line37a_CertificateNumber[0]` },
        },
        {
          id: "pet_certificate_place",
          labelPt: "Local de emissão do certificado",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "pet_has_certificate", equals: "yes" },
          pdf: { kind: "text", field: `${S2}Pt2Line37b_PlaceOfIssuance[0]` },
        },
        {
          id: "pet_certificate_date",
          labelPt: "Data de emissão do certificado",
          type: "date",
          showWhen: { questionId: "pet_has_certificate", equals: "yes" },
          pdf: { kind: "text", field: `${S2}Pt2Line37c_DateOfIssuance[0]`, transform: isoToUsDate },
        },
        {
          id: "pet_lpr_class",
          labelPt: "Classe de admissão do seu green card (ex.: IR6, CR6, F21)",
          helpPt: "Está impressa no próprio green card, campo \"Category\".",
          type: "text",
          required: true,
          showWhen: { questionId: "pet_status", equals: "lpr" },
          pdf: { kind: "text", field: `${S3}Pt2Line40a_ClassOfAdmission[0]` },
        },
        {
          id: "pet_lpr_date",
          labelPt: "Data de admissão como residente",
          type: "date",
          required: true,
          showWhen: { questionId: "pet_status", equals: "lpr" },
          pdf: { kind: "text", field: `${S3}Pt2Line40b_DateOfAdmission[0]`, transform: isoToUsDate },
        },
        {
          id: "pet_lpr_city",
          labelPt: "Cidade onde foi admitido como residente",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "pet_status", equals: "lpr" },
          pdf: { kind: "text", field: `${S3}Pt2Line40d_CityOrTown[0]` },
        },
        {
          id: "pet_lpr_state",
          labelPt: "Estado (sigla de 2 letras)",
          type: "text",
          validate: { pattern: /^([A-Za-z]{2})?$/, messagePt: "Use a sigla de 2 letras (ex.: FL)." },
          showWhen: { questionId: "pet_status", equals: "lpr" },
          pdf: { kind: "dropdown", field: `${S3}Pt2Line40e_State[0]` },
        },
        {
          id: "pet_lpr_via_marriage",
          labelPt: "Você obteve o green card por casamento com cidadão ou residente?",
          type: "radio",
          required: true,
          showWhen: { questionId: "pet_status", equals: "lpr" },
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S3}Pt2Line41_Yes[0]`, no: `${S3}Pt2Line41_No[0]` },
          },
        },
      ],
    },

    // ── 8. Peticionário — emprego (Part 2, itens 42–49) ─────────────────────
    {
      id: "peticionario-emprego",
      titlePt: "Peticionário — seu trabalho atual",
      descriptionPt:
        "Se estiver desempregado, escreva \"Unemployed\" no nome do empregador. Empregos anteriores dos últimos 5 anos podem ser adicionados à mão na Parte 9.",
      questions: [
        {
          id: "pet_employer_name",
          labelPt: "Nome do empregador/empresa atual",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S3}Pt2Line40_EmployerOrCompName[0]` },
        },
        ...addressQuestions("pet_employer", "Endereço do empregador", {
          street: `${S3}Pt2Line41_StreetNumberName[0]`,
          unitApt: `${S3}Pt2Line41_Unit[0]`,
          unitSte: `${S3}Pt2Line41_Unit[1]`,
          unitFlr: `${S3}Pt2Line41_Unit[2]`,
          unitNumber: `${S3}Pt2Line41_AptSteFlrNumber[0]`,
          city: `${S3}Pt2Line41_CityOrTown[0]`,
          state: `${S3}Pt2Line41_State[0]`,
          zip: `${S3}Pt2Line41_ZipCode[0]`,
          province: `${S3}Pt2Line41_Province[0]`,
          postal: `${S3}Pt2Line41_PostalCode[0]`,
          country: `${S3}Pt2Line41_Country[0]`,
        }),
        {
          id: "pet_occupation",
          labelPt: "Sua ocupação",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S3}Pt2Line42_Occupation[0]` },
        },
        {
          id: "pet_employment_from",
          labelPt: "Trabalhando aí desde",
          type: "date",
          pdf: { kind: "text", field: `${S3}Pt2Line43a_DateFrom[0]`, transform: isoToUsDate },
        },
      ],
    },

    // ── 9. Peticionário — informações biográficas (Part 3) ──────────────────
    {
      id: "biografico",
      titlePt: "Peticionário — informações biográficas",
      descriptionPt: "Dados físicos SEUS (do peticionário), usados pelo USCIS para identificação.",
      questions: [
        {
          id: "pet_ethnicity",
          labelPt: "Etnia",
          type: "radio",
          required: true,
          options: [
            { value: "not_hispanic", labelPt: "Não hispânico ou latino" },
            { value: "hispanic", labelPt: "Hispânico ou latino" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              hispanic: `${S3}Pt3Line1_Ethnicity[1]`,
              not_hispanic: `${S3}Pt3Line1_Ethnicity[0]`,
            },
          },
        },
        {
          id: "pet_race_white",
          labelPt: "Raça — Branca",
          helpPt: "O USCIS permite marcar mais de uma.",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S3}Pt3Line2_Race_White[0]` },
        },
        {
          id: "pet_race_black",
          labelPt: "Raça — Negra ou afro-americana",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S3}Pt3Line2_Race_Black[0]` },
        },
        {
          id: "pet_race_asian",
          labelPt: "Raça — Asiática",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S3}Pt3Line2_Race_Asian[0]` },
        },
        {
          id: "pet_race_indigenous",
          labelPt: "Raça — Indígena americana ou nativa do Alasca",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S3}Pt3Line2_Race_AmericanIndianAlaskaNative[0]` },
        },
        {
          id: "pet_race_pacific",
          labelPt: "Raça — Nativa do Havaí ou de ilhas do Pacífico",
          type: "checkbox",
          pdf: { kind: "checkbox", field: `${S3}Pt3Line2_Race_NativeHawaiianOtherPacificIslander[0]` },
        },
        {
          id: "pet_height_feet",
          labelPt: "Altura — pés (ex.: 5)",
          helpPt: "1,70m ≈ 5 pés e 7 polegadas. 1 pé = 30,5cm; 1 polegada = 2,54cm.",
          type: "select",
          required: true,
          options: ["2", "3", "4", "5", "6", "7", "8"].map((v) => ({ value: v, labelPt: v })),
          pdf: { kind: "dropdown", field: `${S3}Pt3Line3_HeightFeet[0]` },
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
          pdf: { kind: "dropdown", field: `${S3}Pt3Line3_HeightInches[0]` },
        },
        {
          id: "pet_weight",
          labelPt: "Peso em libras (ex.: 154 — 1kg = 2,2 lb)",
          type: "number",
          required: true,
          validate: { pattern: /^\d{2,3}$/, messagePt: "Digite o peso em libras (2 ou 3 dígitos)." },
          pdf: [
            {
              kind: "text",
              field: `${S3}Pt3Line4_Pound1[0]`,
              transform: (v) => String(v ?? "").padStart(3, "0").charAt(0),
            },
            {
              kind: "text",
              field: `${S3}Pt3Line4_Pound2[0]`,
              transform: (v) => String(v ?? "").padStart(3, "0").charAt(1),
            },
            {
              kind: "text",
              field: `${S3}Pt3Line4_Pound3[0]`,
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
              blue: `${S3}Pt3Line5_EyeColor[0]`,
              brown: `${S3}Pt3Line5_EyeColor[1]`,
              hazel: `${S3}Pt3Line5_EyeColor[2]`,
              pink: `${S3}Pt3Line5_EyeColor[3]`,
              maroon: `${S3}Pt3Line5_EyeColor[4]`,
              green: `${S3}Pt3Line5_EyeColor[5]`,
              gray: `${S3}Pt3Line5_EyeColor[6]`,
              black: `${S3}Pt3Line5_EyeColor[7]`,
              other: `${S3}Pt3Line5_EyeColor[8]`,
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
              bald: `${S4}Pt3Line6_HairColor[0]`,
              black: `${S4}Pt3Line6_HairColor[1]`,
              blond: `${S4}Pt3Line6_HairColor[2]`,
              brown: `${S4}Pt3Line6_HairColor[3]`,
              gray: `${S4}Pt3Line6_HairColor[4]`,
              red: `${S4}Pt3Line6_HairColor[5]`,
              sandy: `${S4}Pt3Line6_HairColor[6]`,
              white: `${S4}Pt3Line6_HairColor[7]`,
              other: `${S4}Pt3Line6_HairColor[8]`,
            },
          },
        },
      ],
    },

    // ── 10. Beneficiário — identificação (Part 4, itens 1–10) ───────────────
    {
      id: "beneficiario",
      titlePt: "Beneficiário — quem vai receber o green card",
      descriptionPt:
        "Agora os dados do BENEFICIÁRIO: a pessoa para quem você está peticionando. " +
        "Se for seu cônjuge, ele(a) também preencherá o formulário I-130A separado.",
      questions: [
        {
          id: "ben_a_number",
          labelPt: "A-Number do beneficiário (se tiver)",
          type: "text",
          pdf: { kind: "text", field: `${S4}#area[6].Pt4Line1_AlienNumber[0]` },
        },
        {
          id: "ben_uscis_account",
          labelPt: "Conta online do USCIS do beneficiário (se tiver)",
          type: "text",
          pdf: { kind: "text", field: `${S4}#area[7].Pt4Line2_USCISOnlineActNumber[0]` },
        },
        {
          id: "ben_ssn",
          labelPt: "SSN do beneficiário (se tiver)",
          type: "text",
          pdf: { kind: "text", field: `${S4}Pt4Line3_SSN[0]` },
        },
        {
          id: "ben_family_name",
          labelPt: "Sobrenome do beneficiário (como no passaporte)",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}Pt4Line4a_FamilyName[0]` },
        },
        {
          id: "ben_given_name",
          labelPt: "Nome do beneficiário",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}Pt4Line4b_GivenName[0]` },
        },
        {
          id: "ben_middle_name",
          labelPt: "Nome do meio do beneficiário",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}Pt4Line4c_MiddleName[0]` },
        },
        {
          id: "ben_other_family_name",
          labelPt: "Outros nomes que o beneficiário já usou — sobrenome",
          helpPt: "Nome de solteira, apelidos formais. Em branco se não houver.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}P4Line5a_FamilyName[0]` },
        },
        {
          id: "ben_other_given_name",
          labelPt: "Outros nomes — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}Pt4Line5b_GivenName[0]` },
        },
        {
          id: "ben_birth_city",
          labelPt: "Cidade de nascimento do beneficiário",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}Pt4Line7_CityTownOfBirth[0]` },
        },
        {
          id: "ben_birth_country",
          labelPt: "País de nascimento do beneficiário (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S4}Pt4Line8_CountryOfBirth[0]` },
        },
        {
          id: "ben_dob",
          labelPt: "Data de nascimento do beneficiário",
          type: "date",
          required: true,
          pdf: { kind: "text", field: `${S4}Pt4Line9_DateOfBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "ben_sex",
          labelPt: "Sexo do beneficiário",
          type: "radio",
          required: true,
          options: [
            { value: "male", labelPt: "Masculino" },
            { value: "female", labelPt: "Feminino" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { male: `${S4}Pt4Line9_Male[0]`, female: `${S4}Pt4Line9_Female[0]` },
          },
        },
        {
          id: "ben_prior_petition",
          labelPt: "Alguém já protocolou uma petição para este beneficiário antes?",
          type: "radio",
          required: true,
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
            { value: "unknown", labelPt: "Não sei (nem o beneficiário sabe)" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              yes: `${S4}Pt4Line10_Yes[0]`,
              no: `${S4}Pt4Line10_No[0]`,
              unknown: `${S4}Pt4Line10_Unknown[0]`,
            },
          },
        },
      ],
    },

    // ── 11. Beneficiário — endereços e contato (Part 4, itens 11–16) ────────
    {
      id: "beneficiario-endereco",
      titlePt: "Beneficiário — endereços e contato",
      questions: [
        ...addressQuestions("ben_phys", "Endereço atual do beneficiário", {
          street: `${S4}Pt4Line11_StreetNumberName[0]`,
          unitApt: `${S4}Pt4Line11_Unit[0]`,
          unitSte: `${S4}Pt4Line11_Unit[1]`,
          unitFlr: `${S4}Pt4Line11_Unit[2]`,
          unitNumber: `${S4}Pt4Line11_AptSteFlrNumber[0]`,
          city: `${S4}Pt4Line11_CityOrTown[0]`,
          state: `${S4}Pt4Line11_State[0]`,
          zip: `${S4}Pt4Line11_ZipCode[0]`,
          province: `${S4}Pt4Line11_Province[0]`,
          postal: `${S4}Pt4Line11_PostalCode[0]`,
          country: `${S4}Pt4Line11_Country[0]`,
        }, { required: true, helpPt: "Onde o beneficiário mora hoje (Brasil ou EUA)." }),
        {
          id: "ben_us_street",
          labelPt: "Endereço nos EUA onde o beneficiário pretende morar — rua e número",
          helpPt: "Se for o mesmo endereço acima, escreva SAME.",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "SAME",
          pdf: { kind: "text", field: `${S4}Pt4Line12a_StreetNumberName[0]` },
        },
        {
          id: "ben_us_city",
          labelPt: "Cidade (EUA)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}Pt4Line12c_CityOrTown[0]` },
        },
        {
          id: "ben_us_state",
          labelPt: "Estado (sigla de 2 letras)",
          type: "text",
          validate: { pattern: /^([A-Za-z]{2})?$/, messagePt: "Use a sigla de 2 letras (ex.: FL)." },
          pdf: { kind: "dropdown", field: `${S4}Pt4Line12d_State[0]` },
        },
        {
          id: "ben_us_zip",
          labelPt: "ZIP Code",
          type: "text",
          validate: { pattern: /^(\d{5}(-\d{4})?)?$/, messagePt: "Use um ZIP válido (5 dígitos)." },
          pdf: { kind: "text", field: `${S4}Pt4Line12e_ZipCode[0]` },
        },
        {
          id: "ben_abroad_street",
          labelPt: "Endereço do beneficiário fora dos EUA — rua e número",
          helpPt: "Se for o mesmo do endereço atual informado acima, escreva SAME.",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "SAME",
          pdf: { kind: "text", field: `${S4}Pt4Line13_StreetNumberName[0]` },
        },
        {
          id: "ben_abroad_city",
          labelPt: "Cidade (fora dos EUA)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}Pt4Line13_CityOrTown[0]` },
        },
        {
          id: "ben_abroad_province",
          labelPt: "Estado/Província",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}Pt4Line13_Province[0]` },
        },
        {
          id: "ben_abroad_postal",
          labelPt: "CEP / Postal Code",
          type: "text",
          pdf: { kind: "text", field: `${S4}Pt4Line13_PostalCode[0]` },
        },
        {
          id: "ben_abroad_country",
          labelPt: "País (em inglês)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S4}Pt4Line13_Country[0]` },
        },
        {
          id: "ben_daytime_phone",
          labelPt: "Telefone do beneficiário",
          type: "text",
          pdf: { kind: "text", field: `${S4}Pt4Line14_DaytimePhoneNumber[0]` },
        },
        {
          id: "ben_mobile_phone",
          labelPt: "Celular do beneficiário",
          type: "text",
          pdf: { kind: "text", field: `${S5}Pt4Line15_MobilePhoneNumber[0]` },
        },
        {
          id: "ben_email",
          labelPt: "E-mail do beneficiário",
          type: "text",
          pdf: { kind: "text", field: `${S5}Pt4Line16_EmailAddress[0]` },
        },
      ],
    },

    // ── 12. Beneficiário — casamento e família (Part 4, itens 17–44) ────────
    {
      id: "beneficiario-familia",
      titlePt: "Beneficiário — casamento e família",
      questions: [
        {
          id: "ben_marriage_count",
          labelPt: "Quantas vezes o beneficiário já se casou? (0 se nunca)",
          type: "number",
          required: true,
          pdf: { kind: "text", field: `${S5}Pt4Line17_NumberofMarriages[0]` },
        },
        {
          id: "ben_marital_status",
          labelPt: "Estado civil atual do beneficiário",
          type: "radio",
          required: true,
          options: [
            { value: "single", labelPt: "Solteiro(a), nunca casou" },
            { value: "married", labelPt: "Casado(a)" },
            { value: "divorced", labelPt: "Divorciado(a)" },
            { value: "widowed", labelPt: "Viúvo(a)" },
            { value: "separated", labelPt: "Separado(a)" },
            { value: "annulled", labelPt: "Casamento anulado" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              widowed: `${S5}Pt4Line18_MaritalStatus[0]`,
              annulled: `${S5}Pt4Line18_MaritalStatus[1]`,
              separated: `${S5}Pt4Line18_MaritalStatus[2]`,
              single: `${S5}Pt4Line18_MaritalStatus[3]`,
              married: `${S5}Pt4Line18_MaritalStatus[4]`,
              divorced: `${S5}Pt4Line18_MaritalStatus[5]`,
            },
          },
        },
        {
          id: "ben_marriage_date",
          labelPt: "Data do casamento atual do beneficiário",
          type: "date",
          showWhen: { questionId: "ben_marital_status", equals: "married" },
          pdf: { kind: "text", field: `${S5}Pt4Line19_DateOfMarriage[0]`, transform: isoToUsDate },
        },
        {
          id: "ben_marriage_city",
          labelPt: "Cidade do casamento",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "ben_marital_status", equals: "married" },
          pdf: { kind: "text", field: `${S5}Pt4Line20a_CityTown[0]` },
        },
        {
          id: "ben_marriage_state",
          labelPt: "Estado americano do casamento (sigla — em branco se fora dos EUA)",
          type: "text",
          validate: { pattern: /^([A-Za-z]{2})?$/, messagePt: "Use a sigla de 2 letras (ex.: FL)." },
          showWhen: { questionId: "ben_marital_status", equals: "married" },
          pdf: { kind: "dropdown", field: `${S5}Pt4Line20b_State[0]` },
        },
        {
          id: "ben_marriage_province",
          labelPt: "Estado/Província do casamento (fora dos EUA)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "ben_marital_status", equals: "married" },
          pdf: { kind: "text", field: `${S5}Pt4Line20c_Province[0]` },
        },
        {
          id: "ben_marriage_country",
          labelPt: "País do casamento (em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "ben_marital_status", equals: "married" },
          pdf: { kind: "text", field: `${S5}Pt4Line20d_Country[0]` },
        },
        {
          id: "ben_spouse_family",
          labelPt: "Cônjuge atual do beneficiário — sobrenome",
          helpPt: "Numa petição de cônjuge, é você (o peticionário). Em branco se o beneficiário não é casado.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S5}Pt4Line16a_FamilyName[0]` },
        },
        {
          id: "ben_spouse_given",
          labelPt: "Cônjuge atual do beneficiário — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S5}Pt4Line16b_GivenName[0]` },
        },
        {
          id: "ben_person1_family",
          labelPt: "Familiar 1 do beneficiário (cônjuge/filho) — sobrenome",
          helpPt:
            "Liste cônjuge e filhos do beneficiário. Em branco se não houver. Mais de 5: adicione à mão na Parte 9.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S5}Pt4Line30a_FamilyName[0]` },
        },
        {
          id: "ben_person1_given",
          labelPt: "Familiar 1 — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S5}Pt4Line30b_GivenName[0]` },
        },
        {
          id: "ben_person1_relationship",
          labelPt: "Familiar 1 — relação (em inglês: Spouse, Child)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S5}Pt4Line31_Relationship[0]` },
        },
        {
          id: "ben_person1_dob",
          labelPt: "Familiar 1 — data de nascimento",
          type: "date",
          pdf: { kind: "text", field: `${S5}Pt4Line32_DateOfBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "ben_person1_country",
          labelPt: "Familiar 1 — país de nascimento (em inglês)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S5}Pt4Line49_CountryOfBirth[0]` },
        },
        {
          id: "ben_person2_family",
          labelPt: "Familiar 2 — sobrenome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S5}Pt4Line34a_FamilyName[0]` },
        },
        {
          id: "ben_person2_given",
          labelPt: "Familiar 2 — nome",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S5}Pt4Line34b_GivenName[0]` },
        },
        {
          id: "ben_person2_relationship",
          labelPt: "Familiar 2 — relação (em inglês)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S5}Pt4Line35_Relationship[0]` },
        },
        {
          id: "ben_person2_dob",
          labelPt: "Familiar 2 — data de nascimento",
          type: "date",
          pdf: { kind: "text", field: `${S5}Pt4Line36_DateOfBirth[0]`, transform: isoToUsDate },
        },
        {
          id: "ben_person2_country",
          labelPt: "Familiar 2 — país de nascimento (em inglês)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S5}Pt4Line37_CountryOfBirth[0]` },
        },
      ],
    },

    // ── 13. Beneficiário — entrada nos EUA e trabalho (Part 4, 45–56) ───────
    {
      id: "beneficiario-entrada",
      titlePt: "Beneficiário — presença nos EUA e trabalho",
      questions: [
        {
          id: "ben_ever_in_us",
          labelPt: "O beneficiário JÁ esteve nos EUA?",
          type: "radio",
          required: true,
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S6}Pt4Line20_Yes[0]`, no: `${S6}Pt4Line20_No[0]` },
          },
        },
        {
          id: "ben_in_us_now",
          labelPt: "O beneficiário está nos EUA AGORA?",
          helpPt: "Os campos de entrada (classe, I-94) só são preenchidos se ele estiver nos EUA atualmente.",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não, está fora dos EUA" },
            { value: "yes", labelPt: "Sim, está nos EUA" },
          ],
        },
        {
          id: "ben_class_of_admission",
          labelPt: "Como o beneficiário entrou (classe de admissão)",
          type: "select",
          required: true,
          options: CLASS_OF_ADMISSION_OPTIONS,
          showWhen: { questionId: "ben_in_us_now", equals: "yes" },
          pdf: { kind: "dropdown", field: `${S6}Pt4Line21a_ClassOfAdmission[0]` },
        },
        {
          id: "ben_i94_number",
          labelPt: "Número do I-94 do beneficiário",
          type: "text",
          showWhen: { questionId: "ben_in_us_now", equals: "yes" },
          pdf: { kind: "text", field: `${S6}#area[8].Pt4Line21b_ArrivalDeparture[0]` },
        },
        {
          id: "ben_arrival_date",
          labelPt: "Data da chegada",
          type: "date",
          showWhen: { questionId: "ben_in_us_now", equals: "yes" },
          pdf: { kind: "text", field: `${S6}Pt4Line21c_DateOfArrival[0]`, transform: isoToUsDate },
        },
        {
          id: "ben_stay_expiry",
          labelPt: "Validade da estadia no I-94 (data mm/dd/yyyy ou D/S)",
          helpPt: "Escreva D/S se o I-94 diz Duration of Status.",
          type: "text",
          showWhen: { questionId: "ben_in_us_now", equals: "yes" },
          pdf: { kind: "text", field: `${S6}Pt4Line21d_DateExpired[0]` },
        },
        {
          id: "ben_passport_number",
          labelPt: "Número do passaporte do beneficiário",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S6}Pt4Line22_PassportNumber[0]` },
        },
        {
          id: "ben_travel_doc",
          labelPt: "Documento de viagem (se não for passaporte)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S6}Pt4Line23_TravelDocNumber[0]` },
        },
        {
          id: "ben_passport_country",
          labelPt: "País emissor do passaporte (em inglês)",
          type: "text",
          passthroughEn: true,
          default: "Brazil",
          pdf: { kind: "text", field: `${S6}Pt4Line24_CountryOfIssuance[0]` },
        },
        {
          id: "ben_passport_expiry",
          labelPt: "Validade do passaporte",
          type: "date",
          pdf: { kind: "text", field: `${S6}Pt4Line25_ExpDate[0]`, transform: isoToUsDate },
        },
        {
          id: "ben_employer_name",
          labelPt: "Empregador atual do beneficiário (ou \"Unemployed\")",
          type: "text",
          required: true,
          passthroughEn: true,
          pdf: { kind: "text", field: `${S6}Pt4Line26_NameOfCompany[0]` },
        },
        {
          id: "ben_employment_began",
          labelPt: "Trabalhando aí desde",
          type: "date",
          pdf: { kind: "text", field: `${S6}Pt4Line27_DateEmploymentBegan[0]`, transform: isoToUsDate },
        },
        {
          id: "ben_in_proceedings",
          labelPt: "O beneficiário JÁ esteve em processo de imigração (remoção, deportação)?",
          helpPt: "Se sim, converse com um profissional antes de protocolar — este é um ponto sensível.",
          type: "radio",
          required: true,
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S6}Pt4Line28_Yes[0]`, no: `${S6}Pt4Line28_No[0]` },
          },
        },
        {
          id: "ben_proceedings_type",
          labelPt: "Tipo de processo",
          type: "radio",
          showWhen: { questionId: "ben_in_proceedings", equals: "yes" },
          options: [
            { value: "removal", labelPt: "Remoção (removal)" },
            { value: "exclusion", labelPt: "Exclusão/Deportação" },
            { value: "rescission", labelPt: "Rescisão" },
            { value: "judicial", labelPt: "Outro processo judicial" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: {
              removal: `${S6}Pt4Line54_Removal[0]`,
              exclusion: `${S6}Pt4Line54_Exclusion[0]`,
              rescission: `${S6}Pt4Line54_Rescission[0]`,
              judicial: `${S6}Pt4Line54_JudicialProceedings[0]`,
            },
          },
        },
        {
          id: "ben_proceedings_city",
          labelPt: "Cidade do processo",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "ben_in_proceedings", equals: "yes" },
          pdf: { kind: "text", field: `${S6}Pt4Line55a_CityOrTown[0]` },
        },
        {
          id: "ben_proceedings_state",
          labelPt: "Estado do processo (sigla)",
          type: "text",
          validate: { pattern: /^([A-Za-z]{2})?$/, messagePt: "Use a sigla de 2 letras (ex.: FL)." },
          showWhen: { questionId: "ben_in_proceedings", equals: "yes" },
          pdf: { kind: "dropdown", field: `${S6}Pt4Line55b_State[0]` },
        },
        {
          id: "ben_proceedings_date",
          labelPt: "Data do processo",
          type: "date",
          showWhen: { questionId: "ben_in_proceedings", equals: "yes" },
          pdf: { kind: "text", field: `${S6}Pt4Line56_Date[0]`, transform: isoToUsDate },
        },
      ],
    },

    // ── 14. Onde o processo continua (Part 4, itens 59–62) ──────────────────
    {
      id: "processamento",
      titlePt: "Onde o processo do green card continua",
      descriptionPt:
        "Consular = beneficiário fora dos EUA, entrevista no consulado (caminho do kit). " +
        "Ajuste de status = beneficiário dentro dos EUA em situação elegível.",
      questions: [
        {
          id: "lived_together_street",
          labelPt: "Se a petição é para cônjuge: último endereço em que moraram JUNTOS — rua e número",
          helpPt: "Se nunca moraram juntos, escreva Never lived together.",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "relationship", equals: "spouse" },
          pdf: { kind: "text", field: `${S7}Pt4Line57_StreetNumberName[0]` },
        },
        {
          id: "lived_together_city",
          labelPt: "Cidade",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "relationship", equals: "spouse" },
          pdf: { kind: "text", field: `${S7}Pt4Line57_CityOrTown[0]` },
        },
        {
          id: "lived_together_country",
          labelPt: "País (em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "relationship", equals: "spouse" },
          pdf: { kind: "text", field: `${S7}Pt4Line57_Country[0]` },
        },
        {
          id: "lived_together_from",
          labelPt: "Moraram juntos de",
          type: "date",
          showWhen: { questionId: "relationship", equals: "spouse" },
          pdf: { kind: "text", field: `${S7}Pt4Line58a_DateFrom[0]`, transform: isoToUsDate },
        },
        {
          id: "lived_together_to",
          labelPt: "até",
          type: "date",
          showWhen: { questionId: "relationship", equals: "spouse" },
          pdf: { kind: "text", field: `${S7}Pt4Line58b_DateTo[0]`, transform: isoToUsDate },
        },
        {
          id: "processing_venue",
          labelPt: "O beneficiário vai:",
          type: "radio",
          required: true,
          default: "consular",
          options: [
            { value: "consular", labelPt: "Pedir o visto de imigrante no consulado (fora dos EUA)" },
            { value: "adjustment", labelPt: "Pedir ajuste de status dentro dos EUA" },
          ],
        },
        {
          id: "consulate_city",
          labelPt: "Cidade do consulado americano",
          helpPt: "No Brasil, vistos de imigrante são processados no Rio de Janeiro.",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Rio de Janeiro",
          showWhen: { questionId: "processing_venue", equals: "consular" },
          pdf: { kind: "text", field: `${S7}Pt4Line61a_CityOrTown[0]` },
        },
        {
          id: "consulate_province",
          labelPt: "Estado/Província do consulado",
          type: "text",
          passthroughEn: true,
          default: "Rio de Janeiro",
          showWhen: { questionId: "processing_venue", equals: "consular" },
          pdf: { kind: "text", field: `${S7}Pt4Line61b_Province[0]` },
        },
        {
          id: "consulate_country",
          labelPt: "País do consulado (em inglês)",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
          showWhen: { questionId: "processing_venue", equals: "consular" },
          pdf: { kind: "text", field: `${S7}Pt4Line61c_Country[0]` },
        },
        {
          id: "adjustment_city",
          labelPt: "Cidade do escritório do USCIS para o ajuste",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "processing_venue", equals: "adjustment" },
          pdf: { kind: "text", field: `${S7}Pt4Line60a_CityOrTown[0]` },
        },
        {
          id: "adjustment_state",
          labelPt: "Estado (sigla)",
          type: "text",
          validate: { pattern: /^([A-Za-z]{2})?$/, messagePt: "Use a sigla de 2 letras (ex.: FL)." },
          showWhen: { questionId: "processing_venue", equals: "adjustment" },
          pdf: { kind: "dropdown", field: `${S7}Pt4Line60b_State[0]` },
        },
      ],
    },

    // ── 15. Outras petições (Part 5) e contato do peticionário (Part 6) ─────
    {
      id: "outras-peticoes",
      titlePt: "Outras petições e seu contato",
      questions: [
        {
          id: "pet_prior_filed",
          labelPt: "Você JÁ protocolou petição para este beneficiário ou outra pessoa antes?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não" },
            { value: "yes", labelPt: "Sim" },
          ],
          pdf: {
            kind: "checkboxChoice",
            fieldByValue: { yes: `${S7}Part4Line1_Yes[0]`, no: `${S7}Part4Line1_No[0]` },
          },
        },
        {
          id: "prior_ben_family",
          labelPt: "Beneficiário anterior — sobrenome",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "pet_prior_filed", equals: "yes" },
          pdf: { kind: "text", field: `${S7}Pt5Line2a_FamilyName[0]` },
        },
        {
          id: "prior_ben_given",
          labelPt: "Beneficiário anterior — nome",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "pet_prior_filed", equals: "yes" },
          pdf: { kind: "text", field: `${S7}Pt5Line2b_GivenName[0]` },
        },
        {
          id: "prior_filing_city",
          labelPt: "Cidade onde protocolou",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "pet_prior_filed", equals: "yes" },
          pdf: { kind: "text", field: `${S7}Pt5Line3a_CityOrTown[0]` },
        },
        {
          id: "prior_filing_date",
          labelPt: "Data do protocolo",
          type: "date",
          showWhen: { questionId: "pet_prior_filed", equals: "yes" },
          pdf: { kind: "text", field: `${S7}Pt5Line4_DateFiled[0]`, transform: isoToUsDate },
        },
        {
          id: "prior_filing_result",
          labelPt: "Resultado (em inglês: approved, denied, withdrawn)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "pet_prior_filed", equals: "yes" },
          pdf: { kind: "text", field: `${S7}Pt5Line5_Result[0]` },
        },
        {
          id: "other_relative_family",
          labelPt: "Petições separadas para outros parentes — sobrenome do parente (se houver)",
          helpPt: "Em branco se este é o único. Mais parentes: adicione à mão na Parte 9.",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S7}Pt4Line6a_FamilyName[0]` },
        },
        {
          id: "other_relative_given",
          labelPt: "Nome do parente",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S7}Pt4Line6b_GivenName[0]` },
        },
        {
          id: "other_relative_relationship",
          labelPt: "Relação com esse parente (em inglês: Spouse, Child, Parent)",
          type: "text",
          passthroughEn: true,
          pdf: { kind: "text", field: `${S7}Pt4Line7_Relationship[0]` },
        },
        {
          id: "pet_daytime_phone",
          labelPt: "Seu telefone (peticionário)",
          type: "text",
          required: true,
          pdf: { kind: "text", field: `${S8}Pt6Line3_DaytimePhoneNumber[0]` },
        },
        {
          id: "pet_mobile_phone",
          labelPt: "Seu celular",
          type: "text",
          pdf: { kind: "text", field: `${S8}Pt6Line4_MobileNumber[0]` },
        },
        {
          id: "pet_email",
          labelPt: "Seu e-mail",
          type: "text",
          prefillFrom: "email",
          pdf: { kind: "text", field: `${S8}Pt6Line5_Email[0]` },
        },
      ],
    },
  ],
};
