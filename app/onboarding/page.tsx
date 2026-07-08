"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

// ─── Types ────────────────────────────────────────────────────────────────────

type Answers = Record<string, string>;

type VisaResult = {
  visa: string;
  forms: string;
  description: string;
  priority: "high" | "medium" | "low";
  urgent?: boolean;
  blocked?: boolean; // nationality restriction
  href?: string;     // deep link to the product surface (kit, manual, case engine)
};

type Option = {
  value: string;
  label: string;
  icon: string;
  subtitle?: string;
};

type Question = {
  id: string;
  text: string;
  subtitle?: string;
  options: Option[];
  next: string | ((answer: string, allAnswers: Answers) => string);
};

// ─── Question Tree ────────────────────────────────────────────────────────────

const questionMap: Record<string, Question> = {

  // ── 1. Entry point ───────────────────────────────────────────────────────
  q_location: {
    id: "q_location",
    text: "Onde você está agora?",
    subtitle:
      "O caminho muda completamente: de dentro dos EUA, o processo é mudança de status (USCIS); de fora, é pelo consulado.",
    options: [
      { value: "in_us", label: "Estou nos EUA", icon: "🇺🇸" },
      { value: "outside", label: "Estou fora dos EUA", icon: "🌍" },
    ],
    next: (a) => (a === "in_us" ? "q_current_status" : "q_goal"),
  },

  // ── Nationality (asked only in visit/business branches — E-1/E-2, ESTA) ──
  q_nationality: {
    id: "q_nationality",
    text: "Qual é a sua cidadania?",
    subtitle:
      "Perguntamos aqui porque este caminho muda com a cidadania: países com tratado têm acesso a isenção de visto e aos vistos E-1/E-2.",
    options: [
      { value: "brazilian", label: "Brasileira", icon: "🇧🇷" },
      {
        value: "treaty",
        label: "Europeu ou país com tratado com os EUA",
        icon: "🇪🇺",
        subtitle: "Alemanha, França, Portugal, Espanha, Itália, Reino Unido e outros",
      },
      { value: "other", label: "Outra cidadania", icon: "🌐" },
    ],
    next: () => "results",
  },

  // ── Branch: OUTSIDE the US ───────────────────────────────────────────────
  q_goal: {
    id: "q_goal",
    text: "Qual é o seu principal objetivo nos EUA?",
    options: [
      { value: "visit",    label: "Visitar ou turismo",          icon: "✈️" },
      { value: "study",    label: "Estudar",                     icon: "🎓" },
      { value: "work",     label: "Trabalhar",                   icon: "💼" },
      { value: "business", label: "Fazer negócios / empreender", icon: "🚀" },
      { value: "live",     label: "Morar permanentemente",       icon: "🏡" },
      { value: "family",   label: "Reunir com família",          icon: "👨‍👩‍👧" },
    ],
    next: (a) => {
      if (a === "visit")    return "q_nationality";
      if (a === "study")    return "q_study_type";
      if (a === "work")     return "q_work_type";
      if (a === "business") return "q_business_type";
      if (a === "live")     return "q_family_ties";
      return "q_family_ties"; // family
    },
  },

  // ── Study sub-branch ──────────────────────────────────────────────────────
  q_study_type: {
    id: "q_study_type",
    text: "Qual tipo de curso você pretende fazer?",
    options: [
      { value: "university", label: "Graduação ou pós-graduação em universidade", icon: "🏛️" },
      { value: "language",   label: "Curso de idiomas",                           icon: "🗣️" },
      { value: "vocational", label: "Curso técnico / vocacional",                 icon: "🔧" },
      { value: "exchange",   label: "Intercâmbio, pesquisa ou programa cultural", icon: "🔄" },
    ],
    next: () => "results",
  },

  // ── Work sub-branch ───────────────────────────────────────────────────────
  q_work_type: {
    id: "q_work_type",
    text: "Como será seu vínculo de trabalho?",
    options: [
      { value: "employer_offer", label: "Tenho oferta de emprego de empresa americana",             icon: "🤝" },
      { value: "intracompany",   label: "Sou transferido pela minha empresa para os EUA",           icon: "🏢" },
      { value: "extraordinary",  label: "Sou reconhecido na minha área (artista, atleta, cientista)", icon: "⭐" },
      { value: "self",           label: "Sou autônomo / freelancer / sem oferta ainda",             icon: "🧑‍💻" },
    ],
    next: (a) => a === "employer_offer" ? "q_education" : "results",
  },

  q_education: {
    id: "q_education",
    text: "Qual é o seu nível de escolaridade?",
    options: [
      { value: "high_school",      label: "Ensino médio ou técnico",          icon: "📚" },
      { value: "bachelor_ongoing", label: "Graduação em andamento",           icon: "📝" },
      { value: "bachelor",         label: "Graduação concluída",              icon: "🎓" },
      { value: "postgrad",         label: "Pós-graduação (mestrado ou doutorado)", icon: "🔬" },
    ],
    next: () => "results",
  },

  // ── Business sub-branch ───────────────────────────────────────────────────
  q_business_type: {
    id: "q_business_type",
    text: "Qual é o seu tipo de atuação empresarial?",
    options: [
      {
        value: "invest_operate",
        label: "Quero investir e operar um negócio nos EUA",
        icon: "💰",
        subtitle: "Abertura de empresa, capital em risco",
      },
      {
        value: "invest_permanent",
        label: "Quero investir e obter residência permanente",
        icon: "🏠",
        subtitle: "A partir de $800k — caminho para Green Card",
      },
      {
        value: "trade",
        label: "Tenho empresa que comercializa com os EUA",
        icon: "📦",
        subtitle: "Exportação, importação, serviços",
      },
      {
        value: "meetings",
        label: "Preciso fazer reuniões, negociações ou visitar clientes",
        icon: "🤝",
        subtitle: "Sem trabalhar ou receber salário americano",
      },
    ],
    next: () => "q_nationality",
  },

  // ── Family ties ───────────────────────────────────────────────────────────
  q_family_ties: {
    id: "q_family_ties",
    text: "Você tem vínculos com cidadãos americanos ou titulares de Green Card?",
    options: [
      { value: "spouse_citizen",      label: "Cônjuge ou noivo/a cidadão americano",     icon: "💍" },
      { value: "parent_child_citizen",label: "Filho/pais cidadãos americanos",            icon: "👨‍👩‍👧" },
      { value: "family_gc",           label: "Familiar próximo com Green Card",           icon: "🟢" },
      { value: "none",                label: "Não tenho vínculos familiares",             icon: "❌" },
    ],
    next: (a) => a === "none" ? "q_permanent_path" : "results",
  },

  q_permanent_path: {
    id: "q_permanent_path",
    text: "Como você pretende buscar residência permanente?",
    options: [
      { value: "work_gc",  label: "Por meio de emprego / patrocinador", icon: "💼" },
      { value: "merit",    label: "Por mérito ou habilidade extraordinária", icon: "⭐" },
      { value: "asylum",   label: "Tenho fundado temor de perseguição (asilo)", icon: "🛡️" },
      { value: "lottery",  label: "Loteria de vistos (DV Lottery)", icon: "🎲" },
    ],
    next: () => "results",
  },

  // ── Branch: INSIDE the US ─────────────────────────────────────────────────
  // Ancorada no I-94, não no visto: visto válido + I-94 vencido = irregular
  // (content/leis/conceitos/status-vs-visto.md). "Não sei" existe porque a
  // maioria nunca conferiu o próprio I-94.
  q_current_status: {
    id: "q_current_status",
    text: "Como está o prazo da sua permanência (I-94)?",
    subtitle:
      "O prazo que vale é o do I-94 — o registro de entrada —, não a validade do visto no passaporte. Sua resposta é confidencial e serve só para mostrar seus caminhos.",
    options: [
      {
        value: "in_status",
        label: "Estou dentro do prazo do meu I-94",
        icon: "✅",
        subtitle: "Para estudantes F-1, o I-94 costuma dizer \"D/S\"",
      },
      {
        value: "pending_uscis",
        label: "Tenho pedido pendente no USCIS",
        icon: "⏳",
        subtitle: "Extensão ou mudança de status protocolada, aguardando resposta",
      },
      {
        value: "unsure",
        label: "Não sei / nunca conferi meu I-94",
        icon: "🔎",
        subtitle: "É grátis e leva 2 minutos — vamos te mostrar onde",
      },
      { value: "green_card", label: "Tenho Green Card",      icon: "🟢" },
      { value: "citizen",    label: "Sou cidadão americano", icon: "🇺🇸" },
      {
        value: "overstay",
        label: "Passei do prazo do meu I-94 (overstay)",
        icon: "⚠️",
        subtitle:
          "Existem regras específicas para essa situação — mostramos o que consta em fontes oficiais e onde buscar ajuda",
      },
    ],
    next: (a) => {
      if (a === "in_status" || a === "pending_uscis") return "q_current_visa";
      if (a === "unsure")      return "results"; // conferir o I-94 vem antes de qualquer rota
      if (a === "overstay")    return "results";
      if (a === "green_card")  return "q_gc_goal";
      return "q_citizen_goal"; // citizen
    },
  },

  // ── Citizen sub-branch ────────────────────────────────────────────────────
  q_citizen_goal: {
    id: "q_citizen_goal",
    text: "O que você deseja fazer?",
    options: [
      { value: "petition_family", label: "Peticionar familiar para vir aos EUA",    icon: "👨‍👩‍👧" },
      { value: "naturalization",  label: "Entender direitos e benefícios da cidadania", icon: "🇺🇸" },
      { value: "renounce",        label: "Outras questões de cidadania",             icon: "📄" },
    ],
    next: (a) => a === "petition_family" ? "q_family_ties" : "results",
  },

  // ── Has visa in the US ────────────────────────────────────────────────────
  q_current_visa: {
    id: "q_current_visa",
    text: "Em qual categoria você está hoje?",
    subtitle:
      "A do seu I-94 ou da última aprovação do USCIS — pode ser diferente do visto carimbado no passaporte.",
    options: [
      { value: "b1b2", label: "B-1/B-2 — Turismo / Negócios", icon: "🛂" },
      { value: "f1",   label: "F-1 — Estudante acadêmico",    icon: "🎓" },
      { value: "j1",   label: "J-1 — Intercâmbio",            icon: "🔄" },
      { value: "h1b",  label: "H-1B — Trabalho especializado", icon: "🏢" },
      { value: "l1",   label: "L-1 — Transferência intraempresarial", icon: "🌐" },
      { value: "m1",   label: "M-1 — Estudante vocacional / técnico",  icon: "🔧" },
      { value: "o1",   label: "O-1 — Habilidade extraordinária",       icon: "⭐" },
      {
        value: "dependent",
        label: "Dependente — F-2, H-4, L-2 ou J-2",
        icon: "👪",
      },
      {
        value: "esta_vwp",
        label: "Entrei sem visto (ESTA / Visa Waiver)",
        icon: "🛬",
        subtitle: "Passaporte europeu ou de país do VWP",
      },
      { value: "other",label: "Outra categoria",              icon: "📄" },
    ],
    // ESTA/VWP não permite extensão nem mudança de status por dentro
    // (8 CFR §248) — direto aos resultados com a regra, sem oferecer
    // jornadas impossíveis.
    next: (a) => (a === "esta_vwp" ? "results" : "q_change_goal"),
  },

  q_change_goal: {
    id: "q_change_goal",
    text: "O que você deseja fazer agora?",
    options: [
      { value: "extend",       label: "Estender ou renovar meu visto atual",         icon: "📅" },
      { value: "change_status",label: "Mudar para outro tipo de visto",              icon: "🔄" },
      { value: "green_card",   label: "Solicitar Green Card",                       icon: "🟢" },
      { value: "family",       label: "Trazer ou legalizar minha família",          icon: "👨‍👩‍👧" },
      { value: "work_change",  label: "Mudar de empregador ou área de trabalho",    icon: "💼" },
    ],
    next: (a) => {
      if (a === "change_status") return "q_target_visa";
      if (a === "green_card")    return "q_gc_path";
      if (a === "family")        return "q_family_ties";
      return "q_process"; // extend, work_change → ask about ongoing process before results
    },
  },

  q_target_visa: {
    id: "q_target_visa",
    text: "Para qual tipo de visto você quer mudar?",
    options: [
      { value: "f1",   label: "F-1 — Estudante acadêmico",           icon: "🎓" },
      { value: "m1",   label: "M-1 — Estudante vocacional / técnico", icon: "🔧" },
      { value: "j1",   label: "J-1 — Intercâmbio",                   icon: "🔄" },
      { value: "h1b",  label: "H-1B — Trabalho especializado",        icon: "🏢" },
      { value: "o1",   label: "O-1 — Habilidade extraordinária",      icon: "⭐" },
      { value: "other",label: "Outro / Não tenho certeza",            icon: "🤔" },
    ],
    next: () => "q_process",
  },

  q_gc_path: {
    id: "q_gc_path",
    text: "Qual é o seu caminho para o Green Card?",
    options: [
      { value: "employer", label: "Por patrocínio de empregador",           icon: "🏢" },
      { value: "family",   label: "Por vínculo familiar com cidadão / GC", icon: "👨‍👩‍👧" },
      { value: "merit",    label: "Por mérito (EB-1, EB-2 NIW)",           icon: "⭐" },
      { value: "unsure",   label: "Não tenho certeza",                     icon: "🤔" },
    ],
    next: (a) => a === "family" ? "q_family_ties" : "q_process",
  },

  // ── Green Card holder ─────────────────────────────────────────────────────
  q_gc_goal: {
    id: "q_gc_goal",
    text: "O que você deseja fazer?",
    options: [
      { value: "renew",          label: "Renovar meu Green Card",                          icon: "🔄" },
      { value: "naturalization", label: "Solicitar naturalização (cidadania)",             icon: "🇺🇸" },
      { value: "family",         label: "Trazer ou peticionar familiar",                  icon: "👨‍👩‍👧" },
      { value: "reentry",        label: "Solicitar permissão de reentrada (Reentry Permit)", icon: "✈️" },
    ],
    next: (a) => a === "family" ? "q_family_ties" : "q_process",
  },

  // ── Process check (last question before results for in-US paths) ──────────
  q_process: {
    id: "q_process",
    text: "Você tem algum processo aberto no USCIS atualmente?",
    subtitle: "Isso nos ajuda a entender se há prazos ou pendências que afetam seu caminho.",
    options: [
      {
        value: "yes",
        label: "Sim, tenho um processo em andamento",
        icon: "📋",
        subtitle: "Você verá onde buscar o número do processo no próximo passo",
      },
      { value: "no",    label: "Não, nenhum processo aberto", icon: "❌" },
      { value: "unsure",label: "Não sei / não tenho certeza", icon: "🤔" },
    ],
    next: () => "results",
  },
};

