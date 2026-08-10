// Blindagem UPL (mesma disciplina de lib/rules/messages.upl-guard.test.ts e
// lib/forms/upl-guard.test.ts): nenhuma string narrativa deste arquivo pode
// conter verbo de conselho/estratégia. Como o conteúdo aqui é montado por
// funções condicionais (não um dicionário estático), o guard lê o código-fonte
// bruto e extrai as strings literais diretamente, em vez de executar as
// funções para cada combinação possível de input.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ADVICE_TERMS = [
  "recomend",
  "aconselh",
  "suger",
  "sugir",
  "deveria",
  "devia",
  "melhor opç",
  "melhor caminho",
  "suas chances",
  "probabilidade de aprova",
  "vale a pena",
];

// Termos oficiais do processo USCIS/SEVIS que legitimamente contêm "recomend"
// sem ser a Immigrei recomendando algo (ex: "carta de recomendação" é um tipo
// de documento; "recomendação de OPT" é o DSO anotando o I-20, não a Immigrei
// aconselhando). Só entram aqui frases confirmadas manualmente como seguras.
const ALLOWLIST_PHRASES = [
  "carta de recomendação",
  "cartas de recomendação",
  "recomendação de opt",
  "recomendação do dso",
];

// Recomendar que o usuário procure um ADVOGADO é o padrão seguro por
// definição — afasta a decisão de volta para um profissional licenciado, o
// oposto de UPL. O que continua proibido é recomendar uma ESTRATÉGIA,
// CAMINHO ou RESULTADO. Por isso "recomend"/"aconselh" só disparam o guard
// quando a string NÃO é, ao mesmo tempo, uma indicação de buscar advogado.
const LAWYER_REFERRAL_MARKERS = ["advogado", "profissional licenciado", "attorney"];

// Strings narrativas (>= 20 caracteres) — abaixo disso são labels/ids/ícones,
// não texto de conteúdo.
const MIN_NARRATIVE_LENGTH = 20;

function extractNarrativeStrings(source: string): string[] {
  const matches: string[] = [];
  const stringLiteral = /"((?:[^"\\]|\\.)*)"/g;
  let m: RegExpExecArray | null;
  while ((m = stringLiteral.exec(source)) !== null) {
    const value = m[1];
    if (value.length >= MIN_NARRATIVE_LENGTH) matches.push(value);
  }
  return matches;
}

describe.each([
  "lib/strategies.ts",
  "lib/strategy.ts",
  "app/documentos/[vistoId]/data.ts",
])("blindagem UPL — %s", (relPath) => {
  const source = readFileSync(join(process.cwd(), relPath), "utf-8");
  const narrativeStrings = extractNarrativeStrings(source);

  it("encontrou strings narrativas para verificar (o arquivo não está vazio)", () => {
    expect(narrativeStrings.length).toBeGreaterThan(0);
  });

  for (const [i, text] of narrativeStrings.entries()) {
    const lower = text.toLowerCase();
    if (ALLOWLIST_PHRASES.some((phrase) => lower.includes(phrase))) continue;
    const isLawyerReferral = LAWYER_REFERRAL_MARKERS.some((m) => lower.includes(m));
    for (const term of ADVICE_TERMS) {
      if (!lower.includes(term.toLowerCase())) continue;
      if (isLawyerReferral && (term === "recomend" || term === "aconselh")) continue;
      it(`string #${i} não contém o termo de conselho "${term}": "${text.slice(0, 60)}..."`, () => {
        expect(lower).not.toContain(term.toLowerCase());
      });
    }
  }
});
