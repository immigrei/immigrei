import { describe, expect, it } from "vitest";
import { findCatalogVisto, todosVistos } from "./vistosCatalog";

describe("findCatalogVisto", () => {
  it("casa títulos de visto puro do onboarding com o card do catálogo", () => {
    const cases: Array<[string, string]> = [
      ["F-1 (Estudante Acadêmico)", "f1"],
      ["F-1 (Estudante Acadêmico) — pelo consulado", "f1"],
      ["F-1 (Estudante Acadêmico) — caminho recomendado", "f1"],
      ["M-1 (Estudante Vocacional / Técnico)", "m1"],
      ["J-1 (Intercâmbio e Pesquisa)", "j1"],
      ["J-1 (Intercâmbio — alternativa para idiomas)", "j1"],
      ["H-1B (Trabalho Especializado)", "h1b"],
      ["O-1 (Habilidade Extraordinária)", "o1"],
      ["L-1 (Transferência Intraempresarial)", "l1"],
      ["B-1/B-2 (Turismo e Negócios)", "b1"],
      ["B-1 (Visitante de Negócios)", "b1"],
      ["ESTA (Autorização de Viagem Eletrônica)", "esta"],
      ["ESTA (para cidadãos de países do VWP)", "esta"],
      ["E-1 (Comércio por Tratado)", "e1"],
      ["E-2 (Investidor por Tratado)", "e2"],
      ["EB-2 NIW (Green Card por Interesse Nacional)", "eb2niw"],
    ];
    for (const [title, id] of cases) {
      expect(findCatalogVisto(title)?.id, title).toBe(id);
    }
  });

  it("não casa cards de processo, manuais de caminho e categorias fora do catálogo", () => {
    const naoCasa = [
      "F-1 → H-1B (guia passo a passo)",
      "M-1 → F-1 só pelo consulado (guia passo a passo)",
      "J-1 → F-1 (guia passo a passo)",
      "L-1A → EB-1C: a ponte do executivo (guia passo a passo)",
      "O-1 → Green Card por autopetição (guia passo a passo)",
      "I-539 — Mudança de Status para F-1",
      "Transferência de H-1B (novo empregador)",
      "Transferência de H-1B (guia passo a passo)",
      "H-1B via Mudança de Status",
      "F-2 (Familiar de Residente Permanente)",
      "K-1 (Noivo/a) ou IR-1/CR-1 (Cônjuge Casado)",
      "IR-1 / IR-2 (Parente Imediato de Cidadão)",
      "EB-5 (Green Card por Investimento)",
      "EB-1 (Green Card por Habilidade Extraordinária)",
      "Green Card por Patrocínio (EB-2 / EB-3)",
      "⚠️ Entrada por ESTA/VWP: sem extensão ou mudança de status",
      "Use o ESTA do jeito certo",
    ];
    for (const title of naoCasa) {
      expect(findCatalogVisto(title), title).toBeNull();
    }
  });

  it("todo card do catálogo é alcançável por algum título 'CÓDIGO (Nome)'", () => {
    for (const visto of todosVistos) {
      expect(findCatalogVisto(`${visto.codigo} (${visto.nome})`)?.id, visto.codigo).toBe(
        visto.id
      );
    }
  });
});
