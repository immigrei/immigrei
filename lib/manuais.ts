/**
 * Path manuals ("manuais de caminho")
 *
 * The full educational guide for a path ("Quero seguir este caminho"):
 * what it is, who qualifies, who is legally blocked (and why),
 * deadlines/risks, and a high-level walkthrough. Rendered at
 * /caminhos/{slug}, gated behind an active subscription — kits and manuals
 * are subscription features, not separate one-off purchases.
 *
 * Content rules:
 * - PT-BR, brand voice (warm, direct, no legal jargon unexplained).
 * - Legal facts must trace to content/leis (fonteLeis) and every blocking
 *   rule cites its official basis. This is education, not legal advice.
 * - Fixed section structure — every manual for every visa uses the same
 *   skeleton, so the pattern replicates across the whole matrix.
 */

export type ManualBloqueio = {
  titulo: string;
  texto: string;
  base: string; // official citation shown to the user, e.g. "8 CFR §248.1"
};

export type ManualPrazo = {
  titulo: string;
  texto: string;
  tone: "clay" | "amber" | "pine";
};

export type ManualPasso = {
  titulo: string;
  texto: string;
};

export type Manual = {
  slug: string;
  badge: string; // short route chip, e.g. "M-1 → F-1"
  titulo: string;
  subtitulo: string;
  oQueE: string[]; // paragraphs
  quemPode: string[];
  quemNaoPode: ManualBloqueio[];
  prazos: ManualPrazo[];
  passos: ManualPasso[]; // high-level only — the detailed version is the kit
  kit: { kitId: string; label: string };
  fontesOficiais: { label: string; url: string }[];
  fonteLeis: string[]; // content/leis files backing this manual (internal traceability)
  verificadoEm: string; // "pendente" until reviewed against the official sources
};

