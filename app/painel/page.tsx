"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/app/components/AppShell";
import OptionsList from "@/app/components/OptionsList";
import { getAlternativePaths, getVisaSpecificPaths } from "@/lib/strategies";
import { applyProgress, type DoneWhen, type ProgressSignals } from "@/lib/journey-progress";

interface ChosenSchool {
  school_name: string;
  campus_name: string;
  city:        string;
  state:       string;
  campus_code: string;
}

interface Profile {
  full_name:    string | null;
  visa_type:    string | null;
  location:     "brasil" | "eua" | null;
  main_goal:    string | null;
  arrival_date: string | null;
  chosen_school?: ChosenSchool | null;
}

// ── Strategy engine ───────────────────────────────────────────────────────────

interface Etapa {
  num:    string;
  titulo: string;
  desc:   string;
  estado: "feito" | "agora" | "proximo" | "futuro" | "alerta";
  data?:  string;
  tag?:   string;
  href?:  string; // makes the step card a link (e.g. /escolas)
  // Real-data completion signal (see lib/journey-progress.ts). Steps without
  // it never auto-complete — they depend on events outside the app.
  doneWhen?: DoneWhen;
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
  // Jornadas sem kit próprio (I-130, N-400, I-90) apontam o CTA para outra
  // rota do app em vez de /documentos/[kitId].
  ctaHref?:    string;
  ctaDesc?:    string;
}

