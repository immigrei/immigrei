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

export type StrategyDeadline = {
  label: string;
  dueDate: Date;
  daysLeft: number; // negative = expired
};

export type StrategyPath = {
  title: string;
  description: string;
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
    },
    {
      id: "talk_to_lawyer",
      icon: "🧭",
      badge: "PRÓXIMO PASSO",
      tone: "pine",
      title: "Converse com um profissional antes de agir",
      description:
        "Cada caso tem detalhes que mudam a estratégia — como você entrou nos EUA, quem é seu cônjuge, quanto tempo se passou. Entendemos o mapa; um advogado de imigração conhece o seu terreno. Leve estas opções para a conversa e ganhe tempo (e dinheiro) na consulta.",
    },
  ];
}
