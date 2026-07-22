import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { I90 } from "./i-90";
import { fillPdf } from "./fillPdf";
import type { Answers } from "./types";

// Marcos, a lawful permanent resident whose green card is expiring in the
// next 6 months and wants a replacement with the same biographic info.
const ANSWERS: Answers = {
  a_number: "987654321",
  uscis_account: "1234567890",
  family_name: "Souza",
  given_name: "Marcos",
  middle_name: "",
  name_changed: "no",
  mail_street: "500 Brickell Ave",
  mail_unit_type: "apt",
  mail_unit_number: "12B",
  mail_city: "Miami",
  mail_state: "fl",
  mail_zip: "33131",
  mail_country: "United States",
  sex: "male",
  dob: "1988-06-20",
  birth_city: "Curitiba",
  birth_country: "Brazil",
  class_of_admission: "IR1",
  date_of_admission: "2019-04-10",
  ssn: "555443333",
  status: "lpr",
  reason_a: "expiring_6mo",
  ever_removal_proceedings: "no",
  ever_abandoned_status: "no",
  ethnicity: "not_hispanic",
  race_white: true,
  height_feet: "5",
  height_inches: "9",
  weight: 175,
  eye_color: "brown",
  hair_color: "black",
  requesting_accommodation: "no",
  language_ability: "english",
  daytime_phone: "7865551234",
  email: "marcos@example.com",
};

async function fillAndReload(answers: Answers) {
  const bytes = await fillPdf(I90, answers);
  const doc = await PDFDocument.load(bytes);
  return doc.getForm();
}

