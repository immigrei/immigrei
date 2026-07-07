/**
 * Strategic options engine
 *
 * Maps a monitored-case event (today: a denial detected by the USCIS cron)
 * to strategic options the user should know about — deadlines, defensive
 * paths and plain-Portuguese explanations of what each option does and,
 * just as important, what it does NOT do.
 *
 * This is educational content, not legal advice. Every card links the user
 * to a professional before acting.
 */

export type StrategyTone = "clay" | "amber" | "pine";

/**
 * Whether a path is legally open for this user.
 * "bloqueado" cards stay VISIBLE with the reason — a closed door explained
 * builds more trust than a hidden one (same pattern as E-2 for Brazilians
 * in onboarding). Every blocked card points to the door that IS open.
 */
export type PathAvailability = "disponivel" | "condicional" | "bloqueado";

export type StrategyDeadline = {
  label: string;
  dueDate: Date;
  daysLeft: number; // negative = expired
};

export type StrategyPath = {
  title: string;
  description: string;
};

export type StrategyKit = {
  label: string;
  kitId?: string; // links to /documentos/{kitId} when available
  status: "disponivel" | "em_breve";
};

export type StrategyOption = {
  id: string;
  icon: string;
  badge: string; // short uppercase chip, e.g. "PRAZO"
  tone: StrategyTone;
  title: string;
  description: string;
  paths?: StrategyPath[];
  does?: string[]; // "o que isso faz"
  doesNot?: string[]; // "o que isso NÃO faz"
  deadline?: StrategyDeadline;
  kits?: StrategyKit[];
  link?: { href: string; label: string };
  availability?: PathAvailability; // omitted = "disponivel"
  blockedReason?: string; // plain-PT why the law closes this door (cite the rule)
  manualSlug?: string; // /caminhos/{slug} — the free manual shown before the kit
  alternative?: { label: string; manualSlug: string }; // the door that opens when this one closes
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * I-290B (motion to reopen/reconsider) window: 30 days from the decision,
 * plus 3 days when the decision was mailed — 33 days in practice.
 */
const MOTION_WINDOW_DAYS = 33;

function motionDeadline(statusDate?: string | null): StrategyDeadline | undefined {
  if (!statusDate) return undefined;
  const decided = new Date(statusDate); // USCIS format: "July 10, 2025"
  if (isNaN(decided.getTime())) return undefined;
  const dueDate = new Date(decided.getTime() + MOTION_WINDOW_DAYS * DAY_MS);
  const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / DAY_MS);
  return { label: "Prazo para protocolar o I-290B", dueDate, daysLeft };
}

/**
 * Strategic options for a case the USCIS denied.
 * `statusDate` is the decision date as reported by USCIS (used for the
 * motion-to-reopen countdown).
 */
