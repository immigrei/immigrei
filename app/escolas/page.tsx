"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

type Campus = {
  school_name: string;
  campus_name: string;
  accepts_f: boolean;
  accepts_m: boolean;
  city: string;
  state: string;
  campus_code: string;
};

type StateOption = { code: string; label: string; count: number };

type ApiResult = {
  campuses: Campus[];
  total: number;
  page: number;
  perPage: number;
  updated: string;
  states: StateOption[];
};

export default function EscolasPage() {
  const [q, setQ]           = useState("");
  const [state, setState]   = useState("");
  const [tipo, setTipo]     = useState<"" | "f" | "m">("");
  const [page, setPage]     = useState(1);
  const [data, setData]     = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter();
  const { isSignedIn } = useUser();
  const [chosenCode, setChosenCode] = useState<string | null>(null);
  const [savingCode, setSavingCode] = useState<string | null>(null);
  const [saveError, setSaveError]   = useState(false);

  // Signed-in users see their current pick highlighted.
  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setChosenCode(d.profile?.chosen_school?.campus_code ?? null))
      .catch(() => {});
  }, [isSignedIn]);

  async function chooseSchool(c: Campus) {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    setSaveError(false);
    setSavingCode(c.campus_code);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chosen_school: c }),
      });
      if (!res.ok) throw new Error();
      setChosenCode(c.campus_code);
    } catch {
      setSaveError(true);
    } finally {
      setSavingCode(null);
    }
  }

  const load = useCallback(async (query: string, st: string, tp: string, pg: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (st)    params.set("state", st);
    if (tp)    params.set("tipo", tp);
    params.set("page", String(pg));
    const res = await fetch(`/api/escolas?${params}`);
    setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(q, state, tipo, page), q ? 300 : 0);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, state, tipo, page, load]);

  function resetPage() {
    setPage(1);
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;

  return (
    <main className="min-h-screen bg-cream">
      <header className="flex items-center justify-between px-6 py-4 bg-cream-2 border-b border-pine-tint">
        <Link href="/dashboard" className="text-ink-faint text-sm hover:text-pine transition-colors">
          ← Dashboard
        </Link>
        <span className="text-lg font-semibold text-pine" style={{ fontFamily: "var(--font-display)" }}>
          Escolas Certificadas
        </span>
        <div className="w-20" />
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1
          className="text-3xl font-semibold text-ink mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Onde você pode estudar
        </h1>
        <p className="text-ink-soft mb-6 leading-relaxed">
          Todas as escolas abaixo são certificadas pelo governo americano (SEVP) e
          podem emitir o I-20 — o documento que você precisa para pedir o visto
          F-1 ou M-1. Busque por nome, cidade ou filtre por estado.
        </p>

        {/* Filters */}
        <div className="bg-cream-2 rounded-2xl border border-pine-tint p-4 mb-6 space-y-3">
          <input
            type="text"
            value={q}
            onChange={(e) => { setQ(e.target.value); resetPage(); }}
            placeholder="Nome da escola ou cidade…"
            className="w-full px-4 py-3 rounded-xl border border-pine-tint bg-white text-ink placeholder:text-ink-faint focus:outline-none focus:border-pine"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={state}
              onChange={(e) => { setState(e.target.value); resetPage(); }}
              className="flex-1 px-3 py-2.5 rounded-xl border border-pine-tint bg-white text-ink text-sm focus:outline-none focus:border-pine"
            >
              <option value="">Todos os estados</option>
              {data?.states.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.label} ({s.count})
                </option>
              ))}
            </select>
            <div className="flex rounded-xl border border-pine-tint overflow-hidden">
              {([
                ["", "Todas"],
                ["f", "F-1"],
                ["m", "M-1"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => { setTipo(value); resetPage(); }}
                  className={`flex-1 sm:flex-none px-4 py-2.5 text-sm font-bold transition-colors ${
                    tipo === value
                      ? "bg-pine text-white"
                      : "bg-white text-ink-soft hover:bg-pine-tint"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {saveError && (
          <div className="bg-amber-tint border border-amber/40 rounded-2xl px-4 py-3 mb-4">
            <p className="text-xs font-semibold text-amber-deep leading-relaxed">
              Não conseguimos salvar sua escolha agora. Tente de novo em instantes.
            </p>
          </div>
        )}

        {/* Results */}
        {loading && !data ? (
          <p className="text-ink-faint text-center py-12">Carregando escolas…</p>
        ) : data && data.total === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink-soft font-medium mb-1">Nenhuma escola encontrada.</p>
            <p className="text-ink-faint text-sm">
              Tente buscar só parte do nome, ou limpe os filtros.
            </p>
          </div>
        ) : data ? (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3">
              {data.total.toLocaleString("pt-BR")} {data.total === 1 ? "campus" : "campi"}
            </p>
            <div className={`space-y-3 ${loading ? "opacity-50" : ""}`}>
              {data.campuses.map((c) => (
                <div
                  key={c.campus_code}
                  className="bg-cream-2 rounded-2xl border border-pine-tint p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-ink leading-snug">{c.school_name}</p>
                      {c.campus_name !== c.school_name && (
                        <p className="text-sm text-ink-soft leading-snug">{c.campus_name}</p>
                      )}
                      <p className="text-sm text-ink-faint mt-1">
                        {c.city}, {c.state}
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {c.accepts_f && (
                        <span className="px-2 py-0.5 rounded-full bg-pine-tint text-pine text-xs font-bold">
                          F-1
                        </span>
                      )}
                      {c.accepts_m && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-tint text-amber-deep text-xs font-bold">
                          M-1
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    {chosenCode === c.campus_code ? (
                      <>
                        <span className="px-3 py-1.5 rounded-xl bg-pine-tint text-pine text-xs font-bold">
                          ✓ Sua escola
                        </span>
                        <Link
                          href="/painel"
                          className="text-xs font-bold text-pine underline hover:text-pine-deep transition-colors"
                        >
                          Ver na sua jornada →
                        </Link>
                      </>
                    ) : (
                      <button
                        onClick={() => chooseSchool(c)}
                        disabled={savingCode !== null}
                        className="px-3 py-1.5 rounded-xl border border-pine text-pine text-xs font-bold hover:bg-pine hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {savingCode === c.campus_code ? "Salvando…" : "Escolher esta escola"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-xl border border-pine-tint bg-cream-2 text-sm font-bold text-pine disabled:opacity-40 disabled:cursor-not-allowed hover:bg-pine-tint transition-colors"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-ink-faint">
                  {page} de {totalPages.toLocaleString("pt-BR")}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-xl border border-pine-tint bg-cream-2 text-sm font-bold text-pine disabled:opacity-40 disabled:cursor-not-allowed hover:bg-pine-tint transition-colors"
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        ) : null}

        {/* Source + disclaimer */}
        <div className="mt-8 bg-pine-tint rounded-2xl p-4">
          <p className="text-xs text-ink-soft leading-relaxed">
            Fonte: lista oficial de escolas certificadas pelo SEVP (Departamento de
            Segurança Interna dos EUA), atualizada em{" "}
            {data?.updated
              ? new Date(`${data.updated}T12:00:00`).toLocaleDateString("pt-BR")
              : "—"}
            . A certificação garante que a escola pode emitir o I-20, mas não é uma
            recomendação de qualidade. Antes de se matricular, pesquise a reputação
            da escola.{" "}
            <a
              href="https://studyinthestates.dhs.gov/school-search"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-pine font-medium"
            >
              Verificar na fonte oficial
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
