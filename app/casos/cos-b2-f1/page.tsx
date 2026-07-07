"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import { interpolateMessage } from "@/lib/rules/interpolateMessage";
import { MESSAGES_PT } from "@/lib/rules/messages.pt";
import {
  OFFICIAL_TEXT_PT,
  OFFICIAL_TEXT_PT_APPROVED,
  OFFICIAL_TEXT_PT_PENDING_NOTICE,
} from "@/lib/rules/officialTextPt";
import type { RuleOutcome } from "@/lib/rules/cosB2F1";

type CaseStatus = "draft" | "validated" | "blocked" | "compiled";

type CaseRow = {
  id: string;
  i94_number: string | null;
  last_entry_date: string | null;
  i94_admit_until: string | null;
  sevis_id: string | null;
  i901_fee_paid: boolean;
  enrolled_before_approval: boolean | null;
  worked_without_authorization: boolean | null;
  dos_90_day_acknowledged_at: string | null;
  status: CaseStatus;
};

type FormState = {
  i94_number: string;
  last_entry_date: string;
  i94_admit_until: string;
  sevis_id: string;
  i901_fee_paid: boolean;
  enrolled_before_approval: boolean;
  worked_without_authorization: boolean;
};

const EMPTY_FORM: FormState = {
  i94_number: "",
  last_entry_date: "",
  i94_admit_until: "",
  sevis_id: "",
  i901_fee_paid: false,
  enrolled_before_approval: false,
  worked_without_authorization: false,
};

// Rótulos neutros de checklist — descrevem O QUE foi verificado, não o texto
// legal do resultado (esse vem exclusivamente de MESSAGES_PT).
const RULE_LABELS: Record<string, string> = {
  I94_EXPIRED: "I-94 dentro do prazo autorizado",
  DOS_90_DAY_WINDOW: "Janela dos 90 dias desde a entrada",
  I20_MISSING: "Form I-20 / SEVIS ID válido",
  SEVIS_FEE_UNPAID: "Taxa SEVIS I-901 paga",
  B2_STUDY_STARTED: "Sem matrícula antes da aprovação",
  UNAUTHORIZED_WORK: "Sem trabalho não autorizado",
};

const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  draft: "Rascunho",
  validated: "Validado",
  blocked: "Bloqueado",
  compiled: "Compilado",
};

const AUTOSAVE_DEBOUNCE_MS = 800;

// Link oficial por campo do formulário — a definição de uma linha vem de
// MESSAGES_PT['helper.*'] (vigiada pelo guard UPL); o rótulo do link aqui é
// só navegação, igual ao padrão já usado em "Ver a norma oficial →".
const FIELD_HELP: Record<
  keyof Pick<FormState, "i94_number" | "last_entry_date" | "i94_admit_until" | "sevis_id" | "i901_fee_paid">,
  { messageKey: keyof typeof MESSAGES_PT; url: string; linkLabel: string }
> = {
  i94_number: {
    messageKey: "helper.i94_number",
    url: "https://i94.cbp.dhs.gov/",
    linkLabel: "Abrir i94.cbp.dhs.gov →",
  },
  last_entry_date: {
    messageKey: "helper.last_entry_date",
    url: "https://i94.cbp.dhs.gov/",
    linkLabel: "Abrir i94.cbp.dhs.gov →",
  },
  i94_admit_until: {
    messageKey: "helper.i94_admit_until",
    url: "https://i94.cbp.dhs.gov/",
    linkLabel: "Abrir i94.cbp.dhs.gov →",
  },
  sevis_id: {
    messageKey: "helper.sevis_id",
    url: "https://studyinthestates.dhs.gov/school-search",
    linkLabel: "Buscar escolas certificadas (SEVP) →",
  },
  i901_fee_paid: {
    messageKey: "helper.i901_fee_paid",
    url: "https://www.fmjfee.com/",
    linkLabel: "Abrir fmjfee.com →",
  },
};

function FieldHelp({ field }: { field: keyof typeof FIELD_HELP }) {
  const { messageKey, url, linkLabel } = FIELD_HELP[field];
  return (
    <p className="text-ink-faint text-xs mt-1.5 leading-relaxed">
      {MESSAGES_PT[messageKey]}{" "}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-pine underline underline-offset-2 whitespace-nowrap"
      >
        {linkLabel}
      </a>
    </p>
  );
}

