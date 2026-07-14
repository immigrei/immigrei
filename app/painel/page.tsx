"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/app/components/AppShell";
import OptionsList from "@/app/components/OptionsList";
import { getAlternativePaths, getVisaSpecificPaths } from "@/lib/strategies";
import { applyProgress, type ProgressSignals } from "@/lib/journey-progress";
import { traduzirStatus } from "@/lib/uscis-status-pt";
import type { UserCase } from "@/app/dashboard/CaseStatusCard";
import { getStrategy, getFamilyTiesCard, type Profile, type Etapa } from "@/lib/strategy";

// ── Component ─────────────────────────────────────────────────────────────────

// Verde é reservado para "feito" — etapa concluída com dado real do usuário.
// "proximo" e "futuro" ficam neutros para não parecerem concluídos.
const estadoStyle: Record<Etapa["estado"], { dot: string; card: string; data: string }> = {
  feito:   { dot: "bg-pine border-pine-deep text-cream",                 card: "border-pine/40 bg-pine-tint/40",      data: "text-pine-deep" },
  agora:   { dot: "bg-amber border-amber-deep text-pine-deep shadow-amber/30 shadow-md", card: "border-amber",  data: "text-amber-deep" },
  proximo: { dot: "bg-cream-2 border-ink-faint text-ink-soft",           card: "border-pine-tint",                    data: "text-ink-soft" },
  futuro:  { dot: "bg-cream-2 border-pine-tint text-ink-faint",          card: "border-pine-tint",                    data: "text-ink-faint" },
  alerta:  { dot: "bg-clay border-clay text-cream",                      card: "border-clay",                         data: "text-clay" },
};

