/**
 * Dedicated visa pages ("/vistos/[id]")
 *
 * The visa-level sibling of lib/manuais.ts: when the user clicks
 * "Quero seguir esse caminho" on a catalog card, this page tells them
 * EVERYTHING about the visa before they commit — what it is, who qualifies,
 * who is legally blocked (and why), the deadlines that define the journey,
 * a high-level walkthrough, and where the path connects (manuals, kits).
 * The hero and quick decision blocks come from lib/vistosCatalog.ts, so the
 * card and the page never diverge.
 *
 * Content rules (same as manuais):
 * - PT-BR, brand voice — warm, direct, no unexplained legal jargon.
 * - Legal facts trace to content/leis (fonteLeis) and every blocking rule
 *   cites its official basis. Education, not legal advice — never recommend
 *   a visa or judge a case.
 * - Only visas with a content/leis backing file get a page; the catalog
 *   cards without one keep the direct-confirm flow until researched.
 */

export type VistoBloqueio = {
  titulo: string;
  texto: string;
  base: string; // official citation shown to the user, e.g. "8 CFR §248.1"
};

export type VistoPrazo = {
  titulo: string;
  texto: string;
  tone: "clay" | "amber" | "pine";
};

export type VistoPasso = {
  titulo: string;
  texto: string;
};

export type VistoPage = {
  id: string; // catalog id — also the /vistos/[id] slug
  tagline: string; // one-liner under the hero title
  oQueE: string[]; // paragraphs
  quemPode: string[];
  bloqueios: VistoBloqueio[];
  prazos: VistoPrazo[];
  passos: VistoPasso[]; // high-level — the operational detail lives in the kit
  pontes: { label: string; href: string }[]; // manuals & connected routes
  kit: { kitId: string; label: string } | null; // null = checklist not built yet
  fontesOficiais: { label: string; url: string }[];
  fonteLeis: string[]; // content/leis files backing this page
  verificadoEm: string;
};