function formatDateBr(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function daysSinceEntry(isoDate: string): number {
  const DAY = 86_400_000;
  const entry = new Date(`${isoDate}T00:00:00Z`);
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  return Math.floor((todayUtc.getTime() - entry.getTime()) / DAY);
}

function messageFor(uiMessageKey: string, values: Record<string, string> = {}): string {
  const template = (MESSAGES_PT as Record<string, string>)[uiMessageKey];
  if (!template) return "";
  return interpolateMessage(template, values);
}

function valuesForOutcome(outcome: RuleOutcome, form: FormState): Record<string, string> {
  if (outcome.status === "hard_block" && outcome.uiMessageKey === "block.i94_expired" && form.i94_admit_until) {
    return { i94_date: formatDateBr(form.i94_admit_until) };
  }
  if (
    outcome.status === "disclosure_ack_required" &&
    outcome.uiMessageKey === "disclosure.dos_90_day" &&
    form.last_entry_date
  ) {
    return {
      days: String(daysSinceEntry(form.last_entry_date)),
      official_text_pt: OFFICIAL_TEXT_PT_APPROVED
        ? OFFICIAL_TEXT_PT.FAM_302_9_4_B_3_G
        : OFFICIAL_TEXT_PT_PENDING_NOTICE,
    };
  }
  return {};
}

export default function CosB2F1Page() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [caseId, setCaseId] = useState<string | null>(null);
  const [caseStatus, setCaseStatus] = useState<CaseStatus | null>(null);
  const [acknowledgedAt, setAcknowledgedAt] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  const [validating, setValidating] = useState(false);
  const [validateError, setValidateError] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<RuleOutcome[] | null>(null);

  const [acknowledging, setAcknowledging] = useState(false);

  // formRef sempre reflete o form mais recente — persist() lê daqui em vez
  // de depender do valor capturado no closure do momento em que o debounce
  // foi agendado.
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightSaveRef = useRef<Promise<string | null> | null>(null);

  useEffect(() => {
    load();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch("/api/cases/cos-b2-f1");

      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      if (res.status === 404) {
        setCaseId(null);
        setCaseStatus(null);
        setAcknowledgedAt(null);
        setForm(EMPTY_FORM);
        return;
      }
      if (!res.ok) {
        setLoadError(true);
        return;
      }

      const data: { case: CaseRow } = await res.json();
      const kase = data.case;
      setCaseId(kase.id);
      setCaseStatus(kase.status);
      setAcknowledgedAt(kase.dos_90_day_acknowledged_at);
      setForm({
        i94_number: kase.i94_number ?? "",
        last_entry_date: kase.last_entry_date ?? "",
        i94_admit_until: kase.i94_admit_until ?? "",
        sevis_id: kase.sevis_id ?? "",
        i901_fee_paid: kase.i901_fee_paid ?? false,
        enrolled_before_approval: kase.enrolled_before_approval ?? false,
        worked_without_authorization: kase.worked_without_authorization ?? false,
      });
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // Salva os fatos atuais (formRef.current) e devolve o id do caso, ou null
  // em falha. Se já existe um save em voo, ESPERA e grava de novo com o
  // snapshot mais recente — devolver a promise antiga descartaria edições
  // feitas nesse meio-tempo (ex.: digitar o SEVIS ID e clicar "Validar"
  // antes de o autosave anterior terminar).
  async function persist(): Promise<string | null> {
    while (inFlightSaveRef.current) {
      await inFlightSaveRef.current;
    }

    const run = (async (): Promise<string | null> => {
      setSaveState("saving");
      setSaveErrorMsg(null);
      try {
        const f = formRef.current;
        const res = await fetch("/api/cases/cos-b2-f1", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            i94_number: f.i94_number || null,
            last_entry_date: f.last_entry_date || null,
            i94_admit_until: f.i94_admit_until || null,
            sevis_id: f.sevis_id || null,
            i901_fee_paid: f.i901_fee_paid,
            enrolled_before_approval: f.enrolled_before_approval,
            worked_without_authorization: f.worked_without_authorization,
          }),
        });

        if (res.status === 401) {
          router.push("/sign-in");
          return null;
        }

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setSaveState("error");
          setSaveErrorMsg(data.error ?? "Falha ao salvar o caso.");
          return null;
        }

        setCaseId(data.case.id);
        setCaseStatus(data.case.status);
        setSaveState("saved");
        return data.case.id as string;
      } catch {
        setSaveState("error");
        setSaveErrorMsg("Falha ao salvar o caso.");
        return null;
      }
    })();

    inFlightSaveRef.current = run;
    try {
      return await run;
    } finally {
      inFlightSaveRef.current = null;
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      persist();
    }, AUTOSAVE_DEBOUNCE_MS);
  }

  async function validateCase(id: string) {
    setValidating(true);
    setValidateError(null);
    try {
      const res = await fetch(`/api/cases/cos-b2-f1/${id}/validate`, { method: "POST" });

      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      if (res.status === 404) {
        setValidateError("Caso não encontrado. Recarregue a página e tente de novo.");
        return;
      }
      if (!res.ok) {
        setValidateError("Falha ao validar o caso. Tente novamente em instantes.");
        return;
      }

      const data = await res.json();
      setOutcomes(data.outcomes);
      setCaseStatus(data.caseStatus);
    } finally {
      setValidating(false);
    }
  }

  async function handleValidateClick() {
    setValidateError(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const id = await persist();
    if (!id) {
      setValidateError(
        "Não foi possível salvar seu progresso antes de validar. Tente novamente.",
      );
      return;
    }
    await validateCase(id);
  }

  async function acknowledge90Day() {
    if (!caseId || acknowledgedAt) return;
    setAcknowledging(true);
    try {
      const res = await fetch(`/api/cases/cos-b2-f1/${caseId}/acknowledge-90-day`, {
        method: "POST",
      });

      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setAcknowledgedAt(data.acknowledgedAt);
        // A ciência destrava o status (draft -> validated): revalida no
        // servidor para o status persistido refletir o gate fechado.
        if (caseId) await validateCase(caseId);
        return;
      }
      if (res.status === 409) {
        // Já registrado antes (outra aba, clique duplo) — sincroniza com o
        // banco em vez de assumir um timestamp.
        await load(true);
        return;
      }
      // 404/500: mantém não confirmado; o usuário pode tentar de novo.
    } finally {
      setAcknowledging(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="bg-cream-2 rounded-2xl border border-pine-tint p-6 animate-pulse">
            <div className="h-4 bg-pine-tint rounded w-1/3 mb-3" />
            <div className="h-3 bg-pine-tint rounded w-2/3" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (loadError) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-6 py-10 text-center">
          <p className="text-ink-soft text-sm mb-4">Não conseguimos carregar seu caso agora.</p>
          <button onClick={() => load()} className="text-pine underline text-sm font-semibold">
            Tentar novamente
          </button>
        </div>
      </AppShell>
    );
  }

  const hardBlocks = (outcomes ?? []).filter(
    (o): o is Extract<RuleOutcome, { status: "hard_block" }> => o.status === "hard_block",
  );
  const disclosures = (outcomes ?? []).filter(
    (o): o is Extract<RuleOutcome, { status: "disclosure_ack_required" }> =>
      o.status === "disclosure_ack_required",
  );
  const passes = (outcomes ?? []).filter((o) => o.status === "pass");

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold text-ink mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Mudança de status B1/B2 → F-1
        </h1>
        <p className="text-ink-soft text-base mb-4">
          Preencha os fatos do seu caso. O Immigrei valida regras técnicas objetivas — nunca sugere qual caminho seguir.
        </p>

        {caseStatus && (
          <span
            className={[
              "inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6",
              caseStatus === "blocked"
                ? "bg-clay/10 text-clay"
                : caseStatus === "validated"
                  ? "bg-sage/15 text-sage"
                  : "bg-ink/10 text-ink-soft",
            ].join(" ")}
          >
            {CASE_STATUS_LABELS[caseStatus]}
          </span>
        )}

        {/* Formulário de fatos */}
        <div className="bg-cream-2 rounded-2xl border border-pine-tint p-6 mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-4">
            Fatos do seu caso
          </p>

          <div className="mb-4">
            <label className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-1.5 block">
              Número do I-94 (11 caracteres)
            </label>
            <input
              type="text"
              maxLength={11}
              value={form.i94_number}
              onChange={(e) => updateField("i94_number", e.target.value)}
              placeholder="Ex.: 12345678901"
              className="w-full rounded-xl border border-pine-tint bg-cream-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-pine"
            />
            <FieldHelp field="i94_number" />
          </div>

          <div className="mb-4">
            <label className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-1.5 block">
              Data da última entrada nos EUA
            </label>
            <input
              type="date"
              value={form.last_entry_date}
              onChange={(e) => updateField("last_entry_date", e.target.value)}
              className="w-full rounded-xl border border-pine-tint bg-cream-2 px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine"
            />
            <FieldHelp field="last_entry_date" />
          </div>

          <div className="mb-4">
            <label className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-1.5 block">
              Data-limite do I-94 (&quot;Admit Until&quot;)
            </label>
            <input
              type="date"
              value={form.i94_admit_until}
              onChange={(e) => updateField("i94_admit_until", e.target.value)}
              className="w-full rounded-xl border border-pine-tint bg-cream-2 px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine"
            />
            <FieldHelp field="i94_admit_until" />
          </div>

          <div className="mb-4">
            <label className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-1.5 block">
              SEVIS ID (N + 10 dígitos)
            </label>
            <input
              type="text"
              maxLength={11}
              value={form.sevis_id}
              onChange={(e) => updateField("sevis_id", e.target.value)}
              placeholder="Ex.: N0012345678"
              className="w-full rounded-xl border border-pine-tint bg-cream-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-pine"
            />
            <FieldHelp field="sevis_id" />
          </div>

          <label className="flex items-start gap-3 cursor-pointer mb-1">
            <input
              type="checkbox"
              checked={form.i901_fee_paid}
              onChange={(e) => updateField("i901_fee_paid", e.target.checked)}
              className="mt-1 w-4 h-4 flex-shrink-0"
            />
            <span className="text-ink text-sm">Já paguei a taxa SEVIS I-901</span>
          </label>
          <div className="pl-7 mb-3">
            <FieldHelp field="i901_fee_paid" />
          </div>

          <label className="flex items-start gap-3 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={form.enrolled_before_approval}
              onChange={(e) => updateField("enrolled_before_approval", e.target.checked)}
              className="mt-1 w-4 h-4 flex-shrink-0"
            />
            <span className="text-ink text-sm">
              Comecei a estudar antes da aprovação da mudança de status
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={form.worked_without_authorization}
              onChange={(e) => updateField("worked_without_authorization", e.target.checked)}
              className="mt-1 w-4 h-4 flex-shrink-0"
            />
            <span className="text-ink text-sm">
              Trabalhei sem autorização enquanto estava em B1/B2
            </span>
          </label>

          <div className="flex justify-end h-4 mt-2">
            {saveState === "saving" && <p className="text-ink-faint text-xs">Salvando...</p>}
            {saveState === "saved" && (
              <p className="text-sage text-xs font-semibold">Salvo ✓</p>
            )}
            {saveState === "error" && (
              <p className="text-clay text-xs">{saveErrorMsg}</p>
            )}
          </div>
        </div>

        {/* Validar — sempre salva os fatos pendentes antes de validar */}
        <button
          onClick={handleValidateClick}
          disabled={saveState === "saving" || validating}
          className="w-full bg-amber text-ink rounded-xl py-3.5 text-sm font-bold hover:bg-amber-deep transition-colors disabled:opacity-50 mb-2"
        >
          {saveState === "saving" ? "Salvando..." : validating ? "Validando..." : "Validar meu caso"}
        </button>
        {validateError && (
          <p className="text-clay text-xs text-center mb-6">{validateError}</p>
        )}

        {/* Resultados */}
        {outcomes && (
          <div className="mb-6">
            {hardBlocks.map((outcome) => (
              <div
                key={outcome.ruleCode}
                className="bg-clay/10 border border-clay/30 rounded-2xl p-5 mb-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🚫</span>
                  <p className="text-xs font-bold uppercase tracking-widest text-clay">Bloqueio</p>
                </div>
                <p className="text-ink text-sm leading-relaxed mb-4">
                  {messageFor(outcome.uiMessageKey, valuesForOutcome(outcome, form))}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <a
                    href={outcome.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-clay underline underline-offset-2"
                  >
                    Ver a norma oficial →
                  </a>
                  <a
                    href="/profissionais"
                    className="text-xs font-bold text-pine underline underline-offset-2"
                  >
                    Falar com advogado parceiro
                  </a>
                </div>
              </div>
            ))}

            {disclosures.map((outcome) => {
              const isAcknowledged = !!acknowledgedAt;
              return (
                <div
                  key={outcome.ruleCode}
                  className="bg-amber-tint border border-amber/40 rounded-2xl p-5 mb-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">⚠️</span>
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-deep">
                      Ciência necessária
                    </p>
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAcknowledged}
                      disabled={isAcknowledged || acknowledging}
                      onChange={() => acknowledge90Day()}
                      className="mt-1 w-4 h-4 flex-shrink-0"
                    />
                    <span className="text-ink text-sm leading-relaxed">
                      {messageFor(outcome.uiMessageKey, valuesForOutcome(outcome, form))}
                    </span>
                  </label>
                  <a
                    href={outcome.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs font-bold text-amber-deep underline underline-offset-2"
                  >
                    Ver o texto original em inglês →
                  </a>
                  {isAcknowledged && (
                    <p className="text-sage text-xs font-semibold mt-3">✓ Ciência registrada.</p>
                  )}
                </div>
              );
            })}

            {passes.length > 0 && (
              <div className="bg-cream-2 rounded-2xl border border-pine-tint overflow-hidden mb-4">
                <div className="px-6 py-4 border-b border-pine-tint">
                  <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">
                    Verificações
                  </p>
                </div>
                <div className="divide-y divide-pine-tint">
                  {passes.map((outcome) => (
                    <div key={outcome.ruleCode} className="px-6 py-3 flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-sage/20 text-sage flex items-center justify-center flex-shrink-0 text-xs">
                        ✓
                      </span>
                      <p className="text-ink text-sm">
                        {RULE_LABELS[outcome.ruleCode] ?? outcome.ruleCode}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              disabled
              className="w-full rounded-xl py-3.5 text-sm font-semibold bg-ink/10 text-ink-faint cursor-not-allowed"
            >
              Gerar formulário (em breve)
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
