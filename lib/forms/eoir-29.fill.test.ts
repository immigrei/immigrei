import { describe, it, expect } from "vitest";
import { PDFDocument, PDFName } from "pdf-lib";
import { EOIR29 } from "./eoir-29";
import { fillPdf } from "./fillPdf";
import type { Answers } from "./types";

// A representative I-130 denial appeal (marriage-based, filed by the citizen petitioner).
const ANSWERS: Answers = {
  dhs_appeal_marker: "peticao",
  beneficiary_name: "Maria Silva Santos",
  beneficiary_a_number: "123456789",
  petition_receipt_number: "EAC1234567890",
  officer_title: "Field Office Director",
  office_issued: "USCIS Miami Field Office",
  decision_date: "2026-06-15",
  reasons:
    "The officer erroneously concluded that the marriage was not bona fide, disregarding the joint lease, joint bank account statements, and photographs submitted covering a two-year period.",
  oral_argument: "no",
  separate_brief: "no",
  petitioner_name: "Joao Pedro Santos",
  in_care_of: "",
  mail_street: "123 Main Street",
  mail_unit: "Apt 4B",
  mail_city: "Miami",
  mail_state: "FL",
  mail_zip: "33101",
};

async function fillAndReload(answers: Answers) {
  const bytes = await fillPdf(EOIR29, answers);
  const doc = await PDFDocument.load(bytes);
  return doc.getForm();
}

describe("EOIR-29 fill", () => {
  it("checks the visa-petition appeal box (Yes), not the other-appeal-type box (No)", async () => {
    const form = await fillAndReload(ANSWERS);
    const field = form.getCheckBox("DHS Appeal");
    // The real PDF models both boxes as one field with two on-values sharing
    // the name "DHS Appeal" (Yes = visa petition, No = different appeal type)
    // — a quirk of how the government authored it, not a real yes/no toggle.
    const v = field.acroField.dict.get(PDFName.of("V"));
    expect(v?.toString()).toBe("/Yes");
    expect(field.isChecked()).toBe(true);
  });

  it("writes the beneficiary's name, A-Number and petition receipt", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("DHS Name").getText()).toBe("Maria Silva Santos");
    expect(form.getTextField("DHS Anumber").getText()).toBe("123456789");
    expect(form.getTextField("DHS Petition").getText()).toBe("EAC1234567890");
  });

  it("leaves the 'different type of appeal' fields blank (out of scope)", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("Other Appeal name").getText()).toBeFalsy();
    expect(form.getTextField("Other Carrier").getText()).toBeFalsy();
    expect(form.getTextField("Other relevant").getText()).toBeFalsy();
    expect(form.getTextField("A-Number, if any").getText()).toBeFalsy();
  });

  it("writes the officer's title, issuing office and formats the decision date", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("Title of DHS Officer").getText()).toBe("Field Office Director");
    expect(form.getTextField("Office Where DHS Decision was Issued").getText()).toBe(
      "USCIS Miami Field Office"
    );
    expect(form.getTextField("Date of DHS Decision").getText()).toBe("06/15/2026");
  });

  it("preserves the reasons text verbatim, without truncation", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("Reasons").getText()).toBe(ANSWERS.reasons);
  });

  it("checks 'No' for oral argument and brief by default, 'Yes' when requested", async () => {
    const noForm = await fillAndReload(ANSWERS);
    expect(noForm.getCheckBox("Enter No - Oral Argument").isChecked()).toBe(true);
    expect(noForm.getCheckBox("Enter Yes - Oral Argument").isChecked()).toBe(false);
    expect(noForm.getCheckBox("Enter No - Brief").isChecked()).toBe(true);
    expect(noForm.getCheckBox("Enter Yes - Brief").isChecked()).toBe(false);

    const yesForm = await fillAndReload({ ...ANSWERS, oral_argument: "yes", separate_brief: "yes" });
    expect(yesForm.getCheckBox("Enter Yes - Oral Argument").isChecked()).toBe(true);
    expect(yesForm.getCheckBox("Enter No - Oral Argument").isChecked()).toBe(false);
    expect(yesForm.getCheckBox("Enter Yes - Brief").isChecked()).toBe(true);
    expect(yesForm.getCheckBox("Enter No - Brief").isChecked()).toBe(false);
  });

  it("writes the petitioner's name and mailing address (never the beneficiary's)", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("Name").getText()).toBe("Joao Pedro Santos");
    expect(form.getTextField("Street Number and Name").getText()).toBe("123 Main Street");
    expect(form.getTextField("Apartment Number or Unit Number (if any)").getText()).toBe("Apt 4B");
    expect(form.getTextField("City").getText()).toBe("Miami");
    expect(form.getTextField("State").getText()).toBe("FL");
    expect(form.getTextField("Zip Code").getText()).toBe("33101");
  });

  it("leaves the signature and signature date blank — signed by hand", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("Signature Date").getText()).toBeFalsy();
  });
});
