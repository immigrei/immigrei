// "Kits de protocolo" catalog — the checklist/guide offered per visa path in
// /documentos. Shared source of truth: the page itself and the search index
// both need this data, so it lives here instead of inline in the page.

export interface Kit {
  id:         string;
  codigo:     string;
  titulo:     string;
  descricao:  string;
  caminho:    "consulado" | "cos" | "manutencao";
  alerta?:    string;
  preco?:     string;  // etiqueta de preço do kit (ex: OPT "R$ 147")
  restrito?:  boolean; // ex: E-2 não disponível para brasileiros
}

export const KITS: Kit[] = [
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

export const caminhoLabel: Record<Kit["caminho"], string> = {
  consulado:  "Consulado",
  cos:        "Change of Status",
  manutencao: "Manutenção",
};

export const caminhoColor: Record<Kit["caminho"], string> = {
  consulado:  "bg-pine-tint text-pine-deep",
  cos:        "bg-amber-tint text-amber-deep",
  manutencao: "bg-cream text-ink-soft border border-pine-tint",
};
