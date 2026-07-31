"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { daysUntilI94Expiry, urgencyStyle } from "@/lib/i94";

export type UserProcess = {
  id: string;
  kit_id: string | null;
  label: string;
  status: "ativo" | "consideracao";
  deadline_date: string | null;
  deadline_label: string | null;
};

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function deadlineBadge(dateStr: string) {
  const days = daysUntilI94Expiry(dateStr);
  const style = urgencyStyle(days);
  const text = days < 0 ? `Venceu há ${Math.abs(days)}d` : days === 0 ? "Vence hoje" : `${days}d restantes`;
  return { style, text };
}

/**
 * "Processos em paralelo" — summary of every immigration process the user
 * is tracking alongside their main journey (getStrategy/visa_type), sorted
 * by soonest deadline so nothing gets missed when more than one is running
 * at once. Shown on both Início and Painel — same component, no paywall
 * (this is the user's own data, not Immigrei's kit content).
 */
export default function ParallelProcessesCard() {
  const [processes, setProcesses] = useState<UserProcess[]>([]);
  const [loading, setLoading]     = useState(true);
  const [adding, setAdding]       = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel]         = useState("");
  const [deadlineDate, setDeadlineDate]   = useState("");
  const [deadlineLabel, setDeadlineLabel] = useState("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/user-processes");
      const data = await res.json();
      setProcesses(data.processes ?? []);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setAdding(false);
    setEditingId(null);
    setLabel("");
    setDeadlineDate("");
    setDeadlineLabel("");
    setError(null);
  }

  async function create() {
    if (!label.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/user-processes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          status: "consideracao",
          deadlineDate: deadlineDate || null,
          deadlineLabel: deadlineLabel.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      resetForm();
      await load();
    } catch {
      setError("Não conseguimos salvar agora. Tente de novo.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(p: UserProcess) {
    setEditingId(p.id);
    setAdding(false);
    setLabel(p.label);
    setDeadlineDate(p.deadline_date ?? "");
    setDeadlineLabel(p.deadline_label ?? "");
    setError(null);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/user-processes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim() || undefined,
          deadlineDate: deadlineDate || null,
          deadlineLabel: deadlineLabel.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      resetForm();
      await load();
    } catch {
      setError("Não conseguimos salvar agora. Tente de novo.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setSaving(true);
    try {
      await fetch(`/api/user-processes/${id}`, { method: "DELETE" });
      await load();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-cream-2 rounded-2xl border border-pine-tint p-6 animate-pulse mb-5">
        <div className="h-4 bg-pine-tint rounded w-1/3 mb-3" />
        <div className="h-3 bg-pine-tint rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="bg-cream-2 rounded-2xl border border-pine-tint overflow-hidden mb-5">
      <div className="px-6 py-4 border-b border-pine-tint flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">
          Processos em paralelo
        </p>
        {!adding && (
          <button
            onClick={() => { setAdding(true); setEditingId(null); setError(null); }}
            className="text-xs font-bold text-pine hover:text-pine-deep transition-colors"
          >
            + Adicionar processo
          </button>
        )}
      </div>

      {adding && (
        <div className="px-6 py-4 border-b border-pine-tint bg-pine-tint/30">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3">
            Novo processo
          </p>
          <input
            type="text"
            placeholder="Ex: Portfólio para O-1"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-xl border border-pine-tint bg-cream-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-pine mb-2"
          />
          <input
            type="date"
            value={deadlineDate}
            onChange={(e) => setDeadlineDate(e.target.value)}
            className="w-full rounded-xl border border-pine-tint bg-cream-2 px-4 py-2.5 text-sm text-ink mb-2"
          />
          <input
            type="text"
            placeholder="Do que é essa data (opcional — ex: Entrevista consular)"
            value={deadlineLabel}
            onChange={(e) => setDeadlineLabel(e.target.value)}
            className="w-full rounded-xl border border-pine-tint bg-cream-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-pine mb-3"
          />
          {error && <p className="text-clay text-xs mb-2">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={create}
              disabled={saving || !label.trim()}
              className="flex-1 bg-pine text-cream-2 rounded-xl py-2.5 text-sm font-bold hover:bg-pine-deep transition-colors disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 rounded-xl border border-pine-tint text-ink-soft text-sm hover:bg-pine-tint transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {processes.length === 0 && !adding ? (
        <div className="px-6 py-8 text-center">
          <p className="text-ink-soft text-sm mb-1">Nenhum processo em paralelo ainda.</p>
          <p className="text-ink-faint text-xs">
            Além do seu caminho principal, adicione aqui qualquer outro processo que esteja rodando ao mesmo tempo — confirmando um kit em /documentos ou manualmente.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-pine-tint">
          {processes.map((p) => {
            const badge = p.deadline_date ? deadlineBadge(p.deadline_date) : null;
            const isEditing = editingId === p.id;

            if (isEditing) {
              return (
                <div key={p.id} className="px-6 py-4 bg-pine-tint/30">
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full rounded-xl border border-pine-tint bg-cream-2 px-4 py-2.5 text-sm text-ink mb-2"
                  />
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full rounded-xl border border-pine-tint bg-cream-2 px-4 py-2.5 text-sm text-ink mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Do que é essa data (opcional)"
                    value={deadlineLabel}
                    onChange={(e) => setDeadlineLabel(e.target.value)}
                    className="w-full rounded-xl border border-pine-tint bg-cream-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-pine mb-3"
                  />
                  {error && <p className="text-clay text-xs mb-2">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(p.id)}
                      disabled={saving || !label.trim()}
                      className="flex-1 bg-pine text-cream-2 rounded-xl py-2.5 text-sm font-bold hover:bg-pine-deep transition-colors disabled:opacity-50"
                    >
                      {saving ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-4 rounded-xl border border-pine-tint text-ink-soft text-sm hover:bg-pine-tint transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={p.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.status === "ativo" ? "bg-pine" : "bg-ink-faint"}`} />
                      <span className="text-xs font-bold uppercase tracking-widest text-ink-faint truncate">
                        {p.status === "ativo" ? "Ativo" : "Em consideração"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-ink mb-1">{p.label}</p>
                    {badge && (
                      <p className="text-xs">
                        <span className={`inline-block font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${badge.style.badge}`}>
                          {badge.text}
                        </span>
                        <span className="text-ink-faint ml-2">
                          {p.deadline_label ? `${p.deadline_label} — ` : ""}{formatDate(p.deadline_date!)}
                        </span>
                      </p>
                    )}
                    {p.kit_id && (
                      <Link href={`/documentos/${p.kit_id}`} className="inline-block text-xs font-bold text-pine hover:underline mt-1.5">
                        Ver kit →
                      </Link>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                    <button
                      onClick={() => startEdit(p)}
                      className="text-xs text-pine hover:text-pine-deep font-bold transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      disabled={saving}
                      className="text-xs text-clay hover:text-clay/80 font-bold transition-colors disabled:opacity-40"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
