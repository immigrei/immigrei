/**
 * Strategy engine — single source of truth for a profile's immigration
 * journey (steps, guardrails, kit). Consumed by /painel (full strategic
 * view) and /dashboard (home summary) so both always agree on whether a
 * step is consular (DS-160, entrevista) or Change-of-Status (I-539/I-129
 * direto com o USCIS) — that split depends on profile.location, set from
 * the very first onboarding question.
 */

import type { DoneWhen } from "@/lib/journey-progress";
import { daysUntilI94Expiry } from "@/lib/i94";

export interface ChosenSchool {
  school_name: string;
  campus_name: string;
  city:        string;
  state:       string;
  campus_code: string;
}

export interface Profile {
  full_name:       string | null;
  visa_type:       string | null;
  location:        "brasil" | "eua" | null;
  main_goal:       string | null;
  arrival_date:    string | null;
  i94_expiry_date?: string | null;
  family_ties?:    string | null;
  chosen_school?:  ChosenSchool | null;
}

// Vínculo familiar com cidadão/residente (q_family_ties no onboarding) abre
// uma porta de Green Card que costuma ser mais rápida do que o caminho de
// visto que a pessoa está seguindo — vale destacar isso no painel mesmo
// quando a jornada principal do usuário não é sobre família.
const FAMILY_TIES_CARD: Record<string, { titulo: string; texto: string }> = {
  spouse_citizen: {
    titulo: "Você tem cônjuge ou noivo(a) cidadão americano",
    texto:  "Parente imediato de cidadão não entra em fila. Noivos usam o K-1 (casar nos EUA em até 90 dias); cônjuges já casados, o IR-1/CR-1 pelo consulado ou o I-130 + I-485 se já estiver nos EUA em status válido.",
  },
  parent_child_citizen: {
    titulo: "Você é filho ou pai/mãe de cidadão americano",
    texto:  "Categoria de parente imediato (IR): prioridade máxima, sem fila de espera. O cidadão americano protocola a petição I-130 por você.",
  },
  family_gc: {
    titulo: "Você tem familiar próximo com Green Card",
    texto:  "Residentes permanentes peticionam cônjuge e filhos solteiros (categorias F2A/F2B). Há fila — acompanhe a data de prioridade no Boletim de Vistos.",
  },
};

export function getFamilyTiesCard(familyTies: string | null | undefined) {
  if (!familyTies) return null;
  return FAMILY_TIES_CARD[familyTies] ?? null;
}

// ── Strategy engine ───────────────────────────────────────────────────────────

export interface Etapa {
  num:    string;
  titulo: string;
  desc:   string;
  estado: "feito" | "agora" | "proximo" | "futuro" | "alerta";
  data?:  string;
  tag?:   string;
  href?:  string; // makes the step card a link (e.g. /escolas)
  // Link direto para o site oficial onde a etapa é executada (ex: pagar a
  // taxa SEVIS, preencher o DS-160, agendar a entrevista). Diferente de
  // `href`, que navega dentro do próprio Immigrei.
  linkExterno?: { label: string; url: string };
  // Real-data completion signal (see lib/journey-progress.ts). Steps without
  // it never auto-complete — they depend on events outside the app.
  doneWhen?: DoneWhen;
}

export interface GuardRail {
  tipo:  "proibido" | "atencao";
  texto: string;
}

export interface Strategy {
  titulo:      string;
  subtitulo:   string;
  situacao:    string;
  destaque?:   { tipo: "alerta" | "ok"; texto: string };
  etapas:      Etapa[];
  guardrails:  GuardRail[];
  kitId:       string;
  kitLabel:    string;
  // Jornadas sem kit próprio (I-130, N-400, I-90) apontam o CTA para outra
  // rota do app em vez de /documentos/[kitId].
  ctaHref?:    string;
  ctaDesc?:    string;
}