export const VISTO_PAGES: Record<string, VistoPage> = {
  // ── F-1 — Estudante Acadêmico ──────────────────────────────────────────
  f1: {
    id: "f1",
    tagline:
      "O visto mais comum entre brasileiros — e a base da escada estudo → trabalho → Green Card.",
    oQueE: [
      "O F-1 é o visto de estudante acadêmico: universidades, colleges e escolas de idiomas certificadas pelo governo americano (SEVP). Tudo começa na escola — é ela que emite o I-20, o documento que destrava o resto do processo.",
      "Diferente da maioria dos vistos, o F-1 não tem data de validade fixa dentro dos EUA: a admissão é por \"duration of status\" (D/S) — você permanece legal enquanto estudar em tempo integral e cumprir as regras, incluindo os períodos de treinamento autorizado (OPT) depois de formar.",
    ],
    quemPode: [
      "Quem foi admitido em escola certificada pelo SEVP e recebeu o I-20.",
      "Quem comprova fundos para o primeiro ano de curso e vida nos EUA — extratos organizados, em seu nome ou de patrocinador declarado.",
      "Quem paga a taxa SEVIS (I-901) antes da entrevista.",
      "Quem demonstra intenção não-imigrante: vínculos com o Brasil que sustentem o plano de estudar e voltar.",
    ],
    bloqueios: [
      {
        titulo: "Trabalhar sem autorização encerra o caminho",
        texto:
          "Freelance, aplicativo, dinheiro em espécie, empresa própria operando — qualquer trabalho fora do permitido (on-campus até 20h, CPT, OPT) é violação grave: encerra o status e mata o pedido de restauração (reinstatement).",
        base: "8 CFR §214.2(f)(9) e (f)(16)",
      },
      {
        titulo: "Fora de status há mais de 5 meses",
        texto:
          "O pedido de restauração de status precisa ser protocolado em até 5 meses da violação. Depois disso, só com circunstâncias excepcionais comprovadas — ou saindo dos EUA para recomeçar pelo consulado com novo SEVIS.",
        base: "8 CFR §214.2(f)(16)",
      },
    ],
    prazos: [
      {
        titulo: "60 dias de grace period após concluir",
        texto:
          "Ao terminar o programa (ou o OPT), você tem 60 dias para sair, transferir de escola ou protocolar mudança de status. M-1 e J-1 têm só 30 — o F-1 é o mais generoso.",
        tone: "pine",
      },
      {
        titulo: "D/S pode virar data fixa — em monitoramento",
        texto:
          "O DHS propôs substituir o D/S por admissão com data fixa (teto de 4 anos). A regra final pode entrar em vigor ainda em 2026. Se publicar, os prazos desta página mudam — nós atualizamos e avisamos.",
        tone: "amber",
      },
      {
        titulo: "Presença irregular não conta sozinha (por enquanto)",
        texto:
          "Como a admissão é D/S, o relógio das barreiras de 3/10 anos só começa com decisão formal (negativa do USCIS ou ordem de juiz). Mas fora de status você já perde benefícios — trabalho, OPT, extensões — e fica removível.",
        tone: "clay",
      },
    ],
    passos: [
      {
        titulo: "Admissão numa escola SEVP",
        texto:
          "Escolha escola certificada e conclua a admissão. Sem escola SEVP não existe F-1 — o processo inteiro nasce aqui.",
      },
      {
        titulo: "I-20 emitido",
        texto:
          "A escola emite o I-20 com seu SEVIS ID, curso, datas e o valor de fundos que você precisa comprovar.",
      },
      {
        titulo: "Taxa SEVIS (I-901)",
        texto: "Pague a taxa I-901 e guarde o comprovante — ele é exigido na entrevista.",
      },
      {
        titulo: "DS-160 e agendamento",
        texto:
          "Preencha o DS-160, pague a taxa consular e agende a entrevista no consulado.",
      },
      {
        titulo: "Entrevista consular",
        texto:
          "Os fundos e os vínculos com o Brasil decidem a conversa. Documentos organizados contam mais do que respostas ensaiadas.",
      },
      {
        titulo: "Entrada e manutenção",
        texto:
          "Nos EUA, mantenha carga horária integral e mudanças sempre via DSO da escola. Depois de formar, o OPT abre até 12 meses de trabalho (36 em áreas STEM).",
      },
    ],
    pontes: [
      { label: "Passo a passo: F-1 → H-1B (a escada até o visto de trabalho)", href: "/caminhos/f1-para-h1b" },
      { label: "Mudar de B-2 para F-1 por dentro dos EUA", href: "/casos/cos-b2-f1" },
    ],
    kit: { kitId: "f1", label: "Checklist completo do F-1" },
    fontesOficiais: [
      { label: "Study in the States (DHS) — Students", url: "https://studyinthestates.dhs.gov/students" },
      {
        label: "USCIS — Students and Exchange Visitors",
        url: "https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors",
      },
    ],
    fonteLeis: ["vistos/f1.md", "conceitos/unlawful-presence.md"],
    verificadoEm: "2026-07-14",
  },

  // ── M-1 — Estudante Vocacional / Técnico ──────────────────────────────
  m1: {
    id: "m1",
    tagline:
      "Para cursos técnicos e profissionalizantes — com regras bem mais rígidas que o F-1. Escolher a categoria certa ANTES evita portas fechadas.",
    oQueE: [
      "O M-1 é o visto para estudo vocacional: aviação, culinária, mecânica, estética e cursos técnicos em escolas certificadas pelo SEVP. O documento base é o mesmo I-20 do F-1 (na versão M), mas as regras são outra história.",
      "A diferença que define tudo: a admissão M-1 tem data fixa no I-94 — duração do programa + 30 dias, com máximo de 1 ano na entrada inicial. Não existe o \"enquanto durar o curso\" do F-1, e cada extensão precisa ser pedida ao USCIS pelo I-539 (teto total de 3 anos).",
    ],
    quemPode: [
      "Quem foi admitido em curso vocacional de escola certificada pelo SEVP e recebeu o I-20 (versão M).",
      "Quem comprova fundos para o curso INTEIRO já na entrada — não vale planejar pagar depois.",
      "Quem paga a taxa SEVIS (I-901) e demonstra intenção não-imigrante na entrevista.",
      "Quem escolheu escola compatível com onde vai morar — distância implausível entre casa e escola é motivo clássico de negação.",
    ],
    bloqueios: [
      {
        titulo: "M-1 → F-1 dentro dos EUA: proibido, sem exceção",
        texto:
          "A lei veda expressamente a mudança de status de estudante vocacional para acadêmico. Não é questão de advogado ou formulário: quem está de M-1 e quer universidade precisa sair dos EUA e fazer o F-1 pelo consulado.",
        base: "8 CFR §248.1",
      },
      {
        titulo: "M-1 → H-1B bloqueado se o curso te qualificou",
        texto:
          "Se o treinamento vocacional foi exatamente o que te qualificou para a vaga (ex.: escola de aviação → vaga de piloto), a mudança para visto H é vedada. Se a qualificação veio de outra fonte, a rota existe.",
        base: "8 CFR §248.1",
      },
      {
        titulo: "Trabalho durante o curso: não existe",
        texto:
          "O M-1 não permite trabalho enquanto estuda. A única exceção é o treinamento prático DEPOIS de concluir: 1 mês para cada 4 de estudo, máximo de 6 meses, com I-765 aprovado antes.",
        base: "8 CFR §214.2(m)(14)",
      },
    ],
    prazos: [
      {
        titulo: "Data fixa no I-94 — o relógio corre sozinho",
        texto:
          "Diferente do F-1, a presença irregular conta automaticamente a partir do vencimento do I-94. Um I-539 protocolado dentro do prazo suspende a contagem enquanto pende.",
        tone: "clay",
      },
      {
        titulo: "Transferência de escola: só nos 6 primeiros meses",
        texto:
          "Depois disso, apenas com circunstâncias excepcionais comprovadas. Escolha bem antes de começar.",
        tone: "amber",
      },
      {
        titulo: "30 dias de grace period",
        texto:
          "Ao concluir o programa, são 30 dias para sair ou encaminhar o próximo passo — metade do F-1.",
        tone: "pine",
      },
    ],
    passos: [
      {
        titulo: "Admissão na escola vocacional SEVP",
        texto: "Curso técnico em escola certificada — e coerente com seu plano e sua futura morada.",
      },
      {
        titulo: "I-20 (versão M) emitido",
        texto: "A escola emite o I-20 com as datas e o total de fundos a comprovar — o curso inteiro.",
      },
      {
        titulo: "Taxa SEVIS (I-901)",
        texto: "Pague e guarde o comprovante para a entrevista.",
      },
      {
        titulo: "DS-160 e entrevista consular",
        texto:
          "Fundos completos + vínculos com o Brasil + escolha de escola que faça sentido geográfico.",
      },
      {
        titulo: "Entrada e conclusão dentro do prazo",
        texto:
          "Olho no I-94: extensões via I-539 antes do vencimento, até o teto de 3 anos. Treinamento prático só depois de formar, com I-765 aprovado.",
      },
    ],
    pontes: [
      {
        label: "Passo a passo: M-1 → F-1 pelo consulado (a troca do jeito certo)",
        href: "/caminhos/m1-para-f1-consulado",
      },
    ],
    kit: { kitId: "m1", label: "Checklist completo do M-1" },
    fontesOficiais: [
      { label: "Study in the States (DHS) — Students", url: "https://studyinthestates.dhs.gov/students" },
      {
        label: "USCIS — Students and Exchange Visitors",
        url: "https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors",
      },
    ],
    fonteLeis: ["vistos/m1.md", "conceitos/unlawful-presence.md"],
    verificadoEm: "2026-07-14",
  },

  // ── J-1 — Intercâmbio e Pesquisa ───────────────────────────────────────
  j1: {
    id: "j1",
    tagline:
      "Au pair, pesquisa, trainee, work & travel — o sponsor conduz quase tudo. A regra dos 2 anos é o que você precisa entender antes de aceitar.",
    oQueE: [
      "O J-1 cobre mais de uma dezena de programas de intercâmbio patrocinados: au pair, trainee/intern, pesquisador, professor visitante, work & travel, médico residente e outros. Quem emite o documento base (DS-2019) não é uma escola — é um sponsor designado pelo Departamento de Estado.",
      "Isso muda a dinâmica: o sponsor administra seu status no SEVIS, incluindo extensões dentro do programa — não há formulário do USCIS para estender um J-1. Sua relação é com o programa, do primeiro ao último dia.",
    ],
    quemPode: [
      "Quem foi aceito num programa de sponsor designado pelo Departamento de Estado (22 CFR Part 62).",
      "Quem recebeu o DS-2019 emitido pelo sponsor e pagou a taxa SEVIS (I-901).",
      "Quem comprova intenção não-imigrante na entrevista consular.",
      "Quem vai exercer exatamente a atividade do programa — au pair na host family, work & travel no empregador aprovado. Fora disso é violação.",
    ],
    bloqueios: [
      {
        titulo: "Sujeito à regra dos 2 anos sem waiver: H, L, K e Green Card bloqueados",
        texto:
          "Quem está sujeito ao §212(e) precisa morar 2 anos no Brasil (ou obter waiver) antes de receber visto H, L ou K, virar residente permanente — e antes de mudar de status por dentro dos EUA para praticamente qualquer categoria. A via consular para F-1, O-1 ou B continua aberta.",
        base: "INA §212(e) e §248(a)",
      },
      {
        titulo: "Trabalho fora do programa",
        texto:
          "O J-1 só autoriza a atividade prevista no seu programa específico. Qualquer trabalho fora dele é violação de status.",
        base: "22 CFR Part 62",
      },
    ],
    prazos: [
      {
        titulo: "Confira se a regra dos 2 anos se aplica a VOCÊ",
        texto:
          "O Brasil está fora da Skills List desde dez/2024 — para brasileiros, a regra hoje só nasce de financiamento governamental no programa ou treinamento médico (ECFMG). Atenção: DS-2019 ou visto emitido antes disso pode trazer anotação desatualizada.",
        tone: "amber",
      },
      {
        titulo: "30 dias de grace period",
        texto: "Ao fim do programa, 30 dias para sair ou encaminhar o próximo passo.",
        tone: "pine",
      },
      {
        titulo: "Waiver leva tempo — planeje antes da próxima rota",
        texto:
          "Se você é sujeito ao §212(e) e quer H-1B ou Green Card, o waiver (DS-3035) vem ANTES. Para brasileiros, a via mais comum é o no-objection do governo brasileiro — indisponível para médicos ECFMG.",
        tone: "clay",
      },
    ],
    passos: [
      {
        titulo: "Aceito num programa patrocinado",
        texto:
          "Au pair, intern, pesquisa, work & travel — o primeiro passo é a vaga no programa. A partir daí o sponsor conduz.",
      },
      {
        titulo: "DS-2019 emitido pelo sponsor",
        texto: "É o equivalente ao I-20 do estudante — confira as anotações sobre a regra dos 2 anos.",
      },
      {
        titulo: "Taxa SEVIS (I-901)",
        texto: "Pague e guarde o comprovante.",
      },
      {
        titulo: "DS-160 e entrevista consular",
        texto: "Vínculos com o Brasil + a lógica do programa sustentam a conversa.",
      },
      {
        titulo: "Programa — e o plano da saída",
        texto:
          "Extensões correm pelo sponsor no SEVIS. Antes do fim, defina a próxima rota: se o §212(e) se aplica, o waiver ou os 2 anos no Brasil entram no plano.",
      },
    ],
    pontes: [
      { label: "Passo a passo: J-1 → F-1 e a regra dos 2 anos", href: "/caminhos/j1-para-f1" },
    ],
    kit: { kitId: "j1", label: "Checklist completo do J-1" },
    fontesOficiais: [
      {
        label: "Departamento de Estado — Exchange Visitor Visa",
        url: "https://travel.state.gov/content/travel/en/us-visas/study/exchange.html",
      },
      {
        label: "22 CFR Part 62 — Exchange Visitor Program (eCFR)",
        url: "https://www.ecfr.gov/current/title-22/chapter-I/subchapter-G/part-62",
      },
    ],
    fonteLeis: ["vistos/j1.md"],
    verificadoEm: "2026-07-14",
  },

  // ── H-1B — Trabalho Especializado ──────────────────────────────────────
  h1b: {
    id: "h1b",
    tagline:
      "O visto de trabalho mais conhecido — com sorteio anual, patrocínio do empregador e a vantagem rara da dupla intenção.",
    oQueE: [
      "O H-1B é o visto para funções que exigem graduação na área (\"specialty occupations\"). A petição é do empregador americano — I-129 com LCA aprovada pelo Departamento do Trabalho. Você nunca aplica sozinho: sem empregador disposto a patrocinar, não há H-1B.",
      "É também um dos poucos vistos de dupla intenção: buscar o Green Card não viola o status nem prejudica renovações. É por isso que o H-1B é a ponte clássica entre o estudo (F-1/OPT) e a residência permanente.",
    ],
    quemPode: [
      "Quem tem graduação completa na área da vaga — ou equivalência: cada 3 anos de experiência profissional contam como 1 ano de estudo.",
      "Quem tem empregador americano disposto a protocolar a petição (I-129 + LCA).",
      "Quem foi selecionado no registro anual de março — ou vai para empregador cap-exempt (universidades, non-profits afiliadas e organizações de pesquisa), que contratam o ano inteiro, sem sorteio.",
    ],
    bloqueios: [
      {
        titulo: "Sem petição de empregador, não existe H-1B",
        texto:
          "Não há auto-petição. A rota comum para conquistar o patrocínio por dentro é F-1 → OPT → vaga → registro no sorteio pelo empregador.",
        base: "INA §101(a)(15)(H)(i)(b)",
      },
      {
        titulo: "O sorteio limita as vagas",
        texto:
          "65.000 vistos por ano + 20.000 para mestres/doutores formados nos EUA. Registro em março, início em 1º de outubro — a chance histórica gira em torno de 1 em 3 por ano.",
        base: "INA §214(g)",
      },
      {
        titulo: "Teto de 6 anos — a menos que o Green Card já esteja andando",
        texto:
          "Além dos 6 anos, só com processo de residência em curso: PERM/I-140 pendente há mais de 365 dias (extensões de 1 ano) ou I-140 aprovado aguardando fila (extensões de 3 anos).",
        base: "AC21 §§104(c)/106 — 8 CFR §214.2(h)(13)(iii)(D)-(E)",
      },
    ],
    prazos: [
      {
        titulo: "Perdeu o emprego: 60 dias para agir",
        texto:
          "Até 60 dias corridos (ou até o fim do I-94, o que vier primeiro) para nova petição H-1B, mudança de status ou saída — uma vez por período de validade da petição.",
        tone: "clay",
      },
      {
        titulo: "Troca de empregador sem esperar aprovação",
        texto:
          "Portabilidade: quem já está em status H-1B pode começar no novo empregador assim que a nova petição é protocolada. Quem já foi contado no cap não passa por novo sorteio.",
        tone: "pine",
      },
      {
        titulo: "Extensão protocolada a tempo = 240 dias de fôlego",
        texto:
          "Protocolada antes do I-94 vencer, a extensão permite continuar trabalhando para o mesmo empregador por até 240 dias enquanto o USCIS decide.",
        tone: "amber",
      },
    ],
    passos: [
      {
        titulo: "Vaga com empregador disposto a patrocinar",
        texto:
          "O processo é do empregador. Sem graduação na área? A escada F-1 → OPT é o caminho mais percorrido até essa vaga.",
      },
      {
        titulo: "Registro no sorteio (março)",
        texto:
          "O empregador registra você no sistema do USCIS. Selecionado, o relógio da petição começa. Cap-exempt pula esta etapa.",
      },
      {
        titulo: "LCA no Departamento do Trabalho",
        texto: "O empregador certifica salário e condições da vaga antes da petição.",
      },
      {
        titulo: "Petição I-129",
        texto: "Protocolada pelo empregador com a LCA aprovada e as provas da sua qualificação.",
      },
      {
        titulo: "Aprovação e início em 1º de outubro",
        texto:
          "De fora dos EUA: visto no consulado e entrada. Por dentro: mudança de status na própria petição. Admissão com data fixa no I-94 — olho nos prazos.",
      },
    ],
    pontes: [
      {
        label: "Passo a passo: transferência de H-1B (novo empregador)",
        href: "/caminhos/h1b-transferencia",
      },
      { label: "Passo a passo: F-1 → H-1B (para quem está montando a escada)", href: "/caminhos/f1-para-h1b" },
    ],
    kit: { kitId: "h1b", label: "Checklist completo do H-1B" },
    fontesOficiais: [
      {
        label: "USCIS — H-1B Specialty Occupations",
        url: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations",
      },
      {
        label: "8 CFR §214.2 (eCFR)",
        url: "https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/section-214.2",
      },
    ],
    fonteLeis: ["vistos/h1b.md", "conceitos/unlawful-presence.md", "conceitos/priority-date.md"],
    verificadoEm: "2026-07-14",
  },

  // ── O-1 — Habilidade Extraordinária ────────────────────────────────────
  o1: {
    id: "o1",
    tagline:
      "Sem sorteio, sem cota, renovações sem limite — para quem constrói (e documenta) um perfil de destaque na própria área.",
    oQueE: [
      "O O-1 é o visto para quem se destaca comprovadamente: O-1A para ciências, educação, negócios e esportes; O-1B para artes, cinema e TV. A prova é objetiva — reconhecimento em pelo menos 3 dos critérios regulamentares (prêmios, imprensa, papel de liderança, alta remuneração, julgamento do trabalho de outros...).",
      "Você não peticiona sozinho: um empregador OU um agente americano protocola o I-129 por você — é assim que autônomos e freelancers usam o O-1. E não há loteria nem cota anual: o dossiê forte entra a qualquer momento do ano.",
    ],
    quemPode: [
      "Quem comprova reconhecimento nacional ou internacional em pelo menos 3 dos 8 critérios oficiais da sua área.",
      "Quem tem empregador ou agente americano disposto a ser o peticionário do I-129.",
      "Quem obtém a consulta obrigatória (advisory opinion) do peer group ou sindicato da área.",
      "Quem vem trabalhar na área do reconhecimento — o O-1 é preso à atividade que sustenta o dossiê.",
    ],
    bloqueios: [
      {
        titulo: "Auto-petição não existe no O-1",
        texto:
          "A petição é sempre de um empregador ou agente americano. Sem peticionário, o dossiê mais forte do mundo não entra — autônomos resolvem isso com um agente.",
        base: "8 CFR §214.2(o)(2)(i)",
      },
      {
        titulo: "Sem a consulta da área, a petição não anda",
        texto:
          "A advisory opinion do peer group/sindicato é requisito da petição — não é opcional.",
        base: "8 CFR §214.2(o)(5)",
      },
    ],
    prazos: [
      {
        titulo: "3 anos iniciais, renovações de 1 ano — sem teto",
        texto:
          "Diferente dos 6 anos do H-1B, o O-1 renova em incrementos de 1 ano enquanto a atividade continuar. Há quem viva anos de O-1 até o Green Card.",
        tone: "pine",
      },
      {
        titulo: "Emprego terminou: 60 dias de grace period",
        texto: "Mesma regra do H-1B — 60 dias corridos para reorganizar a rota sem acumular presença irregular.",
        tone: "amber",
      },
      {
        titulo: "O dossiê se constrói em 12–24 meses",
        texto:
          "Prêmios, publicações, cartas de especialistas, projetos de destaque: o caso O-1 é planejável — e começa muito antes da petição.",
        tone: "clay",
      },
    ],
    passos: [
      {
        titulo: "Mapeie seus critérios",
        texto:
          "Dos 8 critérios oficiais da sua área, quais 3+ você já fecha? O que falta define o plano dos próximos meses.",
      },
      {
        titulo: "Construa o dossiê",
        texto:
          "Prêmios, imprensa, cartas de autoridades da área, papel de liderança, remuneração — evidência documentada, não adjetivo.",
      },
      {
        titulo: "Defina o peticionário",
        texto: "Empregador americano ou agente (a rota dos autônomos).",
      },
      {
        titulo: "Advisory opinion",
        texto: "A consulta do peer group/sindicato da área entra na petição.",
      },
      {
        titulo: "Petição I-129 e visto",
        texto:
          "Sem sorteio: protocolo em qualquer época. Aprovada, visto no consulado ou mudança de status por dentro.",
      },
      {
        titulo: "A ponte natural: EB-1A / EB-2 NIW",
        texto:
          "O O-1 funciona na prática como dupla intenção: ter I-140 pendente ou aprovado não é motivo para negar o visto. O mesmo dossiê, reforçado, vira auto-petição de Green Card.",
      },
    ],
    pontes: [
      {
        label: "Passo a passo: O-1 → Green Card por autopetição",
        href: "/caminhos/o1-autopeticao-greencard",
      },
    ],
    kit: { kitId: "o1", label: "Checklist completo do O-1" },
    fontesOficiais: [
      {
        label: "USCIS — O-1 Extraordinary Ability or Achievement",
        url: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa-individuals-with-extraordinary-ability-or-achievement",
      },
      {
        label: "8 CFR §214.2 (eCFR)",
        url: "https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/section-214.2",
      },
    ],
    fonteLeis: ["vistos/o1.md"],
    verificadoEm: "2026-07-14",
  },

  // ── B-1/B-2 — Visitante de Negócios e Turismo ──────────────────────────
  b1: {
    id: "b1",
    tagline:
      "O visto de visita — e, para muita gente, o primeiro capítulo da jornada: conhecer os EUA antes de escolher o caminho.",
    oQueE: [
      "O B-1/B-2 é o visto de visitante: negócios (B-1) e turismo, família ou tratamento médico (B-2). Normalmente os dois vêm juntos no mesmo visto. É um visto de visita — não autoriza trabalhar nem estudar.",
      "Uma distinção que evita sustos: o visto (que pode valer 10 anos) não é a permissão de estadia. Quem define quanto tempo você pode ficar é o oficial do CBP na entrada, registrado no I-94 — tipicamente 6 meses. É essa data, não a do visto, que manda.",
    ],
    quemPode: [
      "Quem demonstra vínculos com o Brasil que sustentem a volta: emprego, família, bens, estudos em andamento.",
      "Quem comprova o propósito da viagem e os recursos para bancá-la (ou quem vai bancar).",
      "Atenção: carta-convite ou promessa de sustento de amigos e família nos EUA não entra na decisão do consulado — o caso se sustenta nos seus vínculos, não nas garantias de terceiros.",
    ],
    bloqueios: [
      {
        titulo: "Trabalhar com visto de visita encerra o status",
        texto:
          "Qualquer emprego ou salário de fonte americana é violação. O B-1 permite reuniões, negociações e conferências — não trabalho remunerado.",
        base: "INA §101(a)(15)(B)",
      },
      {
        titulo: "Estudar antes da aprovação do F-1 mata o pedido",
        texto:
          "Quem está de B-2 e quer estudar precisa da mudança de status aprovada ANTES de se matricular em curso acadêmico. Começar a estudar antes viola o status e bloqueia a aprovação.",
        base: "8 CFR §214.2(b)(7)",
      },
      {
        titulo: "Entrar já decidido a ficar é misrepresentation",
        texto:
          "Entrar como turista já com plano fechado de estudar, trabalhar ou imigrar pode ser lido como declaração falsa na entrada — inadmissibilidade permanente. Conduta inconsistente nos primeiros 90 dias gera presunção de má-fé.",
        base: "INA §212(a)(6)(C)(i) e 9 FAM 302.9-4(B)(3)(g)",
      },
    ],
    prazos: [
      {
        titulo: "A data do I-94 é o seu relógio",
        texto:
          "Diferente do F-1, o B tem data fixa de saída. Passou do I-94, a presença irregular conta automaticamente — e com 180 dias vêm as barreiras de 3 e 10 anos de reentrada.",
        tone: "clay",
      },
      {
        titulo: "Overstay anula o visto na hora",
        texto:
          "Ficar além do I-94 anula automaticamente o visto — inclusive o de 10 anos. Um novo só no consulado, no país de nacionalidade, e com o histórico pesando contra.",
        tone: "clay",
      },
      {
        titulo: "Extensão: protocole com 45 dias de folga",
        texto:
          "A extensão (I-539) precisa entrar ANTES do vencimento do I-94 — o USCIS recomenda pelo menos 45 dias de antecedência. Protocolada a tempo, a permanência segue autorizada enquanto o pedido está pendente. Quem entrou por ESTA não estende.",
        tone: "amber",
      },
    ],
    passos: [
      {
        titulo: "DS-160 e taxa consular",
        texto:
          "Preencha o DS-160 com atenção — as respostas viram registro permanente — e pague a taxa de aplicação.",
      },
      {
        titulo: "Entrevista no consulado",
        texto:
          "A conversa gira em torno de propósito da viagem, vínculos com o Brasil e recursos. Documentos organizados valem mais que respostas decoradas.",
      },
      {
        titulo: "Entrada e I-94",
        texto:
          "O CBP decide o prazo da sua estadia na entrada. Confira seu I-94 online logo depois de entrar — é essa data que define tudo.",
      },
      {
        titulo: "Durante a visita",
        texto:
          "Sem trabalho, sem matrícula em curso acadêmico. Se os planos mudarem de verdade (estudar, negócio próprio), a mudança de status é o caminho — antes do vencimento.",
      },
    ],
    pontes: [
      { label: "Mudar de B-2 para F-1 por dentro dos EUA", href: "/casos/cos-b2-f1" },
    ],
    kit: { kitId: "b1", label: "Checklist completo do B-1/B-2" },
    fontesOficiais: [
      {
        label: "Dept. of State — Visitor Visa",
        url: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html",
      },
      {
        label: "USCIS — Extend Your Stay",
        url: "https://www.uscis.gov/visit-the-united-states/extend-your-stay",
      },
    ],
    fonteLeis: [
      "vistos/b1-b2.md",
      "formularios/i-539.md",
      "conceitos/unlawful-presence.md",
    ],
    verificadoEm: "2026-07-16",
  },

  // ── L-1 — Transferência Intraempresa ───────────────────────────────────
  l1: {
    id: "l1",
    tagline:
      "A empresa que você construiu no Brasil vira a sua porta de entrada — sem sorteio, sem cota, e com ponte direta para o Green Card de executivo.",
    oQueE: [
      "O L-1 transfere você da sua empresa fora dos EUA para uma filial, subsidiária ou matriz americana: L-1A para executivos e gerentes, L-1B para quem carrega conhecimento especializado do negócio. É o empregador quem peticiona (I-129) — e não existe loteria nem época certa para aplicar.",
      "Para brasileiros, ele tem um papel extra: como o Brasil não tem tratado com os EUA (E-1/E-2 indisponíveis), o L-1 \"new office\" é o caminho viável de quem quer abrir a operação americana da própria empresa.",
    ],
    quemPode: [
      "Quem trabalhou na empresa fora dos EUA por 1 ano contínuo dentro dos últimos 3 anos.",
      "Quem vai atuar como executivo/gerente (L-1A) ou com conhecimento especializado (L-1B) na operação americana.",
      "Empresas com relação corporativa real entre Brasil e EUA (matriz, filial, subsidiária ou afiliada), operando de verdade nos dois países — fornecimento regular de bens ou serviços, não um escritório de fachada.",
      "No new office: local físico já contratado e um plano que sustente posição executiva/gerencial em 1 ano.",
    ],
    bloqueios: [
      {
        titulo: "Empresa de fachada não qualifica",
        texto:
          "\"Doing business\" exige operação regular, sistemática e contínua nos EUA e em pelo menos um outro país durante toda a estadia. Um endereço com agente registrado, sem operação real, derruba a petição.",
        base: "8 CFR §214.2(l)(1)(ii)(H)",
      },
      {
        titulo: "Menos de 1 ano contínuo na empresa lá fora",
        texto:
          "O ano de trabalho na organização estrangeira precisa ser contínuo e dentro dos últimos 3 anos. Períodos somados, prestação de serviço avulsa ou vínculo recente não fecham o requisito.",
        base: "8 CFR §214.2(l)(3)",
      },
      {
        titulo: "New office que não decola não renova",
        texto:
          "A estadia inicial de escritório novo é de apenas 1 ano — e a renovação exige provar que a operação cresceu a ponto de sustentar um executivo: funcionários, receita, estrutura. Sem isso, o caminho termina na primeira renovação.",
        base: "8 CFR §214.2(l)(3)(v) e (l)(14)(ii)",
      },
    ],
    prazos: [
      {
        titulo: "Teto de 7 anos (L-1A) / 5 anos (L-1B)",
        texto:
          "Estadia inicial de 3 anos (1 ano no new office) e extensões de até 2 anos por vez, até o teto. Depois dele não há renovação — por isso a ponte para o Green Card começa cedo.",
        tone: "amber",
      },
      {
        titulo: "New office: 1 ano para provar que funciona",
        texto:
          "Quem abre operação nova tem 1 ano até a primeira renovação — na prática, o prazo para contratar, faturar e montar a estrutura que justifica um executivo à frente.",
        tone: "clay",
      },
      {
        titulo: "EB-1C: a saída natural, com folga",
        texto:
          "O L-1A é a antessala do EB-1C, o Green Card de executivo multinacional — sem certificação trabalhista (PERM). A petição deve começar bem antes do teto dos 7 anos.",
        tone: "pine",
      },
    ],
    passos: [
      {
        titulo: "Relação corporativa Brasil–EUA",
        texto:
          "Constitua (ou comprove) a entidade americana ligada à empresa brasileira — subsidiária, filial ou afiliada — com a documentação societária dos dois lados.",
      },
      {
        titulo: "1 ano contínuo comprovado",
        texto:
          "Organize a prova do seu ano contínuo como executivo/gerente ou especialista na operação fora dos EUA, dentro dos últimos 3 anos.",
      },
      {
        titulo: "Petição I-129 pelo empregador",
        texto:
          "A entidade americana protocola o I-129 com o dossiê corporativo. No new office, entram também o contrato do espaço físico e o plano de negócio.",
      },
      {
        titulo: "Visto no consulado (ou mudança de status)",
        texto:
          "Aprovada a petição, o visto sai no consulado — ou, para quem já está nos EUA em outro status, via mudança de status por dentro.",
      },
      {
        titulo: "Família junto, cônjuge trabalhando",
        texto:
          "Cônjuge e filhos solteiros menores de 21 entram de L-2 pela mesma duração — e o cônjuge (L-2S) tem autorização de trabalho automática, sem precisar de EAD.",
      },
      {
        titulo: "A ponte para o Green Card",
        texto:
          "Com a operação americana consolidada, o mesmo dossiê corporativo, reforçado, vira a petição EB-1C — o Green Card de executivo, sem PERM e sem sorteio.",
      },
    ],
    pontes: [
      { label: "Passo a passo: L-1A → EB-1C (o Green Card de executivo)", href: "/caminhos/l1-para-eb1c" },
    ],
    kit: { kitId: "l1", label: "Checklist completo do L-1" },
    fontesOficiais: [
      {
        label: "USCIS — L-1A Intracompany Transferee Executive or Manager",
        url: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/l-1a-intracompany-transferee-executive-or-manager",
      },
      {
        label: "USCIS — L-1B Intracompany Transferee Specialized Knowledge",
        url: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/l-1b-intracompany-transferee-specialized-knowledge",
      },
    ],
    fonteLeis: ["vistos/l1.md", "vistos/eb1c.md"],
    verificadoEm: "2026-07-16",
  },

  // ── EB-2 NIW — Green Card por Interesse Nacional ───────────────────────
  eb2niw: {
    id: "eb2niw",
    tagline:
      "O Green Card que você mesmo peticiona — sem empregador, sem sorteio, com o seu trabalho como argumento.",
    oQueE: [
      "O EB-2 NIW (National Interest Waiver) é um caminho direto para o Green Card: a exigência de oferta de emprego e certificação trabalhista é dispensada porque o seu trabalho interessa aos Estados Unidos. É auto-petição — você protocola o I-140 em seu próprio nome, sem depender de patrocinador.",
      "Não é só para cientistas: engenheiros, profissionais de saúde, empreendedores e especialistas com histórico sólido qualificam, desde que o projeto (o \"endeavor\") tenha mérito substancial e importância nacional. Cônjuge e filhos solteiros menores de 21 entram juntos.",
    ],
    quemPode: [
      "Quem tem mestrado ou acima (ou equivalente estrangeiro) — ou bacharelado + 5 anos de experiência progressiva na especialidade, depois do diploma e relacionada a ele.",
      "Ou quem demonstra habilidade excepcional: pelo menos 3 de 6 critérios (diploma na área, 10+ anos de experiência, licença profissional, remuneração diferenciada, associações, reconhecimento por pares).",
      "E, além da porta de entrada, quem sustenta os 3 fatores do waiver: endeavor com mérito e importância nacional, estar bem posicionado para avançá-lo, e valer a dispensa da oferta de emprego.",
    ],
    bloqueios: [
      {
        titulo: "A ocupação do projeto decide, não o diploma",
        texto:
          "Mestrado em área X com projeto em área que não exige diploma superior não qualifica como advanced degree — o exemplo oficial do USCIS é o engenheiro com mestrado abrindo uma padaria. O endeavor precisa se apoiar numa ocupação de nível superior relacionada à sua formação.",
        base: "USCIS Policy Manual, Vol. 6, Part F, Ch. 5",
      },
      {
        titulo: "Impacto local ou de um só empregador não basta",
        texto:
          "Beneficiar apenas a sua empresa — mesmo uma com presença nacional — não estabelece importância nacional. O endeavor precisa de impacto que transcenda o empregador: setor, região, tecnologia, saúde pública.",
        base: "Matter of Dhanasar, 26 I&N Dec. 884 (AAO 2016)",
      },
      {
        titulo: "Experiência que não conversa com o diploma",
        texto:
          "Os 5 anos de experiência progressiva precisam ser posteriores ao bacharelado e ligados à especialidade dele (ou ao endeavor). Bacharelado em química + 5 anos gerenciando restaurante não vira mestrado em química.",
        base: "8 CFR §204.5(k)(2)",
      },
    ],
    prazos: [
      {
        titulo: "A fila do Visa Bulletin manda no final",
        texto:
          "A aprovação do I-140 garante seu lugar na fila (priority date), mas o Green Card só vem quando a data ficar current na fila \"Rest of World\" do EB-2 — que tem retrogressão recorrente. O app acompanha o Visa Bulletin mensalmente por você.",
        tone: "amber",
      },
      {
        titulo: "Premium processing: resposta do I-140 em 45 dias úteis",
        texto:
          "O NIW aceita premium processing — a decisão do I-140 sai em até 45 dias úteis, contra muitos meses no processamento normal. A fila do Bulletin continua a mesma, mas a certeza chega antes.",
        tone: "pine",
      },
      {
        titulo: "Sem prazo para começar — e o status atual continua valendo",
        texto:
          "A petição pode ser protocolada de dentro (mantendo F-1, H-1B, O-1...) ou de fora dos EUA. O I-140 sozinho não dá status: até o I-485 ou o consulado, você precisa manter o status que já tem.",
        tone: "clay",
      },
    ],
    passos: [
      {
        titulo: "Defina o endeavor",
        texto:
          "O projeto específico — mais concreto que a profissão. \"Engenheiro de software\" não é endeavor; \"desenvolver tecnologia de diagnóstico precoce para o sistema de saúde\" é.",
      },
      {
        titulo: "Feche a porta de entrada do EB-2",
        texto:
          "Organize a prova do advanced degree (diploma + histórico, ou bacharelado + cartas dos 5 anos progressivos) ou dos 3+ critérios de habilidade excepcional.",
      },
      {
        titulo: "Monte o dossiê dos 3 prongs",
        texto:
          "Evidência de mérito e importância nacional, do seu posicionamento (histórico, plano, interesse de terceiros) e do porquê de dispensar a oferta de emprego. O USCIS avalia a totalidade — não existe documento mágico.",
      },
      {
        titulo: "Protocole o I-140 (auto-petição)",
        texto:
          "Com o ETA-9089 Appendix A e a Final Determination assinada. Premium processing opcional para resposta em 45 dias úteis.",
      },
      {
        titulo: "Acompanhe a priority date",
        texto:
          "Aprovado o I-140, sua data entra na fila do Visa Bulletin (EB-2, Rest of World). O painel do Immigrei avisa quando ela ficar current.",
      },
      {
        titulo: "I-485 ou consulado",
        texto:
          "Data current: ajuste de status por dentro (I-485, com autorização de trabalho no meio do caminho) ou processo consular via NVC para quem está fora.",
      },
    ],
    pontes: [
      { label: "O par natural: O-1, o visto que usa o mesmo dossiê", href: "/vistos/o1" },
    ],
    kit: { kitId: "eb2niw", label: "Checklist completo do EB-2 NIW" },
    fontesOficiais: [
      {
        label: "USCIS — Employment-Based Immigration: Second Preference EB-2",
        url: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2",
      },
      {
        label: "Dept. of State — Visa Bulletin",
        url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html",
      },
    ],
    fonteLeis: ["vistos/eb2niw.md", "conceitos/priority-date.md"],
    verificadoEm: "2026-07-16",
  },

  // ── E-2 — Investidor por Tratado ───────────────────────────────────────
  e2: {
    id: "e2",
    tagline:
      "O visto de investidor mais acessível dos EUA — para quem tem a nacionalidade certa. Brasileiros: o bloqueio é do passaporte, não do seu projeto.",
    oQueE: [
      "O E-2 permite a nacionais de países com tratado de comércio e navegação com os EUA investir um valor substancial num negócio americano e tocá-lo pessoalmente. Renovável sem limite enquanto a empresa operar de verdade.",
      "A notícia dura primeiro: o Brasil não tem tratado com os EUA, então brasileiros não qualificam — por nacionalidade, não por mérito. A exceção que muda tudo: dupla cidadania. Passaporte de Portugal, Itália, Espanha, Alemanha, Japão ou outro país do tratado destrava o E-2 normalmente.",
    ],
    quemPode: [
      "Nacionais de país com tratado (lista oficial em travel.state.gov) — incluindo brasileiros com dupla cidadania qualificante.",
      "Quem investe (ou está investindo) valor substancial e em risco num negócio real e operante — sem mínimo legal, mas proporcional ao custo total do negócio.",
      "Quem detém 50%+ da empresa ou controle operacional, e entra exclusivamente para desenvolvê-la e dirigi-la — investidor passivo não qualifica.",
      "Funcionários da empresa com a mesma nacionalidade do tratado, em função executiva/supervisora ou com qualificação essencial.",
    ],
    bloqueios: [
      {
        titulo: "Brasil sem tratado — bloqueio por nacionalidade",
        texto:
          "O E-2 exige nacionalidade de país com tratado de comércio e navegação com os EUA, e o Brasil não tem. Sem segunda cidadania qualificante, as rotas do investidor brasileiro são o L-1 new office e o EB-5.",
        base: "INA §101(a)(15)(E); lista de tratados em 9 FAM 402.9",
      },
      {
        titulo: "Negócio marginal não sustenta o visto",
        texto:
          "A empresa precisa gerar (ou provar capacidade de gerar em até 5 anos) mais do que o sustento mínimo do investidor e da família. Um negócio que só paga as contas da casa é considerado marginal e derruba o caso.",
        base: "8 CFR §214.2(e)(15)",
      },
      {
        titulo: "Dinheiro parado não é investimento",
        texto:
          "O capital precisa estar em risco real — comprometido no negócio, sujeito a perda, com origem lícita rastreável. Fundos numa conta esperando a aprovação não contam.",
        base: "8 CFR §214.2(e)(12)",
      },
    ],
    prazos: [
      {
        titulo: "2 anos por vez, sem limite de renovações",
        texto:
          "Estadia inicial de 2 anos e extensões de até 2 anos, quantas vezes o negócio justificar. Cada viagem internacional costuma renovar a admissão por mais 2 anos na reentrada.",
        tone: "pine",
      },
      {
        titulo: "Mudança substancial exige aviso prévio",
        texto:
          "Vender a empresa, fundir, mudar de ramo — alterações substanciais nos termos do E-2 precisam de aprovação do USCIS antes, não depois.",
        tone: "amber",
      },
      {
        titulo: "O E-2 não leva ao Green Card sozinho",
        texto:
          "É um visto de não-imigrante: exige intenção de partir ao fim do status. A ponte para o Green Card é outra petição — EB-5 com o investimento ampliado, EB-1C com estrutura multinacional, ou EB-2 NIW pelo fundador.",
        tone: "clay",
      },
    ],
    passos: [
      {
        titulo: "Confirme a nacionalidade qualificante",
        texto:
          "Passo zero: seu passaporte (ou o segundo) está na lista de tratados? Sem isso, o caminho é outro — L-1 ou EB-5.",
      },
      {
        titulo: "Estruture a empresa e o investimento",
        texto:
          "Constitua a empresa americana, transfira e comprometa os fundos com rastro documental completo — da origem lícita ao caixa do negócio.",
      },
      {
        titulo: "Plano de negócios de 5 anos",
        texto:
          "Projeções, contratações e crescimento que afastem a marginalidade — um dos documentos mais pesados da aplicação.",
      },
      {
        titulo: "Consulado (DS-160 + DS-156E) ou I-129 por dentro",
        texto:
          "De fora dos EUA, o E-2 sai no consulado, com formulário próprio de tratado. Quem já está dentro em outro status pode mudar via I-129.",
      },
      {
        titulo: "Opere, renove, cresça",
        texto:
          "O E-2 vive da empresa real: renovações acompanham a operação, e o cônjuge (E-2S) trabalha automaticamente, sem EAD.",
      },
    ],
    pontes: [
      { label: "Sem tratado? O caminho do brasileiro: L-1 new office", href: "/vistos/l1" },
      { label: "Passo a passo: L-1A → EB-1C (o Green Card de executivo)", href: "/caminhos/l1-para-eb1c" },
    ],
    kit: { kitId: "e2", label: "Checklist completo do E-2" },
    fontesOficiais: [
      {
        label: "USCIS — E-2 Treaty Investors",
        url: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/e-2-treaty-investors",
      },
      {
        label: "Dept. of State — Treaty Countries",
        url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/treaty.html",
      },
    ],
    fonteLeis: ["vistos/e1-e2.md", "vistos/l1.md"],
    verificadoEm: "2026-07-16",
  },

  // ── E-1 — Comerciante por Tratado ──────────────────────────────────────
  e1: {
    id: "e1",
    tagline:
      "Para quem já comercializa com os EUA — se o passaporte permitir. Brasileiros: a alternativa é o B-1 para as viagens e o L-1 para a operação.",
    oQueE: [
      "O E-1 é o visto do comerciante por tratado: nacionais de países com tratado de comércio e navegação que mantêm um fluxo substancial e contínuo de comércio internacional com os EUA — bens, serviços, tecnologia, transporte, banking.",
      "Assim como o E-2, ele não existe para brasileiros: o Brasil não tem tratado com os EUA. Quem tem dupla cidadania de país qualificante usa a segunda nacionalidade; quem não tem, faz as viagens de negócio com o B-1 e estrutura a operação americana via L-1.",
    ],
    quemPode: [
      "Nacionais de país com tratado (lista em travel.state.gov) — ou brasileiros com dupla cidadania qualificante.",
      "Quem mantém comércio substancial: fluxo contínuo de transações com os EUA, onde a frequência pesa mais que o valor de cada operação.",
      "Quem tem 50%+ do seu comércio internacional concentrado entre os EUA e o país do tratado.",
      "Funcionários com a mesma nacionalidade, em função executiva/supervisora ou com qualificação essencial ao negócio.",
    ],
    bloqueios: [
      {
        titulo: "Brasil sem tratado — bloqueio por nacionalidade",
        texto:
          "Como no E-2, a exigência é de passaporte de país com tratado de comércio e navegação. Sem segunda cidadania qualificante, o E-1 simplesmente não está na mesa para brasileiros.",
        base: "INA §101(a)(15)(E); lista de tratados em 9 FAM 402.9",
      },
      {
        titulo: "Menos da metade do comércio com os EUA",
        texto:
          "O comércio principal precisa ser com os EUA: mais de 50% do volume internacional da empresa. Quem espalha as exportações por muitos países não fecha o requisito, por maior que seja a operação.",
        base: "8 CFR §214.2(e)(11)",
      },
      {
        titulo: "Transações esporádicas não são \"comércio substancial\"",
        texto:
          "Uma venda grande por ano não caracteriza o fluxo contínuo que a regra exige. O E-1 é para relações comerciais vivas — numerosas transações ao longo do tempo.",
        base: "8 CFR §214.2(e)(10)",
      },
    ],
    prazos: [
      {
        titulo: "2 anos por vez, sem limite de renovações",
        texto:
          "Estadia inicial de 2 anos e extensões de até 2 anos enquanto o comércio continuar substancial e principal. Reentradas após viagem renovam a admissão automaticamente.",
        tone: "pine",
      },
      {
        titulo: "O comércio precisa continuar — todo ano",
        texto:
          "O E-1 não é conquistado uma vez: cada renovação reavalia o fluxo. Se o volume com os EUA cair abaixo da metade, o status fica em risco na próxima extensão.",
        tone: "amber",
      },
      {
        titulo: "Sem ponte direta para o Green Card",
        texto:
          "Como todo visto E, exige intenção de partir. As pontes de residência passam por outra petição: EB-1C via estrutura multinacional, EB-2 NIW, ou EB-5.",
        tone: "clay",
      },
    ],
    passos: [
      {
        titulo: "Confirme a nacionalidade qualificante",
        texto:
          "O passo zero de todo visto E: passaporte na lista de tratados. Brasileiros sem dupla cidadania seguem para o B-1 (viagens) ou L-1 (operação).",
      },
      {
        titulo: "Documente o fluxo de comércio",
        texto:
          "Contratos, faturas, embarques e pagamentos internacionais — o histórico de transações com os EUA é o coração do caso.",
      },
      {
        titulo: "Prove o comércio principal",
        texto:
          "Relatório contábil separando o comércio por país, mostrando os EUA com mais de 50% do volume internacional.",
      },
      {
        titulo: "Consulado (DS-160 + DS-156E) ou I-129 por dentro",
        texto:
          "De fora, o E-1 sai no consulado com o formulário de tratado; quem já está nos EUA em status válido pode mudar via I-129.",
      },
    ],
    pontes: [
      { label: "Sem tratado? Viagens de negócio com o B-1/B-2", href: "/vistos/b1" },
      { label: "Estruturar a operação nos EUA: L-1 new office", href: "/vistos/l1" },
    ],
    kit: { kitId: "e1", label: "Checklist completo do E-1" },
    fontesOficiais: [
      {
        label: "USCIS — E-1 Treaty Traders",
        url: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/e-1-treaty-traders",
      },
      {
        label: "Dept. of State — Treaty Countries",
        url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/treaty.html",
      },
    ],
    fonteLeis: ["vistos/e1-e2.md", "vistos/b1-b2.md"],
    verificadoEm: "2026-07-16",
  },

  // ── ESTA / VWP — Isenção de Visto ──────────────────────────────────────
  esta: {
    id: "esta",
    tagline:
      "90 dias sem visto para cidadãos dos países do programa — rápido na ida, inegociável na volta.",
    oQueE: [
      "O ESTA é a autorização eletrônica do Visa Waiver Program: cidadãos de cerca de 40 países (Europa Ocidental, Japão, Coreia do Sul, Austrália, Chile e outros) visitam os EUA por até 90 dias, a turismo ou negócios, sem visto — só com a aplicação online do CBP e um passaporte eletrônico.",
      "O Brasil não participa do programa: brasileiros fazem a mesma visita com o visto B-1/B-2. E mesmo para quem qualifica, o VWP é uma troca — entra mais rápido, mas abre mão da extensão, da mudança de status e do direito de contestar uma remoção.",
    ],
    quemPode: [
      "Cidadãos dos países participantes (lista oficial em travel.state.gov), com passaporte eletrônico válido por 6+ meses além da viagem.",
      "Quem tem propósito de visita — o mesmo escopo do visto B: turismo, reuniões, conferências.",
      "Quem não esteve em países que removem a elegibilidade (Cuba desde 2021; Irã, Iraque, Coreia do Norte, Síria, Líbia, Somália, Sudão e Iêmen desde 2011) nem tem dupla nacionalidade de alguns deles.",
    ],
    bloqueios: [
      {
        titulo: "Brasileiros não usam ESTA",
        texto:
          "O Brasil não integra o Visa Waiver Program. Para a mesma visita de até 6 meses, o caminho do brasileiro é o visto B-1/B-2 — que, ao contrário do VWP, permite extensão e mudança de status.",
        base: "INA §217; lista de países em travel.state.gov",
      },
      {
        titulo: "Sem extensão e sem mudança de status",
        texto:
          "Os 90 dias do VWP não se estendem e não viram outro status por dentro dos EUA (exceção estreita: ajuste por parente imediato de cidadão americano). Quem quer estudar, trabalhar ou ficar mais tempo precisa entrar com o visto certo.",
        base: "INA §217; 8 CFR §217",
      },
      {
        titulo: "Entrar pelo VWP renuncia ao contencioso",
        texto:
          "O ingresso pelo programa renuncia ao direito de contestar uma remoção diante de juiz (exceto pedido de asilo). É a troca invisível dos 90 dias sem visto — e o motivo de o VWP ser má ideia para qualquer plano além da visita.",
        base: "INA §217(b)",
      },
    ],
    prazos: [
      {
        titulo: "90 dias, contados na entrada, sem conversa",
        texto:
          "O prazo é fixo e não se estende. Passar dele remove a elegibilidade futura ao VWP, inicia presença irregular automaticamente e permite remoção sem audiência.",
        tone: "clay",
      },
      {
        titulo: "ESTA vale 2 anos (ou até o passaporte vencer)",
        texto:
          "A autorização cobre múltiplas entradas por até 2 anos. Passaporte novo exige ESTA novo — confira a validade antes de cada viagem.",
        tone: "pine",
      },
      {
        titulo: "Aplique antes de comprar a passagem",
        texto:
          "A aprovação costuma sair em minutos, mas pode levar até 72 horas — e o embarque é barrado sem ESTA válido. ESTA negado não impede nada além do programa: o visto B continua disponível no consulado.",
        tone: "amber",
      },
    ],
    passos: [
      {
        titulo: "Confira a elegibilidade",
        texto:
          "Cidadania de país participante, passaporte eletrônico e nenhuma das viagens/nacionalidades que removem o benefício.",
      },
      {
        titulo: "Aplique no site oficial do CBP",
        texto:
          "Somente em esta.cbp.dhs.gov — sites intermediários cobram taxas extras pelo mesmo formulário. Guarde o número da autorização.",
      },
      {
        titulo: "Viaje dentro do escopo de visita",
        texto:
          "Turismo e negócios no escopo do visto B. O oficial do CBP decide a admissão na chegada — ESTA aprovado não é garantia de entrada.",
      },
      {
        titulo: "Respeite os 90 dias",
        texto:
          "Sem extensão, sem mudança de status. Se os planos crescerem — estudo, trabalho, vida — a próxima entrada é com o visto da categoria certa.",
      },
    ],
    pontes: [
      { label: "Brasileiro? Sua visita é com o B-1/B-2", href: "/vistos/b1" },
    ],
    kit: { kitId: "esta", label: "Checklist do ESTA" },
    fontesOficiais: [
      {
        label: "Dept. of State — Visa Waiver Program",
        url: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html",
      },
      {
        label: "CBP — Electronic System for Travel Authorization (ESTA)",
        url: "https://www.cbp.gov/travel/international-visitors/esta",
      },
    ],
    fonteLeis: ["vistos/esta-vwp.md", "vistos/b1-b2.md"],
    verificadoEm: "2026-07-16",
  },
};

export function getVistoPage(id: string): VistoPage | null {
  return VISTO_PAGES[id] ?? null;
}

export function hasVistoPage(id: string): boolean {
  return id in VISTO_PAGES;
}
