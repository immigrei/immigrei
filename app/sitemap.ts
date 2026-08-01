import type { MetadataRoute } from "next";
import { VISTO_PAGES } from "@/lib/vistoPages";

// Pre-launch sitemap: the public pages behind the immigrei.com gate, plus
// catalog-driven routes generated from their source of truth (never
// hand-list a whole catalog — see .claude/skills/seo-geo-agent/SKILL.md).
// Add more hand-listed content routes here as they open up (radar, kits, etc.).
export default function sitemap(): MetadataRoute.Sitemap {
  const vistoEntries: MetadataRoute.Sitemap = Object.keys(VISTO_PAGES).map((id) => ({
    url: `https://immigrei.com/vistos/${id}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    {
      url: "https://immigrei.com",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://immigrei.com/nossa-historia",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: "https://immigrei.com/termos", changeFrequency: "yearly", priority: 0.3 },
    { url: "https://immigrei.com/privacidade", changeFrequency: "yearly", priority: 0.3 },
    ...vistoEntries,
  ];
}
