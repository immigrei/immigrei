"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import PaywallGate from "@/app/components/PaywallGate";
import checklists from "../[vistoId]/data";

interface CostItemRow {
  id:          string;
  item_id:     string | null;
  titulo:      string | null;
  valor_usd:   number;
  selecionado: boolean;
}

interface FeeItem {
  id:          string;
  nome:        string;
  taxaUsd:     number;
  obrigatorio: boolean;
}

// Vistos que têm ao menos uma taxa oficial anotada em data.ts.
const VISTOS_COM_TAXAS = Object.values(checklists)
  .map((c) => ({
    vistoId: c.vistoId,
    codigo: c.codigo,
    nome: c.nome,
    itens: c.grupos.flatMap((g) => g.documentos).filter((d): d is typeof d & { taxaUsd: number } => d.taxaUsd !== undefined),
  }))
  .filter((c) => c.itens.length > 0);

function formatUsd(v: number) {
  return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function CustosClient({ hasAccess }: { hasAccess: boolean }) {
  const router = useRouter();
  const [profileVistoId, setProfileVistoId] = useState<string | null>(null);
  const [vistoId, setVistoId] = useState<string | null>(null);
  const [items, setItems] = useState<CostItemRow[] | null>(null);
  const [cambioBrl, setCambioBrl] = useState(5.6);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoValor, setNovoValor] = useState("");

  useEffect(() => {
    if (!hasAccess) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setProfileVistoId(d.profile?.visa_type ?? null))
      .catch(() => {});
    fetch("/api/user-costs")
      .then((r) => (r.ok ? r.json() : { items: [], cambioBrl: 5.6 }))
      .then((d) => {
        setItems(d.items ?? []);
        setCambioBrl(d.cambioBrl ?? 5.6);
      })
      .catch(() => setItems([]));
  }, [hasAccess]);

  // Default: o visto do perfil, se ele tiver taxas mapeadas; senão o primeiro disponível.
  useEffect(() => {
    if (vistoId !== null) return;
    if (profileVistoId && VISTOS_COM_TAXAS.some((v) => v.vistoId === profileVistoId)) {
      setVistoId(profileVistoId);
    } else if (VISTOS_COM_TAXAS.length > 0) {
      setVistoId(VISTOS_COM_TAXAS[0].vistoId);
    }
  }, [profileVistoId, vistoId]);

  const vistoAtual = VISTOS_COM_TAXAS.find((v) => v.vistoId === vistoId);

  const itemsByKey = useMemo(() => {
    const map = new Map<string, CostItemRow>();
    for (const row of items ?? []) {
      if (row.item_id) map.set(row.item_id, row);
    }
    return map;
  }, [items]);

  const manuais = (items ?? []).filter((r) => r.item_id === null);

  const feeItemState = (fee: FeeItem) => {
    const saved = itemsByKey.get(fee.id);
    return {
      selecionado: saved?.selecionado ?? fee.obrigatorio,
      valorUsd: saved?.valor_usd ?? fee.taxaUsd,
    };
  };

  const toggleFee = async (fee: FeeItem) => {
    const atual = feeItemState(fee);
    const novoSelecionado = !atual.selecionado;
    // Otimista: atualiza local antes da resposta da API.
    setItems((prev) => {
      const withoutThis = (prev ?? []).filter((r) => r.item_id !== fee.id);
      return [
        ...withoutThis,
        { id: `local-${fee.id}`, item_id: fee.id, titulo: null, valor_usd: atual.valorUsd, selecionado: novoSelecionado },
      ];
    });
    const res = await fetch("/api/user-costs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: fee.id, selecionado: novoSelecionado, valorUsd: atual.valorUsd }),
    });
    if (res.ok) {
      const { item } = await res.json();
      setItems((prev) => (prev ?? []).map((r) => (r.item_id === fee.id ? item : r)));
    }
  };

  const adicionarManual = async () => {
    const valor = Number(novoValor.replace(",", "."));
    if (!novoTitulo.trim() || !valor || valor <= 0) return;
    const res = await fetch("/api/user-costs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: novoTitulo.trim(), valorUsd: valor }),
    });
    if (!res.ok) return;
    const { item } = await res.json();
    setItems((prev) => [...(prev ?? []), item]);
    setNovoTitulo("");
    setNovoValor("");
  };

  const removerManual = async (id: string) => {
    setItems((prev) => (prev ?? []).filter((r) => r.id !== id));
    await fetch("/api/user-costs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  };

  const salvarCambio = async (valor: number) => {
    setCambioBrl(valor);
    await fetch("/api/user-costs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cambioBrl: valor }),
    }).catch(() => {});
  };

  const feesSelecionadas = (vistoAtual?.itens ?? []).filter((f) => feeItemState(f as FeeItem).selecionado);
  const totalTaxasUsd = feesSelecionadas.reduce((sum, f) => sum + feeItemState(f as FeeItem).valorUsd, 0);
  const totalManuaisUsd = manuais.filter((m) => m.selecionado).reduce((sum, m) => sum + m.valor_usd, 0);
  const totalUsd = totalTaxasUsd + totalManuaisUsd;
  const totalBrl = Math.round(totalUsd * cambioBrl);

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
            Planejamento financeiro
          </p>
          <h1 className="text-3xl font-semibold text-ink mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Calculadora de Custos
          </h1>
          <p className="text-ink-soft text-sm leading-relaxed">
            Taxas oficiais do seu visto, mais o que você quiser adicionar — tradução, advogado,
            exames. Fica salvo, então você não precisa recalcular toda vez.
          </p>
        </div>

        {!hasAccess && (
          <PaywallGate
            titulo="Planeje seus custos com clareza"
            descricao="Taxas oficiais do USCIS pré-carregadas por visto, mais os seus custos extras — tudo num só total, em USD e BRL. Assine para começar."
            previewClassName="max-h-64"
          >
            <div className="rounded-2xl border border-pine-tint bg-cream-2 p-5 text-sm text-ink-soft">
              Ex: I-539 (US$370) + tradução juramentada (R$ 450) + exame médico...
            </div>
          </PaywallGate>
        )}

        {hasAccess && items === null && (
          <div className="flex items-center gap-2 text-ink-faint text-sm mb-6">
            <span className="w-4 h-4 rounded-full border-2 border-pine-tint border-t-pine animate-spin inline-block" />
            Carregando...
          </div>
        )}

        {hasAccess && items !== null && (
          <>
            {VISTOS_COM_TAXAS.length > 1 && (
              <div className="mb-6">
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-ink-faint">
                  Visto
                </label>
                <select
                  value={vistoId ?? ""}
                  onChange={(e) => setVistoId(e.target.value)}
                  className="w-full rounded-lg border border-pine-tint bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-pine"
                >
                  {VISTOS_COM_TAXAS.map((v) => (
                    <option key={v.vistoId} value={v.vistoId}>
                      {v.codigo} · {v.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Resumo */}
            <div className="mb-6 rounded-2xl bg-pine p-5 text-cream">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-pine-tint">Total estimado</span>
                <div className="flex items-center gap-1.5 rounded-lg bg-pine-deep px-2.5 py-1 text-xs">
                  <span>Câmbio R$</span>
                  <input
                    type="number"
                    step="0.10"
                    value={cambioBrl}
                    onChange={(e) => salvarCambio(Number(e.target.value))}
                    className="w-14 bg-transparent text-center font-bold text-amber focus:outline-none"
                  />
                </div>
              </div>
              <p className="text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                US$ {formatUsd(totalUsd)}
              </p>
              <p className="text-sm text-pine-tint">≈ R$ {totalBrl.toLocaleString("pt-BR")}</p>
            </div>

            {/* Taxas oficiais do visto */}
            {vistoAtual && (
              <div className="mb-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-faint">
                  Taxas oficiais — {vistoAtual.codigo}
                </p>
                <div className="flex flex-col gap-2">
                  {vistoAtual.itens.map((fee) => {
                    const state = feeItemState(fee as FeeItem);
                    return (
                      <div
                        key={fee.id}
                        onClick={() => toggleFee(fee as FeeItem)}
                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3 transition-colors ${
                          state.selecionado ? "border-pine bg-pine-tint" : "border-pine-tint bg-cream-2 opacity-60"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border ${
                              state.selecionado ? "border-pine bg-pine text-cream" : "border-ink-faint bg-white"
                            }`}
                          >
                            {state.selecionado && "✓"}
                          </div>
                          <p className="truncate text-sm font-semibold text-ink">{fee.nome}</p>
                        </div>
                        <span className="flex-shrink-0 text-sm font-bold text-pine">
                          US$ {formatUsd(state.valorUsd)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custos extras manuais */}
            <div className="mb-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-faint">
                Custos extras — tradução, advogado, exames...
              </p>
              <div className="flex flex-col gap-2">
                {manuais.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 rounded-2xl border border-pine-tint bg-cream-2 p-3">
                    <p className="truncate text-sm font-semibold text-ink">{m.titulo}</p>
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <span className="text-sm font-bold text-pine">US$ {formatUsd(m.valor_usd)}</span>
                      <button
                        onClick={() => removerManual(m.id)}
                        className="text-xs font-semibold text-clay hover:underline underline-offset-2"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  placeholder="Ex: Tradução juramentada"
                  className="flex-1 rounded-lg border border-pine-tint bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-pine"
                />
                <input
                  type="number"
                  value={novoValor}
                  onChange={(e) => setNovoValor(e.target.value)}
                  placeholder="US$"
                  className="w-24 rounded-lg border border-pine-tint bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-pine"
                />
                <button
                  onClick={adicionarManual}
                  className="flex-shrink-0 rounded-lg bg-amber px-4 py-2 text-xs font-bold text-ink hover:bg-amber-deep"
                >
                  + Add
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
