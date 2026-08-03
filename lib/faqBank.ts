// Banco de perguntas frequentes usado pela busca in-app (app/api/search) para
// mostrar um texto de resposta em linguagem natural acima dos cards, quando a
// pergunta do usuário bate com uma dessas. Todo texto aqui é pré-escrito e
// revisado — não é gerado em tempo real por LLM (ver plano de implementação,
// 2 ago 2026: risco de UPL sem gate de revisão por busca, além de custo e
// latência extra sem necessidade real).
//
// Conteúdo revisado pelo subagent compliance-fact-check em
// content/marketing/drafts/faq-busca-vistos.md (PASS_WITH_FLAGS — flags
// resolvidas removendo as 2 afirmações sobre H-1B sem fonte rastreável, ver
// nota de processo naquele arquivo) antes de ser transcrito pra cá.
//
// `fonte` é só rastreabilidade (não exibida ao usuário) — cada resposta
// nunca introduz um fato que não esteja no arquivo de content/leis citado.

export interface FaqEntry {
  id: string;
  categoria: string;
  pergunta: string;
  resposta: string;
  /** ids de vistos/kits/caminhos (lib/vistosCatalog.ts, lib/kitsCatalog.ts, lib/manuais.ts) — usados só pra reordenar cards já retornados, nunca pra injetar novos. */
  vistosRelacionados: string[];
  fonte: string;
}

