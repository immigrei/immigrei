import { describe, expect, it } from "vitest";
import { daysUntilOptEligible, estimatedOptEligibleDate } from "./opt";

describe("estimatedOptEligibleDate", () => {
  it("soma 9 meses (2 semestres) à data de início do programa", () => {
    expect(estimatedOptEligibleDate("2025-08-15")).toBe("2026-05-15");
  });

  it("lida com virada de ano", () => {
    expect(estimatedOptEligibleDate("2026-01-10")).toBe("2026-10-10");
  });
});

describe("daysUntilOptEligible", () => {
  it("data futura → dias positivos", () => {
    expect(daysUntilOptEligible("2026-08-12", new Date(2026, 6, 13))).toBe(30);
  });

  it("hoje → 0", () => {
    expect(daysUntilOptEligible("2026-07-13", new Date(2026, 6, 13))).toBe(0);
  });

  it("data passada → dias negativos (já elegível)", () => {
    expect(daysUntilOptEligible("2026-07-12", new Date(2026, 6, 13))).toBe(-1);
  });
});
