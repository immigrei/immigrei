import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { I864 } from "./i-864";
import { fillPdf } from "./fillPdf";
import type { Answers } from "./types";

// The US-citizen petitioner-sponsor in Florida supporting their Brazilian
// spouse (the same couple as the I-130/I-130A fill tests).
const ANSWERS: Answers = {
  basis: "petitioner",
  sp_family_name: "Johnson",
  sp_given_name: "Mary",
  sp_mail_street: "742 Evergreen Ter",
  sp_mail_city: "Miami",
  sp_mail_state: "fl", // lower-case on purpose: upper-cased for the dropdown
  sp_mail_zip: "33101",
  sp_mail_country: "United States",
  sp_mail_same_as_physical: "yes",
  sp_domicile: "United States",
  sp_dob: "1990-06-01",
  sp_birth_city: "Orlando",
  sp_ssn: "123456789",
  sp_status: "citizen",
  sp_military: "no",
  im_family_name: "Silva",
  im_given_name: "Ana",
  im_street: "Rua das Flores 100",
  im_city: "Sao Paulo",
  im_province: "Sao Paulo",
  im_postal: "01000-000",
  im_country: "Brazil",
  im_citizenship: "Brazil",
  im_dob: "1992-03-15",
  im_daytime_phone: "5511999998888",
  sponsoring_principal: "yes",
  hh_immigrants: 1,
  hh_spouse: 0,
  hh_children: 0,
  hh_other_dependents: 0,
  hh_prior_sponsored: 0,
  hh_combining: 0,
  hh_yourself_note: 2,
  employment_kind: "employed",
  employed_as: "Engineer",
  employer1_name: "Acme Corp",
  individual_income: 65000,
  household_income: 65000,
  filed_taxes: "yes",
  tax_year_1: "2025",
  tax_income_1: "65000",
  use_assets: "yes",
  sp_daytime_phone: "3055551234",
  sp_email: "mary@example.com",
};

async function fillAndReload(answers: Answers) {
  const bytes = await fillPdf(I864, answers);
  const doc = await PDFDocument.load(bytes);
  return doc.getForm();
}

describe("I-864 fill", () => {
  it("checks the petitioner basis box and leaves the others unchecked", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[0].P1_Line1a-f_CB[0]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[0].P1_Line1a-f_CB[3]").isChecked()).toBe(false);
    expect(form.getCheckBox("form1[0].#subform[0].P1_Line1a-f_CB[5]").isChecked()).toBe(false);
  });

  it("writes the sponsor's name on the P4_-prefixed Part 2 fields", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[0].P4_Line1a_FamilyName[0]").getText()).toBe("Johnson");
    expect(form.getTextField("form1[0].#subform[0].P4_Line1b_GivenName[0]").getText()).toBe("Mary");
  });

  it("writes the principal immigrant on the P2_-prefixed Part 3 fields", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[2].P2_Line1a_FamilyName[0]").getText()).toBe("Silva");
    expect(form.getTextField("form1[0].#subform[2].P2_Line2_Country[0]").getText()).toBe("Brazil");
    expect(form.getTextField("form1[0].#subform[2].P2_Line4_DateOfBirth[0]").getText()).toBe("03/15/1992");
  });

  it("marks citizen status, military No and mailing=physical Yes", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[1].P4_Line11a_Checkbox[0]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[1].P4_Line11c_Checkbox[0]").isChecked()).toBe(false);
    expect(form.getCheckBox("form1[0].#subform[1].P4_Line14_Checkboxes[1]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[1].P1_Line3_Checkbox[0]").isChecked()).toBe(true);
  });

  it("selects the sponsor state dropdown upper-cased and fills the SSN", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getDropdown("form1[0].#subform[1].P4_Line2f_State[0]").getSelected()).toEqual(["FL"]);
    expect(form.getTextField("form1[0].#subform[1].P4_Line10_SocialSecurityNumber[0]").getText()).toBe(
      "123456789"
    );
  });

  it("fills the household counts, writes '1' for yourself and the total", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[4].P3_Line28_TotalNumberofImmigrants[0]").getText()).toBe("1");
    expect(form.getTextField("form1[0].#subform[4].P5_Line2_Yourself[0]").getText()).toBe("1");
    expect(form.getTextField("form1[0].#subform[4].P5_Line3_Married[0]").getText()).toBe("0");
    expect(form.getTextField("form1[0].#subform[4].Override[0]").getText()).toBe("2");
  });

  it("checks Employed, fills employer and income fields", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[4].P6_Line1_Checkbox[0]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[4].P6_Line1a1_NameofEmployer[0]").getText()).toBe("Acme Corp");
    expect(form.getTextField("form1[0].#subform[4].P6_Line2_TotalIncome[0]").getText()).toBe("65000");
    expect(form.getTextField("form1[0].#subform[5].P6_Line15_TotalHouseholdIncome[0]").getText()).toBe("65000");
  });

  it("marks taxes filed and the most recent tax year", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[5].P6_Line18a_Checkbox[0]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[6].P6_Line19a_TaxYear[0]").getText()).toBe("2025");
    expect(form.getTextField("form1[0].#subform[6].P6_Line19a_TotalIncome[0]").getText()).toBe("65000");
  });

  it("skips the assets part when income is sufficient", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[6].P7_Line1_BalanceofAccounts[0]").getText()).toBeFalsy();
  });

  it("fills assets (and copies the total) when income falls short", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      use_assets: "no",
      assets_cash: 20000,
      assets_real_estate: 0,
      assets_stocks: 5000,
      assets_total: 25000,
    });
    expect(form.getTextField("form1[0].#subform[6].P7_Line1_BalanceofAccounts[0]").getText()).toBe("20000");
    expect(form.getTextField("form1[0].#subform[6].P7_Line4_Total[0]").getText()).toBe("25000");
    expect(form.getTextField("form1[0].#subform[6].P7_Line5_TotalAssetsHouseholdMembers[0]").getText()).toBe(
      "25000"
    );
  });

  it("fills the retired variant with its date", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      employment_kind: "retired",
      employed_as: "",
      employer1_name: "",
      retired_since: "2024-01-31",
    });
    expect(form.getCheckBox("form1[0].#subform[4].P6_Line5_Checkbox[0]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[4].P6_Line5a_DateRetired[0]").getText()).toBe("01/31/2024");
    expect(form.getTextField("form1[0].#subform[4].P6_Line1a1_NameofEmployer[0]").getText()).toBeFalsy();
  });

  it("fills the sponsor contact and leaves signatures blank", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[9].P7Line7_EmailAddress[0]").getText()).toBe("mary@example.com");
    expect(form.getTextField("form1[0].#subform[9].P8_Line9a_ApplicantSignature[0]").getText()).toBeFalsy();
    expect(
      form.getTextField("form1[0].#subform[10].P9_Line1a_InterpretersFamilyName[0]").getText()
    ).toBeFalsy();
  });
});
