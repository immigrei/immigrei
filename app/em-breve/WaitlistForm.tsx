"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    const shareText = encodeURIComponent(
      "Achei um app que vai mostrar a jornada de imigração nos EUA inteira em português — feito por brasileiros. Entra na lista de espera: https://immigrei.com",
    );
    return (
      <div className="flex flex-col items-center gap-4 max-w-md w-full">
        <div className="bg-pine-tint text-pine font-semibold text-base px-6 py-4 rounded-xl w-full text-center">
          Você está na lista! Avisaremos você em primeira mão. 💚
        </div>
        <p className="text-ink-soft text-sm text-center">
          Conhece alguém navegando o processo de imigração?
        </p>
        <a
          href={`https://wa.me/?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-sage hover:bg-pine text-white font-semibold text-base px-6 py-3.5 rounded-xl transition-colors w-full text-center"
        >
          Compartilhar no WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Seu melhor e-mail"
        className="flex-1 bg-cream-2 border border-pine-tint text-ink placeholder-ink-faint px-5 py-4 rounded-xl text-base focus:outline-none focus:border-pine transition-colors"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-amber hover:bg-amber-deep disabled:opacity-60 text-white font-semibold text-base px-7 py-4 rounded-xl transition-colors whitespace-nowrap"
      >
        {status === "sending" ? "Enviando..." : "Quero ser avisado"}
      </button>
      {status === "error" && (
        <p className="text-clay text-sm sm:col-span-2">
          Algo deu errado. Tente de novo em instantes.
        </p>
      )}
    </form>
  );
}
