"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Persistent entry point to the Document Vault — shown regardless of which
 * visto the user is looking at, so it never depends on picking a kit first.
 */
export default function CofreLink() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/user-documents")
      .then((r) => (r.ok ? r.json() : { documents: [] }))
      .then((d) => setCount((d.documents ?? []).length))
      .catch(() => {});
  }, []);

  return (
    <Link
      href="/documentos/cofre"
      className="inline-flex items-center gap-1.5 rounded-full border border-pine-tint bg-cream-2 px-3.5 py-1.5 text-xs font-bold text-pine hover:bg-pine-tint transition-colors whitespace-nowrap"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none" />
        <path d="M8 7H12M8 10H14M8 13H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <rect x="10" y="12" width="10" height="10" rx="5" fill="var(--pine)" />
        <path d="M13 17L14.5 18.5L17 16" stroke="var(--cream)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Cofre de Documentos
      {count !== null && count > 0 && (
        <span className="rounded-full bg-pine text-cream text-[10px] font-bold px-1.5 py-0.5 leading-none">
          {count}
        </span>
      )}
    </Link>
  );
}