// Última atualização do caso: "hoje às 14:32", "ontem às 09:10" ou "12/07/2026".
function formatUltimaAtualizacao(iso: string): string {
  const d = new Date(iso);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === hoje.toDateString()) return `hoje às ${hora}`;
  if (d.toDateString() === ontem.toDateString()) return `ontem às ${hora}`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function PainelPage() {
  const router  = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cases, setCases] = useState<UserCase[]>([]);
  const [satisfeitos, setSatisfeitos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const d = await fetch("/api/profile").then((r) => r.json());
        const p: Profile | null = d.profile ?? null;
        setProfile(p);

        fetch("/api/uscis/case-status")
          .then((r) => (r.ok ? r.json() : { cases: [] }))
          .then((body) => setCases(Array.isArray(body?.cases) ? body.cases : []))
          .catch(() => setCases([]));

        // Progresso real: itens marcados no checklist do kit + arquivos no cofre.
        const kitId = p ? getStrategy(p).kitId : "";
        if (kitId) {
          const [check, docs] = await Promise.all([
            fetch(`/api/checklist?vistoId=${kitId}`)
              .then((r) => (r.ok ? r.json() : { items: [] }))
              .catch(() => ({ items: [] })),
            fetch(`/api/user-documents?vistoId=${kitId}`)
              .then((r) => (r.ok ? r.json() : { documents: [] }))
              .catch(() => ({ documents: [] })),
          ]);
          setSatisfeitos(new Set<string>([
            ...((check.items ?? []) as string[]),
            ...((docs.documents ?? []) as { documento_id: string }[]).map((a) => a.documento_id),
          ]));
        }
      } catch {
        // perfil indisponível — cai no estado "complete o onboarding"
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <span className="w-6 h-6 rounded-full border-2 border-pine-tint border-t-pine animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-ink-soft mb-4">Complete o onboarding para ver seu painel estratégico.</p>
          <button onClick={() => router.push("/onboarding")} className="bg-pine text-cream px-6 py-3 rounded-xl font-semibold text-sm hover:bg-pine-deep transition-colors">
            Começar agora
          </button>
        </div>
      </AppShell>
    );
  }

  const s = getStrategy(profile);
  const signals: ProgressSignals = { hasSchool: Boolean(profile.chosen_school), satisfeitos };
  const etapas = applyProgress(s.etapas, signals);
  const familyCard = getFamilyTiesCard(profile.family_ties);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-pine mb-1" style={{ letterSpacing: "0.12em" }}>
            Painel estratégico
          </p>
          <h1 className="text-3xl font-semibold text-ink leading-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
            {s.titulo}
          </h1>
          <p className="text-sm text-ink-faint font-medium">{s.subtitulo}</p>
        </div>

        {/* Situação atual */}
        <div className="bg-cream-2 border border-pine-tint rounded-2xl px-5 py-4 mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-2" style={{ letterSpacing: "0.1em" }}>
            Sua situação
          </p>
          <p className="text-sm text-ink leading-relaxed">{s.situacao}</p>
        </div>

        {/* Porta de Green Card por vínculo familiar — vale para qualquer
            jornada principal, não só quem está seguindo o caminho de família */}
        {familyCard && (
          <Link
            href="/profissionais"
            className="block bg-amber-tint border border-amber/40 rounded-2xl px-5 py-4 mb-5 hover:border-amber transition-colors"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-amber-deep mb-1" style={{ letterSpacing: "0.1em" }}>
              Caminho em paralelo
            </p>
            <p className="text-sm font-semibold text-ink mb-1">{familyCard.titulo}</p>
            <p className="text-xs text-ink-soft leading-relaxed mb-2">{familyCard.texto}</p>
            <span className="text-xs font-bold text-pine">Falar com um profissional verificado →</span>
          </Link>
        )}

        {/* Meu caso no USCIS — alimentado pela última busca feita no início */}
        {cases.length > 0 && (
          <Link
            href="/dashboard"
            className="block bg-cream-2 border border-pine-tint rounded-2xl px-5 py-4 mb-5 hover:border-pine transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-faint" style={{ letterSpacing: "0.1em" }}>
                Meu caso no USCIS
              </p>
              <span className="text-xs font-bold text-pine">Ver detalhes →</span>
            </div>
            {cases.slice(0, 1).map((c) => (
              <div key={c.id}>
                <p className="text-sm font-semibold text-ink">{c.label || c.receipt_number}</p>
                <p className="text-xs text-ink-soft mt-0.5">
                  {c.last_status ? traduzirStatus(c.last_status).titulo : "Ainda não verificado"}
                </p>
                {c.last_checked_at && (
                  <p className="text-[11px] text-ink-faint mt-1.5">
                    Sua última atualização: {formatUltimaAtualizacao(c.last_checked_at)}
                  </p>
                )}
              </div>
            ))}
          </Link>
        )}

        {/* Destaque (alerta ou ok) */}
        {s.destaque && (
          <div className={[
            "rounded-2xl px-5 py-4 mb-6 border",
            s.destaque.tipo === "alerta"
              ? "bg-amber-tint border-amber/40"
              : "bg-pine-tint border-pine/30",
          ].join(" ")}>
            <p className={`text-sm font-semibold leading-relaxed ${s.destaque.tipo === "alerta" ? "text-amber-deep" : "text-pine-deep"}`}>
              {s.destaque.tipo === "alerta" ? "⚠ " : "✓ "}{s.destaque.texto}
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-4" style={{ letterSpacing: "0.1em" }}>
            Sua jornada
          </p>
          <div className="relative">
            {/* linha vertical */}
            <div className="absolute left-4 top-5 bottom-5 w-px bg-pine-tint" />

            <div className="flex flex-col gap-4">
              {etapas.map((etapa, i) => {
                const st = estadoStyle[etapa.estado];
                const escola = etapa.href === "/escolas" ? profile.chosen_school : null;
                const cardContent = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-ink leading-snug">{etapa.titulo}</p>
                      {etapa.tag && (
                        <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-ink/10 text-ink-soft">
                          {etapa.tag}
                        </span>
                      )}
                    </div>
                    {escola ? (
                      <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                        <span className="font-bold text-pine">✓ {escola.school_name}</span>
                        {" — "}{escola.city}, {escola.state}. Toque para trocar de escola.
                      </p>
                    ) : (
                      <p className="text-xs text-ink-soft mt-1 leading-relaxed">{etapa.desc}</p>
                    )}
                    {etapa.href && !escola && (
                      <p className="text-xs font-bold text-pine mt-1.5">
                        Buscar escolas certificadas →
                      </p>
                    )}
                    {etapa.linkExterno && (
                      <a
                        href={etapa.linkExterno.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-block text-xs font-bold text-pine mt-1.5 underline underline-offset-2"
                      >
                        {etapa.linkExterno.label} ↗
                      </a>
                    )}
                  </>
                );
                return (
                  <div key={i} className="flex gap-4 relative">
                    {/* dot */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-[11px] font-bold z-10 ${st.dot}`}>
                      {etapa.estado === "feito" ? "✓" : etapa.num}
                    </div>
                    {/* card */}
                    {etapa.href ? (
                      <Link
                        href={etapa.href}
                        className={`flex-1 rounded-2xl border bg-cream-2 px-4 py-3 mb-0.5 hover:border-pine hover:shadow-sm transition-all ${st.card}`}
                      >
                        {cardContent}
                      </Link>
                    ) : (
                      <div className={`flex-1 rounded-2xl border bg-cream-2 px-4 py-3 mb-0.5 ${st.card}`}>
                        {cardContent}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Guard-rails */}
        {s.guardrails.length > 0 && (
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3" style={{ letterSpacing: "0.1em" }}>
              Atenção — não pise na linha
            </p>
            <div className="flex flex-col gap-2">
              {s.guardrails.map((g, i) => (
                <div
                  key={i}
                  className={`flex gap-3 rounded-2xl px-4 py-3 border ${
                    g.tipo === "proibido"
                      ? "bg-clay/5 border-clay/30"
                      : "bg-amber-tint border-amber/30"
                  }`}
                >
                  <span className={`flex-shrink-0 font-bold text-sm ${g.tipo === "proibido" ? "text-clay" : "text-amber-deep"}`}>
                    {g.tipo === "proibido" ? "✕" : "!"}
                  </span>
                  <p className={`text-xs leading-relaxed ${g.tipo === "proibido" ? "text-clay" : "text-amber-deep"}`}>
                    {g.texto}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outros caminhos possíveis */}
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-1" style={{ letterSpacing: "0.1em" }}>
            Outros caminhos possíveis
          </p>
          <p className="text-xs text-ink-soft leading-relaxed mb-2">
            Sua jornada atual não é a única porta. Estas rotas existem em paralelo — algumas podem
            ser mais rápidas ou mais seguras dependendo da sua vida hoje.
          </p>
          <div className="bg-cream-2 rounded-2xl border border-pine-tint overflow-hidden">
            <OptionsList
              options={[
                ...getVisaSpecificPaths(profile.visa_type),
                ...getAlternativePaths({ location: profile.location }),
              ]}
            />
          </div>
        </div>

        {/* CTA — kit */}
        <div className="bg-pine rounded-2xl px-5 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-pine-tint mb-1" style={{ letterSpacing: "0.1em" }}>
              Próximo passo
            </p>
            <p className="text-sm font-semibold text-cream">{s.kitLabel}</p>
            <p className="text-xs text-pine-tint mt-0.5">{s.ctaDesc ?? "Guia completo passo a passo em português"}</p>
          </div>
          <button
            onClick={() => router.push(s.ctaHref ?? `/documentos/${s.kitId}`)}
            className="flex-shrink-0 bg-amber text-pine-deep font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-amber-deep transition-colors"
          >
            {s.ctaHref ? "Abrir →" : "Ver kit →"}
          </button>
        </div>

        <p className="text-xs text-ink-faint mt-8 leading-relaxed">
          Este painel é baseado nas informações do seu perfil e em dados públicos da USCIS. Não é aconselhamento jurídico. Para situações complexas, consulte um immigration attorney.
        </p>
      </div>
    </AppShell>
  );
}