export const FAQ_BANK: FaqEntry[] = [
  {
    id: "f1-trabalho-campus",
    categoria: "trabalho durante o visto",
    pergunta: "Posso trabalhar com visto de estudante?",
    resposta:
      "No campus, sim — até 20 horas por semana enquanto você estuda em tempo integral. Fora do campus, só com autorização: CPT durante o curso ou OPT depois de formado. Trabalhar sem essa autorização é considerado violação grave do status.",
    vistosRelacionados: ["f1", "f1-opt"],
    fonte: "content/leis/vistos/f1.md",
  },
  {
    id: "f1-opt-duracao",
    categoria: "trabalho durante o visto",
    pergunta: "Quanto tempo posso trabalhar depois de formado com OPT?",
    resposta:
      "O OPT dá 12 meses de autorização de trabalho ligada à sua área de estudo. Quem se formou em curso da lista STEM pode estender por mais 24 meses. O pedido (formulário I-765) tem uma janela específica: entre 90 dias antes e 60 dias depois da data de conclusão do curso.",
    vistosRelacionados: ["f1-opt"],
    fonte: "content/leis/vistos/f1.md",
  },
  {
    id: "visto-vencido-status",
    categoria: "status e prazos",
    pergunta: "Meu visto venceu, ainda posso ficar nos EUA?",
    resposta:
      "Visto e status são coisas diferentes. O visto é só o carimbo que permite pedir entrada na fronteira — pode vencer com você já dentro dos EUA sem problema nenhum. Quem decide se você está em situação regular é o status, definido pela data no seu I-94, não pela validade do visto. Vale sempre conferir o I-94 direto em i94.cbp.dhs.gov.",
    vistosRelacionados: [],
    fonte: "content/leis/conceitos/status-vs-visto.md",
  },
  {
    id: "overstay-presenca-irregular",
    categoria: "overstay e situação irregular",
    pergunta: "Fiquei mais tempo que podia nos EUA, sou ilegal?",
    resposta:
      "Depende do seu tipo de visto. Hoje, quem está em F-1 ou J-1 não acumula presença irregular automaticamente ao passar do prazo — isso só conta depois de uma decisão formal do USCIS ou de um juiz de imigração. Já em H-1B, M-1, B-1/B-2 e a maioria dos outros vistos, o relógio começa a contar sozinho a partir da data do I-94. Essa diferença muda a partir de setembro de 2026, quando uma nova regra passa a valer para F-1/J-1 também.",
    vistosRelacionados: ["overstay-sem-vinculo"],
    fonte: "content/leis/conceitos/unlawful-presence.md",
  },
  {
    id: "overstay-barra-3-10-anos",
    categoria: "overstay e situação irregular",
    pergunta: "Quanto tempo de overstay pra ficar barrado de voltar aos EUA?",
    resposta:
      "As barras só entram em jogo se você sair dos EUA depois de acumular presença irregular: mais de 180 dias gera barra de 3 anos pra voltar; um ano ou mais gera barra de 10 anos. Enquanto você permanece dentro dos EUA sem sair, essas barras não são acionadas — e quem ajusta status por dentro (por exemplo, casando com cidadão americano) pode nunca chegar a acioná-las.",
    vistosRelacionados: ["overstay-sem-vinculo"],
    fonte: "content/leis/conceitos/unlawful-presence.md",
  },
  {
    id: "h1b-vale-a-pena-brasileiro",
    categoria: "trabalho especializado",
    pergunta: "Vale a pena tentar visto H1B sendo brasileiro?",
    resposta:
      "A dificuldade do H-1B está em duas exigências: um empregador americano disposto a peticionar por você, e ser sorteado no processo anual — 65 mil vagas, mais 20 mil pra quem tem mestrado ou doutorado nos EUA. Desde 2026 a seleção não é mais só aleatória: é ponderada pelo salário da vaga, então cargos mais bem pagos entram mais vezes na urna.",
    vistosRelacionados: ["h1b", "h1b-cos"],
    fonte: "content/leis/vistos/h1b.md",
  },
  {
    id: "trazer-conjuge",
    categoria: "família",
    pergunta: "Como trazer minha esposa, marido ou namorado(a) pros EUA?",
    resposta:
      "Depende de vocês já serem casados ou não, e de quem tem o quê nos EUA. Se você é cidadão americano e ainda não casou, o caminho costuma ser o K-1 (visto de noivo(a)) — o casamento precisa acontecer em até 90 dias depois da entrada. Se vocês já são casados e você é cidadão, o caminho é o I-130 direto, sem fila de espera. Se você é residente permanente (green card, não cidadão), a petição pelo cônjuge entra numa fila que pode oscilar bastante.",
    vistosRelacionados: ["k1", "familia-ir", "family-gc"],
    fonte: "content/leis/vistos/k1.md",
  },
  {
    id: "green-card-casamento-tempo",
    categoria: "família",
    pergunta: "Quanto tempo demora o green card por casamento?",
    resposta:
      "Varia bastante conforme quem é o cônjuge americano. Se for cidadão, a categoria de parente imediato não tem fila — o tempo depende só do processamento do USCIS. Se for residente permanente (green card), a petição entra na fila F2A, que pode ser curta ou ficar zerada dependendo do mês — vale sempre conferir o Boletim de Vistos atualizado, nunca uma estimativa fixa.",
    vistosRelacionados: ["k1", "familia-ir", "family-gc"],
    fonte: "content/leis/vistos/k1.md; content/leis/formularios/i-130.md",
  },
  {
    id: "dv-lottery-brasil",
    categoria: "green card",
    pergunta: "Existe sorteio de green card pra brasileiro?",
    resposta:
      "Existe o programa (Diversity Visa Lottery), mas ficam de fora os países que enviaram mais de 50 mil imigrantes aos EUA — via categorias familiares e de trabalho — nos últimos 5 anos, e o Brasil se enquadra nesse grupo nos ciclos mais recentes. Essa lista é recalculada todo ano pelo governo americano, então vale sempre confirmar a elegibilidade do seu país no ciclo atual antes de assumir que está de fora.",
    vistosRelacionados: ["dv-lottery"],
    fonte: "travel.state.gov — DV-2026 Instructions and FAQs",
  },
  {
    id: "visto-aprovado-entrada-garantida",
    categoria: "status e prazos",
    pergunta: "Visto aprovado garante que vou entrar nos EUA?",
    resposta:
      "Não. O visto só te dá o direito de se apresentar na fronteira e pedir entrada — quem decide se você entra, por quanto tempo e sob qual status é o oficial de imigração no momento da chegada, não o consulado que emitiu o visto. É por isso que o que importa depois de entrar é o seu I-94, não o visto em si.",
    vistosRelacionados: [],
    fonte: "content/leis/conceitos/status-vs-visto.md",
  },
];
