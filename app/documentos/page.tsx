"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/app/components/AppShell";
import CofreLink from "@/app/components/CofreLink";
import CustosLink from "@/app/components/CustosLink";
import GuiasLink from "@/app/components/GuiasLink";
import I94Card from "@/app/components/I94Card";
import { BrandIcon } from "@/app/components/Logo";
import type { UserProcess } from "@/app/components/ParallelProcessesCard";
import { KITS, type Kit, caminhoLabel, caminhoColor } from "@/lib/kitsCatalog";

interface Profile {
  visa_type: string | null;
  location:  "brasil" | "eua" | null;
  main_goal: string | null;
  i94_expiry_date?: string | null;
}

function inferirKitRecomendado(profile: Profile | null): string | null {
  if (!profile) return null;
  const { visa_type, location, main_goal } = profile;

  if (visa_type === "f1") {
    if (main_goal === "renovar_visto") return "f1-renovacao";
    if (location === "brasil")         return "f1";
    if (location === "eua")            return "f1-cos";
  }
  if (visa_type === "m1") {
    if (location === "brasil") return "m1";
    if (location === "eua")    return "m1-cos";
  }
  if (visa_type === "h1b") {
    if (location === "eua")    return "h1b-cos";
    return "h1b";
  }
  if (visa_type === "o1") {
    if (location === "eua")    return "o1-cos";
    return "o1";
  }
  if (visa_type === "l1") {
    if (location === "eua")    return "l1-cos";
    return "l1";
  }
  if (visa_type === "j1") {
    if (location === "eua" && main_goal === "renovar_visto") return "j1-extensao";
    return "j1";
  }
  if (visa_type === "eb2niw") {
    if (location === "eua")    return "eb2niw";
    return "eb2niw-brasil";
  }
  if (visa_type === "green_card") {
    if (main_goal === "cidadania")      return "n400";
    if (main_goal === "renovar_visto")  return "i90";
    if (main_goal === "reentry_permit") return "i131";
    return null; // trazer_familia e demais: painel mostra o card certo
  }
  if (visa_type === "citizen") return null;
  if (visa_type === "b1" || visa_type === "b1b2") {
    return location === "eua" ? "b1-cos" : "b1";
  }
  if (visa_type === "e2")      return location === "eua" ? "e2-cos" : "e2";
  if (visa_type === "e1")      return location === "eua" ? "e1-cos" : "e1";
  if (visa_type === "eb5")     return "eb5";
  if (visa_type === "asylee")  return "asylee";
  if (visa_type === "family-gc")           return "family-gc";
  if (visa_type === "family-gc-overstay")  return "family-gc-overstay";
  if (visa_type === "familia-ir")          return "familia-ir";
  if (visa_type === "overstay-sem-vinculo") return "overstay-sem-vinculo";
  if (visa_type === "dv-lottery")          return "dv-lottery";
  if (visa_type === "dependente-cos")      return "dependente-cos";
  if (location === "brasil")   return "f1";
  if (location === "eua" && main_goal === "renovar_visto") return "f1-renovacao";
  if (location === "eua")      return "f1-cos";
  return null;
}

const GRUPOS_LABEL: Record<string, string> = {
  "F-1": "Estudante acadêmico",
  "M-1": "Curso técnico",
  "J-1": "Intercâmbio",
  "H-1B": "Trabalho especializado",
  "O-1": "Talento extraordinário",
  "L-1": "Transferência intracompanhia",
  "EB-2 NIW": "Green Card",
  "E-2": "Investidor",
  "E-1": "Comerciante",
  "B-1/B-2": "Turismo e negócios",
  "ESTA": "Visa Waiver Program",
  "IR-1/IR-2": "Família de cidadão americano",
  "K-1": "Noivo(a) de cidadão americano",
  "F2A/F2B": "Família de residente permanente",
  "EB-5": "Investimento",
  "Asilo": "Proteção humanitária",
  "Portas estreitas": "Sem vínculo familiar, passou do prazo",
  "F2A + Overstay": "Familiar com Green Card, em overstay",
  "N-400": "Cidadania americana",
  "I-90": "Renovação de Green Card",
  "I-131": "Viagens com Green Card",
  "F-2/H-4/L-2/J-2": "Dependentes",
  "DV Lottery": "Loteria de vistos",
};

