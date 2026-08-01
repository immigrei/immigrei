import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import CookieConsent from "./components/CookieConsent";
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
  title: "immigrei — Sua jornada migratória nos EUA, com clareza",
  description:
    "O companheiro completo para sua jornada de imigração nos EUA. Construído por imigrantes, para imigrantes.",
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
