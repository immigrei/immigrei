// Blindagem UPL automatizada (RFC-001, seção 3.1): nenhuma string de UI pode
// conter verbos de conselho/estratégia. Este teste falha o merge se alguém
// adicionar uma mensagem com esses termos a lib/rules/messages.pt.ts.
import { describe, expect, it } from 'vitest';
import { MESSAGES_PT } from './messages.pt';

const ADVICE_TERMS = [
  'recomend',
  'aconselh',
  'suger',
  'sugir',
  'deveria',
  'devia',
  'melhor',
  'espere',
  'espera até',
  'aguarde',
  'aguardar',
  'suas chances',
  'probabilidade de aprova',
];

describe('blindagem UPL — messages.pt.ts', () => {
  for (const [key, message] of Object.entries(MESSAGES_PT)) {
    for (const term of ADVICE_TERMS) {
      it(`"${key}" não contém o termo de conselho "${term}"`, () => {
        expect(message.toLowerCase()).not.toContain(term.toLowerCase());
      });
    }
  }
});