export function getDeniedCaseStrategies(statusDate?: string | null): StrategyOption[] {
  const deadline = motionDeadline(statusDate);

  return [
    {
      id: "motion_i290b",
      icon: "⏱️",
      badge: "PRAZO",
      tone: "clay",
      title: "Pedido de reabertura ou reconsideração (I-290B)",
      description:
        "Você tem 33 dias a partir da data da decisão (30 dias + 3 quando ela chega por correio) para pedir que o USCIS reveja o caso. Seja honesto consigo: na maioria dos casos a decisão original é mantida, e muitos advogados recomendam guardar tempo e dinheiro para um caminho melhor. Mas o prazo é curto — decida com orientação profissional antes que ele expire.",
      deadline,
      doesNot: [
        "Não devolve seu status enquanto está pendente",
        "Não pausa o acúmulo de presença irregular",
      ],
    },
    {
      id: "understand_nta",
      icon: "📘",
      badge: "ENTENDA",
      tone: "pine",
      title: "Negativa não é ordem de deportação",
      description:
        "Uma negativa deixa você fora de status e o relógio da presença irregular começa a contar — mas ela não é uma Notificação de Comparecimento (NTA), o documento que inicia um processo de remoção perante o juiz de imigração. São coisas diferentes, com consequências diferentes. Se uma NTA chegar pelo correio, não ignore: procure um advogado imediatamente — faltar à audiência gera ordem de remoção automática.",
      does: [
        "Fora de status ≠ processo de remoção",
        "Presença irregular só vira barreira de 3 ou 10 anos se você sair dos EUA",
      ],
    },
    {
      id: "family_i130",
      icon: "💍",
      badge: "ESTRATÉGIA",
      tone: "amber",
      title: "Casou com cidadão americano ou residente? Existe um caminho",
      description:
        "Muita gente acredita que só casamento com cidadão americano resolve. Não é bem assim — o caminho existe nos dois casos, só muda a estratégia e o tempo:",
      paths: [
        {
          title: "Cônjuge cidadão americano",
          description:
            "Você é considerado parente imediato: pode protocolar o I-130 e o I-485 (Green Card) juntos, e o tempo fora de status é perdoado no ajuste — desde que sua última entrada nos EUA tenha sido legal. O I-485 pendente congela o relógio da presença irregular e permite pedir autorização de trabalho.",
        },
        {
          title: "Cônjuge com Green Card (residente)",
          description:
            "Enquanto você estiver fora de status, não dá para protocolar o I-485 nesta categoria (F2A). Mas protocolar o I-130 agora ainda vale muito: cria o registro do casamento perto dos fatos, é o argumento mais forte se uma Notificação de Comparecimento (NTA) chegar, e quando seu cônjuge se naturalizar a petição converte automaticamente para parente imediato — sem refazer nada, destravando o I-485 na hora.",
        },
      ],
      doesNot: [
        "O I-130 sozinho não congela a presença irregular nem dá permissão de trabalho — só o I-485 pendente faz isso",
        "Sair dos EUA antes do Green Card pode ativar barreiras de reentrada de 3 ou 10 anos",
      ],
      kits: [
        { label: "Kit I-130 — cônjuge de cidadão (com I-485)", status: "em_breve" },
        { label: "Kit I-130 — cônjuge de residente (F2A)", status: "em_breve" },
      ],
    },
    {
      id: "talk_to_lawyer",
      icon: "🧭",
      badge: "PRÓXIMO PASSO",
      tone: "pine",
      title: "Converse com um profissional antes de agir",
      description:
        "Cada caso tem detalhes que mudam a estratégia — como você entrou nos EUA, quem é seu cônjuge, quanto tempo se passou. Entendemos o mapa; um advogado de imigração conhece o seu terreno. Leve estas opções para a conversa e ganhe tempo (e dinheiro) na consulta.",
      link: { href: "/profissionais", label: "Ver profissionais verificados →" },
    },
  ];
}

/**
 * Visa-specific paths — doors that only make sense (or are only CLOSED) for
 * the visa the user holds. Rendered ABOVE the generic alternative paths.
 * Source of truth for the legal facts: content/leis (vistos/{visa}.md and
 * negativas/{visa}-negado.md). Every entry demonstrates one of the three
 * availability states so the pattern replicates cleanly to other visas.
 */
export function getVisaSpecificPaths(visaType?: string | null): StrategyOption[] {
  if (visaType === "m1") {
    return [
      {
        id: "m1_cos_f1_blocked",
        icon: "🚫",
        badge: "INDISPONÍVEL",
        tone: "clay",
        availability: "bloqueado",
        title: "Mudar de M-1 para F-1 dentro dos EUA",
        description:
          "É a pergunta mais comum de quem está de M-1 — e a resposta é dura, mas é melhor você saber agora: a lei proíbe expressamente a mudança de status de estudante vocacional (M-1) para acadêmico (F-1) dentro dos EUA, sem exceção.",
        blockedReason:
          "Vedação prevista em regulamento federal (8 CFR §248.1). Nenhum advogado, formulário ou taxa muda isso — pedidos assim são negados, e você perde tempo e dinheiro.",
        alternative: {
          label: "F-1 pelo consulado no Brasil",
          manualSlug: "m1-para-f1-consulado",
        },
      },
      {
        id: "m1_f1_consulado",
        icon: "🎓",
        badge: "CAMINHO ABERTO",
        tone: "pine",
        availability: "disponivel",
        title: "F-1 pelo consulado — a porta que continua aberta",
        description:
          "Quer migrar do curso técnico para faculdade, inglês acadêmico ou qualquer programa acadêmico? O caminho existe: sair dos EUA, aplicar o F-1 no consulado no Brasil e voltar como estudante acadêmico. Feito no momento certo — antes do relógio da presença irregular virar barreira — é uma troca segura e comum.",
        manualSlug: "m1-para-f1-consulado",
        kits: [{ label: "Kit F-1 pelo consulado", kitId: "f1", status: "disponivel" }],
      },
      {
        id: "m1_h_conditional",
        icon: "💼",
        badge: "DEPENDE",
        tone: "amber",
        availability: "condicional",
        title: "M-1 → visto de trabalho H: depende de onde veio sua qualificação",
        description:
          "Aqui a lei tem uma pegadinha: se foi o SEU CURSO no M-1 que te qualificou para a vaga (ex.: escola de aviação → vaga de piloto), a mudança para o H é vedada. Se a qualificação veio de antes — diploma ou experiência do Brasil — a porta existe. É exatamente o tipo de detalhe para confirmar com um profissional antes de investir.",
        doesNot: [
          "Não funciona quando o treinamento vocacional do M-1 é a base da qualificação para o H (8 CFR §248.1)",
        ],
      },
    ];
  }

  return [];
}

