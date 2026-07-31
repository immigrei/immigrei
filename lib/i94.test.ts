import { describe, expect, it } from "vitest";
import { daysUntilI94Expiry, urgencyStyle } from "./i94";

describe("daysUntilI94Expiry", () => {
  it("data futura → dias positivos", () => {
    expect(daysUntilI94Expiry("2026-08-12", new Date(2026, 6, 13))).toBe(30);
  });

  it("hoje → 0", () => {
    expect(daysUntilI94Expiry("2026-07-13", new Date(2026, 6, 13))).toBe(0);
  });

  it("data passada → dias negativos", () => {
    expect(daysUntilI94Expiry("2026-07-12", new Date(2026, 6, 13))).toBe(-1);
  });

  it("ignora o horário do 'hoje' passado — mesma resposta a qualquer hora do dia", () => {
    const manha = new Date(2026, 6, 13, 6, 0, 0);
    const noite = new Date(2026, 6, 13, 23, 59, 0);
    expect(daysUntilI94Expiry("2026-07-20", manha)).toBe(daysUntilI94Expiry("2026-07-20", noite));
  });
});

describe("urgencyStyle", () => {
  it("vencido → clay", () => {
    expect(urgencyStyle(-1).text).toBe("text-clay");
  });

  it("dentro de 30 dias → âmbar", () => {
    expect(urgencyStyle(0).text).toBe("text-amber-deep");
    expect(urgencyStyle(30).text).toBe("text-amber-deep");
  });

  it("mais de 30 dias → cor neutra", () => {
    expect(urgencyStyle(31).text).toBe("text-ink");
  });
});
