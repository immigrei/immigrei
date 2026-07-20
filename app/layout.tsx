import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
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
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
