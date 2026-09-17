import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getExplainerPage,
  getExplainerPages,
  getPendingDrafts,
  relatedExplainers,
} from "./contentPages";

const FIXTURES = join(process.cwd(), "lib/__fixtures__/contentPages");
const OFFICIAL_HOSTS = [
  "uscis.gov",
  "dhs.gov",
  "state.gov",
  "ecfr.gov",
  "cbp.gov",
  "dol.gov",
  "federalregister.gov",
];

describe("publish gate (fixtures)", () => {
  const pages = getExplainerPages(FIXTURES);
  const pending = getPendingDrafts(FIXTURES);
  const blockersOf = (slug: string) => pending.find((d) => d.slug === slug)?.blockers ?? [];

  it("só o rascunho aprovado, verificado e sem VERIFY vira página", () => {
    expect(pages.map((p) => p.slug)).toEqual(["case-was-tested"]);
  });

  it("cada bloqueio aparece com o motivo — é o que vai no digest de revisão", () => {
    expect(blockersOf("still-a-draft")).toEqual(
      expect.arrayContaining(["status: draft", "reviewed_by pendente"]),
    );
    expect(blockersOf("open-verify")).toContain("marcadores VERIFY em aberto");
    expect(blockersOf("failed-compliance")[0]).toMatch(/^compliance_check: FAIL/);
    expect(blockersOf("faq-bank-entry")).toContain('type "faq-bank" não vira página');
  });

  it("notas internas <!-- --> nunca chegam ao conteúdo público", () => {
    const page = pages[0];
    expect(page.body).not.toContain("<!--");
    expect(page.body).not.toContain("nota interna");
  });

  it("separa corpo, FAQ e fechamento; FAQ ganha texto puro para o JSON-LD", () => {
    const page = pages[0];
    expect(page.body).toMatch(/^\*\*"Case Was Tested"\*\*/);
    expect(page.body).not.toContain("Perguntas frequentes");
    expect(page.faq.map((f) => f.q)).toEqual(["Isso é uma pergunta?", "Existe uma segunda pergunta?"]);
    expect(page.faq[0].a).toContain("Um segundo parágrafo");
    expect(page.faq[0].aText).toBe(
      "Sim, e esta é a resposta com negrito e link. Um segundo parágrafo que continua a mesma resposta.",
    );
    expect(page.closing).toContain("Acompanhe sua jornada");
  });

  it("metadados: rota por tipo, descrição curta, só fontes https", () => {
    const page = pages[0];
    expect(page.path).toBe("/status/case-was-tested");
    expect(page.url).toBe("https://immigrei.app/status/case-was-tested");
    expect(page.description.length).toBeLessThanOrEqual(155);
    expect(page.description.startsWith('"Case Was Tested" significa')).toBe(true);
    expect(page.sources).toEqual(["https://www.uscis.gov/tools/glossary"]);
    expect(page.verificadoEm).toBe("2026-09-13");
  });

  it("lookup respeita a seção da rota", () => {
    expect(getExplainerPage("/status", "case-was-tested", FIXTURES)?.slug).toBe("case-was-tested");
    expect(getExplainerPage("/entenda", "case-was-tested", FIXTURES)).toBeNull();
    expect(getExplainerPage("/status", "still-a-draft", FIXTURES)).toBeNull();
    expect(relatedExplainers(pages[0], 3, FIXTURES)).toEqual([]);
  });
});

// Invariants for whatever César has approved in the real drafts folder —
// these start to bite the moment a draft flips to `status: approved`.
describe("rascunhos reais publicados", () => {
  const pages = getExplainerPages();

  it("nenhuma página publicada vaza nota interna ou fica sem FAQ", () => {
    for (const page of pages) {
      expect(`${page.body}${page.closing}`, page.slug).not.toContain("<!--");
      expect(page.faq.length, `${page.slug}: FAQ vazio`).toBeGreaterThan(0);
      expect(page.description.length, page.slug).toBeGreaterThan(0);
    }
  });

  it("toda fonte pública é de domínio governamental", () => {
    for (const page of pages) {
      expect(page.sources.length, page.slug).toBeGreaterThan(0);
      for (const source of page.sources) {
        const host = new URL(source).hostname;
        expect(
          OFFICIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`)),
          `${page.slug}: ${host} não é domínio oficial conhecido`,
        ).toBe(true);
      }
    }
  });

  it("slugs são únicos por rota", () => {
    const paths = pages.map((p) => p.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
