// lib/vistosCatalog.ts — single source of truth for the visa catalog cards.
// Consumed by /vistos (grid) and /onboarding (result enrichment).

export type Availability = "all" | "treaty-only";

export interface Visto {
  id: string;
  codigo: string;
  nome: string;
  badge: string;
  badgeColor: "pine" | "amber" | "ink" | "clay";
  descricao: string;
  chave: string;   // o requisito-porteiro que destrava o caminho (fonte oficial)
  degrau: string;  // o plano de crescimento p/ quem ainda não está pronto
  destaque: { tipo: "star" | "warning" | "block"; texto: string } | null;
  stats: { label: string; valor: string; ok: boolean }[];
  // Passo a passo da ponte rumo ao Green Card ("direto, reto e sem curva"):
  // quando o manual/motor existe, o card linka direto para ele.
  rumoGc?: { label: string; href: string };
  availability: Availability;
}

// ─── Study & Exchange ──────────────────────────────────────────────────────

export const vistosEstudo: Visto[] = [
  {
    id: "f1",
    codigo: "F-1",
    nome: "Estudante Acadêmico",
    badge: "Estudante",
    badgeColor: "pine",
    descricao:
      "Para estudar em universidades, colleges ou escolas de idiomas. O visto mais comum entre brasileiros — e a porta de entrada da escada estudo → trabalho.",
    chave:
      "Um I-20 emitido por escola certificada SEVP + prova de fundos para o 1º ano + taxa SEVIS (I-901) paga.",
    degrau:
      "Ainda sem escola ou fundos? Comece por aí: o I-20 vem da escola, e extratos organizados (em seu nome) decidem a entrevista.",
    destaque: {
      tipo: "star",
      texto:
        "Depois de formado, o OPT dá até 12 meses de trabalho (36 em STEM) — é o trampolim clássico para o H-1B.",
    },
    stats: [
      { label: "Trabalho", valor: "Limitado (on-campus, OPT/CPT)", ok: true },
      { label: "Duração", valor: "Enquanto durar o curso (D/S)", ok: true },
      { label: "Rumo ao Green Card", valor: "Indireto — via OPT → H-1B", ok: true },
      { label: "Família", valor: "F-2 (cônjuge não trabalha)", ok: false },
    ],
    rumoGc: { label: "Passo a passo: F-1 → H-1B", href: "/caminhos/f1-para-h1b" },
    availability: "all",
  },
  {
    id: "m1",
    codigo: "M-1",
    nome: "Estudante Técnico / Vocacional",
    badge: "Estudante",
    badgeColor: "pine",
    descricao:
      "Para cursos profissionalizantes: aviação, culinária, mecânica, estética e afins, em escolas credenciadas pelo SEVP.",
    chave:
      "Um I-20 (versão M) de escola vocacional certificada + fundos para o curso INTEIRO comprovados de partida.",
    degrau:
      "Escolha um curso perto de onde vai morar — distância implausível entre casa e escola é motivo clássico de negação.",
    destaque: {
      tipo: "warning",
      texto:
        "A lei veda mudar de M-1 para F-1 por dentro dos EUA, sem exceção. Se um dia você quiser universidade, o caminho é pelo consulado — planeje a categoria certa antes.",
    },
    stats: [
      { label: "Trabalho", valor: "Não (estágio só após o curso)", ok: false },
      { label: "Duração", valor: "Duração do curso (máx. 1 ano, prorrogável)", ok: true },
      { label: "Rumo ao Green Card", valor: "Indireto — trocando p/ F-1 (consulado) ou família", ok: true },
      { label: "Família", valor: "M-2 (cônjuge não trabalha)", ok: false },
    ],
    rumoGc: { label: "Passo a passo: M-1 → F-1 pelo consulado", href: "/caminhos/m1-para-f1-consulado" },
    availability: "all",
  },
  {
    id: "j1",
    codigo: "J-1",
    nome: "Intercâmbio e Pesquisa",
    badge: "Intercâmbio",
    badgeColor: "pine",
    descricao:
      "Para programas patrocinados: au pair, pesquisa, professor visitante, summer work, treinamento profissional e mais 10 categorias.",
    chave:
      "Um DS-2019 emitido por um sponsor designado pelo Depto. de Estado — não é a escola que emite, é o programa patrocinador.",
    degrau:
      "O sponsor conduz quase tudo: o primeiro passo é ser aceito num programa (au pair, intern, pesquisa) — a partir daí o caminho anda sozinho.",
    destaque: {
      tipo: "warning",
      texto:
        "Regra dos 2 anos (212(e)): algumas categorias exigem voltar ao Brasil por 2 anos antes de mudar de status ou pedir green card. Confira no seu DS-2019 antes de aceitar.",
    },
    stats: [
      { label: "Trabalho", valor: "Sim, dentro do programa", ok: true },
      { label: "Duração", valor: "Varia por categoria (meses a 5 anos)", ok: true },
      { label: "Rumo ao Green Card", valor: "Possível — livre do 212(e), ou após 2 anos/waiver", ok: true },
      { label: "Família", valor: "J-2 (cônjuge PODE pedir permissão de trabalho)", ok: true },
    ],
    rumoGc: { label: "Passo a passo: J-1 → F-1 e a regra dos 2 anos", href: "/caminhos/j1-para-f1" },
    availability: "all",
  },
  {
    id: "h1b",
    codigo: "H-1B",
    nome: "Trabalho Especializado",
    badge: "Trabalho",
    badgeColor: "amber",
    descricao:
      "O visto de trabalho mais conhecido: para funções que exigem graduação, com patrocínio de um empregador americano.",
    chave:
      "Graduação na área da vaga + um empregador disposto a patrocinar — a petição (I-129) é dele, não sua.",
    degrau:
      "Sem graduação? Cada 3 anos de experiência contam como 1 ano de estudo. Sem empregador? A rota comum é F-1 → OPT → conquistar a vaga por dentro.",
    destaque: {
      tipo: "warning",
      texto:
        "Tem sorteio: registro em março pelo empregador, com ~1 chance em 3 por ano. Quem planeja a escada F-1/OPT ganha múltiplas tentativas.",
    },
    stats: [
      { label: "Trabalho", valor: "Sim (no patrocinador)", ok: true },
      { label: "Duração", valor: "3 + 3 anos (máx. 6)", ok: true },
      { label: "Rumo ao Green Card", valor: "Sim — dual intent, patrocínio comum", ok: true },
      { label: "Família", valor: "H-4 (cônjuge trabalha em certos casos)", ok: true },
    ],
    availability: "all",
  },
  {
    id: "o1",
    codigo: "O-1",
    nome: "Habilidade Extraordinária",
    badge: "Trabalho",
    badgeColor: "amber",
    descricao:
      "Para quem se destaca comprovadamente na sua área: tech, ciência, artes, esportes, negócios. Cada vez mais usado por brasileiros.",
    chave:
      "Provas de reconhecimento em pelo menos 3 de 8 critérios oficiais (prêmios, imprensa, papel de liderança, alta remuneração...) + um empregador ou agente nos EUA.",
    degrau:
      "O dossiê se constrói em 12–24 meses: prêmios, publicações, cartas de especialistas, projetos de destaque. Dá para planejar — e vale começar hoje.",
    destaque: {
      tipo: "star",
      texto: "Sem sorteio e sem cota — e renovações ilimitadas enquanto o trabalho continuar.",
    },
    stats: [
      { label: "Trabalho", valor: "Sim (com o peticionário)", ok: true },
      { label: "Duração", valor: "3 anos + renovações sem limite", ok: true },
      { label: "Rumo ao Green Card", valor: "Sim — perfil casa com EB-1A/NIW", ok: true },
      { label: "Família", valor: "O-3 (cônjuge não trabalha)", ok: false },
    ],
    rumoGc: { label: "Passo a passo: O-1 → Green Card por autopetição", href: "/caminhos/o1-autopeticao-greencard" },
    availability: "all",
  },
];

