import type { Metadata } from "next";
import Link from "next/link";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Faq from "./Faq";
import Footer from "./Footer";
import { FontesOficiaisSection } from "./FontesOficiais";
import Logo from "./Logo";
import { SITE_URL, type ExplainerPage } from "@/lib/contentPages";

/**
 * Shared layout for the public explainer pages (/status/[slug],
 * /entenda/[slug]) — rendered from a reviewed draft in
 * content/marketing/drafts/ (see lib/contentPages.ts). Server-only: the whole
 * article, FAQ and JSON-LD are in the raw HTML, which is what search and
 * LLM crawlers read (they don't run client JS).
 */

export type ExplainerSectionInfo = { path: "/status" | "/entenda"; label: string };

export const STATUS_SECTION: ExplainerSectionInfo = {
  path: "/status",
  label: "Status do USCIS",
};
export const ENTENDA_SECTION: ExplainerSectionInfo = {
  path: "/entenda",
  label: "Entenda o processo",
};

const ORGANIZATION_REF = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "immigrei",
};

export function explainerMetadata(page: ExplainerPage): Metadata {
  const title = `${page.title} | immigrei`;
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      title,
      description: page.description,
      url: page.url,
      siteName: "immigrei",
      locale: "pt_BR",
      type: "article",
    },
  };
}

function isInternal(href: string) {
  return href.startsWith("/") || href.startsWith(SITE_URL);
}

