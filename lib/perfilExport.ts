/**
 * perfilExport — gera "Meu Perfil immigrei", um documento de apresentação
 * bilíngue (PT-BR/EN-US) a partir dos dados do questionário de /perfil.
 *
 * Segue o mesmo padrão de fillWorksheet.ts (PDF desenhado do zero, sem
 * template): uma carta de apresentação, não um currículo — não lista
 * histórico de emprego linha a linha, resume o perfil pra a pessoa levar
 * adiante (advogado, empresa, consultoria).
 *
 * Os campos abertos (bio_*, achievements) são transcritos exatamente como
 * a pessoa escreveu — nunca traduzidos automaticamente. Uma nota no
 * cabeçalho da versão EN avisa disso.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

export type Locale = "pt" | "en";

export interface PerfilExportData {
  full_name?:                   string | null;
  birth_date?:                  string | null;
  birth_country?:               string | null;
  birth_state?:                 string | null;
  birth_city?:                  string | null;
  lives_outside_brazil?:        boolean | null;
  residence_country?:           string | null;
  current_city?:                string | null;
  current_state?:               string | null;
  gender?:                      string | null;
  english_level?:               string | null;
  english_test_taken?:          boolean | null;
  english_test_name?:           string | null;
  english_test_score?:          string | null;
  education_level?:             string | null;
  profession?:                  string | null;
  experience_years?:            string | null;
  achievements?:                string | null;
  o1_criteria?:                 string[] | null;
  investor_capital_available?:  boolean | null;
  investor_capital_range?:      string | null;
  business_owner_experience?:   boolean | null;
  citizenship_country?:         string | null;
  has_other_citizenship?:       boolean | null;
  other_citizenship_country?:   string | null;
  l1_us_br_operations?:         boolean | null;
  l1_in_leadership_role?:       boolean | null;
  l1_leadership_years?:         string | null;
  bio_situation?:               string | null;
  bio_concern?:                 string | null;
  bio_tried?:                   string | null;
}

// ── Cores da marca (CLAUDE.md), convertidas de hex pra 0-1 ────────────────
const PINE      = rgb(0x1e / 255, 0x5e / 255, 0x4e / 255);
const INK       = rgb(0x1b / 255, 0x25 / 255, 0x20 / 255);
const INK_FAINT = rgb(0x8b / 255, 0x95 / 255, 0x8f / 255);
const AMBER     = rgb(0xe8 / 255, 0xa3 / 255, 0x3d / 255);

const PAGE_WIDTH = 612; // US Letter
const PAGE_HEIGHT = 792;
const MARGIN = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// ── Textos fixos e mapas de valor → rótulo, pt e en lado a lado ───────────

const T = {
  pt: {
    title: "Meu Perfil immigrei",
    generatedOn: (d: string) => `Gerado em ${d}`,
    disclaimer:
      "Este documento resume as informações que a pessoa forneceu no immigrei. " +
      "Não é aconselhamento jurídico, não avalia elegibilidade e não substitui " +
      "um profissional licenciado.",
    sectionBasics: "Dados básicos",
    sectionRecognition: "Reconhecimento e trajetória",
    sectionInvestor: "Investimento e negócio próprio",
    sectionL1: "Transferência dentro da empresa",
    sectionVoice: "Na voz da própria pessoa",
    name: "Nome", birthDate: "Data de nascimento", bornIn: "Nascido(a) em",
    livesIn: "Mora em", education: "Escolaridade", profession: "Profissão / área",
    experience: "Anos de experiência", english: "Inglês", test: "Teste", score: "Nota",
    criteriaNone: "Nenhum critério marcado até agora.",
    achievementsLabel: "Detalhes",
    citizenship: "Cidadania",
    capitalAvailable: "Capital disponível pra investir", capitalRange: "Faixa de valor",
    businessOwner: "Já é dono(a) ou sócio(a) de empresa", yes: "Sim", no: "Não",
    l1Operations: "Empresa com operação nos EUA e no outro país", l1Years: "Tempo em liderança/especialização",
    situation: "Como é a situação hoje", concern: "O que mais preocupa",
    tried: "O que já foi tentado",
    empty: "Não informado.",
  },
  en: {
    title: "My immigrei Profile",
    generatedOn: (d: string) => `Generated on ${d}`,
    disclaimer:
      "This document summarizes the information the person provided in immigrei. " +
      "It is not legal advice, does not assess eligibility for any visa category, " +
      "and does not replace a licensed professional.",
    sectionBasics: "Basic information",
    sectionRecognition: "Recognition and career highlights",
    sectionInvestor: "Investment and business ownership",
    sectionL1: "Intracompany transfer background",
    sectionVoice: "In the applicant's own words",
    name: "Name", birthDate: "Date of birth", bornIn: "Born in",
    livesIn: "Currently lives in", education: "Education level", profession: "Profession / field",
    experience: "Years of experience", english: "English", test: "Test", score: "Score",
    criteriaNone: "No criteria marked yet.",
    achievementsLabel: "Details",
    citizenship: "Citizenship",
    capitalAvailable: "Capital available to invest", capitalRange: "Amount range",
    businessOwner: "Already owns or co-owns a business", yes: "Yes", no: "No",
    l1Operations: "Employer operates in both the US and the other country", l1Years: "Time in leadership/specialized role",
    situation: "Current situation", concern: "Main concern",
    tried: "What's already been tried",
    empty: "Not provided.",
  },
} as const;

// Nota exibida só na versão EN, avisando que texto livre não foi traduzido.
const EN_ORIGINAL_LANGUAGE_NOTE =
  "Quoted answers below are shown exactly as written by the applicant, in whichever language they used (usually Portuguese) — not machine-translated.";

const GENDER: Record<string, { pt: string; en: string }> = {
  feminino: { pt: "Feminino", en: "Female" },
  masculino: { pt: "Masculino", en: "Male" },
  nao_binario: { pt: "Não-binário", en: "Non-binary" },
  prefiro_nao_dizer: { pt: "Prefiro não dizer", en: "Prefers not to say" },
};

const ENGLISH_LEVEL: Record<string, { pt: string; en: string }> = {
  basico: { pt: "Básico", en: "Basic" },
  intermediario: { pt: "Intermediário", en: "Intermediate" },
  avancado: { pt: "Avançado", en: "Advanced" },
  fluente: { pt: "Fluente ou nativo", en: "Fluent or native" },
};

const EDUCATION_LEVEL: Record<string, { pt: string; en: string }> = {
  ensino_medio: { pt: "Ensino médio", en: "High school" },
  graduacao_andamento: { pt: "Graduação em andamento", en: "Bachelor's in progress" },
  graduacao_completa: { pt: "Graduação completa", en: "Bachelor's degree" },
  pos_graduacao: { pt: "Pós-graduação", en: "Postgraduate certificate" },
  mestrado: { pt: "Mestrado", en: "Master's degree" },
  doutorado: { pt: "Doutorado", en: "Doctorate" },
};

const EXPERIENCE_YEARS: Record<string, { pt: string; en: string }> = {
  "0-2": { pt: "0-2 anos", en: "0-2 years" },
  "3-5": { pt: "3-5 anos", en: "3-5 years" },
  "6-10": { pt: "6-10 anos", en: "6-10 years" },
  "10+": { pt: "10+ anos", en: "10+ years" },
};

const INVESTOR_RANGE: Record<string, { pt: string; en: string }> = {
  menos_50k: { pt: "Menos de US$50k", en: "Less than US$50k" },
  "50k_100k": { pt: "US$50k–100k", en: "US$50k–100k" },
  "100k_500k": { pt: "US$100k–500k", en: "US$100k–500k" },
  "500k_mais": { pt: "US$500k+", en: "US$500k+" },
};

const L1_YEARS: Record<string, { pt: string; en: string }> = {
  menos_1: { pt: "Menos de 1 ano", en: "Less than 1 year" },
  "1_3": { pt: "1 a 3 anos", en: "1 to 3 years" },
  "3_mais": { pt: "3+ anos", en: "3+ years" },
};

// Critérios de habilidade extraordinária — 8 CFR §214.2(o)(3). Texto
// factual: descreve o critério, nunca "você se qualifica".
const O1_CRITERIA: Record<string, { pt: string; en: string }> = {
  premio: { pt: "Prêmio ou reconhecimento nacional/internacional na área", en: "Nationally or internationally recognized award in the field" },
  associacao: { pt: "Membro de associação que exige feito de destaque", en: "Membership in an association requiring outstanding achievement" },
  midia: { pt: "Matéria publicada sobre a pessoa em mídia especializada", en: "Published material about the person in professional/major media" },
  julgamento: { pt: "Já julgou ou avaliou o trabalho de outros profissionais", en: "Has judged the work of other professionals" },
  contribuicao_original: { pt: "Contribuição original de peso significativo na área", en: "Original contribution of major significance to the field" },
  publicacao: { pt: "Autoria de artigo acadêmico ou em veículo de peso", en: "Authorship of scholarly articles in the field" },
  papel_critico: { pt: "Papel crítico numa organização de reputação distinta", en: "Critical or essential role for a distinguished organization" },
  salario_alto: { pt: "Remuneração alta em comparação a outros da área", en: "High salary relative to others in the field" },
};

function formatDate(dateStr: string | null | undefined, locale: Locale): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString(locale === "pt" ? "pt-BR" : "en-US", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function generatePerfilPdf(data: PerfilExportData, locale: Locale): Promise<Uint8Array> {
  const t = T[locale];
  const pdf = await PDFDocument.create();
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function newPage() {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  }

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN) newPage();
  }

  function drawWrapped(text: string, font: PDFFont, size: number, color = INK, lineGap = 4) {
    const lines = wrapText(text, font, size, CONTENT_WIDTH);
    for (const line of lines) {
      ensureSpace(size + lineGap);
      page.drawText(line, { x: MARGIN, y, size, font, color });
      y -= size + lineGap;
    }
  }

  function sectionTitle(title: string) {
    ensureSpace(34);
    y -= 8;
    page.drawLine({
      start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.75, color: AMBER,
    });
    y -= 18;
    drawWrapped(title, bold, 13, PINE);
    y -= 2;
  }

  function fieldLine(label: string, value: string) {
    if (!value) return;
    ensureSpace(30);
    drawWrapped(label, regular, 9, INK_FAINT, 2);
    drawWrapped(value, bold, 11, INK);
    y -= 6;
  }

  // ── Capa ──────────────────────────────────────────────────────────────
  drawWrapped(t.title, bold, 22, PINE);
  y -= 2;
  drawWrapped(t.generatedOn(formatDate(new Date().toISOString().slice(0, 10), locale)), regular, 10, INK_FAINT);
  y -= 10;
  drawWrapped(t.disclaimer, italic, 9, INK_FAINT);
  if (locale === "en") {
    y -= 4;
    drawWrapped(EN_ORIGINAL_LANGUAGE_NOTE, italic, 9, INK_FAINT);
  }
  y -= 6;

  // ── Dados básicos ─────────────────────────────────────────────────────
  sectionTitle(t.sectionBasics);
  fieldLine(t.name, data.full_name ?? "");
  fieldLine(t.birthDate, formatDate(data.birth_date, locale));
  fieldLine(t.bornIn, [data.birth_city, data.birth_state, data.birth_country].filter(Boolean).join(", "));
  fieldLine(
    t.livesIn,
    [data.current_city, data.current_state, data.lives_outside_brazil ? data.residence_country : null]
      .filter(Boolean)
      .join(", "),
  );
  fieldLine(t.education, data.education_level ? EDUCATION_LEVEL[data.education_level]?.[locale] ?? "" : "");
  fieldLine(t.profession, data.profession ?? "");
  fieldLine(t.experience, data.experience_years ? EXPERIENCE_YEARS[data.experience_years]?.[locale] ?? "" : "");
  {
    const level = data.english_level ? ENGLISH_LEVEL[data.english_level]?.[locale] : "";
    const testBits = data.english_test_taken && data.english_test_name
      ? ` — ${t.test}: ${data.english_test_name}${data.english_test_score ? ` (${t.score}: ${data.english_test_score})` : ""}`
      : "";
    fieldLine(t.english, level ? `${level}${testBits}` : "");
  }

  // ── Reconhecimento e trajetória ───────────────────────────────────────
  const criterios = (data.o1_criteria ?? []).map((c) => O1_CRITERIA[c]?.[locale]).filter(Boolean) as string[];
  if (criterios.length > 0 || data.achievements) {
    sectionTitle(t.sectionRecognition);
    if (criterios.length > 0) {
      for (const c of criterios) drawWrapped(`•  ${c}`, regular, 10.5, INK, 3);
      y -= 4;
    }
    if (data.achievements) fieldLine(t.achievementsLabel, data.achievements);
  }

  // ── Investidor ────────────────────────────────────────────────────────
  if (data.investor_capital_available || data.business_owner_experience) {
    sectionTitle(t.sectionInvestor);
    fieldLine(
      t.citizenship,
      data.has_other_citizenship && data.other_citizenship_country
        ? `${data.citizenship_country ?? ""} + ${data.other_citizenship_country}`.trim()
        : data.citizenship_country ?? "",
    );
    fieldLine(t.capitalAvailable, data.investor_capital_available ? t.yes : t.no);
    if (data.investor_capital_available && data.investor_capital_range) {
      fieldLine(t.capitalRange, INVESTOR_RANGE[data.investor_capital_range]?.[locale] ?? "");
    }
    fieldLine(t.businessOwner, data.business_owner_experience ? t.yes : t.no);
  }

  // ── L-1 ───────────────────────────────────────────────────────────────
  if (data.l1_us_br_operations) {
    sectionTitle(t.sectionL1);
    const otherCountry = data.lives_outside_brazil && data.residence_country ? data.residence_country : "Brasil";
    fieldLine(t.l1Operations, `${t.yes} (EUA + ${otherCountry})`);
    if (data.l1_leadership_years) {
      fieldLine(t.l1Years, L1_YEARS[data.l1_leadership_years]?.[locale] ?? "");
    }
  }

  // ── Na voz da própria pessoa ──────────────────────────────────────────
  if (data.bio_situation || data.bio_concern || data.bio_tried) {
    sectionTitle(t.sectionVoice);
    if (data.bio_situation) { drawWrapped(t.situation, regular, 9, INK_FAINT, 2); drawWrapped(`"${data.bio_situation}"`, italic, 11, INK); y -= 8; }
    if (data.bio_concern) { drawWrapped(t.concern, regular, 9, INK_FAINT, 2); drawWrapped(`"${data.bio_concern}"`, italic, 11, INK); y -= 8; }
    if (data.bio_tried) { drawWrapped(t.tried, regular, 9, INK_FAINT, 2); drawWrapped(`"${data.bio_tried}"`, italic, 11, INK); y -= 8; }
  }

  return pdf.save();
}

// Rótulo de gênero exportado à parte — não entra no PDF hoje (é dado
// sensível demais pra uma carta de apresentação), mas fica disponível
// caso um dia façam sentido incluir sob consentimento explícito.
export { GENDER };
