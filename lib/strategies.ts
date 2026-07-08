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

  if (visaType === "f1") {
    return [
      {
        id: "f1_trabalho_nao_autorizado",
        icon: "🚫",
        badge: "INDISPONÍVEL",
        tone: "clay",
        availability: "bloqueado",
        title: "Trabalhar por conta própria de F-1 (freelance, aplicativo, cash)",
        description:
          "É a pergunta mais comum de quem está de F-1 apertado: 'posso fazer um extra?' A resposta honesta: não. Qualquer trabalho fora do campus sem autorização — freelance, aplicativo, dinheiro vivo, até a sua própria LLC operando — é violação grave de status.",
        blockedReason:
          "O regulamento só permite trabalho on-campus (20h/semana), CPT, OPT ou hardship autorizado (8 CFR §214.2(f)(9)). Trabalho não autorizado encerra o status, bloqueia o reinstatement e fecha portas que você vai querer abertas depois.",
        alternative: {
          label: "Os caminhos de trabalho legais: OPT, CPT e H-1B",
          manualSlug: "f1-para-h1b",
        },
      },
      {
        id: "f1_h1b",
        icon: "💼",
        badge: "CAMINHO ABERTO",
        tone: "pine",
        availability: "disponivel",
        title: "F-1 → H-1B: a ponte do estudo para o trabalho",
        description:
          "O caminho mais percorrido depois da formatura: OPT (12 meses, +24 se STEM) enquanto o empregador registra você na loteria do H-1B. Selecionado, o cap-gap segura seu status até o H-1B começar. E existe o atalho que pouca gente conhece: universidades e organizações de pesquisa são isentas da loteria o ano inteiro.",
        manualSlug: "f1-para-h1b",
        kits: [{ label: "Kit H-1B — mudança de status", kitId: "h1b-cos", status: "disponivel" }],
      },
      {
        id: "f1_reinstatement",
        icon: "🔄",
        badge: "DEPENDE",
        tone: "amber",
        availability: "condicional",
        title: "Caiu fora de status? O reinstatement tem janela e condições",
        description:
          "Perdeu o status por circunstância fora do seu controle — erro do DSO, doença, confusão com carga horária? O pedido de restauração (I-539) existe, mas tem regras duras: protocolar em até 5 meses da violação, e trabalho não autorizado mata o pedido. Passou dos 5 meses, a rota realista é sair e voltar com novo visto F-1 pelo consulado.",
        doesNot: [
          "Não funciona depois de 5 meses da violação, salvo circunstâncias excepcionais (8 CFR §214.2(f)(16))",
          "Não funciona se houve trabalho não autorizado",
        ],
      },
    ];
  }

  if (visaType === "j1") {
    return [
      {
        id: "j1_cos_212e_blocked",
        icon: "🚫",
        badge: "INDISPONÍVEL",
        tone: "clay",
        availability: "bloqueado",
        title: "Mudar de status dentro dos EUA com a regra dos 2 anos ativa",
        description:
          "Se o seu DS-2019 marca que você está sujeito à regra dos 2 anos (INA §212(e)) — por financiamento do governo ou treinamento médico —, a lei fecha três portas até você cumprir os 2 anos no Brasil ou conseguir o waiver: vistos H, L e K, o Green Card, e a mudança de status dentro dos EUA.",
        blockedReason:
          "Vedação prevista em lei federal (INA §212(e) e §248(a)). Mas atenção ao que ela NÃO fecha: obter F-1, O-1 ou visto de turista pelo consulado continua possível mesmo sujeito à regra.",
        alternative: {
          label: "J-1 → F-1: pelo waiver ou pelo consulado",
          manualSlug: "j1-para-f1",
        },
      },
      {
        id: "j1_f1",
        icon: "🎓",
        badge: "CAMINHO ABERTO",
        tone: "pine",
        availability: "disponivel",
        title: "J-1 → F-1: continuar estudando nos EUA",
        description:
          "Terminou o intercâmbio e quer ficar estudando — faculdade, mestrado, inglês acadêmico? O F-1 é a continuação natural. Sem a regra dos 2 anos, dá para mudar de status dentro dos EUA (I-539). Sujeito à regra, o caminho existe do mesmo jeito: waiver primeiro, ou aplicar o F-1 no consulado — que a regra dos 2 anos não bloqueia.",
        manualSlug: "j1-para-f1",
        kits: [{ label: "Kit F-1 — mudança de status (I-539)", kitId: "f1-cos", status: "disponivel" }],
      },
      {
        id: "j1_waiver",
        icon: "🔓",
        badge: "DEPENDE",
        tone: "amber",
        availability: "condicional",
        title: "Waiver da regra dos 2 anos: depende de quem pagou seu programa",
        description:
          "A chave que destrava as portas do §212(e) é o waiver por no-objection: o governo brasileiro declara que não se opõe à sua permanência. Para a maioria dos brasileiros, funciona. As exceções: programas financiados pelo governo AMERICANO raramente conseguem, e médicos em treinamento ECFMG não têm acesso a essa via.",
        doesNot: [
          "Não está disponível para médicos em treinamento de pós-graduação (ECFMG)",
          "Não costuma prosperar quando o programa foi financiado pelo governo dos EUA",
        ],
      },
    ];
  }

  if (visaType === "h1b") {
    return [
      {
        id: "h1b_trabalho_pos_negativa",
        icon: "🚫",
        badge: "INDISPONÍVEL",
        tone: "clay",
        availability: "bloqueado",
        title: "Continuar trabalhando depois da negativa da extensão",
        description:
          "É o erro mais comum — e o mais caro. Quem espera a extensão do H-1B pode trabalhar enquanto ela pende (regra dos 240 dias). Negada, a autorização morre no mesmo dia. Continuar 'só até resolver' é trabalho não autorizado, e é exatamente isso que contamina as outras portas.",
        blockedReason:
          "A autorização da regra dos 240 dias (8 CFR §274a.12(b)(20)) termina na negativa. Trabalho não autorizado pesa contra nova petição, mudança de status e até o ajuste por casamento em algumas categorias.",
        alternative: {
          label: "Trocar de empregador do jeito certo (portabilidade)",
          manualSlug: "h1b-transferencia",
        },
      },
      {
        id: "h1b_portabilidade",
        icon: "💼",
        badge: "CAMINHO ABERTO",
        tone: "pine",
        availability: "disponivel",
        title: "Trocar de empregador sem esperar aprovação (portabilidade)",
        description:
          "O H-1B não te prende ao empregador: com status válido, você pode começar no novo emprego assim que a nova petição é protocolada — sem esperar a aprovação (INA §214(n)). E quem já foi contado na loteria não passa por ela de novo. Perdeu o emprego? Você tem até 60 dias de grace period para o novo empregador protocolar.",
        manualSlug: "h1b-transferencia",
        kits: [{ label: "Kit H-1B — mudança de status", kitId: "h1b-cos", status: "disponivel" }],
      },
      {
        id: "h1b_alem_6_anos",
        icon: "⏳",
        badge: "DEPENDE",
        tone: "amber",
        availability: "condicional",
        title: "Passar do limite de 6 anos: depende do seu Green Card andando",
        description:
          "O H-1B tem teto de 6 anos — mas a lei abre exceção para quem já está no caminho do Green Card: PERM ou I-140 pendente há mais de 1 ano garante extensões anuais, e I-140 aprovado com fila no Boletim de Vistos garante extensões de 3 anos (acompanhe a fila no seu painel). O H-1B é visto de dupla intenção: buscar o Green Card não viola nada.",
        doesNot: [
          "Não funciona sem processo de Green Card em andamento — sem PERM/I-140, o teto de 6 anos vale (AC21 §§104(c) e 106)",
        ],
      },
    ];
  }

  if (visaType === "o1") {
    return [
      {
        id: "o1_autopeticao_blocked",
        icon: "🚫",
        badge: "INDISPONÍVEL",
        tone: "clay",
        availability: "bloqueado",
        title: "Aplicar o O-1 sozinho, sem empregador ou agente",
        description:
          "O desejo mais comum de artistas, criadores e autônomos: 'quero peticionar meu próprio O-1'. A lei não permite — a petição precisa vir de um empregador ou agente AMERICANO. Mas a porta da auto-petição existe: ela fica no Green Card, não no visto.",
        blockedReason:
          "O regulamento exige peticionário americano — empregador ou agente (8 CFR §214.2(o)(2)(i)). Auto-petição de verdade existe no EB-1A e no EB-2 NIW, onde você mesmo protocola o I-140.",
        alternative: {
          label: "Auto-petição de Green Card: EB-1A e EB-2 NIW",
          manualSlug: "o1-autopeticao-greencard",
        },
      },
      {
        id: "o1_greencard",
        icon: "🏆",
        badge: "CAMINHO ABERTO",
        tone: "pine",
        availability: "disponivel",
        title: "Do O-1 ao Green Card: EB-1A e EB-2 NIW, sem empregador",
        description:
          "O O-1 combina com a busca do Green Card: ter um I-140 pendente ou aprovado não prejudica seu status nem suas renovações (8 CFR §214.2(o)(13)). E as duas rotas naturais são auto-petição — EB-1A para quem está no topo da área, EB-2 NIW para quem tem trabalho de importância nacional. Nenhuma exige empregador ou PERM.",
        manualSlug: "o1-autopeticao-greencard",
        kits: [{ label: "Kit EB-2 NIW — auto-petição", kitId: "eb2niw", status: "disponivel" }],
      },
      {
        id: "o1_nova_peticao",
        icon: "🔄",
        badge: "DEPENDE",
        tone: "amber",
        availability: "condicional",
        title: "O-1 negado? A negativa diz exatamente o que faltou",
        description:
          "Negativa de O-1 quase nunca é 'você não serve' — é 'faltou evidência nos critérios X e Y'. Não existe loteria nem limite de tentativas: uma nova petição atacando exatamente os pontos fracos apontados é a rota padrão. O texto da negativa é o seu mapa; leve-o à conversa com o profissional.",
        doesNot: [
          "Não dispensa o peticionário americano — a nova petição também precisa de empregador ou agente",
          "Não restaura autorização de trabalho perdida enquanto a nova petição pende",
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
