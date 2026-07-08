import { describe, expect, it } from "vitest";
import { traduzirStatus } from "./uscis-status-pt";

describe("traduzirStatus", () => {
  it("translates common statuses exactly, regardless of case and punctuation", () => {
    const t = traduzirStatus("Case Was Received");
    expect(t.exato).toBe(true);
    expect(t.titulo).toBe("Caso recebido");
    expect(t.original).toBe("Case Was Received");

    expect(traduzirStatus("CASE WAS APPROVED").exato).toBe(true);
    expect(traduzirStatus("Response To USCIS' Request For Evidence Was Received").exato).toBe(true);
  });

  it("falls back to a category for unknown statuses", () => {
    const t = traduzirStatus("Case Was Denied For Some Brand New Reason");
    expect(t.exato).toBe(false);
    expect(t.titulo).toBe("Decisão desfavorável");
  });

  it("classifies administrative rejections apart from merit denials", () => {
    const t = traduzirStatus("Case Was Rejected For Some Unmapped Reason");
    expect(t.titulo).toBe("Pacote rejeitado (administrativo)");
  });

  it("never hides the original when nothing matches", () => {
    const t = traduzirStatus("Some Entirely Unknown Status");
    expect(t.exato).toBe(false);
    expect(t.titulo).toBe("Some Entirely Unknown Status");
    expect(t.explicacao.length).toBeGreaterThan(0);
  });

  it("every dictionary explanation ends with proper punctuation and stays plain-PT", () => {
    // sample a few statuses across categories
    for (const s of [
      "Case Was Approved",
      "Request For Additional Evidence Was Sent",
      "Card Was Mailed To Me",
      "Case Was Transferred And A New Office Has Jurisdiction",
    ]) {
      const t = traduzirStatus(s);
      expect(t.exato).toBe(true);
      expect(t.explicacao).toMatch(/[.!]$/);
    }
  });
});
