import type { Metadata } from "next";
import Link from "next/link";
import { todosVistos } from "@/lib/vistosCatalog";
import { hasVistoPage } from "@/lib/vistoPages";
import VistosClient from "./VistosClient";

export const metadata: Metadata = {
  metadataBase: new URL("https://immigrei.app"),
  title: "Vistos americanos explicados em português | immigrei",
  description:
    "Estudo, trabalho, investimento, turismo: o que cada visto americano permite, quem pode e o que fecha cada porta — em português, com fonte oficial.",
  alternates: { canonical: "/vistos" },
};

// The catalog below is a client component (it reads onboarding query params
// after mount), so its cards never reach the raw HTML — crawlers and LLM
// fetchers saw a hub with zero links to /vistos/[id]. This server-rendered
// index is that link list, built from the same catalog.
export default function VistosPage() {
  const comPagina = todosVistos.filter((v) => hasVistoPage(v.id));

  return (
    <>
      <VistosClient />
      <nav aria-label="Índice de vistos" className="bg-cream px-6 pb-32">
        <div className="max-w-2xl mx-auto border-t border-pine-tint pt-6">
          <p
            className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3"
            style={{ letterSpacing: "0.1em" }}
          >
            Todos os vistos, página por página
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {comPagina.map((v) => (
              <li key={v.id}>
                <Link
                  href={`/vistos/${v.id}`}
                  className="text-sm text-pine hover:text-pine-deep underline underline-offset-2"
                >
                  {v.codigo} — {v.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