// ─── Recommendation Engine ────────────────────────────────────────────────────

// Kits existentes em /documentos/[vistoId] — anexados por prefixo do nome.
const KIT_BY_PREFIX: Array<[RegExp, string]> = [
  [/^F-1/, "f1"], [/^M-1/, "m1"], [/^J-1/, "j1"], [/^H-1B/, "h1b"],
  [/^O-1/, "o1"], [/^L-1/, "l1"], [/^EB-2/, "eb2niw"], [/^B-1/, "b1"],
  [/^E-2 /, "e2"], [/^E-2$/, "e2"],
];

export function attachKitLinks(results: VisaResult[]): VisaResult[] {
  return results.map((r) => {
    if (r.href || r.blocked) return r;
    const hit = KIT_BY_PREFIX.find(([re]) => re.test(r.visa));
    return hit ? { ...r, href: `/documentos/${hit[1]}` } : r;
  });
}

function getRecommendations(answers: Answers): VisaResult[] {
  return attachKitLinks(computeRecommendations(answers));
}

// ─── Focus derivation for /vistos ─────────────────────────────────────────────

// Ids dos cards do catálogo em /vistos. A vitrine destaca estes caminhos
// ("Recomendados para você") e rebaixa os demais — nunca os esconde: todo
// perfil mantém as rotas paralelas visíveis.
const CATALOG_IDS = new Set([
  "f1", "m1", "j1", "h1b", "o1", "l1", "b1", "e2", "e1", "eb2niw",
]);

