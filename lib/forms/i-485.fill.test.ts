import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { PDFDocument } from "pdf-lib";
import { I485 } from "./i-485";
import { fillPdf } from "./fillPdf";
import { allQuestions, type Answers } from "./types";

// Ana, the Brazilian spouse of a US citizen, adjusting status from inside the
// US after a B-2 entry (the overstay-with-family-ties path).
const ANSWERS: Answers = {
  a_number: "123456789",
  has_a_number: "yes",
  other_a_number: "no",
  family_name: "Silva",
  given_name: "Ana",
  other_family_name: "Souza",
  dob: "1992-03-15",
  other_dob: "no",
  sex: "female",
  birth_city: "Sao Paulo",
  birth_country: "Brazil",
  citizenship_country: "Brazil",
  passport_number: "AB123456",
  passport_expiry: "2030-12-01",
  passport_country: "Brazil",
  arrival_city: "Miami",
  arrival_state: "fl",
  arrival_date: "2024-01-10",
  entry_manner: "admitted",
  admitted_as: "B-2 visitor",
  i94_number: "12345678901",
  i94_expiry: "07/09/2024",
  i94_status: "B2",
  first_time_in_us: "yes",
  crewman_visa: "no",
  arrived_as_crewman: "no",
  us_street: "742 Evergreen Ter",
  us_city: "Miami",
  us_state: "FL",
  us_zip: "33101",
  us_since: "2024-01-15",
  mail_same: "yes",
  five_years_same_address: "no",
  prior_street: "Rua das Flores 100",
  prior_city: "Sao Paulo",
  prior_province: "Sao Paulo",
  prior_country: "Brazil",
  prior_from: "2019-01-01",
  prior_to: "2024-01-09",
  abroad_street: "Rua das Flores 100",
  abroad_city: "Sao Paulo",
  abroad_province: "Sao Paulo",
  abroad_country: "Brazil",
  has_ssn_card: "no",
  want_ssn_card: "yes",
  ssa_consent: "yes",
  in_removal: "no",
  receipt_number: "IOE0123456789",
  applicant_type: "principal",
  category: "spouse_usc",
  prior_visa_abroad: "no",
  prior_permanent_residence: "no",
  lpr_rescinded: "no",
  employer1_name: "Unemployed",
  employer1_occupation: "Homemaker - supported by spouse",
  parent1_family: "Silva",
  parent1_given: "Jose",
  parent2_family: "Souza",
  parent2_given: "Maria",
  marital_status: "married",
  spouse_military: "no",
  times_married: 1,
  spouse_family_name: "Johnson",
  spouse_given_name: "Mary",
  spouse_dob: "1990-06-01",
  spouse_birth_country: "United States",
  marriage_city: "Miami",
  marriage_state_province: "Florida",
  marriage_country: "United States",
  marriage_date: "2025-11-20",
  spouse_applying_too: "no",
  total_children: 0,
  ethnicity: "hispanic",
  race_white: true,
  height_feet: "5",
  height_inches: "4",
  weight: 128,
  eye_color: "brown",
  hair_color: "brown",
  // Part 9: Ana's real profile — overstayed a B-2, worked without
  // authorization; everything else is "no".
  ...Object.fromEntries(
    [
      "p9_orgs", "p9_10", "p9_11", "p9_14", "p9_15", "p9_16", "p9_17", "p9_18",
      "p9_19", "p9_22", "p9_23", "p9_24", "p9_25", "p9_26", "p9_27", "p9_28",
      "p9_30", "p9_31", "p9_32", "p9_33", "p9_34", "p9_35a", "p9_36", "p9_37",
      "p9_38", "p9_39", "p9_41", "p9_42a", "p9_42b", "p9_42c", "p9_42d",
      "p9_43a", "p9_43b", "p9_43c", "p9_43d", "p9_43e", "p9_43f", "p9_43g",
      "p9_43h", "p9_43i", "p9_44", "p9_45", "p9_46", "p9_47", "p9_48", "p9_49",
      "p9_50", "p9_51", "p9_52", "p9_53a", "p9_53b", "p9_53c", "p9_53d",
      "p9_54", "p9_55", "p9_63", "p9_64", "p9_67", "p9_68", "p9_69", "p9_70",
      "p9_71", "p9_72", "p9_73", "p9_74", "p9_75", "p9_77", "p9_78a", "p9_78b",
      "p9_79", "p9_80", "p9_81", "p9_82", "p9_83", "p9_84a", "p9_84b",
      "p9_84c", "p9_85",
    ].map((id) => [id, "no"])
  ),
  p9_12: "yes", // worked without authorization
  p9_13: "yes", // violated nonimmigrant status (overstay)
  p9_76: "yes", // unlawfully present since Apr 1997
  p9_56_exempt: "not_exempt",
  p9_57_household: 2,
  p9_58_income: "b1",
  p9_59_assets: "a0",
  p9_60_liabilities: "l0",
  p9_61_education: "hs",
  p9_62_certs: "None",
  daytime_phone: "3055551234",
  email: "ana@example.com",
};

