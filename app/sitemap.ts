import type { MetadataRoute } from "next";
import { VISTO_PAGES } from "@/lib/vistoPages";
import guias from "@/app/documentos/guias/data";
import { getExplainerPages, getExplainersBySection } from "@/lib/contentPages";

// Pre-launch sitemap: the public pages behind the immigrei.app gate, plus
// catalog-driven routes generated from their source of truth (never
// hand-list a whole catalog — see .claude/skills/seo-geo-agent/SKILL.md).
// Add more hand-listed content routes here as they open up (radar, kits, etc.).
export default function sitemap(): MetadataRoute.Sitemap {
  const vistoEntries: MetadataRoute.Sitemap = Object.keys(VISTO_PAGES).map((id) => ({
    url: `https://immigrei.app/vistos/${id}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const guiaEntries: MetadataRoute.Sitemap = guias.map((g) => ({
    url: `https://immigrei.app/documentos/guias/${g.id}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Reviewed explainers only (lib/contentPages.ts gates on César's approval),
  // plus each section hub once it has at least one page.
  const explainers = getExplainerPages();
  const explainerEntries: MetadataRoute.Sitemap = explainers.map((p) => ({
    url: p.url,
    lastModified: p.verificadoEm,
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  const hubEntries: MetadataRoute.Sitemap = (["/status", "/entenda"] as const)
    .filter((section) => getExplainersBySection(section).length > 0)
    .map((section) => ({
      url: `https://immigrei.app${section}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [
    {
      url: "https://immigrei.app",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://immigrei.app/nossa-historia",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: "https://immigrei.app/termos", changeFrequency: "yearly", priority: 0.3 },
    { url: "https://immigrei.app/privacidade", changeFrequency: "yearly", priority: 0.3 },
    {
      url: "https://immigrei.app/documentos/guias",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...hubEntries,
    ...explainerEntries,
    ...vistoEntries,
    ...guiaEntries,
  ];
}
