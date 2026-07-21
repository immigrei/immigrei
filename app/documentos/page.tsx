"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import CofreLink from "@/app/components/CofreLink";

interface Profile {
  visa_type: string | null;
  location:  "brasil" | "eua" | null;
  main_goal: string | null;
}

interface Kit {
  id:         string;
  codigo:     string;
  titulo:     string;
  descricao:  string;
  caminho:    "consulado" | "cos" | "manutencao";
  alerta?:    string;
  preco?:     string;  // etiqueta de preço do kit (ex: OPT "R$ 147")
  restrito?:  boolean; // ex: E-2 não disponível para brasileiros
}

const KITS: Kit[] = [
  // ── F-1 ──────────────────────────────────────────────────────────────
  {
    id: "f1", codigo: "F-1", caminho: "consulado",
    titulo:   "Visto F-1 via consulado",
    descricao:"DS-160 + entrevista consular. Para quem está no Brasil e quer estudar nos EUA.",
  },
  {
    id: "f1-cos", codigo: "F-1", caminho: "cos",
    titulo:   "Mudança para F-1 dentro dos EUA",
    descricao:"Formulário I-539 direto com o USCIS. Para quem já está nos EUA com outro visto.",
    alerta:   "Seu status atual precisa estar válido no protocolo.",
  },
  {
    id: "f1-renovacao", codigo: "F-1", caminho: "manutencao",
    titulo:   "Renovação, extensão e transferência F-1",
    descricao:"Estender o I-20, transferir de escola ou renovar o carimbo para viajar. Já tem F-1.",
  },
  {
    id: "f1-opt", codigo: "F-1", caminho: "manutencao", preco: "R$ 147",
    titulo:   "OPT — autorização de trabalho (I-765)",
    descricao:"Preencha o I-765 em português e exporte o formulário oficial em inglês. Para quem vai trabalhar na área depois de formar.",
  },
  // ── M-1 ──────────────────────────────────────────────────────────────
  {
    id: "m1", codigo: "M-1", caminho: "consulado",
    titulo:   "Visto M-1 via consulado",
    descricao:"Curso técnico ou vocacional. DS-160 + entrevista consular. Para quem está no Brasil.",
  },
  {
    id: "m1-cos", codigo: "M-1", caminho: "cos",
    titulo:   "Mudança para M-1 dentro dos EUA",
    descricao:"Formulário I-539. Atenção: M-1 dentro dos EUA não pode mudar para F-1 depois.",
    alerta:   "Restrição permanente: M-1 não vira F-1 dentro dos EUA.",
  },
  // ── J-1 ──────────────────────────────────────────────────────────────
  {
    id: "j1", codigo: "J-1", caminho: "consulado",
    titulo:   "Visto J-1 via consulado",
    descricao:"Intercâmbio cultural patrocinado. DS-160 + DS-2019 do patrocinador autorizado.",
  },
  {
    id: "j1-extensao", codigo: "J-1", caminho: "manutencao",
    titulo:   "Extensão do J-1 via patrocinador",
    descricao:"Extensão feita pelo patrocinador no SEVIS, sem formulário USCIS. Inclui guia da regra dos 2 anos.",
  },
  // ── H-1B ─────────────────────────────────────────────────────────────
  {
    id: "h1b", codigo: "H-1B", caminho: "consulado",
    titulo:   "H-1B — Guia para o funcionário",
    descricao:"O empregador faz a petição. Este kit te orienta sobre o que reunir e entregar ao RH/advogado.",
    alerta:   "Sujeito a sorteio anual. Cap de 65.000 vagas + 20.000 para mestrado.",
  },
  {
    id: "h1b-cos", codigo: "H-1B", caminho: "cos",
    titulo:   "H-1B Change of Status — dentro dos EUA",
    descricao:"Para quem já está nos EUA e o empregador vai pedir o H-1B com COS. Guia do que o funcionário precisa providenciar.",
  },
  // ── O-1 ──────────────────────────────────────────────────────────────
  {
    id: "o1", codigo: "O-1", caminho: "consulado",
    titulo:   "O-1 — Habilidade extraordinária via consulado",
    descricao:"Sem sorteio, sem cap. Exige empregador ou agente americano e evidências robustas de reconhecimento.",
  },
  {
    id: "o1-cos", codigo: "O-1", caminho: "cos",
    titulo:   "O-1 Change of Status — dentro dos EUA",
    descricao:"Para quem já está nos EUA. O empregador ou agente protocola o I-129 com pedido de COS.",
  },
  // ── L-1 ──────────────────────────────────────────────────────────────
  {
    id: "l1", codigo: "L-1", caminho: "consulado",
    titulo:   "L-1 — Transferência intracompanhia via consulado",
    descricao:"Para executivos, gerentes e especialistas transferidos. A empresa nos dois países precisa ter vínculo corporativo.",
  },
  {
    id: "l1-cos", codigo: "L-1", caminho: "cos",
    titulo:   "L-1 Change of Status — dentro dos EUA",
    descricao:"Já está nos EUA com outro visto e vai ser transferido pela empresa. Guia de documentos para o RH.",
  },
  // ── EB-2 NIW ─────────────────────────────────────────────────────────
  {
    id: "eb2niw", codigo: "EB-2 NIW", caminho: "cos",
    titulo:   "EB-2 NIW — Ajuste de Status (dentro dos EUA)",
    descricao:"Green card por interesse nacional. Auto-petição via I-140 + I-485. Para quem já está nos EUA.",
  },
  {
    id: "eb2niw-brasil", codigo: "EB-2 NIW", caminho: "consulado",
    titulo:   "EB-2 NIW — Processamento consular (fora dos EUA)",
    descricao:"Após aprovação do I-140, processo segue pelo NVC e entrevista no consulado americano no Brasil.",
  },
  // ── E-2 ──────────────────────────────────────────────────────────────
  {
    id: "e2", codigo: "E-2", caminho: "consulado",
    titulo:   "E-2 — Visto de Investidor (países com tratado)",
    descricao:"Para nacionais de países com tratado com os EUA: Portugal, Alemanha, França, Itália, Espanha, Japão, Coreia do Sul e outros.",
    alerta:   "NÃO disponível para brasileiros. Verifique se seu país tem tratado E-2 com os EUA.",
    restrito: true,
  },
  // ── B-1/B-2 ──────────────────────────────────────────────────────────
  {
    id: "b1", codigo: "B-1/B-2", caminho: "consulado",
    titulo:   "B-1/B-2 — Turismo e negócios via consulado",
    descricao:"DS-160 + entrevista consular. Inclui orientações sobre prova de vínculo com o Brasil e documentação financeira.",
  },
  // ── E-1 ──────────────────────────────────────────────────────────────
  {
    id: "e1", codigo: "E-1", caminho: "consulado",
    titulo:   "E-1 — Visto de Comerciante (países com tratado)",
    descricao:"Para nacionais de países com tratado de comércio com os EUA, com volume bilateral substancial de comércio.",
    alerta:   "NÃO disponível para brasileiros. Verifique se seu país tem tratado E-1 com os EUA.",
    restrito: true,
  },
  // ── ESTA ─────────────────────────────────────────────────────────────
  {
    id: "esta", codigo: "ESTA", caminho: "consulado",
    titulo:   "ESTA — Autorização Eletrônica de Viagem",
    descricao:"Para nacionais de países do Visa Waiver Program. Visitas de até 90 dias, sem trabalho.",
  },
  // ── Família de cidadão americano ───────────────────────────────────────
  {
    id: "familia-ir", codigo: "IR-1/IR-2", caminho: "consulado",
    titulo:   "Família de Cidadão Americano — via consular",
    descricao:"Petição I-130 pelo parente cidadão + visto de imigrante (DS-260) ou ajuste de status (I-485). Sem fila de espera.",
  },
  {
    id: "k1", codigo: "K-1", caminho: "consulado",
    titulo:   "K-1 — Noivo(a) de Cidadão Americano",
    descricao:"Petição I-129F pelo cidadão + visto K-1 + casamento em até 90 dias + ajuste de status (I-485).",
  },
  // ── Família de titular de Green Card ────────────────────────────────────
  {
    id: "family-gc", codigo: "F2A/F2B", caminho: "consulado",
    titulo:   "Cônjuge ou Filho de Residente Permanente",
    descricao:"Petição I-130 pelo titular do Green Card. Categoria com fila — acompanhe a data de prioridade no Boletim de Vistos.",
  },
  // ── EB-5 ─────────────────────────────────────────────────────────────
  {
    id: "eb5", codigo: "EB-5", caminho: "consulado",
    titulo:   "EB-5 — Green Card por Investimento",
    descricao:"Investimento de capital próprio em negócio que crie empregos americanos. Autopetição, sem patrocinador.",
  },
  // ── Asilo ────────────────────────────────────────────────────────────
  {
    id: "asylee", codigo: "Asilo", caminho: "manutencao",
    titulo:   "Asilo — Proteção Humanitária",
    descricao:"I-589 dentro do prazo de 1 ano da entrada. Caso sensível — acompanhamento de advogado fortemente recomendado.",
  },
  // ── Portas estreitas (overstay sem vínculo) ─────────────────────────────
  {
    id: "overstay-sem-vinculo", codigo: "Portas estreitas", caminho: "manutencao",
    titulo:   "Passou do prazo, sem vínculo familiar",
    descricao:"Waiver, cancelamento de remoção, VAWA, U-visa ou T-visa — depende de fatos do seu caso. Acompanhamento de advogado necessário.",
    alerta:   "Não existe processo único aqui — mapeamos as portas reais antes de você falar com um profissional.",
  },
  {
    id: "family-gc-overstay", codigo: "F2A + Overstay", caminho: "manutencao",
    titulo:   "Familiar com Green Card, você em overstay",
    descricao:"Protocole a petição agora para garantir a fila — o próximo passo depende de naturalização do familiar ou de waiver consular.",
  },
  // ── Green Card holder ───────────────────────────────────────────────────
  {
    id: "n400", codigo: "N-400", caminho: "manutencao",
    titulo:   "Naturalização — Cidadania Americana",
    descricao:"5 anos como residente (ou 3, com cônjuge cidadão). Protocolo, biometria, entrevista e juramento.",
  },
  {
    id: "i90", codigo: "I-90", caminho: "manutencao",
    titulo:   "Renovação do Green Card",
    descricao:"Cartão de 10 anos vencido ou a vencer em 6 meses. Direto com o USCIS, sem entrevista consular.",
  },
  {
    id: "i131", codigo: "I-131", caminho: "manutencao",
    titulo:   "Reentry Permit — Permissão de Reentrada",
    descricao:"Protege o Green Card em ausências de até 2 anos. Precisa ser protocolado ANTES de sair dos EUA.",
  },
  // ── Mudança de status / extensão dentro dos EUA ─────────────────────────
  {
    id: "b1-cos", codigo: "B-1/B-2", caminho: "cos",
    titulo:   "Extensão ou mudança de status — B-1/B-2",
    descricao:"I-539 antes do I-94 vencer. Extensão de permanência ou troca para outro visto.",
  },
  {
    id: "e2-cos", codigo: "E-2", caminho: "cos",
    titulo:   "E-2 — Mudança de status dentro dos EUA",
    descricao:"I-129 direto com o USCIS, sem consulado. Mesmos 4 requisitos do E-2 consular.",
  },
  {
    id: "e1-cos", codigo: "E-1", caminho: "cos",
    titulo:   "E-1 — Mudança de status dentro dos EUA",
    descricao:"I-129 direto com o USCIS, sem consulado. Mesmo volume de comércio bilateral exigido.",
  },
  {
    id: "dependente-cos", codigo: "F-2/H-4/L-2/J-2", caminho: "cos",
    titulo:   "Extensão de status de dependente",
    descricao:"I-539 atrelado à extensão do titular principal. Autorização de trabalho varia por categoria.",
  },
  // ── DV Lottery ───────────────────────────────────────────────────────────
  {
    id: "dv-lottery", codigo: "DV Lottery", caminho: "consulado",
    titulo:   "Diversity Visa Program — Loteria de Vistos",
    descricao:"Inscrição eletrônica gratuita. Brasil foi excluído dos últimos ciclos — confirme a elegibilidade do seu país.",
  },
];

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
  if (location === "brasil")   return "f1";
  if (location === "eua" && main_goal === "renovar_visto") return "f1-renovacao";
  if (location === "eua")      return "f1-cos";
  return null;
}

