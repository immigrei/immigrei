"use client";

import { useState } from "react";

/**
 * Manual I-94 expiry date — the deadline that actually governs how long
 * someone can stay (not the visa stamp). Feeds the real countdown shown
 * here and used by /painel instead of generic "confira o prazo" advice.
 */

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function daysLeft(dateStr: string): number {
  const [year, month, day] = dateStr.split("-");
  const due = new Date(Number(year), Number(month) - 1, Number(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function urgencyStyle(days: number): { text: string; badge: string } {
  if (days < 0) return { text: "text-clay", badge: "bg-clay/10 text-clay" };
  if (days <= 30) return { text: "text-amber-deep", badge: "bg-amber-tint text-amber-deep" };
  return { text: "text-ink", badge: "bg-pine-tint text-pine-deep" };
}

export default function I94Field({ initialValue }: { initialValue: string | null }) {
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
        body: JSON.stringify({ i94_expiry_date: draft }),
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
      <div className="px-6 py-4 flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-ink-faint">
          Prazo de permanência (I-94)
        </span>
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
        {error && <p className="text-xs text-clay">{error}</p>}
        <a
          href="https://i94.cbp.dhs.gov"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-pine underline underline-offset-2 w-fit"
        >
          Não sei meu prazo — consultar em i94.cbp.dhs.gov →
        </a>
      </div>
    );
  }

  if (!value) {
    return (
      <div className="px-6 py-4 flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-widest text-ink-faint">
          Prazo de permanência (I-94)
        </span>
        <button
          onClick={() => setEditing(true)}
          className="text-sm font-semibold text-pine text-left hover:underline underline-offset-2 w-fit"
        >
          + Adicionar meu prazo do I-94
        </button>
      </div>
    );
  }

  const days = daysLeft(value);
  const style = urgencyStyle(days);

  return (
    <div className="px-6 py-4 flex items-center justify-between gap-3">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-ink-faint">
          Prazo de permanência (I-94)
        </span>
        <p className={`text-base font-medium ${style.text}`}>
          {formatDate(value)}{" "}
          <span className={`ml-1 text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${style.badge}`}>
            {days < 0 ? `Venceu há ${Math.abs(days)}d` : days === 0 ? "Vence hoje" : `${days}d restantes`}
          </span>
        </p>
      </div>
      <button
        onClick={() => setEditing(true)}
        className="flex-shrink-0 text-xs font-semibold text-pine hover:underline underline-offset-2"
      >
        Editar
      </button>
    </div>
  );
}
