// lib/rules/officialTextPt.ts
//
// PENDENTE: aprovação do advogado parceiro.
//
// Tradução livre (não oficial) do trecho de 9 FAM 302.9-4(B)(3)(g)(2)(a)
// (rev. CT:VISA-2002, 05-31-2024) usado no placeholder {official_text_pt}
// da mensagem 'disclosure.dos_90_day' (lib/rules/messages.pt.ts, RFC-001
// §3.3). O texto oficial em inglês (OFFICIAL_TEXT.FAM_302_9_4_B_3_G, em
// lib/rules/cosB2F1.ts) é sempre a fonte de verdade e é exibido junto com o
// link para fam.state.gov — esta tradução é só apoio de leitura, nunca
// substitui a norma original. Texto-fonte verificado contra fam.state.gov
// em 2026-07-04 (auditoria de grounding, migration 011).
export const OFFICIAL_TEXT_PT = {
  // Voz corrigida (revisão adversarial 2026-07-04): no original, "you may
  // presume" dirige-se ao OFICIAL CONSULAR — é faculdade discricionária do
  // agente, não presunção automática da lei. A tradução anterior ("pode-se
  // presumir") apagava o sujeito e sugeria automatismo.
  FAM_302_9_4_B_3_G:
    'Se um indivíduo agir de forma inconsistente com o seu status de não ' +
    'imigrante dentro de 90 dias do pedido de visto ou da admissão nos ' +
    'EUA, o oficial consular pode, a seu critério, presumir que o ' +
    'requerente fez uma declaração falsa intencional (isto é, pode ' +
    'presumir que as declarações do requerente sobre exercer apenas ' +
    'atividades compatíveis com o status eram declarações falsas e ' +
    'intencionais sobre suas verdadeiras intenções ao buscar o visto ou ' +
    'a admissão). O oficial deve dar ao requerente a oportunidade de ' +
    'refutar essa presunção.',
} as const;
