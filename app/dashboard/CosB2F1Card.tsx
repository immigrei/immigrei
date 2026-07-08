"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Dashboard card for the B1/B2 -> F-1 change-of-status pathway
 * (app/casos/cos-b2-f1). Self-fetches its state, like ConsuladosWidget.
 */

type CosCaseStatus = "draft" | "validated" | "blocked" | "compiled";
type CardState = "loading" | "none" | CosCaseStatus;

function display(state: CardState): {
  description: string;
  right: { kind: "cta" | "badge"; label: string; badgeClass?: string };
} {
  switch (state) {
    case "none":
      return {
        description: "Verificação técnica do caminho B1/B2 → F-1.",
        right: { kind: "cta", label: "Começar →" },
      };
    case "draft":
      return {
        description: "Retome seu formulário.",
        right: { kind: "cta", label: "Continuar →" },
      };
    case "validated":
    case "compiled":
      return {
        description: "Checklist concluído.",
        right: { kind: "badge", label: "Validado", badgeClass: "bg-sage text-white" },
      };
    case "blocked":
      return {
        // Neutro de propósito: um hard_block pode ser dado faltante
        // (recuperável) ou violação substantiva (não é "pendência" a
        // revisar) — o detalhe com o tom certo vive em MESSAGES_PT.
        description: "Há itens que exigem sua atenção. Veja os detalhes.",
        right: {
          kind: "badge",
          label: "Atenção",
          badgeClass: "bg-amber-tint text-amber-deep",
        },
      };
    default:
      return { description: "Carregando...", right: { kind: "cta", label: "" } };
  }
}

export default function CosB2F1Card() {
  const [state, setState] = useState<CardState>("loading");

  useEffect(() => {
    let active = true;
    fetch("/api/cases/cos-b2-f1")
      .then(async (res) => {
        if (!active) return;
        if (res.status === 404) {
          setState("none");
          return;
        }
        if (!res.ok) {
          setState("none");
          return;
        }
        const body = await res.json();
        const status: CosCaseStatus | undefined = body?.case?.status;
        setState(status ?? "none");
      })
      .catch(() => {
        if (active) setState("none");
      });
    return () => {
      active = false;
    };
  }, []);

  const { description, right } = display(state);

  return (
    <Link
      href="/casos/cos-b2-f1"
      className="block bg-cream-2 rounded-2xl border border-pine-tint overflow-hidden mb-5 hover:border-pine transition-colors"
    >
      <div className="px-6 py-4 border-b border-pine-tint">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">
          Mudança de status B1/B2 → F-1
        </p>
      </div>
      <div className="px-6 py-5 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          {state === "loading" ? "Carregando..." : description}
        </p>
        {state !== "loading" &&
          (right.kind === "cta" ? (
            <span className="text-sm font-bold text-pine whitespace-nowrap">{right.label}</span>
          ) : (
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${right.badgeClass}`}
            >
              {right.label}
            </span>
          ))}
      </div>
    </Link>
  );
}
