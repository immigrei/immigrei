import { VisaJourney } from "@/lib/visa-journeys";

/**
 * Vertical timeline of the user's immigration journey.
 * Steps before currentStepId are done, the current one is highlighted,
 * the rest are upcoming.
 */
export default function JourneyTimeline({ journey }: { journey: VisaJourney }) {
  const currentIndex = journey.steps.findIndex((s) => s.id === journey.currentStepId);

  return (
    <div className="bg-cream-2 rounded-2xl border border-pine-tint overflow-hidden mb-5">
      <div className="px-6 py-4 border-b border-pine-tint flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">
          Sua jornada
        </p>
        <span className="text-xs font-semibold text-pine bg-pine-tint px-2.5 py-1 rounded-full">
          {journey.name}
        </span>
      </div>

      <ol className="px-6 py-5">
        {journey.steps.map((step, i) => {
          const isDone = currentIndex >= 0 && i < currentIndex;
          const isCurrent = i === currentIndex;
          const isLast = i === journey.steps.length - 1;

          return (
            <li key={step.id} className="relative flex gap-4 pb-1">
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
                {isDone ? "✓" : i + 1}
              </span>

              {/* Content */}
              <div className={`pb-5 ${isLast ? "pb-1" : ""}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className={`text-sm font-semibold ${
                      isCurrent ? "text-ink" : isDone ? "text-ink-soft" : "text-ink-soft"
                    }`}
                  >
                    {step.title}
                  </p>
                  {isCurrent && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-deep bg-amber-tint px-2 py-0.5 rounded-full">
                      Você está aqui
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-soft leading-relaxed mt-1">
                  {step.description}
                </p>
                {(step.docs?.length || step.uscisUrl || step.avgDays) && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                    {step.docs?.map((doc) => (
                      <span
                        key={doc}
                        className="text-[11px] text-pine bg-pine-tint px-2 py-0.5 rounded-full"
                      >
                        📄 {doc}
                      </span>
                    ))}
                    {step.avgDays && (
                      <span className="text-[11px] text-ink-faint">
                        ⏱ ~{step.avgDays} dias
                      </span>
                    )}
                    {step.uscisUrl && (
                      <a
                        href={step.uscisUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-pine underline underline-offset-2"
                      >
                        Fonte oficial ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
