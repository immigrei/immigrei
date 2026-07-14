"use client";

import Link from "next/link";
import type { Visto } from "@/lib/vistosCatalog";

/**
 * Decision blocks of a catalog visa card — 🔑 chave, 🌱 degrau, destaque,
 * stats grid and the "rumo ao Green Card" link. Shared by the /vistos grid
 * and the onboarding results so the two surfaces never diverge.
 *
 * Renders a fragment: the parent controls spacing (flex-col + gap) and font.
 */
export default function VistoCatalogDetails({
  visto,
  showRumoGc = true,
}: {
  visto: Visto;
  showRumoGc?: boolean;
}) {
  return (
    <>
      {/* O que destrava */}
      <div className="bg-pine-tint/60 rounded-xl px-4 py-3">
        <p className="text-pine text-xs font-bold uppercase tracking-wider mb-1">🔑 O que destrava este caminho</p>
        <p className="text-ink text-sm leading-relaxed">{visto.chave}</p>
      </div>

      {/* Degrau para quem não está pronto */}
      <div className="bg-cream rounded-xl px-4 py-3">
        <p className="text-ink-faint text-xs font-bold uppercase tracking-wider mb-1">🌱 Ainda não está pronto?</p>
        <p className="text-ink-soft text-sm leading-relaxed">{visto.degrau}</p>
      </div>

      {visto.destaque && (
        <div
          className={[
            "rounded-xl px-4 py-3 text-sm leading-relaxed flex gap-2.5 items-start",
            visto.destaque.tipo === "block"
              ? "bg-clay/10 text-clay"
              : visto.destaque.tipo === "warning"
                ? "bg-amber-tint text-amber-deep"
                : "bg-pine-tint text-pine",
          ].join(" ")}
        >
          <span className="mt-0.5 flex-shrink-0">
            {visto.destaque.tipo === "block" ? "🚫" : visto.destaque.tipo === "warning" ? "⚠️" : "✦"}
          </span>
          <span>{visto.destaque.texto}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {visto.stats.map((stat) => (
          <div key={stat.label} className="bg-cream rounded-xl px-3 py-2.5">
            <p className="text-ink-faint text-xs font-bold uppercase tracking-wider mb-0.5">
              {stat.label}
            </p>
            <p className={`text-sm font-medium ${stat.ok ? "text-ink" : "text-clay"}`}>
              {stat.valor}
            </p>
          </div>
        ))}
      </div>

      {/* Ponte rumo ao Green Card — link direto para o passo a passo */}
      {showRumoGc && visto.rumoGc && (
        <Link
          href={visto.rumoGc.href}
          onClick={(e) => e.stopPropagation()}
          className="text-sm font-bold text-pine hover:text-pine-deep underline underline-offset-4 transition-colors"
        >
          🧭 {visto.rumoGc.label} →
        </Link>
      )}
    </>
  );
}
