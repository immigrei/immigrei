"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import PaywallGate from "@/app/components/PaywallGate";
import checklists from "../[vistoId]/data";
import { CATEGORIAS, inferCategoria, precisaTraducao, type Categoria } from "@/lib/document-category";

interface DocumentoVault {
  id:           string;
  documento_id: string | null;
  visto_id:     string | null;
  categoria:    Categoria | null;
  titulo:       string | null;
  file_name:    string;
  mime_type:    string | null;
  size_bytes:   number;
  created_at:   string;
}

// Chave de agrupamento para documentos avulsos (sem visto_id).
const AVULSOS_KEY = "_avulsos";

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

// Prévia ilustrativa do cofre para quem ainda não assina — no plano grátis
// não há upload, então não existe cofre real para borrar.
const DEMO_DOCS = [
  { nome: "Passaporte — página de identificação", arquivo: "passaporte.pdf", tamanho: "2,4 MB", data: "12 jul 2026" },
  { nome: "Formulário I-20 assinado", arquivo: "i20-assinado.pdf", tamanho: "890 KB", data: "10 jul 2026" },
  { nome: "Comprovante de pagamento SEVIS", arquivo: "sevis-i901.pdf", tamanho: "210 KB", data: "8 jul 2026" },
];

function CofreDemo() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint" style={{ letterSpacing: "0.1em" }}>
          F-1 · Visto de estudante
        </p>
        <span className="text-xs font-semibold text-pine">Ver checklist →</span>
      </div>
      <div className="flex flex-col gap-2">
        {DEMO_DOCS.map((doc) => (
          <div
            key={doc.arquivo}
            className="flex items-center gap-3 rounded-2xl border border-pine-tint bg-cream-2 p-3"
          >
            <FileIcon mimeType={null} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{doc.nome}</p>
              <p className="text-xs text-ink-faint">
                {doc.arquivo} · {doc.tamanho} · {doc.data}
              </p>
            </div>
            <span className="flex-shrink-0 text-xs font-semibold text-pine">Abrir</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ChecklistInfo {
  nome: string;
  categoria: Categoria;
  precisaTraducao: boolean;
}

export default function CofreClient({ hasAccess }: { hasAccess: boolean }) {
  const router = useRouter();
  const [documentos, setDocumentos] = useState<DocumentoVault[] | null>(null);
  const [excluindo, setExcluindo] = useState<Set<string>>(new Set());
  const [categoriaAtiva, setCategoriaAtiva] = useState<Categoria | "Todos">("Todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [tituloNovo, setTituloNovo] = useState("");
  const [arquivoNovo, setArquivoNovo] = useState<File | null>(null);

  // Chave `${vistoId}:${documentoId}` porque o mesmo documento_id pode existir
  // em checklists diferentes (ex: "passaporte" aparece em vários vistos).
  const checklistInfoByKey = useMemo(() => {
    const map = new Map<string, ChecklistInfo>();
    for (const checklist of Object.values(checklists)) {
      for (const grupo of checklist.grupos) {
        for (const doc of grupo.documentos) {
          map.set(`${checklist.vistoId}:${doc.id}`, {
            nome: doc.nome,
            categoria: inferCategoria(doc),
            precisaTraducao: precisaTraducao(doc),
          });
        }
      }
    }
    return map;
  }, []);

  useEffect(() => {
    if (!hasAccess) return;
    fetch("/api/user-documents")
      .then((r) => (r.ok ? r.json() : { documents: [] }))
      .then((d) => setDocumentos((d.documents ?? []) as DocumentoVault[]))
      .catch(() => setDocumentos([]));
  }, [hasAccess]);

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

  const adicionarAvulso = async () => {
    if (!arquivoNovo || !tituloNovo.trim() || categoriaAtiva === "Todos") return;
    setEnviando(true);
    setErroEnvio(null);
    const form = new FormData();
    form.set("file", arquivoNovo);
    form.set("categoria", categoriaAtiva);
    form.set("titulo", tituloNovo.trim());
    const res = await fetch("/api/user-documents", { method: "POST", body: form });
    setEnviando(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErroEnvio(body.error ?? "Não foi possível enviar o documento.");
      return;
    }
    const { document } = await res.json();
    setDocumentos((prev) => [
      { ...document, visto_id: null, mime_type: arquivoNovo.type },
      ...(prev ?? []),
    ]);
    setModalAberto(false);
    setTituloNovo("");
    setArquivoNovo(null);
  };

  const todos = documentos ?? [];
  const docsComInfo = todos.map((doc) => ({
    doc,
    info: doc.categoria
      ? { nome: doc.titulo ?? doc.file_name, categoria: doc.categoria, precisaTraducao: false }
      : checklistInfoByKey.get(`${doc.visto_id}:${doc.documento_id}`),
  }));

  const pendentesTraducao = docsComInfo.filter((d) => d.info?.precisaTraducao).length;

  const docsFiltrados =
    categoriaAtiva === "Todos"
      ? docsComInfo
      : docsComInfo.filter((d) => (d.info?.categoria ?? "Identidade") === categoriaAtiva);

  const grupos = new Map<string, typeof docsFiltrados>();
  for (const item of docsFiltrados) {
    const key = item.doc.visto_id ?? AVULSOS_KEY;
    const lista = grupos.get(key) ?? [];
    lista.push(item);
    grupos.set(key, lista);
  }

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

        {!hasAccess && (
          <PaywallGate
            titulo="Seus documentos, guardados com segurança"
            descricao="Passaporte, I-20, comprovantes — tudo em um cofre só, ligado ao checklist de cada visto e disponível quando você precisar. Assine para começar a guardar os seus."
            previewClassName="max-h-64"
          >
            <CofreDemo />
          </PaywallGate>
        )}

        {hasAccess && documentos === null && (
          <div className="flex items-center gap-2 text-ink-faint text-sm mb-6">
            <span className="w-4 h-4 rounded-full border-2 border-pine-tint border-t-pine animate-spin inline-block" />
            Carregando seu cofre...
          </div>
        )}

        {hasAccess && documentos !== null && documentos.length === 0 && (
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

        {hasAccess && documentos !== null && documentos.length > 0 && (
          <>
            {pendentesTraducao > 0 && (
              <div className="mb-6 flex items-center gap-2 rounded-2xl border-l-4 border-amber bg-amber-tint p-4 text-sm text-ink">
                <span>
                  Você tem <strong className="text-amber-deep">{pendentesTraducao} documento(s)</strong> que
                  costumam exigir tradução juramentada para o inglês.
                </span>
              </div>
            )}

            <div className="mb-6 flex items-center justify-between gap-2">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(["Todos", ...CATEGORIAS] as const).map((cat) => (
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
              {categoriaAtiva !== "Todos" && (
                <button
                  onClick={() => setModalAberto(true)}
                  className="flex-shrink-0 rounded-full bg-amber px-3.5 py-1.5 text-xs font-bold text-ink hover:bg-amber-deep transition-colors"
                >
                  + Adicionar
                </button>
              )}
            </div>

            {docsFiltrados.length === 0 && (
              <div className="rounded-2xl border border-pine-tint bg-cream-2 p-6 text-center text-sm text-ink-soft">
                Nenhum documento nessa categoria ainda.
              </div>
            )}

            {[...grupos.entries()].map(([vistoId, docs]) => {
              const checklist = vistoId === AVULSOS_KEY ? null : checklists[vistoId];
              return (
                <div key={vistoId} className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-ink-faint" style={{ letterSpacing: "0.1em" }}>
                      {vistoId === AVULSOS_KEY ? "Adicionados por você" : checklist ? `${checklist.codigo} · ${checklist.nome}` : vistoId}
                    </p>
                    {vistoId !== AVULSOS_KEY && (
                      <Link
                        href={`/documentos/${vistoId}`}
                        className="text-xs font-semibold text-pine hover:underline underline-offset-2"
                      >
                        Ver checklist →
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {docs.map(({ doc, info }) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 rounded-2xl border border-pine-tint bg-cream-2 p-3"
                      >
                        <FileIcon mimeType={doc.mime_type} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-ink truncate">
                              {info?.nome ?? doc.file_name}
                            </p>
                            {info && (
                              <span className="flex-shrink-0 rounded-md bg-pine-tint px-1.5 py-0.5 text-[10px] font-bold text-pine">
                                {info.categoria}
                              </span>
                            )}
                            {info?.precisaTraducao && (
                              <span className="flex-shrink-0 rounded-md bg-amber-tint px-1.5 py-0.5 text-[10px] font-bold text-amber-deep">
                                Tradução
                              </span>
                            )}
                          </div>
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
          </>
        )}

        {modalAberto && categoriaAtiva !== "Todos" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-cream-2 p-6 shadow-xl">
              <h2 className="mb-1 text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
                Adicionar em {categoriaAtiva}
              </h2>
              <p className="mb-4 text-xs text-ink-faint">
                Para documentos que não vieram de um checklist de visto específico.
              </p>

              <label className="mb-1 block text-xs font-bold text-ink-soft">Nome do documento</label>
              <input
                type="text"
                value={tituloNovo}
                onChange={(e) => setTituloNovo(e.target.value)}
                placeholder="Ex: Certidão de casamento com averbação"
                className="mb-3 w-full rounded-lg border border-pine-tint bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-pine"
              />

              <label className="mb-1 block text-xs font-bold text-ink-soft">Arquivo (PDF, JPG, PNG, WEBP, HEIC — até 10 MB)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
                onChange={(e) => setArquivoNovo(e.target.files?.[0] ?? null)}
                className="mb-3 w-full text-xs text-ink-soft"
              />

              {erroEnvio && <p className="mb-3 text-xs text-clay">{erroEnvio}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setModalAberto(false);
                    setErroEnvio(null);
                  }}
                  className="rounded-full px-4 py-2 text-xs font-bold text-ink-soft hover:bg-pine-tint/50"
                >
                  Cancelar
                </button>
                <button
                  onClick={adicionarAvulso}
                  disabled={enviando || !arquivoNovo || !tituloNovo.trim()}
                  className="rounded-full bg-pine px-4 py-2 text-xs font-bold text-cream hover:bg-pine-deep disabled:opacity-40"
                >
                  {enviando ? "Enviando..." : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
