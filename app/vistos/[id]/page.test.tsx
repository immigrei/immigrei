import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VISTO_PAGES } from "@/lib/vistoPages";
import { FontesOficiaisSection } from "./page";

/**
 * Pre-login gating for the "Fontes oficiais" section on /vistos/[id].
 * FontesOficiaisSection is extracted from the page specifically so it can
 * be rendered here without ConfirmBar/VoltarButton, which call
 * next/navigation's useRouter and need a live App Router context.
 */

const f1 = VISTO_PAGES.f1;

describe("FontesOficiaisSection (/vistos/[id]) — gating pré-login", () => {
  it("visitante não logado: nenhum link para site do governo, só o aviso discreto", () => {
    const html = renderToStaticMarkup(
      <FontesOficiaisSection
        userId={null}
        fontesOficiais={f1.fontesOficiais}
        verificadoEm={f1.verificadoEm}
      />
    );
    expect(html).not.toContain('target="_blank"');
    for (const fonte of f1.fontesOficiais) {
      expect(html).not.toContain(fonte.url);
    }
    expect(html).toContain("Fontes oficiais disponíveis após login.");
  });

  it("usuário logado: todos os links oficiais aparecem, sem o aviso", () => {
    const html = renderToStaticMarkup(
      <FontesOficiaisSection
        userId="user_123"
        fontesOficiais={f1.fontesOficiais}
        verificadoEm={f1.verificadoEm}
      />
    );
    expect(html).toContain('target="_blank"');
    for (const fonte of f1.fontesOficiais) {
      expect(html).toContain(fonte.url);
    }
    expect(html).toContain(f1.verificadoEm);
    expect(html).not.toContain("Fontes oficiais disponíveis após login.");
  });
});
