/**
 * O painel estratégico deve respeitar a semântica do visa_type salvo pelo
 * onboarding: "green_card" = já É residente (jornadas I-130/N-400/I-90 por
 * objetivo), "eb2niw" = está BUSCANDO o green card por mérito, "citizen" =
 * cidadão. Regressão do caso real: residente que quer peticionar familiar
 * recebia a jornada EB-2 NIW.
 */
import { describe, expect, it } from "vitest";
import { getStrategy } from "./page";

function profile(over: Partial<Parameters<typeof getStrategy>[0]>) {
  return {
    full_name: "Cinthia Monti",
    visa_type: null,
    location: "eua" as const,
    main_goal: null,
    arrival_date: null,
    ...over,
  };
}

describe("getStrategy — residente permanente (visa_type green_card)", () => {
  it("trazer_familia → petição I-130 F2A, nunca EB-2 NIW", () => {
    const s = getStrategy(profile({ visa_type: "green_card", main_goal: "trazer_familia" }));
    expect(s.subtitulo).toContain("I-130");
    expect(s.subtitulo).toContain("F2A");
    expect(JSON.stringify(s)).not.toContain("NIW");
  });

  it("cidadania → N-400", () => {
    const s = getStrategy(profile({ visa_type: "green_card", main_goal: "cidadania" }));
    expect(s.subtitulo).toContain("N-400");
  });

  it("renovar_visto → I-90 com alerta do condicional I-751", () => {
    const s = getStrategy(profile({ visa_type: "green_card", main_goal: "renovar_visto" }));
    expect(s.subtitulo).toContain("I-90");
    expect(s.destaque?.texto).toContain("I-751");
  });

  it("objetivo genérico → visão geral do residente, sem NIW", () => {
    const s = getStrategy(profile({ visa_type: "green_card", main_goal: "outro" }));
    expect(s.subtitulo).toContain("Residente permanente");
    expect(JSON.stringify(s)).not.toContain("NIW");
  });
});

describe("getStrategy — cidadão americano (visa_type citizen)", () => {
  it("trazer_familia → petição de familiar", () => {
    const s = getStrategy(profile({ visa_type: "citizen", main_goal: "trazer_familia" }));
    expect(s.subtitulo).toContain("Petição de familiar");
    expect(JSON.stringify(s.etapas)).toContain("I-130");
  });

  it("entender_direitos → direitos básicos", () => {
    const s = getStrategy(profile({ visa_type: "citizen", main_goal: "entender_direitos" }));
    expect(s.subtitulo).toContain("direitos");
  });
});

describe("getStrategy — buscando o green card (visa_type eb2niw)", () => {
  it("eb2niw → jornada EB-2 NIW, não o fallback genérico", () => {
    const s = getStrategy(profile({ visa_type: "eb2niw", main_goal: "green_card" }));
    expect(s.subtitulo).toContain("EB-2 NIW");
    expect(s.kitId).toBe("eb2niw");
  });
});

describe("getStrategy — CTA", () => {
  it("jornadas sem kit apontam o CTA para rota interna via ctaHref", () => {
    const s = getStrategy(profile({ visa_type: "green_card", main_goal: "trazer_familia" }));
    expect(s.kitId).toBe("");
    expect(s.ctaHref).toBe("/dashboard");
  });
});
