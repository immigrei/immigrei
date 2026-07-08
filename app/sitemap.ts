import type { MetadataRoute } from "next";

// Pre-launch sitemap: only the public pages behind the immigrei.com gate.
// Add content routes here as they open up (radar, kits, etc.).
export default function sitemap(): MetadataRoute.Sitemap {
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
  ];
}