/**
 * Proactive paths — shown to users with VALID status too, not only after a
 * denial. The goal: most immigrants only know the path they're on. Showing
 * the parallel doors (marriage-based, employer-based, self-petition, lottery)
 * is the "clareza" the product promises — and each door maps to a kit.
 */
export function getAlternativePaths(profile?: {
  location?: "brasil" | "eua" | null;
}): StrategyOption[] {
  const inUs = profile?.location !== "brasil";

  return [
    {
      id: "path_marriage",
      icon: "💍",
      badge: "FAMÍLIA",
      tone: "amber",
      title: "Green Card por casamento — com cidadão OU residente",
      description:
        "Muita gente acredita que só casamento com cidadão americano leva ao Green Card. Não é verdade — cônjuge de residente (Green Card holder) também peticiona. O que muda é a estratégia, e ela depende do seu status:",
      paths: [
        {
          title: "Cônjuge de cidadão americano",
          description:
            "Parente imediato: I-130 e I-485 protocolados juntos, sem fila. Se sua última entrada nos EUA foi legal, até um período fora de status é perdoado no ajuste.",
        },
        {
          title: "Cônjuge de residente — você COM status válido",
          description:
            "Categoria F2A. Quando ela está 'Current' no Boletim de Vistos (acompanhe no seu painel), dá para protocolar I-130 + I-485 juntos, sem esperar — mas você precisa manter o status válido até o protocolo do I-485.",
        },
        {
          title: "Cônjuge de residente — você SEM status",
          description:
            "Fora de status, o ajuste em F2A é bloqueado. As saídas: protocolar o I-130 agora (protege e guarda seu lugar) e aguardar a naturalização do cônjuge — a petição converte automaticamente para parente imediato, destravando o I-485.",
        },
      ],
      doesNot: [
        "Casamento precisa ser genuíno — o USCIS investiga; fraude bane o Green Card para sempre",
      ],
      kits: [
        { label: "Kit I-130 — cônjuge de cidadão (com I-485)", status: "em_breve" },
        { label: "Kit I-130 — cônjuge de residente (F2A, com ou sem status)", status: "em_breve" },
      ],
    },
    {
      id: "path_employer",
      icon: "🏢",
      badge: "TRABALHO",
      tone: "pine",
      title: "Green Card por patrocínio de empregador (EB-2 / EB-3)",
      description:
        "Se um empregador americano topa patrocinar, o caminho é o PERM (certificação de trabalho) seguido do I-140 e, com o Boletim de Vistos favorável, o I-485. Funciona a partir de qualquer status de trabalho válido (H-1B, L-1, O-1…) — e diferente do H-1B, não tem sorteio.",
      does: [
        "Você pode conversar com o empregador a qualquer momento — o processo é dele, mas a iniciativa costuma ser sua",
        "H-1B com PERM em andamento pode estender o status além dos 6 anos",
      ],
      doesNot: ["O processo completo costuma levar de 2 a 4 anos — comece antes de precisar"],
      kits: [{ label: "Kit Green Card por empregador (PERM/EB-2/EB-3)", status: "em_breve" }],
    },
    {
      id: "path_niw",
      icon: "⭐",
      badge: "MÉRITO",
      tone: "pine",
      title: "EB-2 NIW — Green Card sem empregador e sem sorteio",
      description:
        "Se você tem mestrado/doutorado ou experiência sólida e seu trabalho beneficia os EUA, pode peticionar o próprio Green Card (I-140 NIW) — sem depender de patrocínio. É o caminho favorito de pesquisadores, engenheiros, profissionais de saúde e empreendedores brasileiros.",
      kits: [
        {
          label: "Kit EB-2 NIW",
          kitId: inUs ? "eb2niw" : "eb2niw-brasil",
          status: "disponivel",
        },
      ],
    },
    {
      id: "path_dv_lottery",
      icon: "🎲",
      badge: "LOTERIA",
      tone: "amber",
      title: "DV Lottery — a porta gratuita que quase ninguém tenta",
      description:
        "Brasileiros são elegíveis à loteria anual de Green Cards. A inscrição é gratuita e abre normalmente em outubro, no site oficial dvprogram.state.gov. As chances individuais são baixas — mas o custo é zero, e todo ano brasileiros ganham. Inscreva-se sempre.",
      doesNot: [
        "Sites que cobram pela inscrição são intermediários (ou golpe) — a inscrição oficial é gratuita",
      ],
    },
  ];
}
