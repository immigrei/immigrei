import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { G1145 } from "./g-1145";
import { fillPdf } from "./fillPdf";
import type { Answers } from "./types";

const ANSWERS: Answers = {
  family_name: "Silva",
  given_name: "Ana",
  middle_name: "",
  email: "ana@example.com",
  mobile_phone: "3055551234",
};

async function fillAndReload(answers: Answers) {
  const bytes = await fillPdf(G1145, answers);
  const doc = await PDFDocument.load(bytes);
  return doc.getForm();
}

describe("G-1145 fill", () => {
  it("fills the five fields on the single page", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[0].LastName[0]").getText()).toBe("Silva");
    expect(form.getTextField("form1[0].#subform[0].FirstName[0]").getText()).toBe("Ana");
    expect(form.getTextField("form1[0].#subform[0].Email[0]").getText()).toBe("ana@example.com");
    expect(form.getTextField("form1[0].#subform[0].MobilePhoneNumber[0]").getText()).toBe("3055551234");
  });
});
