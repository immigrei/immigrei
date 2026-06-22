"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/app/components/AppShell";

interface Profile {
  visa_type:    string | null;
  location:     "brasil" | "eua" | null;
  main_goal:    string | null;
}

interface Kit {
  id:          string;
  codigo:      string;
  titulo:      string;
  descricao:   string;
  preco:       string;
  caminho:     "consulado" | "cos" | "manutencao";
  parachQuem: string;
  alerta?:     string;
}

const KITS: Kit[] = [
  {
    id:         "f1",
    codigo:     "F-1",
    titulo:     "Visto F-1 via consulado",
    descricao:  "DS-160 + entrevista consular + visto no passaporte. Para quem está no Brasil.",
    preco:      "R$ 197",
    caminho:    "consulado",
    parachQuem: "brasil",
  },
  {
    id:         "f1-cos",
    codigo:     "F-1",
    titulo:     "Mudança para F-1 dentro dos EUA",
    descricao:  "Formulário I-539 direto com o USCIS. Sem entrevista consular. Para quem já está nos EUA com outro visto.",
    preco:      "R$ 247",
    caminho:    "cos",
    parachQuem: "eua",
    alerta:     "Seu status atual precisa estar válido no protocolo.",
  },
  {
    id:         "f1-renovacao",
    codigo:     "F-1",
    titulo:     "Renovação, extensão e transferência F-1",
    descricao:  "Estender o I-20, transferir de escola ou renovar o carimbo para viajar. Já tem F-1.",
    preco:      "R$ 147",
    caminho:    "manutencao",
    parachQuem: "eua",
  },
  {
    id:         "m1",
    codigo:     "M-1",
    titulo:     "Visto M-1 via consulado",
    descricao:  "Curso técnico ou vocacional. DS-160 + entrevista consular. Para quem está no Brasil.",
    preco:      "R$ 197",
    caminho:    "consulado",
    parachQuem: "brasil",
  },
  {
    id:         "m1-cos",
    codigo:     "M-1",
    titulo:     "Mudança para M-1 dentro dos EUA",
    descricao:  "Formulário I-539. Para quem está nos EUA e quer fazer curso técnico. Atenção: M-1 não vira F-1 dentro dos EUA.",
    preco:      "R$ 247",
    caminho:    "cos",
    parachQuem: "eua",
    alerta:     "M-1 dentro dos EUA não pode mudar para F-1 depois.",
  },
];

function inferirKitRecomendado(profile: Profile | null): string | null {
  if (!profile) return null;
  const { visa_type, location, main_goal } = profile;

  if (visa_type === "f1" && main_goal === "renovar_visto") return "f1-renovacao";
  if (visa_type === "f1" && location === "brasil") return "f1";
  if (visa_type === "f1" && location === "eua") return "f1-cos";
  if (visa_type === "m1" && location === "brasil") return "m1";
  if (visa_type === "m1" && location === "eua") return "m1-cos";
  if (location === "brasil") return "f1";
  if (location === "eua" && main_goal === "renovar_visto") return "f1-renovacao";
  if (location === "eua") return "f1-cos";
  return null;
}

const caminhoLabel: Record<Kit["caminho"], string> = {
  consulado:  "Consulado",
  cos:        "Change of Status",
  manutencao: "Manutenção F-1",
};

const caminhoColor: Record<Kit["caminho"], string> = {
  consulado:  "bg-pine-tint text-pine-deep",
  cos:        "bg-amber-tint text-amber-deep",
  manutencao: "bg-cream text-ink-soft border border-pine-tint",
};

export default function DocumentosPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { setProfile(d.profile ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const recomendadoId = inferirKitRecomendado(profile);
  const recomendado   = KITS.find((k) => k.id === recomendadoId);
  const demais        = KITS.filter((k) => k.id !== recomendadoId);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-widest text-pine mb-1" style={{ letterSpacing: "0.12em" }}>
            Kits de protocolo
          </p>
          <h1 className="text-3xl font-semibold text-ink mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Documente e protocole
          </h1>
          <p className="text-ink-soft text-sm leading-relaxed">
            Guias passo a passo em português para você protocolar o seu visto com confiança.
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-ink-faint text-sm mb-6">
            <span className="w-4 h-4 rounded-full border-2 border-pine-tint border-t-pine animate-spin inline-block" />
            Carregando seu perfil...
          </div>
        )}

        {!loading && recomendado && (
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3" style={{ letterSpacing: "0.1em" }}>
              Recomendado para você
            </p>
            <KitCard kit={recomendado} destaque onClick={() => router.push(`/documentos/${recomendado.id}`)} />
          </div>
        )}

        {!loading && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3" style={{ letterSpacing: "0.1em" }}>
              {recomendado ? "Outros kits disponíveis" : "Kits disponíveis"}
            </p>
            <div className="flex flex-col gap-3">
              {(recomendado ? demais : KITS).map((kit) => (
                <KitCard key={kit.id} kit={kit} onClick={() => router.push(`/documentos/${kit.id}`)} />
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-ink-faint mt-10 leading-relaxed">
          Os kits são compras únicas, separadas da mensalidade. Cada kit inclui guia passo a passo,
          checklist interativo, modelos de carta e orientações específicas sobre o que a USCIS avalia.
          Não substituem aconselhamento jurídico.
        </p>
      </div>
    </AppShell>
  );
}

function KitCard({ kit, destaque, onClick }: { kit: Kit; destaque?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left rounded-2xl border p-4 transition-all duration-150 hover:shadow-sm",
        destaque
          ? "border-pine bg-pine-tint"
          : "border-pine-tint bg-cream-2 hover:border-pine/30",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold bg-ink/10 text-ink-soft px-2 py-0.5 rounded-full uppercase">
            {kit.codigo}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${caminhoColor[kit.caminho]}`}>
            {caminhoLabel[kit.caminho]}
          </span>
          {destaque && (
            <span className="text-xs font-bold bg-amber text-pine-deep px-2 py-0.5 rounded-full uppercase">
              Para você
            </span>
          )}
        </div>
        <span className="text-sm font-bold text-pine flex-shrink-0">{kit.preco}</span>
      </div>

      <p className="text-sm font-semibold text-ink mb-1">{kit.titulo}</p>
      <p className="text-xs text-ink-soft leading-relaxed">{kit.descricao}</p>

      {kit.alerta && (
        <div className="mt-3 bg-amber-tint border border-amber/30 rounded-xl px-3 py-2">
          <p className="text-xs text-amber-deep font-medium">{kit.alerta}</p>
        </div>
      )}
    </button>
  );
}