export const vistosNegocios: Visto[] = [
  {
    id: "e2",
    codigo: "E-2",
    nome: "Investidor por Tratado",
    badge: "Investimento",
    badgeColor: "ink",
    descricao:
      "Para quem investe capital próprio e em risco num negócio real nos EUA — restaurantes, franquias, empresas de serviço.",
    chave:
      "Cidadania de país com tratado com os EUA + investimento substancial já comprometido num negócio operante.",
    degrau:
      "Brasileiro não tem tratado — mas a porta costuma ser a segunda cidadania (italiana, portuguesa, espanhola por descendência). Sem ela, os caminhos análogos são L-1 e EB-5.",
    destaque: {
      tipo: "block",
      texto: "O Brasil não tem tratado E-2 — disponível apenas com cidadania de país-membro.",
    },
    stats: [
      { label: "Trabalho", valor: "Sim (no próprio negócio)", ok: true },
      { label: "Duração", valor: "Renovável sem limite (2–5 anos por vez)", ok: true },
      { label: "Rumo ao Green Card", valor: "Indireto — ponte para EB-5, EB-1C ou NIW", ok: true },
      { label: "Família", valor: "Cônjuge PODE trabalhar", ok: true },
    ],
    availability: "treaty-only",
  },
  {
    id: "e1",
    codigo: "E-1",
    nome: "Comércio por Tratado",
    badge: "Negócios",
    badgeColor: "ink",
    descricao:
      "Para quem já tem empresa com comércio constante e substancial com os EUA — exportação, importação, serviços.",
    chave:
      "Cidadania de país com tratado + mais de 50% do volume de comércio da empresa entre os EUA e o país do tratado.",
    degrau:
      "O degrau é o histórico: contratos e faturamento recorrentes com os EUA constroem o caso. Brasileiros precisam da segunda cidadania (como no E-2).",
    destaque: {
      tipo: "block",
      texto: "O Brasil não tem tratado E-1 — disponível apenas com cidadania de país-membro.",
    },
    stats: [
      { label: "Trabalho", valor: "Sim (na empresa do tratado)", ok: true },
      { label: "Duração", valor: "Renovável sem limite (2–5 anos por vez)", ok: true },
      { label: "Rumo ao Green Card", valor: "Indireto — via EB-1C (executivo) ou patrocínio", ok: true },
      { label: "Família", valor: "Cônjuge PODE trabalhar", ok: true },
    ],
    availability: "treaty-only",
  },
  {
    id: "esta",
    codigo: "ESTA",
    nome: "Autorização Eletrônica de Viagem",
    badge: "Visita",
    badgeColor: "clay",
    descricao:
      "Para visitas curtas de turismo ou negócios sem precisar de visto — só a autorização online, para quem tem passaporte de país do Visa Waiver Program.",
    chave:
      "Passaporte de país participante do VWP (a maioria da Europa e outros países com tratado) + ESTA aprovado antes de embarcar.",
    degrau:
      "Sem passaporte elegível ao VWP? O caminho é o B-1/B-2 pelo consulado — veja o card ao lado.",
    destaque: {
      tipo: "warning",
      texto:
        "Só dá para ficar até 90 dias, sem estender e sem mudar de status por dentro dos EUA. Exceção estreita: parente imediato de cidadão americano — análise individual.",
    },
    stats: [
      { label: "Trabalho", valor: "Não", ok: false },
      { label: "Duração", valor: "Até 90 dias, sem extensão", ok: false },
      { label: "Rumo ao Green Card", valor: "Indireto — só por parente imediato de cidadão", ok: true },
      { label: "Família", valor: "Cada pessoa solicita a própria autorização", ok: true },
    ],
    availability: "treaty-only",
  },
  {
    id: "b1",
    codigo: "B-1/B-2",
    nome: "Turismo e Negócios",
    badge: "Visita",
    badgeColor: "clay",
    descricao:
      "Para visitas: turismo, reuniões de negócios, feiras, tratamento médico, visita a família. É visita — não é vida nos EUA.",
    chave:
      "Convencer o consulado dos seus vínculos com seu país de origem: emprego, estudo, família e bens que provem a intenção de voltar.",
    degrau:
      "A entrevista é o jogo inteiro. Organize os vínculos ANTES de agendar — e nunca use o B para trabalhar ou estudar em carga integral: isso fecha portas futuras.",
    destaque: {
      tipo: "warning",
      texto:
        "O prazo de permanência é o do I-94 (definido na entrada), não a validade do visto. Muita gente confunde — e a confusão custa caro.",
    },
    stats: [
      { label: "Trabalho", valor: "Não", ok: false },
      { label: "Duração", valor: "Até 6 meses por entrada (I-94 manda)", ok: true },
      { label: "Rumo ao Green Card", valor: "Indireto — mudando de categoria (ex.: B → F-1) ou família", ok: true },
      { label: "Família", valor: "Cada pessoa solicita o seu", ok: true },
    ],
    rumoGc: { label: "Passo a passo: B-2 → F-1 por dentro dos EUA", href: "/casos/cos-b2-f1" },
    availability: "all",
  },
  {
    id: "l1",
    codigo: "L-1",
    nome: "Transferência Intraempresarial",
    badge: "Trabalho",
    badgeColor: "amber",
    descricao:
      "Para quem é transferido por uma empresa com operação no Brasil e nos EUA — ou para o dono que vai abrir a filial americana da própria empresa.",
    chave:
      "1 ano trabalhando na empresa fora dos EUA (nos últimos 3) + relação corporativa real entre as empresas (matriz, filial, afiliada).",
    degrau:
      "Dois degraus possíveis: entrar numa multinacional com presença nos EUA e completar 12 meses — ou estruturar a expansão da sua própria empresa (L-1 de novo escritório).",
    destaque: {
      tipo: "star",
      texto: "Sem sorteio e sem cota — e o L-1A é a ponte natural para o EB-1C (green card de executivo).",
    },
    stats: [
      { label: "Trabalho", valor: "Sim (na própria empresa)", ok: true },
      { label: "Duração", valor: "L-1A até 7 anos / L-1B até 5", ok: true },
      { label: "Rumo ao Green Card", valor: "Sim — dual intent, via EB-1C", ok: true },
      { label: "Família", valor: "L-2 (cônjuge PODE trabalhar)", ok: true },
    ],
    rumoGc: { label: "Passo a passo: L-1A → EB-1C (Green Card)", href: "/caminhos/l1-para-eb1c" },
    availability: "all",
  },
  {
    id: "eb2niw",
    codigo: "EB-2 NIW",
    nome: "Green Card por Interesse Nacional",
    badge: "Green Card",
    badgeColor: "pine",
    descricao:
      "Residência permanente direta, sem empregador: para profissionais cujo trabalho tem mérito e importância nacional para os EUA.",
    chave:
      "Grau avançado (mestrado+, ou graduação + 5 anos de experiência) + um projeto/atuação com impacto que interesse aos EUA — bem documentado.",
    degrau:
      "O caso se constrói: publicações, cartas de recomendação, plano do que você fará nos EUA. Quem começa a montar o dossiê 1 ano antes chega muito mais forte.",
    destaque: {
      tipo: "star",
      texto: "Autopetição: você mesmo protocola — sem sorteio, sem oferta de emprego, sem patrocinador.",
    },
    stats: [
      { label: "Trabalho", valor: "Livre (é residência)", ok: true },
      { label: "Duração", valor: "Permanente (é o green card)", ok: true },
      { label: "Rumo ao Green Card", valor: "É o próprio green card", ok: true },
      { label: "Família", valor: "Cônjuge e filhos <21 incluídos", ok: true },
    ],
    availability: "all",
  },
];

// ─── Lookup by recommendation title ─────────────────────────────────────────

export const todosVistos: Visto[] = [...vistosEstudo, ...vistosNegocios];

// Onboarding titles follow "CÓDIGO (Nome) [— sufixo]" for pure visa cards.
// Process cards never put "(" right after the code — "F-1 → H-1B (guia
// passo a passo)", "I-539 — Mudança de Status", "Transferência de H-1B
// (novo empregador)" — so requiring `CODE (` keeps them on the simple format.
const CODE_TO_ID: Record<string, string> = {
  "F-1": "f1",
  "M-1": "m1",
  "J-1": "j1",
  "H-1B": "h1b",
  "O-1": "o1",
  "L-1": "l1",
  "B-1": "b1",
  "B-2": "b1",
  "B-1/B-2": "b1",
  "ESTA": "esta",
  "E-1": "e1",
  "E-2": "e2",
  "EB-2 NIW": "eb2niw",
};

export function findCatalogVisto(title: string): Visto | null {
  const code = Object.keys(CODE_TO_ID).find((c) => title.startsWith(`${c} (`));
  if (!code) return null;
  return todosVistos.find((v) => v.id === CODE_TO_ID[code]) ?? null;
}
