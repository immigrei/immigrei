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
  kit: { kitId: string; label: string };
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
};

export function getVistoPage(id: string): VistoPage | null {
  return VISTO_PAGES[id] ?? null;
}

export function hasVistoPage(id: string): boolean {
  return id in VISTO_PAGES;
}
