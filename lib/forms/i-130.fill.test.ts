import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { I130 } from "./i-130";
import { fillPdf } from "./fillPdf";
import type { Answers } from "./types";

// A US-citizen petitioner in Florida filing for their Brazilian spouse who
// lives in Brazil (the familia-ir consular flow).
const ANSWERS: Answers = {
  relationship: "spouse",
  status_through_adoption: "no",
  pet_family_name: "Johnson",
  pet_given_name: "Mary",
  pet_ssn: "123456789",
  pet_birth_city: "Orlando",
  pet_birth_country: "United States",
  pet_dob: "1990-06-01",
  pet_sex: "female",
  pet_mail_street: "742 Evergreen Ter",
  pet_mail_city: "Miami",
  pet_mail_state: "fl", // lower-case on purpose: upper-cased for the dropdown
  pet_mail_zip: "33101",
  pet_mail_country: "United States",
  pet_mail_same_as_physical: "yes",
  pet_phys_date_from: "2021-02-01",
  pet_marriage_count: 1,
  pet_marital_status: "married",
  pet_marriage_date: "2025-11-20",
  pet_marriage_city: "Sao Paulo",
  pet_marriage_country: "Brazil",
  pet_spouse1_family: "Silva",
  pet_spouse1_given: "Ana",
  pet_parent1_family: "Johnson",
  pet_parent1_given: "Robert",
  pet_parent1_birth_country: "United States",
  pet_parent2_family: "Johnson",
  pet_parent2_given: "Susan",
  pet_parent2_birth_country: "United States",
  pet_status: "citizen",
  pet_citizenship_via: "birth",
  pet_has_certificate: "no",
  pet_employer_name: "Acme Corp",
  pet_occupation: "Engineer",
  pet_ethnicity: "not_hispanic",
  pet_race_white: true,
  pet_height_feet: "5",
  pet_height_inches: "7",
  pet_weight: 154,
  pet_eye_color: "brown",
  pet_hair_color: "brown",
  ben_family_name: "Silva",
  ben_given_name: "Ana",
  ben_birth_city: "Sao Paulo",
  ben_birth_country: "Brazil",
  ben_dob: "1992-03-15",
  ben_sex: "female",
  ben_prior_petition: "no",
  ben_phys_street: "Rua das Flores 100",
  ben_phys_city: "Sao Paulo",
  ben_phys_province: "Sao Paulo",
  ben_phys_postal: "01000-000",
  ben_phys_country: "Brazil",
  ben_us_street: "SAME",
  ben_abroad_street: "SAME",
  ben_marriage_count: 1,
  ben_marital_status: "married",
  ben_marriage_date: "2025-11-20",
  ben_marriage_city: "Sao Paulo",
  ben_marriage_country: "Brazil",
  ben_spouse_family: "Johnson",
  ben_spouse_given: "Mary",
  ben_ever_in_us: "yes",
  ben_in_us_now: "no",
  ben_passport_number: "AB123456",
  ben_passport_country: "Brazil",
  ben_passport_expiry: "2030-12-01",
  ben_employer_name: "Padaria Estrela",
  ben_in_proceedings: "no",
  lived_together_street: "Rua das Flores 100",
  lived_together_city: "Sao Paulo",
  lived_together_country: "Brazil",
  processing_venue: "consular",
  consulate_city: "Rio de Janeiro",
  consulate_province: "Rio de Janeiro",
  consulate_country: "Brazil",
  pet_prior_filed: "no",
  pet_daytime_phone: "3055551234",
  pet_email: "mary@example.com",
};

async function fillAndReload(answers: Answers) {
  const bytes = await fillPdf(I130, answers);
  const doc = await PDFDocument.load(bytes);
  return doc.getForm();
}

