"use client";

import Link from "next/link";

/** Entry point to the Cost Calculator, alongside CofreLink. */
export default function CustosLink() {
  return (
    <Link
      href="/documentos/custos"
      className="inline-flex items-center gap-1.5 rounded-full border border-pine-tint bg-cream-2 px-3.5 py-1.5 text-xs font-bold text-pine hover:bg-pine-tint transition-colors whitespace-nowrap"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7v10M14.5 9.5c0-1-.9-1.8-2.5-1.8s-2.5.7-2.5 1.7c0 2.2 5 1 5 3.2 0 1-1 1.7-2.5 1.7s-2.5-.8-2.5-1.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      Calculadora de Custos
    </Link>
  );
}
