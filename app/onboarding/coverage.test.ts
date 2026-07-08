/**
 * Prova de cobertura do onboarding: toda superfície do produto (kits,
 * manuais, motor de casos) deve ser alcançável por pelo menos uma
 * combinação de respostas. Se um visto/manual novo entrar no catálogo e
 * ficar órfão no onboarding — ou um caminho apontar para rota inexistente —
 * este teste quebra o merge.
 */
import { describe, expect, it } from "vitest";
import {
  attachKitLinks,
  computeRecommendations,
  deriveFocusIds,
  deriveMainGoal,
} from "./page";

type Answers = Record<string, string>;

function recs(a: Answers) {
  return attachKitLinks(computeRecommendations(a));
}

function hrefs(a: Answers): string[] {
  return recs(a).map((r) => r.href).filter((h): h is string => Boolean(h));
}

// Persona → superfície de produto esperada
const COVERAGE: Array<{ nome: string; answers: Answers; expectHref: string }> = [
  // ── Kits (fora dos EUA) ──
  { nome: "estudante universitário → kit F-1",
    answers: { q_location: "outside", q_goal: "study", q_study_type: "university" },
    expectHref: "/documentos/f1" },
  { nome: "curso técnico → kit M-1",
    answers: { q_location: "outside", q_goal: "study", q_study_type: "vocational" },
    expectHref: "/documentos/m1" },
  { nome: "intercâmbio → kit J-1",
    answers: { q_location: "outside", q_goal: "study", q_study_type: "exchange" },
    expectHref: "/documentos/j1" },
  { nome: "oferta de emprego + graduação → kit H-1B",
    answers: { q_location: "outside", q_goal: "work", q_work_type: "employer_offer", q_education: "bachelor" },
    expectHref: "/documentos/h1b" },
  { nome: "transferência de empresa → kit L-1",
    answers: { q_location: "outside", q_goal: "work", q_work_type: "intracompany" },
    expectHref: "/documentos/l1" },
  { nome: "reconhecido na área → kit O-1",
    answers: { q_location: "outside", q_goal: "work", q_work_type: "extraordinary" },
    expectHref: "/documentos/o1" },
  { nome: "turismo → kit B-1/B-2",
    answers: { q_location: "outside", q_goal: "visit", q_nationality: "brazilian" },
    expectHref: "/documentos/b1" },
  { nome: "investidor de tratado → kit E-2",
    answers: { q_location: "outside", q_goal: "business", q_business_type: "invest_operate", q_nationality: "treaty" },
    expectHref: "/documentos/e2" },

  // ── Motor de casos ──
  { nome: "B1/B2 → F-1 por dentro → motor de validação",
    answers: { q_location: "in_us", q_current_status: "in_status", q_current_visa: "b1b2", q_change_goal: "change_status", q_target_visa: "f1" },
    expectHref: "/casos/cos-b2-f1" },

  // ── Manuais de caminho ──
  { nome: "M-1 → F-1 (vedado por dentro) → manual consular",
    answers: { q_location: "in_us", q_current_status: "in_status", q_current_visa: "m1", q_change_goal: "change_status", q_target_visa: "f1" },
    expectHref: "/caminhos/m1-para-f1-consulado" },
  { nome: "J-1 → F-1 → manual (regra dos 2 anos)",
    answers: { q_location: "in_us", q_current_status: "in_status", q_current_visa: "j1", q_change_goal: "change_status", q_target_visa: "f1" },
    expectHref: "/caminhos/j1-para-f1" },
  { nome: "F-1 → H-1B → manual",
    answers: { q_location: "in_us", q_current_status: "in_status", q_current_visa: "f1", q_change_goal: "change_status", q_target_visa: "h1b" },
    expectHref: "/caminhos/f1-para-h1b" },
  { nome: "H-1B mudando de empregador → manual de transferência",
    answers: { q_location: "in_us", q_current_status: "in_status", q_current_visa: "h1b", q_change_goal: "work_change" },
    expectHref: "/caminhos/h1b-transferencia" },
  { nome: "O-1 rumo ao green card → manual de autopetição",
    answers: { q_location: "in_us", q_current_status: "in_status", q_current_visa: "o1", q_change_goal: "green_card" },
    expectHref: "/caminhos/o1-autopeticao-greencard" },
];

describe("cobertura do onboarding sobre o catálogo do produto", () => {
  it.each(COVERAGE)("$nome", ({ answers, expectHref }) => {
    expect(hrefs(answers)).toContain(expectHref);
  });

  it("M-1 → F-1 por dentro NUNCA oferece I-539 (vedação legal)", () => {
    const r = recs({
      q_location: "in_us", q_current_status: "in_status",
      q_current_visa: "m1", q_change_goal: "change_status", q_target_visa: "f1",
    });
    const i539 = r.find((x) => x.visa.includes("I-539"));
    expect(i539).toBeUndefined();
  });

  it("overstay não recebe href de jornada de visto", () => {
    const r = recs({ q_location: "in_us", q_current_status: "overstay" });
    expect(r.length).toBeGreaterThan(0);
    for (const x of r) expect(x.href ?? "").not.toMatch(/^\/(documentos|caminhos|casos)/);
  });
});