describe("I-90 fill", () => {
  it("writes the A-Number and name on Part 1", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[0].#area[1].P1_Line1_AlienNumber[0]").getText()).toBe(
      "987654321"
    );
    expect(form.getTextField("form1[0].#subform[0].P1_Line3a_FamilyName[0]").getText()).toBe("Souza");
    expect(form.getTextField("form1[0].#subform[0].P1_Line3b_GivenName[0]").getText()).toBe("Marcos");
  });

  it("checks 'name not changed' and leaves the prior-name fields blank", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[0].P1_checkbox4[1]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[0].P1_checkbox4[0]").isChecked()).toBe(false);
    expect(form.getTextField("form1[0].#subform[0].P1_Line5a_FamilyName[0]").getText()).toBeFalsy();
  });

  it("fills the prior name when a name change happened, and checks 'yes'", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      name_changed: "yes",
      prior_family_name: "Silva",
      prior_given_name: "Marcos",
    });
    expect(form.getCheckBox("form1[0].#subform[0].P1_checkbox4[0]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[0].P1_Line5a_FamilyName[0]").getText()).toBe("Silva");
    expect(form.getTextField("form1[0].#subform[0].P1_Line5b_GivenName[0]").getText()).toBe("Marcos");
  });

  it("fills the mailing address with unit type and the state dropdown upper-cased", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[0].P1_Line6b_StreetNumberName[0]").getText()).toBe(
      "500 Brickell Ave"
    );
    expect(form.getCheckBox("form1[0].#subform[0].P1_checkbox6c_Unit[0]").isChecked()).toBe(true); // apt
    expect(form.getTextField("form1[0].#subform[0].P1_Line6c_AptSteFlrNumber[0]").getText()).toBe("12B");
    expect(form.getDropdown("form1[0].#subform[0].P1_Line6e_State[0]").getSelected()).toEqual(["FL"]);
  });

  it("checks Male and formats DOB and date of admission", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[1].P1_Line8_male[0]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[1].P1_Line8_female[0]").isChecked()).toBe(false);
    expect(form.getTextField("form1[0].#subform[1].P1_Line9_DateOfBirth[0]").getText()).toBe("06/20/1988");
    expect(form.getTextField("form1[0].#subform[1].P1_Line15_DateOfAdmission[0]").getText()).toBe(
      "04/10/2019"
    );
  });

  it("checks LPR status and the matching reason (expiring within 6 months)", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[1].P2_checkbox1[0]").isChecked()).toBe(true); // lpr
    expect(form.getCheckBox("form1[0].#subform[1].P2_checkbox1[2]").isChecked()).toBe(false); // conditional
    expect(form.getCheckBox("form1[0].#subform[1].P2_checkbox2[1]").isChecked()).toBe(true); // expiring_6mo
  });

  it("shows the LPR/commuter reason list for a commuter status too (array showWhen)", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      status: "commuter",
      reason_a: "resident_taking_commuter",
      reason_a_poe: "Laredo, TX",
    });
    expect(form.getCheckBox("form1[0].#subform[1].P2_checkbox1[1]").isChecked()).toBe(true); // commuter
    expect(form.getCheckBox("form1[0].#subform[1].P2_checkbox2[11]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[1].P2_Line2h1_CityandState[0]").getText()).toBe(
      "Laredo, TX"
    );
  });

  it("switches to the conditional-resident reason list and skips the LPR one", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      status: "conditional",
      reason_a: null,
      reason_b: "mutilated",
    });
    expect(form.getCheckBox("form1[0].#subform[1].P2_checkbox1[2]").isChecked()).toBe(true); // conditional
    expect(form.getCheckBox("form1[0].#subform[2].P2_checkbox3[1]").isChecked()).toBe(true); // mutilated
    // reason_a is hidden for conditional status, so its checkbox stays unchecked.
    expect(form.getCheckBox("form1[0].#subform[1].P2_checkbox2[1]").isChecked()).toBe(false);
  });

  it("answers the removal-proceedings and abandoned-status screening questions", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[2].P3_checkbox4[0]").isChecked()).toBe(true); // no proceedings
    expect(form.getCheckBox("form1[0].#subform[2].P3_checkbox5[0]").isChecked()).toBe(true); // no abandonment
  });

  it("fills biographics: ethnicity, race, height/weight, eyes and hair", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[2].P3_checkbox6[0]").isChecked()).toBe(true); // not hispanic
    expect(form.getCheckBox("form1[0].#subform[2].P3_checkbox7_White[0]").isChecked()).toBe(true);
    expect(form.getDropdown("form1[0].#subform[2].P3_Line8_HeightFeet[0]").getSelected()).toEqual(["5"]);
    expect(form.getTextField("form1[0].#subform[2].P3_Line9_HeightInches1[0]").getText()).toBe("1");
    expect(form.getCheckBox("form1[0].#subform[2].P3_checkbox10[5]").isChecked()).toBe(true); // brown eyes
    expect(form.getCheckBox("form1[0].#subform[2].P3_checkbox11[8]").isChecked()).toBe(true); // black hair
  });

  it("leaves the accommodation section blank when none is requested", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[2].P4_checkbox1[0]").isChecked()).toBe(true); // no
    expect(form.getCheckBox("form1[0].#subform[2].P4_checkbox1a[0]").isChecked()).toBe(false);
  });

  it("checks the requested accommodations when the applicant asks for one", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      requesting_accommodation: "yes",
      accommodation_deaf: true,
      accommodation_deaf_language: "American Sign Language",
      accommodation_blind: true,
      accommodation_blind_detail: "Large-print notice",
    });
    expect(form.getCheckBox("form1[0].#subform[2].P4_checkbox1[1]").isChecked()).toBe(true); // yes
    expect(form.getCheckBox("form1[0].#subform[2].P4_checkbox1a[0]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[2].P4_Line1a_AccomodationRequested[0]").getText()).toBe(
      "American Sign Language"
    );
    expect(form.getCheckBox("form1[0].#subform[3].P4_checkbox1b[0]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[3].P4_Line1b_AccomodationRequested[0]").getText()).toBe(
      "Large-print notice"
    );
  });

  it("declares English understanding and fills contact info, leaving signature blank", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[3].P5_Checkbox1a[0]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[3].P5_Checkbox1b[0]").isChecked()).toBe(false);
    expect(form.getTextField("form1[0].#subform[3].P5_Line5_EmailAddress[0]").getText()).toBe(
      "marcos@example.com"
    );
  });

  it("switches to interpreter declaration and fills the interpreter's language", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      language_ability: "interpreter",
      interpreter_language: "Portuguese",
    });
    expect(form.getCheckBox("form1[0].#subform[3].P5_Checkbox1b[0]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[3].P5_Line1b_Language[0]").getText()).toBe("Portuguese");
  });
});
