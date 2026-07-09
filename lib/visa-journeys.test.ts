/**
 * Contrato jornada ⇄ produto: a "Sua jornada" do dashboard precisa apontar
 * para superfícies que existem de verdade. Se um kit for renomeado em
 * /documentos, um manual sair de /caminhos, ou um visto do catálogo /vistos
 * ficar sem jornada, este teste quebra o merge.
 */
import { describe, expect, it } from "vitest";
import { getJourney, VISA_JOURNEYS } from "./visa-journeys";
import { MANUAIS } from "./manuais";
import checklists from "../app/documentos/[vistoId]/data";

// Ids selecionáveis no catálogo /vistos (app/vistos/page.tsx).
const CATALOG_IDS = ["f1", "m1", "j1", "h1b", "o1", "e2", "e1", "b1", "l1", "eb2niw"];

// Motores de caso existentes em /casos.
const CASE_ENGINES = new Set(["/casos/cos-b2-f1"]);

describe("todo visto do catálogo tem jornada no dashboard", () => {
  it.each(CATALOG_IDS)("visto %s → jornada", (id) => {
    expect(getJourney(id)).not.toBeNull();
  });
});

describe("todo link de passo da jornada aponta para superfície existente", () => {
  const allLinks = Object.values(VISA_JOURNEYS).flatMap((j) =>
    j.steps
      .filter((s) => s.link)
      .map((s) => ({ jornada: j.visaType, passo: s.id, href: s.link!.href }))
  );

  it("há links mapeados", () => {
    expect(allLinks.length).toBeGreaterThan(0);
  });

  it.each(allLinks)("$jornada/$passo → $href", ({ href }) => {
    const kit = href.match(/^\/documentos\/([\w-]+)$/);
    const manual = href.match(/^\/caminhos\/([\w-]+)$/);
    if (kit) {
      expect(checklists[kit[1]], `kit inexistente: ${kit[1]}`).toBeDefined();
    } else if (manual) {
      expect(MANUAIS[manual[1]], `manual inexistente: ${manual[1]}`).toBeDefined();
    } else {
      expect(CASE_ENGINES.has(href), `rota desconhecida: ${href}`).toBe(true);
    }
  });
});
