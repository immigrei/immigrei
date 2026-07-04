// lib/rules/officialTextPt.ts
//
// PENDENTE: aprovação do advogado parceiro.
//
// Tradução livre (não oficial) do trecho de 9 FAM 302.9-4(B)(3)(g) usado no
// placeholder {official_text_pt} da mensagem 'disclosure.dos_90_day'
// (lib/rules/messages.pt.ts, RFC-001 §3.3). O texto oficial em inglês
// (OFFICIAL_TEXT.FAM_302_9_4_B_3_G, em lib/rules/cosB2F1.ts) é sempre a
// fonte de verdade e é exibido junto com o link para fam.state.gov — esta
// tradução é só apoio de leitura, nunca substitui a norma original.
export const OFFICIAL_TEXT_PT = {
  FAM_302_9_4_B_3_G:
    'Se um(a) estrangeiro(a) violar, ou agir de forma inconsistente com, o ' +
    'seu status de não imigrante dentro de 90 dias da entrada, pode-se ' +
    'presumir que as declarações do(a) requerente sobre exercer apenas ' +
    'atividades compatíveis com o status eram declarações falsas e ' +
    'intencionais sobre sua real intenção ao buscar o visto ou a entrada.',
} as const;
