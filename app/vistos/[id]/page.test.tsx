import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VISTO_PAGES } from "@/lib/vistoPages";
import { FontesOficiaisSection } from "./page";

/**
 * FontesOficiaisSection is extracted from the page specifically so it can
 * be rendered here without ConfirmBar/VoltarButton, which call
 * next/navigation's useRouter and need a live App Router context.
 *
 * /vistos(.*) is public (proxy.ts) — this only checks the always-on
 * rendering, which is the same for signed-in and signed-out visitors.
 */

const f1 = VISTO_PAGES.f1;

describe("FontesOficiaisSection (/vistos/[id])", () => {
  it("mostra todos os links oficiais e a data de verificação", () => {
    const html = renderToStaticMarkup(
      <FontesOficiaisSection
        fontesOficiais={f1.fontesOficiais}
        verificadoEm={f1.verificadoEm}
      />
    );
    expect(html).toContain('target="_blank"');
    for (const fonte of f1.fontesOficiais) {
      expect(html).toContain(fonte.url);
    }
    expect(html).toContain(f1.verificadoEm);
  });
});
