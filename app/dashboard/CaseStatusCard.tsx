"use client";

import { useState } from "react";

/**
 * "Meu Caso" — add a USCIS receipt number and track its status.
 * Calls POST /api/uscis/case-status, which also saves the case to Supabase
 * so the weekly cron keeps it updated and emails the user on changes.
 */

export type UserCase = {
  id: string;
  receipt_number: string;
  label: string | null;
  visa_type: string | null;
  last_status: string | null;
  last_status_date: string | null;
  last_checked_at: string | null;
};

type CaseStatusResult = {
  receiptNumber: string;
  status: string;
  statusDate: string;
  description: string;
  isApproved: boolean;
  isPending: boolean;
  isDenied: boolean;
  error?: string;
};

const RECEIPT_REGEX = /^[A-Z]{3}\d{10}$/;

function normalizeReceipt(raw: string): string {
  return raw.replace(/[\s\-]/g, "").toUpperCase().trim();
}

function statusStyle(result: { isApproved: boolean; isDenied: boolean }) {
  if (result.isApproved) return { box: "bg-pine-tint border-sage", badge: "bg-sage text-white", label: "Aprovado" };
  if (result.isDenied) return { box: "bg-[#FDECEA] border-clay", badge: "bg-clay text-white", label: "Atenção" };
  return { box: "bg-amber-tint border-amber", badge: "bg-amber text-ink", label: "Em andamento" };
}

export default function CaseStatusCard({ initialCases }: { initialCases: UserCase[] }) {
  const [cases, setCases] = useState<UserCase[]>(initialCases);
  const [receipt, setReceipt] = useState("");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [result, setResult] = useState<CaseStatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkStatus(receiptNumber: string, caseLabel?: string) {
    const res = await fetch("/api/uscis/case-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiptNumber, label: caseLabel || undefined }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error ?? "Não foi possível verificar agora. Tente novamente.");
    }
    return (await res.json()) as CaseStatusResult;
  }

  async function reloadCases() {
    const res = await fetch("/api/uscis/case-status");
    if (res.ok) {
      const body = await res.json();
      if (Array.isArray(body?.cases)) setCases(body.cases);
    }
  }

  async function handleSubmit() {
    const normalized = normalizeReceipt(receipt);
    if (!RECEIPT_REGEX.test(normalized)) {
      setError("Formato inválido. Use 3 letras + 10 números (ex: IOE0123456789).");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await checkStatus(normalized, label.trim());
      setResult(data);
      setReceipt("");
      setLabel("");
      await reloadCases();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh(c: UserCase) {
    setRefreshing(c.id);
    setError(null);
    try {
      const data = await checkStatus(c.receipt_number, c.label ?? undefined);
      setResult(data);
      await reloadCases();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado. Tente novamente.");
    } finally {
      setRefreshing(null);
    }
  }

  return (
    <div className="bg-cream-2 rounded-2xl border border-pine-tint overflow-hidden mb-5">
      <div className="px-6 py-4 border-b border-pine-tint">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">
          Meu caso no USCIS
        </p>
      </div>

      <div className="px-6 py-5">
        {/* Existing cases */}
        {cases.length > 0 && (
          <div className="flex flex-col gap-2 mb-5">
            {cases.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-pine-tint bg-cream"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">
                    {c.label || c.receipt_number}
                  </p>
                  <p className="text-xs text-ink-soft truncate">
                    {c.label ? `${c.receipt_number} · ` : ""}
                    {c.last_status ?? "Ainda não verificado"}
                    {c.last_status_date ? ` — ${c.last_status_date}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleRefresh(c)}
                  disabled={refreshing === c.id}
                  className="text-xs font-semibold text-pine border border-pine-tint rounded-full px-3 py-1.5 hover:bg-pine-tint transition-colors disabled:opacity-40 whitespace-nowrap"
                >
                  {refreshing === c.id ? "Verificando..." : "Atualizar"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add case form */}
        <p className="text-sm text-ink-soft mb-3">
          {cases.length === 0
            ? "Cole o número de recibo do USCIS (está no topo das suas notificações I-797) para acompanhar seu caso."
            : "Acompanhe outro caso:"}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={receipt}
            onChange={(e) => {
              setReceipt(e.target.value);
              setError(null);
            }}
            placeholder="IOE0123456789"
            maxLength={16}
            className="flex-1 px-4 py-3 rounded-xl border border-pine-tint bg-cream text-ink text-sm font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-pine focus:border-pine transition"
          />
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Apelido (ex: Meu H-1B)"
            maxLength={40}
            className="flex-1 px-4 py-3 rounded-xl border border-pine-tint bg-cream text-ink text-sm focus:outline-none focus:ring-2 focus:ring-pine focus:border-pine transition"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !receipt.trim()}
            className="px-5 py-3 rounded-xl bg-pine text-cream font-semibold text-sm hover:bg-pine-deep transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            {loading ? "Verificando..." : "Verificar status"}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-clay">{error}</p>}

        {/* Result card */}
        {result && (
          <div className={`mt-4 px-4 py-4 rounded-xl border ${statusStyle(result).box}`}>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusStyle(result).badge}`}
              >
                {statusStyle(result).label}
              </span>
              <span className="text-xs text-ink-faint font-mono">{result.receiptNumber}</span>
            </div>
            <p className="text-sm font-semibold text-ink">{result.status}</p>
            {result.statusDate && (
              <p className="text-xs text-ink-soft mt-0.5">Última atualização: {result.statusDate}</p>
            )}
            {result.description && (
              <p className="text-xs text-ink-soft leading-relaxed mt-2">{result.description}</p>
            )}
          </div>
        )}

        <p className="mt-4 text-[11px] text-ink-faint leading-relaxed">
          Verificamos seus casos toda semana e avisamos por e-mail quando o status mudar.
          Fonte: uscis.gov.
        </p>
      </div>
    </div>
  );
}