async function fillAndReload(answers: Answers) {
  const bytes = await fillPdf(I485, answers);
  const doc = await PDFDocument.load(bytes);
  return doc.getForm();
}

// USCIS rejects the 01/20/25 edition starting 09/18/26 with no grace period
// (lib/forms/editionSwitch.ts). Real wall-clock time is now past that date,
// so this block pins the clock before the cutoff — without it these tests
// silently switch to the new PDF and fail on the old edition's field names
// (same pin the I-539 suite uses; see the new-edition block below).
//
// The I-485 is a 24-page PDF — each fill/save round-trip takes seconds.
describe("I-485 fill", { timeout: 30_000 }, () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-01T12:00:00-04:00"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("usa a edição e o asset antigos", () => {
    expect(I485.edition).toBe("01/20/25");
    expect(I485.pdfAssetPath).toBe("forms/i-485.pdf");
  });

  it("replicates the A-Number into every page header (24 pages)", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[0].AlienNumber[0]").getText()).toBe("123456789");
    expect(form.getTextField("form1[0].#subform[12].AlienNumber[12]").getText()).toBe("123456789");
    expect(form.getTextField("form1[0].#subform[20].AlienNumber[19]").getText()).toBe("123456789");
    expect(form.getTextField("form1[0].#subform[24].AlienNumber[23]").getText()).toBe("123456789");
  });

  it("writes the applicant's name on page 1 and the Part 14 header", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[0].Pt1Line1_FamilyName[0]").getText()).toBe("Silva");
    expect(form.getTextField("form1[0].#subform[24].Pt1Line1_FamilyName[1]").getText()).toBe("Silva");
  });

  it("checks admitted entry, fills the class and I-94 details", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[1].Pt2Line11_CB[0]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[1].Pt2Line11_CB[2]").isChecked()).toBe(false);
    expect(form.getTextField("form1[0].#subform[1].Pt1Line11_Admitted[0]").getText()).toBe("B-2 visitor");
    expect(form.getTextField("form1[0].#subform[2].P1Line12_I94[0]").getText()).toBe("12345678901");
    expect(form.getTextField("form1[0].#subform[2].Pt1Line12_Date[0]").getText()).toBe("07/09/2024");
  });

  it("selects the arrival and address state dropdowns upper-cased", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getDropdown("form1[0].#subform[1].Pt1Line10_State[0]").getSelected()).toEqual(["FL"]);
    expect(form.getDropdown("form1[0].#subform[2].Pt1Line18_State[0]").getSelected()).toEqual(["FL"]);
  });

  it("fills prior and abroad addresses when not 5 years at current address", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[3].Pt1Line18_last5yrs_YN[1]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[3].Pt1Line18_PriorStreetName[0]").getText()).toBe(
      "Rua das Flores 100"
    );
    expect(form.getTextField("form1[0].#subform[3].Pt1Line18_RecentCountry[0]").getText()).toBe("Brazil");
  });

  it("answers the SSA card questions", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[3].Pt1Line19_YN[0]").isChecked()).toBe(true); // never issued
    expect(form.getCheckBox("form1[0].#subform[3].Pt1Line19_SSA_YN[0]").isChecked()).toBe(true); // wants card
    expect(form.getCheckBox("form1[0].#subform[3].Pt1Line19_Consent_YN[0]").isChecked()).toBe(true);
  });

  it("checks the spouse-of-USC category and principal applicant", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[4].Pt2Line2_CB[0]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[4].Pt2Line3a_CB[0]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[4].Pt2Line3a_CB[9]").isChecked()).toBe(false);
    expect(form.getTextField("form1[0].#subform[4].Pt2Line2_Receipt[0]").getText()).toBe("IOE0123456789");
  });

  it("checks the LPR-spouse category variant", async () => {
    const form = await fillAndReload({ ...ANSWERS, category: "spouse_lpr" });
    expect(form.getCheckBox("form1[0].#subform[4].Pt2Line3a_CB[9]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[4].Pt2Line3a_CB[0]").isChecked()).toBe(false);
  });

  it("fills the marital block including the scrambled spouse DOB/marriage-date fields", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[9].Pt6Line1_MaritalStatus[3]").isChecked()).toBe(true); // married
    expect(form.getTextField("form1[0].#subform[9].Pt6Line4_FamilyName[0]").getText()).toBe("Johnson");
    expect(form.getTextField("form1[0].#subform[9].Pt5Line8_DateofBirth[1]").getText()).toBe("06/01/1990");
    expect(form.getTextField("form1[0].#subform[10].Pt5Line8_DateofBirth[2]").getText()).toBe("11/20/2025");
    expect(form.getTextField("form1[0].#subform[10].Pt6Line10_Country[0]").getText()).toBe("United States");
  });

  it("fills biographics (weight split, height dropdowns, hispanic ethnicity)", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[12].Pt7Line1_Ethnicity[0]").isChecked()).toBe(true);
    expect(form.getDropdown("form1[0].#subform[12].Pt7Line3_HeightFeet[0]").getSelected()).toEqual(["5"]);
    expect(form.getTextField("form1[0].#subform[12].Pt7Line4_Weight1[0]").getText()).toBe("1");
    expect(form.getTextField("form1[0].#subform[12].Pt7Line4_Weight2[0]").getText()).toBe("2");
    expect(form.getTextField("form1[0].#subform[12].Pt7Line4_Weight3[0]").getText()).toBe("8");
    expect(form.getCheckBox("form1[0].#subform[12].Pt7Line5_Eyecolor[2]").isChecked()).toBe(true); // brown
    expect(form.getCheckBox("form1[0].#subform[12].Pt7Line6_Haircolor[3]").isChecked()).toBe(true); // brown
  });

  it("answers Part 9 immigration-history items, including the swapped-index ones", async () => {
    const form = await fillAndReload(ANSWERS);
    // Item 12 (worked without authorization) = YES → [0]; item 13 (violated
    // status) = YES → [1] (this pair has inverted indexes on the PDF).
    expect(form.getCheckBox("form1[0].#subform[13].Pt9Line12_YesNo[0]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[13].Pt8Line13_YesNo[1]").isChecked()).toBe(true);
    // Item 10 (denied admission) = NO → [0]; item 11 (denied visa) = NO → [1].
    expect(form.getCheckBox("form1[0].#subform[13].Pt9Line10_YesNo[0]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[13].Pt9Line11_YesNo[1]").isChecked()).toBe(true);
    // Item 22 (ever arrested) = NO → [1].
    expect(form.getCheckBox("form1[0].#subform[13].Pt8Line22_YesNo[1]").isChecked()).toBe(true);
  });

  it("answers Part 9 criminal and security items all-no on the correct sides", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[14].Pt9Line23_YesNo[0]").isChecked()).toBe(true); // 23 no
    expect(form.getCheckBox("form1[0].#subform[14].Pt8Line35a_YesNo[1]").isChecked()).toBe(true); // 35a no
    // 42.a / 42.b — field names literally contain a dot before the letter.
    expect(form.getCheckBox("form1[0].#subform[15].Pt8Line42\\.a_YesNo[1]").isChecked()).toBe(true); // 42a no
    expect(form.getCheckBox("form1[0].#subform[15].Pt8Line42\\.b_YesNo[0]").isChecked()).toBe(true); // 42b no
    expect(form.getCheckBox("form1[0].#subform[15].Pt8Line43fYesNo[1]").isChecked()).toBe(true); // 43f no
    expect(form.getCheckBox("form1[0].#subform[16].Pt8Line52_YesNo[0]").isChecked()).toBe(true); // 52 no
    expect(form.getCheckBox("form1[0].#subform[16].Pt8Line55_YesNo[1]").isChecked()).toBe(true); // 55 no
    // Conditional 35.b stays blank when 35.a is "no".
    expect(form.getCheckBox("form1[0].#subform[14].Pt8Line35b_YesNo[0]").isChecked()).toBe(false);
    expect(form.getCheckBox("form1[0].#subform[14].Pt8Line35b_YesNo[1]").isChecked()).toBe(false);
  });

  it("fills the public-charge block (not exempt, brackets, education)", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[18].Pt9Line56_CB[23]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[18].Pt9Line57_HouseholdSize[0]").getText()).toBe("2");
    expect(form.getCheckBox("form1[0].#subform[18].Pt9Line53_CB[1]").isChecked()).toBe(true); // income b1
    expect(form.getCheckBox("form1[0].#subform[18].Pt9Line59_CB[0]").isChecked()).toBe(true); // assets a0
    expect(form.getCheckBox("form1[0].#subform[18].Pt9Line60_CB[0]").isChecked()).toBe(true); // liabilities 0
    expect(form.getCheckBox("form1[0].#subform[18].Pt9Line61_CB[2]").isChecked()).toBe(true); // high school
    expect(form.getTextField("form1[0].#subform[18].Table1[0].Row1[0].TextField1[0]").getText()).toBe("None");
    expect(form.getCheckBox("form1[0].#subform[18].Pt9Line63_YesNo[1]").isChecked()).toBe(true); // 63 no
  });

  it("answers the unlawful-presence block for the overstay profile", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[21].Pt9Line76_YesNo[1]").isChecked()).toBe(true); // 76 yes
    expect(form.getCheckBox("form1[0].#subform[21].Pt9Line77_YesNo[1]").isChecked()).toBe(true); // 77 no
    expect(form.getCheckBox("form1[0].#subform[20].Pt9Line75_YesNo[1]").isChecked()).toBe(true); // 75 no
    expect(form.getCheckBox("form1[0].#subform[20].Pt9Line69_YesNo[0]").isChecked()).toBe(true); // 69 no
    expect(form.getCheckBox("form1[0].#subform[21].Pt9Line84c_YesNo[0]").isChecked()).toBe(true); // 84c no
    // Item 86 (nationality before leaving) only applies when 85 = yes.
    expect(form.getTextField("form1[0].#subform[21].Pt9Line86_Nationality[0]").getText()).toBeFalsy();
  });

  it("fills organization details when the applicant reports one", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      p9_orgs: "yes",
      org1_name: "Sindicato dos Padeiros",
      org1_city: "Sao Paulo",
      org1_country: "Brazil",
      org1_nature: "Labor union",
      org1_involvement: "Member",
      org1_from: "2018-01-01",
      org1_to: "2023-12-31",
    });
    expect(form.getCheckBox("form1[0].#subform[12].Pt8Line1_YesNo[1]").isChecked()).toBe(true); // yes
    expect(form.getTextField("form1[0].#subform[12].Pt9Line2_Organization1[0]").getText()).toBe(
      "Sindicato dos Padeiros"
    );
    expect(form.getTextField("form1[0].#subform[12].Pt9Line4_Involvement[0]").getText()).toBe("Member");
    expect(form.getTextField("form1[0].#subform[12].Pt9Line5_DateFrom[0]").getText()).toBe("01/01/2018");
  });

  it("fills contact and leaves signature/interpreter/preparer blank", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[22].Pt3Line5_Email[0]").getText()).toBe("ana@example.com");
    expect(form.getTextField("form1[0].#subform[22].Pt3Line7a_Signature[0]").getText()).toBeFalsy();
    expect(form.getTextField("form1[0].#subform[22].Pt11Line1a_FamilyName[0]").getText()).toBeFalsy();
    expect(form.getTextField("form1[0].#subform[23].Pt12Line1_PreparerFamilyName[0]").getText()).toBeFalsy();
  });
});

