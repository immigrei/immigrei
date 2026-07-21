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
  deriveDestination,
  deriveFocusIds,
  deriveMainGoal,
  questionMap,
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

  // Overstay pergunta os vínculos familiares e personaliza a saída — caso
  // real do fundador: casou e protocolou I-130 + I-485 por dentro.
  describe("overstay com vínculo familiar mostra o caminho por dentro", () => {
    const overstay = (ties: string): Answers => ({
      q_location: "in_us", q_current_status: "overstay", q_family_ties: ties,
    });

    it("cônjuge de cidadão → ajuste I-130 + I-485 sem 'se aplicável'", () => {
      const r = recs(overstay("spouse_citizen"));
      const card = r.find((x) => x.forms.includes("I-130 + I-485"));
      expect(card).toBeDefined();
      expect(card!.visa).not.toContain("se aplicável");
      expect(card!.description).toContain("245(a)");
      // Mesmo com overstay, cônjuge/noivo(a) de cidadão se identifica entre
      // K-1 e IR-1 (mesmo chooser de quem não overstayou) — os dois kits já
      // trazem o guardrail de overstay/245(a).
      expect(deriveDestination(overstay("spouse_citizen"), r)).toEqual({ kind: "family-choice" });
    });

    it("pais/filhos de cidadão → mesmo caminho por dentro", () => {
      const r = recs(overstay("parent_child_citizen"));
      expect(r.some((x) => x.forms.includes("I-130 + I-485") && !x.visa.includes("se aplicável"))).toBe(true);
      expect(deriveDestination(overstay("parent_child_citizen"), r)).toEqual({
        kind: "documentos",
        vistoId: "familia-ir",
      });
    });

    it("parente com green card → F2A com fila e alerta de saída", () => {
      const r = recs(overstay("family_gc"));
      const card = r.find((x) => x.forms.includes("F2A"));
      expect(card).toBeDefined();
      expect(card!.description).toContain("Não saia dos EUA");
      // Kit bifurcado (não o kit padrão de family-gc, que assume status
      // válido) — explica os dois cenários possíveis com overstay.
      expect(deriveDestination(overstay("family_gc"), r)).toEqual({
        kind: "documentos",
        vistoId: "family-gc-overstay",
      });
    });

    it("sem vínculos → mantém orientação genérica com saídas", () => {
      const r = recs(overstay("none"));
      expect(r.length).toBeGreaterThan(0);
      expect(r.some((x) => x.visa.includes("se aplicável"))).toBe(true);
      // Sem vínculo qualificado, o destino é o mapa de portas estreitas
      // (waiver/cancelamento/VAWA/U-visa/T-visa), não mais o "Em breve"
      // genérico de /profissionais.
      expect(deriveDestination(overstay("none"), r)).toEqual({
        kind: "documentos",
        vistoId: "overstay-sem-vinculo",
      });
    });

    it("overstay + vínculo familiar → main_goal regularizar_status, não trazer_familia", () => {
      expect(deriveMainGoal(overstay("spouse_citizen"))).toBe("regularizar_status");
    });
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
  it("green card pedindo Reentry Permit → reentry_permit (antes caía em 'outro')", () => {
    expect(deriveMainGoal(gc("reentry"))).toBe("reentry_permit");
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

  it("parente imediato de cidadão → exceção I-130+I-485, kit familia-ir (guardrail de 90 dias já embutido)", () => {
    const r = recs(esta("family_citizen"));
    expect(r.some((x) => x.forms.includes("I-130") && x.forms.includes("I-485"))).toBe(true);
    for (const x of r) expect(x.href ?? "").not.toMatch(/^\/documentos/);
    expect(deriveDestination(esta("family_citizen"), r)).toEqual({
      kind: "documentos",
      vistoId: "familia-ir",
    });
  });

  it("só visitando → orientação de uso do ESTA, sem jornada de visto", () => {
    const r = recs(esta("plan_return"));
    expect(r.some((x) => x.visa.includes("ESTA do jeito certo"))).toBe(true);
  });
});

// Beneficiários de petição familiar não escolhem visto na vitrine — a
// jornada deles é a petição que o parente protocola. Parente imediato de
// cidadão (IR-1/IR-2, sem fila) tem kit próprio dentro do app; cônjuge/
// noivo(a) escolhe entre K-1 e IR-1 (mesmo card do painel); parente com
// Green Card (F2A/F2B, com fila) tem kit próprio também — nenhum dos três
// passa mais pela ajuda profissional genérica.
describe("perfis familiares saem da vitrine para o destino certo", () => {
  it("reunir com família + pais/filhos cidadãos (IR-1/IR-2) → kit familia-ir", () => {
    const answers: Answers = { q_location: "outside", q_goal: "family", q_family_ties: "parent_child_citizen" };
    const r = recs(answers);
    expect(r.length).toBeGreaterThan(0);
    expect(deriveDestination(answers, r)).toEqual({ kind: "documentos", vistoId: "familia-ir" });
  });

  it("reunir com família + cônjuge/noivo(a) cidadão → escolha K-1 vs IR-1", () => {
    const answers: Answers = { q_location: "outside", q_goal: "family", q_family_ties: "spouse_citizen" };
    const r = recs(answers);
    expect(r.length).toBeGreaterThan(0);
    expect(deriveDestination(answers, r)).toEqual({ kind: "family-choice" });
  });

  it("morar permanentemente + parente com green card (F2A/F2B) → kit family-gc", () => {
    const answers: Answers = { q_location: "outside", q_goal: "live", q_family_ties: "family_gc" };
    const r = recs(answers);
    expect(r.length).toBeGreaterThan(0);
    expect(deriveDestination(answers, r)).toEqual({ kind: "documentos", vistoId: "family-gc" });
  });

  it("permanente via asilo → kit asylee, sem vitrine", () => {
    const answers: Answers = { q_location: "outside", q_goal: "live", q_family_ties: "none", q_permanent_path: "asylum" };
    const r = recs(answers);
    expect(r.length).toBeGreaterThan(0);
    expect(deriveDestination(answers, r)).toEqual({ kind: "documentos", vistoId: "asylee" });
  });

  it("permanente via investimento (EB-5) → vitrine com foco em eb5", () => {
    const answers: Answers = { q_location: "outside", q_goal: "live", q_family_ties: "none", q_permanent_path: "invest" };
    const r = recs(answers);
    expect(r.length).toBeGreaterThan(0);
    const destino = deriveDestination(answers, r);
    expect(destino.kind).toBe("vistos");
    if (destino.kind === "vistos") {
      expect(new URLSearchParams(destino.query).get("focus")).toContain("eb5");
    }
  });

  it("permanente via DV Lottery → kit dv-lottery, sem vitrine", () => {
    const answers: Answers = { q_location: "outside", q_goal: "live", q_family_ties: "none", q_permanent_path: "lottery" };
    const r = recs(answers);
    expect(r.length).toBeGreaterThan(0);
    expect(deriveDestination(answers, r)).toEqual({ kind: "documentos", vistoId: "dv-lottery" });
  });

  it("extensão de dependente (F-2/H-4/L-2/J-2) → kit dependente-cos", () => {
    const answers: Answers = {
      q_location: "in_us", q_current_status: "in_status",
      q_current_visa: "dependent", q_change_goal: "extend",
    };
    const r = recs(answers);
    expect(r.length).toBeGreaterThan(0);
    expect(deriveDestination(answers, r)).toEqual({ kind: "documentos", vistoId: "dependente-cos" });
  });

  it("mudança de status sem destino escolhido → vitrine completa (sem filtro), não /profissionais", () => {
    const answers: Answers = {
      q_location: "in_us", q_current_status: "in_status",
      q_current_visa: "b1b2", q_change_goal: "change_status", q_target_visa: "other",
    };
    const r = recs(answers);
    expect(r.length).toBeGreaterThan(0);
    const destino = deriveDestination(answers, r);
    expect(destino.kind).toBe("vistos");
    if (destino.kind === "vistos") {
      expect(new URLSearchParams(destino.query).get("focus")).toBeNull();
    }
  });
});

// Prova exaustiva: caminha TODOS os percursos possíveis do grafo de
// perguntas e garante que cada perfil completo termina em um destino
// definido — e que a vitrine só recebe quem tem card para destacar.
// Se uma pergunta/resposta nova criar um perfil órfão, este teste quebra.
describe("todo perfil do onboarding tem um destino", () => {
  function walk(questionId: string, answers: Answers, profiles: Answers[]) {
    const q = questionMap[questionId];
    expect(q, `pergunta "${questionId}" não existe no questionMap`).toBeDefined();
    for (const opt of q.options) {
      const next = { ...answers, [q.id]: opt.value };
      const nextId = typeof q.next === "string" ? q.next : q.next(opt.value, next);
      if (nextId === "results") profiles.push(next);
      else walk(nextId, next, profiles);
    }
  }

  const profiles: Answers[] = [];
  walk("q_location", {}, profiles);

  it("o grafo gera uma quantidade razoável de perfis completos", () => {
    expect(profiles.length).toBeGreaterThan(20);
  });

  it.each(profiles.map((p) => [JSON.stringify(p), p] as const))(
    "%s",
    (_label, answers) => {
      const r = recs(answers);
      // Luz no fim do túnel: nenhum perfil termina sem pelo menos uma
      // recomendação acionável (não bloqueada) na tela de resultados.
      expect(r.length, "perfil sem nenhuma recomendação").toBeGreaterThan(0);
      expect(
        r.some((x) => !x.blocked),
        "perfil só com recomendações bloqueadas"
      ).toBe(true);

      const destino = deriveDestination(answers, r);
      if (destino.kind === "vistos") {
        // Mudança de status sem destino escolhido é a única exceção: o
        // próprio card de resultado promete "compare os vistos disponíveis"
        // — vitrine completa, sem filtro de foco, de propósito.
        const isChangeStatusSemDestino =
          answers.q_change_goal === "change_status" && answers.q_target_visa === "other";
        if (isChangeStatusSemDestino) {
          expect(new URLSearchParams(destino.query).get("focus")).toBeNull();
        } else {
          // Chegou à vitrine → precisa ter pelo menos um card em destaque.
          const focus = new URLSearchParams(destino.query).get("focus");
          expect(focus, "perfil chegou à vitrine sem nenhum card para destacar").toBeTruthy();
        }
      } else {
        expect(["i94", "dashboard", "profissionais", "documentos", "family-choice"]).toContain(destino.kind);
      }
    }
  );
});

// Ponte L-1A → EB-1C: quem está de L-1 buscando green card recebe o manual.
describe("manual da ponte L-1A → EB-1C", () => {
  it("L-1 nos EUA + objetivo green card → /caminhos/l1-para-eb1c", () => {
    expect(hrefs({
      q_location: "in_us", q_current_status: "in_status",
      q_current_visa: "l1", q_change_goal: "green_card", q_gc_path: "employer",
    })).toContain("/caminhos/l1-para-eb1c");
  });
});
