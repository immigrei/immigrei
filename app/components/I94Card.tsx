import { daysUntilI94Expiry } from "@/lib/i94";

/**
 * Read-only I-94 deadline card for /painel and /documentos — same data and
 * urgency colors as the editable field on Início, but editing stays
 * exclusive to Início. The whole card links out to i94.cbp.dhs.gov.
 */

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function urgencyStyle(days: number): { text: string; badge: string } {
  if (days < 0) return { text: "text-clay", badge: "bg-clay/10 text-clay" };
  if (days <= 30) return { text: "text-amber-deep", badge: "bg-amber-tint text-amber-deep" };
  return { text: "text-ink", badge: "bg-pine-tint text-pine-deep" };
}

export default function I94Card({ value }: { value: string | null }) {
  if (!value) {
    return (
      <a
        href="https://i94.cbp.dhs.gov"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-cream-2 border border-pine-tint rounded-2xl px-5 py-4 mb-5 hover:border-pine transition-colors"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-1" style={{ letterSpacing: "0.1em" }}>
          Prazo de permanência (I-94)
        </p>
        <p className="text-sm font-semibold text-pine">Verificar meu I-94 →</p>
      </a>
    );
  }

  const days = daysUntilI94Expiry(value);
  const style = urgencyStyle(days);

  return (
    <a
      href="https://i94.cbp.dhs.gov"
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-cream-2 border border-pine-tint rounded-2xl px-5 py-4 mb-5 hover:border-pine transition-colors"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-1" style={{ letterSpacing: "0.1em" }}>
        Prazo de permanência (I-94)
      </p>
      <p className={`text-sm font-medium ${style.text}`}>
        {formatDate(value)}{" "}
        <span className={`ml-1 text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${style.badge}`}>
          {days < 0 ? `Venceu há ${Math.abs(days)}d` : days === 0 ? "Vence hoje" : `${days}d restantes`}
        </span>
      </p>
    </a>
  );
}
