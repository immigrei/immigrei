import Link from "next/link";
import type { Etapa } from "@/lib/strategy";

/**
 * Vertical timeline of the user's immigration journey.
 * Sourced from lib/strategy's getStrategy(profile) — the same engine behind
 * /painel — so consular (DS-160, entrevista) vs Change-of-Status steps match
 * profile.location instead of a generic per-visa list.
 */
export default function JourneyTimeline({ name, etapas }: { name: string; etapas: Etapa[] }) {
  return (
    <div className="bg-cream-2 rounded-2xl border border-pine-tint overflow-hidden mb-5">
      <div className="px-6 py-4 border-b border-pine-tint flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">
          Sua jornada
        </p>
        <span className="text-xs font-semibold text-pine bg-pine-tint px-2.5 py-1 rounded-full">
          {name}
        </span>
      </div>

      <ol className="px-6 py-5">
        {etapas.map((etapa, i) => {
          const isDone = etapa.estado === "feito";
          const isCurrent = etapa.estado === "agora";
          const isLast = i === etapas.length - 1;

          return (
            <li key={i} className="relative flex gap-4 pb-1">
              {/* Connector line */}
              {!isLast && (
                <span
                  aria-hidden
                  className={`absolute left-[13px] top-7 bottom-0 w-0.5 ${
                    isDone ? "bg-sage" : "bg-pine-tint"
                  }`}
                />
              )}

              {/* Dot */}
              <span
                className={`relative z-10 mt-0.5 flex h-7 w-7 min-w-7 items-center justify-center rounded-full text-xs font-bold ${
                  isDone
                    ? "bg-sage text-white"
                    : isCurrent
                    ? "bg-amber text-ink ring-4 ring-amber-tint"
                    : "bg-cream border-2 border-pine-tint text-ink-faint"
                }`}
              >
                {isDone ? "✓" : etapa.num}
              </span>

              {/* Content */}
              <div className={`pb-5 ${isLast ? "pb-1" : ""}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className={`text-sm font-semibold ${
                      isCurrent ? "text-ink" : isDone ? "text-ink-soft" : "text-ink-soft"
                    }`}
                  >
                    {etapa.titulo}
                  </p>
                  {isCurrent && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-deep bg-amber-tint px-2 py-0.5 rounded-full">
                      Você está aqui
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-soft leading-relaxed mt-1">
                  {etapa.desc}
                </p>
                {etapa.tag && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                    <span className="text-[11px] text-pine bg-pine-tint px-2 py-0.5 rounded-full">
                      {etapa.tag}
                    </span>
                  </div>
                )}
                {etapa.href && (
                  <Link
                    href={etapa.href}
                    className={`inline-block mt-2 text-xs font-bold underline underline-offset-4 transition-colors ${
                      isCurrent
                        ? "text-amber-deep hover:text-ink"
                        : "text-pine hover:text-pine-deep"
                    }`}
                  >
                    🧭 Continuar →
                  </Link>
                )}
                {etapa.linkExterno && (
                  <a
                    href={etapa.linkExterno.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-block mt-2 text-xs font-bold underline underline-offset-4 transition-colors ${
                      isCurrent
                        ? "text-amber-deep hover:text-ink"
                        : "text-pine hover:text-pine-deep"
                    }`}
                  >
                    {etapa.linkExterno.label} ↗
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