export const MANUAIS: Record<string, Manual> = {
  "m1-para-f1-consulado": {
    slug: "m1-para-f1-consulado",
    badge: "M-1 → F-1",
    titulo: "De M-1 para F-1: o caminho pelo consulado",
    subtitulo:
      "Por que a mudança dentro dos EUA é proibida — e como fazer a troca do jeito certo, sem colocar seu futuro em risco.",
    oQueE: [
      "Você entrou nos EUA como estudante vocacional (M-1) — curso técnico, aviação, culinária, mecânica — e agora quer estudar em faculdade, fazer inglês acadêmico ou qualquer programa acadêmico. Para isso, precisa do F-1. E aqui está o que quase ninguém te conta antes de você escolher o M-1: a lei proíbe expressamente a mudança de status de M-1 para F-1 dentro dos EUA. Não é questão de advogado bom ou formulário certo — é uma vedação de regulamento federal, sem exceção.",
      "Mas porta fechada não é fim da jornada. O caminho existe e é usado todos os anos: sair dos EUA, aplicar o visto F-1 no consulado no Brasil e voltar como estudante acadêmico. Feito no momento certo, é uma troca segura. Feito tarde demais — com o relógio da presença irregular já correndo — pode virar uma barreira de 3 ou 10 anos. Este manual mostra a diferença entre os dois cenários.",
    ],
    quemPode: [
      "Quem está de M-1 com status válido (confira a data no seu I-94 em i94.cbp.dhs.gov — no M-1 ela é uma data fixa, não 'D/S')",
      "Quem tem aceite em escola certificada pelo SEVP com I-20 de F-1 emitido",
      "Quem consegue comprovar recursos financeiros para o novo programa",
      "Quem consegue demonstrar vínculos com o Brasil (intenção não-imigrante) na entrevista",
    ],
    quemNaoPode: [
      {
        titulo: "Mudança de status M-1 → F-1 dentro dos EUA",
        texto:
          "Vedada por regulamento, sem exceção. Pedidos de mudança de status (I-539) nessa direção são negados — e uma negativa pode deixar você sem status e com o relógio da presença irregular correndo. Não tente esta via.",
        base: "8 CFR §248.1",
      },
      {
        titulo: "Quem já está com o I-94 vencido",
        texto:
          "No M-1 a admissão tem data fixa: passou a data do I-94, a presença irregular (unlawful presence) conta automaticamente, sem depender de qualquer decisão do governo. Com 180 dias acumulados, sair dos EUA — que é justamente o que este caminho exige — ativa a barreira de 3 anos; com 365 dias, a de 10. Se este é seu caso, fale com um profissional ANTES de comprar passagem.",
        base: "INA §212(a)(9)(B)",
      },
      {
        titulo: "Atenção também ao caminho M-1 → H",
        texto:
          "Se o seu plano B for um visto de trabalho H: a mudança é vedada quando foi o treinamento do M-1 que te qualificou para a vaga (ex.: escola de aviação → vaga de piloto). Qualificação anterior ao M-1 não sofre essa trava.",
        base: "8 CFR §248.1",
      },
    ],
    prazos: [
      {
        titulo: "Grace period: 30 dias",
        texto:
          "Após concluir o programa M-1, você tem 30 dias para sair dos EUA (não 60, como o F-1). Planeje a saída dentro dessa janela.",
        tone: "amber",
      },
      {
        titulo: "O relógio do M-1 é automático",
        texto:
          "Diferente do F-1, o M-1 tem data fixa no I-94 — a presença irregular começa sozinha no dia seguinte ao vencimento. Não espere 'chegar carta': verifique sua data hoje.",
        tone: "clay",
      },
      {
        titulo: "Saída antes dos 180 dias",
        texto:
          "Se você ficou algum período sem status, sair antes de acumular 180 dias de presença irregular evita a barreira de 3 anos e mantém este caminho viável.",
        tone: "clay",
      },
      {
        titulo: "Reentrada: até 30 dias antes das aulas",
        texto:
          "Com o F-1 no passaporte, você pode entrar nos EUA até 30 dias antes do início do programa acadêmico.",
        tone: "pine",
      },
    ],
    passos: [
      {
        titulo: "Aceite na nova escola e I-20 de F-1",
        texto:
          "Escola certificada pelo SEVP emite o I-20 do programa acadêmico. Seu registro SEVIS do M-1 e o novo do F-1 são independentes.",
      },
      {
        titulo: "Nova taxa SEVIS (I-901)",
        texto: "A taxa é por registro SEVIS — a que você pagou no M-1 não aproveita.",
      },
      {
        titulo: "DS-160 e agendamento no consulado no Brasil",
        texto:
          "Formulário online, taxa consular e agendamento da entrevista — os tempos de espera por consulado você acompanha no seu painel.",
      },
      {
        titulo: "Entrevista consular",
        texto:
          "O ponto sensível: explicar com clareza a mudança de plano do técnico para o acadêmico, com histórico limpo de status nos EUA e vínculos com o Brasil.",
      },
      {
        titulo: "Reentrada como F-1",
        texto: "Visto no passaporte, entrada até 30 dias antes das aulas — e a jornada recomeça no caminho certo.",
      },
    ],
    kit: { kitId: "f1", label: "Kit F-1 pelo consulado" },
    fontesOficiais: [
      {
        label: "8 CFR §248.1 — vedações de mudança de status",
        url: "https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-248/section-248.1",
      },
      {
        label: "8 CFR §214.2(m) — regras do M-1",
        url: "https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/section-214.2",
      },
      {
        label: "Study in the States (DHS) — estudantes F-1/M-1",
        url: "https://studyinthestates.dhs.gov/students",
      },
      {
        label: "INA §212(a)(9)(B) — barreiras de 3 e 10 anos",
        url: "https://uscode.house.gov/browse/prelim@title8",
      },
    ],
    fonteLeis: ["vistos/m1.md", "negativas/m1-negado.md", "conceitos/unlawful-presence.md"],
    verificadoEm: "2026-07-07",
  },

  "f1-para-h1b": {
    slug: "f1-para-h1b",
    badge: "F-1 → H-1B",
    titulo: "De F-1 para H-1B: a ponte do estudo para o trabalho",
    subtitulo:
      "OPT, loteria, cap-gap e o atalho sem sorteio que pouca gente conhece — o caminho legal do diploma ao visto de trabalho.",
    oQueE: [
      "Você veio estudar de F-1 e quer ficar trabalhando. O caminho mais percorrido tem três degraus: o OPT te dá 12 meses de trabalho legal depois da formatura (mais 24 se seu curso é STEM); nesse período, um empregador registra você na loteria do H-1B; selecionado, a regra do cap-gap estica seu status até o H-1B começar. Nenhum improviso, nenhum 'extra por fora' — cada degrau é autorizado por regulamento.",
      "E existe o atalho que quase ninguém te conta: universidades, non-profits ligadas a universidades e organizações de pesquisa são isentas da loteria (cap-exempt). Podem protocolar seu H-1B em qualquer mês do ano, sem sorteio. Para quem está na área acadêmica ou de pesquisa, é a porta mais subestimada do sistema.",
    ],
    quemPode: [
      "Quem está de F-1 com status válido e vai concluir (ou concluiu) um programa acadêmico",
      "Quem tem OPT aprovado ou dentro do prazo de pedir (até 90 dias antes e 60 depois da conclusão)",
      "Quem tem empregador disposto a registrar na loteria — ou vaga em empregador cap-exempt",
      "Quem trabalhou apenas com autorização (on-campus, CPT, OPT) — histórico limpo é pré-requisito",
    ],
    quemNaoPode: [
      {
        titulo: "Quem trabalhou sem autorização durante o F-1",
        texto:
          "Freelance, aplicativo, dinheiro vivo, LLC própria operando: qualquer trabalho fora do permitido (on-campus 20h, CPT, OPT) é violação grave. Encerra o status, bloqueia a mudança para H-1B dentro dos EUA e pesa contra você no consulado. Se este é seu caso, fale com um profissional antes de qualquer protocolo.",
        base: "8 CFR §214.2(f)(9)",
      },
      {
        titulo: "Quem deixou o status cair antes do protocolo",
        texto:
          "A mudança de status para H-1B dentro dos EUA exige status válido no dia do protocolo. Fora de status, a rota vira consular: aprovada a petição, você sai, carimba o visto no consulado e volta.",
        base: "8 CFR §248.1",
      },
    ],
    prazos: [
      {
        titulo: "OPT: a janela é curta",
        texto:
          "O pedido (I-765) entra até 90 dias antes da conclusão e no máximo 60 dias depois. Perdeu a janela, perdeu o OPT — não há segunda chance para o mesmo diploma.",
        tone: "clay",
      },
      {
        titulo: "Loteria: registro em março",
        texto:
          "O empregador registra você em março; o resultado sai semanas depois; o H-1B começa em 1º de outubro. Planeje o OPT para cobrir a espera.",
        tone: "amber",
      },
      {
        titulo: "Cap-gap: selecionado, seu status estica",
        texto:
          "Selecionado na loteria com petição protocolada, status e OPT se estendem automaticamente até o H-1B começar (a regra atual cobre até 1º de abril do ano seguinte).",
        tone: "pine",
      },
      {
        titulo: "Grace period: 60 dias",
        texto:
          "Terminou o programa ou o OPT sem próximo passo? Você tem 60 dias para mudar de status, transferir de escola ou sair dos EUA.",
        tone: "amber",
      },
    ],
    passos: [
      {
        titulo: "OPT aprovado antes da formatura",
        texto:
          "Pedido via DSO + I-765 ao USCIS dentro da janela. Curso STEM? Já planeje a extensão de 24 meses.",
      },
      {
        titulo: "Empregador disposto a patrocinar",
        texto:
          "A conversa a ter na entrevista de emprego. Empregadores cap-exempt (universidades, pesquisa) não dependem de sorteio.",
      },
      {
        titulo: "Registro na loteria (março)",
        texto: "O empregador registra você no sistema do USCIS — processo simples e barato para a empresa.",
      },
      {
        titulo: "Petição I-129 com mudança de status",
        texto:
          "Selecionado, o empregador protocola a petição completa. O cap-gap protege seu status durante a espera.",
      },
      {
        titulo: "1º de outubro: status H-1B",
        texto: "Aprovada a petição, seu status muda automaticamente — sem sair dos EUA, sem consulado.",
      },
    ],
    kit: { kitId: "h1b-cos", label: "Kit H-1B — mudança de status" },
    fontesOficiais: [
      {
        label: "8 CFR §214.2(f) — regras do F-1 (OPT, cap-gap)",
        url: "https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/section-214.2",
      },
      {
        label: "USCIS — H-1B Specialty Occupations",
        url: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations",
      },
      {
        label: "Study in the States (DHS) — estudantes F-1",
        url: "https://studyinthestates.dhs.gov/students",
      },
    ],
    fonteLeis: ["vistos/f1.md", "vistos/h1b.md", "negativas/f1-negado.md"],
    verificadoEm: "2026-07-07",
  },

  "j1-para-f1": {
    slug: "j1-para-f1",
    badge: "J-1 → F-1",
    titulo: "De J-1 para F-1: continuar estudando nos EUA",
    subtitulo:
      "A regra dos 2 anos decide o SEU caminho — dentro dos EUA pelo I-539, ou pelo waiver e pelo consulado. Os três existem.",
    oQueE: [
      "Seu intercâmbio está acabando — au pair, work & travel, pesquisa — e você quer ficar estudando: faculdade, mestrado, inglês acadêmico. O F-1 é a continuação natural, e o caminho depende de UMA pergunta: você está sujeito à regra dos 2 anos (INA §212(e))? A resposta está escrita no seu DS-2019 e no visto. Sem a regra, a mudança de status dentro dos EUA (I-539) está aberta. Com a regra, a lei fecha a mudança interna — mas não fecha o caminho.",
      "O que quase ninguém te conta: a regra dos 2 anos NÃO bloqueia o visto F-1 pelo consulado. Ela trava os vistos H, L e K, o Green Card e a mudança de status dentro dos EUA — mais nada. Sujeito à regra, você tem duas rotas: o waiver por no-objection (o governo brasileiro declara não se opor — via comum e acessível) e depois o I-539, ou direto ao consulado no Brasil aplicar o F-1.",
    ],
    quemPode: [
      "Quem está de J-1 com status válido e DS-2019 ativo (o grace period de 30 dias NÃO serve para protocolar mudança de status)",
      "Quem tem aceite em escola certificada pelo SEVP com I-20 de F-1 emitido",
      "Quem NÃO está sujeito à regra dos 2 anos — rota direta pelo I-539 dentro dos EUA",
      "Quem está sujeito à regra — rota pelo waiver (DS-3035) ou pelo consulado no Brasil",
    ],
    quemNaoPode: [
      {
        titulo: "Mudança de status dentro dos EUA sujeito à regra dos 2 anos",
        texto:
          "Sujeito ao §212(e) e sem waiver aprovado, o pedido de mudança de status (I-539) é vedado por lei — será negado independente do mérito. Primeiro o waiver, depois o I-539. Ou pule direto para a via consular, que a regra não bloqueia.",
        base: "INA §248(a) / 8 CFR §248.2",
      },
      {
        titulo: "Médicos em treinamento ECFMG — waiver por no-objection",
        texto:
          "Quem veio em programa de treinamento médico de pós-graduação não tem acesso ao waiver por no-objection. As vias que restam (hardship, perseguição, Conrad 30) têm padrão de prova bem mais alto — caso claro de conversa com profissional.",
        base: "INA §212(e)",
      },
      {
        titulo: "Programa financiado pelo governo americano",
        texto:
          "O no-objection do governo brasileiro existe, mas quando foi o governo dos EUA que financiou seu programa, o Departamento de Estado raramente recomenda o waiver. Avalie a via consular ou cumprir os 2 anos.",
        base: "22 CFR §41.63",
      },
    ],
    prazos: [
      {
        titulo: "Grace period: 30 dias",
        texto:
          "Após o fim do programa J-1 você tem 30 dias para sair (não 60, como o F-1) — e esse período não vale para protocolar o I-539. Comece ANTES do DS-2019 vencer.",
        tone: "clay",
      },
      {
        titulo: "O waiver leva meses",
        texto:
          "DS-3035 + no-objection da Embaixada + recomendação do Dept. of State + decisão do USCIS: conte alguns meses. Protocole cedo o suficiente para o I-539 entrar com seu status ainda válido.",
        tone: "amber",
      },
      {
        titulo: "Waiver aprovado congela extensões",
        texto:
          "Depois do waiver recomendado, o patrocinador não pode mais estender seu DS-2019. Alinhe o timing: waiver tarde demais no programa é seguro; cedo demais pode te deixar sem tempo.",
        tone: "amber",
      },
      {
        titulo: "Via consular: reentrada até 30 dias antes das aulas",
        texto: "Com o F-1 no passaporte, você entra nos EUA até 30 dias antes do início do programa.",
        tone: "pine",
      },
    ],
    passos: [
      {
        titulo: "Confira o seu §212(e)",
        texto:
          "Olhe o DS-2019 e o visto no passaporte. Boa notícia para brasileiros: desde dezembro de 2024 o Brasil saiu da Skills List (com efeito retroativo) — hoje a regra só se aplica por financiamento do governo ou treinamento médico. Anotação antiga ou contraditória? Existe advisory opinion do Dept. of State para tirar a dúvida oficialmente.",
      },
      {
        titulo: "Aceite na escola e I-20 de F-1",
        texto: "Escola certificada pelo SEVP emite o I-20. Novo registro SEVIS, nova taxa I-901.",
      },
      {
        titulo: "Sujeito à regra? Waiver primeiro",
        texto:
          "DS-3035 ao Dept. of State + pedido de no-objection à Embaixada do Brasil em Washington. Não sujeito? Pule este passo.",
      },
      {
        titulo: "I-539 dentro dos EUA — ou DS-160 no consulado",
        texto:
          "Com a rota interna aberta: I-539 antes do DS-2019 vencer. Pela via consular: DS-160, taxa e entrevista no Brasil.",
      },
      {
        titulo: "Status F-1 e aulas em tempo integral",
        texto: "Aprovado, seu SEVIS ativa no novo I-20 — e a jornada continua no caminho acadêmico.",
      },
    ],
    kit: { kitId: "f1-cos", label: "Kit F-1 — mudança de status (I-539)" },
    fontesOficiais: [
      {
        label: "Dept. of State — Waiver of the Exchange Visitor Two-Year Requirement",
        url: "https://travel.state.gov/content/travel/en/us-visas/study/exchange/waiver-of-the-exchange-visitor.html",
      },
      {
        label: "INA §212(e) — regra dos 2 anos",
        url: "https://uscode.house.gov/browse/prelim@title8",
      },
      {
        label: "8 CFR §248.2 — vedações de mudança de status",
        url: "https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-248/section-248.2",
      },
      {
        label: "22 CFR Part 62 — regras do programa J-1",
        url: "https://www.ecfr.gov/current/title-22/chapter-I/subchapter-G/part-62",
      },
      {
        label: "Skills List revisada (89 FR 97693, dez/2024) — Brasil fora da lista",
        url: "https://www.federalregister.gov/documents/2024/12/09/2024-28718/public-notice-of-revised-exchange-visitor-skills-list",
      },
    ],
    fonteLeis: ["vistos/j1.md", "vistos/f1.md", "negativas/j1-negado.md"],
    verificadoEm: "2026-07-07",
  },

  "h1b-transferencia": {
    slug: "h1b-transferencia",
    badge: "H-1B → H-1B",
    titulo: "Trocar de empregador no H-1B: a portabilidade",
    subtitulo:
      "Você não está preso ao seu empregador — pode começar no novo emprego assim que a petição é protocolada. E se foi demitido, o relógio dos 60 dias já está correndo.",
    oQueE: [
      "O maior mito do H-1B é que ele te prende à empresa que te trouxe. A lei diz o contrário: quem está em status H-1B pode começar a trabalhar no novo empregador NO DIA em que a nova petição é protocolada — sem esperar aprovação (INA §214(n), a 'portabilidade'). E quem já foi contado na loteria uma vez não passa por ela de novo: a petição do novo empregador entra em qualquer época do ano.",
      "O cenário urgente é a demissão: seu status não morre no dia do desligamento. O grace period te dá até 60 dias corridos (ou até o fim do seu I-94, o que vier primeiro) para um novo empregador protocolar, para mudar de status ou para sair organizadamente. Mas o relógio é implacável e vale uma vez por período de validade — este manual mostra como usar cada dia dele.",
    ],
    quemPode: [
      "Quem está em status H-1B válido e recebeu proposta de outro empregador",
      "Quem foi demitido há menos de 60 dias (e o I-94 ainda está válido)",
      "Quem já foi contado no cap — a nova petição não passa por loteria",
      "Quem trabalhou apenas com autorização desde a última admissão",
    ],
    quemNaoPode: [
      {
        titulo: "Começar no novo emprego antes do protocolo",
        texto:
          "A portabilidade libera o trabalho quando a petição é PROTOCOLADA — não quando a proposta é aceita. Trabalhar antes é trabalho não autorizado e derruba a própria portabilidade, que exige histórico limpo.",
        base: "INA §214(n)",
      },
      {
        titulo: "Quem deixou os 60 dias passarem",
        texto:
          "Depois do grace period, você está fora de status: a nova petição ainda pode ser aprovada, mas vira processamento consular — sair dos EUA, carimbar o visto e voltar. E o I-94 vencido liga o relógio da presença irregular automaticamente.",
        base: "8 CFR §214.1(l)(2) / INA §212(a)(9)(B)",
      },
      {
        titulo: "Quem continuou trabalhando após negativa de extensão",
        texto:
          "A regra dos 240 dias autoriza trabalhar enquanto a extensão pende — negada, a autorização termina no mesmo dia. Continuar 'só até resolver' contamina a portabilidade e as outras rotas.",
        base: "8 CFR §274a.12(b)(20)",
      },
    ],
    prazos: [
      {
        titulo: "60 dias de grace period — uma vez",
        texto:
          "Contam do último dia de trabalho, corridos, sem pausa. Vale uma vez por período de validade da petição. Dia 1 é o dia de acionar a rede de contatos, não o dia 30.",
        tone: "clay",
      },
      {
        titulo: "O I-94 é o teto",
        texto:
          "O grace period nunca passa da validade do seu I-94. Confira a data hoje em i94.cbp.dhs.gov — ela pode ser mais curta do que você imagina.",
        tone: "clay",
      },
      {
        titulo: "Protocolo = pode trabalhar",
        texto:
          "Recibo da nova petição na mão, você já pode começar no novo empregador — a aprovação vem depois, sem pressa.",
        tone: "pine",
      },
      {
        titulo: "Limite de 6 anos continua contando",
        texto:
          "A troca de empregador não zera o relógio dos 6 anos. Perto do teto? A extensão além dele exige PERM ou I-140 em andamento (AC21) — leve isso para a negociação com o novo empregador.",
        tone: "amber",
      },
    ],
    passos: [
      {
        titulo: "Proposta do novo empregador",
        texto:
          "A vaga precisa ser ocupação especializada, como a atual. Confirme que a empresa (e o advogado dela) conhecem o processo de transfer.",
      },
      {
        titulo: "LCA no Departamento do Trabalho",
        texto: "O novo empregador protocola a LCA — leva cerca de 7 dias para certificar.",
      },
      {
        titulo: "Petição I-129 protocolada",
        texto:
          "Com a LCA certificada, entra o I-129. Se você está no grace period, é este protocolo que estanca o relógio.",
      },
      {
        titulo: "Começar a trabalhar com o recibo",
        texto: "Recibo do USCIS emitido, a portabilidade libera o início no novo emprego.",
      },
      {
        titulo: "Aprovação e novo I-94",
        texto:
          "Aprovada a petição, o I-797 traz seu novo I-94. Guarde tudo — o histórico limpo é seu maior ativo na próxima troca ou no Green Card.",
      },
    ],
    kit: { kitId: "h1b-cos", label: "Kit H-1B — mudança de status" },
    fontesOficiais: [
      {
        label: "INA §214(n) — portabilidade do H-1B (AC21 §105)",
        url: "https://uscode.house.gov/browse/prelim@title8",
      },
      {
        label: "8 CFR §214.1(l)(2) — grace period de 60 dias",
        url: "https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/section-214.1",
      },
      {
        label: "USCIS — H-1B Specialty Occupations",
        url: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations",
      },
    ],
    fonteLeis: ["vistos/h1b.md", "negativas/h1b-negado.md", "conceitos/unlawful-presence.md"],
    verificadoEm: "2026-07-07",
  },

  "o1-autopeticao-greencard": {
    slug: "o1-autopeticao-greencard",
    badge: "O-1 → GREEN CARD",
    titulo: "Do O-1 ao Green Card: EB-1A e EB-2 NIW, sem empregador",
    subtitulo:
      "O O-1 exige um peticionário americano — mas o Green Card por mérito, não. As duas rotas de auto-petição, e como escolher a sua.",
    oQueE: [
      "Quem vive do próprio talento — artistas, pesquisadores, atletas, criadores — esbarra na mesma parede: o O-1 não aceita auto-petição. Sempre precisa de um empregador ou agente americano protocolando por você (8 CFR §214.2(o)(2)(i)). Mas essa parede tem uma porta do outro lado do sistema: no Green Card por mérito, VOCÊ é o peticionário. EB-1A (habilidade extraordinária) e EB-2 NIW (interesse nacional) são as duas categorias em que o I-140 entra no seu nome, sem empregador, sem oferta de emprego, sem PERM.",
      "E aqui está o que torna o O-1 especial: ele convive com essa busca. Ter um I-140 pendente ou aprovado não prejudica seu status O-1, suas extensões nem suas reentradas (8 CFR §214.2(o)(13)). A estratégia clássica é exatamente essa — trabalhar de O-1 enquanto a auto-petição de Green Card anda. Este manual mostra as duas rotas e os critérios de cada uma.",
    ],
    quemPode: [
      "Quem está de O-1 (ou se qualificaria) e quer residência permanente sem depender de empregador",
      "EB-1A: quem está no topo da área — prêmios relevantes, imprensa, julgamento do trabalho de outros, salário destacado (3 de 10 critérios, mais o teste final de 'topo da área')",
      "EB-2 NIW: quem tem mestrado/doutorado OU habilidade excepcional E um trabalho de importância nacional para os EUA — padrão mais acessível que o EB-1A",
      "Quem mantém evidências organizadas: cartas de especialistas, métricas, contratos, publicações",
    ],
    quemNaoPode: [
      {
        titulo: "Auto-petição do próprio O-1",
        texto:
          "Não existe. O visto O-1 exige empregador ou agente americano como peticionário, sem exceção. Autônomos usam um agente — e a auto-petição de verdade fica para o I-140 do Green Card.",
        base: "8 CFR §214.2(o)(2)(i)",
      },
      {
        titulo: "EB-1A sem o padrão do 'topo da área'",
        texto:
          "Ter o O-1 aprovado NÃO garante o EB-1A — o padrão de prova do Green Card é mais alto que o do visto. Se a evidência ainda não fecha, o EB-2 NIW costuma ser o degrau certo antes.",
        base: "INA §203(b)(1)(A) / 8 CFR §204.5(h)",
      },
      {
        titulo: "Contar com o I-140 como status",
        texto:
          "A petição aprovada não é status nem autorização de trabalho. Você continua precisando do O-1 (ou outro status válido) até o ajuste final (I-485) — que depende da fila do Boletim de Vistos para o Brasil, acompanhada no seu painel.",
        base: "INA §245(a)",
      },
    ],
    prazos: [
      {
        titulo: "O-1: extensões sem limite",
        texto:
          "Diferente do teto de 6 anos do H-1B, o O-1 se estende em incrementos de 1 ano indefinidamente — dá para sustentar a espera do Green Card sem pânico.",
        tone: "pine",
      },
      {
        titulo: "Priority date: o dia do protocolo",
        texto:
          "O dia em que o I-140 entra define seu lugar na fila do Boletim de Vistos. Cada mês de hesitação é um mês a mais de fila — protocolar cedo é a decisão que mais paga.",
        tone: "amber",
      },
      {
        titulo: "Emprego acabou? 60 dias",
        texto:
          "Se o trabalho que sustenta seu O-1 terminar antes da validade da petição, vale o grace period de até 60 dias para reorganizar — novo peticionário ou mudança de status.",
        tone: "clay",
      },
      {
        titulo: "Premium processing disponível",
        texto: "Tanto o O-1 quanto o I-140 aceitam premium processing — decisão em dias úteis, não meses.",
        tone: "pine",
      },
    ],
    passos: [
      {
        titulo: "Escolher a rota: EB-1A ou NIW",
        texto:
          "Compare seu dossiê com os critérios de cada categoria. Na dúvida, o NIW é o degrau mais seguro — e nada impede tentar os dois.",
      },
      {
        titulo: "Construir o dossiê de evidências",
        texto:
          "Cartas de especialistas independentes, imprensa, métricas de impacto, prêmios, contratos. É o coração da petição — meses de preparo bem gastos.",
      },
      {
        titulo: "Protocolar o I-140 em seu nome",
        texto: "A auto-petição entra no USCIS e trava sua priority date. Premium processing opcional.",
      },
      {
        titulo: "Manter o O-1 durante a fila",
        texto:
          "Extensões de 1 ano sustentam seu status enquanto a fila do Brasil anda — o I-140 não atrapalha nenhuma delas.",
      },
      {
        titulo: "Fila current: I-485",
        texto:
          "Quando sua priority date fica current no Boletim de Vistos, entra o ajuste de status — e o Green Card fecha a jornada.",
      },
    ],
    kit: { kitId: "eb2niw", label: "Kit EB-2 NIW — auto-petição" },
    fontesOficiais: [
      {
        label: "8 CFR §214.2(o) — regras do O-1",
        url: "https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/section-214.2",
      },
      {
        label: "USCIS — Employment-Based Immigration: First Preference EB-1",
        url: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-first-preference-eb-1",
      },
      {
        label: "USCIS Policy Manual — National Interest Waiver",
        url: "https://www.uscis.gov/policy-manual",
      },
      {
        label: "Dept. of State — Visa Bulletin",
        url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html",
      },
    ],
    fonteLeis: ["vistos/o1.md", "negativas/o1-negado.md", "conceitos/priority-date.md"],
    verificadoEm: "2026-07-07",
  },

  "l1-para-eb1c": {
    slug: "l1-para-eb1c",
    badge: "L-1A → GREEN CARD",
    titulo: "Do L-1A ao Green Card: a ponte EB-1C do executivo",
    subtitulo:
      "A transferência que te trouxe é a mesma história que sustenta sua residência permanente — sem sorteio e sem PERM. O timing é tudo.",
    oQueE: [
      "O L-1A tem uma vantagem que quase ninguém explica na chegada: ele foi desenhado com uma saída de cima. A categoria EB-1C do Green Card usa os MESMOS conceitos do seu visto — gerente ou executivo, empresa do mesmo grupo, operação real nos dois países. As provas que aprovaram sua transferência são, em grande parte, as provas da sua residência permanente (INA §203(b)(1)(C)).",
      "E a ponte dispensa as duas maiores dores do Green Card por emprego: não há sorteio e não há PERM — a certificação trabalhista que consome 1–2 anos no EB-2/EB-3 patrocinado. O que existe é um relógio: o L-1A tem teto de 7 anos, e a ponte precisa começar com folga. Este manual mostra quem se qualifica, o que trava e a ordem certa dos passos.",
    ],
    quemPode: [
      "Quem está de L-1A (ou se qualificaria) exercendo função gerencial ou executiva de verdade — gestão de pessoas ou de uma função essencial do negócio",
      "Quem trabalhou pelo menos 1 ano (nos últimos 3 antes da transferência) na empresa do grupo fora dos EUA, como gerente ou executivo",
      "Quem tem empregador americano do mesmo grupo corporativo (matriz, filial, subsidiária ou afiliada) disposto a peticionar — o I-140 é da empresa",
      "Empresa americana operando de verdade há pelo menos 1 ano — vendas, contratos, folha, não presença de fachada",
    ],
    quemNaoPode: [
      {
        titulo: "Auto-petição do EB-1C",
        texto:
          "Não existe. O peticionário é sempre o empregador americano — inclusive quando o executivo é dono do grupo, é a EMPRESA dos EUA que protocola. Quem busca Green Card sem empregador olha para o EB-2 NIW ou EB-1A.",
        base: "8 CFR §204.5(j)(1)",
      },
      {
        titulo: "Novo escritório com menos de 1 ano de operação",
        texto:
          "O L-1A de novo escritório é aprovado com o negócio ainda no papel — o EB-1C, não. A empresa americana precisa completar 1 ano de operação real (doing business) antes do I-140. Protocolar antes disso é negativa anunciada.",
        base: "8 CFR §204.5(j)(3)(i)(D)",
      },
      {
        titulo: "Função que não é gerencial de verdade",
        texto:
          "Título de gerente no crachá não basta: o USCIS olha o organograma, quem você gerencia (ou qual função essencial), e quanto do seu dia é operacional. L-1B (conhecimento especializado) não é EB-1C — a rota dele passa por promoção real a L-1A ou por EB-2/EB-3.",
        base: "INA §101(a)(44) / 8 CFR §204.5(j)(2)",
      },
    ],
    prazos: [
      {
        titulo: "Teto de 7 anos do L-1A",
        texto:
          "O L-1A não se estende para sempre. Entre I-140 e I-485 o processo consome 1–2 anos — quem começa a ponte no ano 5 ou 6 está apostando o status na sorte. O momento certo de planejar é AGORA.",
        tone: "clay",
      },
      {
        titulo: "Novo escritório: a janela do ano 1",
        texto:
          "Se seu L-1A é de novo escritório, o primeiro ano decide tudo: a extensão exige provar crescimento real, e é essa mesma operação que sustenta o EB-1C depois. Cada contratação e contrato documentado conta duas vezes.",
        tone: "amber",
      },
      {
        titulo: "Dual intent: sem medo de pedir",
        texto:
          "O L-1 aceita a intenção de imigrar: o I-140 pendente ou aprovado não prejudica extensões nem reentradas. A ponte anda em paralelo ao seu status, não contra ele.",
        tone: "pine",
      },
      {
        titulo: "Premium processing no I-140",
        texto: "O EB-1C aceita premium processing — decisão do I-140 em 45 dias úteis, tirando meses de incerteza da ponte.",
        tone: "pine",
      },
    ],
    passos: [
      {
        titulo: "Auditar o caso antes do relógio apertar",
        texto:
          "Confira os 4 pilares: seu 1 ano lá fora como gerente/executivo, a relação corporativa entre as empresas, o 1 ano de operação americana e a sua função atual no organograma.",
      },
      {
        titulo: "Documentar a função gerencial",
        texto:
          "Organograma, descrição real do cargo, quem reporta a você, decisões que só você toma. É o coração do EB-1C — e onde a maioria das negativas nasce.",
      },
      {
        titulo: "I-140 protocolado pela empresa",
        texto:
          "O empregador americano protocola com o dossiê corporativo dos dois lados. Premium processing opcional. O protocolo trava sua priority date.",
      },
      {
        titulo: "Manter o L-1A durante a fila",
        texto:
          "A fila EB-1 para o Brasil costuma andar rápido (acompanhe no seu painel, que segue o Boletim de Vistos) — e o dual intent mantém extensões e viagens tranquilas.",
      },
      {
        titulo: "Data current: I-485 e o cartão",
        texto:
          "Com a priority date current, entra o ajuste de status (I-485) — cônjuge e filhos menores de 21 entram juntos como derivados.",
      },
    ],
    kit: { kitId: "l1", label: "Kit L-1 — transferência intraempresarial" },
    fontesOficiais: [
      {
        label: "USCIS — Employment-Based Immigration: First Preference EB-1",
        url: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-first-preference-eb-1",
      },
      {
        label: "8 CFR §204.5(j) — requisitos do EB-1C",
        url: "https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-204/section-204.5",
      },
      {
        label: "8 CFR §214.2(l) — regras do L-1 (teto e dual intent)",
        url: "https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/section-214.2",
      },
      {
        label: "Dept. of State — Visa Bulletin",
        url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html",
      },
    ],
    fonteLeis: ["vistos/eb1c.md", "conceitos/priority-date.md"],
    verificadoEm: "pendente",
  },
};

export function getManual(slug: string): Manual | undefined {
  return MANUAIS[slug];
}
