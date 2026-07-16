"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AppShell from "@/app/components/AppShell";
import checklists, { type Agencia } from "./data";

const agenciaBadge: Record<Agencia, { label: string; color: string }> = {
  USCIS: { label: "USCIS", color: "bg-pine-tint text-pine" },
  NVC:   { label: "NVC",   color: "bg-amber-tint text-amber-deep" },
  DOS:   { label: "Consulado", color: "bg-ink/10 text-ink-soft" },
  DOL:   { label: "DOL",   color: "bg-pine-tint text-pine-deep" },
  EOIR:  { label: "EOIR",  color: "bg-clay/10 text-clay" },
  CBP:   { label: "CBP",   color: "bg-pine-tint text-pine" },
};

interface Anexo {
  id: string;
  documento_id: string;
  file_name: string;
  size_bytes: number;
  created_at: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function PaperclipIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

export default function DocumentosVistoPage() {
  const params = useParams();
  const router = useRouter();
  const vistoId = params.vistoId as string;
  const checklist = checklists[vistoId];

  const allDocIds = checklist?.grupos.flatMap((g) => g.documentos.map((d) => d.id)) ?? [];
  const [marcados, setMarcados] = useState<Set<string>>(new Set());

  // ── Anexos (cofre de documentos) ────────────────────────────────────────
  const [anexos, setAnexos] = useState<Record<string, Anexo[]>>({});
  const [enviando, setEnviando] = useState<Set<string>>(new Set());
  const [erroUpload, setErroUpload] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingDocId = useRef<string | null>(null);

  useEffect(() => {
    if (!vistoId) return;
    fetch(`/api/checklist?vistoId=${vistoId}`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setMarcados(new Set((d.items ?? []) as string[])))
      .catch(() => {});
    fetch(`/api/user-documents?vistoId=${vistoId}`)
      .then((r) => (r.ok ? r.json() : { documents: [] }))
      .then((d) => {
        const byDoc: Record<string, Anexo[]> = {};
        for (const a of (d.documents ?? []) as Anexo[]) {
          (byDoc[a.documento_id] ??= []).push(a);
        }
        setAnexos(byDoc);
      })
      .catch(() => {});
  }, [vistoId]);

  if (!checklist) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-6 py-10 text-center">
          <p className="text-ink-soft">Visto não encontrado.</p>
          <button onClick={() => router.push("/documentos")} className="mt-4 text-pine underline text-sm">
            Voltar para documentos
          </button>
        </div>
      </AppShell>
    );
  }

  const toggle = (id: string) => {
    const checked = !marcados.has(id);
    setMarcados((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
    // Persiste sem bloquear a UI; deslogado (401) segue funcionando localmente.
    fetch("/api/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vistoId, documentoId: id, checked }),
    }).catch(() => {});
  };

  const pickFile = (docId: string) => {
    pendingDocId.current = docId;
    fileInputRef.current?.click();
  };

  const uploadFile = async (file: File) => {
    const docId = pendingDocId.current;
    pendingDocId.current = null;
    if (!docId) return;

    setErroUpload(null);
    setEnviando((prev) => new Set(prev).add(docId));
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("vistoId", vistoId);
      form.append("documentoId", docId);
      const res = await fetch("/api/user-documents", { method: "POST", body: form });
      if (res.status === 401) {
        router.push("/sign-up");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErroUpload(data.error ?? "Não conseguimos enviar o arquivo. Tente novamente.");
        return;
      }
      setAnexos((prev) => ({
        ...prev,
        [docId]: [...(prev[docId] ?? []), data.document as Anexo],
      }));
    } catch {
      setErroUpload("Não conseguimos enviar o arquivo. Tente novamente.");
    } finally {
      setEnviando((prev) => {
        const next = new Set(prev);
        next.delete(docId);
        return next;
      });
    }
  };

  const verAnexo = async (anexo: Anexo) => {
    const res = await fetch(`/api/user-documents?fileId=${anexo.id}`);
    if (!res.ok) return;
    const { url } = await res.json();
    if (url) window.open(url, "_blank", "noopener");
  };

  const excluirAnexo = async (anexo: Anexo) => {
    if (!confirm(`Excluir "${anexo.file_name}"?`)) return;
    const res = await fetch("/api/user-documents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: anexo.id }),
    });
    if (!res.ok) return;
    setAnexos((prev) => ({
      ...prev,
      [anexo.documento_id]: (prev[anexo.documento_id] ?? []).filter((a) => a.id !== anexo.id),
    }));
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

        {/* Input único de arquivo — reaproveitado por todos os itens */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) uploadFile(file);
          }}
        />

        {/* Back — volta para a tela de origem (painel ou documentos), não para a vitrine de vistos */}
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

        {/* Erro de upload */}
        {erroUpload && (
          <div className="bg-clay/5 border border-clay/30 rounded-2xl px-4 py-3 mb-6">
            <p className="text-xs text-clay leading-relaxed">{erroUpload}</p>
          </div>
        )}

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
                const docAnexos = anexos[doc.id] ?? [];
                const temAnexo = docAnexos.length > 0;
                const subindo = enviando.has(doc.id);
                return (
                  <div
                    key={doc.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggle(doc.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(doc.id);
                      }
                    }}
                    className={[
                      "w-full text-left rounded-2xl border p-4 transition-all duration-150 cursor-pointer",
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

                        {/* Preencher formulário oficial em PT-BR e exportar */}
                        {doc.formId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/documentos/${vistoId}/formulario/${doc.formId}`);
                            }}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber px-3.5 py-2 text-xs font-bold text-ink hover:bg-amber-deep transition-colors"
                          >
                            Preencher em português e exportar →
                          </button>
                        )}

                        {/* Anexos */}
                        {temAnexo && (
                          <div className="mt-3 flex flex-col gap-1.5">
                            {docAnexos.map((anexo) => (
                              <div
                                key={anexo.id}
                                className="flex items-center gap-2 bg-cream rounded-xl px-3 py-2 border border-pine-tint"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <PaperclipIcon className="flex-shrink-0 text-sage" />
                                <span className="flex-1 min-w-0 truncate text-xs text-ink font-medium">
                                  {anexo.file_name}
                                </span>
                                <span className="flex-shrink-0 text-[10px] text-ink-faint">
                                  {formatBytes(anexo.size_bytes)}
                                </span>
                                <button
                                  onClick={() => verAnexo(anexo)}
                                  className="flex-shrink-0 text-[11px] font-bold text-pine hover:text-pine-deep transition-colors"
                                >
                                  Ver
                                </button>
                                <button
                                  onClick={() => excluirAnexo(anexo)}
                                  className="flex-shrink-0 text-[11px] font-bold text-clay/70 hover:text-clay transition-colors"
                                >
                                  Excluir
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Clips — anexar documento */}
                      <button
                        aria-label={`Anexar arquivo: ${doc.nome}`}
                        title="Anexar documento (PDF, JPG, PNG — até 10 MB)"
                        disabled={subindo}
                        onClick={(e) => {
                          e.stopPropagation();
                          pickFile(doc.id);
                        }}
                        className={[
                          "flex-shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-all mt-0.5",
                          temAnexo
                            ? "bg-sage/10 border-sage/40 text-sage hover:bg-sage/20"
                            : "bg-cream border-pine-tint text-ink-faint hover:text-pine hover:border-pine/30",
                        ].join(" ")}
                      >
                        {subindo ? (
                          <span className="w-4 h-4 rounded-full border-2 border-pine-tint border-t-pine animate-spin" />
                        ) : (
                          <PaperclipIcon />
                        )}
                      </button>
                    </div>
                  </div>
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