const bodyComponents: Components = {
  h2: ({ children }) => (
    <h2
      className="text-2xl font-medium text-ink leading-snug mt-10 mb-3"
      style={{ fontFamily: "var(--font-display)" }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-bold text-ink leading-snug mt-8 mb-2">{children}</h3>
  ),
  p: ({ children }) => <p className="text-base text-ink leading-relaxed mb-4">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 space-y-2 mb-4">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-2 mb-4">{children}</ol>,
  li: ({ children }) => <li className="text-base text-ink leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  a: ({ href = "", children }) =>
    isInternal(href) ? (
      <a href={href} className="text-pine font-semibold underline underline-offset-2">
        {children}
      </a>
    ) : (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-pine underline underline-offset-2"
      >
        {children}
      </a>
    ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-amber pl-4 text-ink-soft mb-4">{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-pine-tint bg-cream-2 px-3 py-2 text-left font-bold text-ink">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-pine-tint px-3 py-2 text-ink-soft align-top">{children}</td>
  ),
  hr: () => <hr className="my-8 border-pine-tint" />,
};

// FAQ answers render inside Faq.tsx's <p>, so paragraphs become block spans
// instead of nesting <p> in <p>.
const faqComponents: Components = {
  ...bodyComponents,
  p: ({ children }) => <span className="block mt-2 first:mt-0">{children}</span>,
};

function sourceLabel(url: string) {
  const { hostname, pathname } = new URL(url);
  return `${hostname.replace(/^www\./, "")}${pathname === "/" ? "" : pathname}`;
}

export default function ExplainerArticle({
  page,
  section,
  related,
}: {
  page: ExplainerPage;
  section: ExplainerSectionInfo;
  related: ExplainerPage[];
}) {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.title,
    description: page.description,
    inLanguage: "pt-BR",
    author: ORGANIZATION_REF,
    publisher: ORGANIZATION_REF,
    datePublished: page.verificadoEm,
    dateModified: page.verificadoEm,
    mainEntityOfPage: page.url,
    ...(page.sources.length > 0 && { citation: page.sources }),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "immigrei", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: section.label, item: `${SITE_URL}${section.path}` },
      { "@type": "ListItem", position: 3, name: page.title, item: page.url },
    ],
  };

  return (
    <main className="min-h-screen bg-cream flex flex-col" style={{ fontFamily: "var(--font-body)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <header className="flex items-center justify-between px-6 py-6 max-w-3xl w-full mx-auto">
        <Link href="/" aria-label="immigrei — início">
          <Logo variant="lockup" className="text-4xl" />
        </Link>
      </header>

      <article className="max-w-2xl w-full mx-auto px-6 pb-16">
        <nav aria-label="Você está em" className="text-xs text-ink-faint mt-4 mb-6">
          <Link href="/" className="hover:text-pine">
            immigrei
          </Link>
          <span aria-hidden> › </span>
          <Link href={section.path} className="hover:text-pine">
            {section.label}
          </Link>
        </nav>

        <p
          className="text-xs font-bold uppercase tracking-widest text-amber-deep mb-3"
          style={{ letterSpacing: "0.1em" }}
        >
          {section.label}
        </p>
        <h1
          className="text-3xl md:text-4xl font-semibold text-ink leading-tight mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {page.title}
        </h1>
        <p className="text-xs text-ink-faint mb-8">
          Equipe immigrei · verificado em {page.verificadoEm}
        </p>

        <Markdown remarkPlugins={[remarkGfm]} components={bodyComponents}>
          {page.body}
        </Markdown>

        {page.faq.length > 0 && (
          <section className="mt-10">
            <h2
              className="text-2xl font-medium text-ink leading-snug mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Perguntas frequentes
            </h2>
            <Faq
              items={page.faq.map((item) => ({
                q: item.q,
                a: (
                  <Markdown remarkPlugins={[remarkGfm]} components={faqComponents}>
                    {item.a}
                  </Markdown>
                ),
                aText: item.aText,
              }))}
            />
          </section>
        )}

        {page.closing && (
          <div className="rounded-2xl bg-pine-tint px-5 pt-5 pb-1 mt-10 mb-10">
            <Markdown remarkPlugins={[remarkGfm]} components={bodyComponents}>
              {page.closing}
            </Markdown>
          </div>
        )}

        {page.sources.length > 0 && (
          <FontesOficiaisSection
            fontesOficiais={page.sources.map((url) => ({ label: sourceLabel(url), url }))}
            verificadoEm={page.verificadoEm}
          />
        )}

        {related.length > 0 && (
          <section className="mt-10">
            <p
              className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3"
              style={{ letterSpacing: "0.1em" }}
            >
              Leia também
            </p>
            <ul className="space-y-2">
              {related.map((p) => (
                <li key={p.path}>
                  <Link
                    href={p.path}
                    className="text-sm font-bold text-pine hover:text-pine-deep underline underline-offset-4"
                  >
                    {p.title} →
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/vistos"
                  className="text-sm font-bold text-pine hover:text-pine-deep underline underline-offset-4"
                >
                  Todos os vistos, explicados em português →
                </Link>
              </li>
            </ul>
          </section>
        )}
      </article>

      <Footer />
    </main>
  );
}

/** Index page for a section (/status, /entenda) — the breadcrumb's middle hop. */
export function ExplainerHub({
  section,
  intro,
  pages,
}: {
  section: ExplainerSectionInfo;
  intro: string;
  pages: ExplainerPage[];
}) {
  return (
    <main className="min-h-screen bg-cream flex flex-col" style={{ fontFamily: "var(--font-body)" }}>
      <header className="flex items-center justify-between px-6 py-6 max-w-3xl w-full mx-auto">
        <Link href="/" aria-label="immigrei — início">
          <Logo variant="lockup" className="text-4xl" />
        </Link>
      </header>
      <section className="max-w-2xl w-full mx-auto px-6 pb-16">
        <h1
          className="text-3xl md:text-4xl font-semibold text-ink leading-tight mt-6 mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {section.label}
        </h1>
        <p className="text-base text-ink-soft leading-relaxed mb-8">{intro}</p>
        <ul className="space-y-3">
          {pages.map((p) => (
            <li key={p.path}>
              <Link
                href={p.path}
                className="block rounded-2xl border border-pine-tint bg-cream-2 px-5 py-4 hover:border-pine transition-colors"
              >
                <span className="block text-base font-semibold text-ink">{p.title}</span>
                <span className="block text-sm text-ink-soft leading-relaxed mt-1">
                  {p.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Footer />
    </main>
  );
}
