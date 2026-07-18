/**
 * ESTA — Electronic System for Travel Authorization (colinha).
 *
 * Like the DS-160, the ESTA has no official fillable PDF — it's a CBP web
 * form filled directly on esta.cbp.dhs.gov. `exportKind: "worksheet"`: this
 * spec drives a bilingual cheat-sheet (see lib/forms/fillWorksheet.ts), not a
 * government PDF. The applicant still submits the real application
 * themselves, on the official site.
 *
 * NOTE ON AUDIENCE: Brazil does NOT participate in the Visa Waiver Program
 * (see content/leis/vistos/esta-vwp.md) — this form is for VWP-country
 * nationals (or Brazilians who also hold a second, VWP-eligible nationality).
 * It's attached to the existing `esta` kit, which already carries that
 * warning as its `alertaCritico`.
 *
 * Scope: covers Personal Info, Passport, Contact Info and Travel Info in
 * full. The Eligibility (Yes/No) questions are widely published, stable CBP
 * text (unchanged for years, cited in travel.state.gov guidance) and are
 * included here for completeness — but there is no canonical PDF to verify
 * exact current wording against, so the disclaimer sends the applicant to
 * confirm each one on the live ESTA site, not just trust this cheat sheet.
 *
 * Ministerial: transcribes and translates deterministically, never invents
 * an answer or decides eligibility on the applicant's behalf.
 */

import type { FormSpec } from "./types";

const YES_NO = [
  { value: "no", labelPt: "Não", valueEn: "No" },
  { value: "yes", labelPt: "Sim", valueEn: "Yes" },
];

