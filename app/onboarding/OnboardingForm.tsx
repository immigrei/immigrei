"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const VISA_OPTIONS = [
  { value: "f1",         label: "F-1 — Estudante acadêmico" },
  { value: "m1",         label: "M-1 — Curso técnico ou vocacional" },
  { value: "h1b",        label: "H-1B — Trabalho especializado" },
  { value: "o1",         label: "O-1 — Talento extraordinário" },
  { value: "l1",         label: "L-1 — Transferência intraempresarial" },
  { value: "b1b2",       label: "B-1/B-2 — Turismo ou negócios" },
  { value: "green_card", label: "Green Card (residente permanente)" },
  { value: "asylee",     label: "Asilo ou refugiado" },
  { value: "outro",      label: "Outro / Não sei ao certo" },
];

const GOAL_OPTIONS = [
  { value: "aplicar_visto",     label: "Aplicar para um visto pela primeira vez" },
  { value: "regularizar_status", label: "Regularizar minha situação" },
  { value: "renovar_visto",     label: "Renovar ou estender meu visto" },
  { value: "green_card",        label: "Solicitar o Green Card" },
  { value: "trazer_familia",    label: "Trazer minha família" },
  { value: "entender_direitos", label: "Entender meus direitos" },
  { value: "cidadania",         label: "Buscar a cidadania americana" },
  { value: "outro",             label: "Outro" },
];

type Step = 1 | 2 | 3;

interface FormData {
  visa_type:    string;
  location:     "brasil" | "eua" | "";
  arrival_date: string;
  main_goal:    string;
}

export default function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    visa_type:    "",
    location:     "",
    arrival_date: "",
    main_goal:    "",
  });

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  function canAdvance(): boolean {
    if (step === 1) return !!form.visa_type;
    if (step === 2) return !!form.location;
    if (step === 3) return !!form.main_goal;
    return false;
  }

  function handleNext() {
    if (!canAdvance()) {
      setError("Por favor, selecione uma opção para continuar.");
      return;
    }
    if (step < 3) setStep((s) => (s + 1) as Step);
  }

  async function handleSubmit() {
    if (!canAdvance()) {
      setError("Por favor, selecione uma opção para continuar.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: Record<string, string> = {
        visa_type: form.visa_type,
        location:  form.location,
        main_goal: form.main_goal,
      };
      if (form.location === "eua" && form.arrival_date) {
        payload.arrival_date = form.arrival_date;
      }
      const res = await fetch("/api/profile", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      router.push("/dashboard");
    } catch {
      setError("Algo deu errado. Tente novamente.");
      setLoading(false);
    }
  }

  const progressPct = ((step - 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between">
        <span className="text-xl font-semibold text-pine" style={{ fontFamily: "var(--font-display)" }}>
          Immigrei
        </span>
        <span className="text-sm text-ink-faint font-medium">{step} de 3</span>
      </header>

      <div className="h-1 bg-pine-tint mx-6 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPct + 33}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {step === 1 && (
            <StepVisaType value={form.visa_type} onChange={(v) => set("visa_type", v)} />
          )}
          {step === 2 && (
            <StepLocation
              location={form.location}
              arrivalDate={form.arrival_date}
              onLocation={(v) => set("location", v as FormData["location"])}
              onArrivalDate={(v) => set("arrival_date", v)}
            />
          )}
          {step === 3 && (
            <StepMainGoal value={form.main_goal} onChange={(v) => set("main_goal", v)} />
          )}

          {error && <p className="mt-4 text-sm text-clay text-center">{error}</p>}

          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="flex-1 py-3 rounded-xl border border-pine-tint text-pine font-semibold text-sm hover:bg-pine-tint transition-colors"
              >
                Voltar
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canAdvance()}
                className="flex-1 py-3 rounded-xl bg-pine text-cream font-semibold text-sm hover:bg-pine-deep transition-colors disabled:opacity-40"
              >
                Continuar
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canAdvance() || loading}
                className="flex-1 py-3 rounded-xl bg-amber text-ink font-semibold text-sm hover:bg-amber-deep transition-colors disabled:opacity-40"
              >
                {loading ? "Salvando..." : "Ver minha jornada →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────────

function StepVisaType({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3">Situação atual</p>
      <h1 className="text-2xl font-semibold text-ink mb-6 leading-snug" style={{ fontFamily: "var(--font-display)" }}>
        Qual é o seu tipo de visto atualmente?
      </h1>
      <div className="flex flex-col gap-2">
        {VISA_OPTIONS.map((opt) => (
          <OptionCard key={opt.value} label={opt.label} selected={value === opt.value} onClick={() => onChange(opt.value)} />
        ))}
      </div>
    </div>
  );
}

function StepLocation({
  location,
  arrivalDate,
  onLocation,
  onArrivalDate,
}: {
  location: string;
  arrivalDate: string;
  onLocation: (v: string) => void;
  onArrivalDate: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3">Sua localização</p>
      <h1 className="text-2xl font-semibold text-ink mb-6 leading-snug" style={{ fontFamily: "var(--font-display)" }}>
        Onde você está agora?
      </h1>
      <div className="flex flex-col gap-2">
        <OptionCard
          label="No Brasil"
          description="Quero aplicar para um visto americano"
          selected={location === "brasil"}
          onClick={() => onLocation("brasil")}
        />
        <OptionCard
          label="Nos Estados Unidos"
          description="Já estou nos EUA com um visto ou autorização"
          selected={location === "eua"}
          onClick={() => onLocation("eua")}
        />
      </div>

      {location === "eua" && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-ink mb-2">Quando você chegou nos EUA?</p>
          <p className="text-xs text-ink-faint mb-3">Uma data aproximada é suficiente.</p>
          <input
            type="date"
            value={arrivalDate}
            onChange={(e) => onArrivalDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-3 rounded-xl border border-pine-tint bg-cream-2 text-ink text-base focus:outline-none focus:ring-2 focus:ring-pine focus:border-pine transition"
          />
        </div>
      )}
    </div>
  );
}

function StepMainGoal({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3">Seu objetivo</p>
      <h1 className="text-2xl font-semibold text-ink mb-6 leading-snug" style={{ fontFamily: "var(--font-display)" }}>
        O que você mais precisa agora?
      </h1>
      <div className="flex flex-col gap-2">
        {GOAL_OPTIONS.map((opt) => (
          <OptionCard key={opt.value} label={opt.label} selected={value === opt.value} onClick={() => onChange(opt.value)} />
        ))}
      </div>
    </div>
  );
}

function OptionCard({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
        selected
          ? "border-pine bg-pine-tint text-pine"
          : "border-pine-tint bg-cream-2 text-ink hover:border-pine"
      }`}
    >
      {label}
      {description && (
        <span className={`block text-xs font-normal mt-0.5 ${selected ? "text-pine/70" : "text-ink-faint"}`}>
          {description}
        </span>
      )}
    </button>
  );
}
