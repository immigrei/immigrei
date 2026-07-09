"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Availability = "all" | "treaty-only";

interface Visto {
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

const vistosEstudo: Visto[] = [
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

const vistosNegocios: Visto[] = [
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
    id: "b1",
    codigo: "B-1/B-2",
    nome: "Turismo e Negócios",
    badge: "Visita",
    badgeColor: "clay",
    descricao:
      "Para visitas: turismo, reuniões de negócios, feiras, tratamento médico, visita a família. É visita — não é vida nos EUA.",
    chave:
      "Convencer o consulado dos seus vínculos com o Brasil: emprego, estudo, família e bens que provem a intenção de voltar.",
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

// ─── Badge styles ──────────────────────────────────────────────────────────

const badgeStyles: Record<string, string> = {
  pine: "bg-pine-tint text-pine",
  amber: "bg-amber-tint text-amber-deep",
  ink: "bg-ink/10 text-ink-soft",
  clay: "bg-clay/10 text-clay",
};

// ─── Nationality mock (will come from onboarding profile) ──────────────────
// "brazilian" | "treaty" | null (null = not yet set, show all with locks)
type Nationality = "brazilian" | "treaty" | null;

// ─── Card ──────────────────────────────────────────────────────────────────

function VistoCard({
  visto,
  nationality,
  selecionado,
  onSelect,
}: {
  visto: Visto;
  nationality: Nationality;
  selecionado: boolean;
  onSelect: () => void;
}) {
  const locked =
    visto.availability === "treaty-only" && nationality === "brazilian";

  return (
    <article
      onClick={() => !locked && onSelect()}
      className={[
        "relative rounded-2xl p-6 flex flex-col gap-5 transition-all duration-200",
        "border-2",
        locked
          ? "bg-cream border-transparent opacity-60 cursor-not-allowed"
          : "bg-cream-2 cursor-pointer",
        !locked && selecionado
          ? "border-pine shadow-lg shadow-pine/10 scale-[1.01]"
          : !locked
            ? "border-transparent hover:border-pine/30 hover:shadow-md"
            : "",
      ].join(" ")}
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* Lock overlay badge */}
      {locked && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-ink/10 rounded-full px-2.5 py-1">
          <svg className="w-3 h-3 text-ink-faint" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm0 2a2 2 0 012 2v2H8V6a2 2 0 012-2z" clipRule="evenodd" />
          </svg>
          <span className="text-ink-faint text-xs font-semibold">Indisponível</span>
        </div>
      )}

      {/* Selected checkmark */}
      {selecionado && !locked && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-pine flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Badge */}
      <div className="flex items-center gap-3">
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${badgeStyles[visto.badgeColor]}`}
          style={{ fontSize: "11px", letterSpacing: "0.05em" }}
        >
          {visto.badge}
        </span>
      </div>

      {/* Name */}
      <div>
        <p className="text-xs text-ink-faint font-bold uppercase tracking-wider mb-1">
          {visto.codigo}
        </p>
        <h3
          className="text-2xl text-ink leading-snug"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          {visto.nome}
        </h3>
        <p className="text-ink-soft text-sm mt-2 leading-relaxed">
          {visto.descricao}
        </p>
      </div>

      {/* Callout */}
      {/* O que destrava */}
      <div className="bg-pine-tint/60 rounded-xl px-4 py-3">
        <p className="text-pine text-xs font-bold uppercase tracking-wider mb-1">🔑 O que destrava este caminho</p>
        <p className="text-ink text-sm leading-relaxed">{visto.chave}</p>
      </div>

      {/* Degrau para quem não está pronto */}
      <div className="bg-cream rounded-xl px-4 py-3">
        <p className="text-ink-faint text-xs font-bold uppercase tracking-wider mb-1">🌱 Ainda não está pronto?</p>
        <p className="text-ink-soft text-sm leading-relaxed">{visto.degrau}</p>
      </div>

      {visto.destaque && (
        <div
          className={[
            "rounded-xl px-4 py-3 text-sm leading-relaxed flex gap-2.5 items-start",
            visto.destaque.tipo === "block"
              ? "bg-clay/10 text-clay"
              : visto.destaque.tipo === "warning"
                ? "bg-amber-tint text-amber-deep"
                : "bg-pine-tint text-pine",
          ].join(" ")}
        >
          <span className="mt-0.5 flex-shrink-0">
            {visto.destaque.tipo === "block" ? "🚫" : visto.destaque.tipo === "warning" ? "⚠️" : "✦"}
          </span>
          <span>{visto.destaque.texto}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {visto.stats.map((stat) => (
          <div key={stat.label} className="bg-cream rounded-xl px-3 py-2.5">
            <p className="text-ink-faint text-xs font-bold uppercase tracking-wider mb-0.5">
              {stat.label}
            </p>
            <p className={`text-sm font-medium ${stat.ok ? "text-ink" : "text-clay"}`}>
              {stat.valor}
            </p>
          </div>
        ))}
      </div>

      {/* Ponte rumo ao Green Card — link direto para o passo a passo */}
      {!locked && visto.rumoGc && (
        <Link
          href={visto.rumoGc.href}
          onClick={(e) => e.stopPropagation()}
          className="text-sm font-bold text-pine hover:text-pine-deep underline underline-offset-4 transition-colors"
        >
          🧭 {visto.rumoGc.label} →
        </Link>
      )}

      {/* CTA */}
      {!locked && (
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className={[
            "w-full mt-auto rounded-xl py-3.5 text-sm font-semibold transition-all duration-150",
            selecionado
              ? "bg-amber text-ink shadow-md shadow-amber/30"
              : "bg-amber/80 text-ink hover:bg-amber hover:shadow-md hover:shadow-amber/20",
          ].join(" ")}
        >
          Quero seguir esse caminho →
        </button>
      )}
    </article>
  );
}

// ─── Section header ────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="max-w-5xl mx-auto mb-6 mt-12 first:mt-0">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-px flex-1 bg-ink/10" />
        <h2
          className="text-xs font-bold uppercase tracking-widest text-ink-faint px-3"
          style={{ fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
        >
          {title}
        </h2>
        <div className="h-px flex-1 bg-ink/10" />
      </div>
      <p className="text-center text-ink-faint text-xs mt-2">{subtitle}</p>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function VistosPage() {
  const router = useRouter();
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Nationality, location and goal arrive from the onboarding via query
  // params (read after mount — this page is statically prerendered).
  const [nationality, setNationality] = useState<Nationality>(null);
  // Raw onboarding answer ("brazilian" | "treaty" | "other") — persisted to
  // the profile, unlike `nationality` which is collapsed for card filtering.
  const [rawNationality, setRawNationality] = useState<string | null>(null);
  const [location, setLocation] = useState<"brasil" | "eua" | null>(null);
  const [mainGoal, setMainGoal] = useState<string | null>(null);
  // Cards recomendados pelo onboarding (param `focus`) — sobem para uma
  // seção própria; os demais continuam visíveis como rotas paralelas.
  const [focusIds, setFocusIds] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nat = params.get("nationality");
    if (nat === "brazilian" || nat === "other") setNationality("brazilian");
    else if (nat === "treaty") setNationality("treaty");
    if (nat === "brazilian" || nat === "treaty" || nat === "other") {
      setRawNationality(nat);
    }
    const loc = params.get("location");
    if (loc === "brasil" || loc === "eua") setLocation(loc);
    setMainGoal(params.get("goal"));
    const focus = params.get("focus");
    if (focus) {
      const valid = new Set([...vistosEstudo, ...vistosNegocios].map((v) => v.id));
      setFocusIds(focus.split(",").filter((id) => valid.has(id)));
    }
  }, []);

  const todosVistos = [...vistosEstudo, ...vistosNegocios];
  const vistoSelecionado = todosVistos.find((v) => v.id === selecionado);

  const recomendados = focusIds
    .map((id) => todosVistos.find((v) => v.id === id))
    .filter((v): v is Visto => Boolean(v));
  const estudoRestantes = vistosEstudo.filter((v) => !focusIds.includes(v.id));
  const negociosRestantes = vistosNegocios.filter((v) => !focusIds.includes(v.id));

  async function confirmarVisto() {
    if (!vistoSelecionado || saving) return;
    setSaving(true);
    setSaveError(null);
    const payload = {
      visa_type: vistoSelecionado.id,
      main_goal: mainGoal ?? "outro",
      ...(location ? { location } : {}),
      ...(rawNationality ? { nationality: rawNationality } : {}),
    };
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        // Not signed in yet — stash the selection so it survives the sign-up
        // round-trip, then create the account. The onboarding page picks this
        // up after sign-up and finishes the save automatically.
        localStorage.setItem("immigrei_pending_profile", JSON.stringify(payload));
        router.push("/sign-up");
        return;
      }
      if (!res.ok) throw new Error("save_failed");
      router.push("/dashboard");
    } catch {
      setSaveError("Não conseguimos salvar agora. Tente novamente.");
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-12 md:py-16 pb-28">
      {/* Page header */}
      <section className="max-w-2xl mx-auto text-center mb-14">
        <span
          className="inline-block text-xs font-bold uppercase tracking-widest text-pine mb-4"
          style={{ fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
        >
          Sua jornada começa aqui
        </span>
        <h1
          className="text-4xl md:text-5xl text-ink mb-4 leading-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          Qual é o seu visto?
        </h1>
        <p className="text-ink-soft text-lg leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
          Selecione o visto que melhor descreve sua situação atual ou o caminho
          que você quer seguir.
        </p>
      </section>

      {/* Section 0 — Recomendados pelo onboarding (quando há focus) */}
      {recomendados.length > 0 && (
        <>
          <SectionHeader
            title="Recomendados para você"
            subtitle="Com base nas suas respostas, estes são os caminhos mais prováveis — os demais seguem abertos para comparar"
          />
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {recomendados.map((v) => (
              <VistoCard
                key={v.id}
                visto={v}
                nationality={nationality}
                selecionado={selecionado === v.id}
                onSelect={() => setSelecionado(v.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Section 1 — Estudo & Intercâmbio */}
      {estudoRestantes.length > 0 && (
        <>
          <SectionHeader
            title={recomendados.length > 0 ? "Outros caminhos — Estudo & Intercâmbio" : "Estudo & Intercâmbio"}
            subtitle="Vistos para quem vem estudar, pesquisar ou participar de programas de intercâmbio"
          />
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {estudoRestantes.map((v) => (
              <VistoCard
                key={v.id}
                visto={v}
                nationality={nationality}
                selecionado={selecionado === v.id}
                onSelect={() => setSelecionado(v.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Section 2 — Negócios & Investimento */}
      {negociosRestantes.length > 0 && (
        <>
          <SectionHeader
            title={recomendados.length > 0 ? "Outros caminhos — Negócios & Investimento" : "Negócios & Investimento"}
            subtitle="Vistos para empreendedores, executivos e investidores — alguns exigem tratado entre países"
          />
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {negociosRestantes.map((v) => (
              <VistoCard
                key={v.id}
                visto={v}
                nationality={nationality}
                selecionado={selecionado === v.id}
                onSelect={() => setSelecionado(v.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Travel note */}
      <div className="max-w-5xl mx-auto mt-8">
        <div className="bg-pine text-cream rounded-2xl px-6 py-5 flex gap-4 items-start">
          <span className="text-2xl flex-shrink-0 mt-0.5">✈️</span>
          <div style={{ fontFamily: "var(--font-body)" }}>
            <p className="font-semibold text-cream mb-1 text-sm uppercase tracking-wide">
              Viagem ao Brasil
            </p>
            <p className="text-cream/80 text-sm leading-relaxed">
              Todos esses vistos permitem viagem ao Brasil. O que muda são os
              documentos necessários para reentrar nos EUA — e isso varia por
              visto. Ao selecionar seu caminho, você verá o checklist completo.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky confirm bar */}
      {selecionado && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-cream via-cream/95 to-transparent pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            {saveError && (
              <p className="text-center text-sm text-clay mb-2 bg-cream rounded-xl py-1.5">
                {saveError}
              </p>
            )}
            <button
              onClick={confirmarVisto}
              disabled={saving}
              className="w-full bg-pine text-cream rounded-2xl py-4 font-semibold text-base shadow-xl shadow-pine/30 transition-all hover:bg-pine-deep active:scale-[0.98] disabled:opacity-60"
            >
              {saving
                ? "Salvando sua jornada..."
                : `Confirmar ${vistoSelecionado?.codigo} — ${vistoSelecionado?.nome} →`}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
