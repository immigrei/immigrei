import { StrategyOption, StrategyTone } from "@/lib/strategies";

/**
 * Shared vertical-line renderer for strategy options — used by the
 * denied-case card (dashboard) and the alternative-paths section (painel).
 * Pure presentational: safe in both server and client components.
 */

const TONE_STYLES: Record<
  StrategyTone,
  { badge: string; dot: string; border: string }
> = {
  clay: {
    badge: "bg-clay/10 text-clay",
    dot: "bg-clay text-white",
    border: "border-clay/30",
  },
  amber: {
    badge: "bg-amber-tint text-amber-deep",
    dot: "bg-amber text-ink",
    border: "border-amber/40",
  },
  pine: {
    badge: "bg-pine-tint text-pine",
    dot: "bg-pine text-white",
    border: "border-pine-tint",
  },
};

function formatDatePt(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

function DeadlineChip({ deadline }: { deadline: NonNullable<StrategyOption["deadline"]> }) {
  const expired = deadline.daysLeft < 0;
  return (
    <div
      className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
        expired ? "bg-pine-tint text-ink-soft" : "bg-clay/10 text-clay"
      }`}
    >
      {expired ? (
        <>Prazo do I-290B encerrado em {formatDatePt(deadline.dueDate)}</>
      ) : (
        <>
          ⏳ {deadline.daysLeft} {deadline.daysLeft === 1 ? "dia restante" : "dias restantes"} — até{" "}
          {formatDatePt(deadline.dueDate)}
        </>
      )}
    </div>
  );
}

export default function OptionsList({ options }: { options: StrategyOption[] }) {
  return (
    <ol className="px-6 py-5">
      {options.map((opt, i) => {
        const tone = TONE_STYLES[opt.tone];
        const isLast = i === options.length - 1;
        const blocked = opt.availability === "bloqueado";

        return (
          <li key={opt.id} className="relative flex gap-4">
            {!isLast && (
              <span
                aria-hidden
                className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-pine-tint"
              />
            )}

            <span
              className={`relative z-10 mt-0.5 flex h-7 w-7 min-w-7 items-center justify-center rounded-full text-sm ${
                blocked ? "bg-cream border border-clay/40" : tone.dot
              }`}
            >
              {opt.icon}
            </span>

            <div className={`min-w-0 ${isLast ? "pb-1" : "pb-6"}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${tone.badge}`}
                >
                  {opt.badge}
                </span>
                <p className="text-sm font-semibold text-ink">{opt.title}</p>
              </div>

              <p className="text-xs text-ink-soft leading-relaxed mt-1.5">{opt.description}</p>

              {/* Blocked path: show the WHY (with legal basis) and the door that IS open */}
              {blocked && opt.blockedReason && (
                <div className="mt-3 rounded-xl border border-clay/30 bg-clay/5 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-clay mb-1">
                    Por que esta porta está fechada
                  </p>
                  <p className="text-xs text-ink-soft leading-relaxed">{opt.blockedReason}</p>
                  {opt.alternative && (
                    <a
                      href={`/caminhos/${opt.alternative.manualSlug}`}
                      className="mt-2 inline-block text-xs font-bold text-pine underline underline-offset-2"
                    >
                      Mas existe outra porta: {opt.alternative.label} →
                    </a>
                  )}
                </div>
              )}

              {opt.deadline && <DeadlineChip deadline={opt.deadline} />}

              {opt.paths && (
                <div className="mt-3 space-y-2">
                  {opt.paths.map((path) => (
                    <div
                      key={path.title}
                      className={`rounded-xl border bg-cream px-4 py-3 ${tone.border}`}
                    >
                      <p className="text-xs font-bold text-ink">{path.title}</p>
                      <p className="text-xs text-ink-soft leading-relaxed mt-1">
                        {path.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {opt.does && (
                <ul className="mt-2 space-y-1">
                  {opt.does.map((item) => (
                    <li key={item} className="text-xs text-pine flex gap-1.5">
                      <span aria-hidden>✓</span>
                      <span className="text-ink-soft">{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {opt.doesNot && (
                <ul className="mt-2 space-y-1">
                  {opt.doesNot.map((item) => (
                    <li key={item} className="text-xs text-clay flex gap-1.5">
                      <span aria-hidden>✕</span>
                      <span className="text-ink-soft">{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Manual first, kit second: read everything free, then decide */}
              {!blocked && opt.manualSlug && (
                <a
                  href={`/caminhos/${opt.manualSlug}`}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-pine bg-cream px-3 py-1.5 text-xs font-bold text-pine hover:bg-pine-tint transition-colors"
                >
                  Quero seguir este caminho →
                </a>
              )}

              {opt.kits && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {opt.kits.map((kit) =>
                    kit.status === "disponivel" && kit.kitId ? (
                      <a
                        key={kit.label}
                        href={`/documentos/${kit.kitId}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-pine px-3 py-1.5 text-xs font-bold text-cream hover:bg-pine-deep transition-colors"
                      >
                        📦 {kit.label} →
                      </a>
                    ) : (
                      <span
                        key={kit.label}
                        className="inline-flex items-center gap-1.5 rounded-full border border-pine-tint bg-cream px-3 py-1.5 text-xs font-semibold text-ink-faint"
                      >
                        📦 {kit.label} · em breve
                      </span>
                    )
                  )}
                </div>
              )}

              {opt.link && (
                <a
                  href={opt.link.href}
                  className="inline-block mt-2 text-xs font-bold text-pine underline underline-offset-2"
                >
                  {opt.link.label}
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
