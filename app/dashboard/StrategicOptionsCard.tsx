import { getDeniedCaseStrategies, StrategyOption, StrategyTone } from "@/lib/strategies";

/**
 * Strategic options shown when a monitored USCIS case is denied.
 * Rendered right below the case status card, in the same vertical-line
 * style as the journey timeline — this is a "branch" of the journey,
 * not a dead end.
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

export default function StrategicOptionsCard({
  label,
  receiptNumber,
  statusDate,
}: {
  label?: string | null;
  receiptNumber: string;
  statusDate?: string | null;
}) {
  const options = getDeniedCaseStrategies(statusDate);

  return (
    <div className="bg-cream-2 rounded-2xl border border-pine-tint overflow-hidden mb-5">
      <div className="px-6 py-4 border-b border-pine-tint">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">
          Seu caso foi negado — e agora?
        </p>
        <p className="text-sm text-ink-soft mt-1 leading-relaxed">
          Sabemos que essa notícia pesa. Uma negativa não é o fim da jornada — é uma bifurcação.
          Estas são as opções que existem para o caso{" "}
          <span className="font-semibold text-ink">{label || receiptNumber}</span>:
        </p>
      </div>

      <ol className="px-6 py-5">
        {options.map((opt, i) => {
          const tone = TONE_STYLES[opt.tone];
          const isLast = i === options.length - 1;

          return (
            <li key={opt.id} className="relative flex gap-4">
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-pine-tint"
                />
              )}

              <span
                className={`relative z-10 mt-0.5 flex h-7 w-7 min-w-7 items-center justify-center rounded-full text-sm ${tone.dot}`}
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

                {opt.id === "talk_to_lawyer" && (
                  <a
                    href="/profissionais"
                    className="inline-block mt-2 text-xs font-bold text-pine underline underline-offset-2"
                  >
                    Ver profissionais verificados →
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="px-6 py-3 border-t border-pine-tint bg-cream">
        <p className="text-[11px] text-ink-faint leading-relaxed">
          O Immigrei não é um escritório de advocacia e este conteúdo não substitui orientação
          jurídica. Antes de qualquer decisão, converse com um advogado de imigração.
        </p>
      </div>
    </div>
  );
}
