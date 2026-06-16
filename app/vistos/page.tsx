"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Availability = "all" | "treaty-only";

interface Visto {
  id: string;
  codigo: string;
  nome: string;
  badge: string;
  badgeColor: "pine" | "amber" | "ink" | "clay";
  descricao: string;
  destaque: { tipo: "star" | "warning" | "block"; texto: string } | null;
  stats: { label: string; valor: string; ok: boolean }[];
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
      "Para quem vai estudar em universidades, colleges ou escolas de idiomas nos EUA. O visto mais comum entre brasileiros.",
    destaque: {
      tipo: "star",
      texto:
        "Permite cursos híbridos (presencial + online) — você pode fazer parte da carga horária remotamente.",
    },
    stats: [
      { label: "Trabalho", valor: "Permitido (OPT/CPT)", ok: true },
      { label: "Duração", valor: "Curso + 60 dias", ok: true },
      { label: "Sorteio", valor: "Não", ok: true },
      { label: "Viagem ao Brasil", valor: "Sim, com I-20 válido", ok: true },
    ],
    availability: "all",
  },
  {
    id: "m1",
    codigo: "M-1",
    nome: "Estudante Técnico",
    badge: "Vocacional",
    badgeColor: "pine",
    descricao:
      "Para programas técnicos e vocacionais — mecânica, culinária, aviação, estética e afins.",
    destaque: null,
    stats: [
      { label: "Trabalho", valor: "Muito restrito", ok: false },
      { label: "Duração", valor: "Curso + 30 dias", ok: true },
      { label: "Sorteio", valor: "Não", ok: true },
      { label: "Viagem ao Brasil", valor: "Sim, com restrições", ok: true },
    ],
    availability: "all",
  },
  {
    id: "j1",
    codigo: "J-1",
    nome: "Intercâmbio Cultural",
    badge: "Intercâmbio",
    badgeColor: "amber",
    descricao:
      "Para programas de intercâmbio, au pair, pesquisa, treinamento ou trabalho temporário com patrocinador autorizado.",
    destaque: {
      tipo: "warning",
      texto:
        "Alguns programas têm a regra dos 2 anos — obrigação de retornar ao Brasil antes de pedir outro visto.",
    },
    stats: [
      { label: "Trabalho", valor: "Dentro do programa", ok: true },
      { label: "Duração", valor: "Até 5 anos", ok: true },
      { label: "Sorteio", valor: "Não", ok: true },
      { label: "Viagem ao Brasil", valor: "Sim, com atenção", ok: true },
    ],
    availability: "all",
  },
  {
    id: "h1b",
    codigo: "H-1B",
    nome: "Trabalhador Especialista",
    badge: "Trabalho",
    badgeColor: "ink",
    descricao:
      "Para quem tem emprego formal nos EUA em área especializada — tecnologia, engenharia, saúde, finanças. Exige patrocínio de empregador americano.",
    destaque: {
      tipo: "warning",
      texto:
        "Sujeito a sorteio anual. Muitos não são selecionados no primeiro ano.",
    },
    stats: [
      { label: "Trabalho", valor: "Sim (patrocinador)", ok: true },
      { label: "Duração", valor: "3 anos, até 6", ok: true },
      { label: "Sorteio", valor: "Sim — 85k vagas/ano", ok: false },
      { label: "Viagem ao Brasil", valor: "Sim, com I-797", ok: true },
    ],
    availability: "all",
  },
  {
    id: "o1",
    codigo: "O-1",
    nome: "Habilidade Extraordinária",
    badge: "Talento",
    badgeColor: "amber",
    descricao:
      "Para quem tem reconhecimento extraordinário na sua área — ciência, artes, esportes, negócios, cinema.",
    destaque: {
      tipo: "star",
      texto:
        "Sem sorteio. Sem cap. Mas exige evidências robustas de destaque na sua área.",
    },
    stats: [
      { label: "Trabalho", valor: "Sim (patrocinador)", ok: true },
      { label: "Duração", valor: "3 anos, renovável", ok: true },
      { label: "Sorteio", valor: "Não", ok: true },
      { label: "Viagem ao Brasil", valor: "Sim, com I-797", ok: true },
    ],
    availability: "all",
  },
];

// ─── Business & Investment ─────────────────────────────────────────────────

