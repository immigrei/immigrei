import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { I765 } from "./i-765";
import { fillPdf } from "./fillPdf";
import type { Answers } from "./types";

// A representative Brazilian F-1 student applying for post-completion OPT.
const ANSWERS: Answers = {
  opt_type: "pos",
  reason: "initial",
  family_name: "Silva",
  given_name: "Ana",
  middle_name: "",
  dob: "1998-03-15",
  citizenship_country: "Brazil",
  birth_city: "Sao Paulo",
  birth_state: "Sao Paulo",
  birth_country: "Brazil",
  mail_street: "742 Evergreen Ter",
  mail_city: "Miami",
  mail_state: "fl", // lower-case on purpose: must be upper-cased for the dropdown
  mail_zip: "33101",
  mail_same_as_physical: "yes",
  passport_number: "AB123456",
  passport_country: "Brazil",
  passport_expiry: "2030-12-01",
  last_entry_date: "2022-08-20",
  status_at_entry: "F-1 student",
  current_status: "F-1 student",
  sevis_number: "N0012345678",
  sex: "female",
  marital_status: "single",
  previously_filed: "no",
  email: "ana@example.com",
  daytime_phone: "3055551234",
};

async function fillAndReload(answers: Answers) {
  const bytes = await fillPdf(I765, answers);
  const doc = await PDFDocument.load(bytes);
  return doc.getForm();
}

describe("I-765 fill", () => {
  it("writes the applicant's name verbatim", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].Page1[0].Line1a_FamilyName[0]").getText()).toBe("Silva");
    expect(form.getTextField("form1[0].Page1[0].Line1b_GivenName[0]").getText()).toBe("Ana");
  });

  it("encodes post-completion OPT as eligibility category (c)(3)(B)", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].Page3[0].#area[1].section_1[0]").getText()).toBe("(c)");
    expect(form.getTextField("form1[0].Page3[0].#area[1].section_2[0]").getText()).toBe("(3)");
    expect(form.getTextField("form1[0].Page3[0].#area[1].section_3[0]").getText()).toBe("(B)");
  });

  it("switches to (c)(3)(A) for pre-completion OPT", async () => {
    const form = await fillAndReload({ ...ANSWERS, opt_type: "pre" });
    expect(form.getTextField("form1[0].Page3[0].#area[1].section_3[0]").getText()).toBe("(A)");
  });

  it("checks the Initial-permission reason box", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].Page1[0].Part1_Checkbox[0]").isChecked()).toBe(true);
  });

  it("formats dates as USCIS mm/dd/yyyy", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].Page3[0].Line19_DOB[0]").getText()).toBe("03/15/1998");
    expect(form.getTextField("form1[0].Page3[0].Line21_DateOfLastEntry[0]").getText()).toBe("08/20/2022");
  });

  it("selects the US state on the dropdown, upper-cased", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getDropdown("form1[0].Page2[0].Pt2Line5_State[0]").getSelected()).toEqual(["FL"]);
  });

  it("checks the right single-choice boxes (sex, marital, mailing==physical, prior-filing)", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].Page2[0].Line9_Checkbox[0]").isChecked()).toBe(true); // female
    expect(form.getCheckBox("form1[0].Page2[0].Line10_Checkbox[2]").isChecked()).toBe(true); // single
    expect(form.getCheckBox("form1[0].Page2[0].Part2Line5_Checkbox[1]").isChecked()).toBe(true); // yes, same
    expect(form.getCheckBox("form1[0].Page2[0].Line19_Checkbox[0]").isChecked()).toBe(true); // no prior filing
  });

  it("omits the physical-address fields when mailing == physical", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].Page2[0].Pt2Line7_CityOrTown[0]").getText()).toBeFalsy();
  });

  it("fills the physical address only when it differs", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      mail_same_as_physical: "no",
      phys_street: "1 Ocean Dr",
      phys_city: "Miami Beach",
      phys_state: "FL",
      phys_zip: "33139",
    });
    expect(form.getTextField("form1[0].Page2[0].Pt2Line7_CityOrTown[0]").getText()).toBe("Miami Beach");
    expect(form.getCheckBox("form1[0].Page2[0].Part2Line5_Checkbox[0]").isChecked()).toBe(true); // No
  });
});
