/**
 * DS-160 — Online Nonimmigrant Visa Application (colinha).
 *
 * The DS-160 has no official fillable PDF — it's a Department of State web
 * form filled directly on ceac.state.gov, and USCIS/DOS never publish an
 * offline asset for it. `exportKind: "worksheet"`: instead of writing onto a
 * government PDF, this spec drives a bilingual cheat-sheet (see
 * lib/forms/fillWorksheet.ts) the applicant keeps open in a second tab while
 * typing answers into the real CEAC form themselves.
 *
 * Section order mirrors the DS-160's own screen sequence (Personal Info 1-2,
 * Travel Info, Travel Companions, Previous US Travel, Address and Phone,
 * Passport, US Contact, Family, Present Work/Education/Training) — the
 * applicant can jump straight to the matching screen on CEAC.
 *
 * Scope: DELIBERATELY EXCLUDES the Security and Background screens (5 parts,
 * ~40 yes/no questions on health, criminal history, and security grounds).
 * Unlike the I-485's Part 9 — verified item-by-item against the real PDF —
 * there is no canonical DS-160 asset to check field-by-field against, and
 * these questions are too consequential to answer from a worksheet the
 * applicant isn't looking at while on the CEAC site. The applicant answers
 * them directly, in the moment, on ceac.state.gov.
 *
 * Ministerial: transcribes and translates deterministically (valueEn),
 * never invents an answer or picks the visa category for the applicant.
 */

import type { FormSpec, Option } from "./types";

const PURPOSE_OPTIONS: Option[] = [
  { value: "b1b2", labelPt: "Turismo ou negócios (B-1/B-2)", valueEn: "TEMPORARY VISITOR FOR BUSINESS OR PLEASURE (B)" },
  { value: "f1", labelPt: "Estudante acadêmico (F-1)", valueEn: "STUDENT (F)" },
  { value: "m1", labelPt: "Estudante vocacional (M-1)", valueEn: "STUDENT (M)" },
  { value: "j1", labelPt: "Intercâmbio (J-1)", valueEn: "EXCHANGE VISITOR (J)" },
  { value: "h1b", labelPt: "Trabalho especializado (H-1B)", valueEn: "TEMPORARY WORKER (H)" },
  { value: "o1", labelPt: "Habilidade extraordinária (O-1)", valueEn: "TEMPORARY WORKER (O)" },
  { value: "l1", labelPt: "Transferência entre empresas (L-1)", valueEn: "INTRACOMPANY TRANSFEREE (L)" },
  { value: "k1", labelPt: "Noivo(a) de cidadão americano (K-1)", valueEn: "FIANCE(E) OR SPOUSE OF A USC (K)" },
];