// USCIS rejects the 01/20/25 edition starting 09/18/26 with no grace period
// (content/leis/formularios/i-485.md). Today's wall clock is still before
// that date, so the suite above never exercises the new edition at all —
// pin the clock explicitly here, the same lesson learned from the I-539/
// I-765 incident (see the file header of lib/forms/i-539.ts).
describe("I-485 fill — edição 09/18/26 (a partir do corte, sem período de tolerância)", { timeout: 30_000 }, () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-20T12:00:00-04:00"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("usa a nova edição e o novo asset", () => {
    expect(I485.edition).toBe("09/18/26");
    expect(I485.pdfAssetPath).toBe("forms/i-485-09-18-26.pdf");
  });

  it("replicates the A-Number into every page header under its renamed/reindexed field", async () => {
    const form = await fillAndReload(ANSWERS);
    // subform[0] and subform[1]'s header keep index 0/1; everything from
    // subform[2] onward shifts +1 to make room for the real Item 4 field
    // folded into the same name at subform[1] index 2 (see i-485.ts header).
    expect(form.getTextField("form1[0].#subform[0].Pt1Line4_AlienNumber[0]").getText()).toBe("123456789");
    expect(form.getTextField("form1[0].#subform[1].Pt1Line4_AlienNumber[1]").getText()).toBe("123456789");
    expect(form.getTextField("form1[0].#subform[12].Pt1Line4_AlienNumber[13]").getText()).toBe("123456789");
    expect(form.getTextField("form1[0].#subform[20].Pt1Line4_AlienNumber[20]").getText()).toBe("123456789");
    expect(form.getTextField("form1[0].#subform[24].Pt1Line4_AlienNumber[24]").getText()).toBe("123456789");
  });

  it("fills the real Part 1 Item 4 A-Number field, folded into the header field's name", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[1].Pt1Line4_AlienNumber[2]").getText()).toBe("123456789");
  });

  it("still fills every other unaffected field correctly on the new asset", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[0].Pt1Line1_FamilyName[0]").getText()).toBe("Silva");
    expect(form.getCheckBox("form1[0].#subform[4].Pt2Line2_CB[0]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[22].Pt3Line5_Email[0]").getText()).toBe("ana@example.com");
  });

  it("merges items 63/64 into the single, broader item 63 question", async () => {
    // p9_64 no longer exists as a question at all — the form itself dropped
    // it (folded into item 63's now-broader wording). Never re-invent a merge
    // of two answers into one field; mirror what the current form asks.
    const ids = allQuestions(I485).map((q) => q.id);
    expect(ids).toContain("p9_63");
    expect(ids).not.toContain("p9_64");

    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[18].Pt9Line63_YesNo[1]").isChecked()).toBe(true); // no (unchanged field)
  });

  it("answers item 76 on its new page (moved up from subform 21 to 20)", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[20].Pt9Line76_YesNo[1]").isChecked()).toBe(true); // 76 yes
    // Item 77 didn't move — still subform 21, unaffected by the reflow.
    expect(form.getCheckBox("form1[0].#subform[21].Pt9Line77_YesNo[1]").isChecked()).toBe(true); // 77 no
  });
});
