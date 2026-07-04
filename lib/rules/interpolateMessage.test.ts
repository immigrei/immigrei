import { describe, expect, it } from 'vitest';
import { interpolateMessage } from './interpolateMessage';
import { MESSAGES_PT } from './messages.pt';

describe('interpolateMessage', () => {
  it('substitui um único placeholder', () => {
    expect(interpolateMessage('Olá, {nome}!', { nome: 'Maria' })).toBe('Olá, Maria!');
  });

  it('substitui múltiplos placeholders distintos', () => {
    expect(
      interpolateMessage('{saudacao}, {nome}!', { saudacao: 'Oi', nome: 'João' }),
    ).toBe('Oi, João!');
  });

  it('substitui todas as ocorrências do mesmo placeholder', () => {
    expect(interpolateMessage('{x} + {x} = {resultado}', { x: '2', resultado: '4' })).toBe(
      '2 + 2 = 4',
    );
  });

  it('mantém placeholders sem valor correspondente intactos', () => {
    expect(interpolateMessage('{a} e {b}', { a: '1' })).toBe('1 e {b}');
  });

  it('retorna o template inalterado quando não há placeholders', () => {
    expect(interpolateMessage('texto sem chaves', { qualquer: 'valor' })).toBe(
      'texto sem chaves',
    );
  });

  it('retorna o template inalterado quando values está vazio', () => {
    expect(interpolateMessage('{a}{b}', {})).toBe('{a}{b}');
  });

  it('interpola block.i94_expired com {i94_date}', () => {
    const result = interpolateMessage(MESSAGES_PT['block.i94_expired'], {
      i94_date: '03/07/2026',
    });
    expect(result).toContain('03/07/2026');
    expect(result).not.toContain('{i94_date}');
  });

  it('interpola disclosure.dos_90_day com {days} e {official_text_pt}', () => {
    const result = interpolateMessage(MESSAGES_PT['disclosure.dos_90_day'], {
      days: '30',
      official_text_pt: 'texto traduzido de exemplo',
    });
    expect(result).toContain('há 30 dias');
    expect(result).toContain('texto traduzido de exemplo');
    expect(result).not.toContain('{days}');
    expect(result).not.toContain('{official_text_pt}');
  });

  it('mensagens sem placeholders (ex.: block.i20_missing) permanecem inalteradas', () => {
    const template = MESSAGES_PT['block.i20_missing'];
    expect(interpolateMessage(template, {})).toBe(template);
  });
});
