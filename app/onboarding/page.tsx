"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import VistoCatalogDetails from "@/app/components/VistoCatalogDetails";
import { findCatalogVisto } from "@/lib/vistosCatalog";

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
  // Cards de "fale com um advogado agora" — carregam peso (vermelho, urgência)
  // que só faz sentido depois que a pessoa já criou conta; escondidos antes do login.
  professionalReferral?: boolean;
};

type Option = {
  value: string;
  label: string;
  icon: string;
  subtitle?: string;
  info?: string; // texto educacional aberto pelo botão ⓘ do card
};

type Question = {
  id: string;
  text: string;
  subtitle?: string;
  options: Option[];
  next: string | ((answer: string, allAnswers: Answers) => string);
  // Ação externa (ex.: conferir o I-94 no site do CBP) oferecida antes das
  // opções — o usuário sai, confere e volta para responder.
  externalLink?: { label: string; href: string };
};

// "unsure" no I-94 não é mais terminal: leva para q_i94_check, que resolve
// para "in_status" ou "overstay" (ou permanece "unsure" se a pessoa ainda não
// conseguiu conferir). O resto do motor de recomendação deve enxergar o
// status resolvido, não o "unsure" bruto da primeira pergunta.
function resolveCurrentStatus(a: Answers): string | undefined {
  if (a.q_current_status === "unsure") {
    if (a.q_i94_check === "in_status" || a.q_i94_check === "overstay") return a.q_i94_check;
    return "unsure";
  }
  return a.q_current_status;
}

// ─── Question Tree ────────────────────────────────────────────────────────────

