import { getDeniedCaseStrategies } from "@/lib/strategies";
import OptionsList from "@/app/components/OptionsList";

/**
 * Strategic options shown when a monitored USCIS case is denied.
 * Rendered right below the case status card — this is a "branch" of the
 * journey, not a dead end.
 */
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

      <OptionsList options={options} />

      <div className="px-6 py-3 border-t border-pine-tint bg-cream">
        <p className="text-[11px] text-ink-faint leading-relaxed">
          O immigrei não é um escritório de advocacia e este conteúdo não substitui orientação
          jurídica. Antes de qualquer decisão, converse com um advogado de imigração.
        </p>
      </div>
    </div>
  );
}