export function deriveFocusIds(a: Answers, results: VisaResult[]): string[] {
  const ids = new Set<string>();
  const add = (id?: string | null) => {
    if (id && CATALOG_IDS.has(id)) ids.add(id);
  };

  // 1. Kits já anexados às recomendações apontam direto para o catálogo.
  for (const r of results) {
    if (r.blocked || !r.href) continue;
    const m = r.href.match(/^\/documentos\/(\w+)$/);
    if (m) add(m[1]);
  }

  // 2. Âncoras vindas das respostas — cobrem extensões e manuais de caminho,
  //    cujos títulos não carregam kit próprio.
  const visaToCard: Record<string, string> = {
    b1b2: "b1", f1: "f1", j1: "j1", h1b: "h1b", l1: "l1", m1: "m1", o1: "o1",
  };
  if (a.q_change_goal === "extend" || a.q_change_goal === "work_change")
    add(visaToCard[a.q_current_visa]);
  if (a.q_target_visa) add(visaToCard[a.q_target_visa]);
  if (a.q_study_type === "university" || a.q_study_type === "language") add("f1");
  if (a.q_study_type === "vocational") add("m1");
  if (a.q_study_type === "exchange") add("j1");
  if (a.q_goal === "visit") add("b1");

  return [...ids];
}

