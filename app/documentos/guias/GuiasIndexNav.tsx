"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

/**
 * Este índice é público (SEO/GEO) — quem chega logado quer voltar pro
 * Início, quem chega deslogado (busca, link direto) quer a landing page.
 */
export default function GuiasIndexNav() {
  const { isSignedIn } = useUser();

  return (
    <Link
      href={isSignedIn ? "/dashboard" : "/"}
      className="inline-flex items-center gap-1 text-ink-faint hover:text-ink transition-colors text-sm font-medium mb-4"
    >
      ← {isSignedIn ? "Início" : "Voltar"}
    </Link>
  );
}
