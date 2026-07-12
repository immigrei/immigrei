/**
 * Todo doneWhen do painel referencia ids de itens do kit da própria jornada
 * (s.kitId) — é o que liga o checklist/cofre à timeline. Um id inexistente
 * nunca fica verde e a etapa trava em silêncio; este teste pega o typo.
 */
import { describe, expect, it } from "vitest";
import { getStrategy } from "./page";
import checklists from "@/app/documentos/[vistoId]/data";

type Profile = Parameters<typeof getStrategy>[0];

function profile(over: Partial<Profile>): Profile {
  return {
    full_name: "Teste",
    visa_type: null,
    location: "eua",
    main_goal: null,
    arrival_date: null,
    ...over,
  };
}

// Combinações que geram jornadas com kit próprio.
const combos: Array<Partial<Profile>> = [
  { visa_type: "f1", location: "brasil" },
  { visa_type: "f1", location: "eua" },
  { visa_type: "f1", location: "brasil", main_goal: "renovar_visto" },
  { visa_type: "m1", location: "brasil" },
  { visa_type: "h1b", location: "brasil" },
  { visa_type: "h1b", location: "eua" },
  { visa_type: "o1", location: "brasil" },
  { visa_type: "o1", location: "eua" },
  { visa_type: "eb2niw", location: "brasil" },
  { visa_type: "eb2niw", location: "eua" },
];

describe("doneWhen ↔ kit consistency", () => {
  for (const combo of combos) {
    const label = `${combo.visa_type} / ${combo.location}${combo.main_goal ? ` / ${combo.main_goal}` : ""}`;
    it(`${label}: todos os ids do doneWhen existem no kit`, () => {
      const s = getStrategy(profile(combo));
      const referenced = s.etapas.flatMap((e) => [
        ...(e.doneWhen?.itens ?? []),
        ...(e.doneWhen?.algum ?? []),
      ]);
      if (referenced.length === 0) return; // jornada sem sinais mapeados

      const kit = checklists[s.kitId];
      expect(kit, `kit "${s.kitId}" não existe em data.ts`).toBeDefined();
      const kitIds = new Set(kit.grupos.flatMap((g) => g.documentos.map((d) => d.id)));
      for (const id of referenced) {
        expect(kitIds.has(id), `id "${id}" não existe no kit "${s.kitId}"`).toBe(true);
      }
    });
  }

  it("jornadas F-1/F-1 COS/M-1/H-1B/O-1/EB-2 NIW têm sinais mapeados", () => {
    for (const combo of combos.filter((c) => !c.main_goal)) {
      const s = getStrategy(profile(combo));
      const mapped = s.etapas.some((e) => e.doneWhen);
      expect(mapped, `jornada ${combo.visa_type}/${combo.location} sem nenhum doneWhen`).toBe(true);
    }
  });
});