export function computeRecommendations(answers: Answers): VisaResult[] {
  const results: VisaResult[] = [];
  const a = answers;

  const nationality    = a.q_nationality;         // "brazilian" | "treaty" | "other"
  // Cidadania agora só é perguntada nos ramos onde decide algo (turismo/
  // negócios de fora). Quando não coletada, assume o público-alvo (BR) —
  // direção conservadora: mostra os avisos brasileiros, nunca os esconde.
  const isBrazilian    = nationality !== "treaty" && nationality !== "other";
  const isTreaty       = nationality === "treaty";
  const inUs           = a.q_location === "in_us";
  const goal           = a.q_goal;
  const studyType      = a.q_study_type;
  const workType       = a.q_work_type;
  const education      = a.q_education;
  const businessType   = a.q_business_type;
  const familyTies     = a.q_family_ties;
  const currentStatus  = a.q_current_status;
  const currentVisa    = a.q_current_visa;
  const changeGoal     = a.q_change_goal;
  const targetVisa     = a.q_target_visa;
  const gcGoal         = a.q_gc_goal;
  const gcPath         = a.q_gc_path;
  const permanentPath  = a.q_permanent_path;
  const citizenGoal    = a.q_citizen_goal;

  // ── "Não sei meu I-94" — primeiro passo factual, antes de qualquer rota ──
  if (currentStatus === "unsure") {
    results.push({
      visa: "🔎 Primeiro passo: confira seu I-94 (grátis, 2 min)",
      forms: "i94.cbp.dhs.gov → \"Get Most Recent I-94\"",
      description:
        "A data que define sua permanência é a do I-94 — o registro oficial de entrada —, não a do visto no passaporte. Consulte com passaporte em mãos no site oficial do CBP. Depois, refaça este mapa (leva 2 minutos): todos os caminhos dependem dessa data.",
      priority: "high",
      urgent: true,
    });
    return results;
  }

  // ── ESTA / Visa Waiver dentro dos EUA — regra dura, sem COS/extensão ─────
  if (currentVisa === "esta_vwp") {
    results.push({
      visa: "⚠️ Entrada por ESTA/VWP: sem extensão ou mudança de status",
      forms: "8 CFR §248 — regra federal",
      description:
        "Quem entra pelo Visa Waiver aceita não estender a estadia (máx. 90 dias) nem mudar de status por dentro dos EUA. O caminho padrão é sair e aplicar o visto no consulado. Exceção estreita: ajuste por parente imediato de cidadão americano — análise jurídica individual.",
      priority: "high",
      urgent: true,
    });
    results.push({
      visa: "Planeje o próximo passo do lado de fora",
      forms: "DS-160 no consulado (F-1, trabalho etc.)",
      description:
        "Se o objetivo é estudar ou trabalhar, o processo consular a partir do seu país costuma ser o caminho — o Immigrei mostra as etapas de cada visto para você preparar tudo antes de sair.",
      priority: "medium",
    });
    return results;
  }

  // ── Pedido pendente no USCIS → acompanhamento automático ─────────────────
  if (currentStatus === "pending_uscis") {
    results.push({
      visa: "📡 Acompanhe seu pedido automaticamente",
      forms: "Número de recibo do USCIS (ex.: IOE0123456789)",
      description:
        "Crie sua conta e conecte o número de recibo: o Immigrei consulta o USCIS por você e avisa por e-mail a cada mudança no caso. Os caminhos abaixo consideram o pedido em andamento.",
      priority: "high",
    });
  }

  // ── Overstay alert ───────────────────────────────────────────────────────
  if (currentStatus === "overstay") {
    results.push({
      visa: "⚠️ Antes de qualquer decisão: entenda as barras de 3/10 anos",
      forms: "INA §212(a)(9)(B) — unlawful presence",
      description:
        "Mais de 180 dias além do prazo geram barra de reentrada de 3 anos; mais de 365 dias, de 10 anos. As barras só disparam NA SAÍDA dos EUA — por isso, decisões de viagem são críticas e nenhuma deve ser tomada sem análise individual.",
      priority: "high",
      urgent: true,
    });
    results.push({
      visa: "Ajuste de status por parente imediato (se aplicável)",
      forms: "I-130 + I-485",
      description:
        "Quem entrou nos EUA com inspeção e é cônjuge, pai/mãe ou filho(a) de cidadão americano pode, em muitos casos, ajustar o status por dentro — sem sair e sem acionar as barras (INA §245(a)). A elegibilidade é uma análise jurídica individual.",
      priority: "high",
    });
    results.push({
      visa: "Perdão por dificuldade extrema (waiver)",
      forms: "I-601 / I-601A",
      description:
        "Existe perdão para a barra de reentrada quando a ausência causaria dificuldade extrema a cônjuge ou pai/mãe cidadão ou residente. É um dos processos mais técnicos que existem — sempre com advogado.",
      priority: "medium",
    });
    results.push({
      visa: "🤝 Análise individual com profissional verificado",
      forms: "Consulta com advogado de imigração licenciado",
      description:
        "Overstay tem saídas — mas quais valem para você depende de fatos do seu caso (data de entrada, forma de entrada, vínculos familiares). O Immigrei conecta você a profissionais verificados; até lá, evite viagens e novos protocolos por conta própria.",
      priority: "high",
      urgent: true,
    });
    return results;
  }

  // ── Citizen ──────────────────────────────────────────────────────────────
  if (currentStatus === "citizen") {
    if (citizenGoal === "petition_family" || familyTies === "spouse_citizen") {
      results.push({
        visa: "Petição de familiar — parentes imediatos e categorias com fila",
        forms: "I-130 (familiar) ou I-129F (noivo/a — K-1)",
        description:
          "Parentes imediatos (cônjuge, pais, filhos solteiros menores de 21) não têm fila. Filhos 21+ ou casados (F1/F3) e irmãos (F4) entram em filas que variam de anos a décadas — confira no visa bulletin. Noivo(a) no exterior: K-1 via I-129F.",
        priority: "high",
      });
    } else {
      results.push({
        visa: "Você é cidadão americano 🇺🇸",
        forms: "N/A",
        description:
          "Como cidadão, você tem plenos direitos nos EUA. Podemos ajudar com petição de familiares, passaporte americano e outras questões.",
        priority: "high",
      });
    }
    return results;
  }

  // ── Green Card holder ────────────────────────────────────────────────────
  if (currentStatus === "green_card") {
    if (gcGoal === "renew") {
      results.push({
        visa: "Renovação do Green Card (10 anos)",
        forms: "I-90",
        description:
          "Para o cartão de 10 anos vencido ou a vencer em até 6 meses. Atenção: se o seu Green Card é o CONDICIONAL de 2 anos (por casamento), o caminho é outro — I-751 (remoção de condições), protocolado nos 90 dias antes do vencimento, nunca o I-90.",
        priority: "high",
      });
    }
    if (gcGoal === "naturalization") {
      results.push({
        visa: "Naturalização (Cidadania Americana)",
        forms: "N-400",
        description:
          "Regra geral: 5 anos como residente permanente — ou 3 anos se casado(a) e vivendo com cidadão americano. Também contam residência contínua, presença física e inglês/cívica. Dá para protocolar até 90 dias antes de completar o prazo.",
        priority: "high",
      });
    }
    if (gcGoal === "family" || familyTies !== "none") {
      results.push({
        visa: "Petição de familiar — F2A / F2B",
        forms: "I-130",
        description:
          "Residentes permanentes peticionam cônjuge e filhos solteiros: menores de 21 na categoria F2A (fila frequentemente curta ou zerada — confira no visa bulletin, que o Immigrei acompanha) e 21+ na F2B (fila mais longa).",
        priority: "medium",
      });
    }
    if (gcGoal === "reentry") {
      results.push({
        visa: "Reentry Permit",
        forms: "I-131",
        description:
          "Protege o Green Card em ausências de até 2 anos. Regra de ouro: o I-131 precisa ser protocolado ANTES de sair dos EUA (e a biometria é feita aqui) — não dá para pedir de fora.",
        priority: "medium",
      });
    }
    return results;
  }

  // ── ESTA / Turismo (treaty, fora dos EUA, visitar) ───────────────────────
  if (!inUs && isTreaty && goal === "visit") {
    results.push({
      visa: "ESTA (Autorização de Viagem Eletrônica)",
      forms: "Solicitação online em esta.cbp.dhs.gov",
      description:
        "Com passaporte elegível ao Visa Waiver Program, você pode visitar os EUA por até 90 dias sem precisar de visto.",
      priority: "high",
    });
    return results;
  }

  // ── Turismo para brasileiro ───────────────────────────────────────────────
  if (!inUs && goal === "visit") {
    results.push({
      visa: "B-1/B-2 (Turismo e Negócios)",
      forms: "DS-160 + Entrevista consular",
      description:
        "Para visitas de turismo, negócios, tratamento médico ou visita a familiares nos EUA.",
      priority: "high",
    });
    return results;
  }

  // ── Estudos ──────────────────────────────────────────────────────────────
  if (goal === "study" || studyType || targetVisa === "f1" || targetVisa === "m1" || targetVisa === "j1") {
    const isChangeOfStatus =
      inUs && changeGoal === "change_status" && targetVisa === "f1";

    if (isChangeOfStatus && currentVisa === "m1") {
      // 8 CFR 214.2(m): M-1 -> F-1 por dentro é vedado sem exceção — a rota
      // real é consular. Nunca oferecer I-539 aqui.
      results.push({
        visa: "M-1 → F-1 só pelo consulado (guia passo a passo)",
        forms: "Saída programada + DS-160 + novo I-20 F-1",
        description:
          "A lei veda a mudança M-1 → F-1 dentro dos EUA, sem exceção. O caminho existente é aplicar o F-1 pelo consulado — temos o manual completo dessa rota, com ordem certa das etapas.",
        priority: "high",
        urgent: true,
        href: "/caminhos/m1-para-f1-consulado",
      });
    } else if (isChangeOfStatus && currentVisa === "j1") {
      results.push({
        visa: "J-1 → F-1 (guia passo a passo)",
        forms: "Verificar regra dos 2 anos + I-539 ou rota consular",
        description:
          "Antes de tudo: confira no seu DS-2019 se a regra dos 2 anos (212(e)) se aplica — ela muda o caminho inteiro. Nosso manual cobre as duas rotas a partir daí.",
        priority: "high",
        href: "/caminhos/j1-para-f1",
      });
    } else if (isChangeOfStatus) {
      results.push({
        visa: "I-539 — Mudança de Status para F-1",
        forms: "I-539 (protocolar antes do prazo do I-94 vencer)",
        description:
          currentVisa === "b1b2"
            ? "Mudança de status para F-1 dentro dos EUA. Nosso validador confere os requisitos técnicos do seu caso (I-94, I-20, taxa SEVIS) antes de você gastar com o protocolo."
            : "Mudança de status para F-1 dentro dos EUA. Urgente se o prazo do I-94 está próximo de vencer.",
        priority: "high",
        urgent: true,
        href: currentVisa === "b1b2" ? "/casos/cos-b2-f1" : "/documentos/f1",
      });
    } else if (studyType === "vocational" || targetVisa === "m1") {
      results.push({
        visa: "M-1 (Estudante Vocacional / Técnico)",
        forms: "DS-160 + I-20 (emitido pela escola M)",
        description:
          "Para cursos técnicos, vocacionais e profissionalizantes em instituições credenciadas pelo SEVP.",
        priority: "high",
      });
    } else if (studyType === "exchange" || targetVisa === "j1") {
      results.push({
        visa: "J-1 (Intercâmbio e Pesquisa)",
        forms: "DS-160 + DS-2019 (emitido pelo programa patrocinador)",
        description:
          "Para intercâmbio acadêmico, pesquisa, programas culturais e trabalho temporário patrocinados.",
        priority: "high",
      });
    } else {
      results.push({
        visa: "F-1 (Estudante Acadêmico)",
        forms: "DS-160 + I-20 (emitido pela universidade ou escola de idiomas)",
        description:
          "Para estudantes em universidades, colleges e cursos de idiomas. Permite cursos híbridos (presencial + online) e trabalho via OPT/CPT.",
        priority: "high",
      });
      if (studyType === "language") {
        results.push({
          visa: "J-1 (Intercâmbio — alternativa para idiomas)",
          forms: "DS-160 + DS-2019",
          description:
            "Alguns programas de idiomas são patrocinados como J-1. Verifique com sua escola.",
          priority: "medium",
        });
      }
    }
  }

  // ── Pares de caminho com manual próprio (dentro dos EUA) ─────────────────
  if (inUs && currentVisa === "f1" && (targetVisa === "h1b" || changeGoal === "work_change")) {
    results.push({
      visa: "F-1 → H-1B (guia passo a passo)",
      forms: "OPT/CPT + I-129 (H) pelo empregador + sorteio",
      description:
        "A escada clássica pós-estudos: janelas de datas do OPT, cap-gap e o sorteio de março explicados em ordem, com o que preparar em cada etapa.",
      priority: "high",
      href: "/caminhos/f1-para-h1b",
    });
  }
  if (inUs && currentVisa === "h1b" && changeGoal === "work_change") {
    results.push({
      visa: "Transferência de H-1B (guia passo a passo)",
      forms: "I-129 (H) pelo novo empregador — sem novo sorteio",
      description:
        "Mudar de empregador mantendo o H-1B: quando você pode começar no novo emprego, portabilidade e os riscos de gap.",
      priority: "high",
      href: "/caminhos/h1b-transferencia",
    });
  }
  if (inUs && currentVisa === "o1" && changeGoal === "green_card") {
    results.push({
      visa: "O-1 → Green Card por autopetição (guia passo a passo)",
      forms: "I-140 (EB-2 NIW ou EB-1A) + I-485",
      description:
        "Quem sustenta um O-1 costuma ter o perfil das categorias de autopetição — sem depender de empregador. O manual mostra a ponte.",
      priority: "high",
      href: "/caminhos/o1-autopeticao-greencard",
    });
  }

  // ── Trabalho ─────────────────────────────────────────────────────────────
  if (goal === "work" || workType || targetVisa === "h1b" || targetVisa === "o1") {
    if (workType === "intracompany" || targetVisa === "l1") {
      results.push({
        visa: "L-1 (Transferência Intraempresarial)",
        forms: "I-129 (L)",
        description:
          "Para profissionais transferidos por empresa multinacional para filial, subsidiária ou afiliada nos EUA. Sem sorteio. Caminho natural para o EB-1C (Green Card executivo).",
        priority: "high",
      });
    }
    if (workType === "extraordinary" || targetVisa === "o1") {
      results.push({
        visa: "O-1 (Habilidade Extraordinária)",
        forms: "I-129 (O)",
        description:
          "Para artistas, atletas, cientistas ou profissionais com reconhecimento excepcional. Sem sorteio, sem cap.",
        priority: "high",
      });
    }
    if (
      workType === "employer_offer" &&
      (education === "bachelor" || education === "postgrad")
    ) {
      results.push({
        visa: "H-1B (Trabalho Especializado)",
        forms: "I-129 (H) — sujeito a sorteio anual (85k vagas/ano)",
        description:
          "Para profissionais com graduação em área de especialidade e oferta de emprego americano. O sorteio acontece em março com início em outubro.",
        priority: "high",
      });
    }
    if (workType === "employer_offer" && education === "postgrad") {
      results.push({
        visa: "EB-2 NIW (Green Card por Interesse Nacional)",
        forms: "I-140 + I-485 (ou processo consular)",
        description:
          "Pós-graduados podem solicitar Green Card sem patrocinador se o trabalho beneficia os EUA. Brasileiros entram na fila 'Rest of World'.",
        priority: "medium",
      });
    }
    if (
      workType === "employer_offer" &&
      (education === "high_school" || education === "bachelor_ongoing")
    ) {
      results.push({
        visa: "F-1 (Estudante Acadêmico) — caminho recomendado",
        forms: "DS-160 + I-20 (emitido pela universidade ou escola de idiomas)",
        description:
          "O H-1B exige graduação completa na área da vaga. Enquanto isso, o F-1 permite estudar nos EUA e trabalhar via OPT/CPT — o caminho mais comum até o visto de trabalho.",
        priority: "high",
      });
    }
    if (workType === "self") {
      results.push({
        visa: "O-1 (Habilidade Extraordinária)",
        forms: "I-129 (O) — via agente ou empregador americano",
        description:
          "Sem oferta de emprego, o O-1 é uma porta real para quem tem portfólio e reconhecimento na área — inclusive autônomos, com petição via agente.",
        priority: "high",
      });
      results.push({
        visa: "EB-2 NIW (Green Card por Interesse Nacional)",
        forms: "I-140 + I-485 (ou processo consular)",
        description:
          "Auto-petição: não exige patrocinador nem oferta de emprego. Para quem tem formação sólida e trabalho que beneficia os EUA.",
        priority: "medium",
      });
    }
    // COS para H-1B dentro dos EUA — este ramo não pergunta escolaridade,
    // então o requisito de graduação vai explícito na descrição.
    if (inUs && targetVisa === "h1b") {
      results.push({
        visa: "H-1B via Mudança de Status",
        forms: "I-129 (H) com pedido de COS — protocolado pelo empregador",
        description:
          "Para mudar para H-1B sem sair dos EUA, você precisa de empregador patrocinador e graduação completa na área. O sorteio anual (março) também se aplica.",
        priority: "high",
      });
    }
  }

  // ── Negócios / Investimento ───────────────────────────────────────────────
  if (goal === "business" || businessType) {

    // Reuniões e negociações — B-1 para todos
    if (businessType === "meetings") {
      results.push({
        visa: "B-1 (Visitante de Negócios)",
        forms: "DS-160 + Entrevista consular",
        description:
          "Para reuniões, contratos, negociações, conferências e visitas comerciais. Não autoriza trabalho remunerado nem receber salário americano. Temporário — não é visto de investimento.",
        priority: "high",
      });
      if (isTreaty) {
        results.push({
          visa: "ESTA (para cidadãos de países do VWP)",
          forms: "Solicitação online em esta.cbp.dhs.gov",
          description:
            "Com passaporte elegível ao ESTA, você pode fazer negócios nos EUA por até 90 dias sem visto. Mais ágil que o B-1.",
          priority: "medium",
        });
      }
    }

    // Investir e operar — E-2 (apenas treaty) ou EB-5
    if (businessType === "invest_operate") {
      if (isTreaty) {
        results.push({
          visa: "E-2 (Investidor por Tratado)",
          forms: "DS-160 + Aplicação consular",
          description:
            "Para quem investe capital substancial (a partir de ~$100k) em negócio próprio nos EUA. Disponível para cidadãos de países com tratado — inclui a maioria dos países europeus.",
          priority: "high",
        });
      } else {
        // Brazilian or other — E-2 not available
        results.push({
          visa: "E-2 (Investidor por Tratado) — Indisponível",
          forms: "N/A",
          description:
            "O Brasil não possui tratado de comércio e navegação com os EUA. O visto E-2 não está disponível para cidadãos brasileiros.",
          priority: "high",
          blocked: true,
        });
        results.push({
          visa: "EB-5 (Green Card por Investimento)",
          forms: "I-526E + I-485 (ou processo consular)",
          description:
            "Alternativa ao E-2 para brasileiros: investimento de $800k a $1.05M em projeto aprovado nos EUA, com caminho direto para residência permanente (Green Card).",
          priority: "high",
        });
        results.push({
          visa: "L-1 (Transferência Intraempresarial)",
          forms: "I-129 (L)",
          description:
            "Se você tem empresa no Brasil, pode abrir uma filial nos EUA e transferir-se como executivo ou especialista. Caminho viável sem o E-2.",
          priority: "medium",
        });
      }
    }

    // Comércio — E-1 (apenas treaty)
    if (businessType === "trade") {
      if (isTreaty) {
        results.push({
          visa: "E-1 (Comércio por Tratado)",
          forms: "DS-160 + Documentação comercial",
          description:
            "Para empresários com volume substancial de comércio de bens, serviços ou tecnologia entre o país de origem e os EUA. Mais de 50% do comércio deve ser bilateral.",
          priority: "high",
        });
      } else {
        results.push({
          visa: "E-1 (Comércio por Tratado) — Indisponível",
          forms: "N/A",
          description:
            "O Brasil não possui tratado de comércio que permita o E-1. Cidadãos brasileiros não têm acesso a este visto.",
          priority: "high",
          blocked: true,
        });
        results.push({
          visa: "B-1 (Visitante de Negócios)",
          forms: "DS-160 + Entrevista consular",
          description:
            "Brasileiros com comércio com os EUA podem usar o B-1 para reuniões, negociações e visitas comerciais. Não autoriza trabalho ou recebimento de salário americano.",
          priority: "medium",
        });
        results.push({
          visa: "L-1 (Transferência Intraempresarial)",
          forms: "I-129 (L)",
          description:
            "Se sua empresa tem ou pode ter presença nos EUA, o L-1 permite a transferência para gerir as operações americanas.",
          priority: "medium",
        });
      }
    }

    // Investimento com residência permanente — EB-5 para todos
    if (businessType === "invest_permanent") {
      results.push({
        visa: "EB-5 (Green Card por Investimento)",
        forms: "I-526E + I-485 (ajuste) ou NVC (consular)",
        description:
          "Investimento de $800k (em área de alto desemprego ou projeto regional) a $1.05M em negócio que crie pelo menos 10 empregos americanos. Caminho direto para o Green Card — disponível para brasileiros.",
        priority: "high",
      });
    }
  }

  // ── Família ──────────────────────────────────────────────────────────────
  if (familyTies === "spouse_citizen") {
    results.push({
      visa: "K-1 (Noivo/a) ou IR-1/CR-1 (Cônjuge Casado)",
      forms: "I-129F (K-1) ou I-130 + DS-260 (IR-1/CR-1)",
      description:
        "Noivos podem entrar com K-1 e casar nos EUA em até 90 dias. Cônjuges já casados usam IR-1 ou CR-1 pelo consulado. Parentes imediatos de cidadão americano não entram em fila.",
      priority: "high",
    });
  }
  if (familyTies === "parent_child_citizen") {
    results.push({
      visa: "IR-1 / IR-2 (Parente Imediato de Cidadão)",
      forms: "I-130 + DS-260",
      description:
        "Filhos, pais e cônjuges de cidadãos americanos têm prioridade máxima e não entram em fila de espera. Processo mais rápido.",
      priority: "high",
    });
  }
  if (familyTies === "family_gc") {
    results.push({
      visa: "F-2 (Familiar de Residente Permanente)",
      forms: "I-130",
      description:
        "Cônjuge e filhos solteiros de titulares de Green Card podem ser peticionados. Há fila de espera que varia por país e categoria.",
      priority: "medium",
    });
  }

  // ── Extensão dentro dos EUA ───────────────────────────────────────────────
  if (inUs && changeGoal === "extend") {
    const visaLabels: Record<string, string> = {
      b1b2: "B-1/B-2", f1: "F-1", j1: "J-1", h1b: "H-1B", l1: "L-1",
      dependent: "dependente (F-2/H-4/L-2/J-2)",
    };
    results.push({
      visa:
        currentVisa && visaLabels[currentVisa]
          ? `Extensão de ${visaLabels[currentVisa]}`
          : "Extensão do visto atual",
      forms:
        currentVisa === "f1" || currentVisa === "j1"
          ? "Contato com DSO / Sponsor da instituição"
          : "I-539 ou I-129 (conforme visto)",
      description:
        "Para estender sua permanência legítima nos EUA antes do vencimento. Protocole antes da data de expiração.",
      priority: "high",
    });
  }

  // ── Mudança de empregador dentro dos EUA ──────────────────────────────────
  if (inUs && changeGoal === "work_change") {
    if (currentVisa === "h1b") {
      results.push({
        visa: "Transferência de H-1B (novo empregador)",
        forms: "I-129 (H) — o novo empregador protocola",
        description:
          "O H-1B é portátil: o novo empregador protocola a petição e você pode começar assim que o USCIS receber o caso, sem novo sorteio.",
        priority: "high",
      });
    } else {
      results.push({
        visa: "H-1B (Trabalho Especializado)",
        forms: "I-129 (H) — protocolado pelo novo empregador",
        description:
          "Para trabalhar para um novo empregador americano, o caminho mais comum é o H-1B com patrocínio da nova empresa — sujeito ao sorteio anual.",
        priority: "high",
      });
      results.push({
        visa: "O-1 (Habilidade Extraordinária)",
        forms: "I-129 (O)",
        description:
          "Se você tem reconhecimento sólido na sua área, o O-1 dispensa sorteio e aceita petição via agente ou empregador.",
        priority: "medium",
      });
    }
  }

  // ── Mudança de status sem destino definido ────────────────────────────────
  if (inUs && changeGoal === "change_status" && targetVisa === "other") {
    results.push({
      visa: "Vamos encontrar seu caminho juntos",
      forms: "Explore os vistos disponíveis na próxima tela",
      description:
        "Seu caso pede um olhar mais próximo. Na próxima tela você compara os vistos disponíveis — e, se quiser, conectamos você a um profissional verificado.",
      priority: "medium",
    });
  }

  // ── Green Card paths ──────────────────────────────────────────────────────
  if (goal === "live" || permanentPath || gcPath) {
    if (gcPath === "employer" || permanentPath === "work_gc") {
      results.push({
        visa: "Green Card por Patrocínio (EB-2 / EB-3)",
        forms: "PERM + I-140 + I-485 (ou processo consular)",
        description:
          "O empregador conduz a certificação trabalhista (PERM) e a petição. É o caminho mais comum para o Green Card por emprego.",
        priority: "high",
      });
      results.push({
        visa: "EB-2 NIW (Green Card por Interesse Nacional)",
        forms: "I-140 + I-485 (ou NVC consular)",
        description:
          "Alternativa sem depender do empregador: auto-petição para quem tem formação sólida e trabalho que beneficia os EUA.",
        priority: "medium",
      });
    }
    if (gcPath === "unsure") {
      results.push({
        visa: "EB-2 NIW (Green Card por Interesse Nacional)",
        forms: "I-140 + I-485 (ou NVC consular)",
        description:
          "Auto-petição sem patrocinador — costuma ser o primeiro caminho a avaliar para quem tem pós-graduação ou experiência sólida.",
        priority: "high",
      });
      results.push({
        visa: "Green Card por Patrocínio (EB-2 / EB-3)",
        forms: "PERM + I-140 + I-485",
        description:
          "Se o seu empregador topar patrocinar, a empresa conduz o processo de certificação e petição.",
        priority: "medium",
      });
    }
    if (permanentPath === "merit" || gcPath === "merit") {
      results.push({
        visa: "EB-1 (Green Card por Habilidade Extraordinária)",
        forms: "I-140",
        description:
          "Para profissionais de destaque internacional — pesquisadores, executivos multinacionais, artistas de renome. Não requer patrocinador.",
        priority: "high",
      });
      results.push({
        visa: "EB-2 NIW (Green Card por Interesse Nacional)",
        forms: "I-140 + I-485 (ou NVC consular)",
        description:
          "Para pós-graduados cujo trabalho beneficia os EUA. Dispensa patrocinador. Brasileiros entram na fila 'Rest of World'.",
        priority: "high",
      });
    }
    if (permanentPath === "asylum") {
      results.push({
        visa: "Asilo Político",
        forms: "I-589 (se nos EUA) ou solicitação consular",
        description:
          "Para quem tem fundado temor de perseguição por raça, religião, nacionalidade ou grupo social.",
        priority: "high",
      });
    }
    if (permanentPath === "lottery") {
      results.push({
        visa: "DV Lottery (Diversity Visa Program)",
        forms: "Inscrição online em dvlottery.state.gov (anual — outubro a novembro)",
        description: isBrazilian
          ? "Atenção: o Brasil foi excluído do DV Lottery nos últimos anos por ter enviado muitos imigrantes. Verifique a elegibilidade no ano corrente."
          : "Programa de loteria anual do governo americano para países com baixa imigração para os EUA.",
        priority: isBrazilian ? "low" : "medium",
        urgent: isBrazilian,
      });
    }
  }

  // ── Process in progress note ─────────────────────────────────────────────
  if (a.q_process === "yes") {
    results.push({
      visa: "📋 Processo em andamento detectado",
      forms: "USCIS Case Status: egov.uscis.gov/casestatus",
      description:
        "Com um número de recibo (Receipt Number) do USCIS, você pode acompanhar seu caso em tempo real. O Immigrei vai conectar isso ao seu perfil.",
      priority: "medium",
    });
  }

  // ── Dedup + sort ─────────────────────────────────────────────────────────
  const seen = new Set<string>();
  const order = { high: 0, medium: 1, low: 2 };
  return results
    .filter((r) => {
      if (seen.has(r.visa)) return false;
      seen.add(r.visa);
      return true;
    })
    .sort((a, b) => order[a.priority] - order[b.priority]);
}

