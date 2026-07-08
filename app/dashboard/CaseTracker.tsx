"use client";

import { useState, useEffect } from "react";
import { traduzirStatus } from "@/lib/uscis-status-pt";

type Case = {
  id: string;
  receipt_number: string;
  label: string | null;
  last_status: string | null;
  last_status_date: string | null;
  last_checked_at: string | null;
  check_error: string | null;
};

type StatusResult = {
  status: string;
  statusDate: string;
  description: string;
  isApproved: boolean;
  isPending: boolean;
  isDenied: boolean;
  error?: string;
};

export default function CaseTracker() {
  const [cases, setCases]           = useState<Case[]>([]);
  const [loading, setLoading]       = useState(true);
  const [adding, setAdding]         = useState(false);
  const [receipt, setReceipt]       = useState("");
  const [label, setLabel]           = useState("");
  const [checking, setChecking]     = useState<string | null>(null);
  const [result, setResult]         = useState<Record<string, StatusResult>>({});
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => { loadCases(); }, []);

  async function loadCases() {
    setLoading(true);
    try {
      const res = await fetch("/api/uscis/case-status");
      const data = await res.json();
      setCases(data.cases ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function addCase() {
    if (!receipt.trim()) return;
    setError(null);
    setChecking(receipt.trim().toUpperCase());

    const res = await fetch("/api/uscis/case-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiptNumber: receipt.trim(), label: label.trim() || null }),
    });
    const data: StatusResult = await res.json();

    if (data.error && data.error !== "invalid_format") {
      setError(data.error);
    } else if (data.error === "invalid_format") {
      setError("Formato inválido. Use o padrão: IOE0123456789");
    } else {
      setResult((prev) => ({ ...prev, [receipt.trim().toUpperCase()]: data }));
      setReceipt("");
      setLabel("");
      setAdding(false);
      await loadCases();
    }
    setChecking(null);
  }

  async function refreshCase(receiptNumber: string) {
    setChecking(receiptNumber);
    const res = await fetch("/api/uscis/case-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiptNumber }),
    });
    const data: StatusResult = await res.json();
    setResult((prev) => ({ ...prev, [receiptNumber]: data }));
    setChecking(null);
    await loadCases();
  }

  function statusColor(c: Case, r?: StatusResult) {
    if (r?.isApproved) return "text-sage";
    if (r?.isDenied)   return "text-clay";
    return "text-amber";
  }

  function statusDot(r?: StatusResult) {
    if (r?.isApproved) return "bg-sage";
    if (r?.isDenied)   return "bg-clay";
    return "bg-amber";
  }

  if (loading) {
    return (
      <div className="bg-cream-2 rounded-2xl border border-pine-tint p-6 animate-pulse">
        <div className="h-4 bg-pine-tint rounded w-1/3 mb-3" />
        <div className="h-3 bg-pine-tint rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="bg-cream-2 rounded-2xl border border-pine-tint overflow-hidden mb-5">
      <div className="px-6 py-4 border-b border-pine-tint flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">
          Casos USCIS
        </p>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-xs font-bold text-pine hover:text-pine-deep transition-colors"
          >
            + Adicionar caso
          </button>
        )}
      </div>

      {/* Add case form */}
      {adding && (
        <div className="px-6 py-4 border-b border-pine-tint bg-pine-tint/30">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3">
            Novo caso
          </p>
          <input
            type="text"
            placeholder="Número de recibo (ex: IOE0123456789)"
            value={receipt}
            onChange={(e) => setReceipt(e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-pine-tint bg-cream-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-pine mb-2"
          />
          <input
            type="text"
            placeholder="Apelido (opcional — ex: Green Card do cônjuge)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-xl border border-pine-tint bg-cream-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-pine mb-3"
          />
          {error && <p className="text-clay text-xs mb-2">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={addCase}
              disabled={!!checking || !receipt.trim()}
              className="flex-1 bg-pine text-cream-2 rounded-xl py-2.5 text-sm font-bold hover:bg-pine-deep transition-colors disabled:opacity-50"
            >
              {checking ? "Verificando..." : "Verificar e salvar"}
            </button>
            <button
              onClick={() => { setAdding(false); setError(null); setReceipt(""); setLabel(""); }}
              className="px-4 rounded-xl border border-pine-tint text-ink-soft text-sm hover:bg-pine-tint transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Cases list */}
      {cases.length === 0 && !adding ? (
        <div className="px-6 py-8 text-center">
          <p className="text-ink-soft text-sm mb-1">Nenhum caso cadastrado ainda.</p>
          <p className="text-ink-faint text-xs">
            Adicione o número de recibo do USCIS para acompanhar o status do seu caso.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-pine-tint">
          {cases.map((c) => {
            const r = result[c.receipt_number];
            const status = r?.status ?? c.last_status;
            const statusDate = r?.statusDate ?? c.last_status_date;
            const description = r?.description;
            const isLoading = checking === c.receipt_number;
            const traduzido = status ? traduzirStatus(status) : null;

            return (
              <div key={c.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot(r)}`} />
                      <span className="text-xs font-bold uppercase tracking-widest text-ink-faint truncate">
                        {c.label ?? c.receipt_number}
                      </span>
                    </div>
                    {c.label && (
                      <p className="text-ink-faint text-xs mb-1">{c.receipt_number}</p>
                    )}
                    {traduzido && (
                      <p className={`text-sm font-semibold mb-1 ${statusColor(c, r)}`}>
                        {traduzido.titulo}
                      </p>
                    )}
                    {traduzido && traduzido.titulo !== traduzido.original && (
                      <p className="text-ink-faint text-[11px] mb-1">
                        USCIS: {traduzido.original}
                      </p>
                    )}
                    {statusDate && (
                      <p className="text-ink-faint text-xs">{statusDate}</p>
                    )}
                    {traduzido && (
                      <p className="text-ink-soft text-xs mt-2 leading-relaxed">
                        {traduzido.explicacao}
                      </p>
                    )}
                    {description && (
                      <p className="text-ink-faint text-xs mt-2 leading-relaxed line-clamp-3">
                        {description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => refreshCase(c.receipt_number)}
                    disabled={isLoading}
                    className="flex-shrink-0 text-xs text-pine hover:text-pine-deep font-bold disabled:opacity-40 transition-colors pt-0.5"
                  >
                    {isLoading ? "..." : "Atualizar"}
                  </button>
                </div>
                {c.last_checked_at && (
                  <p className="text-ink-faint text-xs mt-2">
                    Última verificação:{" "}
                    {new Date(c.last_checked_at).toLocaleString("pt-BR", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