export const DS160: FormSpec = {
  id: "ds-160",
  code: "DS-160",
  officialName: "Online Nonimmigrant Visa Application",
  namePt: "DS-160 — Pedido de Visto de Não-Imigrante",
  agency: "DOS",
  officialUrl: "https://ceac.state.gov/genniv",
  edition: "n/a", // online form, no printed edition to pin
  exportKind: "worksheet",
  attachTo: { vistoId: "b1", documentoId: "ds160" },
  disclaimerPt:
    "O DS-160 é preenchido por VOCÊ, diretamente no site do Departamento de Estado (ceac.state.gov) — " +
    "não existe PDF oficial para baixar. Esta colinha traduz suas respostas para o inglês na ordem das " +
    "telas do formulário; as perguntas de Segurança e Antecedentes (saúde, histórico criminal, questões de " +
    "segurança) não são cobertas aqui — responda-as direto no site, com atenção total. A Immigrei é uma " +
    "ferramenta de preparação — não presta serviços jurídicos e não revisa o mérito do seu caso.",

  sections: [
    // ── 1. Propósito da viagem ───────────────────────────────────────────
    {
      id: "proposito",
      titlePt: "Propósito da viagem",
      descriptionPt: "Define a categoria de visto (tela \"Travel Info\" do DS-160).",
      questions: [
        {
          id: "purpose",
          labelPt: "Categoria do visto que você está pedindo",
          type: "select",
          required: true,
          options: PURPOSE_OPTIONS,
        },
      ],
    },

    // ── 2. Personal Info 1 ────────────────────────────────────────────────
    {
      id: "personal1",
      titlePt: "Personal Information 1",
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
          labelPt: "Você já usou outro nome (nome de solteiro, apelido, nome religioso)?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não", valueEn: "No" },
            { value: "yes", labelPt: "Sim", valueEn: "Yes" },
          ],
        },
        {
          id: "other_names",
          labelPt: "Qual(is) outro(s) nome(s)?",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "has_other_names", equals: "yes" },
        },
        {
          id: "has_telecode",
          labelPt: "Seu nome tem representação em outro alfabeto/telecódigo (ex.: chinês)?",
          type: "radio",
          default: "no",
          options: [
            { value: "no", labelPt: "Não", valueEn: "No" },
            { value: "yes", labelPt: "Sim", valueEn: "Yes" },
          ],
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
          id: "marital_status",
          labelPt: "Estado civil",
          type: "select",
          required: true,
          options: [
            { value: "single", labelPt: "Solteiro(a)", valueEn: "Single" },
            { value: "married", labelPt: "Casado(a)", valueEn: "Married" },
            { value: "common_law", labelPt: "União estável", valueEn: "Common Law Marriage" },
            { value: "civil_union", labelPt: "União civil/parceria doméstica", valueEn: "Civil Union/Domestic Partnership" },
            { value: "divorced", labelPt: "Divorciado(a)", valueEn: "Divorced" },
            { value: "widowed", labelPt: "Viúvo(a)", valueEn: "Widowed" },
            { value: "separated", labelPt: "Separado(a) legalmente", valueEn: "Legally Separated" },
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
          id: "birth_state",
          labelPt: "Estado de nascimento",
          type: "text",
          passthroughEn: true,
        },
        {
          id: "birth_country",
          labelPt: "País de nascimento",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
        },
      ],
    },

    // ── 3. Personal Info 2 ────────────────────────────────────────────────
    {
      id: "personal2",
      titlePt: "Personal Information 2",
      questions: [
        {
          id: "nationality",
          labelPt: "Nacionalidade atual",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
        },
        {
          id: "has_other_nationality",
          labelPt: "Você tem outra nacionalidade além da atual?",
          type: "radio",
          default: "no",
          options: [
            { value: "no", labelPt: "Não", valueEn: "No" },
            { value: "yes", labelPt: "Sim", valueEn: "Yes" },
          ],
        },
        {
          id: "other_nationality",
          labelPt: "Qual outra nacionalidade?",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "has_other_nationality", equals: "yes" },
        },
        {
          id: "national_id",
          labelPt: "Número do CPF (National Identification Number)",
          type: "text",
        },
        {
          id: "has_us_ssn",
          labelPt: "Você tem Social Security Number (SSN) americano?",
          type: "radio",
          default: "no",
          options: [
            { value: "no", labelPt: "Não", valueEn: "No" },
            { value: "yes", labelPt: "Sim", valueEn: "Yes" },
          ],
        },
        {
          id: "us_ssn",
          labelPt: "Qual o SSN?",
          type: "text",
          showWhen: { questionId: "has_us_ssn", equals: "yes" },
        },
      ],
    },

    // ── 4. Travel Companions ──────────────────────────────────────────────
    {
      id: "acompanhantes",
      titlePt: "Travel Companions",
      questions: [
        {
          id: "traveling_with_others",
          labelPt: "Você vai viajar acompanhado(a)?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não", valueEn: "No" },
            { value: "yes", labelPt: "Sim", valueEn: "Yes" },
          ],
        },
        {
          id: "traveling_as_group",
          labelPt: "Você vai viajar como parte de um grupo/excursão?",
          type: "radio",
          showWhen: { questionId: "traveling_with_others", equals: "yes" },
          options: [
            { value: "no", labelPt: "Não, com pessoas específicas", valueEn: "No" },
            { value: "yes", labelPt: "Sim, com um grupo/excursão", valueEn: "Yes" },
          ],
        },
        {
          id: "companion_name",
          labelPt: "Nome do(s) acompanhante(s) (se não for grupo)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "traveling_as_group", equals: "no" },
        },
        {
          id: "companion_relationship",
          labelPt: "Relação com o(s) acompanhante(s) (ex.: spouse, child, friend)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "traveling_as_group", equals: "no" },
        },
      ],
    },

    // ── 5. Previous US Travel ─────────────────────────────────────────────
    {
      id: "viagens-anteriores",
      titlePt: "Previous U.S. Travel Information",
      questions: [
        {
          id: "been_to_us",
          labelPt: "Você já esteve nos EUA antes?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não", valueEn: "No" },
            { value: "yes", labelPt: "Sim", valueEn: "Yes" },
          ],
        },
        {
          id: "last_visit_date",
          labelPt: "Data da última visita",
          type: "date",
          showWhen: { questionId: "been_to_us", equals: "yes" },
        },
        {
          id: "last_visit_duration",
          labelPt: "Duração da última visita (ex.: \"2 weeks\", \"3 months\")",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "been_to_us", equals: "yes" },
        },
        {
          id: "has_us_driver_license",
          labelPt: "Você tem ou já teve carteira de motorista americana?",
          type: "radio",
          default: "no",
          options: [
            { value: "no", labelPt: "Não", valueEn: "No" },
            { value: "yes", labelPt: "Sim", valueEn: "Yes" },
          ],
        },
        {
          id: "has_us_visa",
          labelPt: "Você já teve um visto americano antes?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não", valueEn: "No" },
            { value: "yes", labelPt: "Sim", valueEn: "Yes" },
          ],
        },
        {
          id: "last_visa_date",
          labelPt: "Data de emissão do último visto",
          type: "date",
          showWhen: { questionId: "has_us_visa", equals: "yes" },
        },
        {
          id: "last_visa_number",
          labelPt: "Número do último visto (se souber)",
          type: "text",
          showWhen: { questionId: "has_us_visa", equals: "yes" },
        },
        {
          id: "visa_denied",
          labelPt: "Você já teve visto americano negado, ou pedido de entrada negado na fronteira?",
          type: "radio",
          required: true,
          default: "no",
          helpPt: "Responda com sinceridade — o DOS cruza essa informação com os próprios registros.",
          options: [
            { value: "no", labelPt: "Não", valueEn: "No" },
            { value: "yes", labelPt: "Sim", valueEn: "Yes" },
          ],
        },
      ],
    },

    // ── 6. Address and Phone ──────────────────────────────────────────────
    {
      id: "endereco-contato",
      titlePt: "Address and Phone Information",
      questions: [
        {
          id: "home_street",
          labelPt: "Endereço residencial — rua e número",
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
          id: "home_state",
          labelPt: "Estado",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "home_zip",
          labelPt: "CEP",
          type: "text",
          required: true,
        },
        {
          id: "mailing_same",
          labelPt: "Seu endereço de correspondência é o mesmo endereço residencial?",
          type: "radio",
          required: true,
          default: "yes",
          options: [
            { value: "yes", labelPt: "Sim", valueEn: "Yes" },
            { value: "no", labelPt: "Não", valueEn: "No" },
          ],
        },
        {
          id: "mailing_address",
          labelPt: "Endereço de correspondência (se diferente)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "mailing_same", equals: "no" },
        },
        {
          id: "phone_primary",
          labelPt: "Telefone principal",
          type: "text",
          required: true,
        },
        {
          id: "phone_secondary",
          labelPt: "Telefone secundário (opcional)",
          type: "text",
        },
        {
          id: "email",
          labelPt: "E-mail",
          type: "text",
          required: true,
          prefillFrom: "email",
        },
        {
          id: "social_media_platform",
          labelPt: "Rede social que você usa (Instagram, Facebook, X, etc.)",
          helpPt: "O DS-160 exige declarar identificadores de redes sociais dos últimos 5 anos — pelo menos uma é obrigatória.",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "social_media_handle",
          labelPt: "Seu usuário/identificador nessa rede",
          type: "text",
          required: true,
          passthroughEn: true,
        },
      ],
    },

    // ── 7. Passport Information ───────────────────────────────────────────
    {
      id: "passaporte",
      titlePt: "Passport Information",
      questions: [
        {
          id: "passport_type",
          labelPt: "Tipo de passaporte",
          type: "select",
          required: true,
          default: "regular",
          options: [
            { value: "regular", labelPt: "Comum", valueEn: "Regular" },
            { value: "official", labelPt: "Oficial", valueEn: "Official" },
            { value: "diplomatic", labelPt: "Diplomático", valueEn: "Diplomatic" },
          ],
        },
        {
          id: "passport_number",
          labelPt: "Número do passaporte",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "passport_book_number",
          labelPt: "Número do livro do passaporte (se houver, abaixo do número principal)",
          type: "text",
        },
        {
          id: "passport_issuing_country",
          labelPt: "País emissor",
          type: "text",
          required: true,
          passthroughEn: true,
          default: "Brazil",
        },
        {
          id: "passport_issued_city",
          labelPt: "Cidade de emissão",
          type: "text",
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
          type: "date",
          required: true,
        },
        {
          id: "passport_lost",
          labelPt: "Você já teve um passaporte perdido ou roubado?",
          type: "radio",
          default: "no",
          options: [
            { value: "no", labelPt: "Não", valueEn: "No" },
            { value: "yes", labelPt: "Sim", valueEn: "Yes" },
          ],
        },
      ],
    },

    // ── 8. U.S. Point of Contact ──────────────────────────────────────────
    {
      id: "contato-eua",
      titlePt: "U.S. Point of Contact",
      descriptionPt:
        "Para estudante (F-1/M-1), é a escola (DSO). Para turismo, é onde você vai ficar ou uma pessoa de contato. Para trabalho, costuma ser o empregador.",
      questions: [
        {
          id: "us_contact_name_or_org",
          labelPt: "Nome do contato ou organização nos EUA",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "us_contact_relationship",
          labelPt: "Relação com você (ex.: school, hotel, friend, employer)",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "us_contact_address",
          labelPt: "Endereço nos EUA",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "us_contact_phone",
          labelPt: "Telefone do contato",
          type: "text",
        },
        {
          id: "us_contact_email",
          labelPt: "E-mail do contato",
          type: "text",
        },
      ],
    },

    // ── 9. Family Information ─────────────────────────────────────────────
    {
      id: "familia",
      titlePt: "Family Information",
      questions: [
        {
          id: "father_name",
          labelPt: "Nome completo do pai",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "father_dob",
          labelPt: "Data de nascimento do pai (se souber)",
          type: "date",
        },
        {
          id: "father_in_us",
          labelPt: "Seu pai está nos EUA?",
          type: "radio",
          default: "no",
          options: [
            { value: "no", labelPt: "Não", valueEn: "No" },
            { value: "yes", labelPt: "Sim", valueEn: "Yes" },
          ],
        },
        {
          id: "mother_name",
          labelPt: "Nome completo da mãe",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "mother_dob",
          labelPt: "Data de nascimento da mãe (se souber)",
          type: "date",
        },
        {
          id: "mother_in_us",
          labelPt: "Sua mãe está nos EUA?",
          type: "radio",
          default: "no",
          options: [
            { value: "no", labelPt: "Não", valueEn: "No" },
            { value: "yes", labelPt: "Sim", valueEn: "Yes" },
          ],
        },
        {
          id: "has_other_relatives_in_us",
          labelPt: "Você tem outros parentes imediatos nos EUA (cônjuge, filhos, irmãos)?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não", valueEn: "No" },
            { value: "yes", labelPt: "Sim", valueEn: "Yes" },
          ],
        },
        {
          id: "other_relative_name",
          labelPt: "Nome desse(a) parente",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "has_other_relatives_in_us", equals: "yes" },
        },
        {
          id: "other_relative_relationship",
          labelPt: "Relação (ex.: spouse, son, daughter, brother, sister)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "has_other_relatives_in_us", equals: "yes" },
        },
        {
          id: "other_relative_status",
          labelPt: "Status migratório dessa pessoa (ex.: US Citizen, LPR, Nonimmigrant, Other/Don't Know)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "has_other_relatives_in_us", equals: "yes" },
        },
        {
          id: "is_married",
          labelPt: "Você é casado(a)?",
          type: "radio",
          required: true,
          default: "no",
          options: [
            { value: "no", labelPt: "Não", valueEn: "No" },
            { value: "yes", labelPt: "Sim", valueEn: "Yes" },
          ],
        },
        {
          id: "spouse_name",
          labelPt: "Nome completo do(a) cônjuge",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "is_married", equals: "yes" },
        },
        {
          id: "spouse_dob",
          labelPt: "Data de nascimento do(a) cônjuge",
          type: "date",
          showWhen: { questionId: "is_married", equals: "yes" },
        },
        {
          id: "spouse_nationality",
          labelPt: "Nacionalidade do(a) cônjuge",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "is_married", equals: "yes" },
        },
      ],
    },

    // ── 10. Present Work / Education / Training ───────────────────────────
    {
      id: "trabalho-educacao",
      titlePt: "Present Work/Education/Training Information",
      questions: [
        {
          id: "occupation",
          labelPt: "Sua ocupação atual",
          type: "select",
          required: true,
          options: [
            { value: "employed", labelPt: "Empregado(a)", valueEn: "Employed" },
            { value: "self_employed", labelPt: "Autônomo(a)", valueEn: "Self Employed" },
            { value: "student", labelPt: "Estudante", valueEn: "Student" },
            { value: "not_employed", labelPt: "Desempregado(a)", valueEn: "Not Employed" },
            { value: "retired", labelPt: "Aposentado(a)", valueEn: "Retired" },
            { value: "homemaker", labelPt: "Do lar", valueEn: "Homemaker" },
          ],
        },
        {
          id: "employer_school_name",
          labelPt: "Nome do empregador ou escola",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "occupation", equals: "employed" },
        },
        {
          id: "employer_address",
          labelPt: "Endereço do empregador/escola",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "occupation", equals: "employed" },
        },
        {
          id: "job_title",
          labelPt: "Cargo/função",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "occupation", equals: "employed" },
        },
        {
          id: "monthly_income",
          labelPt: "Renda mensal (moeda local)",
          type: "text",
          showWhen: { questionId: "occupation", equals: "employed" },
        },
        {
          id: "job_duties",
          labelPt: "Descreva brevemente suas funções (em inglês)",
          type: "text",
          passthroughEn: true,
          showWhen: { questionId: "occupation", equals: "employed" },
        },
        {
          id: "prior_employer_name",
          labelPt: "Você trabalhou em outro lugar nos últimos 5 anos? Se sim, nome do empregador anterior",
          type: "text",
          passthroughEn: true,
        },
        {
          id: "school_name",
          labelPt: "Nome da última escola/faculdade que você frequentou",
          type: "text",
          required: true,
          passthroughEn: true,
        },
        {
          id: "school_address",
          labelPt: "Endereço dessa escola/faculdade",
          type: "text",
          passthroughEn: true,
        },
        {
          id: "school_course",
          labelPt: "Curso (em inglês)",
          type: "text",
          passthroughEn: true,
        },
        {
          id: "school_dates",
          labelPt: "Datas de início e fim (ex.: \"Jan 2018 to Dec 2021\")",
          type: "text",
          passthroughEn: true,
        },
      ],
    },
  ],
};
