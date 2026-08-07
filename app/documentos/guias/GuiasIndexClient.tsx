"use client";

import { useState } from "react";
import Link from "next/link";
import type { Guia } from "./data";
import GuiasIndexNav from "./GuiasIndexNav";

const CATEGORIAS = ["Todos", "Documentos Iniciais", "Finanças & Crédito", "Mobilidade", "Saúde", "Empreendedorismo"] as const;

export default function GuiasIndexClient({ guias }: { guias: Guia[] }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState<(typeof CATEGORIAS)[number]>("Todos");

  const guiasFiltrados =
    categoriaAtiva === "Todos" ? guias : guias.filter((g) => g.categoria === categoriaAtiva);

  return (
    <main className="min-h-screen bg-cream px-6 py-8 pb-32" style={{ fontFamily: "var(--font-body)" }}>
      <div className="max-w-2xl mx-auto">
        <GuiasIndexNav />
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-widest text-pine mb-1" style={{ letterSpacing: "0.12em" }}>
            Depois do visto
          </p>
          <h1 className="text-3xl font-semibold text-ink mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Guias de Integração
          </h1>
          <p className="text-ink-soft text-sm leading-relaxed">
            SSN, carteira de motorista, crédito, plano de saúde — o que fazer depois que seu
            status sai, sem depender de vídeo de terceiros.
          </p>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                categoriaAtiva === cat
                  ? "bg-pine text-cream"
                  : "bg-pine-tint text-ink-soft hover:bg-pine-tint/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {guiasFiltrados.map((guia) => (
            <Link
              key={guia.id}
              href={`/documentos/guias/${guia.id}`}
              className="rounded-2xl border border-pine-tint bg-cream-2 p-4 block hover:border-pine transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-pine-tint text-pine">
                  {guia.categoria}
                </span>
                <span className="text-[10px] text-ink-faint">{guia.tempoLeitura}</span>
              </div>
              <p className="text-sm font-semibold text-ink">{guia.titulo}</p>
              <p className="text-xs text-ink-soft mt-1 leading-relaxed line-clamp-2">{guia.resumo}</p>
            </Link>
          ))}
        </div>

        <p className="text-xs text-ink-faint mt-8 leading-relaxed border-t border-pine-tint pt-5">
          Regras, taxas e prazos de governo podem mudar a qualquer momento, sem aviso prévio. Confirme sempre
          na fonte oficial antes de agir — isso não substitui aconselhamento jurídico ou financeiro individual.
        </p>

        <div className="mt-10 rounded-2xl bg-pine text-cream p-6 text-center">
          <p className="font-semibold mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Sua jornada não termina no visto.
          </p>
          <p className="text-sm text-cream/80 mb-4">
            Crie sua conta grátis e acompanhe seu processo com checklist, calculadora de custos e cofre de documentos.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-ink hover:bg-amber-deep transition-colors"
          >
            Criar conta grátis →
          </Link>
        </div>
      </div>
    </main>
  );
}
