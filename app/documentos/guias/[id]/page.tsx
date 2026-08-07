import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import guias from "../data";
import { VoltarGuiaButton } from "../GuiaNav";

// Public, source-linked editorial content — same treatment as /vistos/[id]:
// no auth() check, no paywall. See proxy.ts (isPublicRoute) and the SEO/GEO
// reasoning there. Never add gated-feature data (Cofre/Custos) to this file.
export function generateStaticParams() {
  return guias.map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const guia = guias.find((g) => g.id === id);
  if (!guia) return {};
  const title = `${guia.titulo} | immigrei`;
  const url = `https://immigrei.app/documentos/guias/${id}`;
  return {
    metadataBase: new URL("https://immigrei.app"),
    title,
    description: guia.resumo,
    alternates: { canonical: `/documentos/guias/${id}` },
    openGraph: {
      title,
      description: guia.resumo,
      url,
      siteName: "immigrei",
      locale: "pt_BR",
      type: "article",
    },
  };
}

export default async function GuiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guia = guias.find((g) => g.id === id);
  if (!guia) notFound();

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guia.titulo,
    description: guia.resumo,
    inLanguage: "pt-BR",
    step: guia.passos.map((texto, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: texto,
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "immigrei", item: "https://immigrei.app/" },
      { "@type": "ListItem", position: 2, name: "Guias de Integração", item: "https://immigrei.app/documentos/guias" },
      { "@type": "ListItem", position: 3, name: guia.titulo, item: `https://immigrei.app/documentos/guias/${id}` },
    ],
  };

  return (
    <main className="min-h-screen bg-cream px-6 py-8 pb-32" style={{ fontFamily: "var(--font-body)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <VoltarGuiaButton />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-pine mb-1" style={{ letterSpacing: "0.12em" }}>
          {guia.categoria} · {guia.tempoLeitura} de leitura
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-ink leading-tight mb-3" style={{ fontFamily: "var(--font-display)" }}>
          {guia.titulo}
        </h1>
        <p className="text-sm text-ink-soft leading-relaxed mb-8">{guia.resumo}</p>

        <section className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-3">Passo a passo</p>
          <ol className="flex flex-col gap-3">
            {guia.passos.map((passo, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pine text-cream text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{passo}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="rounded-xl bg-amber-tint border-l-4 border-amber p-4 mb-6">
          <p className="text-sm text-ink"><strong className="text-amber-deep">Dica:</strong> {guia.dicaChave}</p>
        </div>

        {guia.infoExtra && (
          <div className="rounded-xl border border-pine-tint bg-pine-tint/40 p-4 mb-6">
            <p className="text-sm font-bold text-pine mb-1.5">{guia.infoExtra.titulo}</p>
            <p className="text-sm text-ink-soft leading-relaxed mb-3">{guia.infoExtra.texto}</p>
            <div className="flex flex-wrap gap-1.5">
              {guia.infoExtra.itens.map((item) => (
                <span key={item} className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-pine border border-pine-tint">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        <a
          href={guia.fonteOficial.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-pine hover:underline underline-offset-2"
        >
          Fonte oficial: {guia.fonteOficial.nome} →
        </a>

        <p className="text-xs text-ink-faint mt-8 leading-relaxed border-t border-pine-tint pt-5">
          Regras, taxas e prazos de governo podem mudar a qualquer momento, sem aviso prévio — o que está aqui
          é a informação disponível no momento da última revisão e pode ficar desatualizado. Processos
          administrativos também variam por estado e por status migratório: confirme sempre na fonte oficial
          antes de agir. A Immigrei não se responsabiliza por decisões tomadas com base neste conteúdo; isso
          não substitui aconselhamento jurídico ou financeiro individual.
        </p>

        <div className="mt-10 rounded-2xl bg-pine text-cream p-6 text-center">
          <p className="font-semibold mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Isso é só o começo da sua jornada.
          </p>
          <p className="text-sm text-cream/80 mb-4">
            Crie sua conta grátis e acompanhe seu visto passo a passo, com checklist e cofre de documentos.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-ink hover:bg-amber-deep transition-colors"
          >
            Criar conta grátis →
          </Link>
        </div>
      </div>
    </main>
  );
}
