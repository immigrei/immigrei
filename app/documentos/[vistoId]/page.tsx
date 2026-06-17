"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import AppShell from "@/app/components/AppShell";
import checklists, { type Agencia } from "./data";

const agenciaBadge: Record<Agencia, { label: string; color: string }> = {
  USCIS: { label: "USCIS", color: "bg-pine-tint text-pine" },
  NVC:   { label: "NVC",   color: "bg-amber-tint text-amber-deep" },
  DOS:   { label: "Consulado", color: "bg-ink/10 text-ink-soft" },
  DOL:   { label: "DOL",   color: "bg-pine-tint text-pine-deep" },
  EOIR:  { label: "EOIR",  color: "bg-clay/10 text-clay" },
};

export default function DocumentosVistoPage() {
  const params = useParams();
  const router = useRouter();
  const vistoId = params.vistoId as string;
  const checklist = checklists[vistoId];

  const allDocIds = checklist?.grupos.flatMap((g) => g.documentos.map((d) => d.id)) ?? [];
  const [marcados, setMarcados] = useState<Set<string>>(new Set());

  if (!checklist) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-6 py-10 text-center">
          <p className="text-ink-soft">Visto não encontrado.</p>
          <button onClick={() => router.push("/vistos")} className="mt-4 text-pine underline text-sm">
            Voltar para vistos
          </button>
        </div>
      </AppShell>
    );
  }

  const toggle = (id: string) => {
    setMarcados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalObrigatorios = allDocIds.filter((id) => {
    const doc = checklist.grupos.flatMap((g) => g.documentos).find((d) => d.id === id);
    return doc?.obrigatorio;
  }).length;

  const marcadosObrigatorios = [...marcados].filter((id) => {
    const doc = checklist.grupos.flatMap((g) => g.documentos).find((d) => d.id === id);
    return doc?.obrigatorio;
  }).length;

  const progresso = totalObrigatorios > 0 ? Math.round((marcadosObrigatorios / totalObrigatorios) * 100) : 0;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Back */}
        <button
          onClick={() => router.push("/vistos")}
          className="flex items-center gap-1.5 text-ink-soft text-sm mb-6 hover:text-pine transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Voltar para vistos
        </button>

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-pine mb-1" style={{ letterSpacing: "0.12em" }}>
            {checklist.codigo}
          </p>
          <h1 className="text-3xl font-semibold text-ink mb-3" style={{ fontFamily: "var(--font-display)" }}>
            {checklist.nome}
          </h1>
          <p className="text-ink-soft text-sm leading-relaxed">{checklist.intro}</p>
        </div>

        {/* Progresso */}
        <div className="bg-cream-2 rounded-2xl border border-pine-tint p-5 mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">Seu progresso</p>
            <span className="text-sm font-semibold text-pine">{marcadosObrigatorios}/{totalObrigatorios} obrigatórios</span>
          </div>
          <div className="h-2 bg-pine-tint rounded-full overflow-hidden">
            <div
              className="h-full bg-pine rounded-full transition-all duration-300"
              style={{ width: `${progresso}%` }}
            />
          </div>
          {progresso === 100 && (
            <p className="text-sage text-xs font-semibold mt-2">
              ✓ Você tem todos os documentos obrigatórios!
            </p>
          )}
        </div>

        {/* Grupos */}
        {checklist.grupos.map((grupo) => (
          <div key={grupo.titulo} className="mb-8">
            <div className="mb-4">
              <h2 className="text-base font-bold text-ink" style={{ fontFamily: "var(--font-sans)" }}>
                {grupo.titulo}
              </h2>
              <p className="text-xs text-ink-faint mt-0.5">{grupo.descricao}</p>
            </div>

            <div className="flex flex-col gap-3">
              {grupo.documentos.map((doc) => {
                const checked = marcados.has(doc.id);
                const badge = agenciaBadge[doc.agencia];
                return (
                  <button
                    key={doc.id}
                    onClick={() => toggle(doc.id)}
                    className={[
                      "w-full text-left rounded-2xl border p-4 transition-all duration-150",
                      checked
                        ? "bg-pine-tint border-pine/30"
                        : "bg-cream-2 border-pine-tint hover:border-pine/20",
                    ].join(" ")}
                  >
                    <div className="flex gap-3 items-start">
                      {/* Checkbox */}
                      <div className={[
                        "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all",
                        checked ? "bg-pine border-pine" : "border-ink-faint",
                      ].join(" ")}>
                        {checked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className={[
                            "text-sm font-semibold leading-snug",
                            checked ? "text-pine line-through opacity-60" : "text-ink",
                          ].join(" ")}>
                            {doc.nome}
                          </p>
                        </div>

                        <p className="text-xs text-ink-soft leading-relaxed mb-2">{doc.descricao}</p>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${badge.color}`}>
                            {badge.label}
                          </span>
                          {doc.formulario && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-ink/10 text-ink-soft">
                              {doc.formulario}
                            </span>
                          )}
                          {!doc.obrigatorio && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-tint text-amber-deep">
                              Recomendado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Disclaimer */}
        <div className="bg-amber-tint border border-amber/30 rounded-2xl px-5 py-4 mt-2 mb-8">
          <p className="text-xs text-amber-deep leading-relaxed">
            <span className="font-bold">Atenção:</span> Esta lista é baseada nos requisitos gerais do USCIS, NVC e DOS. Cada caso tem particularidades. Consulte um advogado de imigração antes de submeter qualquer petição.
          </p>
        </div>

      </div>
    </AppShell>
  );
}
