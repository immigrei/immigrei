import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildLlmsFullTxt, buildLlmsTxt } from "./llmsTxt";
import { VISTO_PAGES } from "./vistoPages";

const FIXTURES = join(process.cwd(), "lib/__fixtures__/contentPages");

describe("llms.txt", () => {
  const txt = buildLlmsTxt(FIXTURES);
  const full = buildLlmsFullTxt(FIXTURES);

  it("segue o formato llmstxt.org: H1, resumo em blockquote, seções H2", () => {
    expect(txt.startsWith("# immigrei\n\n> ")).toBe(true);
    expect(txt).toContain("## Vistos");
    expect(txt).toContain("## Optional");
  });

  it("lista só explainers aprovados — rascunhos e bloqueados nunca aparecem", () => {
    expect(txt).toContain("https://immigrei.app/status/case-was-tested");
    for (const slug of ["still-a-draft", "open-verify", "failed-compliance", "faq-bank-entry"]) {
      expect(txt, slug).not.toContain(slug);
      expect(full, slug).not.toContain(slug);
    }
  });

  it("toda página de visto do catálogo está no mapa", () => {
    for (const id of Object.keys(VISTO_PAGES)) {
      expect(txt, id).toContain(`https://immigrei.app/vistos/${id}`);
    }
  });

  it("o texto completo nunca carrega notas internas", () => {
    expect(full).toContain("Isso é uma pergunta?");
    expect(full).not.toContain("<!--");
    expect(full).not.toContain("nota interna");
  });
});
