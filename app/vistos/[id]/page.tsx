import Link from "next/link";
import { notFound } from "next/navigation";
import VistoCatalogDetails from "@/app/components/VistoCatalogDetails";
import { todosVistos } from "@/lib/vistosCatalog";
import { getVistoPage, VISTO_PAGES, type VistoPrazo } from "@/lib/vistoPages";
import ConfirmBar, { VoltarButton } from "./ConfirmBar";

/**
 * Dedicated visa page — where "Quero seguir esse caminho" lands. The full
 * educational layer for ONE visa: hero + decision blocks straight from the
 * catalog (single source of truth), then the deep content from
 * lib/vistoPages.ts (traced to content/leis). The sticky bar confirms the
 * choice with the same save flow as the /vistos grid.
 */

export function generateStaticParams() {
  return Object.keys(VISTO_PAGES).map((id) => ({ id }));
}

const badgeStyles: Record<string, string> = {
  pine: "bg-pine-tint text-pine",
  amber: "bg-amber-tint text-amber-deep",
  ink: "bg-ink/10 text-ink-soft",
  clay: "bg-clay/10 text-clay",
};

const PRAZO_STYLES: Record<VistoPrazo["tone"], string> = {
  clay: "border-clay/30 bg-clay/5",
  amber: "border-amber/40 bg-amber-tint",
  pine: "border-pine-tint bg-pine-tint/50",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3"
      style={{ letterSpacing: "0.1em" }}
    >
      {children}
    </p>
  );
}

