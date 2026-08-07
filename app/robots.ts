import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // App routes are gated on immigrei.app and shouldn't be crawled on
        // the vercel.app host either.
        disallow: ["/dashboard", "/api/", "/sign-in", "/sign-up", "/perfil"],
      },
    ],
    sitemap: "https://immigrei.app/sitemap.xml",
  };
}
