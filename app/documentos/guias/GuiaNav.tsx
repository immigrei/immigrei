"use client";

import { useRouter } from "next/navigation";

export function VoltarGuiaButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/documentos/guias");
      }}
      className="text-ink-faint hover:text-ink transition-colors text-sm font-medium flex items-center gap-1"
      style={{ fontFamily: "var(--font-body)" }}
    >
      ← Voltar
    </button>
  );
}
