"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import { getForm } from "@/lib/forms/registry";
import {
  allQuestions,
  englishValue,
  isVisible,
  type Answers,
  type FieldValue,
  type Question,
} from "@/lib/forms/types";

const AUTOSAVE_DEBOUNCE_MS = 800;

function isoToUsDate(v: FieldValue): string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return "";
  const [y, m, d] = v.split("-");
  return `${m}/${d}/${y}`;
}

// The English value that will land on the official form — shown as a quiet
// transparency hint so the user always sees what gets written.
function exportPreview(q: Question, value: FieldValue): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (q.type === "date") return isoToUsDate(value);
  if (q.options) {
    const en = englishValue(q, value);
    const opt = q.options.find((o) => o.value === value);
    // Only worth showing when it differs from the PT label the user picked.
    if (opt && (opt.valueEn ?? "") && opt.valueEn !== opt.labelPt) return en;
    return null;
  }
  return null;
}

function validateFormat(q: Question, value: FieldValue): string | null {
  if (!q.validate?.pattern) return null;
  if (value === null || value === undefined || value === "") return null;
  return q.validate.pattern.test(String(value)) ? null : q.validate.messagePt;
}

export default function FormularioPage() {
  const params = useParams();
  const router = useRouter();
  const vistoId = params.vistoId as string;
  const formId = params.formId as string;
  const form = getForm(formId);

  const [answers, setAnswers] = useState<Answers>({});
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showErrors, setShowErrors] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exported, setExported] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved draft merged with the profile prefill.
  useEffect(() => {
    if (!form) return;
    fetch(`/api/forms/${formId}`)
      .then((r) => (r.ok ? r.json() : { answers: {} }))
      .then((d) => {
        setAnswers((d.answers ?? {}) as Answers);
        if (d.status === "exported") setExported(true);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [form, formId]);

  const visibleQuestions = useMemo(
    () => (form ? allQuestions(form).filter((q) => isVisible(q, answers)) : []),
    [form, answers]
  );

  const missing = useMemo(
    () =>
      visibleQuestions.filter((q) => {
        const v = answers[q.id];
        return q.required && (v === undefined || v === null || v === "");
      }),
    [visibleQuestions, answers]
  );

  const formatErrors = useMemo(
    () =>
      visibleQuestions
        .map((q) => ({ q, err: validateFormat(q, answers[q.id]) }))
        .filter((x) => x.err),
    [visibleQuestions, answers]
  );

  const answeredCount = visibleQuestions.filter((q) => {
    const v = answers[q.id];
    return v !== undefined && v !== null && v !== "";
  }).length;
  const progress = visibleQuestions.length
    ? Math.round((answeredCount / visibleQuestions.length) * 100)
    : 0;

  const canExport = missing.length === 0 && formatErrors.length === 0;

  if (!form) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-6 py-10 text-center">
          <p className="text-ink-soft">Formulário não encontrado.</p>
          <button
            onClick={() => router.push(`/documentos/${vistoId}`)}
            className="mt-4 text-pine underline text-sm"
          >
            Voltar
          </button>
        </div>
      </AppShell>
    );
  }

  function update(id: string, value: FieldValue) {
    setExported(false);
    setAnswers((prev) => {
      const next = { ...prev, [id]: value };
      scheduleSave(next);
      return next;
    });
  }

  function scheduleSave(next: Answers) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");
    saveTimer.current = setTimeout(() => {
      fetch(`/api/forms/${formId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: next }),
      })
        .then((r) => setSaveState(r.ok ? "saved" : "error"))
        .catch(() => setSaveState("error"));
    }, AUTOSAVE_DEBOUNCE_MS);
  }

  async function handleExport() {
    setShowErrors(true);
    if (!canExport) {
      document.getElementById("export-panel")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetch(`/api/forms/${formId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setExportError(data.error ?? "Falha ao gerar o formulário.");
        return;
      }
      // Download the filled PDF (it was also attached to the vault server-side).
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${form.code}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExported(true);
    } catch {
      setExportError("Falha de conexão ao gerar o formulário.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-8 pb-24">
        {/* Header */}
        <button
          onClick={() => router.push(`/documentos/${vistoId}`)}
          className="text-pine text-sm mb-4 hover:underline"
        >
          ← Voltar ao kit
        </button>
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-1">
          {form.code} · Edição {form.edition}
        </p>
        <h1 className="font-[Fraunces] text-3xl text-ink mb-2" style={{ fontFamily: "Fraunces, serif" }}>
          {form.namePt}
        </h1>
        <p className="text-ink-soft text-sm leading-relaxed mb-5">
          Responda em português. No final, você exporta o formulário oficial <strong>{form.code}</strong>{" "}
          preenchido em inglês, pronto para conferir, assinar e anexar no cofre de documentos.
        </p>

        {/* Progress + autosave */}
        <div className="sticky top-0 z-10 -mx-5 sm:-mx-6 px-5 sm:px-6 py-3 bg-cream/90 backdrop-blur border-b border-pine-tint mb-6">
          <div className="flex items-center justify-between text-xs text-ink-faint mb-1.5">
            <span>{answeredCount} de {visibleQuestions.length} respondidos</span>
            <span>
              {saveState === "saving" && "Salvando…"}
              {saveState === "saved" && "Salvo ✓"}
              {saveState === "error" && "Sem salvar (offline)"}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-pine-tint overflow-hidden">
            <div className="h-full bg-pine transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {!loaded ? (
          <p className="text-ink-faint text-sm">Carregando…</p>
        ) : (
          form.sections.map((section) => {
            const qs = section.questions.filter((q) => isVisible(q, answers));
            if (qs.length === 0) return null;
            return (
              <div key={section.id} className="bg-cream-2 rounded-2xl border border-pine-tint p-5 sm:p-6 mb-5">
                <h2 className="text-lg font-bold text-ink mb-1">{section.titlePt}</h2>
                {section.descriptionPt && (
                  <p className="text-ink-soft text-sm mb-4">{section.descriptionPt}</p>
                )}
                <div className="space-y-4">
                  {qs.map((q) => (
                    <Field
                      key={q.id}
                      q={q}
                      value={answers[q.id] ?? ""}
                      onChange={(v) => update(q.id, v)}
                      showError={showErrors}
                      missing={showErrors && missing.includes(q)}
                      formatError={validateFormat(q, answers[q.id])}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}

        {/* Export panel */}
        <div id="export-panel" className="bg-cream-2 rounded-2xl border border-amber/40 p-5 sm:p-6 mt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-2">
            Exportar formulário oficial
          </p>
          <p className="text-ink-soft text-sm leading-relaxed mb-4">{form.disclaimerPt}</p>

          {showErrors && missing.length > 0 && (
            <div className="rounded-xl bg-amber-tint/60 border border-amber/40 p-3 mb-4 text-sm text-ink">
              <p className="font-semibold mb-1">Faltam campos obrigatórios:</p>
              <ul className="list-disc list-inside text-ink-soft">
                {missing.slice(0, 8).map((q) => (
                  <li key={q.id}>{q.labelPt}</li>
                ))}
              </ul>
            </div>
          )}
          {showErrors && formatErrors.length > 0 && (
            <div className="rounded-xl bg-clay/10 border border-clay/30 p-3 mb-4 text-sm text-clay">
              {formatErrors.map(({ q, err }) => (
                <p key={q.id}>{q.labelPt}: {err}</p>
              ))}
            </div>
          )}
          {exportError && (
            <p className="text-clay text-sm mb-3">{exportError}</p>
          )}

          {exported ? (
            <div className="rounded-xl bg-pine-tint border border-pine/20 p-4">
              <p className="text-pine-deep font-semibold text-sm mb-1">
                Formulário gerado e anexado no cofre ✓
              </p>
              <p className="text-ink-soft text-sm mb-3">
                O {form.code} preenchido foi baixado e também aparece anexado no seu kit.
                Confira, assine à mão e envie ao USCIS.
              </p>
              <button
                onClick={() => router.push(`/documentos/${vistoId}`)}
                className="text-pine underline text-sm"
              >
                Ver no cofre de documentos →
              </button>
            </div>
          ) : (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full rounded-xl bg-amber px-5 py-3 text-sm font-bold text-ink hover:bg-amber-deep disabled:opacity-60 transition-colors"
            >
              {exporting ? "Gerando…" : `Exportar ${form.code} preenchido (PDF)`}
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  q,
  value,
  onChange,
  missing,
  formatError,
  showError,
}: {
  q: Question;
  value: FieldValue;
  onChange: (v: FieldValue) => void;
  missing: boolean;
  formatError: string | null;
  showError: boolean;
}) {
  const preview = exportPreview(q, value);
  const inputBase =
    "w-full rounded-xl border bg-cream-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-pine";
  const borderCls = missing || (showError && formatError) ? "border-clay" : "border-pine-tint";

  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-1.5 block">
        {q.labelPt}
        {q.required && <span className="text-clay ml-1">*</span>}
      </label>

      {q.type === "radio" && q.options ? (
        <div className="space-y-2">
          {q.options.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 cursor-pointer text-sm ${
                value === opt.value ? "border-pine bg-pine-tint" : "border-pine-tint bg-cream-2"
              }`}
            >
              <input
                type="radio"
                name={q.id}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="accent-pine"
              />
              <span className="text-ink">{opt.labelPt}</span>
            </label>
          ))}
        </div>
      ) : q.type === "select" && q.options ? (
        <select
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputBase} ${borderCls}`}
        >
          <option value="">Selecione…</option>
          {q.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.labelPt}
            </option>
          ))}
        </select>
      ) : q.type === "date" ? (
        <input
          type="date"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputBase} ${borderCls}`}
        />
      ) : q.type === "textarea" ? (
        <textarea
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={q.placeholder}
          rows={3}
          className={`${inputBase} ${borderCls}`}
        />
      ) : (
        <input
          type="text"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={q.placeholder}
          className={`${inputBase} ${borderCls}`}
        />
      )}

      {q.helpPt && <p className="text-ink-faint text-xs mt-1.5 leading-relaxed">{q.helpPt}</p>}
      {preview && (
        <p className="text-ink-faint text-xs mt-1">
          No formulário: <span className="font-semibold text-ink-soft">{preview}</span>
        </p>
      )}
      {showError && formatError && <p className="text-clay text-xs mt-1">{formatError}</p>}
      {missing && <p className="text-clay text-xs mt-1">Campo obrigatório.</p>}
    </div>
  );
}
