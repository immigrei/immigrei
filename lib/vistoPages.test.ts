import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import checklists from "@/app/documentos/[vistoId]/data";
import { MANUAIS } from "./manuais";
import { todosVistos } from "./vistosCatalog";
import { VISTO_PAGES, getVistoPage, hasVistoPage } from "./vistoPages";

const pages = Object.values(VISTO_PAGES);
const OFFICIAL_HOSTS = [
  "uscis.gov",
  "dhs.gov",
  "state.gov",
  "ecfr.gov",
  "cbp.gov",
  "dol.gov",
  "federalregister.gov",
];

describe("VISTO_PAGES integrity", () => {
  it("todo id de página existe no catálogo (e a chave bate com o id)", () => {
    const catalogIds = new Set(todosVistos.map((v) => v.id));
    for (const [key, page] of Object.entries(VISTO_PAGES)) {
      expect(page.id, key).toBe(key);
      expect(catalogIds.has(page.id), `catálogo sem o id ${page.id}`).toBe(true);
    }
  });

  it("todo arquivo em fonteLeis existe em content/leis", () => {
    for (const page of pages) {
      expect(page.fonteLeis.length, page.id).toBeGreaterThan(0);
      for (const file of page.fonteLeis) {
        const full = join(process.cwd(), "content/leis", file);
        expect(existsSync(full), `${page.id}: content/leis/${file} não existe`).toBe(true);
      }
    }
  });

  it("pontes internas apontam para rotas conhecidas", () => {
    for (const page of pages) {
      for (const ponte of page.pontes) {
        expect(ponte.href.startsWith("/"), `${page.id}: ${ponte.href}`).toBe(true);
        const manual = ponte.href.match(/^\/caminhos\/(.+)$/);
        if (manual) {
          expect(MANUAIS[manual[1]], `${page.id}: manual ${manual[1]} não existe`).toBeDefined();
        }
        const caso = ponte.href.match(/^\/casos\/(.+)$/);
        if (caso) {
          const full = join(process.cwd(), "app/casos", caso[1]);
          expect(existsSync(full), `${page.id}: rota /casos/${caso[1]} não existe`).toBe(true);
        }
      }
    }
  });

  it("o kit de cada página, quando existe, está nos checklists de /documentos", () => {
    for (const page of pages) {
      if (page.kit === null) continue; // checklist ainda não construído — estado válido
      expect(checklists[page.kit.kitId], `${page.id}: kit ${page.kit.kitId}`).toBeDefined();
    }
  });

  it("fontes oficiais são https e de domínio governamental", () => {
    for (const page of pages) {
      expect(page.fontesOficiais.length, page.id).toBeGreaterThan(0);
      for (const fonte of page.fontesOficiais) {
        const url = new URL(fonte.url);
        expect(url.protocol, `${page.id}: ${fonte.url}`).toBe("https:");
        expect(
          OFFICIAL_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`)),
          `${page.id}: ${url.hostname} não é domínio oficial conhecido`
        ).toBe(true);
      }
    }
  });

  it("verificadoEm é uma data ISO e as seções obrigatórias têm conteúdo", () => {
    for (const page of pages) {
      expect(page.verificadoEm, page.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(page.oQueE.length, page.id).toBeGreaterThan(0);
      expect(page.quemPode.length, page.id).toBeGreaterThan(0);
      expect(page.bloqueios.length, page.id).toBeGreaterThan(0);
      expect(page.prazos.length, page.id).toBeGreaterThan(0);
      expect(page.passos.length, page.id).toBeGreaterThanOrEqual(3);
      for (const b of page.bloqueios) {
        expect(b.base.trim().length, `${page.id}: bloqueio sem base legal`).toBeGreaterThan(0);
      }
    }
  });

  it("helpers respondem coerentemente", () => {
    expect(hasVistoPage("f1")).toBe(true);
    expect(getVistoPage("f1")?.id).toBe("f1");
<<<<<<< Updated upstream
    expect(hasVistoPage("e2")).toBe(true);
=======
    expect(hasVistoPage("eb1c")).toBe(false);
>>>>>>> Stashed changes
    expect(getVistoPage("nao-existe")).toBeNull();
  });
});