// Green card e cidadão não passam pela vitrine de vistos: o perfil é salvo
// direto com o objetivo derivado das respostas. Estes testes travam o
// mapeamento resposta → main_goal usado pelo dashboard (GOAL_LABELS).
describe("objetivo derivado para quem já tem residência ou cidadania", () => {
  const gc = (goal: string) => ({
    q_location: "in_us", q_current_status: "green_card", q_gc_goal: goal,
  });

  it("green card renovando → renovar_visto", () => {
    expect(deriveMainGoal(gc("renew"))).toBe("renovar_visto");
  });
  it("green card buscando naturalização → cidadania", () => {
    expect(deriveMainGoal(gc("naturalization"))).toBe("cidadania");
  });
  it("green card peticionando família → trazer_familia", () => {
    expect(
      deriveMainGoal({ ...gc("family"), q_family_ties: "family_gc" })
    ).toBe("trazer_familia");
  });
  it("cidadão peticionando família → trazer_familia (não 'cidadania')", () => {
    expect(
      deriveMainGoal({
        q_location: "in_us", q_current_status: "citizen",
        q_citizen_goal: "petition_family", q_family_ties: "spouse_citizen",
      })
    ).toBe("trazer_familia");
  });
  it("cidadão entendendo direitos → entender_direitos (já tem a cidadania)", () => {
    expect(
      deriveMainGoal({
        q_location: "in_us", q_current_status: "citizen",
        q_citizen_goal: "naturalization",
      })
    ).toBe("entender_direitos");
  });
});

// O param `focus` leva os cards recomendados para o topo de /vistos.
// Cada persona deve destacar os caminhos certos — e nunca um visto
// bloqueado pela cidadania.
describe("focus da vitrine derivado por persona", () => {
  const focus = (a: Answers) => deriveFocusIds(a, recs(a));

  it("estudante universitário fora → foca F-1", () => {
    expect(focus({ q_location: "outside", q_goal: "study", q_study_type: "university" }))
      .toEqual(expect.arrayContaining(["f1"]));
  });

  it("H-1B estendendo → foca H-1B", () => {
    expect(focus({
      q_location: "in_us", q_current_status: "in_status",
      q_current_visa: "h1b", q_change_goal: "extend",
    })).toContain("h1b");
  });

  it("B1/B2 mudando para F-1 → foca F-1", () => {
    expect(focus({
      q_location: "in_us", q_current_status: "in_status",
      q_current_visa: "b1b2", q_change_goal: "change_status", q_target_visa: "f1",
    })).toContain("f1");
  });

  it("investidor de tratado → foca E-2", () => {
    expect(focus({
      q_location: "outside", q_goal: "business",
      q_business_type: "invest_operate", q_nationality: "treaty",
    })).toContain("e2");
  });

  it("investidor brasileiro → E-2 bloqueado fora do foco, L-1 dentro", () => {
    const f = focus({
      q_location: "outside", q_goal: "business",
      q_business_type: "invest_operate", q_nationality: "brazilian",
    });
    expect(f).toContain("l1");
    expect(f).not.toContain("e2");
  });

  it("autônomo sem oferta → foca O-1 e EB-2 NIW", () => {
    expect(focus({ q_location: "outside", q_goal: "work", q_work_type: "self" }))
      .toEqual(expect.arrayContaining(["o1", "eb2niw"]));
  });

  it("turista brasileiro → foca B-1/B-2", () => {
    expect(focus({ q_location: "outside", q_goal: "visit", q_nationality: "brazilian" }))
      .toContain("b1");
  });
});

// ESTA/VWP dentro dos EUA: a regra dura aparece sempre; a saída certa
// depende do objetivo — e a exceção de parente imediato nunca vira
// jornada de visto comum.
describe("saídas para quem entrou de ESTA/VWP", () => {
  const esta = (goal?: string): Answers => ({
    q_location: "in_us", q_current_status: "in_status",
    q_current_visa: "esta_vwp", ...(goal ? { q_esta_goal: goal } : {}),
  });

  it("regra dura (sem COS/extensão) aparece em todo objetivo", () => {
    for (const goal of ["study", "work", "invest", "family_citizen", "plan_return"]) {
      expect(recs(esta(goal))[0].visa).toContain("ESTA/VWP");
    }
  });

  it("estudar → rota consular F-1 com kit, foco f1", () => {
    expect(hrefs(esta("study"))).toContain("/documentos/f1");
    expect(deriveFocusIds(esta("study"), recs(esta("study")))).toContain("f1");
  });

  it("trabalhar → O-1, H-1B e L-1 consulares com kits", () => {
    const h = hrefs(esta("work"));
    expect(h).toEqual(expect.arrayContaining([
      "/documentos/o1", "/documentos/h1b", "/documentos/l1",
    ]));
  });

  it("investir → E-2 (kit) e E-1, com foco em ambos — sem bloqueio", () => {
    const r = recs(esta("invest"));
    expect(hrefs(esta("invest"))).toContain("/documentos/e2");
    expect(r.some((x) => x.blocked)).toBe(false);
    expect(deriveFocusIds(esta("invest"), r)).toEqual(
      expect.arrayContaining(["e2", "e1"])
    );
  });

  it("parente imediato de cidadão → exceção I-130+I-485, sem kit de visto", () => {
    const r = recs(esta("family_citizen"));
    expect(r.some((x) => x.forms.includes("I-130") && x.forms.includes("I-485"))).toBe(true);
    for (const x of r) expect(x.href ?? "").not.toMatch(/^\/documentos/);
  });

  it("só visitando → orientação de uso do ESTA, sem jornada de visto", () => {
    const r = recs(esta("plan_return"));
    expect(r.some((x) => x.visa.includes("ESTA do jeito certo"))).toBe(true);
  });
});
