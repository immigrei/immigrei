import { describe, expect, it } from "vitest";
import { describeApiFailure, isRealStatusChange, mapCaseStatusPayload } from "./uscis";

const NOW = "2026-07-08T00:00:00.000Z";
const RECEIPT = "IOE0123456789";

describe("describeApiFailure — every documented Torch response code", () => {
  it.each([
    [400, "bad_request"],
    [401, "auth_401"],
    [403, "auth_403"],
    [404, "not_found"],
    [422, "unprocessable"],
    [429, "rate_limited"],
    [500, "http_500"],
    [503, "service_unavailable"],
  ])("HTTP %i vira resultado com error=%s e nunca lança", (code, error) => {
    const r = describeApiFailure(code, RECEIPT, NOW);
    expect(r.error).toBe(error);
    expect(r.receiptNumber).toBe(RECEIPT);
    expect(r.isApproved).toBe(false);
    expect(r.isDenied).toBe(false);
    expect(r.description.length).toBeGreaterThan(20);
  });
});

describe("mapCaseStatusPayload — variantes documentadas do payload", () => {
  it("mapeia o formato case_status (snake_case)", () => {
    const r = mapCaseStatusPayload(
      RECEIPT,
      {
        case_status: {
          receiptNumber: RECEIPT,
          current_case_status_text_en: "Case Was Approved",
          current_case_status_desc_en: "We approved your case.",
          modifiedDate: "2026-07-01",
        },
      },
      NOW,
    );
    expect(r.status).toBe("Case Was Approved");
    expect(r.isApproved).toBe(true);
    expect(r.isPending).toBe(false);
    expect(r.statusDate).toBe("2026-07-01");
  });

  it("mapeia o formato actionCode e classifica negativa", () => {
    const r = mapCaseStatusPayload(
      RECEIPT,
      { caseStatus: { actionCodeText: "Case Was Denied", actionCodeDesc: "Denied." } },
      NOW,
    );
    expect(r.isDenied).toBe(true);
    expect(r.isApproved).toBe(false);
  });

  it("payload vazio vira 'Status não encontrado' pendente, sem lançar", () => {
    const r = mapCaseStatusPayload(RECEIPT, {}, NOW);
    expect(r.status).toBe("Status não encontrado");
    expect(r.isPending).toBe(true);
  });
});

describe("isRealStatusChange — erro do USCIS nunca vira mudança de status", () => {
  // Regressão: o cron semanal tratava "Caso não encontrado" (404) como
  // mudança de status, sobrescrevia last_status e mandava e-mail dizendo que
  // o caso do usuário sumiu. No sandbox todo receipt real responde 404, então
  // isso atingiria todos os usuários de uma vez.
  it.each([
    [400, "bad_request"],
    [401, "auth_401"],
    [403, "auth_403"],
    [404, "not_found"],
    [422, "unprocessable"],
    [429, "rate_limited"],
    [500, "http_500"],
    [503, "service_unavailable"],
  ])("HTTP %i (error=%s) não conta como mudança", (code) => {
    const r = describeApiFailure(code, RECEIPT, NOW);
    expect(isRealStatusChange(r, "Case Was Received")).toBe(false);
    expect(isRealStatusChange(r, null)).toBe(false);
  });

  it("payload vazio ('Status não encontrado') não conta como mudança", () => {
    expect(isRealStatusChange(mapCaseStatusPayload(RECEIPT, {}, NOW), null)).toBe(false);
  });

  it("status novo e bem-sucedido conta como mudança", () => {
    const r = mapCaseStatusPayload(
      RECEIPT,
      { case_status: { current_case_status_text_en: "Case Was Approved" } },
      NOW,
    );
    expect(isRealStatusChange(r, "Case Was Received")).toBe(true);
  });

  it("mesmo status não conta como mudança", () => {
    const r = mapCaseStatusPayload(
      RECEIPT,
      { case_status: { current_case_status_text_en: "Case Was Approved" } },
      NOW,
    );
    expect(isRealStatusChange(r, "Case Was Approved")).toBe(false);
  });

  it("primeira verificação de um caso sem status anterior conta como mudança", () => {
    const r = mapCaseStatusPayload(
      RECEIPT,
      { case_status: { current_case_status_text_en: "Case Was Received" } },
      NOW,
    );
    expect(isRealStatusChange(r, null)).toBe(true);
  });
});