// Exportado para o teste de cobertura, que percorre o grafo inteiro de
// perguntas e garante que todo perfil termina em um destino definido.
export const questionMap: Record<string, Question> = {

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
      {
        value: "university",
        label: "Graduação ou pós-graduação em universidade",
        icon: "🏛️",
        info:
          "Leva ao F-1, o visto de estudante acadêmico. Emitido com o I-20 da instituição, permite estudar em tempo integral e trabalhar no campus e via OPT/CPT ligado ao curso.",
      },
      {
        value: "language",
        label: "Curso de idiomas",
        icon: "🗣️",
        info:
          "Cursos de idiomas em geral também usam o F-1, com I-20 da escola. Alguns programas patrocinados funcionam como J-1 — a escola informa qual se aplica.",
      },
      {
        value: "vocational",
        label: "Curso técnico / vocacional",
        icon: "🔧",
        info:
          "Leva ao M-1, o visto para cursos técnicos e profissionalizantes credenciados pelo SEVP. Tem regras mais rígidas que o F-1 — inclusive para mudar de status depois.",
      },
      {
        value: "exchange",
        label: "Intercâmbio, pesquisa ou programa cultural",
        icon: "🔄",
        info:
          "Leva ao J-1, para programas com patrocinador (intercâmbio, pesquisa, au pair). Atenção à regra dos 2 anos (212(e)): em alguns casos, exige retornar ao país de origem antes de outros vistos.",
      },
    ],
    next: () => "results",
  },

  // ── Work sub-branch ───────────────────────────────────────────────────────
  q_work_type: {
    id: "q_work_type",
    text: "Como será seu vínculo de trabalho?",
    options: [
      {
        value: "employer_offer",
        label: "Tenho oferta de emprego de empresa americana",
        icon: "🤝",
        info:
          "O caminho clássico é o H-1B: exige graduação na área da vaga e passa por sorteio anual (registro em março). O empregador conduz a petição.",
      },
      {
        value: "intracompany",
        label: "Sou transferido pela minha empresa para os EUA",
        icon: "🏢",
        info:
          "Leva ao L-1: para quem trabalha há pelo menos 1 ano em empresa com matriz, filial ou afiliada nos EUA. Sem sorteio — e ponte natural para o Green Card EB-1C.",
      },
      {
        value: "extraordinary",
        label: "Sou reconhecido na minha área (artista, atleta, cientista)",
        icon: "⭐",
        info:
          "Leva ao O-1, para quem tem reconhecimento sólido na área (prêmios, imprensa, publicações, salário destacado). Sem sorteio e sem cota anual.",
      },
      {
        value: "self",
        label: "Sou autônomo / freelancer / sem oferta ainda",
        icon: "🧑‍💻",
        info:
          "Sem oferta de emprego, as portas reais são o O-1 (petição via agente) e o Green Card EB-2 NIW por autopetição — ambos dependem de portfólio e formação sólida.",
      },
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
        info:
          "O caminho típico é o E-2 (investidor por tratado, a partir de ~$100k) — mas o Brasil não tem tratado com os EUA. Para brasileiros, as alternativas são o EB-5 ou o L-1 via filial da própria empresa.",
      },
      {
        value: "invest_permanent",
        label: "Quero investir e obter residência permanente",
        icon: "🏠",
        subtitle: "A partir de $800k — caminho para Green Card",
        info:
          "Leva ao EB-5: investimento de $800k a $1.05M em projeto que crie pelo menos 10 empregos americanos, com Green Card direto. Disponível para brasileiros.",
      },
      {
        value: "trade",
        label: "Tenho empresa que comercializa com os EUA",
        icon: "📦",
        subtitle: "Exportação, importação, serviços",
        info:
          "O caminho típico é o E-1 (comércio por tratado) — indisponível para brasileiros por falta de tratado. As alternativas são o B-1 para as viagens e o L-1 via filial nos EUA.",
      },
      {
        value: "meetings",
        label: "Preciso fazer reuniões, negociações ou visitar clientes",
        icon: "🤝",
        subtitle: "Sem trabalhar ou receber salário americano",
        info:
          "Leva ao B-1 (visitante de negócios): reuniões, contratos, negociações e conferências. Não autoriza trabalho remunerado nem receber salário americano.",
      },
    ],
    next: () => "q_nationality",
  },

  // ── Family ties ───────────────────────────────────────────────────────────
  q_family_ties: {
    id: "q_family_ties",
    text: "Você tem vínculos com cidadãos americanos ou titulares de Green Card?",
    options: [
      {
        value: "spouse_citizen",
        label: "Cônjuge ou noivo/a cidadão americano",
        icon: "💍",
        info:
          "Parente imediato de cidadão: noivos usam o K-1 (casamento nos EUA em até 90 dias); cônjuges já casados, o IR-1/CR-1 pelo consulado. Sem fila de espera.",
      },
      {
        value: "parent_child_citizen",
        label: "Filho/pais cidadãos americanos",
        icon: "👨‍👩‍👧",
        info:
          "Categoria IR (parente imediato): prioridade máxima, sem fila de espera. O cidadão americano protocola a petição I-130.",
      },
      {
        value: "family_gc",
        label: "Familiar próximo com Green Card",
        icon: "🟢",
        info:
          "Residentes permanentes peticionam cônjuge e filhos solteiros (categorias F2A/F2B). Há fila, que varia por categoria — dá para acompanhar no visa bulletin.",
      },
      {
        value: "none",
        label: "Não tenho vínculos familiares",
        icon: "❌",
        info:
          "Sem vínculo familiar, os caminhos para os EUA passam por emprego, mérito, investimento, proteção humanitária ou loteria — a próxima pergunta detalha cada um.",
      },
    ],
    // Overstay sem vínculos vai direto aos resultados — os caminhos de
    // residência por mérito/investimento pressupõem status válido.
    next: (a, all) =>
      a === "none" && resolveCurrentStatus(all) !== "overstay"
        ? "q_permanent_path"
        : "results",
  },

  q_permanent_path: {
    id: "q_permanent_path",
    text: "Como você pretende buscar residência permanente?",
    options: [
      {
        value: "work_gc",
        label: "Por meio de emprego / patrocinador",
        icon: "💼",
        info:
          "Uma empresa americana patrocina seu Green Card (categorias EB-2/EB-3). O empregador conduz a certificação trabalhista (PERM) e a petição — é o caminho mais comum para quem tem oferta de emprego nos EUA.",
      },
      {
        value: "merit",
        label: "Por mérito ou habilidade extraordinária",
        icon: "⭐",
        info:
          "Categorias de autopetição (EB-1, EB-2 NIW) para quem tem carreira de destaque, pesquisa ou trabalho de interesse nacional. Não depende de empregador nem de sorteio — você mesmo peticiona.",
      },
      {
        value: "invest",
        label: "Por investimento (EB-5)",
        icon: "💰",
        info:
          "Green Card por investimento: a partir de US$ 800 mil em projeto que crie pelo menos 10 empregos americanos. Disponível para brasileiros — é um dos poucos caminhos que não exige patrocinador nem vínculo familiar.",
      },
      {
        value: "asylum",
        label: "Tenho fundado temor de perseguição (asilo)",
        icon: "🛡️",
        info:
          "Proteção para quem sofre perseguição por raça, religião, nacionalidade, opinião política ou grupo social. O pedido de asilo (I-589) só pode ser feito dentro dos EUA ou na fronteira — de fora, o caminho é o programa de refugiados, por indicação do ACNUR.",
      },
      {
        value: "lottery",
        label: "Loteria de vistos (DV Lottery)",
        icon: "🎲",
        info:
          "Sorteio anual e gratuito do governo americano (inscrições entre outubro e novembro) para países com baixa imigração. Atenção: o Brasil tem ficado fora da lista de países elegíveis nos últimos anos.",
      },
      {
        value: "unsure",
        label: "Ainda não sei / quero comparar",
        icon: "🤔",
        info:
          "Sem problema — mostramos os caminhos de Green Card mais comuns para você começar a comparar com calma.",
      },
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
      if (a === "unsure")      return "q_i94_check"; // confere o I-94 e volta pra continuar aqui dentro
      // Overstay: os vínculos familiares decidem se existe caminho por
      // dentro (ajuste por parente imediato, INA §245(a)) — perguntar antes
      // de mostrar as saídas.
      if (a === "overstay")    return "q_family_ties";
      if (a === "green_card")  return "q_gc_goal";
      return "q_citizen_goal"; // citizen
    },
  },

  // ── "Não sei meu I-94" — sai para conferir no CBP e volta pra cá ──────────
  q_i94_check: {
    id: "q_i94_check",
    text: "Confira seu I-94 e volte para continuar",
    subtitle:
      "Abra o site oficial do CBP, confira a data com o passaporte em mãos e responda abaixo o que você encontrou — sem sair da sua jornada.",
    externalLink: {
      label: "Conferir meu I-94 no site oficial →",
      href: "https://i94.cbp.dhs.gov/",
    },
    options: [
      { value: "in_status", label: "Estou dentro do prazo", icon: "✅" },
      { value: "overstay",  label: "Passei do prazo (overstay)", icon: "⚠️" },
      { value: "still_unsure", label: "Ainda não consegui verificar", icon: "🔎" },
    ],
    next: (a) => {
      if (a === "in_status") return "q_current_visa";
      if (a === "overstay")  return "q_family_ties";
      return "results"; // still_unsure → mesmo card de fallback de antes
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
      {
        value: "b1b2",
        label: "B-1/B-2 — Turismo / Negócios",
        icon: "🛂",
        info:
          "Visto de visita: turismo, tratamento médico e reuniões de negócios — sem trabalhar. A permanência é a que consta no I-94, em geral até 6 meses por entrada.",
      },
      {
        value: "f1",
        label: "F-1 — Estudante acadêmico",
        icon: "🎓",
        info:
          "Estudante em instituição SEVP, com I-20. Permite trabalho no campus e OPT/CPT ligado ao curso. O I-94 costuma dizer \"D/S\" (duração do status).",
      },
      {
        value: "j1",
        label: "J-1 — Intercâmbio",
        icon: "🔄",
        info:
          "Programas patrocinados de intercâmbio, com DS-2019. Alguns casos têm a regra dos 2 anos (212(e)), que muda os caminhos seguintes — confira no seu formulário.",
      },
      {
        value: "h1b",
        label: "H-1B — Trabalho especializado",
        icon: "🏢",
        info:
          "Trabalho com patrocínio de empregador. É portátil (dá para trocar de empregador sem novo sorteio) e um dos caminhos mais comuns até o Green Card por emprego.",
      },
      {
        value: "l1",
        label: "L-1 — Transferência intraempresarial",
        icon: "🌐",
        info:
          "Transferência dentro da mesma empresa multinacional. Para executivos e gerentes (L-1A), é a ponte natural para o Green Card EB-1C.",
      },
      {
        value: "m1",
        label: "M-1 — Estudante vocacional / técnico",
        icon: "🔧",
        info:
          "Estudante de curso técnico/profissionalizante. Regras mais rígidas: a lei veda a mudança M-1 → F-1 por dentro dos EUA — essa rota é consular.",
      },
      {
        value: "o1",
        label: "O-1 — Habilidade extraordinária",
        icon: "⭐",
        info:
          "Para quem tem reconhecimento sólido na área, sem cota nem sorteio. Esse perfil costuma sustentar autopetição de Green Card (EB-1A ou EB-2 NIW).",
      },
      {
        value: "dependent",
        label: "Dependente — F-2, H-4, L-2 ou J-2",
        icon: "👪",
        info:
          "Status vinculado ao titular principal. Estudo e trabalho variam por categoria: L-2 e J-2 podem trabalhar com autorização; H-4 só em casos específicos; F-2 não trabalha.",
      },
      {
        value: "esta_vwp",
        label: "Entrei sem visto (ESTA / Visa Waiver)",
        icon: "🛬",
        subtitle: "Passaporte europeu ou de país do VWP",
        info:
          "Entrada sem visto pelo Visa Waiver Program: até 90 dias, sem extensão nem mudança de status por dentro dos EUA (8 CFR §248). Os próximos passos são planejados pelo consulado.",
      },
      { value: "other",label: "Outra categoria",              icon: "📄" },
    ],
    // ESTA/VWP não permite extensão nem mudança de status por dentro
    // (8 CFR §248) — mas o objetivo define qual rota consular planejar,
    // e a exceção de parente imediato precisa ser detectada.
    next: (a) => (a === "esta_vwp" ? "q_esta_goal" : "q_change_goal"),
  },

  // ── ESTA/VWP dentro dos EUA — o objetivo define a rota consular ──────────
  q_esta_goal: {
    id: "q_esta_goal",
    text: "O que você deseja fazer agora?",
    subtitle:
      "Pelo ESTA não dá para estender a estadia nem mudar de status por dentro — mas dá para planejar a próxima entrada do jeito certo.",
    options: [
      {
        value: "study",
        label: "Estudar nos EUA",
        icon: "🎓",
        info:
          "O caminho real é o F-1 pelo consulado: garantir o I-20 da escola, sair dos EUA dentro dos 90 dias e aplicar de fora. Estudar em tempo integral com ESTA não é permitido.",
      },
      {
        value: "work",
        label: "Trabalhar nos EUA",
        icon: "💼",
        info:
          "As rotas são consulares: O-1 (reconhecimento na área), H-1B (graduação + sorteio anual) ou L-1 (transferência pela própria empresa).",
      },
      {
        value: "invest",
        label: "Investir ou empreender",
        icon: "💰",
        info:
          "Quem entra de ESTA tem passaporte de país do VWP — na maioria, também de tratado: E-2 (investimento a partir de ~$100k) e E-1 (comércio bilateral), ambos pelo consulado.",
      },
      {
        value: "family_citizen",
        label: "Sou cônjuge ou parente imediato de cidadão americano",
        icon: "💍",
        subtitle: "Cônjuge, pai/mãe ou filho(a) solteiro(a) menor de 21 de cidadão",
        info:
          "Exceção estreita do VWP: parentes imediatos de cidadão podem, em muitos casos, ajustar o status por dentro (INA §245(a)). A regra dos 90 dias e a prova de intenção pesam — análise individual.",
      },
      {
        value: "plan_return",
        label: "Só visitando — quero planejar visitas futuras",
        icon: "✈️",
        info:
          "O ESTA permite até 90 dias por entrada, sem extensão. Entradas muito frequentes levantam suspeita de 'morar de ESTA' e podem custar a autorização.",
      },
    ],
    next: () => "results",
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
      {
        value: "f1",
        label: "F-1 — Estudante acadêmico",
        icon: "🎓",
        info:
          "Estudante em tempo integral com I-20 de escola SEVP. Por dentro dos EUA, a mudança é via I-539 — o prazo do seu I-94 é o fator crítico do timing.",
      },
      {
        value: "m1",
        label: "M-1 — Estudante vocacional / técnico",
        icon: "🔧",
        info:
          "Cursos técnicos e profissionalizantes com I-20 de escola M. Atenção: uma vez em M-1, a lei veda mudar para F-1 por dentro dos EUA.",
      },
      {
        value: "j1",
        label: "J-1 — Intercâmbio",
        icon: "🔄",
        info:
          "Programas com patrocinador e DS-2019. Verifique a regra dos 2 anos (212(e)) antes de planejar — ela pode mudar o caminho inteiro.",
      },
      {
        value: "h1b",
        label: "H-1B — Trabalho especializado",
        icon: "🏢",
        info:
          "Precisa de empregador patrocinador, graduação na área da vaga e passar no sorteio anual (registro em março, início em outubro).",
      },
      {
        value: "o1",
        label: "O-1 — Habilidade extraordinária",
        icon: "⭐",
        info:
          "Sem sorteio e sem cota: petição via empregador ou agente, sustentada por um dossiê de reconhecimento na sua área (prêmios, imprensa, publicações).",
      },
      { value: "other",label: "Outro / Não tenho certeza",            icon: "🤔" },
    ],
    next: () => "q_process",
  },

  q_gc_path: {
    id: "q_gc_path",
    text: "Qual é o seu caminho para o Green Card?",
    options: [
      {
        value: "employer",
        label: "Por patrocínio de empregador",
        icon: "🏢",
        info:
          "Categorias EB-2/EB-3: o empregador conduz a certificação trabalhista (PERM) e a petição I-140. É o caminho mais comum para o Green Card por emprego.",
      },
      {
        value: "family",
        label: "Por vínculo familiar com cidadão / GC",
        icon: "👨‍👩‍👧",
        info:
          "Petição I-130 por parente: parentes imediatos de cidadão (cônjuge, pais, filhos menores de 21) não têm fila; as demais categorias têm filas que variam de anos a décadas.",
      },
      {
        value: "merit",
        label: "Por mérito (EB-1, EB-2 NIW)",
        icon: "⭐",
        info:
          "Autopetição: EB-1A para carreira de destaque internacional, EB-2 NIW para trabalho de interesse nacional. Sem patrocinador e sem sorteio.",
      },
      {
        value: "unsure",
        label: "Não tenho certeza",
        icon: "🤔",
        info:
          "Sem problema — mostramos os caminhos mais comuns (patrocínio e autopetição) para você começar a comparar.",
      },
    ],
    next: (a) => a === "family" ? "q_family_ties" : "q_process",
  },

  // ── Green Card holder ─────────────────────────────────────────────────────
  q_gc_goal: {
    id: "q_gc_goal",
    text: "O que você deseja fazer?",
    options: [
      {
        value: "renew",
        label: "Renovar meu Green Card",
        icon: "🔄",
        info:
          "I-90 para o cartão de 10 anos. Se o seu é o condicional de 2 anos (por casamento), o caminho é o I-751, protocolado nos 90 dias antes do vencimento — nunca o I-90.",
      },
      {
        value: "naturalization",
        label: "Solicitar naturalização (cidadania)",
        icon: "🇺🇸",
        info:
          "N-400: em regra, 5 anos como residente permanente (3 se casado e vivendo com cidadão americano), mais residência contínua, presença física e teste de inglês/cívica.",
      },
      {
        value: "family",
        label: "Trazer ou peticionar familiar",
        icon: "👨‍👩‍👧",
        info:
          "I-130 para cônjuge e filhos solteiros: menores de 21 na F2A (fila frequentemente curta) e 21+ na F2B (fila mais longa). Dá para acompanhar no visa bulletin.",
      },
      {
        value: "reentry",
        label: "Solicitar permissão de reentrada (Reentry Permit)",
        icon: "✈️",
        info:
          "I-131: protege o Green Card em ausências de até 2 anos. Precisa ser protocolado ANTES de sair dos EUA — a biometria também é feita aqui.",
      },
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
  "f1", "m1", "j1", "h1b", "o1", "l1", "b1", "esta", "e2", "e1", "eb2niw",
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
  if (a.q_goal === "visit") add(a.q_nationality === "treaty" ? "esta" : "b1");
  // ESTA por dentro: as saídas são consulares — E-1 não tem kit, entra aqui.
  if (a.q_esta_goal === "invest") {
    add("e2");
    add("e1");
  }
  if (a.q_business_type === "trade" && a.q_nationality === "treaty") add("e1");

  return [...ids];
}

// ─── Destination derivation ───────────────────────────────────────────────────

// Para onde os resultados do onboarding levam. Regra: a vitrine de vistos só
// recebe quem tem algo para destacar nela (focus); beneficiários de petição
// familiar (K-1, IR/CR, F-2), overstay e perfis sem card no catálogo vão
// direto para ajuda profissional — "Qual é o seu visto?" é a pergunta errada
// para eles.
export type Destination =
  | { kind: "i94" }
  | { kind: "dashboard"; visaType: "green_card" | "citizen" }
  | { kind: "profissionais" }
  | { kind: "vistos"; query: string };

export function deriveDestination(a: Answers, results: VisaResult[]): Destination {
  const currentStatus = resolveCurrentStatus(a);

  // Sem o I-94 conferido (ou ainda sem resposta ao q_i94_check), nenhuma
  // rota é confiável — o próximo passo é o site oficial do CBP, não a
  // vitrine de vistos.
  if (currentStatus === "unsure") return { kind: "i94" };

  // Green Card / cidadão: a jornada já está definida (I-90, N-400, petições).
  if (currentStatus === "green_card") return { kind: "dashboard", visaType: "green_card" };
  if (currentStatus === "citizen") return { kind: "dashboard", visaType: "citizen" };

  // Overstay, ajuste por parente imediato (exceção do VWP) e beneficiários
  // de petição familiar: as jornadas de visto padrão não se aplicam.
  if (
    currentStatus === "overstay" ||
    a.q_esta_goal === "family_citizen" ||
    (a.q_family_ties && a.q_family_ties !== "none")
  ) {
    return { kind: "profissionais" };
  }

  const params = new URLSearchParams();
  if (a.q_nationality) params.set("nationality", a.q_nationality);
  // Entrou de ESTA = passaporte de país do VWP: destrava E-1/E-2 na
  // vitrine sem perguntar a cidadania de novo.
  else if (a.q_current_visa === "esta_vwp") params.set("nationality", "treaty");
  if (a.q_location) params.set("location", a.q_location === "in_us" ? "eua" : "brasil");
  params.set("goal", deriveMainGoal(a));

  const focus = deriveFocusIds(a, results);
  // Vitrine sem nada para destacar = perfil sem caminho de visto mapeado
  // (asilo, EB-5, dependentes…) — melhor um profissional que um catálogo
  // genérico.
  if (focus.length === 0) return { kind: "profissionais" };
  params.set("focus", focus.join(","));

  return { kind: "vistos", query: params.toString() };
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
  const currentStatus  = resolveCurrentStatus(a);
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
  // A regra fecha a porta de dentro; o objetivo (q_esta_goal) define qual
  // rota consular abrir. Quem entra de ESTA tem passaporte de país do VWP —
  // na maioria dos casos, também tratado E-1/E-2.
  if (currentVisa === "esta_vwp") {
    const estaGoal = a.q_esta_goal;

    results.push({
      visa: "⚠️ Entrada por ESTA/VWP: sem extensão ou mudança de status",
      forms: "8 CFR §248 — regra federal",
      description:
        "Quem entra pelo Visa Waiver aceita não estender a estadia (máx. 90 dias) nem mudar de status por dentro dos EUA. O caminho padrão é sair e aplicar o visto no consulado. Exceção estreita: ajuste por parente imediato de cidadão americano — análise jurídica individual.",
      priority: "high",
      urgent: true,
    });

    if (estaGoal === "family_citizen") {
      results.push({
        visa: "Ajuste de status por parente imediato — a exceção do VWP",
        forms: "I-130 + I-485",
        description:
          "Cônjuges, pais e filhos solteiros menores de 21 de cidadão americano podem, em muitos casos, ajustar o status por dentro mesmo tendo entrado de ESTA (INA §245(a)). Atenção à regra dos 90 dias: a intenção na entrada pesa na análise — nenhum protocolo sem orientação individual.",
        priority: "high",
        urgent: true,
      });
      results.push({
        visa: "🤝 Análise individual com profissional verificado",
        forms: "Consulta com advogado de imigração licenciado",
        description:
          "Essa exceção é real, mas cheia de detalhes de timing e prova de intenção. O Immigrei conecta você a profissionais verificados antes de qualquer decisão — evite protocolos por conta própria.",
        priority: "high",
        professionalReferral: true,
      });
    }

    if (estaGoal === "study") {
      results.push({
        visa: "F-1 (Estudante Acadêmico) — pelo consulado",
        forms: "Saída programada + DS-160 + I-20",
        description:
          "O caminho real para estudar: garanta o I-20 da escola, saia dos EUA dentro dos 90 dias e aplique o F-1 no consulado do seu país. Estudar em carga integral com ESTA não é permitido — e compromete vistos futuros.",
        priority: "high",
      });
    }

    if (estaGoal === "work") {
      results.push({
        visa: "O-1 (Habilidade Extraordinária)",
        forms: "I-129 (O) + aplicação consular",
        description:
          "Para quem tem reconhecimento sólido na sua área: sem sorteio e sem cota. A petição é feita por empregador ou agente nos EUA e o visto sai no consulado.",
        priority: "high",
      });
      results.push({
        visa: "H-1B (Trabalho Especializado)",
        forms: "I-129 (H) pelo empregador + sorteio anual",
        description:
          "Com graduação e oferta de emprego americana, o empregador registra você no sorteio de março. Aprovado, o visto é emitido no consulado — sem depender de status dentro dos EUA.",
        priority: "medium",
      });
      results.push({
        visa: "L-1 (Transferência Intraempresarial)",
        forms: "I-129 (L)",
        description:
          "Se você trabalha há 1 ano numa empresa com operação (ou planos de operação) nos EUA, a transferência dispensa sorteio — caminho forte para executivos e especialistas.",
        priority: "medium",
      });
    }

    if (estaGoal === "invest") {
      results.push({
        visa: "E-2 (Investidor por Tratado)",
        forms: "DS-160 + aplicação consular",
        description:
          "A grande porta para cidadãos de países com tratado — a maioria dos países do VWP tem. Investimento substancial (a partir de ~$100k) em negócio real, com renovações ilimitadas. Confira seu país na lista oficial de tratados.",
        priority: "high",
      });
      results.push({
        visa: "E-1 (Comércio por Tratado)",
        forms: "DS-160 + documentação comercial",
        description:
          "Se a sua empresa já comercializa com os EUA (mais de 50% do volume bilateral), o E-1 sustenta idas e vindas de longo prazo — também condicionado ao tratado do seu país.",
        priority: "medium",
      });
    }

    if (!estaGoal || estaGoal === "plan_return") {
      results.push({
        visa: "Use o ESTA do jeito certo",
        forms: "esta.cbp.dhs.gov + I-94 a cada entrada",
        description:
          "Até 90 dias por entrada, sem extensão. Entradas muito frequentes levantam a suspeita de 'morar de ESTA' — e podem custar a autorização. Se os planos crescerem, o caminho é um visto de verdade, planejado do lado de fora.",
        priority: "medium",
      });
    }

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
    if (familyTies === "spouse_citizen" || familyTies === "parent_child_citizen") {
      // Fonte: content/leis/conceitos/unlawful-presence.md — quem ajusta por
      // dentro via parente imediato pode nunca acionar as barras de 3/10 anos.
      results.push({
        visa: "✅ Existe um caminho por dentro para o seu caso",
        forms: "I-130 + I-485 (podem ser protocolados juntos)",
        description:
          "Cônjuge, pais e filhos solteiros menores de 21 anos de cidadão americano que entraram nos EUA com inspeção podem ajustar o status por dentro, mesmo com overstay (INA §245(a)). Como você não sai do país, as barras de 3/10 anos nunca disparam. A forma de entrada e as provas do vínculo genuíno decidem o caso — monte-o com um profissional.",
        priority: "high",
      });
    } else if (familyTies === "family_gc") {
      results.push({
        visa: "O caminho existe — e melhora com o tempo",
        forms: "I-130 (categoria F2A)",
        description:
          "Seu familiar residente já pode protocolar o I-130 agora — a data de protocolo garante seu lugar na fila F2A. Com overstay, o ajuste por dentro nessa categoria em regra não é permitido; mas se o seu familiar se naturalizar, você vira parente imediato e o caminho por dentro abre (INA §245(a)). Não saia dos EUA sem análise — as barras disparam na saída.",
        priority: "high",
      });
    } else {
      results.push({
        visa: "Ajuste de status por parente imediato (se aplicável)",
        forms: "I-130 + I-485",
        description:
          "Quem entrou nos EUA com inspeção e é cônjuge, pai/mãe ou filho(a) de cidadão americano pode, em muitos casos, ajustar o status por dentro — sem sair e sem acionar as barras (INA §245(a)). A elegibilidade é uma análise jurídica individual.",
        priority: "high",
      });
    }
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
      professionalReferral: true,
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
  if (inUs && currentVisa === "l1" && changeGoal === "green_card") {
    results.push({
      visa: "L-1A → EB-1C: a ponte do executivo (guia passo a passo)",
      forms: "I-140 (EB-1C) pela empresa + I-485",
      description:
        "A transferência que te trouxe é a mesma história que sustenta o Green Card — sem sorteio e sem PERM. O teto de 7 anos do L-1A faz do timing a decisão mais importante; o manual mostra a ordem certa.",
      priority: "high",
      href: "/caminhos/l1-para-eb1c",
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
        visa: "F-1 (Estudante Acadêmico)",
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
    if (gcPath === "unsure" || permanentPath === "unsure") {
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
    if (permanentPath === "unsure") {
      results.push({
        visa: "EB-5 (Green Card por Investimento)",
        forms: "I-526E + processo consular (NVC)",
        description:
          "Para quem tem capital: investimento de $800k a $1.05M em projeto que crie 10 empregos americanos. Caminho direto para o Green Card, sem patrocinador — disponível para brasileiros.",
        priority: "medium",
      });
    }
    if (permanentPath === "invest") {
      results.push({
        visa: "EB-5 (Green Card por Investimento)",
        forms: "I-526E + I-485 (ajuste) ou NVC (consular)",
        description:
          "Investimento de $800k (em área de alto desemprego ou projeto regional) a $1.05M em negócio que crie pelo menos 10 empregos americanos. Caminho direto para o Green Card — disponível para brasileiros.",
        priority: "high",
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
      // Não existe "asilo consular": o I-589 só é protocolado dentro dos EUA
      // ou na fronteira (INA §208). De fora, a via é o programa de refugiados.
      results.push({
        visa: "Asilo / Refúgio",
        forms: "I-589 (somente dentro dos EUA) ou USRAP via ACNUR (de fora)",
        description:
          "Proteção para quem tem fundado temor de perseguição por raça, religião, nacionalidade, opinião política ou grupo social. Importante: o pedido de asilo só pode ser feito dentro dos EUA ou na fronteira — de fora, o caminho é o programa de refugiados (USRAP), por indicação do ACNUR. Caso sensível: procure um advogado de imigração licenciado.",
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
  // ESTA + parente imediato de cidadão: o objetivo é ajustar o próprio status.
  if (a.q_esta_goal === "family_citizen") return "regularizar_status";
  if (a.q_change_goal === "extend") return "renovar_visto";
  if (a.q_change_goal === "green_card" || a.q_gc_path) return "green_card";
  if (a.q_change_goal === "family" || a.q_goal === "family") return "trazer_familia";
  if (a.q_change_goal === "change_status" || a.q_change_goal === "work_change") return "regularizar_status";
  if (a.q_gc_goal === "naturalization") return "cidadania";
  if (a.q_gc_goal === "renew") return "renovar_visto";
  // Overstay vem antes dos vínculos familiares: quem passou do prazo está
  // regularizando o próprio status, mesmo quando a saída é via família.
  if (resolveCurrentStatus(a) === "overstay") return "regularizar_status";
  if (a.q_gc_goal === "family" || a.q_family_ties && a.q_family_ties !== "none") return "trazer_familia";
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

// ─── Pre-login summary ─────────────────────────────────────────────────────────

// Antes do login, cortamos para o essencial: sem siglas de formulário, sem
// links de saída, descrição reduzida a 1-2 frases em bullet. O objetivo é
// convergir tudo para o botão "Ver minha jornada em detalhe" — depois do
// login, o card mostra o conteúdo completo de novo.
function summarizeForGuest(description: string): string[] {
  const sentences = description.split(/(?<=[.!?])\s+/).filter(Boolean);
  const bullets: string[] = [];
  let total = 0;
  for (const s of sentences) {
    if (bullets.length >= 2) break;
    if (total > 0 && total + s.length > 160) break;
    bullets.push(s.trim());
    total += s.length;
  }
  return bullets.length > 0 ? bullets : [description];
}

// ─── UI Component ─────────────────────────────────────────────────────────────

// Guarda o progresso do questionário na sessão: quem navega para /vistos e
// volta (botão Voltar de lá ou do navegador) retoma de onde parou, em vez de
// recomeçar do zero.
const ONBOARDING_STATE_KEY = "immigrei_onboarding_state";

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [phase, setPhase] = useState<"welcome" | "questions" | "results">("welcome");
  const [answers, setAnswers] = useState<Answers>({});
  const [history, setHistory] = useState<string[]>(["q_location"]);
  const [animating, setAnimating] = useState(false);
  // Chave "questionId:value" do card com o painel ⓘ aberto (um por vez).
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  const [resuming, setResuming] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(ONBOARDING_STATE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.phase === "questions" || saved.phase === "results") setPhase(saved.phase);
      if (saved.answers && typeof saved.answers === "object") setAnswers(saved.answers);
      if (Array.isArray(saved.history) && saved.history.length > 0) setHistory(saved.history);
    } catch {
      // estado corrompido: segue do começo
    }
  }, []);

  useEffect(() => {
    if (phase === "welcome") return;
    sessionStorage.setItem(
      ONBOARDING_STATE_KEY,
      JSON.stringify({ phase, answers, history })
    );
  }, [phase, answers, history]);

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
          // Sem visa_type no payload = veio do CTA "Encontrar ajuda
          // profissional" (vínculo familiar), não da vitrine — não tem
          // jornada escolhida ainda, então /dashboard só bateria de volta
          // no /onboarding.
          const hasVisaType = (() => {
            try { return Boolean(JSON.parse(pending)?.visa_type); } catch { return false; }
          })();
          router.replace(hasVisaType ? "/dashboard" : "/profissionais");
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
      ...(answers.q_family_ties ? { family_ties: answers.q_family_ties } : {}),
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

  // Quem tem vínculo familiar (cônjuge/filho de cidadão, ou parente com Green
  // Card) sai direto para /profissionais sem passar pela vitrine de vistos —
  // mas a resposta do questionário precisa ser salva antes, senão o painel
  // nunca sabe desse vínculo e a pessoa não tem perfil algum ao voltar.
  async function saveProfileAndGoToProfissionais() {
    if (savingProfile) return;
    setSavingProfile(true);
    setSaveError(null);
    const payload = {
      main_goal: deriveMainGoal(answers),
      location: answers.q_location === "in_us" ? "eua" : "brasil",
      ...(answers.q_nationality ? { nationality: answers.q_nationality } : {}),
      ...(answers.q_family_ties ? { family_ties: answers.q_family_ties } : {}),
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
    } catch {
      // Perfil não salvou — ainda assim levamos para /profissionais, que é
      // o pedido explícito do usuário; a próxima visita tenta salvar de novo.
    } finally {
      setSavingProfile(false);
      router.push("/profissionais");
    }
  }

  // Fase 1 do fluxo de gates: o CTA força autenticação antes da vitrine de
  // vistos (independente do proxy.ts), preservando nationality/location/
  // goal/focus na URL de retorno via redirect_url do Clerk.
  function goToVistos(query: string) {
    if (!isSignedIn) {
      router.push(`/sign-up?redirect_url=${encodeURIComponent(`/vistos?${query}`)}`);
      return;
    }
    router.push(`/vistos?${query}`);
  }

  const recommendations = getRecommendations(answers);

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
    // Cards de "fale com um advogado" carregam peso demais para quem ainda
    // nem criou conta — essa recomendação só aparece depois do login.
    const visibleRecommendations = isSignedIn
      ? recommendations
      : recommendations.filter((r) => !r.professionalReferral);
    // Um único card: o topo da lista já ordenada por prioridade. Quando o
    // topo é um visto bloqueado por nacionalidade, o card exibido passa a
    // ser a próxima alternativa viável da mesma lista (EB-5/L-1/B-1, sempre
    // inserida logo após o bloqueio na engine) — nunca deixamos a pessoa
    // sem saída.
    const topMatch = visibleRecommendations[0];
    const bestMatch = topMatch?.blocked
      ? (visibleRecommendations.find((r) => !r.blocked) ?? topMatch)
      : topMatch;
    const blockedContext = topMatch?.blocked && bestMatch !== topMatch ? topMatch : null;
    const isUrgent = Boolean(bestMatch?.urgent);
    // Recomendação de visto puro casa com um card do catálogo e ganha os
    // blocos ricos de /vistos; processos (I-539, manuais de caminho,
    // overstay) e bloqueados seguem no formato simples.
    const catalogo = bestMatch && !bestMatch.blocked ? findCatalogVisto(bestMatch.visa) : null;
    const destino = deriveDestination(answers, recommendations);
    // Manuais que já aparecem como recomendação própria — o card rico
    // esconde o link "rumo ao GC" quando apontaria para o mesmo lugar.
    const linkedHrefs = new Set(
      recommendations.map((r) => r.href).filter((h): h is string => Boolean(h))
    );

    return (
      <main className="min-h-screen bg-cream flex flex-col pb-10">
        <div className="max-w-lg mx-auto w-full px-6 py-10 flex flex-col gap-6">

          {/* Back to last question */}
          <div>
            <button
              onClick={() => setPhase("questions")}
              className="text-ink-faint hover:text-ink transition-colors text-sm font-medium flex items-center gap-1"
              style={{ fontFamily: "var(--font-body)" }}
            >
              ← Voltar
            </button>
          </div>

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
              Baseado no seu perfil, este é o caminho que combina com as suas respostas:
            </p>
          </div>

          {/* Urgent alert */}
          {isUrgent && (
            <div className="bg-clay/10 border border-clay rounded-2xl p-4 flex gap-3">
              <span className="text-xl flex-shrink-0">⚠️</span>
              <p
                className="text-clay text-sm font-medium leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {isSignedIn ? (
                  <>
                    <strong>Atenção:</strong> Identificamos situações que requerem
                    cuidado especial. Recomendamos consulta com advogado de imigração
                    antes de qualquer ação.
                  </>
                ) : (
                  <>
                    <strong>Atenção:</strong> Identificamos uma situação que pede
                    cuidado especial. Crie sua conta para ver os caminhos possíveis
                    para o seu caso.
                  </>
                )}
              </p>
            </div>
          )}

          {/* Best-match card */}
          {!bestMatch ? (
            <div className="bg-cream-2 rounded-2xl p-6 text-center">
              <p className="text-ink-soft" style={{ fontFamily: "var(--font-body)" }}>
                {isSignedIn
                  ? "Seu perfil requer análise mais detalhada. Recomendamos consulta com advogado de imigração."
                  : "Seu perfil requer um olhar mais próximo. Crie sua conta para ver os caminhos possíveis."}
              </p>
            </div>
          ) : (
            <div
              className={[
                "bg-cream-2 rounded-2xl p-5",
                bestMatch.blocked
                  ? "opacity-60 border-2 border-clay/30"
                  : bestMatch.urgent
                    ? "border-2 border-clay"
                    : "border border-pine-tint",
              ].join(" ")}
            >
              {blockedContext && (
                <div className="bg-amber-tint border border-amber/40 rounded-xl p-3 mb-4 flex gap-2">
                  <span className="text-base flex-shrink-0">🔒</span>
                  <p
                    className="text-amber-deep text-xs leading-relaxed"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {blockedContext.description} Este é o caminho equivalente para o seu perfil.
                  </p>
                </div>
              )}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3
                  className={`font-bold text-base leading-tight ${bestMatch.blocked ? "text-ink-faint line-through" : "text-pine"}`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {bestMatch.visa}
                </h3>
                {bestMatch.blocked && (
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-clay/10 text-clay border border-clay/30 whitespace-nowrap flex-shrink-0">
                    Indisponível
                  </span>
                )}
              </div>
              {isSignedIn ? (
                <p
                  className="text-ink-soft text-sm mb-3 leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {bestMatch.description}
                </p>
              ) : (
                <ul className="text-ink-soft text-sm mb-3 leading-relaxed space-y-1.5">
                  {summarizeForGuest(bestMatch.description).map((bullet) => (
                    <li key={bullet} className="flex gap-2" style={{ fontFamily: "var(--font-body)" }}>
                      <span className="text-pine flex-shrink-0">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
              {catalogo && (
                <div
                  className="flex flex-col gap-3 mb-4"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <VistoCatalogDetails
                    visto={catalogo}
                    showRumoGc={
                      isSignedIn &&
                      (!catalogo.rumoGc || !linkedHrefs.has(catalogo.rumoGc.href))
                    }
                  />
                </div>
              )}
              {!bestMatch.blocked && isSignedIn && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-faint">📋</span>
                  <span
                    className="text-xs text-ink-faint font-medium"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {bestMatch.forms}
                  </span>
                </div>
              )}
              {!bestMatch.blocked && isSignedIn && bestMatch.href && (
                <Link
                  href={bestMatch.href}
                  className="inline-block mt-3 text-sm font-bold text-pine hover:text-pine-deep underline underline-offset-4 transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Abrir o guia completo →
                </Link>
              )}
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
          {destino.kind === "i94" ? (
            <a
              href="https://i94.cbp.dhs.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center bg-amber text-ink font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-200 hover:bg-amber-deep active:scale-95 shadow-sm"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Conferir meu I-94 no site oficial →
            </a>
          ) : destino.kind === "dashboard" ? (
            <button
              onClick={() => saveProfileAndGoToDashboard(destino.visaType)}
              disabled={savingProfile}
              className="w-full bg-amber text-ink font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-200 hover:bg-amber-deep active:scale-95 shadow-sm disabled:opacity-60"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {savingProfile ? "Salvando sua jornada..." : "Ir para o meu painel →"}
            </button>
          ) : (
            <button
              onClick={() =>
                destino.kind === "profissionais"
                  ? saveProfileAndGoToProfissionais()
                  : goToVistos(destino.query)
              }
              disabled={destino.kind === "profissionais" && savingProfile}
              className="w-full bg-amber text-ink font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-200 hover:bg-amber-deep active:scale-95 shadow-sm disabled:opacity-60"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {destino.kind === "profissionais"
                ? (savingProfile ? "Salvando sua jornada..." : "Encontrar ajuda profissional →")
                : "Ver minha jornada em detalhe →"}
            </button>
          )}

          {/* Restart */}
          <button
            onClick={() => {
              sessionStorage.removeItem(ONBOARDING_STATE_KEY);
              setAnswers({});
              setHistory(["q_location"]);
              setPhase("welcome");
            }}
            className="text-sm text-ink-faint hover:text-ink-soft text-center transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            ↩ Recomeçar
          </button>

          {isSignedIn ? (
            <p
              className="text-xs text-ink-faint text-center leading-relaxed pb-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              As informações acima são educacionais e não constituem aconselhamento
              jurídico. Para orientação legal específica, consulte um advogado de
              imigração licenciado.
            </p>
          ) : (
            <p
              className="text-xs text-ink-faint text-center leading-relaxed pb-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <Link href="/termos" className="underline hover:text-ink-soft transition-colors">
                Termos de uso
              </Link>
            </p>
          )}
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

          {currentQuestion?.externalLink && (
            <a
              href={currentQuestion.externalLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center bg-amber text-ink font-bold py-3.5 px-6 rounded-2xl text-base mb-6 transition-all duration-200 hover:bg-amber-deep active:scale-95 shadow-sm"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {currentQuestion.externalLink.label}
            </a>
          )}

          <div className="flex flex-col gap-3 flex-1">
            {currentQuestion?.options.map((opt) => {
              const selected = currentAnswer === opt.value;
              const infoKey  = `${currentQuestionId}:${opt.value}`;
              const infoOpen = openInfo === infoKey;
              return (
                <div key={opt.value}>
                  <div className="relative">
                    <button
                      onClick={() => selectAnswer(opt.value)}
                      className={`w-full flex items-start gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150 ${
                        opt.info ? "pr-14" : ""
                      } ${
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
                    {opt.info && (
                      <button
                        type="button"
                        aria-label={`Mais informações sobre: ${opt.label}`}
                        aria-expanded={infoOpen}
                        onClick={() => setOpenInfo(infoOpen ? null : infoKey)}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center transition-colors ${
                          infoOpen
                            ? "border-pine bg-pine text-cream-2"
                            : "border-pine/40 bg-cream text-pine hover:bg-pine-tint"
                        }`}
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        i
                      </button>
                    )}
                  </div>
                  {opt.info && infoOpen && (
                    <div className="mt-2 mx-1 rounded-xl bg-pine-tint/50 border border-pine-tint px-4 py-3">
                      <p
                        className="text-xs text-ink-soft leading-relaxed"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {opt.info}
                      </p>
                    </div>
                  )}
                </div>
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
