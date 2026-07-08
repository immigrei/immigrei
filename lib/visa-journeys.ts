/**
 * Visa journey maps
 *
 * Static journey data per visa type (keyed by the onboarding visa_type value).
 * Each journey lists the real steps of that immigration path, plus the step
 * where a typical Immigrei user stands today (already in the US with that
 * status — see currentStepId).
 *
 * Content guidelines: PT-BR, no legal jargon, no legal advice. Sources are
 * always official (uscis.gov / travel.state.gov).
 */

export type JourneyStep = {
  id: string;
  title: string;
  description: string;
  docs?: string[];
  uscisUrl?: string;
  avgDays?: number; // typical USCIS processing time, when meaningful
};

export type VisaJourney = {
  visaType: string;      // onboarding value (f1, h1b, ...)
  name: string;          // display name
  currentStepId: string; // where a user who already holds this status stands
  steps: JourneyStep[];
};

export const VISA_JOURNEYS: Record<string, VisaJourney> = {
  f1: {
    visaType: "f1",
    name: "F-1 — Estudante",
    currentStepId: "manter_status",
    steps: [
      {
        id: "aceite_escola",
        title: "Aceite na escola e I-20",
        description: "A escola aprovada pelo SEVP emite o formulário I-20, que comprova sua vaga.",
        docs: ["Carta de aceite", "Formulário I-20"],
      },
      {
        id: "sevis",
        title: "Pagamento da taxa SEVIS (I-901)",
        description: "Taxa obrigatória do sistema SEVIS antes da entrevista no consulado.",
        uscisUrl: "https://www.fmjfee.com",
      },
      {
        id: "consulado",
        title: "Entrevista no consulado",
        description: "Formulário DS-160, agendamento e entrevista para o carimbo do visto F-1.",
        docs: ["DS-160", "I-20", "Comprovantes financeiros"],
      },
      {
        id: "entrada",
        title: "Entrada nos EUA",
        description: "Você pode entrar até 30 dias antes do início das aulas.",
      },
      {
        id: "manter_status",
        title: "Manter o status de estudante",
        description: "Matrícula em tempo integral e progresso acadêmico mantêm seu F-1 válido.",
      },
      {
        id: "opt_cpt",
        title: "CPT / OPT — trabalhar como estudante",
        description: "CPT durante o curso e OPT (até 12 meses, ou +24 com STEM) depois de formar.",
        docs: ["Formulário I-765 (para OPT)"],
        uscisUrl: "https://www.uscis.gov/i-765",
        avgDays: 90,
      },
      {
        id: "proximo_passo",
        title: "Próximo passo da jornada",
        description: "Transição para H-1B, O-1 ou Green Card, dependendo do seu caminho.",
      },
    ],
  },

  h1b: {
    visaType: "h1b",
    name: "H-1B — Trabalho especializado",
    currentStepId: "manter_status",
    steps: [
      {
        id: "loteria",
        title: "Registro na loteria H-1B",
        description: "Seu empregador registra você na seleção eletrônica, geralmente em março.",
      },
      {
        id: "i129",
        title: "Petição I-129",
        description: "Selecionado na loteria, o empregador envia a petição I-129 ao USCIS.",
        docs: ["Formulário I-129", "LCA certificada", "Diploma e credenciais"],
        uscisUrl: "https://www.uscis.gov/i-129",
        avgDays: 60,
      },
      {
        id: "aprovacao",
        title: "Aprovação do USCIS",
        description: "O USCIS emite o I-797 (Approval Notice) confirmando sua autorização.",
      },
      {
        id: "consulado",
        title: "Carimbo no consulado (se fora dos EUA)",
        description: "Quem está fora dos EUA agenda entrevista para carimbar o visto no passaporte.",
      },
      {
        id: "manter_status",
        title: "Trabalhando em status H-1B",
        description: "Válido por até 3 anos, renovável até 6. Mudança de empregador exige nova petição.",
      },
      {
        id: "extensao",
        title: "Extensão ou transferência",
        description: "Extensões além de 6 anos são possíveis com o processo de Green Card em andamento.",
        avgDays: 60,
      },
      {
        id: "green_card",
        title: "Caminho para o Green Card",
        description: "PERM + I-140 (EB-2/EB-3) patrocinado pelo empregador, ou EB-2 NIW por conta própria.",
        uscisUrl: "https://www.uscis.gov/i-140",
      },
    ],
  },

  o1: {
    visaType: "o1",
    name: "O-1 — Talento extraordinário",
    currentStepId: "manter_status",
    steps: [
      {
        id: "evidencias",
        title: "Coleta de evidências",
        description: "Prêmios, publicações, imprensa, cartas de especialistas — o coração do caso O-1.",
      },
      {
        id: "agente",
        title: "Definir empregador ou agente",
        description: "O O-1 exige um peticionário nos EUA: empresa empregadora ou agente.",
      },
      {
        id: "i129",
        title: "Petição I-129 + consulta sindical",
        description: "Petição ao USCIS com a opinião consultiva (advisory opinion) da área.",
        docs: ["Formulário I-129", "Portfólio de evidências", "Advisory opinion"],
        uscisUrl: "https://www.uscis.gov/i-129",
        avgDays: 45,
      },
      {
        id: "aprovacao",
        title: "Aprovação do USCIS",
        description: "I-797 aprovado — válido por até 3 anos por evento ou projeto.",
      },
      {
        id: "manter_status",
        title: "Trabalhando em status O-1",
        description: "Renovável em incrementos de 1 ano, sem limite máximo de tempo.",
      },
      {
        id: "green_card",
        title: "Caminho para o Green Card",
        description: "O perfil O-1 costuma sustentar um caso EB-1A ou EB-2 NIW.",
        uscisUrl: "https://www.uscis.gov/i-140",
      },
    ],
  },

  l1: {
    visaType: "l1",
    name: "L-1 — Transferência intraempresarial",
    currentStepId: "manter_status",
    steps: [
      {
        id: "tempo_empresa",
        title: "1 ano na empresa no exterior",
        description: "Requisito: 1 ano contínuo nos últimos 3 na empresa fora dos EUA.",
      },
      {
        id: "i129",
        title: "Petição I-129",
        description: "A empresa nos EUA peticiona sua transferência como executivo (L-1A) ou especialista (L-1B).",
        docs: ["Formulário I-129", "Prova de vínculo entre as empresas"],
        uscisUrl: "https://www.uscis.gov/i-129",
        avgDays: 60,
      },
      {
        id: "consulado",
        title: "Carimbo no consulado",
        description: "Entrevista e visto no passaporte para entrar nos EUA.",
      },
      {
        id: "manter_status",
        title: "Trabalhando em status L-1",
        description: "L-1A: até 7 anos. L-1B: até 5 anos. O cônjuge (L-2) pode trabalhar.",
      },
      {
        id: "green_card",
        title: "Caminho para o Green Card",
        description: "Executivos L-1A têm caminho direto pelo EB-1C, sem PERM.",
        uscisUrl: "https://www.uscis.gov/i-140",
      },
    ],
  },

  b1b2: {
    visaType: "b1b2",
    name: "B-1/B-2 — Turismo ou negócios",
    currentStepId: "prazo_i94",
    steps: [
      {
        id: "entrada",
        title: "Entrada nos EUA",
        description: "Na chegada, o oficial define seu prazo de permanência no I-94.",
        uscisUrl: "https://i94.cbp.dhs.gov",
      },
      {
        id: "prazo_i94",
        title: "Respeitar o prazo do I-94",
        description: "O prazo que vale é o do I-94, não o do visto. Confira o seu online.",
        uscisUrl: "https://i94.cbp.dhs.gov",
      },
      {
        id: "extensao",
        title: "Extensão de permanência (I-539)",
        description: "É possível pedir extensão antes do I-94 vencer, com justificativa.",
        docs: ["Formulário I-539"],
        uscisUrl: "https://www.uscis.gov/i-539",
        avgDays: 120,
      },
      {
        id: "mudanca_status",
        title: "Mudança de status",
        description: "Estudar (F-1), trabalhar (H-1B e outros) ou outros caminhos exigem mudança de status antes do prazo vencer.",
      },
    ],
  },

  green_card: {
    visaType: "green_card",
    name: "Green Card — Residente permanente",
    currentStepId: "manter_residencia",
    steps: [
      {
        id: "manter_residencia",
        title: "Manter a residência permanente",
        description: "Evite ausências longas dos EUA e mantenha o cartão válido.",
      },
      {
        id: "renovacao",
        title: "Renovação do cartão (I-90)",
        description: "O cartão vale 10 anos. Renove com o formulário I-90.",
        docs: ["Formulário I-90"],
        uscisUrl: "https://www.uscis.gov/i-90",
        avgDays: 365,
      },
      {
        id: "elegibilidade",
        title: "Elegibilidade para a cidadania",
        description: "Em geral: 5 anos como residente (ou 3, se casado com cidadão americano).",
      },
      {
        id: "n400",
        title: "Naturalização (N-400)",
        description: "Formulário N-400, biometria, entrevista e teste de civismo e inglês.",
        docs: ["Formulário N-400"],
        uscisUrl: "https://www.uscis.gov/n-400",
        avgDays: 180,
      },
      {
        id: "juramento",
        title: "Cerimônia de juramento",
        description: "O passo final: você se torna cidadão americano. 🇺🇸",
      },
    ],
  },

  citizen: {
    visaType: "citizen",
    name: "Cidadão americano",
    currentStepId: "cidadania_ativa",
    steps: [
      {
        id: "cidadania_ativa",
        title: "Cidadania americana ativa 🇺🇸",
        description: "Você tem plenos direitos nos EUA — a sua jornada agora é abrir caminhos para quem você ama.",
      },
      {
        id: "passaporte",
        title: "Passaporte americano",
        description: "Se ainda não tem, o passaporte é a prova de cidadania mais prática para viagens e petições.",
        docs: ["Formulário DS-11 (primeira via)"],
      },
      {
        id: "peticao_familiar",
        title: "Petição de familiares (I-130 / I-129F)",
        description: "Cônjuge, pais e filhos menores solteiros não entram em fila. Noivo(a) no exterior: K-1 via I-129F.",
        docs: ["Formulário I-130", "Formulário I-129F (noivo/a)"],
        uscisUrl: "https://www.uscis.gov/i-130",
        avgDays: 400,
      },
      {
        id: "chegada_familia",
        title: "Chegada e Green Card da família",
        description: "Após a aprovação, o familiar ajusta status nos EUA (I-485) ou finaliza pelo consulado (NVC/DS-260).",
      },
    ],
  },

  asylee: {
    visaType: "asylee",
    name: "Asilo ou refúgio",
    currentStepId: "aguardando",
    steps: [
      {
        id: "i589",
        title: "Pedido de asilo (I-589)",
        description: "Deve ser apresentado, em regra, até 1 ano após a chegada aos EUA.",
        docs: ["Formulário I-589", "Evidências do caso"],
        uscisUrl: "https://www.uscis.gov/i-589",
      },
      {
        id: "ead",
        title: "Autorização de trabalho (I-765)",
        description: "Você pode pedir o EAD 150 dias após protocolar o asilo.",
        docs: ["Formulário I-765"],
        uscisUrl: "https://www.uscis.gov/i-765",
        avgDays: 90,
      },
      {
        id: "aguardando",
        title: "Aguardando entrevista ou audiência",
        description: "Caso afirmativo: entrevista no USCIS. Caso defensivo: audiências na corte de imigração.",
      },
      {
        id: "decisao",
        title: "Decisão do caso",
        description: "Asilo concedido garante permanência e caminho para o Green Card.",
      },
      {
        id: "green_card",
        title: "Green Card (I-485)",
        description: "1 ano após a concessão do asilo, você pode pedir a residência permanente.",
        docs: ["Formulário I-485"],
        uscisUrl: "https://www.uscis.gov/i-485",
        avgDays: 300,
      },
    ],
  },

  j1: {
    visaType: "j1",
    name: "J-1 — Intercâmbio",
    currentStepId: "manter_status",
    steps: [
      {
        id: "patrocinador",
        title: "Programa com patrocinador (DS-2019)",
        description: "Um sponsor autorizado emite o DS-2019 — base do seu J-1.",
        docs: ["Formulário DS-2019"],
      },
      {
        id: "sevis",
        title: "Pagamento da taxa SEVIS (I-901)",
        description: "Taxa obrigatória antes da entrevista no consulado.",
        uscisUrl: "https://www.fmjfee.com",
      },
      {
        id: "consulado",
        title: "Entrevista no consulado",
        description: "DS-160, agendamento e entrevista para o visto J-1.",
        docs: ["DS-160", "DS-2019"],
      },
      {
        id: "manter_status",
        title: "No programa, em status J-1",
        description: "Siga as regras do programa. Atenção à regra dos 2 anos (212(e)), se aplicável ao seu caso.",
      },
      {
        id: "waiver_ou_retorno",
        title: "Waiver ou retorno ao Brasil",
        description: "Se a regra dos 2 anos se aplica, é preciso cumprí-la ou pedir waiver antes de mudar de status.",
        docs: ["Formulário DS-3035 (waiver)"],
      },
      {
        id: "proximo_passo",
        title: "Próximo passo da jornada",
        description: "Transição para F-1, H-1B, O-1 ou Green Card, conforme seu caminho.",
      },
    ],
  },

  eb2niw: {
    visaType: "eb2niw",
    name: "EB-2 NIW — Green Card por mérito",
    currentStepId: "preparacao",
    steps: [
      {
        id: "preparacao",
        title: "Preparar o caso",
        description: "Pós-graduação (ou habilidade excepcional) + evidências de que seu trabalho beneficia os EUA.",
        docs: ["Diplomas", "Cartas de recomendação", "Publicações e provas de impacto"],
      },
      {
        id: "i140",
        title: "Petição I-140 (NIW)",
        description: "Você mesmo peticiona — sem precisar de empregador patrocinador.",
        docs: ["Formulário I-140", "Petition letter"],
        uscisUrl: "https://www.uscis.gov/i-140",
        avgDays: 300,
      },
      {
        id: "fila",
        title: "Aguardar a data de prioridade",
        description: "Brasileiros entram na fila 'Rest of World' do EB-2 — acompanhe no Visa Bulletin aqui no Immigrei.",
      },
      {
        id: "i485",
        title: "Ajuste de status (I-485) ou consulado",
        description: "Nos EUA: I-485. Fora: processo consular via NVC.",
        docs: ["Formulário I-485", "Exame médico (I-693)"],
        uscisUrl: "https://www.uscis.gov/i-485",
        avgDays: 300,
      },
      {
        id: "green_card",
        title: "Green Card aprovado",
        description: "Residência permanente — e o relógio da cidadania começa a contar. 🇺🇸",
      },
    ],
  },

  outro: {
    visaType: "outro",
    name: "Situação em definição",
    currentStepId: "entender",
    steps: [
      {
        id: "entender",
        title: "Entender sua situação atual",
        description: "Reúna seus documentos: I-94, vistos anteriores, petições e prazos.",
        uscisUrl: "https://i94.cbp.dhs.gov",
      },
      {
        id: "mapear",
        title: "Mapear os caminhos possíveis",
        description: "Estudo, trabalho, família ou investimento — cada porta tem requisitos próprios.",
      },
      {
        id: "profissional",
        title: "Falar com um profissional de confiança",
        description: "Para casos complexos, uma consulta certa vale mais que mil buscas no Google.",
      },
    ],
  },
};

// Map /vistos selection ids and onboarding values to a journey
const JOURNEY_ALIASES: Record<string, string> = {
  b1: "b1b2",
  other: "outro",
  asilo: "asylee",
};

export function getJourney(visaType: string): VisaJourney | null {
  return VISA_JOURNEYS[visaType] ?? VISA_JOURNEYS[JOURNEY_ALIASES[visaType]] ?? null;
}