const caminhoLabel: Record<Kit["caminho"], string> = {
  consulado:  "Consulado",
  cos:        "Change of Status",
  manutencao: "Manutenção",
};

const caminhoColor: Record<Kit["caminho"], string> = {
  consulado:  "bg-pine-tint text-pine-deep",
  cos:        "bg-amber-tint text-amber-deep",
  manutencao: "bg-cream text-ink-soft border border-pine-tint",
};

const GRUPOS_LABEL: Record<string, string> = {
  "F-1": "Estudante acadêmico",
  "M-1": "Curso técnico",
  "J-1": "Intercâmbio",
  "H-1B": "Trabalho especializado",
  "O-1": "Talento extraordinário",
  "L-1": "Transferência intracompanhia",
  "EB-2 NIW": "Green Card",
  "E-2": "Investidor",
  "B-1/B-2": "Turismo e negócios",
};

export default function DocumentosPage() {
  const router  = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { setProfile(d.profile ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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

        <div className="mb-7">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <p className="text-xs font-bold uppercase tracking-widest text-pine" style={{ letterSpacing: "0.12em" }}>
              Kits de protocolo
            </p>
            <CofreLink />
          </div>
          <h1 className="text-3xl font-semibold text-ink mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Documente e protocole
          </h1>
          <p className="text-ink-soft text-sm leading-relaxed">
            Guias passo a passo em português para você protocolar com confiança — sem depender de traduções automáticas.
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-ink-faint text-sm mb-6">
            <span className="w-4 h-4 rounded-full border-2 border-pine-tint border-t-pine animate-spin inline-block" />
            Identificando seu kit...
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
