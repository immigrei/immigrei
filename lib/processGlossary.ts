/**
 * One-line plain-language PT-BR definitions for immigration PROCESS acronyms
 * (as opposed to lib/formGlossary.ts, which covers official FORM codes).
 * Companion glossary for the "nome em inglês + explicação em português na
 * primeira menção" rule (CLAUDE.md, seção 3). Not yet wired to a UI
 * component — first-mention inline glosses (RFE/NTA style: "SIGLA
 * (explicação em português)") are applied directly in copy where the term
 * first appears; this file exists so the wording stays consistent across
 * files instead of being invented ad hoc each time.
 */

export interface ProcessGlossaryEntry {
  sigla: string;
  explicacaoPt: string;
}

export const PROCESS_GLOSSARY: Record<string, ProcessGlossaryEntry> = {
  OPT: { sigla: "OPT", explicacaoPt: "autorização de trabalho pós-formatura" },
  CPT: { sigla: "CPT", explicacaoPt: "autorização de trabalho ligada ao currículo, durante o curso" },
  DSO: { sigla: "DSO", explicacaoPt: "funcionário da instituição responsável pelo seu status F-1/M-1" },
  SEVP: { sigla: "SEVP", explicacaoPt: "programa federal que credencia escolas para receber estudantes estrangeiros" },
  SEVIS: { sigla: "SEVIS", explicacaoPt: "sistema que rastreia estudantes e intercambistas estrangeiros" },
  PERM: { sigla: "PERM", explicacaoPt: "certificação trabalhista que o empregador precisa obter antes de patrocinar o Green Card" },
  NVC: { sigla: "NVC", explicacaoPt: "centro que processa o caso entre a aprovação da petição e a entrevista consular" },
  EAD: { sigla: "EAD", explicacaoPt: "cartão de autorização de trabalho" },
  AOS: { sigla: "AOS", explicacaoPt: "ajuste de status — pedir o green card por dentro dos EUA, sem sair do país" },
  COS: { sigla: "COS", explicacaoPt: "mudança de status — trocar de visto por dentro dos EUA, sem sair do país" },
  CBP: { sigla: "CBP", explicacaoPt: "agência que controla a entrada nos EUA nas fronteiras e aeroportos" },
  EOIR: { sigla: "EOIR", explicacaoPt: "tribunal administrativo de imigração, onde corre um processo de remoção" },
  BIA: { sigla: "BIA", explicacaoPt: "órgão de apelação do EOIR para a maioria das decisões de imigração" },
  AAO: { sigla: "AAO", explicacaoPt: "órgão de apelação do USCIS para petições de visto de trabalho negadas" },
  VAWA: { sigla: "VAWA", explicacaoPt: "lei que permite pedir green card sozinho(a) em casos de violência doméstica, sem depender do agressor" },
  TPS: { sigla: "TPS", explicacaoPt: "status temporário de proteção para nacionais de países em crise" },
  VWP: { sigla: "VWP", explicacaoPt: "programa que permite viajar aos EUA sem visto, por até 90 dias" },
  ESTA: { sigla: "ESTA", explicacaoPt: "autorização eletrônica exigida para entrar pelo VWP" },
  LCA: { sigla: "LCA", explicacaoPt: "declaração que o empregador registra sobre salário e condições, antes do H-1B" },
};
