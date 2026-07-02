"use client";

import { useState } from "react";

const MOMENTOS = [
  { value: "", label: "Qual seu momento? (opcional)" },
  { value: "turista", label: "Estou nos EUA como turista/visitante" },
  { value: "estudante", label: "Sou estudante (F-1/M-1) ou quero ser" },
  { value: "trabalho", label: "Visto de trabalho (em uso ou em busca)" },
  { value: "green_card", label: "Green card em andamento" },
  { value: "no_brasil", label: "Ainda no Brasil, planejando" },
  { value: "outro", label: "Outro momento" },
];

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [momento, setMomento] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, momento: momento || undefined }),
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
    <form onSubmit={submit} className="flex flex-col gap-3 w-full max-w-md">
      <div className="flex flex-col sm:flex-row gap-3">
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
      </div>
      <select
        value={momento}
        onChange={(e) => setMomento(e.target.value)}
        aria-label="Qual seu momento na jornada? (opcional)"
        className={`bg-cream-2 border border-pine-tint px-5 py-3.5 rounded-xl text-base focus:outline-none focus:border-pine transition-colors ${momento ? "text-ink" : "text-ink-faint"}`}
      >
        {MOMENTOS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      {status === "error" && (
        <p className="text-clay text-sm">
          Algo deu errado. Tente de novo em instantes.
        </p>
      )}
    </form>
  );
}
