/**
 * Path manuals ("manuais de caminho")
 *
 * The free educational layer between a path card ("Quero seguir este
 * caminho") and the paid kit. A manual tells the user EVERYTHING about a
 * path before any money changes hands: what it is, who qualifies, who is
 * legally blocked (and why), deadlines/risks, and a high-level walkthrough.
 * The kit holds the operational assets (templates, checklists, deep
 * step-by-step) — the manual builds the trust that sells it.
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
  kit: { kitId: string; label: string; preco: string };
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
    kit: { kitId: "f1", label: "Kit F-1 pelo consulado", preco: "R$ 197" },
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
    verificadoEm: "pendente",
  },
};

export function getManual(slug: string): Manual | undefined {
  return MANUAIS[slug];
}
