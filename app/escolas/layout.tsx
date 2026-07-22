import type { Metadata } from "next";

// app/escolas/page.tsx is a client component (search/filter state), so its
// metadata lives here instead — same route segment, no export const metadata
// restriction. See proxy.ts: this route is deliberately public (SEVP data,
// acquisition/SEO surface), unlike most of the app.
export const metadata: Metadata = {
  title: "Escolas certificadas SEVP para visto F-1 e M-1 | immigrei",
  description:
    "Busque entre milhares de escolas e universidades certificadas pelo SEVP nos EUA, aceitas para o visto F-1 (acadêmico) e M-1 (vocacional). Dados oficiais do DHS, atualizados mensalmente.",
};

export default function EscolasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
