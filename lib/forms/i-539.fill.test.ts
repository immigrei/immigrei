import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { I539 } from "./i-539";
import { fillPdf } from "./fillPdf";
import type { Answers } from "./types";

// A representative Brazilian B-2 visitor changing status to F-1 (the COS kit).
const ANSWERS: Answers = {
  application_type: "mudanca",
  new_status: "f1",
  effective_date: "2026-09-01",
  extend_until: "2028-06-30",
  applicants: "self",
  school_name: "Miami Dade College",
  sevis_id: "N0012345678",
  family_name: "Silva",
  given_name: "Ana",
  middle_name: "",
  a_number: "",
  mail_street: "742 Evergreen Ter",
  mail_unit_type: "apt",
  mail_unit_number: "12",
  mail_city: "Miami",
  mail_state: "fl", // lower-case on purpose: must be upper-cased for the dropdown
  mail_zip: "33101",
  mail_same_as_physical: "yes",
  birth_country: "Brazil",
  citizenship_country: "Brazil",
  dob: "1998-03-15",
  last_entry_date: "2026-01-10",
  i94_number: "12345678901",
  passport_number: "AB123456",
  passport_country: "Brazil",
  passport_expiry: "2030-12-01",
  current_status: "b2",
  status_expiry_kind: "date",
  status_expiry_date: "2026-07-09",
  based_on_family_grant: "no",
  separate_petition: "no",
  passport_changed: "no",
  abroad_street: "Rua das Flores 100",
  abroad_city: "Sao Paulo",
  abroad_province: "Sao Paulo",
  abroad_postal: "01000-000",
  abroad_country: "Brazil",
  q3_immigrant_visa: "no",
  q4_immigrant_petition: "no",
  q5_i485: "no",
  q6_arrested: "no",
  q7a_torture: "no",
  q7b_killing: "no",
  q7c_injuring: "no",
  q7d_sexual_contact: "no",
  q7e_religious_freedom: "no",
  q8a_armed_group: "no",
  q8b_detention_facility: "no",
  q9_weapons_group: "no",
  q10_weapons_transport: "no",
  q11_weapons_training: "no",
  q12_removal: "no",
  q13_violated_status: "no",
  q14_employed: "no",
  q15_j_visitor: "no",
  additional_info: "I am supported by personal savings; bank statements attached.",
  daytime_phone: "3055551234",
  email: "ana@example.com",
};

async function fillAndReload(answers: Answers) {
  const bytes = await fillPdf(I539, answers);
  const doc = await PDFDocument.load(bytes);
  return doc.getForm();
}

describe("I-539 fill", () => {
  it("writes the applicant's name on page 1 and the Part 8 header", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[0].P1Line1a_FamilyName[0]").getText()).toBe("Silva");
    expect(form.getTextField("form1[0].#subform[6].P1Line1a_FamilyName[1]").getText()).toBe("Silva");
    expect(form.getTextField("form1[0].#subform[0].P1_Line1b_GivenName[0]").getText()).toBe("Ana");
  });

  it("checks change-of-status and selects the requested F-1 status", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[1].P2_checkbox[1]").isChecked()).toBe(true);
    expect(form.getDropdown("form1[0].#subform[1].Pt2Line2a_NewStatus[0]").getSelected()).toEqual([
      " F1 - STUDENT - ACADEMIC",
    ]);
  });

  it("checks extension instead when that's the application type", async () => {
    const form = await fillAndReload({ ...ANSWERS, application_type: "extensao" });
    expect(form.getCheckBox("form1[0].#subform[1].P2_checkbox[0]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[1].P2_checkbox[1]").isChecked()).toBe(false);
  });

  it("selects the current B-2 status on the Part 1 dropdown", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getDropdown("form1[0].#subform[1].Pt1Line15a_NewStatus[0]").getSelected()).toEqual([
      " B2 - TEMPORARY VISITOR FOR PLEASURE",
    ]);
  });

  it("formats dates as USCIS mm/dd/yyyy", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[1].P1_Line8_DateOfBirth[0]").getText()).toBe("03/15/1998");
    expect(form.getTextField("form1[0].#subform[1].SupA_Line1i_DateOfArrival[0]").getText()).toBe("01/10/2026");
    expect(form.getTextField("form1[0].#subform[1].P3_Line1a_DateExtended[0]").getText()).toBe("06/30/2028");
  });

  it("writes the school name and SEVIS ID onto their (mislabeled) fields", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[1].SupA_Line1k_Passport[1]").getText()).toBe("Miami Dade College");
    expect(form.getTextField("form1[0].#subform[1].SupA_Line1k_Passport[2]").getText()).toBe("N0012345678");
  });

  it("selects the US state on the mailing-address dropdown, upper-cased", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getDropdown("form1[0].#subform[0].Part2_Item11_State[0]").getSelected()).toEqual(["FL"]);
    expect(form.getCheckBox("form1[0].#subform[0].Part1_Item4_Unit[0]").isChecked()).toBe(true); // Apt.
  });

  it("fills the I-94 expiry date and leaves D/S unchecked for a dated I-94", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[1].SupA_Line1p_DateExpires[0]").getText()).toBe("07/09/2026");
    expect(form.getCheckBox("form1[0].#subform[1].P1_Checkbox12c[0]").isChecked()).toBe(false);
  });

  it("checks D/S and omits the expiry date when status is D/S", async () => {
    const form = await fillAndReload({ ...ANSWERS, status_expiry_kind: "ds", status_expiry_date: "" });
    expect(form.getCheckBox("form1[0].#subform[1].P1_Checkbox12c[0]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[1].SupA_Line1p_DateExpires[0]").getText()).toBeFalsy();
  });

  it("answers the Part 4 battery on the right yes/no boxes", async () => {
    const form = await fillAndReload({ ...ANSWERS, q15_j_visitor: "yes" });
    expect(form.getCheckBox("form1[0].#subform[2].P4_checkbox3_No[0]").isChecked()).toBe(true); // item 3
    expect(form.getCheckBox("form1[0].#subform[3].P4_checkbox19_No[0]").isChecked()).toBe(true); // item 14
    expect(form.getCheckBox("form1[0].#subform[3].P4_checkbox20_Yes[0]").isChecked()).toBe(true); // item 15
    expect(form.getCheckBox("form1[0].#subform[3].P4_checkbox20_No[0]").isChecked()).toBe(false);
  });

  it("omits current-passport fields when the passport hasn't changed", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[2].P4_Line1a_CountryOfIssuance[1]").getText()).toBeFalsy();
  });

  it("fills the address abroad and additional info", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[2].P2_Line10_Country[0]").getText()).toBe("Brazil");
    expect(form.getTextField("form1[0].#subform[6].P8_Line3_D_AdditionalInfo[0]").getText()).toContain(
      "personal savings"
    );
  });
});
