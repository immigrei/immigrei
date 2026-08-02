"use client";

import { useState } from "react";
import SearchOverlay from "./search/SearchOverlay";

// Floating search trigger, mounted once in AppShell so it appears on every
// authenticated route. Renders either the button or the overlay, never
// both — removes any need to reason about FAB-vs-overlay stacking.
export default function SearchFab() {
  const [open, setOpen] = useState(false);

  if (open) return <SearchOverlay onClose={() => setOpen(false)} />;

  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="Buscar"
      className="fixed right-5 z-[51] flex h-14 w-14 items-center justify-center rounded-full bg-pine text-cream shadow-lg ring-2 ring-cream hover:bg-pine-deep transition-colors"
      style={{ bottom: "calc(4.75rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}