export function getStrategy(profile: Profile): Strategy {
  const { visa_type, location, main_goal, full_name, i94_expiry_date } = profile;
  const nome = full_name?.split(" ")[0] ?? "você";

  // ── F-1 do Brasil ────────────────────────────────────────────────────
  if (visa_type === "f1" && location === "brasil") {
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "F-1 via consulado · saindo do Brasil",
      situacao:  `Você está no Brasil e quer obter o visto F-1 para estudar nos EUA. O processo passa pelo consulado americano no Brasil — sem saída prévia dos EUA necessária.`,
      etapas: [
        { num: "1", estado: "agora",   titulo: "Buscar escola e confirmar matrícula",  desc: "Escolha um programa certificado pelo SEVP e confirme a matrícula com o DSO da escola.", href: "/escolas", doneWhen: { school: true } },
        { num: "2", estado: "proximo", titulo: "Receber o I-20",                       desc: "A escola emite o I-20 após a matrícula confirmada — nele está o seu SEVIS ID, usado no próximo passo.", doneWhen: { itens: ["i20"] } },
        { num: "3", estado: "proximo", titulo: "Pagar a taxa SEVIS (I-901)",           desc: "US$350, com o SEVIS ID do I-20 em mãos. Guarde o comprovante.", tag: "US$350", linkExterno: { label: "Pagar em fmjfee.com", url: "https://www.fmjfee.com/" }, doneWhen: { itens: ["i901"] } },
        { num: "4", estado: "proximo", titulo: "Preencher o DS-160",                   desc: "Formulário do Departamento de Estado — campo a campo no kit. Leva de 1 a 2 horas; guarde o número de confirmação.", linkExterno: { label: "Preencher em ceac.state.gov", url: "https://ceac.state.gov/genniv/" }, doneWhen: { itens: ["ds160"] } },
        { num: "5", estado: "proximo", titulo: "Montar dossiê",                        desc: "Extrato pessoal, vínculo com Brasil, carta de sponsor se aplicável.", doneWhen: { itens: ["financeiro", "vinculo"] } },
        { num: "6", estado: "futuro",  titulo: "Agendar a entrevista",                 desc: "Pague a taxa de visto (~US$185) e marque o horário no consulado mais próximo — SP, RJ, Recife, Brasília ou Porto Alegre.", tag: "~US$185", linkExterno: { label: "Agendar em ais.usvisa-info.com", url: "https://ais.usvisa-info.com/pt-br/niv" } },
        { num: "7", estado: "futuro",  titulo: "Entrevista consular",                  desc: "2–5 minutos. O cônsul já leu o dossiê. Seja direto e confiante.", tag: "2–8 semanas" },
        { num: "✓", estado: "futuro",  titulo: "Visto aprovado + viagem",              desc: "F-1 no passaporte. Visto válido para entrar nos EUA." },
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
      titulo:    `Jornada de ${nome}`,
      subtitulo: "F-1 · Change of Status — dentro dos EUA",
      situacao:  `Você está nos EUA e quer mudar para o F-1 sem sair do país. O processo usa o formulário I-539 direto com o USCIS — sem entrevista consular, mas exige status válido no protocolo.`,
      destaque: { tipo: "alerta", texto: "Seu status atual precisa estar válido no dia do protocolo do I-539. Verifique o I-94 antes de qualquer passo." },
      etapas: [
        { num: "1", estado: "agora",   titulo: "Verificar status no I-94",    desc: "i94.cbp.dhs.gov — confirme que você ainda está em status válido.", doneWhen: { itens: ["status-valido"] } },
        { num: "2", estado: "proximo", titulo: "Escolher escola SEVP próxima", desc: "Escola presencial longe da sua residência resulta em negação.", href: "/escolas", doneWhen: { school: true } },
        { num: "3", estado: "proximo", titulo: "Obter o I-20",                desc: "Escola emite o I-20 após matrícula confirmada — nele está o seu SEVIS ID, usado no próximo passo.", doneWhen: { itens: ["i20-cos"] } },
        { num: "4", estado: "proximo", titulo: "Pagar a taxa SEVIS (I-901)",  desc: "Obrigatória mesmo por dentro dos EUA: US$350 com o SEVIS ID do I-20, ANTES de enviar o I-539.", tag: "US$350", linkExterno: { label: "Pagar em fmjfee.com", url: "https://www.fmjfee.com/" }, doneWhen: { itens: ["i901-cos"] } },
        { num: "5", estado: "proximo", titulo: "Reunir documentação financeira", desc: "Extrato pessoal de 6 meses. No seu nome. PDF oficial do banco.", tag: "Crítico", doneWhen: { itens: ["extrato-pessoal"] } },
        { num: "6", estado: "proximo", titulo: "Preencher e enviar I-539",    desc: "Taxa US$370 por money order. Endereço varia por estado.", tag: "US$370", linkExterno: { label: "Formulário em uscis.gov/i-539", url: "https://www.uscis.gov/i-539" }, doneWhen: { itens: ["i539"] } },
        { num: "7", estado: "futuro",  titulo: "Receber I-797 de recebimento", desc: "Guarde este documento — prova que você protocolou em status.", doneWhen: { itens: ["i797-recebimento"] } },
        { num: "8", estado: "futuro",  titulo: "Aprovação do I-539",          desc: "Prazo médio: 4–8 meses. Premium Processing disponível.", tag: "4–8 meses" },
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
      titulo:    `Jornada de ${nome}`,
      subtitulo: "F-1 · Manutenção de status",
      situacao:  `Você já tem o F-1 e precisa estender o programa, transferir de escola ou renovar o carimbo do visto para poder viajar. Cada situação tem um caminho diferente.`,
      etapas: [
        { num: "A", estado: "agora",   titulo: "Extensão do I-20 (programa vai vencer)", desc: "Solicite ao DSO da sua escola antes do vencimento. Sem USCIS, sem taxa federal." },
        { num: "B", estado: "agora",   titulo: "Transferência para outra escola",         desc: "DSO atual libera o SEVIS. Você tem 15 dias para começar na nova escola." },
        { num: "C", estado: "agora",   titulo: "Renovação do carimbo (para viajar)",      desc: "Sair dos EUA pode acionar barreiras de reentrada. Consulte seu DSO antes. Exige novo DS-160 e entrevista no consulado.", tag: "Risco", linkExterno: { label: "DS-160 em ceac.state.gov", url: "https://ceac.state.gov/genniv/" } },
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
      titulo:    `Jornada de ${nome}`,
      subtitulo: "M-1 via consulado · saindo do Brasil",
      situacao:  `Você está no Brasil e quer o M-1 para fazer um curso técnico ou vocacional nos EUA. O processo é similar ao F-1, mas com a taxa SEVIS mais baixa e foco em programa vocacional.`,
      etapas: [
        { num: "1", estado: "agora",   titulo: "Buscar escola e confirmar matrícula",  desc: "Escolha um programa técnico/vocacional certificado pelo SEVP e confirme a matrícula com o DSO.", href: "/escolas", doneWhen: { school: true } },
        { num: "2", estado: "proximo", titulo: "Receber o I-20 M-1",                    desc: "A escola emite o I-20 (versão M) após a matrícula confirmada — nele está o seu SEVIS ID.", doneWhen: { itens: ["i20"] } },
        { num: "3", estado: "proximo", titulo: "Pagar a taxa SEVIS (I-901)",            desc: "US$200 (menor que o F-1), com o SEVIS ID do I-20 em mãos.", tag: "US$200", linkExterno: { label: "Pagar em fmjfee.com", url: "https://www.fmjfee.com/" }, doneWhen: { itens: ["i901"] } },
        { num: "4", estado: "proximo", titulo: "Preencher o DS-160 + montar dossiê",    desc: "Campo a campo no kit. Mesmo processo do F-1 com variações para M-1.", linkExterno: { label: "Preencher em ceac.state.gov", url: "https://ceac.state.gov/genniv/" }, doneWhen: { itens: ["ds160", "financeiro"] } },
        { num: "5", estado: "futuro",  titulo: "Agendar a entrevista",                  desc: "O cônsul vai perguntar sobre plano de carreira pós-curso. Prepare uma resposta clara.", linkExterno: { label: "Agendar em ais.usvisa-info.com", url: "https://ais.usvisa-info.com/pt-br/niv" } },
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

  // ── M-1 — mudança de status dentro dos EUA ────────────────────────────
  if (visa_type === "m1") {
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "M-1 · Mudança de status — dentro dos EUA",
      situacao:  `Você está nos EUA com outro status e quer mudar para o M-1 para fazer um curso técnico ou vocacional. O processo usa o I-539 — sem sair do país, sem entrevista consular. Mas a restrição do M-1 é permanente: não dá pra voltar depois.`,
      destaque: { tipo: "alerta", texto: "Quem entra no M-1 NÃO pode mudar para F-1 dentro dos EUA depois. Se houver qualquer chance de querer curso acadêmico no futuro, avalie o F-1 antes de escolher o M-1." },
      etapas: [
        { num: "1", estado: "agora",   titulo: "Confirmar que o M-1 é a escolha definitiva", desc: "A restrição M-1 → F-1 dentro dos EUA não tem exceção — vale ler com calma antes de seguir.", doneWhen: { itens: ["restricao-m1-f1"] } },
        { num: "2", estado: "proximo", titulo: "Escola técnica SEVP + I-20 (versão M)",      desc: "I-20 M-1 com prova de fundos para o curso inteiro, não só o 1º ano — nele está o seu SEVIS ID.", href: "/escolas", doneWhen: { itens: ["i20-m1-cos"] } },
        { num: "3", estado: "proximo", titulo: "Pagar a taxa SEVIS (I-901)",                 desc: "Obrigatória mesmo por dentro dos EUA: US$350 com o SEVIS ID do I-20, ANTES de enviar o I-539.", tag: "US$350", linkExterno: { label: "Pagar em fmjfee.com", url: "https://www.fmjfee.com/" }, doneWhen: { itens: ["i901-m1-cos"] } },
        { num: "4", estado: "proximo", titulo: "Preencher e enviar o I-539",                 desc: "Taxa US$370 por money order. Exige status válido no protocolo — confira seu I-94 antes.", tag: "US$370", linkExterno: { label: "Formulário em uscis.gov/i-539", url: "https://www.uscis.gov/i-539" }, doneWhen: { itens: ["i539-m1"] } },
        { num: "5", estado: "proximo", titulo: "Reunir documentação financeira",             desc: "Extrato pessoal de 6 meses cobrindo mensalidade, moradia e despesas do curso.", doneWhen: { itens: ["extrato-pessoal-m1"] } },
        { num: "6", estado: "futuro",  titulo: "Receber o I-797 de recebimento",              desc: "Prova que você protocolou em status. Prazo médio: 4–8 meses.", doneWhen: { itens: ["i797-m1"] } },
        { num: "✓", estado: "futuro",  titulo: "M-1 aprovado — início do curso",              desc: "Status M-1 ativo, curso pode começar." },
      ],
      guardrails: [
        { tipo: "proibido", texto: "Não comece o curso antes da aprovação do I-539." },
        { tipo: "atencao",  texto: "M-1 é data fixa no I-94 (não 'D/S' como o F-1) — atenção redobrada ao prazo." },
      ],
      kitId:    "m1-cos",
      kitLabel: "Kit M-1 — mudança de status",
    };
  }

  // ── H-1B ─────────────────────────────────────────────────────────────
  if (visa_type === "h1b") {
    // Os ids dos itens diferem entre o kit consular ("h1b") e o COS ("h1b-cos").
    const cos = location === "eua";
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "H-1B · Trabalho especializado",
      situacao:  `O H-1B é patrocinado pelo seu empregador americano — você não pode protocolar sozinho. O processo envolve o Departamento do Trabalho, o USCIS e o sorteio anual. Seu papel é garantir que os documentos estejam perfeitos.`,
      destaque: { tipo: "alerta", texto: "O H-1B está sujeito a sorteio anual. O período de registro é em março. Fora dessa janela, não há como entrar na fila." },
      etapas: [
        { num: "1", estado: "agora",   titulo: "Reunir documentos para o empregador", desc: "Diploma, histórico, currículo, documentos de identidade — veja o kit completo.", doneWhen: { itens: cos ? ["diploma-h1b-cos", "curriculo-h1b-cos"] : ["diploma", "curriculo"] } },
        { num: "2", estado: "proximo", titulo: "Empregador submete o registro (março)", desc: "Período de registro: 1–18 de março. O empregador faz online.", tag: "Março" },
        { num: "3", estado: "proximo", titulo: "Sorteio + notificação",                desc: "USCIS seleciona aleatoriamente. Resultados em abril." },
        { num: "4", estado: "futuro",  titulo: "LCA aprovada pelo DOL",               desc: "Labor Condition Application — o empregador submete em ~7 dias.", tag: "LCA", linkExterno: { label: "Consultar em flag.dol.gov", url: "https://flag.dol.gov/programs/LCA" }, doneWhen: { itens: cos ? ["lca-cos"] : ["lca"] } },
        { num: "5", estado: "futuro",  titulo: "I-129 submetido ao USCIS",            desc: "Petição completa após a LCA. Prazo padrão ou Premium Processing.", linkExterno: { label: "Formulário em uscis.gov/i-129", url: "https://www.uscis.gov/i-129" }, doneWhen: { itens: cos ? ["i129-cos"] : ["i129"] } },
        { num: "6", estado: "futuro",  titulo: "I-797 aprovado + entrevista/COS",     desc: "Entrevista consular se fora dos EUA, ou COS se já está aqui.", tag: "I-797", linkExterno: cos ? undefined : { label: "DS-160 em ceac.state.gov", url: "https://ceac.state.gov/genniv/" }, doneWhen: { itens: cos ? ["i797-cos"] : ["i797"] } },
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
    // Os ids dos itens diferem entre o kit consular ("o1") e o COS ("o1-cos").
    const cos = location === "eua";
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "O-1 · Habilidade extraordinária",
      situacao:  `O O-1 não tem sorteio, não tem cap. Mas exige evidências sólidas de reconhecimento nacional ou internacional — prêmios, mídia, salário acima da média, contribuições originais. Um empregador ou agente americano precisa fazer a petição.`,
      destaque: { tipo: "ok", texto: "Sem cap e sem sorteio — pode ser protocolado a qualquer momento do ano." },
      etapas: [
        { num: "1", estado: "agora",   titulo: "Mapear evidências de habilidade extraordinária", desc: "Prêmios, cobertura de mídia, salário, publicações, membros em associações. O kit lista as categorias USCIS.", doneWhen: { algum: cos ? ["premios-cos", "midia-cos", "salario-alto-cos", "contribuicoes-cos", "membros-cos"] : ["premios", "midia", "salario", "contribuicoes", "membro-associacoes"] } },
        { num: "2", estado: "proximo", titulo: "Advisory Opinion da associação da área",         desc: "Carta de uma associação profissional ou sindicato reconhecido.", doneWhen: { itens: cos ? ["advisory-opinion"] : ["consulta"] } },
        { num: "3", estado: "proximo", titulo: "Empregador ou agente protocola o I-129",         desc: "Com toda a documentação de suporte. Advogado de imigração é altamente recomendado.", tag: "I-129", linkExterno: { label: "Formulário em uscis.gov/i-129", url: "https://www.uscis.gov/i-129" }, doneWhen: cos ? undefined : { itens: ["i129o"] } },
        { num: "4", estado: "futuro",  titulo: "I-797 aprovado",                                 desc: "Aprovação em 2–4 meses (padrão) ou 15 dias úteis (Premium Processing).", doneWhen: { itens: cos ? ["i797-o1-cos"] : ["i797"] } },
        { num: "5", estado: "futuro",  titulo: "Entrevista consular ou COS",                     desc: "Se fora dos EUA: entrevista. Se já nos EUA: COS com o mesmo I-129.", linkExterno: cos ? undefined : { label: "DS-160 em ceac.state.gov", url: "https://ceac.state.gov/genniv/" } },
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

  // ── Green Card holder — jornadas por objetivo ────────────────────────
  // visa_type "green_card" = quem JÁ TEM o green card (onboarding salva
  // direto). Quem está BUSCANDO o green card via NIW chega como "eb2niw"
  // (id do card em /vistos) — jornada própria mais abaixo.
  if (visa_type === "green_card") {
    if (main_goal === "trazer_familia") {
      return {
        titulo:    `Jornada de ${nome}`,
        subtitulo: "Petição de familiar · I-130 — categorias F2A / F2B",
        situacao:  `Como residente permanente, você pode peticionar seu cônjuge e filhos solteiros. Menores de 21 anos entram na categoria F2A — fila frequentemente curta ou zerada — e 21+ na F2B, com espera maior. O Immigrei acompanha o Boletim de Vistos por você, todo mês.`,
        destaque: { tipo: "ok", texto: "Se você se naturalizar durante o processo, a petição sobe de categoria: cônjuge e filhos menores viram parentes imediatos — sem fila." },
        etapas: [
          { num: "1", estado: "agora",   titulo: "Confirmar quem você pode peticionar", desc: "Residente peticiona cônjuge e filhos solteiros. Pais, irmãos e filhos casados, só quando você for cidadão." },
          { num: "2", estado: "proximo", titulo: "Reunir documentos",                   desc: "Green card (frente e verso), certidões de casamento/nascimento com tradução e provas de vínculo genuíno." },
          { num: "3", estado: "proximo", titulo: "Protocolar o I-130",                  desc: "US$625 online ou US$675 em papel. A data de recebimento vira sua priority date — a posição na fila.", tag: "US$625", linkExterno: { label: "Formulário em uscis.gov/i-130", url: "https://www.uscis.gov/i-130" } },
          { num: "4", estado: "futuro",  titulo: "Acompanhar o Boletim de Vistos",      desc: "Brasil entra em 'All Chargeability'. Quando a sua priority date ficar current, o caso avança — o Immigrei avisa.", tag: "Mensal", linkExterno: { label: "Boletim em travel.state.gov", url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html" } },
          { num: "5", estado: "futuro",  titulo: "Consulado (DS-260) ou ajuste (I-485)", desc: "Familiar fora dos EUA: NVC + entrevista consular. Nos EUA em status válido: I-485 quando a data permitir.", linkExterno: { label: "Formulário em uscis.gov/i-485", url: "https://www.uscis.gov/i-485" } },
          { num: "✓", estado: "futuro",  titulo: "Green Card do familiar aprovado",     desc: "Seu familiar se torna residente permanente." },
        ],
        guardrails: [
          { tipo: "proibido", texto: "O familiar não deve entrar de turista ou ESTA com intenção de ficar enquanto espera a fila — intenção imigratória na entrada pode comprometer a petição inteira." },
          { tipo: "atencao",  texto: "Casamento do filho cancela a petição de residente — F2A e F2B exigem filho solteiro. Só cidadãos peticionam filhos casados (F3)." },
          { tipo: "atencao",  texto: "Filho que completa 21 anos pode trocar de categoria (F2A → F2B). A lei CSPA pode 'congelar' a idade — vale análise profissional." },
        ],
        kitId:    "",
        kitLabel: "Acompanhar o Boletim de Vistos",
        ctaHref:  "/dashboard",
        ctaDesc:  "O painel mostra a fila da sua categoria, atualizada todo mês",
      };
    }

    if (main_goal === "cidadania") {
      return {
        titulo:    `Jornada de ${nome}`,
        subtitulo: "Naturalização · N-400",
        situacao:  `Você já tem o green card — a naturalização é a última etapa da jornada. Regra geral: 5 anos como residente, ou 3 se casado(a) e vivendo com cidadão americano. Dá para protocolar até 90 dias antes de completar o prazo.`,
        etapas: [
          { num: "1", estado: "agora",   titulo: "Conferir o relógio",       desc: "5 anos de residência (ou 3, com cidadão) + residência contínua e presença física em pelo menos metade do período." },
          { num: "2", estado: "proximo", titulo: "Levantar o histórico",     desc: "Viagens dos últimos 5 anos, endereços, empregos e impostos em dia. O N-400 pergunta tudo." },
          { num: "3", estado: "proximo", titulo: "Protocolar o N-400",       desc: "US$710 online ou US$760 em papel. Renda entre 150–400% da linha da pobreza paga US$380.", tag: "US$710", linkExterno: { label: "Formulário em uscis.gov/n-400", url: "https://www.uscis.gov/n-400" } },
          { num: "4", estado: "futuro",  titulo: "Biometria e entrevista",   desc: "Teste de inglês e cívica (as perguntas são públicas, no site do USCIS) + revisão do seu histórico." },
          { num: "✓", estado: "futuro",  titulo: "Cerimônia de juramento",   desc: "Você se torna cidadão americano. 🇺🇸" },
        ],
        guardrails: [
          { tipo: "atencao",  texto: "Viagens de 6 meses ou mais podem quebrar a residência contínua — some as ausências antes de protocolar." },
          { tipo: "proibido", texto: "Não protocole com pendências criminais ou de impostos sem análise profissional — o N-400 reabre todo o seu histórico de imigração." },
        ],
        kitId:    "",
        kitLabel: "Preparação com profissional verificado",
        ctaHref:  "/profissionais",
        ctaDesc:  "Revisão do histórico e preparação para a entrevista",
      };
    }

    if (main_goal === "renovar_visto") {
      return {
        titulo:    `Jornada de ${nome}`,
        subtitulo: "Renovação do Green Card · I-90",
        situacao:  `O cartão de 10 anos se renova com o I-90 — processo direto com o USCIS, sem entrevista consular. Renove se já venceu ou vence nos próximos 6 meses.`,
        destaque: { tipo: "alerta", texto: "Green Card CONDICIONAL de 2 anos (por casamento)? O caminho é o I-751 nos 90 dias antes do vencimento — nunca o I-90." },
        etapas: [
          { num: "1", estado: "agora",   titulo: "Conferir o cartão",           desc: "Vencido ou a vencer em 6 meses: hora de renovar. Condicional de 2 anos: é I-751, outro processo." },
          { num: "2", estado: "proximo", titulo: "Protocolar o I-90",           desc: "US$415 online ou US$465 em papel, direto na conta USCIS.", tag: "US$415", linkExterno: { label: "Formulário em uscis.gov/i-90", url: "https://www.uscis.gov/i-90" } },
          { num: "3", estado: "futuro",  titulo: "Recibo estende a validade",   desc: "O I-797 de recebimento estende o cartão vencido — guarde junto do cartão antigo para trabalho e viagens." },
          { num: "4", estado: "futuro",  titulo: "Biometria (se convocada)",    desc: "Reuso de biometria é comum — muitos casos nem têm apontamento." },
          { num: "✓", estado: "futuro",  titulo: "Novo cartão de 10 anos",      desc: "Residência segue valendo — o cartão é a prova, não o status." },
        ],
        guardrails: [
          { tipo: "atencao", texto: "Não viaje com o cartão vencido sem o recibo I-797 — a reentrada pode complicar." },
        ],
        kitId:    "",
        kitLabel: "Falar com um profissional verificado",
        ctaHref:  "/profissionais",
        ctaDesc:  "Dúvidas sobre condicional, ausências longas ou cartão perdido",
      };
    }

    // Demais objetivos: visão geral do residente permanente.
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "Residente permanente · manter e avançar",
      situacao:  `Seu green card está ativo — a jornada agora é proteger a residência e escolher o próximo passo. Estes são os caminhos abertos para você hoje.`,
      etapas: [
        { num: "A", estado: "agora", titulo: "Manter a residência",        desc: "Evite ausências de 6+ meses dos EUA. Para ficar até 2 anos fora, o Reentry Permit (I-131) precisa ser pedido ANTES de sair.", linkExterno: { label: "Formulário em uscis.gov/i-131", url: "https://www.uscis.gov/i-131" } },
        { num: "B", estado: "agora", titulo: "Renovar o cartão (I-90)",    desc: "Cartão de 10 anos vencido ou a vencer em 6 meses. Condicional de 2 anos usa o I-751.", linkExterno: { label: "Formulário em uscis.gov/i-90", url: "https://www.uscis.gov/i-90" } },
        { num: "C", estado: "agora", titulo: "Peticionar a família (I-130)", desc: "Cônjuge e filhos solteiros nas categorias F2A / F2B — o Immigrei acompanha a fila no Boletim de Vistos.", linkExterno: { label: "Formulário em uscis.gov/i-130", url: "https://www.uscis.gov/i-130" } },
        { num: "D", estado: "agora", titulo: "Caminho à cidadania (N-400)", desc: "5 anos como residente (ou 3, com cidadão americano). Pode protocolar 90 dias antes de completar.", linkExterno: { label: "Formulário em uscis.gov/n-400", url: "https://www.uscis.gov/n-400" } },
      ],
      guardrails: [
        { tipo: "atencao", texto: "Declare imposto como residente todos os anos — declarar como 'non-resident' pode ser lido como abandono da residência." },
      ],
      kitId:    "",
      kitLabel: "Falar com um profissional verificado",
      ctaHref:  "/profissionais",
      ctaDesc:  "Escolha o próximo passo com quem já percorreu o caminho",
    };
  }

  // ── Cidadão americano ────────────────────────────────────────────────
  if (visa_type === "citizen") {
    if (main_goal === "trazer_familia") {
      return {
        titulo:    `Jornada de ${nome}`,
        subtitulo: "Petição de familiar · cidadão americano",
        situacao:  `Como cidadão, você tem a porta mais forte da imigração familiar: parentes imediatos (cônjuge, pais e filhos solteiros menores de 21) não entram em fila. Filhos 21+, filhos casados e irmãos entram em categorias com espera (F1, F3, F4).`,
        etapas: [
          { num: "1", estado: "agora",   titulo: "Definir a categoria",              desc: "Parente imediato: sem fila. F1 / F3 / F4: fila de anos a décadas — confira no Boletim de Vistos. Noivo(a) no exterior: K-1." },
          { num: "2", estado: "proximo", titulo: "Reunir provas",                    desc: "Prova de cidadania (passaporte ou certificado), certidões com tradução e provas de vínculo genuíno." },
          { num: "3", estado: "proximo", titulo: "Protocolar o I-130 (ou I-129F)",   desc: "US$625 online ou US$675 em papel. Noivo(a): I-129F para o K-1.", tag: "US$625", linkExterno: { label: "I-130 em uscis.gov · I-129F em uscis.gov/i-129f", url: "https://www.uscis.gov/i-130" } },
          { num: "4", estado: "futuro",  titulo: "NVC ou ajuste de status",          desc: "Familiar fora dos EUA: NVC + DS-260 + consulado. Nos EUA com entrada legal: I-485 — cônjuge pode incluir trabalho (I-765) junto." },
          { num: "✓", estado: "futuro",  titulo: "Green Card do familiar aprovado",  desc: "Seu familiar se torna residente permanente." },
        ],
        guardrails: [
          { tipo: "proibido", texto: "O familiar não deve entrar de turista ou ESTA com intenção de imigrar — intenção na entrada pode comprometer a petição inteira." },
          { tipo: "atencao",  texto: "Irmãos (F4) enfrentam fila de décadas — vale checar rotas paralelas para quem não pode esperar." },
        ],
        kitId:    "",
        kitLabel: "Falar com um profissional verificado",
        ctaHref:  "/profissionais",
        ctaDesc:  "Categoria certa e timing — antes de protocolar",
      };
    }

    // Objetivo "entender_direitos" (e demais): os direitos básicos, direto.
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "Cidadania americana · seus direitos",
      situacao:  `Você chegou ao topo da jornada — a cidadania não expira e não se perde por morar fora. Estes são os direitos básicos que ela garante.`,
      etapas: [
        { num: "A", estado: "agora", titulo: "Votar e ter passaporte americano", desc: "Voto em eleições federais e estaduais. Passaporte via DS-11 — a prova de cidadania mais prática.", linkExterno: { label: "Formulários em travel.state.gov", url: "https://travel.state.gov/content/travel/en/passports/how-apply/forms.html" } },
        { num: "B", estado: "agora", titulo: "Morar fora sem perder nada",       desc: "Ausências longas não ameaçam a cidadania — diferente do green card." },
        { num: "C", estado: "agora", titulo: "Peticionar a família",             desc: "Cônjuge, pais e filhos menores solteiros sem fila; demais categorias via I-130." },
        { num: "D", estado: "agora", titulo: "Empregos e proteção plenos",       desc: "Cargos públicos federais, júri e a proteção consular americana no exterior." },
      ],
      guardrails: [],
      kitId:    "",
      kitLabel: "Trazer alguém da família?",
      ctaHref:  "/profissionais",
      ctaDesc:  "Petição de familiares com um profissional verificado",
    };
  }

  // ── EB-2 NIW ─────────────────────────────────────────────────────────
  if (visa_type === "eb2niw") {
    // Kit "eb2niw" (nos EUA) cobre da evidência ao I-485; o "eb2niw-brasil"
    // começa no I-140 aprovado e segue a rota consular (NVC + DS-260).
    const nosEua = location === "eua";
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "EB-2 NIW · Green Card por interesse nacional",
      situacao:  `O EB-2 NIW é a rota de green card que dispensa patrocínio de empregador. Você mesmo submete a petição I-140 ao USCIS, demonstrando que seu trabalho beneficia os EUA. Após a aprovação, o caminho depende de onde você está.`,
      etapas: [
        { num: "1", estado: "agora",   titulo: "Construir o caso NIW",               desc: "Os 3 critérios do teste Matter of Dhanasar: mérito, importância nacional, interesse em dispensar a oferta de emprego." },
        { num: "2", estado: "proximo", titulo: "Reunir evidências",                  desc: "Publicações, citações, cartas de especialistas independentes, impacto do trabalho.", doneWhen: nosEua ? { algum: ["publicacoes", "citacoes", "cartas-recomendacao"] } : undefined },
        { num: "3", estado: "proximo", titulo: "I-140 submetido ao USCIS",           desc: "Auto-petição. Taxa: US$715. Com carta de petição (cover letter) argumentando o NIW.", tag: "US$715", linkExterno: { label: "Formulário em uscis.gov/i-140", url: "https://www.uscis.gov/i-140" }, doneWhen: { itens: nosEua ? ["i140"] : ["i140-aprovado"] } },
        { num: "4", estado: "futuro",  titulo: "I-140 aprovado + Visa Bulletin",     desc: "Aguardar número de visto disponível no Boletim de Vistos (EB-2 Brasil pode ter fila).", linkExterno: { label: "Boletim em travel.state.gov", url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html" }, doneWhen: nosEua ? undefined : { itens: ["i140-aprovado", "boletim-vistos"] } },
        { num: "5", estado: "futuro",  titulo: nosEua ? "I-485 — Ajuste de Status" : "NVC + DS-260 + consulado", desc: nosEua ? "Formulário I-485 + exame médico (I-693) + biometria." : "NVC processa o caso, DS-260 online, documentos civis, entrevista consular.", tag: nosEua ? "AOS" : "Consular", linkExterno: nosEua ? { label: "Formulário em uscis.gov/i-485", url: "https://www.uscis.gov/i-485" } : { label: "NVC em travel.state.gov", url: "https://travel.state.gov/content/travel/en/us-visas/immigrate/national-visa-center.html" }, doneWhen: { itens: nosEua ? ["i485"] : ["ds260"] } },
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

  // ── B-1/B-2 — dentro dos EUA (I-94, extensão, mudança de status) ──────
  if ((visa_type === "b1" || visa_type === "b1b2") && location === "eua") {
    const dias = i94_expiry_date ? daysUntilI94Expiry(i94_expiry_date) : null;
    const destaque: Strategy["destaque"] = dias === null
      ? { tipo: "alerta", texto: "Confira seu prazo em i94.cbp.dhs.gov e cadastre no seu perfil para acompanhar a contagem aqui." }
      : dias < 0
        ? { tipo: "alerta", texto: `Seu I-94 venceu há ${Math.abs(dias)} dia${Math.abs(dias) === 1 ? "" : "s"}. Isso já conta como presença irregular — fale com um profissional o quanto antes.` }
        : dias <= 30
          ? { tipo: "alerta", texto: `Faltam ${dias} dia${dias === 1 ? "" : "s"} para o seu I-94 vencer. Extensão ou mudança de status precisam ser protocoladas antes disso.` }
          : { tipo: "ok", texto: `Seu I-94 vale até ${dias} dias a partir de hoje. Tudo em ordem por enquanto.` };
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "B-1/B-2 · Turismo ou negócios — dentro dos EUA",
      situacao:  `Você está nos EUA em status B-1/B-2. O prazo que vale é o do seu I-94, não o carimbo do visto no passaporte — ele define até quando você pode ficar.`,
      destaque,
      etapas: [
        { num: "1", estado: dias !== null ? "feito" : "agora", titulo: "Conferir o prazo do I-94",  desc: "i94.cbp.dhs.gov mostra a data exata de saída obrigatória — cadastre no seu perfil (início) para acompanhar aqui.", linkExterno: { label: "Consultar em i94.cbp.dhs.gov", url: "https://i94.cbp.dhs.gov/" } },
        { num: "2", estado: "proximo", titulo: "Extensão de permanência (I-539)",  desc: "Pedida antes do I-94 vencer, com justificativa (ex: negócio ainda em andamento).", tag: "US$370", linkExterno: { label: "Formulário em uscis.gov/i-539", url: "https://www.uscis.gov/i-539" } },
        { num: "3", estado: "proximo", titulo: "Mudança de status, se for o caso", desc: "Quer estudar (F-1), trabalhar ou seguir outro caminho? Muda-se de status antes do prazo vencer — não depois." },
        { num: "✓", estado: "futuro",  titulo: "Status resolvido",                desc: "Extensão aprovada, novo status aprovado, ou saída dentro do prazo." },
      ],
      guardrails: [
        { tipo: "proibido", texto: "B-1/B-2 não autoriza trabalho remunerado nos EUA, nem para empresa brasileira remota — só reuniões, negociações e turismo." },
        { tipo: "atencao",  texto: "Passar do prazo do I-94 sem pedido de extensão ou mudança de status protocolado começa a contar presença irregular." },
      ],
      kitId:    "",
      kitLabel: "Falar com um profissional verificado",
      ctaHref:  "/profissionais",
      ctaDesc:  "Extensão, mudança de status ou dúvida sobre o prazo do I-94",
    };
  }

  // ── B-1/B-2 via consulado · saindo do Brasil ──────────────────────────
  if (visa_type === "b1" || visa_type === "b1b2") {
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "B-1/B-2 via consulado · saindo do Brasil",
      situacao:  `Você está no Brasil e quer o visto B-1/B-2 para negócios ou turismo nos EUA. O processo é direto: DS-160 + entrevista, sem I-20 nem taxa SEVIS.`,
      etapas: [
        { num: "1", estado: "agora",   titulo: "Preencher o DS-160",              desc: "Formulário do Departamento de Estado — campo a campo no kit.", linkExterno: { label: "Preencher em ceac.state.gov", url: "https://ceac.state.gov/genniv/" }, doneWhen: { itens: ["ds160"] } },
        { num: "2", estado: "proximo", titulo: "Montar o dossiê de negócios",     desc: "Carta de convite da empresa americana e carta da empresa brasileira confirmando cargo e propósito.", doneWhen: { itens: ["carta-convite", "carta-empresa-br"] } },
        { num: "3", estado: "proximo", titulo: "Provar vínculo com o Brasil",     desc: "Emprego, imóvel, família — o que mostra que você vai voltar.", doneWhen: { itens: ["vinculo", "financeiro"] } },
        { num: "4", estado: "futuro",  titulo: "Agendar e comparecer à entrevista", desc: "Consulados em SP, RJ, Recife, Brasília ou Porto Alegre.", linkExterno: { label: "Agendar em ais.usvisa-info.com", url: "https://ais.usvisa-info.com/pt-br/niv" } },
        { num: "✓", estado: "futuro",  titulo: "Visto aprovado",                 desc: "B-1/B-2 no passaporte, pronto para viajar." },
      ],
      guardrails: [
        { tipo: "proibido", texto: "B-1/B-2 não autoriza trabalho remunerado nos EUA — só reuniões, negociações e turismo." },
        { tipo: "atencao",  texto: "O cônsul avalia intenção de voltar ao Brasil. Vínculos fracos são o motivo mais comum de negativa." },
      ],
      kitId:    "b1",
      kitLabel: "Kit B-1/B-2 via consulado",
    };
  }

  // ── J-1 via consulado · saindo do Brasil ──────────────────────────────
  if (visa_type === "j1" && location !== "eua") {
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "J-1 via consulado · intercâmbio",
      situacao:  `Você está no Brasil e vai para os EUA como intercambista. O J-1 é patrocinado por uma organização autorizada pelo Departamento de Estado — o DS-2019 substitui o I-20 do F-1.`,
      etapas: [
        { num: "1", estado: "agora",   titulo: "Programa + DS-2019",       desc: "O patrocinador autorizado emite o DS-2019, base do seu J-1.", doneWhen: { itens: ["ds2019"] } },
        { num: "2", estado: "proximo", titulo: "Pagar a taxa SEVIS",       desc: "US$220 (Work and Travel) ou US$35 (outros programas), com o SEVIS ID do DS-2019.", tag: "US$220/US$35", linkExterno: { label: "Pagar em fmjfee.com", url: "https://www.fmjfee.com/" }, doneWhen: { itens: ["sevis"] } },
        { num: "3", estado: "proximo", titulo: "Preencher DS-160",         desc: "Formulário do Departamento de Estado — campo a campo no kit.", linkExterno: { label: "Preencher em ceac.state.gov", url: "https://ceac.state.gov/genniv/" }, doneWhen: { itens: ["ds160"] } },
        { num: "4", estado: "futuro",  titulo: "Entrevista consular",      desc: "Leve o DS-2019 e a carta do patrocinador.", linkExterno: { label: "Agendar em ais.usvisa-info.com", url: "https://ais.usvisa-info.com/pt-br/niv" } },
        { num: "✓", estado: "futuro",  titulo: "Visto J-1 aprovado",       desc: "Pronto para o intercâmbio." },
      ],
      guardrails: [
        { tipo: "atencao", texto: "Confira se seu programa está sujeito à regra dos 2 anos (INA §212(e)) — isso muda o que você pode fazer depois." },
      ],
      kitId:    "j1",
      kitLabel: "Kit J-1 via consulado",
    };
  }

  // ── J-1 — já nos EUA, em programa (extensão via patrocinador) ─────────
  if (visa_type === "j1") {
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "J-1 · Intercâmbio — dentro dos EUA",
      situacao:  `Você está no programa J-1. O que importa agora é seguir as regras do patrocinador e saber se a regra dos 2 anos (INA §212(e)) se aplica ao seu caso — ela muda o que você pode fazer depois.`,
      etapas: [
        { num: "1", estado: "agora",   titulo: "Solicitar extensão ao patrocinador",   desc: "Antes do vencimento do DS-2019 — geralmente com 30 a 60 dias de aviso.", doneWhen: { itens: ["solicitar-extensao-j1"] } },
        { num: "2", estado: "proximo", titulo: "Justificativa para a extensão",        desc: "Conclusão do programa, aprovação acadêmica ou continuidade de projeto — o patrocinador define os critérios.", doneWhen: { itens: ["justificativa-extensao-j1"] } },
        { num: "3", estado: "proximo", titulo: "Confirmar a regra dos 2 anos",         desc: "Campo 'Exchange Visitor Subject to Two-Year Rule' no DS-2019, ou pergunte ao patrocinador.", linkExterno: { label: "Consultar em j1visa.state.gov", url: "https://j1visa.state.gov/basics/" }, doneWhen: { itens: ["regra-2-anos-check"] } },
        { num: "4", estado: "proximo", titulo: "Receber o DS-2019 atualizado",         desc: "Emitido pelo patrocinador após aprovação no SEVIS — sem passar pelo USCIS ou consulado.", doneWhen: { itens: ["ds2019-atualizado"] } },
        { num: "✓", estado: "futuro",  titulo: "Programa estendido — próximo passo",   desc: "Waiver obtido, 2 anos cumpridos, ou sem restrição: F-1, H-1B e outros ficam abertos." },
      ],
      guardrails: [
        { tipo: "proibido", texto: "Sujeito à regra dos 2 anos, você não pode mudar para H, L ou Green Card sem cumprir os 2 anos ou obter o waiver primeiro." },
      ],
      kitId:    "j1-extensao",
      kitLabel: "Kit J-1 — extensão via patrocinador",
    };
  }

  // ── L-1 ──────────────────────────────────────────────────────────────
  if (visa_type === "l1") {
    // "l1" (consular) exige DS-160 + entrevista; "l1-cos" (já nos EUA) muda
    // de status pelo I-129 direto com o USCIS — sem consulado, sem DS-160.
    const cos = location === "eua";
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: cos ? "L-1 · Change of Status — dentro dos EUA" : "L-1 · Transferência intraempresarial",
      situacao:  cos
        ? `Você está nos EUA com outro status e sua empresa quer regularizar sua situação como L-1 sem que você saia do país. Empresa americana e estrangeira precisam ter relação corporativa comprovada, e você precisa ter trabalhado no exterior por pelo menos 1 ano nos últimos 3.`
        : `O L-1 é patrocinado pela empresa americana — exige que você tenha trabalhado na empresa fora dos EUA por pelo menos 1 ano nos últimos 3, em cargo executivo, gerencial ou de conhecimento especializado. Você não protocola sozinho.`,
      etapas: cos ? [
        { num: "1", estado: "agora",   titulo: "Confirmar tempo e cargo na empresa",     desc: "1 ano contínuo nos últimos 3 anos, em função executiva, gerencial ou especialista.", doneWhen: { itens: ["docs-status-l1"] } },
        { num: "2", estado: "proximo", titulo: "Comprovar 1 ano de trabalho no exterior", desc: "Contracheques, contrato e registros corporativos da empresa estrangeira.", doneWhen: { itens: ["contracheques-exterior", "contrato-exterior"] } },
        { num: "3", estado: "proximo", titulo: "I-129 com classificação L e COS",         desc: "A empresa americana submete ao USCIS — sem consulado, sem DS-160.", tag: "I-129", linkExterno: { label: "Formulário em uscis.gov/i-129", url: "https://www.uscis.gov/i-129" }, doneWhen: { itens: ["i129-l1-cos"] } },
        { num: "4", estado: "futuro",  titulo: "I-797 aprovado com Change of Status",     desc: "Confirma a mudança de status para L-1 dentro dos EUA.", doneWhen: { itens: ["i797-l1-cos"] } },
        { num: "✓", estado: "futuro",  titulo: "L-1 ativo — início do trabalho",          desc: "L-1A: até 7 anos. L-1B: até 5 anos. Cônjuge (L-2) pode trabalhar." },
      ] : [
        { num: "1", estado: "agora",   titulo: "Confirmar tempo e cargo na empresa", desc: "1 ano contínuo nos últimos 3 anos, em função executiva, gerencial ou especialista." },
        { num: "2", estado: "proximo", titulo: "Empresa reúne a documentação",       desc: "Registros corporativos e prova de que as entidades nos dois países são a mesma organização.", doneWhen: { itens: ["docs-empresa"] } },
        { num: "3", estado: "proximo", titulo: "I-129 com classificação L",          desc: "A empresa americana submete ao USCIS.", tag: "I-129", linkExterno: { label: "Formulário em uscis.gov/i-129", url: "https://www.uscis.gov/i-129" }, doneWhen: { itens: ["i129l"] } },
        { num: "4", estado: "futuro",  titulo: "I-797 aprovado",                     desc: "Aprovação da petição, seguida de entrevista consular para o carimbo do visto.", linkExterno: { label: "DS-160 em ceac.state.gov", url: "https://ceac.state.gov/genniv/" }, doneWhen: { itens: ["i797"] } },
        { num: "✓", estado: "futuro",  titulo: "L-1 ativo — início do trabalho",     desc: "L-1A: até 7 anos. L-1B: até 5 anos. Cônjuge (L-2) pode trabalhar." },
      ],
      guardrails: [
        { tipo: "atencao", texto: "Executivos em L-1A têm caminho direto ao Green Card pelo EB-1C, sem PERM." },
      ],
      kitId:    cos ? "l1-cos" : "l1",
      kitLabel: cos ? "Kit L-1 Change of Status" : "Kit L-1 — transferência intraempresarial",
    };
  }

  // ── E-2 — mudança de status dentro dos EUA ────────────────────────────
  // Ainda não existe kit de documentos para essa rota (só a consular, "e2"),
  // então o CTA vai para /profissionais em vez de um checklist inexistente.
  if (visa_type === "e2" && location === "eua") {
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "E-2 · Investidor por tratado — dentro dos EUA",
      situacao:  `Você está nos EUA e quer o E-2 sem passar pelo consulado. A mudança de status usa o I-129 direto com o USCIS — sem DS-160, sem entrevista — mas os requisitos de nacionalidade, investimento e gestão ativa são os mesmos.`,
      etapas: [
        { num: "1", estado: "agora",   titulo: "Confirmar os 4 requisitos",           desc: "Nacionalidade de país com tratado, investimento substancial, controle de pelo menos 50% e papel ativo na gestão." },
        { num: "2", estado: "proximo", titulo: "Montar o plano de negócios",          desc: "Prova de origem e aplicação dos fundos, mais o plano do negócio nos EUA." },
        { num: "3", estado: "proximo", titulo: "I-129 com classificação E-2 e COS",   desc: "Submetido ao USCIS — sem consulado, sem DS-160.", linkExterno: { label: "Formulário em uscis.gov/i-129", url: "https://www.uscis.gov/i-129" } },
        { num: "✓", estado: "futuro",  titulo: "E-2 aprovado",                       desc: "Renovável sem limite enquanto o negócio operar de verdade." },
      ],
      guardrails: [
        { tipo: "atencao", texto: "O E-2 não leva direto ao Green Card — as pontes comuns são EB-5, EB-1C (executivo) ou EB-2 NIW." },
      ],
      kitId:    "",
      kitLabel: "Falar com um profissional verificado",
      ctaHref:  "/profissionais",
      ctaDesc:  "Ainda não temos kit de documentos pronto para essa rota — comece com uma conversa",
    };
  }

  // ── E-2 via consulado ──────────────────────────────────────────────────
  if (visa_type === "e2") {
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "E-2 · Investidor por tratado",
      situacao:  `O E-2 exige nacionalidade de país com tratado de investimento com os EUA e um negócio real, com investimento substancial e participação ativa sua na gestão.`,
      etapas: [
        { num: "1", estado: "agora",   titulo: "Confirmar os 4 requisitos", desc: "Nacionalidade de país com tratado, investimento substancial, controle de pelo menos 50% e papel ativo na gestão.", doneWhen: { itens: ["nacionalidade-tratado", "investimento-substancial", "propriedade-empresa", "papel-ativo"] } },
        { num: "2", estado: "proximo", titulo: "Montar o plano de negócios", desc: "Prova de origem e aplicação dos fundos, mais o plano do negócio nos EUA." },
        { num: "3", estado: "proximo", titulo: "DS-160 + DS-156E",           desc: "Formulários do Departamento de Estado, com o dossiê completo do negócio.", linkExterno: { label: "DS-160 em ceac.state.gov", url: "https://ceac.state.gov/genniv/" } },
        { num: "4", estado: "futuro",  titulo: "Entrevista de investidor",   desc: "O cônsul avalia o negócio e sua participação ativa nele.", linkExterno: { label: "Agendar em ais.usvisa-info.com", url: "https://ais.usvisa-info.com/pt-br/niv" } },
        { num: "✓", estado: "futuro",  titulo: "E-2 aprovado",              desc: "Renovável sem limite enquanto o negócio operar de verdade." },
      ],
      guardrails: [
        { tipo: "atencao", texto: "O E-2 não leva direto ao Green Card — as pontes comuns são EB-5, EB-1C (executivo) ou EB-2 NIW." },
      ],
      kitId:    "e2",
      kitLabel: "Kit E-2 — visto de investidor",
    };
  }

  // ── E-1 — mudança de status dentro dos EUA ────────────────────────────
  if (visa_type === "e1" && location === "eua") {
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "E-1 · Comércio por tratado — dentro dos EUA",
      situacao:  `Você está nos EUA e quer o E-1 sem passar pelo consulado. A mudança de status usa o I-129 direto com o USCIS — sem DS-160, sem entrevista — mas o volume de comércio bilateral exigido é o mesmo.`,
      etapas: [
        { num: "1", estado: "agora",   titulo: "Confirmar o comércio substancial",   desc: "Histórico documentado: contratos e faturas mostrando o volume bilateral entre os dois países." },
        { num: "2", estado: "proximo", titulo: "Montar o dossiê comercial",          desc: "Documentação da empresa e do comércio, sem os formulários consulares." },
        { num: "3", estado: "proximo", titulo: "I-129 com classificação E-1 e COS",  desc: "Submetido ao USCIS — sem consulado, sem DS-160.", linkExterno: { label: "Formulário em uscis.gov/i-129", url: "https://www.uscis.gov/i-129" } },
        { num: "✓", estado: "futuro",  titulo: "E-1 aprovado",                      desc: "Renovável sem limite enquanto o comércio substancial continuar." },
      ],
      guardrails: [
        { tipo: "atencao", texto: "O E-1 não leva direto ao Green Card — executivos podem olhar o EB-1C; perfis qualificados, o EB-2 NIW." },
      ],
      kitId:    "",
      kitLabel: "Falar com um profissional verificado",
      ctaHref:  "/profissionais",
      ctaDesc:  "Ainda não temos kit de documentos pronto para essa rota — comece com uma conversa",
    };
  }

  // ── E-1 via consulado ──────────────────────────────────────────────────
  if (visa_type === "e1") {
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "E-1 · Comércio por tratado",
      situacao:  `O E-1 exige nacionalidade de país com tratado de comércio com os EUA e mais de 50% do volume de comércio da empresa entre os dois países.`,
      etapas: [
        { num: "1", estado: "agora",   titulo: "Confirmar o comércio substancial", desc: "Histórico documentado: contratos e faturas mostrando o volume bilateral entre os dois países." },
        { num: "2", estado: "proximo", titulo: "Montar o dossiê comercial",        desc: "DS-160 + DS-156E com a documentação da empresa.", linkExterno: { label: "DS-160 em ceac.state.gov", url: "https://ceac.state.gov/genniv/" } },
        { num: "3", estado: "futuro",  titulo: "Entrevista consular",              desc: "O cônsul avalia o volume e a natureza do comércio.", linkExterno: { label: "Agendar em ais.usvisa-info.com", url: "https://ais.usvisa-info.com/pt-br/niv" } },
        { num: "✓", estado: "futuro",  titulo: "E-1 aprovado",                    desc: "Renovável sem limite enquanto o comércio substancial continuar." },
      ],
      guardrails: [
        { tipo: "atencao", texto: "O E-1 não leva direto ao Green Card — executivos podem olhar o EB-1C; perfis qualificados, o EB-2 NIW." },
      ],
      kitId:    "",
      kitLabel: "Falar com um profissional verificado",
      ctaHref:  "/profissionais",
      ctaDesc:  "Montar o dossiê de comércio substancial com quem já fez",
    };
  }

  // ── Asilo ou refúgio ─────────────────────────────────────────────────
  if (visa_type === "asylee") {
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "Asilo ou refúgio",
      situacao:  `Você está buscando (ou já tem) asilo nos EUA. Esse caminho tem prazos rígidos e consequências sérias se não for seguido com cuidado — cada passo merece atenção redobrada.`,
      destaque: { tipo: "alerta", texto: "O pedido de asilo (I-589) precisa, em regra, ser apresentado até 1 ano após a chegada aos EUA." },
      etapas: [
        { num: "1", estado: "agora",   titulo: "Protocolar o I-589",              desc: "Pedido de asilo, com evidências do caso.", tag: "1 ano", linkExterno: { label: "Formulário em uscis.gov/i-589", url: "https://www.uscis.gov/i-589" } },
        { num: "2", estado: "proximo", titulo: "Autorização de trabalho (I-765)", desc: "Pode ser pedida 150 dias após protocolar o asilo.", linkExterno: { label: "Formulário em uscis.gov/i-765", url: "https://www.uscis.gov/i-765" } },
        { num: "3", estado: "proximo", titulo: "Entrevista ou audiência",         desc: "Caso afirmativo: entrevista no USCIS. Caso defensivo: audiências na corte de imigração." },
        { num: "4", estado: "futuro",  titulo: "Decisão do caso",                 desc: "Asilo concedido garante permanência e caminho para o Green Card." },
        { num: "✓", estado: "futuro",  titulo: "Green Card (I-485)",              desc: "1 ano após a concessão do asilo, você pode pedir a residência permanente." },
      ],
      guardrails: [
        { tipo: "proibido", texto: "Perder o prazo de 1 ano sem exceção documentada pode fechar a porta do asilo afirmativo — não deixe para depois." },
      ],
      kitId:    "",
      kitLabel: "Falar com um profissional verificado",
      ctaHref:  "/profissionais",
      ctaDesc:  "Casos de asilo exigem acompanhamento próximo — comece com uma conversa",
    };
  }

  // ── Situação em definição ("outro") ───────────────────────────────────
  if (visa_type === "outro") {
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "Situação em definição",
      situacao:  `Sua situação ainda não se encaixa em um caminho claro — isso é comum e tem solução. O primeiro passo é reunir o que você já tem e mapear as portas abertas.`,
      etapas: [
        { num: "1", estado: "agora",   titulo: "Reunir seus documentos",       desc: "I-94, vistos anteriores, petições e prazos — tudo o que mostra onde você está hoje." },
        { num: "2", estado: "proximo", titulo: "Mapear os caminhos possíveis", desc: "Estudo, trabalho, família ou investimento — cada porta tem requisitos próprios." },
        { num: "✓", estado: "futuro",  titulo: "Caminho definido",             desc: "Com a situação mapeada, o Immigrei mostra o próximo passo certo." },
      ],
      guardrails: [],
      kitId:    "",
      kitLabel: "Falar com um profissional verificado",
      ctaHref:  "/profissionais",
      ctaDesc:  "Para casos complexos, uma consulta certa vale mais que mil buscas no Google",
    };
  }

  // ── Fallback genérico ─────────────────────────────────────────────────
  return {
    titulo:    `Jornada de ${nome}`,
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
