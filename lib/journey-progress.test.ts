import { describe, expect, it } from "vitest";
import { applyProgress, isEtapaDone, type ProgressSignals } from "./journey-progress";

const noSignals: ProgressSignals = { hasSchool: false, satisfeitos: new Set() };

function signals(itens: string[] = [], hasSchool = false): ProgressSignals {
  return { hasSchool, satisfeitos: new Set(itens) };
}

describe("isEtapaDone", () => {
  it("nunca completa etapa sem doneWhen", () => {
    expect(isEtapaDone(undefined, signals(["i20-cos"], true))).toBe(false);
  });

  it("doneWhen vazio não completa nada", () => {
    expect(isEtapaDone({}, signals(["i20-cos"], true))).toBe(false);
    expect(isEtapaDone({ itens: [] }, signals(["i20-cos"], true))).toBe(false);
  });

  it("school exige chosen_school no perfil", () => {
    expect(isEtapaDone({ school: true }, noSignals)).toBe(false);
    expect(isEtapaDone({ school: true }, signals([], true))).toBe(true);
  });

  it("itens exigem todos os ids satisfeitos", () => {
    expect(isEtapaDone({ itens: ["financeiro", "vinculo"] }, signals(["financeiro"]))).toBe(false);
    expect(isEtapaDone({ itens: ["financeiro", "vinculo"] }, signals(["financeiro", "vinculo"]))).toBe(true);
  });

  it("school + itens exigem ambos", () => {
    expect(isEtapaDone({ school: true, itens: ["i20"] }, signals(["i20"], false))).toBe(false);
    expect(isEtapaDone({ school: true, itens: ["i20"] }, signals(["i20"], true))).toBe(true);
  });

  it("algum: qualquer categoria de evidência satisfeita basta", () => {
    const doneWhen = { algum: ["premios", "midia", "salario"] };
    expect(isEtapaDone(doneWhen, noSignals)).toBe(false);
    expect(isEtapaDone(doneWhen, signals(["midia"]))).toBe(true);
  });
});

describe("applyProgress", () => {
  const jornada = [
    { num: "1", estado: "agora" as const,   doneWhen: { itens: ["status-valido"] } },
    { num: "2", estado: "proximo" as const, doneWhen: { school: true } },
    { num: "3", estado: "proximo" as const, doneWhen: { itens: ["i20-cos"] } },
    { num: "4", estado: "futuro" as const },
  ];

  it("sem dados do usuário, nada fica verde", () => {
    const out = applyProgress(jornada, noSignals);
    expect(out.map((e) => e.estado)).toEqual(["agora", "proximo", "proximo", "futuro"]);
  });

  it("só a escola escolhida: etapa 2 feita, 'agora' continua na 1", () => {
    const out = applyProgress(jornada, signals([], true));
    expect(out.map((e) => e.estado)).toEqual(["agora", "feito", "proximo", "futuro"]);
  });

  it("etapa 1 feita move o 'agora' para a próxima pendente", () => {
    const out = applyProgress(jornada, signals(["status-valido"], true));
    expect(out.map((e) => e.estado)).toEqual(["feito", "feito", "agora", "futuro"]);
  });

  it("anexo do I-20 completa a etapa 3", () => {
    const out = applyProgress(jornada, signals(["status-valido", "i20-cos"], true));
    expect(out.map((e) => e.estado)).toEqual(["feito", "feito", "feito", "agora"]);
  });

  it("jornada de opções paralelas (sem doneWhen) fica intocada", () => {
    const opcoes = [
      { num: "A", estado: "agora" as const },
      { num: "B", estado: "agora" as const },
      { num: "C", estado: "agora" as const },
    ];
    const out = applyProgress(opcoes, signals(["qualquer-coisa"], true));
    expect(out.map((e) => e.estado)).toEqual(["agora", "agora", "agora"]);
  });

  it("alerta nunca recebe o ponteiro 'agora'", () => {
    const out = applyProgress(
      [
        { estado: "alerta" as const },
        { estado: "proximo" as const, doneWhen: { itens: ["x"] } },
      ],
      noSignals
    );
    expect(out.map((e) => e.estado)).toEqual(["alerta", "agora"]);
  });
});
