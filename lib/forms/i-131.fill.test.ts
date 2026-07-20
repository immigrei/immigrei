import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { I131 } from "./i-131";
import { fillPdf } from "./fillPdf";
import type { Answers } from "./types";

// Ana requesting advance parole to visit family in Brazil while her I-485
// (filed with her US-citizen spouse's I-130) is pending.
const ANSWERS: Answers = {
  app_type: "pending_i485",
  i485_receipt: "IOE0123456789",
  family_name: "Silva",
  given_name: "Ana",
  refugee_status: "no",
  mail_street: "742 Evergreen Ter",
  mail_city: "Miami",
  mail_state: "fl",
  mail_zip: "33101",
  mail_country: "United States",
  a_number: "123456789",
  birth_country: "Brazil",
  citizenship_country: "Brazil",
  sex: "female",
  dob: "1992-03-15",
  class_of_admission: "B2",
  i94_number: "12345678901",
  i94_expiry: "07/09/2024",
  ethnicity: "hispanic",
  race_white: true,
  height_feet: "5",
  height_inches: "4",
  weight: 128,
  eye_color: "brown",
  hair_color: "black",
  in_proceedings: "no",
  prior_reentry_permit: "no",
  prior_advance_parole: "no",
  is_replacement: "no",
  departure_date: "2026-12-15",
  trip_purpose: "Visit family in Brazil",
  countries: "Brazil",
  number_of_trips: "multiple",
  trip_length: 21,
  daytime_phone: "3055551234",
  email: "ana@example.com",
};

async function fillAndReload(answers: Answers) {
  const bytes = await fillPdf(I131, answers);
  const doc = await PDFDocument.load(bytes);
  return doc.getForm();
}

describe("I-131 fill", () => {
  it("checks the pending-I-485 advance parole box (Part 1, 5.A) with its receipt", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].P1[0].CB_AppType[4]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].P1[0].CB_AppType[0]").isChecked()).toBe(false); // reentry permit
    expect(form.getTextField("form1[0].P1[0].P1_Line5A[0]").getText()).toBe("IOE0123456789");
  });

  it("writes the name on Part 2 and the Part 13 header", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].P4[0].Part2_Line1_FamilyName[0]").getText()).toBe("Silva");
    expect(form.getTextField("form1[0].#subform[13].Part2_Line1_FamilyName[0]").getText()).toBe("Silva");
    expect(
      form.getTextField("form1[0].#subform[13].Global_ANumber[0].Part2_Line5_AlienNumber[0]").getText()
    ).toBe("123456789");
  });

  it("fills the mailing address with the state dropdown upper-cased", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].P5[0].Part2_Line3_StreetNumberName[0]").getText()).toBe(
      "742 Evergreen Ter"
    );
    expect(form.getDropdown("form1[0].P5[0].Part2_Line3_State[0]").getSelected()).toEqual(["FL"]);
  });

  it("checks Female and formats the date of birth", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].P5[0].Part2_Line8_Gender[0]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].P5[0].Part2_Line9_DateOfBirth[0]").getText()).toBe("03/15/1992");
  });

  it("fills biographics on their I-131-specific checkbox indexes", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].P7[0].P3_Line1_Ethnicity[1]").isChecked()).toBe(true); // hispanic
    expect(form.getCheckBox("form1[0].P7[0].P3_Line5_EyeColor[0]").isChecked()).toBe(true); // brown
    expect(form.getCheckBox("form1[0].P7[0].P3_Line6_HairColor[8]").isChecked()).toBe(true); // black
    expect(form.getDropdown("form1[0].P7[0].P3_Line3_HeightFeet[0]").getSelected()).toEqual(["5"]);
    expect(form.getTextField("form1[0].P7[0].P3_Line4_Pound1[0]").getText()).toBe("1");
  });

  it("answers processing history and the travel plan", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].P7[0].P4_Line1_YesNo[1]").isChecked()).toBe(true); // no proceedings
    expect(form.getCheckBox("form1[0].P7[0].P4_Line3a_YesNo[1]").isChecked()).toBe(true); // no prior AP
    expect(form.getTextField("form1[0].#subform[9].P7_Line1_DateOfDeparture[0]").getText()).toBe("12/15/2026");
    expect(form.getTextField("form1[0].#subform[9].P7_Line2_Purpose[0]").getText()).toBe(
      "Visit family in Brazil"
    );
    expect(form.getCheckBox("form1[0].#subform[9].P7_Line4_CB[1]").isChecked()).toBe(true); // multiple trips
    expect(form.getTextField("form1[0].#subform[9].P7_Line5_ExpectedLengthTrip[0]").getText()).toBe("21");
  });

  it("fills prior advance-parole details when there was one", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      prior_advance_parole: "yes",
      prior_ap_date: "2025-02-01",
      prior_ap_disposition: "Still in my possession",
    });
    expect(form.getCheckBox("form1[0].P7[0].P4_Line3a_YesNo[0]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].P7[0].P4_Line3b_DateIssued[0]").getText()).toBe("02/01/2025");
  });

  it("fills contact and leaves signature/interpreter/preparer blank", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[10].Part10_Line3_Email[0]").getText()).toBe("ana@example.com");
    expect(form.getTextField("form1[0].#subform[10].Part10_Line4_ApplicantSignature[0]").getText()).toBeFalsy();
    expect(
      form.getTextField("form1[0].#subform[11].Part11_Line1_InterpreterFamilyName[0]").getText()
    ).toBeFalsy();
    expect(form.getTextField("form1[0].#subform[12].Part12_Line1_FamilyName[0]").getText()).toBeFalsy();
  });
});
