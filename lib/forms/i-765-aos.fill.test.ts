import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { I765AOS } from "./i-765-aos";
import { I765 } from "./i-765";
import { fillPdf } from "./fillPdf";
import { allQuestions, type Answers } from "./types";

// Ana requesting the (c)(9) work permit alongside her pending I-485.
const ANSWERS: Answers = {
  eligibility_category: "c9",
  reason: "initial",
  family_name: "Silva",
  given_name: "Ana",
  dob: "1992-03-15",
  citizenship_country: "Brazil",
  birth_city: "Sao Paulo",
  birth_country: "Brazil",
  mail_street: "742 Evergreen Ter",
  mail_city: "Miami",
  mail_state: "fl",
  mail_zip: "33101",
  mail_same_as_physical: "yes",
  passport_number: "AB123456",
  passport_country: "Brazil",
  passport_expiry: "2030-12-01",
  last_entry_date: "2024-01-10",
  status_at_entry: "B-2 visitor",
  current_status: "Adjustment applicant",
  sex: "female",
  marital_status: "married",
  previously_filed: "no",
  email: "ana@example.com",
};

async function fillAndReload(answers: Answers) {
  const bytes = await fillPdf(I765AOS, answers);
  const doc = await PDFDocument.load(bytes);
  return doc.getForm();
}

describe("I-765 (c)(9) fill", () => {
  it("writes (c)(9) into the item 27 category boxes", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].Page3[0].#area[1].section_1[0]").getText()).toBe("(c)");
    expect(form.getTextField("form1[0].Page3[0].#area[1].section_2[0]").getText()).toBe("(9)");
    expect(form.getTextField("form1[0].Page3[0].#area[1].section_3[0]").getText()).toBeFalsy();
  });

  it("reuses the OPT spec's verified personal-data mappings", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].Page1[0].Line1a_FamilyName[0]").getText()).toBe("Silva");
    expect(form.getCheckBox("form1[0].Page1[0].Part1_Checkbox[0]").isChecked()).toBe(true); // initial
    expect(form.getTextField("form1[0].Page3[0].Line24_CurrentStatus[0]").getText()).toBe(
      "Adjustment applicant"
    );
    expect(form.getDropdown("form1[0].Page2[0].Pt2Line5_State[0]").getSelected()).toEqual(["FL"]);
  });

  it("leaves SEVIS blank without failing (not required for adjustment)", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].Page3[0].Line26_SEVISnumber[0]").getText()).toBeFalsy();
    const sevis = allQuestions(I765AOS).find((q) => q.id === "sevis_number");
    expect(sevis?.required).toBeFalsy();
  });

  it("does not mutate the original OPT spec", () => {
    const optSevis = allQuestions(I765).find((q) => q.id === "sevis_number");
    expect(optSevis?.required).toBe(true);
    const optStatus = allQuestions(I765).find((q) => q.id === "current_status");
    expect(optStatus?.default).toBe("F-1 student");
    expect(I765.sections[0].questions.some((q) => q.id === "opt_type")).toBe(true);
  });
});
