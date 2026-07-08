/**
 * USCIS status translation layer (PT-BR)
 *
 * The DB and the classifiers (isDeniedStatus/isApprovedStatus) always work
 * on the raw English status from uscis.gov — translation happens at render
 * time only. Every translation carries a short plain-Portuguese explanation
 * of what the status means and what (if anything) the user should do,
 * following the brand voice: warm, direct, no legal jargon.
 *
 * Unknown statuses fall back to a keyword-based category so the user never
 * sees a bare English string without context.
 */

export type StatusTraduzido = {
  titulo: string; // short PT-BR status title shown as the main line
  explicacao: string; // 1-2 sentence plain-PT explanation
  original: string; // raw English status from USCIS (kept visible for support)
  exato: boolean; // true = exact dictionary hit; false = keyword fallback
};

// Keys are normalized: lowercase, punctuation stripped, spaces collapsed.
const TRADUCOES: Record<string, { titulo: string; explicacao: string }> = {
  "case was received": {
    titulo: "Caso recebido",
    explicacao:
      "O USCIS recebeu sua petição e abriu o processo. Nenhuma ação necessária agora — guarde o recibo I-797 que chega pelo correio.",
  },
  "case was received and a receipt notice was emailed": {
    titulo: "Caso recebido — recibo enviado por e-mail",
    explicacao: "O USCIS recebeu sua petição e enviou o recibo por e-mail. Nenhuma ação necessária.",
  },
  "case was approved": {
    titulo: "Caso aprovado 🎉",
    explicacao:
      "O USCIS aprovou sua petição. A notificação de aprovação (I-797) chega pelo correio nos próximos dias.",
  },
  "case was approved and my decision was emailed": {
    titulo: "Caso aprovado 🎉",
    explicacao: "O USCIS aprovou sua petição e enviou a decisão por e-mail.",
  },
  "case was denied": {
    titulo: "Caso negado",
    explicacao:
      "O USCIS negou a petição. Respire: negativa não é ordem de deportação, e existem saídas com prazos — veja suas opções no painel e converse com um profissional antes de agir.",
  },
  "case was denied and my decision was mailed": {
    titulo: "Caso negado — decisão enviada pelo correio",
    explicacao:
      "A carta explica os motivos e é o documento mais importante agora: ela define suas próximas opções. Veja as saídas no painel e leve a carta a um profissional.",
  },
  "request for additional evidence was sent": {
    titulo: "Pedido de evidências adicionais (RFE) enviado",
    explicacao:
      "O USCIS precisa de mais documentos antes de decidir. A carta (RFE) lista o que enviar e o prazo — responder completo e dentro do prazo é crítico.",
  },
  "request for initial evidence was sent": {
    titulo: "Pedido de evidências iniciais enviado",
    explicacao:
      "Faltou algum documento obrigatório no pacote. A carta lista o que enviar e o prazo — não perca a data.",
  },
  "response to uscis request for evidence was received": {
    titulo: "Resposta ao RFE recebida",
    explicacao:
      "O USCIS recebeu seus documentos e o caso voltou para a fila de análise. Nenhuma ação necessária agora.",
  },
  "notice of intent to deny was sent": {
    titulo: "Aviso de intenção de negar (NOID)",
    explicacao:
      "O USCIS sinalizou que pretende negar, mas abriu prazo para você responder. É o momento de agir com orientação profissional — a resposta pode reverter.",
  },
  "case is being actively reviewed by uscis": {
    titulo: "Caso em análise ativa",
    explicacao: "Um oficial está revisando seu caso. Nenhuma ação necessária — é sinal de movimento.",
  },
  "case remains pending": {
    titulo: "Caso segue pendente",
    explicacao: "O caso está na fila, sem decisão ainda. Nenhuma ação necessária.",
  },
  "fingerprint fee was received": {
    titulo: "Taxa de biometria recebida",
    explicacao: "Pagamento confirmado. O agendamento da coleta de digitais vem em seguida.",
  },
  "fingerprint and biometrics appointment was scheduled": {
    titulo: "Biometria agendada",
    explicacao:
      "A carta com data, hora e local chega pelo correio. Compareça — faltar sem reagendar pode travar (ou encerrar) o caso.",
  },
  "fingerprint and biometrics appointment was rescheduled": {
    titulo: "Biometria reagendada",
    explicacao: "Nova data a caminho pelo correio. Confira o endereço cadastrado.",
  },
  "case was updated to show fingerprints were taken": {
    titulo: "Digitais coletadas",
    explicacao: "Biometria concluída e registrada. O caso segue para análise.",
  },
  "fingerprints were taken": {
    titulo: "Digitais coletadas",
    explicacao: "Biometria concluída e registrada. O caso segue para análise.",
  },
  "interview was scheduled": {
    titulo: "Entrevista agendada",
    explicacao:
      "A carta com data e local chega pelo correio. Prepare os originais dos documentos — e considere revisar seu caso com um profissional antes.",
  },
  "interview was rescheduled": {
    titulo: "Entrevista reagendada",
    explicacao: "Nova data a caminho pelo correio.",
  },
  "interview was completed and my case must be reviewed": {
    titulo: "Entrevista concluída — caso em revisão",
    explicacao: "A entrevista foi feita e o oficial ainda vai finalizar a análise. Nenhuma ação necessária.",
  },
  "case is ready to be scheduled for an interview": {
    titulo: "Pronto para agendar entrevista",
    explicacao: "Seu caso entrou na fila de agendamento do escritório local. A carta vem pelo correio.",
  },
  "new card is being produced": {
    titulo: "Cartão em produção 🎉",
    explicacao: "Aprovado! Seu cartão (Green Card ou EAD) está sendo impresso.",
  },
  "card was mailed to me": {
    titulo: "Cartão enviado pelo correio",
    explicacao: "Acompanhe pelo rastreio do USPS. Se não chegar em ~15 dias, abra um chamado no USCIS.",
  },
  "card was picked up by the united states postal service": {
    titulo: "Cartão com o correio (USPS)",
    explicacao: "O USPS coletou seu cartão para entrega. Deve chegar nos próximos dias.",
  },
  "card was delivered to me by the post office": {
    titulo: "Cartão entregue 🎉",
    explicacao: "Confira os dados impressos assim que receber — erros têm processo de correção gratuito se reportados logo.",
  },
  "card was returned to uscis": {
    titulo: "Cartão devolvido ao USCIS",
    explicacao:
      "O correio não conseguiu entregar. Atualize seu endereço no USCIS (formulário AR-11) e peça o reenvio o quanto antes.",
  },
  "case was transferred and a new office has jurisdiction": {
    titulo: "Caso transferido de escritório",
    explicacao:
      "Transferência interna do USCIS para equilibrar filas — não é bom nem mau sinal. O número do recibo continua o mesmo.",
  },
  "case transferred and new office has jurisdiction": {
    titulo: "Caso transferido de escritório",
    explicacao:
      "Transferência interna do USCIS para equilibrar filas — não é bom nem mau sinal. O número do recibo continua o mesmo.",
  },
  "notice was returned to uscis because the post office could not deliver it": {
    titulo: "Carta devolvida — problema no endereço",
    explicacao:
      "Uma notificação sua voltou ao USCIS. Atualize o endereço (AR-11) imediatamente — cartas perdidas podem significar prazos perdidos.",
  },
  "withdrawal acknowledgement notice was sent": {
    titulo: "Desistência registrada",
    explicacao: "O USCIS confirmou a retirada da petição. Taxas não são reembolsadas.",
  },
  "case was rejected because i sent an incorrect fee": {
    titulo: "Pacote rejeitado — taxa incorreta",
    explicacao:
      "Rejeição administrativa, não é negativa de mérito: corrija o valor e protocole de novo. Atenção se houver prazo correndo.",
  },
  "case rejected because the version of the form i sent is no longer accepted": {
    titulo: "Pacote rejeitado — formulário desatualizado",
    explicacao:
      "Baixe a versão atual do formulário no uscis.gov e protocole de novo. Rejeição administrativa, não é negativa de mérito.",
  },
  "case was rejected because it was improperly filed": {
    titulo: "Pacote rejeitado — protocolo incorreto",
    explicacao:
      "Algo no pacote não seguiu as instruções do formulário. Corrija e protocole de novo — não é negativa de mérito.",
  },
  "case was reopened": {
    titulo: "Caso reaberto",
    explicacao: "O USCIS aceitou reabrir o caso (ex.: após um I-290B). A análise recomeça.",
  },
  "appeal was filed": {
    titulo: "Recurso protocolado",
    explicacao: "Seu recurso foi registrado e aguarda análise.",
  },
  "decision notice mailed": {
    titulo: "Decisão enviada pelo correio",
    explicacao:
      "Uma decisão foi tomada — a carta diz qual. Se o status online não deixa claro, a carta é o documento oficial.",
  },
  "premium processing fee will be refunded": {
    titulo: "Taxa de premium processing será reembolsada",
    explicacao: "O USCIS estourou o prazo do premium e vai devolver a taxa. O caso continua normalmente.",
  },
  "expedite request received": {
    titulo: "Pedido de urgência recebido",
    explicacao: "Seu pedido de expedite está sendo avaliado. A aprovação de urgência é discricionária.",
  },
  "employment authorization document was produced": {
    titulo: "Autorização de trabalho (EAD) produzida 🎉",
    explicacao: "Seu cartão de trabalho foi impresso e será enviado pelo correio.",
  },
  "advance parole document was produced": {
    titulo: "Advance Parole produzido",
    explicacao:
      "Seu documento de viagem foi impresso. Lembre: viajar sem ele durante um ajuste de status pode abandonar o processo.",
  },
  "advance parole document was mailed": {
    titulo: "Advance Parole enviado pelo correio",
    explicacao: "Acompanhe a entrega. Não viaje antes de tê-lo em mãos.",
  },
  "date of birth was updated": {
    titulo: "Data de nascimento corrigida",
    explicacao: "Atualização cadastral concluída. Confira se os dados ficaram corretos.",
  },
  "name was updated": {
    titulo: "Nome corrigido",
    explicacao: "Atualização cadastral concluída. Confira se os dados ficaram corretos.",
  },
  "duplicate notice was sent": {
    titulo: "Segunda via de notificação enviada",
    explicacao: "A cópia solicitada está a caminho pelo correio.",
  },
};

