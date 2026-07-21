"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Client pieces of the dedicated visa page: the back button (preserves the
 * onboarding query params via history) and the sticky confirm bar — the same
 * save flow as the /vistos grid, so confirming here or there is equivalent.
 */

export function VoltarButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/vistos");
      }}
      className="text-ink-faint hover:text-ink transition-colors text-sm font-medium flex items-center gap-1"
      style={{ fontFamily: "var(--font-body)" }}
    >
      ← Voltar
    </button>
  );
}

export default function ConfirmBar({
  vistoId,
  codigo,
  nome,
}: {
  vistoId: string;
  codigo: string;
  nome: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Profile fields travel from the onboarding as query params (same contract
  // as /vistos). Read after mount — this page is statically prerendered.
  const [rawNationality, setRawNationality] = useState<string | null>(null);
  const [location, setLocation] = useState<"brasil" | "eua" | null>(null);
  const [mainGoal, setMainGoal] = useState<string | null>(null);

  useEffect(() => {
    // Reading window.location requires deferring to an effect (SSR has no
    // window); the values below can only ever be set once, on mount.
    const params = new URLSearchParams(window.location.search);
    const nat = params.get("nationality");
    if (nat === "brazilian" || nat === "treaty" || nat === "other") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRawNationality(nat);
    }
    const loc = params.get("location");
    if (loc === "brasil" || loc === "eua") setLocation(loc);
    setMainGoal(params.get("goal"));
  }, []);

  async function confirmar() {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    const payload = {
      visa_type: vistoId,
      main_goal: mainGoal ?? "outro",
      ...(location ? { location } : {}),
      ...(rawNationality ? { nationality: rawNationality } : {}),
    };
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        // Not signed in yet — stash the selection so it survives the sign-up
        // round-trip; the onboarding page finishes the save afterwards.
        localStorage.setItem("immigrei_pending_profile", JSON.stringify(payload));
        router.push("/sign-up");
        return;
      }
      if (!res.ok) throw new Error("save_failed");
      router.push("/dashboard");
    } catch {
      setSaveError("Não conseguimos salvar agora. Tente novamente.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-cream via-cream/95 to-transparent pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        {saveError && (
          <p
            className="text-center text-sm text-clay mb-2 bg-cream rounded-xl py-1.5"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {saveError}
          </p>
        )}
        <button
          onClick={confirmar}
          disabled={saving}
          className="w-full bg-pine text-cream rounded-2xl py-4 font-semibold text-base shadow-xl shadow-pine/30 transition-all hover:bg-pine-deep active:scale-[0.98] disabled:opacity-60"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {saving
            ? "Salvando sua jornada..."
            : `Quero seguir esse caminho — ${codigo} ${nome} →`}
        </button>
      </div>
    </div>
  );
}