// ─── Derive profile fields from answers ───────────────────────────────────────

// Maps the question-tree answers to the profiles.main_goal values used by
// the dashboard (GOAL_LABELS).
export function deriveMainGoal(a: Answers): string {
  // Cidadão americano: não está buscando a cidadania — já a tem.
  if (a.q_citizen_goal === "petition_family") return "trazer_familia";
  if (a.q_citizen_goal) return "entender_direitos";
  if (a.q_change_goal === "extend") return "renovar_visto";
  if (a.q_change_goal === "green_card" || a.q_gc_path) return "green_card";
  if (a.q_change_goal === "family" || a.q_goal === "family") return "trazer_familia";
  if (a.q_change_goal === "change_status" || a.q_change_goal === "work_change") return "regularizar_status";
  if (a.q_gc_goal === "naturalization") return "cidadania";
  if (a.q_gc_goal === "renew") return "renovar_visto";
  if (a.q_gc_goal === "family" || a.q_family_ties && a.q_family_ties !== "none") return "trazer_familia";
  if (a.q_current_status === "overstay") return "regularizar_status";
  if (a.q_goal === "live" || a.q_permanent_path) return "green_card";
  // In-US study/work/business = mudança de status (guidance no dashboard);
  // primeiro pedido a partir do exterior continua "outro".
  if (a.q_goal === "study" || a.q_goal === "work" || a.q_goal === "business")
    return a.q_location === "in_us" ? "regularizar_status" : "outro";
  if (a.q_goal === "visit") return "outro";
  return "outro";
}