// Fallback categories when the exact status isn't in the dictionary.
// Order matters — first match wins.
const CATEGORIAS: { test: RegExp; titulo: string; explicacao: string }[] = [
  {
    test: /denied|termination|terminated|revoked/i,
    titulo: "Decisão desfavorável",
    explicacao:
      "O status indica uma decisão negativa. A carta do USCIS explica os motivos — veja suas saídas no painel e converse com um profissional antes de agir.",
  },
  {
    test: /approved|approval|was granted|new card|card was|document was produced|document was mailed/i,
    titulo: "Boa notícia no caso",
    explicacao: "O status indica aprovação ou documento a caminho. A notificação oficial chega pelo correio.",
  },
  {
    test: /rejected/i,
    titulo: "Pacote rejeitado (administrativo)",
    explicacao:
      "Rejeição administrativa — normalmente taxa ou formulário incorreto. Corrija e protocole de novo; não é negativa de mérito.",
  },
  {
    test: /evidence|noid|intent to deny/i,
    titulo: "USCIS pediu algo de você",
    explicacao: "Há uma solicitação com prazo. Leia a carta com atenção — perder a data pode custar o caso.",
  },
  {
    test: /interview/i,
    titulo: "Movimento na entrevista",
    explicacao: "Novidade sobre a sua entrevista — confira a carta do USCIS com data e local.",
  },
  {
    test: /biometric|fingerprint/i,
    titulo: "Movimento na biometria",
    explicacao: "Novidade sobre a coleta de digitais — confira a carta com data e local.",
  },
  {
    test: /transferred|jurisdiction/i,
    titulo: "Caso movido internamente",
    explicacao: "Transferência interna do USCIS — não é bom nem mau sinal. O recibo continua o mesmo.",
  },
  {
    test: /received|receipt/i,
    titulo: "Recebido pelo USCIS",
    explicacao: "O USCIS confirmou o recebimento. Nenhuma ação necessária agora.",
  },
];

function normalizeKey(status: string): string {
  return status
    .toLowerCase()
    .replace(/[’'".,!?()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function traduzirStatus(original: string): StatusTraduzido {
  const key = normalizeKey(original);

  const exato = TRADUCOES[key];
  if (exato) return { ...exato, original, exato: true };

  for (const cat of CATEGORIAS) {
    if (cat.test.test(original)) {
      return { titulo: cat.titulo, explicacao: cat.explicacao, original, exato: false };
    }
  }

  return {
    titulo: original, // never hide the source of truth
    explicacao:
      "Status ainda sem tradução no Immigrei. O texto original do USCIS está acima — e vamos adicioná-lo em breve.",
    original,
    exato: false,
  };
}