export const ESTA: FormSpec = {
  id: "esta",
  code: "ESTA",
  officialName: "Electronic System for Travel Authorization",
  namePt: "ESTA — Autorização Eletrônica de Viagem",
  agency: "CBP",
  officialUrl: "https://esta.cbp.dhs.gov",
  edition: "n/a", // online form, no printed edition to pin
  exportKind: "worksheet",
  attachTo: { vistoId: "esta", documentoId: "colinha-esta" },
  disclaimerPt:
    "O ESTA só vale para cidadãos de países do Visa Waiver Program — o Brasil NÃO participa. Esta colinha " +
    "serve para quem também tem uma segunda nacionalidade elegível. É preenchido por VOCÊ, diretamente em " +
    "esta.cbp.dhs.gov — não existe PDF oficial para baixar. As perguntas de elegibilidade abaixo seguem o " +
    "texto público do CBP, mas confira cada uma no site oficial antes de responder — o texto pode mudar. " +
    "A Immigrei é uma ferramenta de preparação — não presta serviços jurídicos e não revisa o mérito do seu caso.",

  sections: [
    // ── 1. Personal Information ──────────────────────────────────────────
    {
      id: "personal",
      titlePt: "Personal Information",
      questions: [
        {
          id: "surname",
          labelPt: "Sobrenome (como no passaporte)",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "given_names",
          labelPt: "Nome(s) (como no passaporte)",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "has_other_names",
          labelPt: "Você já usou outro nome?",
          type: "radio",
          required: true,
          default: "no",
          options: YES_NO,
        },
        {
          id: "other_names",
          labelPt: "Qual(is) outro(s) nome(s)?",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "has_other_names", equals: "yes" },
        },
        {
          id: "sex",
          labelPt: "Sexo",
          type: "radio",
          required: true,
          options: [
            { value: "male", labelPt: "Masculino", valueEn: "Male" },
            { value: "female", labelPt: "Feminino", valueEn: "Female" },
          ],
        },
        {
          id: "dob",
          labelPt: "Data de nascimento",
          type: "date",
          required: true,
        },
        {
          id: "birth_city",
          labelPt: "Cidade de nascimento",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "birth_country",
          labelPt: "País de nascimento",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "citizenship_country",
          labelPt: "País de cidadania elegível ao VWP",
          helpPt: "O Brasil não participa do VWP — informe a nacionalidade do país elegível (ex.: Portugal, Itália).",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "has_other_nationality",
          labelPt: "Você tem alguma outra nacionalidade?",
          type: "radio",
          default: "no",
          options: YES_NO,
        },
        {
          id: "other_nationality",
          labelPt: "Qual?",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "has_other_nationality", equals: "yes" },
        },
        {
          id: "national_id",
          labelPt: "Número de identidade nacional do país de cidadania (se houver)",
          type: "text",
        },
      ],
    },

    // ── 2. Passport Information ──────────────────────────────────────────
    {
      id: "passaporte",
      titlePt: "Passport Information",
      questions: [
        {
          id: "passport_number",
          labelPt: "Número do passaporte",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "passport_issuing_country",
          labelPt: "País emissor do passaporte",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "passport_issued_date",
          labelPt: "Data de emissão",
          type: "date",
          required: true,
        },
        {
          id: "passport_expiry_date",
          labelPt: "Data de validade",
          helpPt: "Precisa ser válido por pelo menos 6 meses além da data planejada de saída dos EUA.",
          type: "date",
          required: true,
        },
        {
          id: "has_other_citizenship_ever",
          labelPt: "Você já foi cidadão(ã) ou nacional de outro país além dos já mencionados?",
          type: "radio",
          default: "no",
          options: YES_NO,
        },
      ],
    },

    // ── 3. Contact Information ───────────────────────────────────────────
    {
      id: "contato",
      titlePt: "Contact Information",
      questions: [
        {
          id: "home_address",
          labelPt: "Endereço residencial completo",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "home_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "home_country",
          labelPt: "País",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "phone",
          labelPt: "Telefone",
          type: "text",
          required: true,
        },
        {
          id: "email",
          labelPt: "E-mail",
          type: "text",
          required: true,
          prefillFrom: "email",
        },
        {
          id: "emergency_contact_name",
          labelPt: "Nome de um contato de emergência",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "emergency_contact_phone",
          labelPt: "Telefone do contato de emergência",
          type: "text",
          required: true,
        },
      ],
    },

    // ── 4. Travel Information ────────────────────────────────────────────
    {
      id: "viagem",
      titlePt: "Travel Information",
      questions: [
        {
          id: "purpose",
          labelPt: "Propósito da viagem",
          type: "radio",
          required: true,
          options: [
            { value: "tourism", labelPt: "Turismo/lazer", valueEn: "Pleasure/Visit" },
            { value: "business", labelPt: "Negócios", valueEn: "Business" },
            { value: "transit", labelPt: "Trânsito para outro país", valueEn: "Transit" },
          ],
        },
        {
          id: "arrival_date",
          labelPt: "Data prevista de chegada",
          type: "date",
          required: true,
        },
        {
          id: "us_address_street",
          labelPt: "Endereço nos EUA onde vai ficar — rua e número (hotel ou anfitrião)",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "us_address_city",
          labelPt: "Cidade",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "us_address_state",
          labelPt: "Estado americano (sigla)",
          type: "text",
          required: true,
          validate: { pattern: /^[A-Za-z]{2}$/, messagePt: "Use a sigla de 2 letras do estado (ex.: FL)." },
        },
        {
          id: "us_contact_name",
          labelPt: "Nome de um contato nos EUA (pessoa ou empresa), se houver",
          type: "text",
          passthroughEn: true,
        },
        {
          id: "us_contact_phone",
          labelPt: "Telefone desse contato",
          type: "text",
        },
        {
          id: "employer_school_name",
          labelPt: "Nome do seu empregador ou escola atual",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "employer_school_address",
          labelPt: "Endereço do empregador/escola",
          type: "text",
          passthroughEn: true,
        },
      ],
    },

    // ── 5. Eligibility Questions ──────────────────────────────────────────
    {
      id: "elegibilidade",
      titlePt: "Eligibility Questions",
      descriptionPt:
        "⚠️ Confira o texto exato de cada pergunta no site oficial antes de responder — o CBP pode ter " +
        "atualizado a redação. Qualquer \"Sim\" merece orientação profissional antes de aplicar.",
      questions: [
        {
          id: "elig_disease",
          labelPt: "Você tem alguma doença transmissível de relevância à saúde pública?",
          type: "radio",
          required: true,
          default: "no",
          options: YES_NO,
        },
        {
          id: "elig_arrest_moral",
          labelPt: "Você já foi preso(a) ou condenado(a) por um crime que causou dano grave a pessoa/propriedade, ou envolvendo drogas?",
          type: "radio",
          required: true,
          default: "no",
          options: YES_NO,
        },
        {
          id: "elig_two_convictions",
          labelPt: "Você já foi condenado(a) por dois ou mais crimes com pena somada de 5+ anos?",
          type: "radio",
          required: true,
          default: "no",
          options: YES_NO,
        },
        {
          id: "elig_drugs",
          labelPt: "Você já traficou substâncias controladas, ou é conhecido(a) por isso?",
          type: "radio",
          required: true,
          default: "no",
          options: YES_NO,
        },
        {
          id: "elig_prostitution",
          labelPt: "Você está vindo aos EUA para atividade ilegal de prostituição ou vício comercializado?",
          type: "radio",
          required: true,
          default: "no",
          options: YES_NO,
        },
        {
          id: "elig_security",
          labelPt: "Você já esteve envolvido(a) em espionagem, sabotagem, ou atividade terrorista?",
          type: "radio",
          required: true,
          default: "no",
          options: YES_NO,
        },
        {
          id: "elig_nazi",
          labelPt: "Entre 1933-1945, você esteve envolvido(a) em perseguição relacionada à Alemanha nazista?",
          type: "radio",
          required: true,
          default: "no",
          options: YES_NO,
        },
        {
          id: "elig_genocide",
          labelPt: "Você já esteve envolvido(a) em genocídio, tortura ou execução extrajudicial?",
          type: "radio",
          required: true,
          default: "no",
          options: YES_NO,
        },
        {
          id: "elig_misrepresentation",
          labelPt: "Você já tentou obter (ou ajudou alguém a obter) visto/entrada nos EUA por fraude ou informação falsa?",
          type: "radio",
          required: true,
          default: "no",
          options: YES_NO,
        },
        {
          id: "elig_unauthorized_work",
          labelPt: "Você está buscando emprego nos EUA sem autorização prévia?",
          type: "radio",
          required: true,
          default: "no",
          options: YES_NO,
        },
        {
          id: "elig_denied_visa",
          labelPt: "Seu visto americano já foi negado, cancelado, ou já tiveram sua entrada negada nos EUA?",
          type: "radio",
          required: true,
          default: "no",
          options: YES_NO,
        },
        {
          id: "elig_removal",
          labelPt: "Você já foi sujeito(a) a processo de deportação/remoção ou audiência de exclusão?",
          type: "radio",
          required: true,
          default: "no",
          options: YES_NO,
        },
        {
          id: "elig_overstay_vwp",
          labelPt: "Você já ultrapassou o prazo de uma entrada anterior pelo Visa Waiver Program?",
          type: "radio",
          required: true,
          default: "no",
          options: YES_NO,
        },
        {
          id: "elig_restricted_countries",
          labelPt: "Desde 1º/mar/2011 você esteve em Irã, Iraque, Líbia, Coreia do Norte, Somália, Sudão ou Síria (ou em Cuba desde 12/jan/2021)?",
          type: "radio",
          required: true,
          default: "no",
          options: YES_NO,
        },
      ],
    },
  ],
};
