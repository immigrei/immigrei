/**
 * O painel estratégico deve respeitar a semântica do visa_type salvo pelo
 * onboarding: "green_card" = já É residente (jornadas I-130/N-400/I-90 por
 * objetivo), "eb2niw" = está BUSCANDO o green card por mérito, "citizen" =
 * cidadão. Regressão do caso real: residente que quer peticionar familiar
 * recebia a jornada EB-2 NIW.
 */
import { describe, expect, it } from "vitest";
import { getFamilyTiesCard, getStrategy } from "@/lib/strategy";

// Formata em YYYY-MM-DD usando componentes locais — evita o desvio de fuso
// horário do toISOString() (que converte para UTC e pode voltar/adiantar um dia).
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

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

// Regressão: nenhum visa_type salvo pelo onboarding pode cair no fallback
// genérico "Complete seu perfil" — cada um precisa de uma jornada própria.
describe("getStrategy — visa_types sem branch dedicado caíam no fallback genérico", () => {
  it("b1/b1b2 nos EUA → jornada de prazo do I-94, não o fallback", () => {
    const s = getStrategy(profile({ visa_type: "b1", location: "eua", main_goal: "renovar_visto" }));
    expect(s.situacao).not.toContain("Complete seu perfil");
    expect(s.situacao).toContain("I-94");
  });

  it("b1/b1b2 no Brasil → kit consular b1", () => {
    const s = getStrategy(profile({ visa_type: "b1b2", location: "brasil" }));
    expect(s.kitId).toBe("b1");
    expect(s.situacao).not.toContain("Complete seu perfil");
  });

  it("j1 no Brasil → kit consular j1", () => {
    const s = getStrategy(profile({ visa_type: "j1", location: "brasil" }));
    expect(s.kitId).toBe("j1");
  });

  it("j1 nos EUA → jornada da regra dos 2 anos, kit de extensão real (não CTA vazio)", () => {
    const s = getStrategy(profile({ visa_type: "j1", location: "eua" }));
    expect(s.situacao).toContain("212(e)");
    expect(s.kitId).toBe("j1-extensao");
  });

  it("m1 nos EUA → mudança de status (kit m1-cos), não o fallback genérico", () => {
    const s = getStrategy(profile({ visa_type: "m1", location: "eua" }));
    expect(s.kitId).toBe("m1-cos");
    expect(s.situacao).not.toContain("Complete seu perfil");
  });

  it("l1 no Brasil → kit consular l1 (DS-160 + entrevista)", () => {
    const s = getStrategy(profile({ visa_type: "l1", location: "brasil" }));
    expect(s.kitId).toBe("l1");
  });

  it("l1 nos EUA → kit l1-cos (Change of Status, nenhum item exige DS-160)", () => {
    const s = getStrategy(profile({ visa_type: "l1", location: "eua" }));
    expect(s.kitId).toBe("l1-cos");
    const itensExigidos = s.etapas.flatMap((e) => e.doneWhen?.itens ?? []);
    expect(itensExigidos).not.toContain("ds160");
  });

  it("e2 via consulado (fora dos EUA) → kit e2", () => {
    const s = getStrategy(profile({ visa_type: "e2", location: "brasil" }));
    expect(s.kitId).toBe("e2");
  });

  it("e2 nos EUA → mudança de status por I-129, sem DS-160 e sem kit ainda", () => {
    const s = getStrategy(profile({ visa_type: "e2", location: "eua" }));
    expect(s.kitId).toBe("");
    expect(s.ctaHref).toBe("/profissionais");
    expect(JSON.stringify(s.etapas)).not.toContain("DS-160 + DS-156E");
  });

  it("e1 fora dos EUA → jornada consular dedicada, sem kit", () => {
    const s = getStrategy(profile({ visa_type: "e1", location: "brasil" }));
    expect(s.situacao).not.toContain("Complete seu perfil");
    expect(s.ctaHref).toBe("/profissionais");
  });

  it("e1 nos EUA → mudança de status por I-129, sem DS-160", () => {
    const s = getStrategy(profile({ visa_type: "e1", location: "eua" }));
    expect(s.ctaHref).toBe("/profissionais");
    expect(JSON.stringify(s.etapas)).not.toContain("DS-160 + DS-156E");
  });

  it("asylee → jornada de asilo com alerta de prazo", () => {
    const s = getStrategy(profile({ visa_type: "asylee" }));
    expect(s.destaque?.texto).toContain("I-589");
  });

  it("outro → jornada de situação em definição, não o fallback genérico", () => {
    const s = getStrategy(profile({ visa_type: "outro" }));
    expect(s.situacao).not.toContain("Complete seu perfil");
  });

  it("visa_type null → mantém o fallback genérico (perfil de fato incompleto)", () => {
    const s = getStrategy(profile({ visa_type: null }));
    expect(s.situacao).toContain("Complete seu perfil");
  });
});

describe("getStrategy — B-1/B-2 usa o prazo real do I-94 quando cadastrado", () => {
  it("sem i94_expiry_date → alerta genérico pedindo para cadastrar", () => {
    const s = getStrategy(profile({ visa_type: "b1", location: "eua" }));
    expect(s.destaque?.tipo).toBe("alerta");
    expect(s.destaque?.texto).toContain("cadastre no seu perfil");
    expect(s.etapas[0].estado).toBe("agora");
  });

  it("i94_expiry_date no passado → alerta de presença irregular, etapa 1 marcada feito", () => {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const s = getStrategy(profile({
      visa_type: "b1b2",
      location: "eua",
      i94_expiry_date: toLocalDateStr(ontem),
    }));
    expect(s.destaque?.texto).toContain("venceu");
    expect(s.destaque?.texto).toContain("presença irregular");
    expect(s.etapas[0].estado).toBe("feito");
  });

  it("i94_expiry_date confortavelmente no futuro → destaque 'ok'", () => {
    const futuro = new Date();
    futuro.setDate(futuro.getDate() + 90);
    const s = getStrategy(profile({
      visa_type: "b1",
      location: "eua",
      i94_expiry_date: toLocalDateStr(futuro),
    }));
    expect(s.destaque?.tipo).toBe("ok");
  });
});

describe("getFamilyTiesCard — porta de Green Card por vínculo familiar", () => {
  it("spouse_citizen → card de cônjuge/noivo de cidadão", () => {
    const card = getFamilyTiesCard("spouse_citizen");
    expect(card?.titulo).toContain("cônjuge ou noivo");
  });

  it("parent_child_citizen → card de filho/pai de cidadão", () => {
    const card = getFamilyTiesCard("parent_child_citizen");
    expect(card?.titulo).toContain("filho ou pai/mãe");
  });

  it("family_gc → card de familiar com Green Card", () => {
    const card = getFamilyTiesCard("family_gc");
    expect(card?.titulo).toContain("Green Card");
  });

  it("none → sem card (sem vínculo)", () => {
    expect(getFamilyTiesCard("none")).toBeNull();
  });

  it("null/undefined → sem card (pergunta nunca respondida)", () => {
    expect(getFamilyTiesCard(null)).toBeNull();
    expect(getFamilyTiesCard(undefined)).toBeNull();
  });
});