describe("I-130 fill", () => {
  it("checks the Spouse relationship box", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[0].Pt1Line1_Spouse[0]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[0].Pt1Line1_Parent[0]").isChecked()).toBe(false);
  });

  it("writes the petitioner's and beneficiary's names in their own parts", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[0].Pt2Line4a_FamilyName[0]").getText()).toBe("Johnson");
    expect(form.getTextField("form1[0].#subform[4].Pt4Line4a_FamilyName[0]").getText()).toBe("Silva");
  });

  it("marks the petitioner as a US citizen acquired by birth", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[2].Pt2Line36_USCitizen[0]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[2].Pt2Line23a_checkbox[0]").isChecked()).toBe(true);
  });

  it("fills LPR items instead when the petitioner has a green card", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      pet_status: "lpr",
      pet_citizenship_via: "",
      pet_has_certificate: "",
      pet_lpr_class: "IR6",
      pet_lpr_date: "2020-05-10",
      pet_lpr_via_marriage: "no",
    });
    expect(form.getCheckBox("form1[0].#subform[2].Pt2Line36_LPR[0]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[3].Pt2Line40a_ClassOfAdmission[0]").getText()).toBe("IR6");
    expect(form.getCheckBox("form1[0].#subform[3].Pt2Line41_No[0]").isChecked()).toBe(true);
    // citizen-only boxes stay untouched
    expect(form.getCheckBox("form1[0].#subform[2].Pt2Line23a_checkbox[0]").isChecked()).toBe(false);
  });

  it("selects the mailing-address state dropdown upper-cased", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getDropdown("form1[0].#subform[1].Pt2Line10_State[0]").getSelected()).toEqual(["FL"]);
  });

  it("formats dates as USCIS mm/dd/yyyy", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[1].Pt2Line8_DateofBirth[0]").getText()).toBe("06/01/1990");
    expect(form.getTextField("form1[0].#subform[4].Pt4Line9_DateOfBirth[0]").getText()).toBe("03/15/1992");
    expect(form.getTextField("form1[0].#subform[2].Pt2Line18_DateOfMarriage[0]").getText()).toBe("11/20/2025");
  });

  it("splits the weight across the three single-digit boxes", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[3].Pt3Line4_Pound1[0]").getText()).toBe("1");
    expect(form.getTextField("form1[0].#subform[3].Pt3Line4_Pound2[0]").getText()).toBe("5");
    expect(form.getTextField("form1[0].#subform[3].Pt3Line4_Pound3[0]").getText()).toBe("4");
  });

  it("selects height on the feet/inches dropdowns and checks biographics", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getDropdown("form1[0].#subform[3].Pt3Line3_HeightFeet[0]").getSelected()).toEqual(["5"]);
    expect(form.getDropdown("form1[0].#subform[3].Pt3Line3_HeightInches[0]").getSelected()).toEqual(["7"]);
    expect(form.getCheckBox("form1[0].#subform[3].Pt3Line2_Race_White[0]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[3].Pt3Line5_EyeColor[1]").isChecked()).toBe(true); // brown
    expect(form.getCheckBox("form1[0].#subform[4].Pt3Line6_HairColor[3]").isChecked()).toBe(true); // brown
  });

  it("fills the consular venue and skips the adjustment office", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[7].Pt4Line61a_CityOrTown[0]").getText()).toBe("Rio de Janeiro");
    expect(form.getTextField("form1[0].#subform[7].Pt4Line61c_Country[0]").getText()).toBe("Brazil");
    expect(form.getTextField("form1[0].#subform[7].Pt4Line60a_CityOrTown[0]").getText()).toBeFalsy();
  });

  it("omits entry fields when the beneficiary is not in the US", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[6].#area[8].Pt4Line21b_ArrivalDeparture[0]").getText()).toBeFalsy();
    expect(form.getCheckBox("form1[0].#subform[6].Pt4Line20_Yes[0]").isChecked()).toBe(true);
  });

  it("fills entry fields (class dropdown, I-94) when the beneficiary is in the US", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      ben_in_us_now: "yes",
      ben_class_of_admission: "b2",
      ben_i94_number: "12345678901",
      ben_arrival_date: "2026-01-10",
      ben_stay_expiry: "07/09/2026",
    });
    expect(form.getDropdown("form1[0].#subform[6].Pt4Line21a_ClassOfAdmission[0]").getSelected()).toEqual([
      "B2 - TEMPORARY VISITOR FOR PLEASURE",
    ]);
    expect(form.getTextField("form1[0].#subform[6].#area[8].Pt4Line21b_ArrivalDeparture[0]").getText()).toBe(
      "12345678901"
    );
  });

  it("writes the last address lived together for spouse petitions", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[7].Pt4Line57_StreetNumberName[0]").getText()).toBe(
      "Rua das Flores 100"
    );
  });

  it("checks 'No' on prior petitions and fills the petitioner contact", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[7].Part4Line1_No[0]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[8].Pt6Line5_Email[0]").getText()).toBe("mary@example.com");
  });
});
