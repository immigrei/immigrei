/**
 * One-line plain-language definitions for every official form code shown in
 * the documentos checklists (app/documentos/[vistoId]/data.ts). Powers the
 * "i" info badge next to a form code — not a substitute for the full
 * content/leis/formularios/*.md entry when one exists.
 */

export interface FormGlossaryEntry {
  nome: string;
  resumo: string;
}

export const FORM_GLOSSARY: Record<string, FormGlossaryEntry> = {
  "DS-156E": {
    nome: "Nonimmigrant Treaty Trader/Investor Application",
    resumo:
      "Formulário suplementar do consulado para pedir visto E-1 (comerciante) ou E-2 (investidor) por tratado.",
  },
  "DS-160": {
    nome: "Online Nonimmigrant Visa Application",
    resumo:
      "Formulário online do Departamento de Estado para qualquer visto de não-imigrante, preenchido antes da entrevista consular.",
  },
  "DS-2019": {
    nome: "Certificate of Eligibility for Exchange Visitor Status",
    resumo:
      "Emitido pelo patrocinador autorizado do programa J-1, comprova a vaga e os dados do intercâmbio.",
  },
  "DS-260": {
    nome: "Immigrant Visa Electronic Application",
    resumo:
      "Formulário online do NVC para quem vai pedir visto de imigrante (green card) pelo consulado, fora dos EUA.",
  },
  "DS-5540": {
    nome: "Public Charge Questionnaire",
    resumo:
      "Questionário do Departamento de Estado sobre renda e benefícios públicos, usado na análise de alguns vistos de imigrante.",
  },
  "EOIR-42B": {
    nome: "Application for Cancellation of Removal",
    resumo:
      "Pedido feito na corte de imigração (não no USCIS) para cancelar a remoção de quem já está em processo de deportação.",
  },
  ESTA: {
    nome: "Electronic System for Travel Authorization",
    resumo:
      "Autorização eletrônica para viajar aos EUA sem visto, pelo programa Visa Waiver — só para turismo/negócios de até 90 dias.",
  },
  "G-1145": {
    nome: "E-Notification of Application/Petition Acceptance",
    resumo:
      "Formulário opcional grampeado no pacote para receber aviso por e-mail/SMS quando o USCIS receber a petição.",
  },
  "I-20": {
    nome: "Certificate of Eligibility for Nonimmigrant Student Status",
    resumo:
      "Emitido pela escola credenciada pelo SEVP, prova a vaga no curso e é a base do visto F-1 ou M-1.",
  },
  "I-90": {
    nome: "Application to Replace Permanent Resident Card",
    resumo:
      "Pedido de renovação ou 2ª via do green card de 10 anos (vencido, perdido, roubado ou com dado errado).",
  },
  "I-129": {
    nome: "Petition for a Nonimmigrant Worker",
    resumo:
      "Petição que o empregador (ou agente) submete ao USCIS para contratar alguém em status de trabalho como H-1B, L-1 ou O-1.",
  },
  "I-129F": {
    nome: "Petition for Alien Fiancé(e)",
    resumo:
      "Petição do cidadão americano para trazer o(a) noivo(a) estrangeiro(a) com o visto K-1.",
  },
  "I-130": {
    nome: "Petition for Alien Relative",
    resumo:
      "Petição que prova o vínculo familiar — o primeiro passo de qualquer green card baseado em família.",
  },
  "I-130A": {
    nome: "Supplemental Information for Spouse Beneficiary",
    resumo:
      "Formulário complementar que o cônjuge beneficiário preenche junto com a I-130 do casal.",
  },
  "I-131": {
    nome: "Application for Travel Document",
    resumo:
      "Pedido de autorização de viagem (advance parole) ou de reentry permit para sair dos EUA sem perder o processo/status em andamento.",
  },
  "I-140": {
    nome: "Immigrant Petition for Alien Worker",
    resumo:
      "Petição de green card por qualificação profissional — base das categorias EB (EB-2, EB-2 NIW, EB-3, EB-1C).",
  },
  "I-360": {
    nome: "Petition for Amerasian, Widow(er), or Special Immigrant",
    resumo:
      "Petição para categorias especiais de green card, entre elas VAWA (autopetição por abuso) e viúvo(a) de cidadão americano.",
  },
  "I-485": {
    nome: "Application to Register Permanent Residence or Adjust Status",
    resumo:
      "Pedido de green card feito de dentro dos EUA — troca o status atual por residência permanente sem sair do país.",
  },
  "I-526": {
    nome: "Immigrant Petition by Standalone Investor",
    resumo:
      "Petição EB-5 para quem investe diretamente no próprio negócio, fora de um Regional Center.",
  },
  "I-526E": {
    nome: "Immigrant Petition by Regional Center Investor",
    resumo:
      "Petição EB-5 para quem investe através de um Regional Center aprovado.",
  },
  "I-539": {
    nome: "Application to Extend/Change Nonimmigrant Status",
    resumo:
      "Pedido ao USCIS, de dentro dos EUA, para estender o status atual ou mudar para outro status de não-imigrante.",
  },
  "I-589": {
    nome: "Application for Asylum and Withholding of Removal",
    resumo:
      "Pedido de asilo — precisa ser protocolado até 1 ano após a entrada nos EUA, salvo exceções.",
  },
  "I-601A": {
    nome: "Application for Provisional Unlawful Presence Waiver",
    resumo:
      "Pedido de perdão provisório de unlawful presence, protocolado antes de sair para a entrevista consular no exterior.",
  },
  "I-693": {
    nome: "Report of Medical Examination and Vaccination Record",
    resumo:
      "Exame médico e histórico de vacinas feito por médico credenciado pelo USCIS (civil surgeon), exigido no I-485.",
  },
  "I-751": {
    nome: "Petition to Remove Conditions on Residence",
    resumo:
      "Remove a condição do green card de 2 anos concedido por casamento recente — sem ela, o status vence sozinho.",
  },
  "I-765": {
    nome: "Application for Employment Authorization",
    resumo:
      "Pedido de autorização de trabalho (EAD) — usado em OPT, ajuste de status, asilo e outras categorias elegíveis.",
  },
  "I-797": {
    nome: "Notice of Action",
    resumo:
      "Aviso oficial do USCIS — recibo de recebimento, pedido de mais provas (RFE) ou aprovação de uma petição.",
  },
  "I-829": {
    nome: "Petition by Investor to Remove Conditions",
    resumo:
      "Equivalente ao I-751 para o EB-5: remove a condição do green card de investidor, provando que o investimento e os empregos se concretizaram.",
  },
  "I-864": {
    nome: "Affidavit of Support",
    resumo:
      "Declaração de responsabilidade financeira do patrocinador, exigindo renda mínima de 125% da linha de pobreza.",
  },
  "I-901": {
    nome: "SEVIS I-901 Fee",
    resumo:
      "Taxa obrigatória do sistema SEVIS, paga antes da entrevista ou do protocolo de F-1, M-1 ou J-1.",
  },
  "I-914": {
    nome: "Application for T Nonimmigrant Status",
    resumo:
      "Pedido de visto T, para vítimas de tráfico de pessoas.",
  },
  "I-918": {
    nome: "Petition for U Nonimmigrant Status",
    resumo:
      "Pedido de visto U, para vítimas de determinados crimes que colaboram com a investigação policial.",
  },
  "N-400": {
    nome: "Application for Naturalization",
    resumo:
      "Pedido de cidadania americana, disponível depois de tempo mínimo como residente permanente (geralmente 5 anos, ou 3 casado com cidadão).",
  },
};

export function getFormGlossary(codigo: string): FormGlossaryEntry | undefined {
  return FORM_GLOSSARY[codigo];
}
