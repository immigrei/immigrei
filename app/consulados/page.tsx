"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ConsuladoEvent = {
  id:          string;
  consulado:   "miami" | "nyc";
  titulo:      string;
  descricao:   string;
  data_inicio: string | null;
  data_fim:    string | null;
  cidade:      string | null;
  estado:      string | null;
  servicos:    string[];
  url_fonte:   string;
  tipo:        string;
};

const CONSULADO_INFO = {
  miami: {
    nome:     "Consulado-Geral de Miami",
    cidade:   "Miami, FL",
    endereco: "80 SW 8th St, Suite 2600, Miami, FL 33130",
    telefone: "+1 (305) 285-6200",
    site:     "https://www.cgmiami.gov.br",
    horario:  "Seg–Sex, 09h–12h (atendimento ao público)",
    cor:      "pine",
  },
  nyc: {
    nome:     "Consulado-Geral de Nova York",
    cidade:   "Nova York, NY",
    endereco: "1185 Avenue of the Americas, 21st Floor, New York, NY 10036",
    telefone: "+1 (917) 777-7777",
    site:     "https://novayork.itamaraty.gov.br",
    horario:  "Seg–Sex, 09h–12h (atendimento ao público)",
    cor:      "amber",
  },
} as const;

type Tab = "miami" | "nyc" | "todos";

export default function ConsuladosPage() {
  const [tab, setTab]         = useState<Tab>("todos");
  const [events, setEvents]   = useState<ConsuladoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [subs, setSubs]       = useState<string[]>([]);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    loadEvents();
    loadSubs();
  }, []);

  async function loadEvents() {
    setLoading(true);
    const res  = await fetch("/api/consulados/events");
    const data = await res.json();
    setEvents(data.events ?? []);
    setLoading(false);
  }

  async function loadSubs() {
    const res  = await fetch("/api/consulados/subscribe");
    const data = await res.json();
    setSubs(data.consulados ?? []);
  }

  async function toggleSub(consulado: string) {
    setSaving(true);
    const next = subs.includes(consulado)
      ? subs.filter(s => s !== consulado)
      : [...subs, consulado];

    await fetch("/api/consulados/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consulados: next }),
    });
    setSubs(next);
    setSaving(false);
  }

  const filtered = tab === "todos" ? events : events.filter(e => e.consulado === tab);
  const itinerantes = filtered.filter(e => e.tipo === "itinerante");
  const outros      = filtered.filter(e => e.tipo !== "itinerante");

  return (
    <main className="min-h-screen bg-cream">
      <header className="flex items-center justify-between px-6 py-4 bg-cream-2 border-b border-pine-tint">
        <Link href="/dashboard" className="text-ink-faint text-sm hover:text-pine transition-colors">
          ← Dashboard
        </Link>
        <span className="text-lg font-semibold text-pine" style={{ fontFamily: "var(--font-display)" }}>
          Consulados Brasileiros
        </span>
        <div className="w-20" />
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Consulado cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(["miami", "nyc"] as const).map(id => {
            const info    = CONSULADO_INFO[id];
            const isSubbed = subs.includes(id);
            return (
              <div key={id} className="bg-cream-2 rounded-2xl border border-pine-tint p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-1">
                      {id === "miami" ? "Florida" : "Nova York"}
                    </p>
                    <p className="text-sm font-bold text-ink leading-tight">{info.nome}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${id === "miami" ? "bg-pine" : "bg-amber"}`} />
                </div>
                <p className="text-xs text-ink-faint mb-1">{info.horario}</p>
                <p className="text-xs text-ink-faint mb-3">{info.endereco}</p>
                <div className="flex gap-2">
                  <a
                    href={info.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center text-xs font-bold text-pine border border-pine-tint rounded-xl py-2 hover:bg-pine-tint transition-colors"
                  >
                    Site oficial
                  </a>
                  <button
                    onClick={() => toggleSub(id)}
                    disabled={saving}
                    className={`flex-1 text-xs font-bold rounded-xl py-2 transition-colors disabled:opacity-40 ${
                      isSubbed
                        ? "bg-pine text-cream-2 hover:bg-pine-deep"
                        : "border border-pine-tint text-ink-soft hover:bg-pine-tint"
                    }`}
                  >
                    {isSubbed ? "✓ Alertas on" : "Alertas"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-pine-tint rounded-xl p-1 mb-5">
          {([["todos", "Todos"], ["miami", "Miami"], ["nyc", "Nova York"]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === id
                  ? "bg-cream-2 text-pine shadow-sm"
                  : "text-ink-faint hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-cream-2 rounded-2xl border border-pine-tint p-5 animate-pulse">
                <div className="h-3 bg-pine-tint rounded w-1/4 mb-3" />
                <div className="h-4 bg-pine-tint rounded w-3/4 mb-2" />
                <div className="h-3 bg-pine-tint rounded w-full" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {itinerantes.length > 0 && (
              <section className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3">
                  Atendimentos Itinerantes
                </p>
                <div className="space-y-3">
                  {itinerantes.map(e => <EventCard key={e.id} event={e} />)}
                </div>
              </section>
            )}
            {outros.length > 0 && (
              <section>
                <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3">
                  Avisos e Informações
                </p>
                <div className="space-y-3">
                  {outros.map(e => <EventCard key={e.id} event={e} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function EventCard({ event }: { event: ConsuladoEvent }) {
  const info  = CONSULADO_INFO[event.consulado];
  const local = [event.cidade, event.estado].filter(Boolean).join(", ");

  function formatDate(iso: string) {
    const [y, m, d] = iso.split("-");
    const months = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
    return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
  }

  return (
    <div className="bg-cream-2 rounded-2xl border border-pine-tint overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-1">
              {info.nome}
            </p>
            <p className="text-base font-bold text-ink leading-snug">{event.titulo}</p>
          </div>
          {event.tipo === "itinerante" && (
            <span className="flex-shrink-0 bg-amber-tint text-amber-deep text-xs font-bold px-2.5 py-1 rounded-full border border-amber/30">
              Itinerante
            </span>
          )}
        </div>

        {(event.data_inicio || local) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {event.data_inicio && (
              <span className="bg-pine-tint text-pine text-xs font-bold px-2.5 py-1 rounded-full">
                📅 {formatDate(event.data_inicio)}
                {event.data_fim && event.data_fim !== event.data_inicio
                  ? ` – ${formatDate(event.data_fim)}`
                  : ""}
              </span>
            )}
            {local && (
              <span className="bg-pine-tint text-pine text-xs font-bold px-2.5 py-1 rounded-full">
                📍 {local}
              </span>
            )}
          </div>
        )}

        <p className="text-sm text-ink-soft leading-relaxed mb-3 line-clamp-3">
          {event.descricao}
        </p>

        {event.servicos.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {event.servicos.map(s => (
              <span key={s} className="text-xs text-ink-soft bg-cream px-2 py-0.5 rounded-full border border-pine-tint">
                {s}
              </span>
            ))}
          </div>
        )}

        <a
          href={event.url_fonte}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-pine hover:text-pine-deep transition-colors"
        >
          Ver no site oficial →
        </a>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-cream-2 rounded-2xl border border-pine-tint p-8 text-center">
      <p className="text-2xl mb-3">🇧🇷</p>
      <p className="text-ink font-semibold mb-1">Nenhum atendimento encontrado</p>
      <p className="text-ink-soft text-sm leading-relaxed">
        Os dados são atualizados mensalmente. Ative os alertas para receber um email quando novos atendimentos forem publicados.
      </p>
    </div>
  );
}
