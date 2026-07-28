"use client";

import { useState } from "react";
import PlanButton from "./PlanButton";

const PRICES = {
  monthly: { price: "US$ 29,90", period: "/mês", note: null },
  annual: {
    price: "US$ 269",
    period: "/ano",
    note: "Equivale a 9 meses — 3 meses de graça",
  },
} as const;

const FEATURES = [
  "Rastreamento do seu caso USCIS em tempo real",
  "Alertas por e-mail a cada mudança de status",
  "Histórico completo do seu caso",
  "Kits passo a passo pra cada tipo de visto",
  "Alertas de consulados itinerantes",
  "Acompanhamento do Visa Bulletin",
  "Conteúdo migratório completo",
];

export default function PricingToggle() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const current = PRICES[billing];

  return (
    <div className="flex flex-col bg-cream-2 rounded-2xl p-8 border border-amber shadow-lg">
      <span className="self-start text-[11px] font-bold uppercase tracking-widest text-amber-deep bg-amber-tint px-3 py-1 rounded-full mb-4">
        Mais escolhido
      </span>
      <h2 className="text-ink font-bold text-xl mb-1">Immigrei</h2>
      <p className="text-ink-faint text-sm mb-4">A jornada completa, sem surpresas</p>

      <div className="inline-flex self-start bg-pine-tint rounded-full p-1 mb-6">
        <button
          type="button"
          onClick={() => setBilling("monthly")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            billing === "monthly" ? "bg-cream-2 text-pine shadow-sm" : "text-ink-soft"
          }`}
        >
          Mensal
        </button>
        <button
          type="button"
          onClick={() => setBilling("annual")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            billing === "annual" ? "bg-cream-2 text-pine shadow-sm" : "text-ink-soft"
          }`}
        >
          Anual
        </button>
      </div>

      <p className="mb-2">
        <span
          className="text-4xl font-semibold text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {current.price}
        </span>
        <span className="text-ink-faint text-sm">{current.period}</span>
      </p>
      <p className="text-sage text-sm font-semibold mb-6 h-5">{current.note ?? " "}</p>

      <ul className="space-y-3 mb-8 flex-1">
        {FEATURES.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-ink-soft">
            <span className="text-sage font-bold">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <PlanButton plan={billing} highlight />
    </div>
  );
}
