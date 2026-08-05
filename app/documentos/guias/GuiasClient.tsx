"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import PaywallGate from "@/app/components/PaywallGate";
import guias from "./data";

const CATEGORIAS = ["Todos", "Documentos Iniciais", "Finanças & Crédito", "Mobilidade", "Saúde", "Empreendedorismo"] as const;

export default function GuiasClient({ hasAccess }: { hasAccess: boolean }) {
  const router = useRouter();
  const [categoriaAtiva, setCategoriaAtiva] = useState<(typeof CATEGORIAS)[number]>("Todos");
  const [abertoId, setAbertoId] = useState<string | null>(null);

  const guiasFiltrados =
    categoriaAtiva === "Todos" ? guias : guias.filter((g) => g.categoria === categoriaAtiva);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.push("/documentos");
          }}
          className="flex items-center gap-1.5 text-ink-soft text-sm mb-6 hover:text-pine transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Voltar
        </button>

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

        {!hasAccess && (
          <PaywallGate
            titulo="Comece a vida nos EUA com clareza"
            descricao="Guias práticos e revisados para os primeiros passos depois do visto: SSN, carteira de motorista, crédito e plano de saúde. Assine para ler na íntegra."
            previewClassName="max-h-64"
          >
            <div className="rounded-2xl border border-pine-tint bg-cream-2 p-5 text-sm text-ink-soft">
              {guias[0].titulo} — {guias[0].resumo}
            </div>
          </PaywallGate>
        )}

        {hasAccess && (
          <>
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
              {guiasFiltrados.map((guia) => {
                const aberto = abertoId === guia.id;
                return (
                  <div key={guia.id} className="rounded-2xl border border-pine-tint bg-cream-2 overflow-hidden">
                    <button
                      onClick={() => setAbertoId(aberto ? null : guia.id)}
                      className="w-full text-left p-4 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-pine-tint text-pine">
                            {guia.categoria}
                          </span>
                          <span className="text-[10px] text-ink-faint">{guia.tempoLeitura}</span>
                        </div>
                        <p className="text-sm font-semibold text-ink">{guia.titulo}</p>
                        {!aberto && (
                          <p className="text-xs text-ink-soft mt-1 leading-relaxed line-clamp-2">{guia.resumo}</p>
                        )}
                      </div>
                      <svg
                        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"
                        className={`flex-shrink-0 mt-1 text-ink-faint transition-transform ${aberto ? "rotate-180" : ""}`}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>

                    {aberto && (
                      <div className="px-4 pb-5 pt-1">
                        <p className="text-sm text-ink-soft leading-relaxed mb-4">{guia.resumo}</p>

                        <p className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-2">Passo a passo</p>
                        <ol className="flex flex-col gap-2.5 mb-4">
                          {guia.passos.map((passo, i) => (
                            <li key={i} className="flex gap-2.5 text-sm text-ink">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-pine text-cream text-[11px] font-bold flex items-center justify-center mt-0.5">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed">{passo}</span>
                            </li>
                          ))}
                        </ol>

                        <div className="rounded-xl bg-amber-tint border-l-4 border-amber p-3 mb-4">
                          <p className="text-xs text-ink"><strong className="text-amber-deep">Dica:</strong> {guia.dicaChave}</p>
                        </div>

                        {guia.infoExtra && (
                          <div className="rounded-xl border border-pine-tint bg-pine-tint/40 p-3 mb-4">
                            <p className="text-xs font-bold text-pine mb-1">{guia.infoExtra.titulo}</p>
                            <p className="text-xs text-ink-soft leading-relaxed mb-2">{guia.infoExtra.texto}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {guia.infoExtra.itens.map((item) => (
                                <span key={item} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white text-pine border border-pine-tint">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <a
                          href={guia.fonteOficial.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-pine hover:underline underline-offset-2"
                        >
                          Fonte oficial: {guia.fonteOficial.nome} →
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-ink-faint mt-6 leading-relaxed border-t border-pine-tint pt-5">
              Regras, taxas e prazos de governo podem mudar a qualquer momento, sem aviso prévio — o que está
              aqui é a informação disponível no momento da última revisão e pode ficar desatualizado. Processos
              administrativos também variam por estado e por status migratório: confirme sempre na fonte oficial
              antes de agir. A Immigrei não se responsabiliza por decisões tomadas com base neste conteúdo; isso
              não substitui aconselhamento jurídico ou financeiro individual.
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}