// ─── Build question sequence (for progress bar) ──────────────────────────────

function buildSequence(answers: Answers): string[] {
  const seq: string[] = ["q_location"];
  let current = "q_location";
  while (current !== "results") {
    const q = questionMap[current];
    if (!q) break;
    const answer = answers[current];
    if (!answer) break;
    const nextId =
      typeof q.next === "function" ? q.next(answer, answers) : q.next;
    if (nextId === "results" || !questionMap[nextId]) break;
    seq.push(nextId);
    current = nextId;
  }
  return seq;
}

// ─── UI Component ─────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [phase, setPhase] = useState<"welcome" | "questions" | "results">("welcome");
  const [answers, setAnswers] = useState<Answers>({});
  const [history, setHistory] = useState<string[]>(["q_location"]);
  const [animating, setAnimating] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // After the sign-up round-trip, finish the save the user started on /vistos
  // while logged out. The selection was stashed in localStorage; now that the
  // user is authenticated we can persist it and go straight to the dashboard,
  // without making them redo the questionnaire.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const pending = localStorage.getItem("immigrei_pending_profile");
    if (!pending) return;

    setResuming(true);
    (async () => {
      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: pending,
        });
        if (res.ok) {
          localStorage.removeItem("immigrei_pending_profile");
          router.replace("/dashboard");
          return;
        }
      } catch {
        // fall through to the questionnaire on failure
      }
      localStorage.removeItem("immigrei_pending_profile");
      setResuming(false);
    })();
  }, [isLoaded, isSignedIn, router]);

  const currentQuestionId = history[history.length - 1];
  const currentQuestion   = questionMap[currentQuestionId];
  const currentAnswer     = answers[currentQuestionId];

  const sequence      = buildSequence(answers);
  const estimatedTotal = Math.max(sequence.length + 2, history.length + 1);
  const progress      = (history.length / estimatedTotal) * 100;

  function selectAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestionId]: value }));
  }

  function goNext() {
    if (!currentAnswer || !currentQuestion) return;
    const nextId =
      typeof currentQuestion.next === "function"
        ? currentQuestion.next(currentAnswer, {
            ...answers,
            [currentQuestionId]: currentAnswer,
          })
        : currentQuestion.next;

    setAnimating(true);
    setTimeout(() => {
      if (nextId === "results") {
        setPhase("results");
      } else {
        setHistory((h) => [...h, nextId]);
      }
      setAnimating(false);
    }, 180);
  }

  function goBack() {
    if (history.length <= 1) {
      setPhase("welcome");
      return;
    }
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestionId];
      return next;
    });
    setHistory((h) => h.slice(0, -1));
  }

  // Residentes permanentes e cidadãos não escolhem visto na vitrine — a
  // jornada deles já está definida. Salvamos o perfil direto e vamos ao
  // painel; sem login, o mesmo stash de /vistos sobrevive ao sign-up.
  async function saveProfileAndGoToDashboard(visaType: "green_card" | "citizen") {
    if (savingProfile) return;
    setSavingProfile(true);
    setSaveError(null);
    const payload = {
      visa_type: visaType,
      main_goal: deriveMainGoal(answers),
      location: "eua",
    };
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        localStorage.setItem("immigrei_pending_profile", JSON.stringify(payload));
        router.push("/sign-up");
        return;
      }
      if (!res.ok) throw new Error("save_failed");
      router.push("/dashboard");
    } catch {
      setSaveError("Não conseguimos salvar agora. Tente novamente.");
      setSavingProfile(false);
    }
  }

  const recommendations = getRecommendations(answers);

  const priorityLabel: Record<string, string> = {
    high: "Alta prioridade",
    medium: "Recomendado",
    low: "Possível",
  };
  const priorityStyle: Record<string, string> = {
    high:   "bg-amber-tint text-amber-deep border border-amber/40",
    medium: "bg-pine-tint text-pine border border-pine-tint",
    low:    "bg-cream-2 text-ink-faint border border-pine-tint",
  };

  // ── Resuming save after sign-up ───────────────────────────────────────────
  if (resuming) {
    return (
      <main className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-pine-tint border-t-pine animate-spin mb-6" />
        <p className="text-ink-soft" style={{ fontFamily: "var(--font-body)" }}>
          Finalizando seu cadastro…
        </p>
      </main>
    );
  }

  // ── Welcome ───────────────────────────────────────────────────────────────
  if (phase === "welcome") {
    return (
      <main className="min-h-screen bg-cream flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-lg mx-auto w-full">
          <div className="w-16 h-16 rounded-full bg-pine-tint flex items-center justify-center mb-8">
            <span className="text-3xl">🌿</span>
          </div>
          <p
            className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-4"
            style={{ fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
          >
            Bem-vindo à Immigrei
          </p>
          <h1
            className="text-4xl md:text-5xl font-semibold text-ink mb-6 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sua jornada começa com clareza.
          </h1>
          <p
            className="text-ink-soft text-lg leading-relaxed mb-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Responda algumas perguntas e vamos identificar{" "}
            <span className="text-pine font-semibold">
              o caminho de imigração mais adequado para você
            </span>{" "}
            — sem jargão jurídico, sem enrolação.
          </p>
          <p className="text-ink-faint text-sm mb-10">Leva menos de 2 minutos.</p>
          <button
            onClick={() => setPhase("questions")}
            className="w-full max-w-xs bg-pine text-cream-2 font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-200 hover:bg-pine-deep active:scale-95 shadow-sm"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Começar →
          </button>
        </div>
      </main>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────
  if (phase === "results") {
    const hasUrgent  = recommendations.some((r) => r.urgent && !r.blocked);
    const hasBlocked = recommendations.some((r) => r.blocked);

    return (
      <main className="min-h-screen bg-cream flex flex-col pb-10">
        <div className="max-w-lg mx-auto w-full px-6 py-10 flex flex-col gap-6">

          {/* Header */}
          <div className="text-center pt-4">
            <div className="w-14 h-14 rounded-full bg-pine-tint flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🗺️</span>
            </div>
            <p
              className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-2"
              style={{ fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
            >
              Seu perfil migratório
            </p>
            <h1
              className="text-3xl font-semibold text-ink mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Encontramos seu caminho.
            </h1>
            <p className="text-ink-soft" style={{ fontFamily: "var(--font-body)" }}>
              Com base no seu perfil, estes são os caminhos mais relevantes para você:
            </p>
          </div>

          {/* Urgent alert */}
          {hasUrgent && (
            <div className="bg-clay/10 border border-clay rounded-2xl p-4 flex gap-3">
              <span className="text-xl flex-shrink-0">⚠️</span>
              <p
                className="text-clay text-sm font-medium leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <strong>Atenção:</strong> Identificamos situações que requerem
                cuidado especial. Recomendamos consulta com advogado de imigração
                antes de qualquer ação.
              </p>
            </div>
          )}

          {/* Blocked nationality note */}
          {hasBlocked && (
            <div className="bg-amber-tint border border-amber/40 rounded-2xl p-4 flex gap-3">
              <span className="text-xl flex-shrink-0">🔒</span>
              <p
                className="text-amber-deep text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Alguns vistos abaixo não estão disponíveis para a sua cidadania.
                Indicamos as melhores alternativas para o seu perfil.
              </p>
            </div>
          )}

          {/* Results list */}
          {recommendations.length === 0 ? (
            <div className="bg-cream-2 rounded-2xl p-6 text-center">
              <p className="text-ink-soft" style={{ fontFamily: "var(--font-body)" }}>
                Seu perfil requer análise mais detalhada. Recomendamos consulta
                com advogado de imigração.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.visa}
                  className={[
                    "bg-cream-2 rounded-2xl p-5",
                    rec.blocked
                      ? "opacity-60 border-2 border-clay/30"
                      : rec.urgent
                        ? "border-2 border-clay"
                        : "border border-pine-tint",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3
                      className={`font-bold text-base leading-tight ${rec.blocked ? "text-ink-faint line-through" : "text-pine"}`}
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {rec.visa}
                    </h3>
                    {!rec.blocked && (
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${priorityStyle[rec.priority]}`}
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {priorityLabel[rec.priority]}
                      </span>
                    )}
                    {rec.blocked && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-clay/10 text-clay border border-clay/30 whitespace-nowrap flex-shrink-0">
                        Indisponível
                      </span>
                    )}
                  </div>
                  <p
                    className="text-ink-soft text-sm mb-3 leading-relaxed"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {rec.description}
                  </p>
                  {!rec.blocked && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-faint">📋</span>
                      <span
                        className="text-xs text-ink-faint font-medium"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {rec.forms}
                      </span>
                    </div>
                  )}
                  {!rec.blocked && rec.href && (
                    <Link
                      href={rec.href}
                      className="inline-block mt-3 text-sm font-bold text-pine hover:text-pine-deep underline underline-offset-4 transition-colors"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Abrir o guia completo →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* CTA — o destino muda conforme o caso: a vitrine de vistos só
              faz sentido para quem ainda vai escolher um caminho de visto. */}
          {saveError && (
            <p
              className="text-center text-sm text-clay bg-cream-2 rounded-xl py-2"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {saveError}
            </p>
          )}
          {answers.q_current_status === "unsure" ? (
            // Sem o I-94 conferido, nenhuma rota é confiável — o próximo
            // passo é o site oficial do CBP, não a vitrine de vistos.
            <a
              href="https://i94.cbp.dhs.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center bg-amber text-ink font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-200 hover:bg-amber-deep active:scale-95 shadow-sm"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Conferir meu I-94 no site oficial →
            </a>
          ) : answers.q_current_status === "green_card" ||
            answers.q_current_status === "citizen" ? (
            // Green Card / cidadão: a jornada já está definida (I-90, N-400,
            // petições) — vai direto ao painel, sem escolher visto.
            <button
              onClick={() =>
                saveProfileAndGoToDashboard(
                  answers.q_current_status === "citizen" ? "citizen" : "green_card"
                )
              }
              disabled={savingProfile}
              className="w-full bg-amber text-ink font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-200 hover:bg-amber-deep active:scale-95 shadow-sm disabled:opacity-60"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {savingProfile ? "Salvando sua jornada..." : "Ir para o meu painel →"}
            </button>
          ) : (
            <button
              onClick={() => {
                // Overstay: as jornadas de visto padrão não se aplicam — o
                // próximo passo real é ajuda profissional.
                if (answers.q_current_status === "overstay") {
                  router.push("/profissionais");
                  return;
                }
                const params = new URLSearchParams();
                if (answers.q_nationality) params.set("nationality", answers.q_nationality);
                if (answers.q_location)
                  params.set("location", answers.q_location === "in_us" ? "eua" : "brasil");
                params.set("goal", deriveMainGoal(answers));
                const focus = deriveFocusIds(answers, recommendations);
                if (focus.length > 0) params.set("focus", focus.join(","));
                router.push(`/vistos?${params.toString()}`);
              }}
              className="w-full bg-amber text-ink font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-200 hover:bg-amber-deep active:scale-95 shadow-sm"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {answers.q_current_status === "overstay"
                ? "Encontrar ajuda profissional →"
                : "Ver minha jornada em detalhe →"}
            </button>
          )}

          {/* Restart */}
          <button
            onClick={() => {
              setAnswers({});
              setHistory(["q_location"]);
              setPhase("welcome");
            }}
            className="text-sm text-ink-faint hover:text-ink-soft text-center transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            ↩ Recomeçar
          </button>

          <p
            className="text-xs text-ink-faint text-center leading-relaxed pb-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            As informações acima são educacionais e não constituem aconselhamento
            jurídico. Para orientação legal específica, consulte um advogado de
            imigração licenciado.
          </p>
        </div>
      </main>
    );
  }

  // ── Questions ─────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-cream flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-pine-tint">
        <div
          className="h-full bg-pine transition-all duration-500 ease-out"
          style={{ width: `${Math.min(progress, 95)}%` }}
        />
      </div>

      <div className="max-w-lg mx-auto w-full px-6 py-8 flex flex-col flex-1">

        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={goBack}
            className="text-ink-faint hover:text-ink transition-colors text-sm font-medium flex items-center gap-1"
            style={{ fontFamily: "var(--font-body)" }}
          >
            ← Voltar
          </button>
          <span
            className="text-xs text-ink-faint font-medium"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Passo {history.length}
          </span>
        </div>

        {/* Question + options */}
        <div
          className={`flex-1 flex flex-col transition-all duration-180 ${
            animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          }`}
        >
          <h2
            className="text-2xl font-semibold text-ink mb-2 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {currentQuestion?.text}
          </h2>

          {currentQuestion?.subtitle && (
            <p
              className="text-sm text-ink-faint mb-6 leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {currentQuestion.subtitle}
            </p>
          )}
          {!currentQuestion?.subtitle && <div className="mb-6" />}

          <div className="flex flex-col gap-3 flex-1">
            {currentQuestion?.options.map((opt) => {
              const selected = currentAnswer === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => selectAnswer(opt.value)}
                  className={`w-full flex items-start gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150 ${
                    selected
                      ? "border-amber bg-amber-tint"
                      : "border-pine-tint bg-cream-2 hover:border-pine/40 hover:bg-pine-tint/50"
                  }`}
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{opt.icon}</span>
                  <div className="flex-1">
                    <span
                      className={`font-medium text-base block ${
                        selected ? "text-ink" : "text-ink-soft"
                      }`}
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {opt.label}
                    </span>
                    {opt.subtitle && (
                      <span
                        className="text-xs text-ink-faint mt-0.5 block"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {opt.subtitle}
                      </span>
                    )}
                  </div>
                  {selected && (
                    <span className="ml-auto text-amber flex-shrink-0 mt-0.5">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Next button */}
        <div className="pt-8 pb-4">
          <button
            onClick={goNext}
            disabled={!currentAnswer}
            className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-200 ${
              currentAnswer
                ? "bg-pine text-cream-2 hover:bg-pine-deep active:scale-95 shadow-sm"
                : "bg-pine-tint text-ink-faint cursor-not-allowed"
            }`}
            style={{ fontFamily: "var(--font-body)" }}
          >
            Próxima →
          </button>
        </div>
      </div>
    </main>
  );
}
