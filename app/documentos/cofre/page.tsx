"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/app/components/AppShell";
import checklists from "../[vistoId]/data";

interface DocumentoVault {
  id:           string;
  documento_id: string;
  visto_id:     string;
  file_name:    string;
  mime_type:    string | null;
  size_bytes:   number;
  created_at:   string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function FileIcon({ mimeType }: { mimeType: string | null }) {
  const isImage = mimeType?.startsWith("image/");
  return (
    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-pine-tint flex items-center justify-center">
      {isImage ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-pine">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
          <path d="M21 16l-5.5-5.5a2 2 0 0 0-2.8 0L3 20" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-pine">
          <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
          <path d="M15 2v5h5" />
        </svg>
      )}
    </div>
  );
}

export default function CofreDocumentosPage() {
  const [documentos, setDocumentos] = useState<DocumentoVault[] | null>(null);
  const [excluindo, setExcluindo] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/user-documents")
      .then((r) => (r.ok ? r.json() : { documents: [] }))
      .then((d) => setDocumentos((d.documents ?? []) as DocumentoVault[]))
      .catch(() => setDocumentos([]));
  }, []);

  const verAnexo = async (doc: DocumentoVault) => {
    const res = await fetch(`/api/user-documents?fileId=${doc.id}`);
    if (!res.ok) return;
    const { url } = await res.json();
    if (url) window.open(url, "_blank", "noopener");
  };

  const excluirAnexo = async (doc: DocumentoVault) => {
    if (!confirm(`Excluir "${doc.file_name}"?`)) return;
    setExcluindo((prev) => new Set(prev).add(doc.id));
    const res = await fetch("/api/user-documents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: doc.id }),
    });
    setExcluindo((prev) => {
      const next = new Set(prev);
      next.delete(doc.id);
      return next;
    });
    if (!res.ok) return;
    setDocumentos((prev) => (prev ?? []).filter((d) => d.id !== doc.id));
  };

  const grupos = new Map<string, DocumentoVault[]>();
  for (const doc of documentos ?? []) {
    const lista = grupos.get(doc.visto_id) ?? [];
    lista.push(doc);
    grupos.set(doc.visto_id, lista);
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-widest text-pine mb-1" style={{ letterSpacing: "0.12em" }}>
            Sempre à mão
          </p>
          <h1 className="text-3xl font-semibold text-ink mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Cofre de Documentos
          </h1>
          <p className="text-ink-soft text-sm leading-relaxed">
            Tudo o que você enviou, guardado em um só lugar — não importa qual visto você
            escolheu ou está explorando agora.
          </p>
        </div>

        {documentos === null && (
          <div className="flex items-center gap-2 text-ink-faint text-sm mb-6">
            <span className="w-4 h-4 rounded-full border-2 border-pine-tint border-t-pine animate-spin inline-block" />
            Carregando seu cofre...
          </div>
        )}

        {documentos !== null && documentos.length === 0 && (
          <div className="rounded-2xl border border-pine-tint bg-cream-2 p-6 text-center">
            <p className="text-sm text-ink-soft leading-relaxed mb-4">
              Seu cofre está vazio por enquanto. Envie documentos pelos checklists dos seus
              vistos — eles aparecem aqui automaticamente.
            </p>
            <Link
              href="/documentos"
              className="inline-flex items-center gap-2 rounded-full bg-pine px-5 py-2.5 text-sm font-bold text-cream hover:bg-pine-deep transition-colors"
            >
              Ver meus kits →
            </Link>
          </div>
        )}

        {documentos !== null && documentos.length > 0 && [...grupos.entries()].map(([vistoId, docs]) => {
          const checklist = checklists[vistoId];
          const docsById = new Map(
            checklist?.grupos.flatMap((g) => g.documentos).map((d) => [d.id, d.nome]) ?? [],
          );
          return (
            <div key={vistoId} className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-faint" style={{ letterSpacing: "0.1em" }}>
                  {checklist ? `${checklist.codigo} · ${checklist.nome}` : vistoId}
                </p>
                <Link
                  href={`/documentos/${vistoId}`}
                  className="text-xs font-semibold text-pine hover:underline underline-offset-2"
                >
                  Ver checklist →
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 rounded-2xl border border-pine-tint bg-cream-2 p-3"
                  >
                    <FileIcon mimeType={doc.mime_type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">
                        {docsById.get(doc.documento_id) ?? doc.file_name}
                      </p>
                      <p className="text-xs text-ink-faint">
                        {doc.file_name} · {formatBytes(doc.size_bytes)} · {formatDate(doc.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => verAnexo(doc)}
                      className="flex-shrink-0 text-xs font-semibold text-pine hover:underline underline-offset-2"
                    >
                      Abrir
                    </button>
                    <button
                      onClick={() => excluirAnexo(doc)}
                      disabled={excluindo.has(doc.id)}
                      className="flex-shrink-0 text-xs font-semibold text-clay hover:underline underline-offset-2 disabled:opacity-40"
                    >
                      {excluindo.has(doc.id) ? "..." : "Excluir"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
