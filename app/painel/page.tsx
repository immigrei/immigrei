"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/app/components/AppShell";

interface Profile {
  full_name:    string | null;
  visa_type:    string | null;
  location:     "brasil" | "eua" | null;
  main_goal:    string | null;
  arrival_date: string | null;
}

// ── Strategy engine ───────────────────────────────────────────────────────────

interface Etapa {
  num:    string;
  titulo: string;
  desc:   string;
  estado: "feito" | "agora" | "proximo" | "futuro" | "alerta";
  data?:  string;
  tag?:   string;
}

interface GuardRail {
  tipo:  "proibido" | "atencao";
  texto: string;
}

interface Strategy {
  titulo:      string;
  subtitulo:   string;
  situacao:    string;
  destaque?:   { tipo: "alerta" | "ok"; texto: string };
  etapas:      Etapa[];
  guardrails:  GuardRail[];
  kitId:       string;
  kitLabel:    string;
}

function getStrategy(profile: Profile): Strategy {
  const { visa_type, location, main_goal, full_name } = profile;
  const nome = full_name?.split(" ")[0] ?? "você";

  // ── F-1 do Brasil ────────────────────────────────────────────────────
  if (visa_type === "f1" && location === "brasil") {
    return {
      titulo:    `Jornada do ${nome}`,
      subtitulo: "F-1 via consulado · saindo do Brasil",
      situacao:  `Você está no Brasil e quer obter o visto F-1 para estudar nos EUA. O processo passa pelo consulado americano no Brasil — sem saída prévia dos EUA necessária.`,
      etapas: [
        { num: "1", estado: "agora",   titulo: "Matrícula + I-20",         desc: "Confirme a matrícula em escola SEVP e solicite o I-20 ao DSO." },
        { num: "2", estado: "proximo", titulo: "Pagar taxa SEVIS",          desc: "US$350 em fls.dhs.gov. Guarde o comprovante I-901.", tag: "US$350" },
        { num: "3", estado: "proximo", titulo: "Preencher DS-160",          desc: "Formulário do Departamento de Estado — campo a campo no kit." },
        { num: "4", estado: "proximo", titulo: "Montar dossiê",             desc: "Extrato pessoal, vínculo com Brasil, carta de sponsor se aplicável." },
        { num: "5", estado: "futuro",  titulo: "Agendar entrevista",        desc: "Consulados em SP, RJ, Recife, Brasília ou Porto Alegre." },
        { num: "6", estado: "futuro",  titulo: "Entrevista consular",       desc: "2–5 minutos. O cônsul já leu o dossiê. Seja direto e confiante.", tag: "2–8 semanas" },
        { num: "✓", estado: "futuro",  titulo: "Visto aprovado + viagem",   desc: "F-1 no passaporte. Visto válido para entrar nos EUA." },
      ],
      guardrails: [
        { tipo: "atencao",  texto: "Escola a mais de 2h de onde você vai morar pode causar negação por 'programa presencial implausível'." },
        { tipo: "atencao",  texto: "Extrato bancário precisa estar no seu nome. Extrato da empresa ou de terceiros não é aceito." },
        { tipo: "proibido", texto: "Não marque a entrevista antes de ter o I-20 e o SEVIS pago. A ordem importa." },
      ],
      kitId:    "f1",
      kitLabel: "Kit F-1 via consulado",
    };
  }

  // ── F-1 COS nos EUA ──────────────────────────────────────────────────
  if (visa_type === "f1" && location === "eua") {
    return {
      titulo:    `Jornada do ${nome}`,
      subtitulo: "F-1 · Change of Status — dentro dos EUA",
      situacao:  `Você está nos EUA e quer mudar para o F-1 sem sair do país. O processo usa o formulário I-539 direto com o USCIS — sem entrevista consular, mas exige status válido no protocolo.`,
      destaque: { tipo: "alerta", texto: "Seu status atual precisa estar válido no dia do protocolo do I-539. Verifique o I-94 antes de qualquer passo." },
      etapas: [
        { num: "1", estado: "agora",   titulo: "Verificar status no I-94",    desc: "i94.cbp.dhs.gov — confirme que você ainda está em status válido." },
        { num: "2", estado: "proximo", titulo: "Escolher escola SEVP próxima", desc: "Escola presencial longe da sua residência resulta em negação." },
        { num: "3", estado: "proximo", titulo: "Obter o I-20",                desc: "Escola emite o I-20 após matrícula confirmada." },
        { num: "4", estado: "proximo", titulo: "Reunir documentação financeira", desc: "Extrato pessoal de 6 meses. No seu nome. PDF oficial do banco.", tag: "Crítico" },
        { num: "5", estado: "proximo", titulo: "Preencher e enviar I-539",    desc: "Taxa US$370 por money order. Endereço varia por estado.", tag: "US$370" },
        { num: "6", estado: "futuro",  titulo: "Receber I-797 de recebimento", desc: "Guarde este documento — prova que você protocolou em status." },
        { num: "7", estado: "futuro",  titulo: "Aprovação do I-539",          desc: "Prazo médio: 4–8 meses. Premium Processing disponível.", tag: "4–8 meses" },
        { num: "✓", estado: "futuro",  titulo: "F-1 aprovado — início das aulas", desc: "Status F-1 ativo, pode começar o programa." },
      ],
      guardrails: [
        { tipo: "proibido", texto: "Não saia dos EUA enquanto o I-539 está pendente sem consultar um advogado." },
        { tipo: "proibido", texto: "Não comece as aulas antes da aprovação do I-539." },
        { tipo: "atencao",  texto: "RFE (pedido de evidência adicional) pode acontecer — o kit inclui guia de resposta." },
      ],
      kitId:    "f1-cos",
      kitLabel: "Kit F-1 Change of Status",
    };
  }

  // ── F-1 Renovação ────────────────────────────────────────────────────
  if (visa_type === "f1" && main_goal === "renovar_visto") {
    return {
      titulo:    `Jornada do ${nome}`,
      subtitulo: "F-1 · Manutenção de status",
      situacao:  `Você já tem o F-1 e precisa estender o programa, transferir de escola ou renovar o carimbo do visto para poder viajar. Cada situação tem um caminho diferente.`,
      etapas: [
        { num: "A", estado: "agora",   titulo: "Extensão do I-20 (programa vai vencer)", desc: "Solicite ao DSO da sua escola antes do vencimento. Sem USCIS, sem taxa federal." },
        { num: "B", estado: "agora",   titulo: "Transferência para outra escola",         desc: "DSO atual libera o SEVIS. Você tem 15 dias para começar na nova escola." },
        { num: "C", estado: "agora",   titulo: "Renovação do carimbo (para viajar)",      desc: "Sair dos EUA pode acionar barreiras de reentrada. Consulte seu DSO antes.", tag: "Risco" },
      ],
      guardrails: [
        { tipo: "proibido", texto: "Não transfira de escola sem fazer a transferência SEVIS primeiro — você perde o status F-1." },
        { tipo: "atencao",  texto: "Antes de qualquer viagem internacional, verifique se há unlawful presence acumulada com o DSO." },
        { tipo: "atencao",  texto: "O visto expirado não afeta seu status nos EUA — só afeta a reentrada após viagem." },
      ],
      kitId:    "f1-renovacao",
      kitLabel: "Kit F-1 Manutenção",
    };
  }

  // ── M-1 do Brasil ────────────────────────────────────────────────────
  if (visa_type === "m1" && location === "brasil") {
    return {
      titulo:    `Jornada do ${nome}`,
      subtitulo: "M-1 via consulado · saindo do Brasil",
      situacao:  `Você está no Brasil e quer o M-1 para fazer um curso técnico ou vocacional nos EUA. O processo é similar ao F-1, mas com a taxa SEVIS mais baixa e foco em programa vocacional.`,
      etapas: [
        { num: "1", estado: "agora",   titulo: "Escola técnica SEVP + I-20 M-1",  desc: "Matrícula em escola vocacional credenciada. I-20 M-1 é diferente do F-1." },
        { num: "2", estado: "proximo", titulo: "Taxa SEVIS M-1",                   desc: "US$200 (menor que o F-1) em fls.dhs.gov.", tag: "US$200" },
        { num: "3", estado: "proximo", titulo: "DS-160 + dossiê",                  desc: "Campo a campo no kit. Mesmo processo do F-1 com variações para M-1." },
        { num: "4", estado: "futuro",  titulo: "Entrevista consular",              desc: "O cônsul vai perguntar sobre plano de carreira pós-curso. Prepare uma resposta clara." },
        { num: "✓", estado: "futuro",  titulo: "Visto M-1 aprovado",              desc: "Duração máxima de 1 ano (prorrogável)." },
      ],
      guardrails: [
        { tipo: "proibido", texto: "M-1 NÃO pode mudar para F-1 dentro dos EUA. Se quiser estudar academicamente depois, precisará sair e aplicar F-1 pelo consulado." },
        { tipo: "atencao",  texto: "Prepare resposta clara para 'Por que você precisa fazer esse curso nos EUA?' — diferencial da entrevista M-1." },
      ],
      kitId:    "m1",
      kitLabel: "Kit M-1 via consulado",
    };
  }

  // ── H-1B ─────────────────────────────────────────────────────────────
  if (visa_type === "h1b") {
    return {
      titulo:    `Jornada do ${nome}`,
      subtitulo: "H-1B · Trabalho especializado",
      situacao:  `O H-1B é patrocinado pelo seu empregador americano — você não pode protocolar sozinho. O processo envolve o Departamento do Trabalho, o USCIS e o sorteio anual. Seu papel é garantir que os documentos estejam perfeitos.`,
      destaque: { tipo: "alerta", texto: "O H-1B está sujeito a sorteio anual. O período de registro é em março. Fora dessa janela, não há como entrar na fila." },
      etapas: [
        { num: "1", estado: "agora",   titulo: "Reunir documentos para o empregador", desc: "Diploma, histórico, currículo, documentos de identidade — veja o kit completo." },
        { num: "2", estado: "proximo", titulo: "Empregador submete o registro (março)", desc: "Período de registro: 1–18 de março. O empregador faz online.", tag: "Março" },
        { num: "3", estado: "proximo", titulo: "Sorteio + notificação",                desc: "USCIS seleciona aleatoriamente. Resultados em abril." },
        { num: "4", estado: "futuro",  titulo: "LCA aprovada pelo DOL",               desc: "Labor Condition Application — o empregador submete em ~7 dias." },
        { num: "5", estado: "futuro",  titulo: "I-129 submetido ao USCIS",            desc: "Petição completa após a LCA. Prazo padrão ou Premium Processing." },
        { num: "6", estado: "futuro",  titulo: "I-797 aprovado + entrevista/COS",     desc: "Entrevista consular se fora dos EUA, ou COS se já está aqui.", tag: "I-797" },
        { num: "✓", estado: "futuro",  titulo: "H-1B ativo — início do trabalho",    desc: "Válido a partir de 1º de outubro do mesmo ano." },
      ],
      guardrails: [
        { tipo: "atencao",  texto: "Mantenha comunicação constante com o RH e o advogado de imigração do empregador." },
        { tipo: "atencao",  texto: "Cap-exempt (universidades, hospitais sem fins lucrativos) pode ser peticionado a qualquer momento, sem sorteio." },
      ],
      kitId:    location === "eua" ? "h1b-cos" : "h1b",
      kitLabel: "Kit H-1B — guia do funcionário",
    };
  }

  // ── O-1 ──────────────────────────────────────────────────────────────
  if (visa_type === "o1") {
    return {
      titulo:    `Jornada do ${nome}`,
      subtitulo: "O-1 · Habilidade extraordinária",
      situacao:  `O O-1 não tem sorteio, não tem cap. Mas exige evidências sólidas de reconhecimento nacional ou internacional — prêmios, mídia, salário acima da média, contribuições originais. Um empregador ou agente americano precisa fazer a petição.`,
      destaque: { tipo: "ok", texto: "Sem cap e sem sorteio — pode ser protocolado a qualquer momento do ano." },
      etapas: [
        { num: "1", estado: "agora",   titulo: "Mapear evidências de habilidade extraordinária", desc: "Prêmios, cobertura de mídia, salário, publicações, membros em associações. O kit lista as categorias USCIS." },
        { num: "2", estado: "proximo", titulo: "Advisory Opinion da associação da área",         desc: "Carta de uma associação profissional ou sindicato reconhecido." },
        { num: "3", estado: "proximo", titulo: "Empregador ou agente protocola o I-129",         desc: "Com toda a documentação de suporte. Advogado de imigração é altamente recomendado.", tag: "I-129" },
        { num: "4", estado: "futuro",  titulo: "I-797 aprovado",                                 desc: "Aprovação em 2–4 meses (padrão) ou 15 dias úteis (Premium Processing)." },
        { num: "5", estado: "futuro",  titulo: "Entrevista consular ou COS",                     desc: "Se fora dos EUA: entrevista. Se já nos EUA: COS com o mesmo I-129." },
        { num: "✓", estado: "futuro",  titulo: "O-1 ativo",                                     desc: "Válido por até 3 anos, renovável." },
      ],
      guardrails: [
        { tipo: "atencao", texto: "Autônomos precisam de um agente americano (não um empregador) para protocolar o I-129." },
        { tipo: "atencao", texto: "Quanto mais categorias de evidência você cobrir (3+), mais forte o caso." },
      ],
      kitId:    location === "eua" ? "o1-cos" : "o1",
      kitLabel: "Kit O-1",
    };
  }

  // ── EB-2 NIW ─────────────────────────────────────────────────────────
  if (visa_type === "green_card") {
    return {
      titulo:    `Jornada do ${nome}`,
      subtitulo: "EB-2 NIW · Green Card por interesse nacional",
      situacao:  `O EB-2 NIW é a rota de green card que dispensa patrocínio de empregador. Você mesmo submete a petição I-140 ao USCIS, demonstrando que seu trabalho beneficia os EUA. Após a aprovação, o caminho depende de onde você está.`,
      etapas: [
        { num: "1", estado: "agora",   titulo: "Construir o caso NIW",               desc: "Os 3 critérios do teste Matter of Dhanasar: mérito, importância nacional, interesse em dispensar a oferta de emprego." },
        { num: "2", estado: "proximo", titulo: "Reunir evidências",                  desc: "Publicações, citações, cartas de especialistas independentes, impacto do trabalho." },
        { num: "3", estado: "proximo", titulo: "I-140 submetido ao USCIS",           desc: "Auto-petição. Taxa: US$715. Com carta de petição (cover letter) argumentando o NIW.", tag: "US$715" },
        { num: "4", estado: "futuro",  titulo: "I-140 aprovado + Visa Bulletin",     desc: "Aguardar número de visto disponível no Boletim de Vistos (EB-2 Brasil pode ter fila)." },
        { num: "5", estado: "futuro",  titulo: location === "eua" ? "I-485 — Ajuste de Status" : "NVC + DS-260 + consulado", desc: location === "eua" ? "Formulário I-485 + exame médico (I-693) + biometria." : "NVC processa o caso, DS-260 online, documentos civis, entrevista consular.", tag: location === "eua" ? "AOS" : "Consular" },
        { num: "✓", estado: "futuro",  titulo: "Green Card aprovado",               desc: "Residência permanente nos EUA." },
      ],
      guardrails: [
        { tipo: "atencao",  texto: "Brasileiros podem ter fila no Boletim de Vistos EB-2. Europeus de países não-sobrescritos tendem a ter espera menor." },
        { tipo: "atencao",  texto: "O I-140 pode ser aprovado antes do número de visto estar disponível. Aprove o I-140 logo para preservar a priority date." },
        { tipo: "proibido", texto: "Não saia dos EUA com I-485 pendente sem Advance Parole aprovado." },
      ],
      kitId:    location === "eua" ? "eb2niw" : "eb2niw-brasil",
      kitLabel: "Kit EB-2 NIW",
    };
  }

  // ── Fallback genérico ─────────────────────────────────────────────────
  return {
    titulo:    `Jornada do ${nome}`,
    subtitulo: "Seu caminho de imigração",
    situacao:  "Complete seu perfil para vermos sua estratégia personalizada.",
    etapas: [
      { num: "1", estado: "agora", titulo: "Complete seu perfil", desc: "Responda o onboarding para termos sua situação mapeada." },
    ],
    guardrails: [],
    kitId:     "f1",
    kitLabel:  "Ver kits disponíveis",
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

const estadoStyle: Record<Etapa["estado"], { dot: string; card: string; data: string }> = {
  feito:   { dot: "bg-ink-faint border-ink-faint text-cream",            card: "opacity-60 border-pine-tint",         data: "text-ink-faint" },
  agora:   { dot: "bg-amber border-amber-deep text-pine-deep shadow-amber/30 shadow-md", card: "border-amber",  data: "text-amber-deep" },
  proximo: { dot: "bg-pine border-pine-deep text-cream",                 card: "border-pine",                         data: "text-pine-deep" },
  futuro:  { dot: "bg-cream-2 border-pine-tint text-ink-faint",          card: "border-pine-tint",                    data: "text-ink-faint" },
  alerta:  { dot: "bg-clay border-clay text-cream",                      card: "border-clay",                         data: "text-clay" },
};

export default function PainelPage() {
  const router  = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { setProfile(d.profile ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <span className="w-6 h-6 rounded-full border-2 border-pine-tint border-t-pine animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-ink-soft mb-4">Complete o onboarding para ver seu painel estratégico.</p>
          <button onClick={() => router.push("/onboarding")} className="bg-pine text-cream px-6 py-3 rounded-xl font-semibold text-sm hover:bg-pine-deep transition-colors">
            Começar agora
          </button>
        </div>
      </AppShell>
    );
  }

  const s = getStrategy(profile);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-pine mb-1" style={{ letterSpacing: "0.12em" }}>
            Painel estratégico
          </p>
          <h1 className="text-3xl font-semibold text-ink leading-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
            {s.titulo}
          </h1>
          <p className="text-sm text-ink-faint font-medium">{s.subtitulo}</p>
        </div>

        {/* Situação atual */}
        <div className="bg-cream-2 border border-pine-tint rounded-2xl px-5 py-4 mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-2" style={{ letterSpacing: "0.1em" }}>
            Sua situação
          </p>
          <p className="text-sm text-ink leading-relaxed">{s.situacao}</p>
        </div>

        {/* Destaque (alerta ou ok) */}
        {s.destaque && (
          <div className={[
            "rounded-2xl px-5 py-4 mb-6 border",
            s.destaque.tipo === "alerta"
              ? "bg-amber-tint border-amber/40"
              : "bg-pine-tint border-pine/30",
          ].join(" ")}>
            <p className={`text-sm font-semibold leading-relaxed ${s.destaque.tipo === "alerta" ? "text-amber-deep" : "text-pine-deep"}`}>
              {s.destaque.tipo === "alerta" ? "⚠ " : "✓ "}{s.destaque.texto}
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-4" style={{ letterSpacing: "0.1em" }}>
            Sua jornada
          </p>
          <div className="relative">
            {/* linha vertical */}
            <div className="absolute left-4 top-5 bottom-5 w-px bg-pine-tint" />

            <div className="flex flex-col gap-4">
              {s.etapas.map((etapa, i) => {
                const st = estadoStyle[etapa.estado];
                return (
                  <div key={i} className="flex gap-4 relative">
                    {/* dot */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-[11px] font-bold z-10 ${st.dot}`}>
                      {etapa.num}
                    </div>
                    {/* card */}
                    <div className={`flex-1 rounded-2xl border bg-cream-2 px-4 py-3 mb-0.5 ${st.card}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-ink leading-snug">{etapa.titulo}</p>
                        {etapa.tag && (
                          <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-ink/10 text-ink-soft">
                            {etapa.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-soft mt-1 leading-relaxed">{etapa.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Guard-rails */}
        {s.guardrails.length > 0 && (
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3" style={{ letterSpacing: "0.1em" }}>
              Atenção — não pise na linha
            </p>
            <div className="flex flex-col gap-2">
              {s.guardrails.map((g, i) => (
                <div
                  key={i}
                  className={`flex gap-3 rounded-2xl px-4 py-3 border ${
                    g.tipo === "proibido"
                      ? "bg-clay/5 border-clay/30"
                      : "bg-amber-tint border-amber/30"
                  }`}
                >
                  <span className={`flex-shrink-0 font-bold text-sm ${g.tipo === "proibido" ? "text-clay" : "text-amber-deep"}`}>
                    {g.tipo === "proibido" ? "✕" : "!"}
                  </span>
                  <p className={`text-xs leading-relaxed ${g.tipo === "proibido" ? "text-clay" : "text-amber-deep"}`}>
                    {g.texto}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA — kit */}
        <div className="bg-pine rounded-2xl px-5 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-pine-tint mb-1" style={{ letterSpacing: "0.1em" }}>
              Próximo passo
            </p>
            <p className="text-sm font-semibold text-cream">{s.kitLabel}</p>
            <p className="text-xs text-pine-tint mt-0.5">Guia completo passo a passo em português</p>
          </div>
          <button
            onClick={() => router.push(`/documentos/${s.kitId}`)}
            className="flex-shrink-0 bg-amber text-pine-deep font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-amber-deep transition-colors"
          >
            Ver kit →
          </button>
        </div>

        <p className="text-xs text-ink-faint mt-8 leading-relaxed">
          Este painel é baseado nas informações do seu perfil e em dados públicos da USCIS. Não é aconselhamento jurídico. Para situações complexas, consulte um immigration attorney.
        </p>
      </div>
    </AppShell>
  );
}
