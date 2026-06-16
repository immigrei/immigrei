/**
 * Visa Bulletin widget — shows the latest priority dates (Brazil falls under
 * "All Chargeability Areas") for the categories relevant to the user's
 * profile. Data comes from the visa_bulletin table (monthly cron).
 */

type BulletinRow = {
  bulletin_month: string;
  bulletin_url: string | null;
  family_dates: Record<string, Record<string, string>>;
  employment_dates: Record<string, Record<string, string>>;
};

const EMPLOYMENT_CATEGORIES: Record<string, string> = {
  "1st": "EB-1 — Prioridade máxima",
  "2nd": "EB-2 — Pós-graduação / NIW",
  "3rd": "EB-3 — Profissionais",
};

const FAMILY_CATEGORIES: Record<string, string> = {
  F1: "F1 — Filhos solteiros de cidadãos",
  F2A: "F2A — Cônjuges e filhos de residentes",
  F2B: "F2B — Filhos solteiros 21+ de residentes",
  F3: "F3 — Filhos casados de cidadãos",
  F4: "F4 — Irmãos de cidadãos",
};

// Brazil is not a named column — it falls under "All Chargeability Areas".
function brazilValue(row: Record<string, string> | undefined): string | null {
  if (!row) return null;
  const allKey = Object.keys(row).find((k) => k.toLowerCase().startsWith("all"));
  const value = allKey ? row[allKey] : Object.values(row)[0];
  return value || null;
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const names = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  const name = names[Number(m) - 1] ?? m;
  return `${name} de ${year}`;
}

function DateBadge({ value }: { value: string }) {
  const isCurrent = value.trim().toUpperCase() === "C";
  return (
    <span
      className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
        isCurrent ? "bg-sage text-white" : "bg-amber-tint text-amber-deep"
      }`}
    >
      {isCurrent ? "Atual (sem fila)" : value}
    </span>
  );
}

export default function VisaBulletinWidget({
  bulletin,
  mainGoal,
}: {
  bulletin: BulletinRow | null;
  mainGoal: string | null;
}) {
  if (!bulletin) {
    return (
      <div className="bg-cream-2 rounded-2xl border border-pine-tint overflow-hidden mb-5">
        <div className="px-6 py-4 border-b border-pine-tint">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">
            Visa Bulletin
          </p>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-ink-soft">
            Ainda estamos buscando o boletim mais recente. Volte em breve — ou
            consulte direto em{" "}
            <a
              href="https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pine underline underline-offset-2"
            >
              travel.state.gov
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  const showFamily = mainGoal === "trazer_familia";
  const categories = showFamily ? FAMILY_CATEGORIES : EMPLOYMENT_CATEGORIES;
  const dates = showFamily ? bulletin.family_dates : bulletin.employment_dates;

  const rows = Object.entries(categories)
    .map(([key, label]) => ({ key, label, value: brazilValue(dates?.[key]) }))
    .filter((r) => r.value);

  return (
    <div className="bg-cream-2 rounded-2xl border border-pine-tint overflow-hidden mb-5">
      <div className="px-6 py-4 border-b border-pine-tint flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">
          Visa Bulletin
        </p>
        <span className="text-xs font-semibold text-pine bg-pine-tint px-2.5 py-1 rounded-full">
          {formatMonth(bulletin.bulletin_month)}
        </span>
      </div>

      <div className="px-6 py-5">
        <p className="text-sm text-ink-soft mb-4">
          {showFamily
            ? "Datas de corte das categorias familiares para brasileiros:"
            : "Datas de corte das categorias de trabalho (EB) para brasileiros:"}
        </p>

        {rows.length > 0 ? (
          <div className="flex flex-col gap-2">
            {rows.map((r) => (
              <div
                key={r.key}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-pine-tint bg-cream"
              >
                <span className="text-sm font-medium text-ink">{r.label}</span>
                <DateBadge value={r.value!} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-soft">
            Não conseguimos ler as categorias deste mês. Consulte a fonte oficial abaixo.
          </p>
        )}

        <p className="mt-4 text-[11px] text-ink-faint leading-relaxed">
          &ldquo;Data de corte&rdquo; é a data de prioridade que está sendo atendida agora —
          se a sua é anterior a ela, sua vez chegou. &ldquo;Atual&rdquo; significa sem fila.{" "}
          <a
            href={
              bulletin.bulletin_url ??
              "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-pine underline underline-offset-2"
          >
            Fonte oficial ↗
          </a>
        </p>
      </div>
    </div>
  );
}
