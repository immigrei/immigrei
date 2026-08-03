"use client";

import { useState } from "react";

const PLAN_LABELS: Record<string, string> = {
  monthly: "Jornada — mensal (R$ 29,90/mês)",
  annual: "Jornada — anual (R$ 269,00/ano)",
};

export default function SubscriptionSection({ plan }: { plan: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function abrirPortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error();
      window.location.href = data.url;
    } catch {
      setError("Não conseguimos abrir o gerenciamento de assinatura agora. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="bg-cream-2 rounded-2xl border border-pine-tint p-6 mb-5">
      <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-2">
        Assinatura
      </p>
      <p className="text-ink text-sm font-medium mb-4">
        {PLAN_LABELS[plan] ?? plan}
      </p>
      {error && <p className="text-sm text-clay mb-3">{error}</p>}
      <button
        onClick={abrirPortal}
        disabled={loading}
        className="text-sm font-semibold text-pine hover:text-pine-deep underline underline-offset-4 transition-colors disabled:opacity-60"
      >
        {loading ? "Abrindo..." : "Gerenciar ou cancelar assinatura →"}
      </button>
    </div>
  );
}
