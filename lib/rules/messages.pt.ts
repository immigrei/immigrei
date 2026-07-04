// lib/rules/messages.pt.ts — strings de UI pré-aprovadas pelo advogado
// parceiro (RFC-001, Entregável 3.3). A UI SÓ renderiza texto deste arquivo,
// indexado por uiMessageKey — nunca texto livre gerado pelo motor de regras.
//
// Blindagem UPL: nenhuma string aqui contém verbos de conselho ("recomendamos",
// "você deveria", "é melhor", "espere", "suas chances"). Toda mensagem de
// bloqueio cita a norma, linka a fonte oficial e oferece advogado parceiro.

export const MESSAGES_PT = {
  'block.i94_expired':
    'Não conseguimos preparar este pedido. A regra federal 8 CFR § 248.1(b) ' +
    'exige que a mudança de status seja protocolada enquanto o seu período ' +
    'autorizado de permanência (I-94) está vigente — e o seu I-94 registra ' +
    '{i94_date} como data-limite. Sabemos que essa notícia é difícil. Casos ' +
    'fora dos parâmetros do nosso compilador precisam de análise individual: ' +
    'podemos te conectar agora com um advogado parceiro. Ver a norma oficial →',

  'disclosure.dos_90_day':
    'Antes de continuar, precisamos que você leia uma regra oficial do ' +
    'Departamento de Estado. Você entrou nos EUA há {days} dias. O manual ' +
    '9 FAM 302.9-4(B)(3)(g)(2) diz, em tradução livre: "{official_text_pt}" ' +
    '[texto original em inglês →]. O Immigrei não avalia como essa regra se ' +
    'aplica ao seu caso — isso é uma análise jurídica individual. Você pode ' +
    'prosseguir com o preenchimento por sua própria decisão, ou conversar ' +
    'antes com um advogado parceiro. ☐ Li a regra oficial acima e decido ' +
    'prosseguir por conta própria.',

  'block.i20_missing':
    'Para compilar este pedido, o formulário federal exige um Form I-20 ' +
    'emitido por uma escola certificada pelo SEVP, com número SEVIS no ' +
    'formato N + 10 dígitos (regra 8 CFR § 214.2(f)(1)(i)(A)). Ainda não ' +
    'encontramos esse dado no seu caso. O I-20 é emitido pela escola após a ' +
    'sua admissão — você pode consultar escolas certificadas na ferramenta ' +
    'oficial do governo (studyinthestates.dhs.gov) e voltar aqui quando o ' +
    'documento chegar. Seu progresso fica salvo. Se preferir, um advogado ' +
    'parceiro pode orientar seus próximos passos.',

  'block.sevis_fee_unpaid':
    'Não conseguimos preparar este pedido. A regra federal 8 CFR § ' +
    '214.13(a)(3) exige o pagamento da taxa SEVIS I-901 antes da mudança de ' +
    'status para F-1. Ainda não encontramos esse comprovante no seu caso — ' +
    'o pagamento é feito diretamente em fmjfee.com, e você pode voltar aqui ' +
    'assim que tiver o recibo. Seu progresso fica salvo. Se preferir, um ' +
    'advogado parceiro pode orientar seus próximos passos.',

  'block.b2_study_started':
    'Não conseguimos preparar este pedido. A regra federal 8 CFR § ' +
    '214.2(b)(7) trata o início de um curso de estudos durante o status ' +
    'B1/B2 como violação das condições desse status. O seu caso registra ' +
    'essa informação. Sabemos que essa notícia é difícil. Casos fora dos ' +
    'parâmetros do nosso compilador precisam de análise individual — ' +
    'podemos te conectar agora com um advogado parceiro. Ver a norma ' +
    'oficial →',

  'block.unauthorized_work':
    'Não conseguimos preparar este pedido. As regras federais 8 CFR § ' +
    '214.1(e) e INA § 248(a)(1) impedem a mudança de status de quem não ' +
    'manteve o status B1/B2 — o que inclui o exercício de trabalho sem ' +
    'autorização. O seu caso registra essa informação. Sabemos que essa ' +
    'notícia é difícil. Casos fora dos parâmetros do nosso compilador ' +
    'precisam de análise individual — podemos te conectar agora com um ' +
    'advogado parceiro. Ver a norma oficial →',

  'block.i94_missing':
    'Não conseguimos preparar este pedido. A regra federal 8 CFR § ' +
    '248.1(b) exige que a mudança de status seja protocolada enquanto o ' +
    'seu período autorizado de permanência (I-94) está vigente, e ainda ' +
    'não encontramos a data "Admit Until" do seu I-94 no seu caso. Você ' +
    'pode consultar o documento mais recente em i94.cbp.dhs.gov e informar ' +
    'essa data para continuar. Seu progresso fica salvo. Se preferir, um ' +
    'advogado parceiro pode orientar seus próximos passos.',

  'block.last_entry_date_missing':
    'Não conseguimos preparar este pedido. A regra 9 FAM 302.9-4(B)(3)(g) ' +
    'do Departamento de Estado depende da data da sua última entrada nos ' +
    'EUA, e ainda não encontramos essa informação no seu caso. Você pode ' +
    'consultar a data no seu I-94 em i94.cbp.dhs.gov e informá-la para ' +
    'continuar. Seu progresso fica salvo. Se preferir, um advogado ' +
    'parceiro pode orientar seus próximos passos.',

  // Helper text educativo sob os campos do formulário (app/casos/cos-b2-f1).
  // Definições factuais de uma linha — zero verbo de conselho — vigiadas
  // pelo mesmo guard UPL (messages.upl-guard.test.ts) que as mensagens de
  // bloqueio/disclosure.
  'helper.i94_number':
    'Registro eletrônico de entrada e saída criado pelo CBP quando você ' +
    'entra nos EUA. Consulte o seu em i94.cbp.dhs.gov.',

  'helper.last_entry_date':
    'Data que consta no seu I-94 — o mesmo registro eletrônico de entrada ' +
    'e saída emitido pelo CBP.',

  'helper.i94_admit_until':
    'Data-limite da sua permanência autorizada, definida pelo CBP — campo ' +
    '"Admit Until" do I-94.',

  'helper.sevis_id':
    'Número no topo do seu Form I-20, emitido pela escola. Formato N ' +
    'seguido de 10 dígitos.',

  'helper.i901_fee_paid':
    'Taxa SEVIS paga diretamente ao SEVP em fmjfee.com, exigida para a ' +
    'mudança de status para F-1.',
} as const;

export type UiMessageKey = keyof typeof MESSAGES_PT;
