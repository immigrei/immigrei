import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import AppShell from "@/app/components/AppShell";
import { getManual, MANUAIS, type ManualPrazo } from "@/lib/manuais";
import { getUserPlan } from "@/lib/plan";

/**
 * Path manual page — the full step-by-step guide for a visa path.
 * One URL per path (/caminhos/{slug}); content comes from lib/manuais.ts,
 * which traces back to content/leis. Same skeleton for every visa.
 *
 * Gated: requires login and an active paid subscription (any plan — kits
 * and manuals are subscription features, not separate one-off purchases).
 * Signed-out visitors are sent to sign in; signed-in free-plan users see a
 * teaser (header + first paragraph) with a CTA to /planos.
 */

export function generateStaticParams() {
  return Object.keys(MANUAIS).map((slug) => ({ slug }));
}

const PRAZO_STYLES: Record<ManualPrazo["tone"], string> = {
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

export default async function CaminhoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const manual = getManual(slug);
  if (!manual) notFound();

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const plan = await getUserPlan(userId);
  const hasAccess = plan !== "free";

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-pine-tint text-pine mb-3">
          {manual.badge}
        </span>
        <h1
          className="text-3xl font-semibold text-ink leading-tight mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {manual.titulo}
        </h1>
        <p className="text-sm text-ink-soft leading-relaxed mb-8">{manual.subtitulo}</p>

        {!hasAccess ? (
          <>
            <section className="mb-8">
              <SectionLabel>O que é este caminho</SectionLabel>
              <p className="text-sm text-ink leading-relaxed">{manual.oQueE[0]}</p>
            </section>
            <div className="bg-pine rounded-2xl px-5 py-5 mb-6">
              <p
                className="text-xs font-bold uppercase tracking-widest text-pine-tint mb-1"
                style={{ letterSpacing: "0.1em" }}
              >
                Continue sua jornada
              </p>
              <p className="text-sm font-semibold text-cream">
                O guia completo — quem pode, quem não pode, prazos e o passo a passo — é exclusivo para assinantes.
              </p>
              <Link
                href="/planos"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-ink hover:bg-amber-deep transition-colors"
              >
                Assinar para desbloquear →
              </Link>
            </div>
          </>
        ) : (
        <>
        {/* O que é este caminho */}
        <section className="mb-8">
          <SectionLabel>O que é este caminho</SectionLabel>
          <div className="space-y-3">
            {manual.oQueE.map((p) => (
              <p key={p.slice(0, 40)} className="text-sm text-ink leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </section>

        {/* Quem pode */}
        <section className="mb-8">
          <SectionLabel>Quem pode seguir por aqui</SectionLabel>
          <ul className="space-y-2">
            {manual.quemPode.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-ink-soft leading-relaxed">
                <span aria-hidden className="text-pine mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Quem NÃO pode — the section that makes the product honest */}
        <section className="mb-8">
          <SectionLabel>Quem não pode — e por quê</SectionLabel>
          <div className="space-y-3">
            {manual.quemNaoPode.map((b) => (
              <div key={b.titulo} className="rounded-2xl border border-clay/30 bg-cream-2 px-5 py-4">
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
        <section className="mb-8">
          <SectionLabel>Prazos e riscos que definem tudo</SectionLabel>
          <div className="space-y-2">
            {manual.prazos.map((p) => (
              <div key={p.titulo} className={`rounded-xl border px-4 py-3 ${PRAZO_STYLES[p.tone]}`}>
                <p className="text-xs font-bold text-ink">{p.titulo}</p>
                <p className="text-xs text-ink-soft leading-relaxed mt-1">{p.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Como funciona, em resumo */}
        <section className="mb-8">
          <SectionLabel>Como funciona, em resumo</SectionLabel>
          <ol className="space-y-0">
            {manual.passos.map((passo, i) => {
              const isLast = i === manual.passos.length - 1;
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

        {/* Kit CTA */}
        <div className="bg-pine rounded-2xl px-5 py-5 mb-6">
          <p
            className="text-xs font-bold uppercase tracking-widest text-pine-tint mb-1"
            style={{ letterSpacing: "0.1em" }}
          >
            Pronto para dar o próximo passo?
          </p>
          <p className="text-sm font-semibold text-cream">{manual.kit.label}</p>
          <p className="text-xs text-pine-tint mt-1 leading-relaxed">
            Checklist completo de documentos, ordem certa de cada etapa e os detalhes que este
            manual resume — tudo em português.
          </p>
          <Link
            href={`/documentos/${manual.kit.kitId}`}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-ink hover:bg-amber-deep transition-colors"
          >
            Ver o kit →
          </Link>
        </div>

        {/* Fontes oficiais */}
        <section className="mb-6">
          <SectionLabel>Fontes oficiais</SectionLabel>
          <ul className="space-y-1.5">
            {manual.fontesOficiais.map((f) => (
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
        </section>
        </>
        )}

        {/* Disclaimer */}
        <div className="rounded-xl border border-pine-tint bg-cream-2 px-4 py-3">
          <p className="text-[11px] text-ink-faint leading-relaxed">
            Este manual é educacional e baseado em fontes oficiais do governo americano — não é
            aconselhamento jurídico e não substitui um profissional licenciado. Cada caso tem
            detalhes próprios: antes de decisões irreversíveis (como sair dos EUA), converse com um{" "}
            <Link href="/profissionais" className="text-pine underline underline-offset-2">
              profissional verificado
            </Link>
            .
          </p>
        </div>
      </div>
    </AppShell>
  );
}
