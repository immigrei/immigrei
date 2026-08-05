"use client";

import Link from "next/link";

/** Entry point to the US-integration guides (SSN, DMV, credit, health). */
export default function GuiasLink() {
  return (
    <Link
      href="/documentos/guias"
      className="inline-flex items-center gap-1.5 rounded-full border border-pine-tint bg-cream-2 px-3.5 py-1.5 text-xs font-bold text-pine hover:bg-pine-tint transition-colors whitespace-nowrap"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 3.5A1.5 1.5 0 0 1 5.5 2H12l4 4v13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 19.5v-16Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7.5 12h6M7.5 15h6M7.5 9h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      Guias de Integração
    </Link>
  );
}