// Extracted (rather than inlined below) so it can be unit-rendered without
// pulling in the client-only siblings (ConfirmBar/VoltarButton use
// next/navigation's useRouter, which needs a live App Router context).
export function FontesOficiaisSection({
  fontesOficiais,
  verificadoEm,
}: {
  fontesOficiais: { label: string; url: string }[];
  verificadoEm: string;
}) {
  return (
    <section className="mb-6">
      <SectionLabel>Fontes oficiais</SectionLabel>
      <ul className="space-y-1.5">
        {fontesOficiais.map((f) => (
          <li key={f.url}>
            <a
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-pine underline underline-offset-2"
            >
              {f.label} ↗
            </a>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-ink-faint mt-2">
        Conteúdo verificado contra as fontes oficiais em {verificadoEm}.
      </p>
    </section>
  );
}

export default async function VistoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = getVistoPage(id);
  const visto = todosVistos.find((v) => v.id === id);
  if (!page || !visto) notFound();

  return (
    <main
      className="min-h-screen bg-cream px-6 py-8 pb-32"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <div className="mb-6">
          <VoltarButton />
        </div>

        {/* Hero */}
        <span
          className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 ${badgeStyles[visto.badgeColor]}`}
        >
          {visto.badge}
        </span>
        <p className="text-xs text-ink-faint font-bold uppercase tracking-wider mb-1">
          {visto.codigo}
        </p>
        <h1
          className="text-3xl md:text-4xl font-semibold text-ink leading-tight mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {visto.nome}
        </h1>
        <p className="text-sm text-ink-soft leading-relaxed mb-8">{page.tagline}</p>

        {/* Resumo de decisão — os mesmos blocos do card do catálogo */}
        <section className="mb-10">
          <SectionLabel>Resumo de decisão</SectionLabel>
          <div className="flex flex-col gap-3">
            <VistoCatalogDetails visto={visto} showRumoGc={false} />
          </div>
        </section>

        {/* O que é */}
        <section className="mb-10">
          <SectionLabel>O que é este visto</SectionLabel>
          <div className="space-y-3">
            {page.oQueE.map((p) => (
              <p key={p.slice(0, 40)} className="text-sm text-ink leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </section>

        {/* Quem pode */}
        <section className="mb-10">
          <SectionLabel>Quem pode seguir por aqui</SectionLabel>
          <ul className="space-y-2">
            {page.quemPode.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-ink-soft leading-relaxed">
                <span aria-hidden className="text-pine mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Quem não pode — the section that keeps the product honest */}
        <section className="mb-10">
          <SectionLabel>O que fecha esta porta — e por quê</SectionLabel>
          <div className="space-y-3">
            {page.bloqueios.map((b) => (
              <div
                key={b.titulo}
                className="rounded-2xl border border-clay/30 bg-cream-2 px-5 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{b.titulo}</p>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-clay/10 text-clay">
                    {b.base}
                  </span>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed mt-1.5">{b.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Prazos e riscos */}
        <section className="mb-10">
          <SectionLabel>Prazos e regras que definem tudo</SectionLabel>
          <div className="space-y-2">
            {page.prazos.map((p) => (
              <div key={p.titulo} className={`rounded-xl border px-4 py-3 ${PRAZO_STYLES[p.tone]}`}>
                <p className="text-xs font-bold text-ink">{p.titulo}</p>
                <p className="text-xs text-ink-soft leading-relaxed mt-1">{p.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Como funciona */}
        <section className="mb-10">
          <SectionLabel>Como funciona, em resumo</SectionLabel>
          <ol className="space-y-0">
            {page.passos.map((passo, i) => {
              const isLast = i === page.passos.length - 1;
              return (
                <li key={passo.titulo} className="relative flex gap-4">
                  {!isLast && (
                    <span
                      aria-hidden
                      className="absolute left-[13px] top-8 bottom-0 w-0.5 bg-pine-tint"
                    />
                  )}
                  <span className="relative z-10 mt-0.5 flex h-7 w-7 min-w-7 items-center justify-center rounded-full bg-pine text-cream text-xs font-bold">
                    {i + 1}
                  </span>
                  <div className={isLast ? "pb-1" : "pb-5"}>
                    <p className="text-sm font-semibold text-ink">{passo.titulo}</p>
                    <p className="text-xs text-ink-soft leading-relaxed mt-1">{passo.texto}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Pontes — manuais e rotas conectadas */}
        {page.pontes.length > 0 && (
          <section className="mb-10">
            <SectionLabel>Para onde este caminho leva</SectionLabel>
            <ul className="space-y-2">
              {page.pontes.map((ponte) => (
                <li key={ponte.href}>
                  <Link
                    href={ponte.href}
                    className="text-sm font-bold text-pine hover:text-pine-deep underline underline-offset-4 transition-colors"
                  >
                    🧭 {ponte.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Kit CTA */}
        <div className="bg-pine rounded-2xl px-5 py-5 mb-8">
          <p
            className="text-xs font-bold uppercase tracking-widest text-pine-tint mb-1"
            style={{ letterSpacing: "0.1em" }}
          >
            Pronto para os documentos?
          </p>
          <p className="text-sm font-semibold text-cream">{page.kit.label}</p>
          <p className="text-xs text-pine-tint mt-1 leading-relaxed">
            A lista completa do que preparar, agência por agência, com a ordem certa de cada
            etapa — tudo em português.
          </p>
          <Link
            href={`/documentos/${page.kit.kitId}`}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-ink hover:bg-amber-deep transition-colors"
          >
            Ver o checklist →
          </Link>
        </div>

        <FontesOficiaisSection
          fontesOficiais={page.fontesOficiais}
          verificadoEm={page.verificadoEm}
        />

        {/* Disclaimer */}
        <div className="rounded-xl border border-pine-tint bg-cream-2 px-4 py-3">
          <p className="text-[11px] text-ink-faint leading-relaxed">
            Esta página é educacional e baseada em fontes oficiais do governo americano — não é
            aconselhamento jurídico e não substitui um profissional licenciado. Cada caso tem
            detalhes próprios: antes de decisões irreversíveis, converse com um{" "}
            <Link href="/profissionais" className="text-pine underline underline-offset-2">
              profissional verificado
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Sticky confirm — same save flow as the /vistos grid */}
      <ConfirmBar vistoId={visto.id} codigo={visto.codigo} nome={visto.nome} />
    </main>
  );
}