export function getStrategy(profile: Profile): Strategy {
  const { visa_type, location, main_goal, full_name } = profile;
  const nome = full_name?.split(" ")[0] ?? "você";

  // ── F-1 do Brasil ────────────────────────────────────────────────────
  if (visa_type === "f1" && location === "brasil") {
    return {
      titulo:    `Jornada de ${nome}`,
      subtitulo: "F-1 via consulado · saindo do Brasil",
      situacao:  `Você está no Brasil e quer obter o visto F-1 para estudar nos EUA. O processo passa pelo consulado americano no Brasil — sem saída prévia dos EUA necessária.`,
      etapas: [
        { num: "1", estado: "agora",   titulo: "Matrícula + I-20",         desc: "Confirme a matrícula em escola SEVP e solicite o I-20 ao DSO.", href: "/escolas", doneWhen: { itens: ["i20"] } },
        { num: "2", estado: "proximo", titulo: "Pagar taxa SEVIS",          desc: "US$350 em fls.dhs.gov. Guarde o comprovante I-901.", tag: "US$350", doneWhen: { itens: ["i901"] } },
        { num: "3", estado: "proximo", titulo: "Preencher DS-160",          desc: "Formulário do Departamento de Estado — campo a campo no kit.", doneWhen: { itens: ["ds160"] } },
        { num: "4", estado: "proximo", titulo: "Montar dossiê",             desc: "Extrato pessoal, vínculo com Brasil, carta de sponsor se aplicável.", doneWhen: { itens: ["financeiro", "vinculo"] } },
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
      titulo:    `Jornada de ${nome}`,
      subtitulo: "F-1 · Change of Status — dentro dos EUA",
      situacao:  `Você está nos EUA e quer mudar para o F-1 sem sair do país. O processo usa o formulário I-539 direto com o USCIS — sem entrevista consular, mas exige status válido no protocolo.`,
      destaque: { tipo: "alerta", texto: "Seu status atual precisa estar válido no dia do protocolo do I-539. Verifique o I-94 antes de qualquer passo." },
      etapas: [
        { num: "1", estado: "agora",   titulo: "Verificar status no I-94",    desc: "i94.cbp.dhs.gov — confirme que você ainda está em status válido.", doneWhen: { itens: ["status-valido"] } },
        { num: "2", estado: "proximo", titulo: "Escolher escola SEVP próxima", desc: "Escola presencial longe da sua residência resulta em negação.", href: "/escolas", doneWhen: { school: true } },
        { num: "3", estado: "proximo", titulo: "Obter o I-20",                desc: "Escola emite o I-20 após matrícula confirmada.", doneWhen: { itens: ["i20-cos"] } },
        { num: "4", estado: "proximo", titulo: "Reunir documentação financeira", desc: "Extrato pessoal de 6 meses. No seu nome. PDF oficial do banco.", tag: "Crítico", doneWhen: { itens: ["extrato-pessoal"] } },
        { num: "5", estado: "proximo", titulo: "Preencher e enviar I-539",    desc: "Taxa US$370 por money order. Endereço varia por estado.", tag: "US$370", doneWhen: { itens: ["i539"] } },
        { num: "6", estado: "futuro",  titulo: "Receber I-797 de recebimento", desc: "Guarde este documento — prova que você protocolou em status.", doneWhen: { itens: ["i797-recebimento"] } },
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
      titulo:    `Jornada de ${nome}`,
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
      titulo:    `Jornada de ${nome}`,
      subtitulo: "M-1 via consulado · saindo do Brasil",
      situacao:  `Você está no Brasil e quer o M-1 para fazer um curso técnico ou vocacional nos EUA. O processo é similar ao F-1, mas com a taxa SEVIS mais baixa e foco em programa vocacional.`,
      etapas: [
        { num: "1", estado: "agora",   titulo: "Escola técnica SEVP + I-20 M-1",  desc: "Matrícula em escola vocacional credenciada. I-20 M-1 é diferente do F-1.", href: "/escolas", doneWhen: { itens: ["i20"] } },
        { num: "2", estado: "proximo", titulo: "Taxa SEVIS M-1",                   desc: "US$200 (menor que o F-1) em fls.dhs.gov.", tag: "US$200", doneWhen: { itens: ["i901"] } },
        { num: "3", estado: "proximo", titulo: "DS-160 + dossiê",                  desc: "Campo a campo no kit. Mesmo processo do F-1 com variações para M-1.", doneWhen: { itens: ["ds160", "financeiro"] } },
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
        { num: "4", estado: "futuro",  titulo: "LCA aprovada pelo DOL",               desc: "Labor Condition Application — o empregador submete em ~7 dias.", doneWhen: { itens: cos ? ["lca-cos"] : ["lca"] } },
        { num: "5", estado: "futuro",  titulo: "I-129 submetido ao USCIS",            desc: "Petição completa após a LCA. Prazo padrão ou Premium Processing.", doneWhen: { itens: cos ? ["i129-cos"] : ["i129"] } },
        { num: "6", estado: "futuro",  titulo: "I-797 aprovado + entrevista/COS",     desc: "Entrevista consular se fora dos EUA, ou COS se já está aqui.", tag: "I-797", doneWhen: { itens: cos ? ["i797-cos"] : ["i797"] } },
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
        { num: "3", estado: "proximo", titulo: "Empregador ou agente protocola o I-129",         desc: "Com toda a documentação de suporte. Advogado de imigração é altamente recomendado.", tag: "I-129", doneWhen: cos ? undefined : { itens: ["i129o"] } },
        { num: "4", estado: "futuro",  titulo: "I-797 aprovado",                                 desc: "Aprovação em 2–4 meses (padrão) ou 15 dias úteis (Premium Processing).", doneWhen: { itens: cos ? ["i797-o1-cos"] : ["i797"] } },
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
          { num: "3", estado: "proximo", titulo: "Protocolar o I-130",                  desc: "US$625 online ou US$675 em papel. A data de recebimento vira sua priority date — a posição na fila.", tag: "US$625" },
          { num: "4", estado: "futuro",  titulo: "Acompanhar o Boletim de Vistos",      desc: "Brasil entra em 'All Chargeability'. Quando a sua priority date ficar current, o caso avança — o Immigrei avisa.", tag: "Mensal" },
          { num: "5", estado: "futuro",  titulo: "Consulado (DS-260) ou ajuste (I-485)", desc: "Familiar fora dos EUA: NVC + entrevista consular. Nos EUA em status válido: I-485 quando a data permitir." },
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
          { num: "3", estado: "proximo", titulo: "Protocolar o N-400",       desc: "US$710 online ou US$760 em papel. Renda entre 150–400% da linha da pobreza paga US$380.", tag: "US$710" },
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
          { num: "2", estado: "proximo", titulo: "Protocolar o I-90",           desc: "US$415 online ou US$465 em papel, direto na conta USCIS.", tag: "US$415" },
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
        { num: "A", estado: "agora", titulo: "Manter a residência",        desc: "Evite ausências de 6+ meses dos EUA. Para ficar até 2 anos fora, o Reentry Permit (I-131) precisa ser pedido ANTES de sair." },
        { num: "B", estado: "agora", titulo: "Renovar o cartão (I-90)",    desc: "Cartão de 10 anos vencido ou a vencer em 6 meses. Condicional de 2 anos usa o I-751." },
        { num: "C", estado: "agora", titulo: "Peticionar a família (I-130)", desc: "Cônjuge e filhos solteiros nas categorias F2A / F2B — o Immigrei acompanha a fila no Boletim de Vistos." },
        { num: "D", estado: "agora", titulo: "Caminho à cidadania (N-400)", desc: "5 anos como residente (ou 3, com cidadão americano). Pode protocolar 90 dias antes de completar." },
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
          { num: "3", estado: "proximo", titulo: "Protocolar o I-130 (ou I-129F)",   desc: "US$625 online ou US$675 em papel. Noivo(a): I-129F para o K-1.", tag: "US$625" },
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
        { num: "A", estado: "agora", titulo: "Votar e ter passaporte americano", desc: "Voto em eleições federais e estaduais. Passaporte via DS-11 — a prova de cidadania mais prática." },
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
        { num: "3", estado: "proximo", titulo: "I-140 submetido ao USCIS",           desc: "Auto-petição. Taxa: US$715. Com carta de petição (cover letter) argumentando o NIW.", tag: "US$715", doneWhen: { itens: nosEua ? ["i140"] : ["i140-aprovado"] } },
        { num: "4", estado: "futuro",  titulo: "I-140 aprovado + Visa Bulletin",     desc: "Aguardar número de visto disponível no Boletim de Vistos (EB-2 Brasil pode ter fila).", doneWhen: nosEua ? undefined : { itens: ["i140-aprovado", "boletim-vistos"] } },
        { num: "5", estado: "futuro",  titulo: nosEua ? "I-485 — Ajuste de Status" : "NVC + DS-260 + consulado", desc: nosEua ? "Formulário I-485 + exame médico (I-693) + biometria." : "NVC processa o caso, DS-260 online, documentos civis, entrevista consular.", tag: nosEua ? "AOS" : "Consular", doneWhen: { itens: nosEua ? ["i485"] : ["ds260"] } },
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

// ── Component ─────────────────────────────────────────────────────────────────

// Verde é reservado para "feito" — etapa concluída com dado real do usuário.
// "proximo" e "futuro" ficam neutros para não parecerem concluídos.
const estadoStyle: Record<Etapa["estado"], { dot: string; card: string; data: string }> = {
  feito:   { dot: "bg-pine border-pine-deep text-cream",                 card: "border-pine/40 bg-pine-tint/40",      data: "text-pine-deep" },
  agora:   { dot: "bg-amber border-amber-deep text-pine-deep shadow-amber/30 shadow-md", card: "border-amber",  data: "text-amber-deep" },
  proximo: { dot: "bg-cream-2 border-ink-faint text-ink-soft",           card: "border-pine-tint",                    data: "text-ink-soft" },
  futuro:  { dot: "bg-cream-2 border-pine-tint text-ink-faint",          card: "border-pine-tint",                    data: "text-ink-faint" },
  alerta:  { dot: "bg-clay border-clay text-cream",                      card: "border-clay",                         data: "text-clay" },
};

export default function PainelPage() {
  const router  = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [satisfeitos, setSatisfeitos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const d = await fetch("/api/profile").then((r) => r.json());
        const p: Profile | null = d.profile ?? null;
        setProfile(p);

        // Progresso real: itens marcados no checklist do kit + arquivos no cofre.
        const kitId = p ? getStrategy(p).kitId : "";
        if (kitId) {
          const [check, docs] = await Promise.all([
            fetch(`/api/checklist?vistoId=${kitId}`)
              .then((r) => (r.ok ? r.json() : { items: [] }))
              .catch(() => ({ items: [] })),
            fetch(`/api/user-documents?vistoId=${kitId}`)
              .then((r) => (r.ok ? r.json() : { documents: [] }))
              .catch(() => ({ documents: [] })),
          ]);
          setSatisfeitos(new Set<string>([
            ...((check.items ?? []) as string[]),
            ...((docs.documents ?? []) as { documento_id: string }[]).map((a) => a.documento_id),
          ]));
        }
      } catch {
        // perfil indisponível — cai no estado "complete o onboarding"
      }
      setLoading(false);
    })();
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
  const signals: ProgressSignals = { hasSchool: Boolean(profile.chosen_school), satisfeitos };
  const etapas = applyProgress(s.etapas, signals);

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
              {etapas.map((etapa, i) => {
                const st = estadoStyle[etapa.estado];
                const escola = etapa.href === "/escolas" ? profile.chosen_school : null;
                const cardContent = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-ink leading-snug">{etapa.titulo}</p>
                      {etapa.tag && (
                        <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-ink/10 text-ink-soft">
                          {etapa.tag}
                        </span>
                      )}
                    </div>
                    {escola ? (
                      <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                        <span className="font-bold text-pine">✓ {escola.school_name}</span>
                        {" — "}{escola.city}, {escola.state}. Toque para trocar de escola.
                      </p>
                    ) : (
                      <p className="text-xs text-ink-soft mt-1 leading-relaxed">{etapa.desc}</p>
                    )}
                    {etapa.href && !escola && (
                      <p className="text-xs font-bold text-pine mt-1.5">
                        Buscar escolas certificadas →
                      </p>
                    )}
                  </>
                );
                return (
                  <div key={i} className="flex gap-4 relative">
                    {/* dot */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-[11px] font-bold z-10 ${st.dot}`}>
                      {etapa.estado === "feito" ? "✓" : etapa.num}
                    </div>
                    {/* card */}
                    {etapa.href ? (
                      <Link
                        href={etapa.href}
                        className={`flex-1 rounded-2xl border bg-cream-2 px-4 py-3 mb-0.5 hover:border-pine hover:shadow-sm transition-all ${st.card}`}
                      >
                        {cardContent}
                      </Link>
                    ) : (
                      <div className={`flex-1 rounded-2xl border bg-cream-2 px-4 py-3 mb-0.5 ${st.card}`}>
                        {cardContent}
                      </div>
                    )}
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

        {/* Outros caminhos possíveis */}
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-1" style={{ letterSpacing: "0.1em" }}>
            Outros caminhos possíveis
          </p>
          <p className="text-xs text-ink-soft leading-relaxed mb-2">
            Sua jornada atual não é a única porta. Estas rotas existem em paralelo — algumas podem
            ser mais rápidas ou mais seguras dependendo da sua vida hoje.
          </p>
          <div className="bg-cream-2 rounded-2xl border border-pine-tint overflow-hidden">
            <OptionsList
              options={[
                ...getVisaSpecificPaths(profile.visa_type),
                ...getAlternativePaths({ location: profile.location }),
              ]}
            />
          </div>
        </div>

        {/* CTA — kit */}
        <div className="bg-pine rounded-2xl px-5 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-pine-tint mb-1" style={{ letterSpacing: "0.1em" }}>
              Próximo passo
            </p>
            <p className="text-sm font-semibold text-cream">{s.kitLabel}</p>
            <p className="text-xs text-pine-tint mt-0.5">{s.ctaDesc ?? "Guia completo passo a passo em português"}</p>
          </div>
          <button
            onClick={() => router.push(s.ctaHref ?? `/documentos/${s.kitId}`)}
            className="flex-shrink-0 bg-amber text-pine-deep font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-amber-deep transition-colors"
          >
            {s.ctaHref ? "Abrir →" : "Ver kit →"}
          </button>
        </div>

        <p className="text-xs text-ink-faint mt-8 leading-relaxed">
          Este painel é baseado nas informações do seu perfil e em dados públicos da USCIS. Não é aconselhamento jurídico. Para situações complexas, consulte um immigration attorney.
        </p>
      </div>
    </AppShell>
  );
}