export default function DocumentosPage() {
  const router  = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [processos, setProcessos] = useState<UserProcess[]>([]);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { setProfile(d.profile ?? null); setLoading(false); })
      .catch(() => setLoading(false));
    // 403 pra plano grátis é esperado (ninguém free tem processo confirmado
    // mesmo) — só ignora e deixa a lista vazia, sem exibir erro aqui.
    fetch("/api/user-processes")
      .then((r) => (r.ok ? r.json() : { processes: [] }))
      .then((d) => setProcessos(d.processes ?? []))
      .catch(() => {});
  }, []);

  async function removerFixado(id: string) {
    setProcessos((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/user-processes/${id}`, { method: "DELETE" }).catch(() => {});
  }

  const recomendadoId = inferirKitRecomendado(profile);
  const recomendado   = KITS.find((k) => k.id === recomendadoId);

  // Sem kit recomendado (perfil incompleto, residente, etc.) o catálogo
  // completo é a única coisa a mostrar — abre expandido direto.
  const catalogoAberto = mostrarTodos || (!loading && !recomendado);

  // Agrupar os demais kits por código de visto
  const grupos = Object.entries(GRUPOS_LABEL).map(([codigo, label]) => ({
    codigo,
    label,
    kits: KITS.filter((k) => k.codigo === codigo && k.id !== recomendadoId),
  })).filter((g) => g.kits.length > 0);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header — banner verde arredondado, mesmo raio dos cards, com o
            ícone da marca na diagonal: começa perto do rodapé (sob os
            acessos) e sobe até perto do topo, respeitando o padding */}
        <div className="relative overflow-hidden bg-pine-deep rounded-2xl px-5 py-7 mb-7">
          <BrandIcon
            dot="var(--cream)"
            className="absolute opacity-90"
            style={{ left: "68%", right: "4%", top: "44px", bottom: "16px" }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-2 mb-1">
            <p className="text-xs font-bold uppercase tracking-widest text-amber" style={{ letterSpacing: "0.12em" }}>
              Kits de protocolo
            </p>
            <div className="flex flex-wrap gap-2">
              <GuiasLink />
              <CustosLink />
              <CofreLink />
            </div>
          </div>
          <h1 className="relative max-w-[66%] text-3xl font-semibold text-cream mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Documente e protocole
          </h1>
          <p className="relative max-w-[66%] text-pine-tint text-sm leading-relaxed">
            Guias passo a passo em português para você protocolar com confiança — sem depender de traduções automáticas.
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-ink-faint text-sm mb-6">
            <span className="w-4 h-4 rounded-full border-2 border-pine-tint border-t-pine animate-spin inline-block" />
            Identificando seu kit...
          </div>
        )}

        {!loading && profile && <I94Card value={profile.i94_expiry_date ?? null} />}

        {/* Fixados — independente de existir "Seu caminho" ou não. Perfis
            sem kit único recomendado (ex: green_card + trazer_familia) são
            justamente quem mais tende a ter processos em paralelo, então
            isso não pode ficar preso dentro do bloco do recomendado. */}
        {!loading && processos.filter((p) => p.kit_id).length > 0 && (
          <div className="mb-8 flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint" style={{ letterSpacing: "0.1em" }}>
              Fixados — seus processos em paralelo
            </p>
            {processos.filter((p) => p.kit_id).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 rounded-2xl border border-pine-tint bg-cream-2 px-4 py-3 hover:border-pine transition-colors"
              >
                <Link href={`/documentos/${p.kit_id}`} className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="flex-shrink-0 text-sm">📌</span>
                  <span className="flex-1 min-w-0 text-sm font-semibold text-ink truncate">{p.label}</span>
                  <span className="flex-shrink-0 text-xs font-bold text-pine">Abrir →</span>
                </Link>
                <button
                  onClick={() => removerFixado(p.id)}
                  className="flex-shrink-0 text-xs font-bold text-clay hover:text-clay/80 transition-colors"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && recomendado && (
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3" style={{ letterSpacing: "0.1em" }}>
              Seu caminho
            </p>
            <KitCard kit={recomendado} destaque onClick={() => router.push(`/documentos/${recomendado.id}`)} />

            {!catalogoAberto && (
              <button
                onClick={() => setMostrarTodos(true)}
                className="w-full mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-pine border border-pine-tint rounded-2xl py-3 hover:bg-pine-tint transition-colors"
              >
                Explorar outros vistos
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            )}
          </div>
        )}

        {catalogoAberto && grupos.map((grupo) => (
          <div key={grupo.codigo} className="mb-7">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3" style={{ letterSpacing: "0.1em" }}>
              {grupo.codigo} · {grupo.label}
            </p>
            <div className="flex flex-col gap-3">
              {grupo.kits.map((kit) => (
                <KitCard key={kit.id} kit={kit} onClick={() => router.push(`/documentos/${kit.id}`)} />
              ))}
            </div>
          </div>
        ))}

        <p className="text-xs text-ink-faint mt-6 leading-relaxed border-t border-pine-tint pt-5">
          Cada kit inclui guia passo a passo, checklist interativo e modelos de carta.
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
        "w-full text-left rounded-2xl border p-4 transition-all duration-150",
        destaque
          ? "border-pine bg-pine-tint"
          : "border-pine-tint bg-cream-2 hover:border-pine/30 hover:shadow-sm",
        kit.restrito ? "opacity-75" : "",
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
