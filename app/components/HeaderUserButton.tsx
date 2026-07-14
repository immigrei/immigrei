"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";

const ONBOARDING_STATE_KEY = "immigrei_onboarding_state";

export default function HeaderUserButton() {
  const [confirmando, setConfirmando] = useState(false);
  const [zerando, setZerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const zerarOnboarding = async () => {
    setErro(null);
    setZerando(true);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (!res.ok) {
        setErro("Não conseguimos recomeçar agora. Tente de novo em instantes.");
        return;
      }
      sessionStorage.removeItem(ONBOARDING_STATE_KEY);
      localStorage.removeItem("immigrei_pending_profile");
      window.location.href = "/onboarding";
    } catch {
      setErro("Não conseguimos recomeçar agora. Tente de novo em instantes.");
    } finally {
      setZerando(false);
    }
  };

  return (
    <>
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Link
            label="Perfil"
            href="/perfil"
            labelIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
                <path
                  d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
          <UserButton.Link
            label="Editar informações de imigração"
            href="/onboarding/edit"
            labelIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 20H21M16.5 3.5C17.3284 2.67157 18.6716 2.67157 19.5 3.5C20.3284 4.32843 20.3284 5.67157 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
          <UserButton.Action
            label="Recomeçar jornada"
            onClick={() => setConfirmando(true)}
            labelIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 12C3 7.02944 7.02944 3 12 3C15.3 3 18.18 4.77 19.74 7.4M21 12C21 16.9706 16.9706 21 12 21C8.7 21 5.82 19.23 4.26 16.6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path d="M19.5 3V7.5H15M4.5 21V16.5H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </UserButton.MenuItems>
      </UserButton>

      {confirmando && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-ink/40 px-4 pb-6 sm:pb-4"
          onClick={() => !zerando && setConfirmando(false)}
        >
          <div
            className="w-full max-w-sm bg-cream-2 rounded-2xl border border-pine-tint p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-ink mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Recomeçar sua jornada?
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed mb-3">
              Isso apaga suas respostas do questionário e o caminho escolhido, para você
              traçar um novo do zero.
            </p>
            <p className="text-sm text-ink-soft leading-relaxed mb-5">
              <strong className="text-ink">Seus documentos ficam guardados</strong> no cofre — nada é perdido lá.
            </p>

            {erro && (
              <p className="text-sm mb-4" style={{ color: "var(--clay)" }}>{erro}</p>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={zerarOnboarding}
                disabled={zerando}
                className="w-full py-3 rounded-xl font-semibold text-sm text-cream transition-colors disabled:opacity-60"
                style={{ backgroundColor: "var(--clay)" }}
              >
                {zerando ? "Recomeçando..." : "Sim, recomeçar do zero"}
              </button>
              <button
                onClick={() => setConfirmando(false)}
                disabled={zerando}
                className="w-full py-3 rounded-xl font-semibold text-sm text-ink-soft border border-pine-tint hover:bg-cream transition-colors"
              >
                Manter meu caminho
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
