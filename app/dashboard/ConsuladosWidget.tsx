"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ConsuladoEvent = {
  id:          string;
  consulado:   "miami" | "nyc";
  titulo:      string;
  data_inicio: string | null;
  cidade:      string | null;
  tipo:        string;
};

const CONSULADO_LABEL: Record<string, string> = {
  miami: "Miami",
  nyc:   "Nova York",
};

export default function ConsuladosWidget() {
  const [events, setEvents]   = useState<ConsuladoEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/consulados/events?tipo=itinerante")
      .then(r => r.json())
      .then(d => setEvents((d.events ?? []).slice(0, 3)))
      .finally(() => setLoading(false));
  }, []);

  function formatDate(iso: string) {
    const [y, m, d] = iso.split("-");
    const months = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
    return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
  }

  return (
    <div className="bg-cream-2 rounded-2xl border border-pine-tint overflow-hidden mb-5">
      <div className="px-6 py-4 border-b border-pine-tint flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">
          🇧🇷 Consulados Brasileiros
        </p>
        <Link
          href="/consulados"
          className="text-xs font-bold text-pine hover:text-pine-deep transition-colors"
        >
          Ver tudo →
        </Link>
      </div>

      {loading ? (
        <div className="px-6 py-5 space-y-3 animate-pulse">
          {[1,2].map(i => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-pine-tint flex-shrink-0" />
              <div className="flex-1">
                <div className="h-3 bg-pine-tint rounded w-2/3 mb-1.5" />
                <div className="h-2.5 bg-pine-tint rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="px-6 py-5">
          <p className="text-sm text-ink-soft mb-1">Nenhum atendimento próximo.</p>
          <Link href="/consulados" className="text-xs text-pine font-bold hover:text-pine-deep">
            Ver consulados e ativar alertas →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-pine-tint">
          {events.map(e => (
            <div key={e.id} className="px-6 py-3.5 flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${e.consulado === "miami" ? "bg-pine" : "bg-amber"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink leading-snug truncate">{e.titulo}</p>
                <p className="text-xs text-ink-faint mt-0.5">
                  {CONSULADO_LABEL[e.consulado]}
                  {e.cidade && e.cidade !== (e.consulado === "miami" ? "Miami" : "New York") && ` · ${e.cidade}`}
                  {e.data_inicio && ` · ${formatDate(e.data_inicio)}`}
                </p>
              </div>
            </div>
          ))}
          <div className="px-6 py-3">
            <Link href="/consulados" className="text-xs font-bold text-pine hover:text-pine-deep transition-colors">
              Ver todos os atendimentos →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
