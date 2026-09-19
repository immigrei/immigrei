import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import CookieConsent from "./components/CookieConsent";
import { SOCIAL_LINKS } from "@/lib/socialLinks";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  // Resolves every relative canonical/OG URL in the app against the real
  // domain (the build otherwise falls back to http://localhost:3000).
  metadataBase: new URL("https://immigrei.app"),
  title: "immigrei — Sua jornada migratória nos EUA, com clareza",
  description:
    "O companheiro completo para sua jornada de imigração nos EUA. Construído por imigrantes, para imigrantes.",
};

// Site-wide Organization + WebSite nodes — declared once here, never per page
// (.claude/skills/seo-geo-agent/SKILL.md §2). Every page's JSON-LD author
// points at this @id, so answer engines tie all our content to one entity
// and its social profiles.
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://immigrei.app/#organization",
      name: "immigrei",
      url: "https://immigrei.app",
      logo: "https://immigrei.app/apple-icon.png",
      description:
        "Companheiro da jornada migratória de brasileiros nos EUA, em português. Construído por imigrantes, para imigrantes.",
      sameAs: SOCIAL_LINKS.map((link) => link.url),
    },
    {
      "@type": "WebSite",
      "@id": "https://immigrei.app/#website",
      name: "immigrei",
      url: "https://immigrei.app",
      inLanguage: "pt-BR",
      publisher: { "@id": "https://immigrei.app/#organization" },
    },
  ],
};

// viewport-fit=cover is required for env(safe-area-inset-*) to resolve to
// a real value on iOS Safari/PWA — without it BottomNav/SearchFab's
// safe-area padding is always 0, even with the CSS in place.
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-BR" className={`${fraunces.variable} ${hankenGrotesk.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-cream text-ink">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
          />
          <a
            href="#conteudo-principal"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-3 focus:left-3 focus:bg-pine focus:text-cream focus:px-4 focus:py-2 focus:rounded-lg"
          >
            Pular para o conteúdo
          </a>
          <div id="conteudo-principal" className="flex-1 flex flex-col">
            {children}
          </div>
          <CookieConsent />
        </body>
      </html>
    </ClerkProvider>
  );
}