const vistosNegocios: Visto[] = [
  {
    id: "e2",
    codigo: "E-2",
    nome: "Investidor por Tratado",
    badge: "Investimento",
    badgeColor: "amber",
    descricao:
      "Para quem investe capital substancial em um negócio nos EUA. Exige que o país de origem tenha tratado de comércio com os EUA.",
    destaque: {
      tipo: "block",
      texto:
        "Não disponível para cidadãos brasileiros. O Brasil não possui tratado de comércio e navegação com os EUA. Disponível para europeus de países tratados (Alemanha, França, Portugal, Espanha e outros).",
    },
    stats: [
      { label: "Investimento", valor: "~$100k mínimo", ok: true },
      { label: "Trabalho", valor: "Sim (no negócio)", ok: true },
      { label: "Sorteio", valor: "Não", ok: true },
      { label: "Caminho para GC", valor: "Não direto", ok: false },
    ],
    availability: "treaty-only",
  },
  {
    id: "e1",
    codigo: "E-1",
    nome: "Comerciante por Tratado",
    badge: "Comércio",
    badgeColor: "amber",
    descricao:
      "Para quem conduz volume substancial de comércio de bens, serviços ou tecnologia entre os EUA e o país de origem. Também exige tratado.",
    destaque: {
      tipo: "block",
      texto:
        "Não disponível para cidadãos brasileiros. Mesma restrição do E-2 — exige tratado que o Brasil não possui.",
    },
    stats: [
      { label: "Trabalho", valor: "Sim", ok: true },
      { label: "Comércio", valor: ">50% entre os países", ok: true },
      { label: "Sorteio", valor: "Não", ok: true },
      { label: "Caminho para GC", valor: "Não direto", ok: false },
    ],
    availability: "treaty-only",
  },
  {
    id: "b1",
    codigo: "B-1",
    nome: "Visitante de Negócios",
    badge: "Negócios",
    badgeColor: "ink",
    descricao:
      "Para reuniões, contratos, conferências e negociações nos EUA. Não autoriza trabalho remunerado — apenas atividades de negócio.",
    destaque: {
      tipo: "warning",
      texto:
        "Brasileiro precisa solicitar visto na embaixada. Europeus de países do Visa Waiver entram via ESTA, sem precisar de visto — até 90 dias.",
    },
    stats: [
      { label: "Trabalho", valor: "Não permitido", ok: false },
      { label: "Duração", valor: "Até 6 meses", ok: true },
      { label: "Sorteio", valor: "Não", ok: true },
      { label: "Renovação", valor: "Sim", ok: true },
    ],
    availability: "all",
  },
  {
    id: "l1",
    codigo: "L-1",
    nome: "Transferência Intracompanhia",
    badge: "Executivo",
    badgeColor: "pine",
    descricao:
      "Para executivos, gerentes e especialistas transferidos de uma empresa no exterior para uma filial ou subsidiária nos EUA. A empresa precisa existir nos dois países.",
    destaque: {
      tipo: "star",
      texto:
        "Sem sorteio. Caminho natural para o green card EB-1C para executivos e gerentes.",
    },
    stats: [
      { label: "Trabalho", valor: "Sim (empresa)", ok: true },
      { label: "Duração", valor: "3–7 anos", ok: true },
      { label: "Sorteio", valor: "Não", ok: true },
      { label: "Caminho para GC", valor: "Sim (EB-1C)", ok: true },
    ],
    availability: "all",
  },
  {
    id: "eb2niw",
    codigo: "EB-2 NIW",
    nome: "Green Card por Interesse Nacional",
    badge: "Green Card",
    badgeColor: "pine",
    descricao:
      "Green card para profissionais com grau avançado ou habilidade excepcional cujo trabalho beneficia os EUA. Dispensa patrocínio de empregador.",
    destaque: {
      tipo: "warning",
      texto:
        "Brasileiro pode pedir, mas a fila é longa. O Brasil entra na categoria 'Rest of World' — o tempo de espera varia em anos dependendo do momento.",
    },
    stats: [
      { label: "Patrocínio", valor: "Não obrigatório", ok: true },
      { label: "Resultado", valor: "Green card", ok: true },
      { label: "Sorteio", valor: "Não", ok: true },
      { label: "Fila de espera", valor: "Sim — Rest of World", ok: false },
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
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const router = useRouter();

  // Will come from user's onboarding profile.
  // "brazilian" | "treaty" | null
  const nationality: Nationality = null;

  const vistoSelecionado = [...vistosEstudo, ...vistosNegocios].find(
    (v) => v.id === selecionado
  );

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

      {/* Section 1 — Estudo & Intercâmbio */}
      <SectionHeader
        title="Estudo & Intercâmbio"
        subtitle="Vistos para quem vem estudar, pesquisar ou participar de programas de intercâmbio"
      />
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
        {vistosEstudo.map((v) => (
          <VistoCard
            key={v.id}
            visto={v}
            nationality={nationality}
            selecionado={selecionado === v.id}
            onSelect={() => setSelecionado(v.id)}
          />
        ))}
      </div>

      {/* Section 2 — Negócios & Investimento */}
      <SectionHeader
        title="Negócios & Investimento"
        subtitle="Vistos para empreendedores, executivos e investidores — alguns exigem tratado entre países"
      />
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
        {vistosNegocios.map((v) => (
          <VistoCard
            key={v.id}
            visto={v}
            nationality={nationality}
            selecionado={selecionado === v.id}
            onSelect={() => setSelecionado(v.id)}
          />
        ))}
      </div>

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
            <button
              onClick={() => router.push(`/documentos/${selecionado}`)}
              className="w-full bg-pine text-cream rounded-2xl py-4 font-semibold text-base shadow-xl shadow-pine/30 transition-all hover:bg-pine-deep active:scale-[0.98]"
            >
              Seguir este caminho — {vistoSelecionado?.codigo} →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
