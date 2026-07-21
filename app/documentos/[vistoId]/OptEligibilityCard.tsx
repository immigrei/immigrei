"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { daysUntilOptEligible, estimatedOptEligibleDate } from "@/lib/opt";

/**
 * F-1 -> OPT eligibility countdown. One full academic year of full-time
 * enrollment is required before post-completion OPT (8 CFR 214.2(f)(10)) —
 * "academic year" is defined by the school (usually 2 semesters), not a
 * fixed 365-day count, so the target date shown here is an estimate.
 */

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function OptEligibilityCard({ initialValue }: { initialValue: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState<string | null>(initialValue);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialValue ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function salvar() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ f1_program_start_date: draft }),
      });
      if (!res.ok) throw new Error();
      setValue(draft);
      setEditing(false);
    } catch {
      setError("Não conseguimos salvar agora. Tente de novo.");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="bg-cream-2 rounded-2xl border border-pine-tint p-5 mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3" style={{ letterSpacing: "0.1em" }}>
          Contagem para o OPT
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="date"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-pine-tint bg-cream text-ink text-sm focus:outline-none focus:ring-2 focus:ring-pine focus:border-pine transition"
          />
          <button
            onClick={salvar}
            disabled={saving || !draft}
            className="px-4 py-2 rounded-xl bg-pine text-cream font-semibold text-sm hover:bg-pine-deep transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button
            onClick={() => { setEditing(false); setDraft(value ?? ""); setError(null); }}
            className="px-4 py-2 rounded-xl text-ink-soft text-sm hover:bg-cream transition-colors whitespace-nowrap"
          >
            Cancelar
          </button>
        </div>
        {error && <p className="text-xs text-clay mt-2">{error}</p>}
        <p className="text-xs text-ink-faint leading-relaxed mt-3">
          A data de início está no seu Formulário I-20 (&quot;Program Start Date&quot;).
        </p>
      </div>
    );
  }

  if (!value) {
    return (
      <div className="bg-cream-2 rounded-2xl border border-pine-tint p-5 mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-2" style={{ letterSpacing: "0.1em" }}>
          Contagem para o OPT
        </p>
        <p className="text-sm text-ink-soft leading-relaxed mb-3">
          Você precisa de 1 ano acadêmico completo em tempo integral antes de pedir o OPT
          pós-conclusão. Adicione a data de início do seu programa e a gente conta os dias.
        </p>
        <button
          onClick={() => setEditing(true)}
          className="text-sm font-semibold text-pine hover:underline underline-offset-2 w-fit"
        >
          + Adicionar data de início do meu programa
        </button>
      </div>
    );
  }

  const eligibleDate = estimatedOptEligibleDate(value);
  const days = daysUntilOptEligible(eligibleDate);
  const jaElegivel = days <= 0;

  return (
    <div className="bg-cream-2 rounded-2xl border border-pine-tint p-5 mb-8">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint" style={{ letterSpacing: "0.1em" }}>
          Contagem para o OPT
        </p>
        <button
          onClick={() => setEditing(true)}
          className="flex-shrink-0 text-xs font-semibold text-pine hover:underline underline-offset-2"
        >
          Editar
        </button>
      </div>

      <p className="text-base font-medium text-ink mt-2">
        {jaElegivel ? "Você já completou 1 ano acadêmico (estimativa)" : `Estimativa: ${formatDate(eligibleDate)}`}{" "}
        <span
          className={[
            "ml-1 text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full",
            jaElegivel ? "bg-sage/15 text-sage" : "bg-amber-tint text-amber-deep",
          ].join(" ")}
        >
          {jaElegivel ? "Pode solicitar" : `${days}d restantes`}
        </span>
      </p>

      <p className="text-xs text-ink-faint leading-relaxed mt-3">
        Estimativa de 2 semestres (~9 meses) a partir do início do seu programa em{" "}
        {formatDate(value)}. &quot;1 ano acadêmico&quot; é definido pela sua escola — confirme a data exata
        com seu DSO antes de protocolar.
      </p>

      {jaElegivel && (
        <button
          onClick={() => router.push("/documentos/f1-opt/formulario/i-765")}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-ink hover:bg-amber-deep transition-colors"
        >
          Preencher o I-765 →
        </button>
      )}
    </div>
  );
}
