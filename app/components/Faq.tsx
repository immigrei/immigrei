// Native <details>/<summary> accordion + FAQPage JSON-LD, lifted from
// em-breve/page.tsx's pattern (the original precedent for JSON-LD in this
// codebase). No client JS needed — <details> is native HTML.

export interface FaqItem {
  q: string;
  a: React.ReactNode;
  /** Plain-text version for the FAQPage JSON-LD, only needed when `a` isn't a bare string (e.g. it contains a link). */
  aText?: string;
}

export default function Faq({ items }: { items: FaqItem[] }) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: typeof item.a === "string" ? item.a : item.aText ?? "",
      },
    })),
  };

  return (
    <div className="space-y-3">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {items.map((item) => (
        <details
          key={item.q}
          className="group bg-cream-2 border border-pine-tint rounded-xl px-5 py-4"
        >
          <summary className="cursor-pointer list-none flex items-center justify-between gap-4 text-ink font-semibold text-base">
            {item.q}
            <span className="text-pine transition-transform group-open:rotate-45 text-xl leading-none">
              +
            </span>
          </summary>
          <p className="text-ink-soft text-sm leading-relaxed mt-3">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
