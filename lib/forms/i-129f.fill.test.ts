import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { I129F } from "./i-129f";
import { fillPdf } from "./fillPdf";
import type { Answers } from "./types";

// John, the US citizen petitioner, filing for his Brazilian fiancée Ana.
const ANSWERS: Answers = {
  pet_family_name: "Johnson",
  pet_given_name: "John",
  pet_mail_street: "742 Evergreen Ter",
  pet_mail_city: "Miami",
  pet_mail_state: "fl",
  pet_mail_zip: "33101",
  pet_mail_country: "United States",
  pet_mail_same_as_physical: "yes",
  pet_employer1_name: "Acme Corp",
  pet_employer1_occupation: "Engineer",
  pet_sex: "male",
  pet_dob: "1988-04-20",
  pet_marital_status: "single",
  pet_birth_city: "Orlando",
  pet_birth_country: "United States",
  pet_parent1_family: "Johnson",
  pet_parent1_given: "Robert",
  pet_parent2_family: "Johnson",
  pet_parent2_given: "Susan",
  pet_previously_married: "no",
  pet_citizenship_via: "birth",
  pet_prior_i129f: "no",
  pet_has_children: "no",
  pet_residence1_state: "FL",
  ben_family_name: "Silva",
  ben_given_name: "Ana",
  ben_dob: "1992-03-15",
  ben_sex: "female",
  ben_marital_status: "single",
  ben_birth_city: "Sao Paulo",
  ben_birth_country: "Brazil",
  ben_citizenship_country: "Brazil",
  ben_mail_street: "Rua das Flores 100",
  ben_mail_city: "Sao Paulo",
  ben_mail_province: "Sao Paulo",
  ben_mail_postal: "01000-000",
  ben_mail_country: "Brazil",
  ben_employer1_name: "Padaria Estrela",
  ben_employer1_occupation: "Baker",
  ben_parent1_family: "Silva",
  ben_parent1_given: "Jose",
  ben_parent2_family: "Souza",
  ben_parent2_given: "Maria",
  ben_previously_married: "no",
  ben_ever_in_us: "no",
  ben_passport_number: "AB123456",
  ben_passport_country: "Brazil",
  ben_passport_expiry: "2030-12-01",
  ben_has_children: "no",
  ben_us_address_street: "742 Evergreen Ter",
  ben_us_address_city: "Miami",
  ben_us_address_state: "FL",
  ben_us_address_zip: "33101",
  ben_abroad_address_street: "Rua das Flores 100",
  ben_abroad_address_city: "Sao Paulo",
  ben_abroad_address_country: "Brazil",
  related_to_beneficiary: "no",
  met_in_person: "yes",
  met_in_person_description: "We met in Rio de Janeiro in December 2025 for 10 days.",
  used_imb: "no",
  consulate_city: "Rio de Janeiro",
  consulate_country: "Brazil",
  protection_order: "no",
  crime_domestic: "no",
  crime_violent: "no",
  crime_substance: "no",
  pet_ethnicity: "not_hispanic",
  pet_race_white: true,
  pet_height_feet: "5",
  pet_height_inches: "10",
  pet_weight: 175,
  pet_eye_color: "brown",
  pet_hair_color: "brown",
  pet_ever_arrested: "no",
  pet_daytime_phone: "3055551234",
  pet_email: "john@example.com",
};

async function fillAndReload(answers: Answers) {
  const bytes = await fillPdf(I129F, answers);
  const doc = await PDFDocument.load(bytes);
  return doc.getForm();
}

describe("I-129F fill", () => {
  it("writes the petitioner's and beneficiary's names in their own parts", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[0].Pt1Line6a_FamilyName[0]").getText()).toBe("Johnson");
    expect(form.getTextField("form1[0].#subform[3].Pt2Line1a_FamilyName[0]").getText()).toBe("Silva");
  });

  it("checks single marital status for both petitioner and beneficiary", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[2].Pt1Line23_Checkbox[2]").isChecked()).toBe(true); // pet single
    expect(form.getCheckBox("form1[0].#subform[3].Pt2Line6_Checkboxes[2]").isChecked()).toBe(true); // ben single
  });

  it("selects the mailing-address state dropdown upper-cased", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getDropdown("form1[0].#subform[0].Pt1Line8_State[0]").getSelected()).toEqual(["FL"]);
  });

  it("formats dates as USCIS mm/dd/yyyy", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[2].Pt1Line22_DateofBirth[0]").getText()).toBe("04/20/1988");
    expect(form.getTextField("form1[0].#subform[3].Pt2Line4_DateOfBirth[0]").getText()).toBe("03/15/1992");
  });

  it("checks the citizenship-via-birth box", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[2].Pt1Line40_Checkbox[0]").isChecked()).toBe(true);
  });

  it("marks the beneficiary as never in the US and skips entry fields", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[5].Pt2Line37_Checkboxes[1]").isChecked()).toBe(true); // no
    expect(form.getTextField("form1[0].#subform[5].Pt2Line38a_LastArrivedAs[0]").getText()).toBeFalsy();
  });

  it("fills the beneficiary's US intended address and abroad address", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[6].Pt2Line45a_StreetNumberName[0]").getText()).toBe(
      "742 Evergreen Ter"
    );
    expect(form.getTextField("form1[0].#subform[6].Pt2Line47_Country[0]").getText()).toBe("Brazil");
  });

  it("checks met-in-person yes and fills the description", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[7].Pt2Line53_Checkboxes[0]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[7].Pt2Line54_Describe[0]").getText()).toBe(
      "We met in Rio de Janeiro in December 2025 for 10 days."
    );
  });

  it("checks no on all IMBRA criminal-history questions", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[7].Pt3Line1_Checkboxes[1]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[7].P3Line2a_Checkboxes[1]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[8].P3Line2b_Checkboxes[1]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[8].P3Line2c_Checkboxes[1]").isChecked()).toBe(true);
  });

  it("fills biographics (weight split, height dropdowns, ethnicity)", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[8].Pt4Line1_Checkbox[0]").isChecked()).toBe(true); // not hispanic
    expect(form.getDropdown("form1[0].#subform[8].Pt4Line3_HeightFeet[0]").getSelected()).toEqual(["5"]);
    expect(form.getTextField("form1[0].#subform[8].Pt4Line4_HeightInches1[0]").getText()).toBe("1");
    expect(form.getTextField("form1[0].#subform[8].Pt4Line4_HeightInches2[0]").getText()).toBe("7");
    expect(form.getTextField("form1[0].#subform[8].Pt4Line4_HeightInches3[0]").getText()).toBe("5");
    expect(form.getCheckBox("form1[0].#subform[8].Pt4Line5_Checkbox[6]").isChecked()).toBe(true); // brown eyes
  });

  it("fills petitioner contact and leaves signature/interpreter/preparer blank", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[9].Pt5Line3_Email[0]").getText()).toBe("john@example.com");
    expect(form.getTextField("form1[0].#subform[9].Pt6Line1_InterpreterFamilyName[0]").getText()).toBeFalsy();
    expect(form.getTextField("form1[0].#subform[9].Pt7Line1_PreparerFamilyName[0]").getText()).toBeFalsy();
  });
});
