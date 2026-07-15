"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VistoCatalogDetails from "@/app/components/VistoCatalogDetails";
import { vistosEstudo, vistosNegocios, type Visto } from "@/lib/vistosCatalog";
import { hasVistoPage } from "@/lib/vistoPages";



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
  detailHref,
}: {
  visto: Visto;
  nationality: Nationality;
  selecionado: boolean;
  onSelect: () => void;
  // Quando o visto tem página dedicada, o CTA navega para ela em vez de
  // selecionar — a confirmação acontece lá (mesmo fluxo de salvamento).
  detailHref?: string;
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

      {/* Blocos de decisão compartilhados com os resultados do onboarding */}
      <VistoCatalogDetails visto={visto} showRumoGc={!locked} />

      {/* CTA */}
      {!locked && detailHref && (
        <Link
          href={detailHref}
          onClick={(e) => e.stopPropagation()}
          className="w-full mt-auto block text-center rounded-xl py-3.5 text-sm font-semibold transition-all duration-150 bg-amber/80 text-ink hover:bg-amber hover:shadow-md hover:shadow-amber/20"
        >
          Quero seguir esse caminho →
        </Link>
      )}
      {!locked && !detailHref && (
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

  // Query repassada às páginas dedicadas — mantém o perfil vindo do
  // onboarding vivo até a confirmação acontecer lá dentro.
  const detailParams = new URLSearchParams();
  if (rawNationality) detailParams.set("nationality", rawNationality);
  if (location) detailParams.set("location", location);
  if (mainGoal) detailParams.set("goal", mainGoal);
  const detailQs = detailParams.toString();
  const detailHrefFor = (id: string) =>
    hasVistoPage(id) ? `/vistos/${id}${detailQs ? `?${detailQs}` : ""}` : undefined;

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
      {/* Back — o onboarding guarda o progresso na sessão e reabre nos resultados */}
      <div className="max-w-5xl mx-auto mb-6">
        <button
          onClick={() => router.push("/onboarding")}
          className="text-ink-faint hover:text-ink transition-colors text-sm font-medium flex items-center gap-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          ← Voltar
        </button>
      </div>

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
                detailHref={detailHrefFor(v.id)}
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
                detailHref={detailHrefFor(v.id)}
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
                detailHref={detailHrefFor(v.id)}
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
