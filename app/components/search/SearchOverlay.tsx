"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Mirrors lib/searchIndex.ts's SearchResultType — kept as a local literal
// union instead of importing it, since that module is server-only (reads
// lib/searchEmbeddings.json off disk) and has no business in a client bundle.
type SearchResultType = "visto" | "kit" | "manual" | "atalho" | "guia";

interface SearchHit {
  type: SearchResultType;
  id: string;
  title: string;
  snippet: string;
  href: string;
  locked: boolean;
}

const typeLabel: Record<SearchResultType, string> = {
  visto: "Visto",
  kit: "Kit",
  manual: "Caminho",
  atalho: "Atalho",
  guia: "Guia",
};

function LockIcon() {
  return (
    <svg width="9" height="11" viewBox="0 0 10 12" fill="none" aria-hidden="true">
      <path d="M2 5V3.5C2 1.8 3.3 0.5 5 0.5S8 1.8 8 3.5V5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="5" width="8" height="6" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Full-screen surface — nothing behind it should scroll while it's open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = q.trim();

    // Every setState call lives inside this callback, never directly in
    // the effect body — even the "empty query" case, so clearing state on
    // an empty query doesn't trip the "no synchronous setState in an
    // effect" lint rule.
    debounceRef.current = setTimeout(async () => {
      if (!trimmed) {
        setResults([]);
        setAnswer(null);
        setSearched(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = res.ok ? await res.json() : { answer: null, results: [] };
        setResults(data.results ?? []);
        setAnswer(data.answer ?? null);
      } catch {
        setResults([]);
        setAnswer(null);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, trimmed ? 300 : 0);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q]);

  return (
    <div className="fixed inset-0 z-[55] bg-cream flex flex-col">
      <div className="flex items-center gap-2 px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 border-b border-pine-tint bg-cream-2">
        <input
          type="text"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar vistos, kits e caminhos…"
          className="flex-1 px-4 py-3 rounded-xl border border-pine-tint bg-white text-ink placeholder:text-ink-faint focus:outline-none focus:border-pine"
        />
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full text-ink-soft hover:bg-pine-tint transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!q.trim() && (
          <p className="text-ink-faint text-sm text-center mt-10">
            Busque vistos, kits de protocolo e caminhos.
          </p>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-ink-faint text-sm justify-center mt-10">
            <span className="w-4 h-4 rounded-full border-2 border-pine-tint border-t-pine animate-spin inline-block" />
            Buscando...
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <p className="text-ink-faint text-sm text-center mt-10">
            Nenhum resultado para &ldquo;{q}&rdquo;.
          </p>
        )}

        {!loading && answer && (
          <div className="rounded-2xl bg-pine-tint px-4 py-4 mb-4">
            <p className="text-sm text-ink leading-relaxed">{answer}</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="flex flex-col gap-3">
            {results.map((hit) => (
              <button
                key={`${hit.type}:${hit.id}`}
                onClick={() => { router.push(hit.href); onClose(); }}
                className="w-full text-left rounded-2xl border border-pine-tint bg-cream-2 p-4 hover:border-pine/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">
                    {typeLabel[hit.type]}
                  </span>
                  {hit.locked && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-amber-tint text-amber-deep px-2 py-0.5 rounded-full">
                      <LockIcon /> Assinantes
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-ink">{hit.title}</p>
                <p className="text-xs text-ink-soft leading-relaxed line-clamp-2">{hit.snippet}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
