import { describe, expect, it } from "vitest";
import { describeApiFailure, mapCaseStatusPayload } from "./uscis";

const NOW = "2026-07-08T00:00:00.000Z";
const RECEIPT = "IOE0123456789";

describe("describeApiFailure — every documented Torch response code", () => {
  it.each([
    [400, "bad_request"],
    [401, "auth_401"],
    [403, "auth_403"],
    [404, "not_found"],
    [429, "rate_limited"],
    [500, "http_500"],
    [503, "http_503"],
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
