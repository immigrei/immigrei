"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/app/components/AppShell";
import { vistosEstudo, vistosNegocios } from "@/lib/vistosCatalog";
import {
  AUTHOR_STATES,
  BODY_MAX,
  BODY_MIN,
  MAX_VISAS_PER_REPORT,
  TITLE_MAX,
  findContactInfo,
} from "@/lib/community";

interface Report {
  id: string;
  title: string;
  body: string;
  author: string;
  isAnonymous: boolean;
  authorState: string;
  status: "pending" | "approved" | "rejected";
  isMine: boolean;
  createdAt: string;
  visas: string[];
  helpedCount: number;
  helpedByMe: boolean;
}

const CATALOGO = [...vistosEstudo, ...vistosNegocios];
const CODIGO_POR_ID = new Map(CATALOGO.map((v) => [v.id, v.codigo]));

function tempoRelativo(iso: string): string {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "há 1 dia";
  if (dias < 7) return `há ${dias} dias`;
  const semanas = Math.floor(dias / 7);
  if (semanas === 1) return "há 1 semana";
  if (dias < 30) return `há ${semanas} semanas`;
  const meses = Math.floor(dias / 30);
  return meses === 1 ? "há 1 mês" : `há ${meses} meses`;
}

export default function ComunidadePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/community")
      .then((r) => r.json())
      .then((d) => {
        setReports(d.reports ?? []);
        setPlan(d.plan ?? "free");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const assinante = plan !== "free";
  const visiveis = filtro ? reports.filter((r) => r.visas.includes(filtro)) : reports;
  const meusPendentes = visiveis.filter((r) => r.isMine && r.status !== "approved");
  const aprovados = visiveis.filter((r) => r.status === "approved");

  // Chips only for visas that actually have reports (plus the active filter).
  const filtros = useMemo(() => {
    const usados = new Set(reports.flatMap((r) => r.visas));
    return CATALOGO.filter((v) => usados.has(v.id) || v.id === filtro);
  }, [reports, filtro]);

  function onPublished(novo: Report) {
    setReports((prev) => [novo, ...prev]);
  }

  async function toggleHelped(id: string) {
    if (!assinante) return;
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, helpedByMe: !r.helpedByMe, helpedCount: r.helpedCount + (r.helpedByMe ? -1 : 1) }
          : r
      )
    );
    const res = await fetch("/api/community/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: id }),
    });
    if (!res.ok) {
      // Revert the optimistic update.
      setReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, helpedByMe: !r.helpedByMe, helpedCount: r.helpedCount + (r.helpedByMe ? -1 : 1) }
            : r
        )
      );
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3 mb-1">
            <p className="text-xs font-bold uppercase tracking-widest text-pine" style={{ letterSpacing: "0.12em" }}>
              Comunidade
            </p>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide bg-amber text-pine-deep px-2.5 py-1 rounded-full">
              <LockIcon /> Membros
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-ink mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Histórias de quem já viveu
          </h1>
          <p className="text-ink-soft text-sm leading-relaxed">
            Relatos reais escritos pela comunidade — com o que ninguém conta antes.
            Não substituem aconselhamento jurídico.
          </p>
        </div>

        {filtros.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
            <FiltroChip label="Todos" ativo={filtro === null} onClick={() => setFiltro(null)} />
            {filtros.map((v) => (
              <FiltroChip
                key={v.id}
                label={v.codigo}
                ativo={filtro === v.id}
                onClick={() => setFiltro(filtro === v.id ? null : v.id)}
              />
            ))}
          </div>
        )}

        {assinante ? (
          <Composer onPublished={onPublished} />
        ) : (
          !loading && (
            <div className="rounded-2xl bg-pine p-5 mb-6">
              <h2 className="text-lg font-semibold text-cream-2 mb-1" style={{ fontFamily: "var(--font-display)" }}>
                Quer contar a sua história?
              </h2>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(244,238,226,0.85)" }}>
                Publicar relatos e reagir às histórias é exclusivo para assinantes.
                Assinando, você também apoia a comunidade a continuar sem anúncios.
              </p>
              <Link
                href="/planos"
                className="block w-full text-center bg-amber hover:bg-amber-deep text-ink font-bold rounded-xl px-4 py-3 text-sm transition-colors"
              >
                Conhecer os planos
              </Link>
            </div>
          )
        )}

        {loading && (
          <div className="flex items-center gap-2 text-ink-faint text-sm mt-2">
            <span className="w-4 h-4 rounded-full border-2 border-pine-tint border-t-pine animate-spin inline-block" />
            Carregando relatos...
          </div>
        )}

        {meusPendentes.map((r) => (
          <PendingCard key={r.id} report={r} />
        ))}

        {!loading && aprovados.length === 0 && (
          <div className="rounded-2xl border border-pine-tint bg-cream-2 p-6 text-center mt-2">
            <p className="text-sm font-semibold text-ink mb-1">
              {filtro ? "Ainda não há relatos sobre este visto." : "Os primeiros relatos estão chegando."}
            </p>
            <p className="text-xs text-ink-soft leading-relaxed">
              {assinante
                ? "Sua história pode ser o mapa de outra pessoa — que tal ser quem começa?"
                : "Em breve este espaço estará cheio de histórias reais da comunidade."}
            </p>
          </div>
        )}

        {aprovados.length > 0 && (
          <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3 mt-2" style={{ letterSpacing: "0.1em" }}>
            Relatos da comunidade
          </p>
        )}

        <div className="flex flex-col gap-4">
          {aprovados.map((r) => (
            <ReportCard key={r.id} report={r} assinante={assinante} onHelped={() => toggleHelped(r.id)} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function FiltroChip({ label, ativo, onClick }: { label: string; ativo: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex-shrink-0 text-xs font-bold px-3.5 py-1.5 rounded-full border transition-colors",
        ativo
          ? "bg-pine border-pine text-cream-2"
          : "bg-cream-2 border-pine-tint text-pine hover:border-pine/40",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function PendingCard({ report }: { report: Report }) {
  const rejeitado = report.status === "rejected";
  return (
    <article
      className={[
        "rounded-2xl border border-dashed p-4 mb-4",
        rejeitado ? "border-clay/50 bg-clay/5" : "border-amber/60 bg-amber-tint/50",
      ].join(" ")}
    >
      <span
        className={[
          "text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full",
          rejeitado ? "bg-clay/15 text-clay" : "bg-amber-tint text-amber-deep",
        ].join(" ")}
      >
        {rejeitado ? "Não aprovado" : "Em análise"}
      </span>
      <p className="text-sm font-semibold text-ink mt-2 mb-1">{report.title}</p>
      <p className="text-xs leading-relaxed" style={{ color: rejeitado ? "var(--clay)" : "var(--amber-deep)" }}>
        {rejeitado
          ? "Este relato não seguiu as regras da comunidade (sem contatos, links ou autopromoção)."
          : "Recebemos seu relato! Revisamos cada história antes de publicar — leva até 2 dias."}
      </p>
    </article>
  );
}

function ReportCard({
  report,
  assinante,
  onHelped,
}: {
  report: Report;
  assinante: boolean;
  onHelped: () => void;
}) {
  const [expandido, setExpandido] = useState(false);
  const longo = report.body.length > 320;
  const corpo = expandido || !longo ? report.body : report.body.slice(0, 320).trimEnd() + "…";
  const iniciais = report.isAnonymous
    ? "?"
    : report.author.split(" ").map((p) => p.charAt(0)).join("").slice(0, 2).toUpperCase();

  return (
    <article className="rounded-2xl border border-pine-tint bg-cream-2 p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <span
          className={[
            "w-9 h-9 rounded-full grid place-items-center text-xs font-bold flex-shrink-0",
            report.isAnonymous ? "bg-amber-tint text-amber-deep" : "bg-pine-tint text-pine",
          ].join(" ")}
        >
          {iniciais}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink leading-tight">{report.author}</p>
          <p className="text-xs text-ink-faint flex items-center gap-1">
            <PinIcon /> {report.authorState}
          </p>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-2">
        {report.visas.map((id) => (
          <span key={id} className="text-[10px] font-bold uppercase tracking-wide bg-pine-tint text-pine px-2 py-0.5 rounded-full">
            {CODIGO_POR_ID.get(id) ?? id}
          </span>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-ink leading-snug mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
        {report.title}
      </h3>
      <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">{corpo}</p>
      {longo && (
        <button onClick={() => setExpandido(!expandido)} className="text-sm font-bold text-pine mt-1.5">
          {expandido ? "Mostrar menos" : "Ler relato completo"}
        </button>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-pine-tint mt-3 pt-3">
        <span className="text-xs text-ink-faint">{tempoRelativo(report.createdAt)}</span>
        {assinante ? (
          <button
            onClick={onHelped}
            aria-pressed={report.helpedByMe}
            className={[
              "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors",
              report.helpedByMe
                ? "bg-pine border-pine text-cream-2"
                : "border-pine/30 text-pine hover:border-pine",
            ].join(" ")}
          >
            <HeartIcon /> Me ajudou{report.helpedCount > 0 ? ` · ${report.helpedCount}` : ""}
          </button>
        ) : (
          report.helpedCount > 0 && (
            <span className="text-xs text-ink-faint font-medium">
              {report.helpedCount} {report.helpedCount === 1 ? "pessoa achou útil" : "pessoas acharam útil"}
            </span>
          )
        )}
      </div>
    </article>
  );
}

function Composer({ onPublished }: { onPublished: (r: Report) => void }) {
  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [corpo, setCorpo] = useState("");
  const [vistos, setVistos] = useState<string[]>([]);
  const [anonimo, setAnonimo] = useState(true);
  const [estado, setEstado] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const contato = findContactInfo(`${titulo}\n${corpo}`);
  const pronto =
    titulo.trim().length > 0 &&
    corpo.trim().length >= BODY_MIN &&
    vistos.length > 0 &&
    estado !== "" &&
    !contato;

  function toggleVisto(id: string) {
    setVistos((prev) =>
      prev.includes(id)
        ? prev.filter((v) => v !== id)
        : prev.length < MAX_VISAS_PER_REPORT
          ? [...prev, id]
          : prev
    );
  }

  async function enviar() {
    setEnviando(true);
    setErro(null);
    const res = await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: titulo.trim(),
        body: corpo.trim(),
        visas: vistos,
        isAnonymous: anonimo,
        authorState: estado,
      }),
    }).catch(() => null);
    setEnviando(false);

    if (!res || !res.ok) {
      const data = await res?.json().catch(() => null);
      setErro(data?.error ?? "Não conseguimos enviar agora. Tente de novo em instantes.");
      return;
    }
    const data = await res.json();
    onPublished({
      id: data.reportId,
      title: titulo.trim(),
      body: corpo.trim(),
      author: anonimo ? "Membro immigrei" : "Você",
      isAnonymous: anonimo,
      authorState: estado,
      status: "pending",
      isMine: true,
      createdAt: new Date().toISOString(),
      visas: vistos,
      helpedCount: 0,
      helpedByMe: false,
    });
    setSucesso(true);
    setAberto(false);
    setTitulo(""); setCorpo(""); setVistos([]); setEstado(""); setAnonimo(true);
  }

  if (!aberto) {
    return (
      <div className="rounded-2xl bg-pine p-5 mb-6">
        <h2 className="text-lg font-semibold text-cream-2 mb-1" style={{ fontFamily: "var(--font-display)" }}>
          {sucesso ? "Relato enviado! 💚" : "Sua história pode ser o mapa de outra pessoa"}
        </h2>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(244,238,226,0.85)" }}>
          {sucesso
            ? "Revisamos cada história antes de publicar — leva até 2 dias. Você acompanha o status aqui."
            : "Compartilhe o que você viveu, de forma anônima se preferir. Revisamos tudo antes de publicar."}
        </p>
        <button
          onClick={() => { setAberto(true); setSucesso(false); }}
          className="block w-full bg-amber hover:bg-amber-deep text-ink font-bold rounded-xl px-4 py-3 text-sm transition-colors"
        >
          {sucesso ? "Escrever outro relato" : "Compartilhar meu relato"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-pine-tint bg-cream-2 p-4 mb-6">
      <h2 className="text-lg font-semibold text-ink mb-3" style={{ fontFamily: "var(--font-display)" }}>
        Conte a sua história
      </h2>

      <input
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        maxLength={TITLE_MAX}
        placeholder="Um título que resuma sua história"
        className="w-full rounded-xl border border-pine-tint bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-pine mb-2.5"
      />
      <textarea
        value={corpo}
        onChange={(e) => setCorpo(e.target.value)}
        maxLength={BODY_MAX}
        rows={5}
        placeholder="Escreva do seu jeito: o que aconteceu, o que você faria diferente, o que ninguém te contou..."
        className="w-full rounded-xl border border-pine-tint bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-pine resize-none leading-relaxed"
      />
      <p className="text-[11px] text-ink-faint mt-1 mb-3">
        {corpo.trim().length < BODY_MIN
          ? `Mínimo de ${BODY_MIN} caracteres (${corpo.trim().length}/${BODY_MIN})`
          : `${corpo.length}/${BODY_MAX}`}
      </p>

      {contato && (
        <div className="rounded-xl bg-amber-tint border border-amber/40 px-3.5 py-2.5 mb-3">
          <p className="text-xs text-amber-deep font-medium leading-relaxed">
            Parece que seu texto contém {contato === "email" ? "um e-mail" : contato === "telefone" ? "um telefone" : contato === "link" ? "um link" : "contato de rede social"}.
            Para proteger a comunidade, remova antes de enviar.
          </p>
        </div>
      )}

      <p className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-2" style={{ letterSpacing: "0.1em" }}>
        Vistos relacionados · até {MAX_VISAS_PER_REPORT}
      </p>
      <div className="flex gap-1.5 flex-wrap mb-4">
        {CATALOGO.map((v) => {
          const sel = vistos.includes(v.id);
          return (
            <button
              key={v.id}
              onClick={() => toggleVisto(v.id)}
              className={[
                "text-xs font-bold px-3 py-1.5 rounded-full border transition-colors",
                sel ? "bg-pine border-pine text-cream-2" : "border-pine/30 text-pine hover:border-pine",
              ].join(" ")}
            >
              {v.codigo}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl bg-cream px-3.5 py-3 mb-4 flex flex-col gap-3">
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span>
            <span className="block text-sm font-bold text-ink">Publicar como anônimo</span>
            <span className="block text-xs text-ink-faint">Seu nome vira &quot;Membro immigrei&quot;. O estado continua visível.</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={anonimo}
            onClick={() => setAnonimo(!anonimo)}
            className="relative w-11 h-6 rounded-full flex-shrink-0 transition-colors"
            style={{ background: anonimo ? "var(--sage)" : "var(--ink-faint)" }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-cream-2 shadow transition-transform"
              style={{ transform: anonimo ? "translateX(22px)" : "translateX(2px)", left: 0 }}
            />
          </button>
        </label>
        <label className="flex items-center justify-between gap-3">
          <span>
            <span className="block text-sm font-bold text-ink">Seu estado</span>
            <span className="block text-xs text-ink-faint">Ajuda quem está perto de você a se encontrar.</span>
          </span>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="rounded-lg border border-pine/30 bg-cream-2 px-2.5 py-1.5 text-sm font-semibold text-pine focus:outline-none focus:border-pine max-w-[45%]"
          >
            <option value="">Selecionar</option>
            {AUTHOR_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      {erro && (
        <div className="rounded-xl border border-clay/40 bg-clay/5 px-3.5 py-2.5 mb-3">
          <p className="text-xs font-medium leading-relaxed" style={{ color: "var(--clay)" }}>{erro}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setAberto(false)}
          className="flex-shrink-0 text-sm font-bold text-ink-soft px-4 py-3 rounded-xl border border-pine-tint hover:border-pine/30 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={enviar}
          disabled={!pronto || enviando}
          className="flex-1 bg-amber hover:bg-amber-deep disabled:opacity-50 disabled:cursor-not-allowed text-ink font-bold rounded-xl px-4 py-3 text-sm transition-colors"
        >
          {enviando ? "Enviando..." : "Enviar relato"}
        </button>
      </div>
      <p className="text-[11px] text-ink-faint text-center mt-2.5 leading-relaxed">
        Todo relato passa pela nossa revisão antes de aparecer aqui. Sem contatos, links ou autopromoção.
      </p>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="9" height="11" viewBox="0 0 10 12" fill="none" aria-hidden="true">
      <path d="M2 5V3.5C2 1.8 3.3 0.5 5 0.5S8 1.8 8 3.5V5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="5" width="8" height="6" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden="true">
      <path d="M5 0.8a4 4 0 0 1 4 4c0 2.7-4 6.4-4 6.4S1 7.5 1 4.8a4 4 0 0 1 4-4Z" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="5" cy="4.8" r="1.4" fill="currentColor" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="13" height="12" viewBox="0 0 13 12" fill="currentColor" aria-hidden="true">
      <path d="M6.5 11.3 5.6 10.5C2.4 7.6.5 5.9.5 3.7.5 1.9 1.9.5 3.7.5c1 0 2 .5 2.8 1.3C7.3 1 8.3.5 9.3.5c1.8 0 3.2 1.4 3.2 3.2 0 2.2-1.9 3.9-5.1 6.8l-.9.8Z" />
    </svg>
  );
}
