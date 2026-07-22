import { describe, it, expect } from "vitest";
import { PDFDocument, type PDFForm } from "pdf-lib";
import { N400 } from "./n-400";
import { fillPdf } from "./fillPdf";
import type { Answers } from "./types";

const F = "form1[0].";
const S5 = `${F}#subform[5].`;
const S6 = `${F}#subform[6].`;
const S7 = `${F}#subform[7].`;
const S8 = `${F}#subform[8].`;
const S9 = `${F}#subform[9].`;

// Beatriz, a green-card holder for 6 years, naturalizing under the general
// 5-year rule. Clean record: every Part 9 Yes/No question answers "no" except
// where a "yes" is needed to exercise a conditional branch (marked below).
const ANSWERS: Answers = {
  // Part 1 — eligibility
  eligibility_basis: "general",
  a_number: "876543219",

  // Part 2 — name
  family_name: "Alves",
  given_name: "Beatriz",
  middle_name: "",
  wants_name_change: "no",

  // Part 2 — personal data
  sex: "female",
  dob: "1985-11-02",
  birth_country: "Brazil",
  citizenship_country: "Brazil",
  date_became_lpr: "2019-05-14",
  parent_us_citizen_before_18: "no",
  disability_exception: "no",
  ssn_update: "no",

  // Part 3 — residence
  phys1_street: "800 Ocean Dr",
  phys1_city: "Miami Beach",
  phys1_state: "FL",
  phys1_zip: "33139",
  phys1_country: "United States",
  phys1_from: "2021-01-10",
  mail_street: "800 Ocean Dr",
  mail_city: "Miami Beach",
  mail_state: "fl",
  mail_zip: "33139",
  mail_country: "United States",

  // Part 4 — biographic
  ethnicity: "not_hispanic",
  race_white: true,
  height_feet: "5",
  height_inches: "5",
  weight: 140,
  eye_color: "brown",
  hair_color: "black",

  // Part 5 — employment
  job1_name: "Sunrise Marketing LLC",
  job1_city: "Miami",
  job1_state: "FL",
  job1_country: "United States",
  job1_occupation: "Marketing Manager",
  job1_from: "2021-02-01",

  // Part 7 — marital history
  marital_status: "married",
  times_married: 1,
  spouse_military: "no",
  spouse_family_name: "Alves",
  spouse_given_name: "Thiago",
  spouse_dob: "1983-04-18",
  marriage_date: "2015-09-12",
  spouse_a_number: "876543100",
  spouse_same_address: "yes",
  spouse_times_married: 1,
  spouse_employer: "Bay Logistics Inc",
  spouse_is_citizen: "yes",
  spouse_citizen_since: "other",
  spouse_citizen_date: "2010-06-01",

  // Part 8 — travel (leave blank; not required)

  // Part 9 — eligibility/moral-character screening, all "no" except gates
  claimed_us_citizen: "no",
  voted_in_us: "no",
  owes_taxes: "no",
  claimed_nonresident_tax: "no",
  communist_party_member: "no",
  subversive_group_member: "no",
  group_weapon_harm: "no",
  group_kidnap_hijack: "no",
  threatened_or_planned_above: "no",
  torture: "no",
  genocide: "no",
  killing: "no",
  severe_injury: "no",
  nonconsensual_sexual_contact: "no",
  religious_persecution: "no",
  harm_based_on_group: "no",
  armed_group_member: "no",
  group_used_weapon_against_person: "no",
  personally_used_weapon: "no",
  personally_threatened_weapon: "no",
  detained_people: "no",
  sold_transported_weapons: "no",
  weapons_training: "no",
  recruited_child_soldiers: "no",
  used_child_in_hostilities: "no",
  committed_uncharged_crime: "no",
  ever_arrested_or_charged: "no",
  completed_sentence: "no",
  prostitution: "no",
  drug_trafficking: "no",
  bigamy: "no",
  married_for_benefit: "no",
  helped_illegal_entry: "no",
  illegal_gambling: "no",
  failed_child_support: "no",
  misrepresented_public_benefit: "no",
  false_info_to_government: "no",
  lied_for_immigration_benefit: "no",
  in_removal_proceedings: "no",
  ever_removed_deported: "no",
  male_18_to_26_in_us: "no",
  avoided_draft: "no",
  applied_military_exemption: "no",
  ever_served_military: "no",
  has_noble_title: "no",
  supports_constitution: "yes",
  understands_oath: "yes",
  disability_exempt_from_oath: "no",
  willing_take_oath: "yes",
  willing_bear_arms: "yes",
  willing_noncombatant_service: "yes",
  willing_civilian_work: "yes",

  // Part 10 — contact
  daytime_phone: "3055559876",
  email: "beatriz@example.com",
};

async function fillAndReload(answers: Answers) {
  const bytes = await fillPdf(N400, answers);
  const doc = await PDFDocument.load(bytes);
  return doc.getForm();
}

function expectYesNo(form: PDFForm, yesField: string, noField: string, answeredYes: boolean) {
  expect(form.getCheckBox(yesField).isChecked()).toBe(answeredYes);
  expect(form.getCheckBox(noField).isChecked()).toBe(!answeredYes);
}

describe("N-400 fill — Parts 1-8, 10", () => {
  it("checks the general-eligibility box and writes the A-Number on both pages", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[0].Part1_Eligibility[2]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[0].Part1_Eligibility[1]").isChecked()).toBe(false);
    expect(form.getTextField("form1[0].#subform[0].#area[0].Line1_AlienNumber[0]").getText()).toBe(
      "876543219"
    );
    expect(form.getTextField("form1[0].#subform[1].#area[1].Line1_AlienNumber[1]").getText()).toBe(
      "876543219"
    );
  });

  it("writes the explanation field only when 'other' eligibility is chosen", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      eligibility_basis: "other",
      eligibility_other_explain: "Derivative citizenship claim under review",
    });
    expect(form.getCheckBox("form1[0].#subform[0].Part1_Eligibility[5]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[0].Part1Line5_OtherExplain[0]").getText()).toBe(
      "Derivative citizenship claim under review"
    );
  });

  it("writes the applicant's name and leaves other-names blank", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[0].P2_Line1_FamilyName[0]").getText()).toBe("Alves");
    expect(form.getTextField("form1[0].#subform[0].P2_Line1_GivenName[0]").getText()).toBe("Beatriz");
    expect(form.getTextField("form1[0].#subform[0].Line2_FamilyName1[0]").getText()).toBeFalsy();
  });

  it("checks 'no name change' and leaves the new-name fields blank", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[1].P2_Line34_NameChange[0]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[1].Part2Line3_FamilyName[0]").getText()).toBeFalsy();
  });

  it("fills the desired new name when a name change is requested", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      wants_name_change: "yes",
      new_family_name: "Alves Costa",
      new_given_name: "Beatriz",
    });
    expect(form.getCheckBox("form1[0].#subform[1].P2_Line34_NameChange[1]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[1].Part2Line3_FamilyName[0]").getText()).toBe(
      "Alves Costa"
    );
  });

  it("checks Female and formats DOB / date became LPR", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[1].P2_Line7_Gender[1]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[1].P2_Line7_Gender[0]").isChecked()).toBe(false);
    expect(form.getTextField("form1[0].#subform[1].P2_Line8_DateOfBirth[0]").getText()).toBe("11/02/1985");
    expect(form.getTextField("form1[0].#subform[1].P2_Line9_DateBecamePermanentResident[0]").getText()).toBe(
      "05/14/2019"
    );
  });

  it("leaves SSN blank when no SSA update is requested", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[1].Line12a_Checkbox[0]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[1].Line12b_SSN[0]").getText()).toBeFalsy();
  });

  it("fills SSN and the escaped consent field when an SSA update is requested", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      ssn_update: "yes",
      ssn: "555221234",
      ssn_disclosure_consent: "yes",
    });
    expect(form.getCheckBox("form1[0].#subform[1].Line12a_Checkbox[1]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[1].Line12b_SSN[0]").getText()).toBe("555221234");
    expect(form.getCheckBox("form1[0].#subform[1].Line12\\.c_Checkbox[1]").isChecked()).toBe(true);
  });

  it("writes the physical address and duplicates the mailing address onto both pages", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[2].P4_Line3_PhysicalAddress1[0]").getText()).toBe(
      "800 Ocean Dr"
    );
    expect(form.getTextField("form1[0].#subform[2].P4_Line1_StreetName[0]").getText()).toBe("800 Ocean Dr");
    expect(form.getTextField("form1[0].#subform[3].P5_Line1b_StreetName[0]").getText()).toBe(
      "800 Ocean Dr"
    );
    expect(form.getDropdown("form1[0].#subform[2].P4_Line1_State[0]").getSelected()).toEqual(["FL"]);
    expect(form.getDropdown("form1[0].#subform[3].P4_Line1_State[1]").getSelected()).toEqual(["FL"]);
  });

  it("fills biographics: race checkbox array, height/weight, eyes and hair", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[2].P7_Line1_Ethnicity[0]").isChecked()).toBe(true);
    expect(form.getCheckBox("form1[0].#subform[2].P7_Line2_Race[4]").isChecked()).toBe(true); // white
    expect(form.getCheckBox("form1[0].#subform[2].P7_Line2_Race[0]").isChecked()).toBe(false); // indigenous
    expect(form.getDropdown("form1[0].#subform[2].P7_Line3_HeightFeet[0]").getSelected()).toEqual(["5"]);
    expect(form.getTextField("form1[0].#subform[2].P7_Line4_Pounds1[0]").getText()).toBe("1");
    expect(form.getCheckBox("form1[0].#subform[2].P7_Line5_Eye[0]").isChecked()).toBe(true); // brown
    expect(form.getCheckBox("form1[0].#subform[2].P7_Line6_Hair[7]").isChecked()).toBe(true); // black
  });

  it("fills the current employer on Part 5", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[4].P5_EmployerName1[0]").getText()).toBe(
      "Sunrise Marketing LLC"
    );
    expect(form.getTextField("form1[0].#subform[4].P7_OccupationFieldStudy1[2]").getText()).toBe(
      "Marketing Manager"
    );
    expect(form.getTextField("form1[0].#subform[4].P7_From1[1]").getText()).toBe("02/01/2021");
  });

  it("fills up to 3 children by name/DOB/residence/relationship", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      child1_name: "Lucas Alves",
      child1_dob: "2016-03-05",
      child1_residence: "Resides with me",
      child1_relationship: "Biological son or daughter",
      child1_support: "yes",
    });
    expect(form.getTextField("form1[0].#subform[4].P7_EmployerName1[0]").getText()).toBe("Lucas Alves");
    expect(form.getTextField("form1[0].#subform[4].P7_From1[0]").getText()).toBe("03/05/2016");
    expect(form.getTextField("form1[0].#subform[4].P7_OccupationFieldStudy1[0]").getText()).toBe(
      "Resides with me"
    );
    expect(form.getCheckBox("form1[0].#subform[4].P9_Line5a[0]").isChecked()).toBe(true);
  });

  it("writes the first trip's countries on its own field name pattern, distinct from trips 2-6", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      trip1_countries: "Brazil",
      trip1_left: "2023-12-20",
      trip1_return: "2024-01-05",
      trip2_countries: "Mexico",
    });
    expect(form.getTextField("form1[0].#subform[5].P9_Line1_Countries1[0]").getText()).toBe("Brazil");
    expect(form.getTextField("form1[0].#subform[5].P8_Line1_DateLeft1[0]").getText()).toBe("12/20/2023");
    expect(form.getTextField("form1[0].#subform[5].P8_Line1_DateReturn1[0]").getText()).toBe("01/05/2024");
    expect(form.getTextField("form1[0].#subform[5].P8_Line1_Countries2[0]").getText()).toBe("Mexico");
  });

  it("fills contact info and leaves signature/interpreter/preparer out of scope", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[10].P12_Line3_Telephone[0]").getText()).toBe(
      "3055559876"
    );
    expect(form.getTextField("form1[0].#subform[10].P12_Line5_Email[0]").getText()).toBe(
      "beatriz@example.com"
    );
  });
});

describe("N-400 fill — Part 7 marital history cascade", () => {
  it("skips every spouse field when single", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      marital_status: "single",
      times_married: 0,
      spouse_family_name: null,
      spouse_is_citizen: null,
      spouse_citizen_since: null,
    });
    expect(form.getCheckBox("form1[0].#subform[3].P10_Line1_MaritalStatus[1]").isChecked()).toBe(true); // single
    expect(form.getTextField("form1[0].#subform[3].P10_Line4a_FamilyName[0]").getText()).toBeFalsy();
  });

  it("fills the spouse block, including the mislabeled-but-correct 'times married' and 'employer' fields", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[3].P10_Line1_MaritalStatus[3]").isChecked()).toBe(true); // married
    expect(form.getTextField("form1[0].#subform[3].P10_Line4a_FamilyName[0]").getText()).toBe("Alves");
    expect(form.getTextField("form1[0].#subform[3].P10_Line4d_DateofBirth[0]").getText()).toBe(
      "04/18/1983"
    );
    expect(form.getTextField("form1[0].#subform[3].P10_Line4e_DateEnterMarriage[0]").getText()).toBe(
      "09/12/2015"
    );
    expect(
      form.getTextField("form1[0].#subform[4].#area[5].P7_Line6_ANumber[0]").getText()
    ).toBe("876543100");
    // "P10_Line4g_Employer" is the PDF's own (misleading) internal name for
    // "how many times has your spouse been married" — verified against its
    // real tooltip, not the field name, before wiring this in n-400.ts.
    expect(form.getTextField("form1[0].#subform[4].P10_Line4g_Employer[0]").getText()).toBe("1");
    // "TextField1[0]" is likewise the PDF's real (generic) name for the
    // spouse's current employer field.
    expect(form.getTextField("form1[0].#subform[4].TextField1[0]").getText()).toBe(
      "Bay Logistics Inc"
    );
  });

  it("shows the spouse cascade for 'separated' too (array showWhen), not just 'married'", async () => {
    const form = await fillAndReload({ ...ANSWERS, marital_status: "separated" });
    expect(form.getCheckBox("form1[0].#subform[3].P10_Line1_MaritalStatus[5]").isChecked()).toBe(true);
    expect(form.getTextField("form1[0].#subform[3].P10_Line4a_FamilyName[0]").getText()).toBe("Alves");
  });

  it("checks how the spouse became a citizen only when spouse_is_citizen is yes", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getCheckBox("form1[0].#subform[3].P10_Line5a_When[1]").isChecked()).toBe(true); // "other"
    expect(form.getTextField("form1[0].#subform[3].P10_Line5b_DateBecame[0]").getText()).toBe(
      "06/01/2010"
    );
  });

  it("leaves the citizen-since fields blank when the spouse is not a citizen", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      spouse_is_citizen: "no",
      spouse_citizen_since: null,
      spouse_citizen_date: null,
    });
    expect(form.getCheckBox("form1[0].#subform[3].P10_Line5a_When[0]").isChecked()).toBe(false);
    expect(form.getCheckBox("form1[0].#subform[3].P10_Line5a_When[1]").isChecked()).toBe(false);
    expect(form.getTextField("form1[0].#subform[3].P10_Line5b_DateBecame[0]").getText()).toBeFalsy();
  });
});

describe("N-400 fill — Part 9 eligibility/moral-character screening", () => {
  // Every Part 9 Yes/No question, with its exact yes/no field pair copied
  // from n-400.ts. Several pairs look "reversed" (Yes at index [0]) because
  // this PDF's own tooltips are unreliable there — verified independently
  // against the real asset's widget x-position (Yes sits at x≈498-499, No at
  // x≈540) before trusting them here.
  const ITEMS: [string, string, string][] = [
    ["claimed_us_citizen", `${S5}P9_Line1[1]`, `${S5}P9_Line1[0]`],
    ["voted_in_us", `${S5}P9_Line2[1]`, `${S5}P9_Line2[0]`],
    ["owes_taxes", `${S5}P9_Line3[0]`, `${S5}P9_Line3[1]`],
    ["claimed_nonresident_tax", `${S5}P9_Line4[0]`, `${S5}P9_Line4[1]`],
    ["communist_party_member", `${S5}P9_5a[0]`, `${S5}P9_5a[1]`],
    ["subversive_group_member", `${S5}P9_5b[0]`, `${S5}P9_5b[1]`],
    ["group_weapon_harm", `${S6}P12_6a[1]`, `${S6}P12_6a[0]`],
    ["group_kidnap_hijack", `${S6}P12_6b[0]`, `${S6}P12_6b[1]`],
    ["threatened_or_planned_above", `${S6}P12_6c[1]`, `${S6}P12_6c[0]`],
    ["torture", `${S6}P9_Line7a[1]`, `${S6}P9_Line7a[0]`],
    ["genocide", `${S6}P9_Line7\\.b\\.[1]`, `${S6}P9_Line7\\.b\\.[0]`],
    ["killing", `${S6}P9_Line7\\.c[1]`, `${S6}P9_Line7\\.c[0]`],
    ["severe_injury", `${S6}P11_7d[1]`, `${S6}P11_7d[0]`],
    ["nonconsensual_sexual_contact", `${S6}P9_Line7\\.e[1]`, `${S6}P9_Line7\\.e[0]`],
    ["religious_persecution", `${S6}P9_Line7\\.f[1]`, `${S6}P9_Line7\\.f[0]`],
    ["harm_based_on_group", `${S6}P9_Line7\\.g[1]`, `${S6}P9_Line7\\.g[0]`],
    ["armed_group_member", `${S6}P9_Line8a[1]`, `${S6}P9_Line8a[0]`],
    ["group_used_weapon_against_person", `${S6}P9_Line10a[1]`, `${S6}P9_Line10a[0]`],
    ["personally_used_weapon", `${S6}P9_Line10b[1]`, `${S6}P9_Line10b[0]`],
    ["personally_threatened_weapon", `${S6}P9_Line10c[0]`, `${S6}P9_Line10c[1]`],
    ["detained_people", `${S6}P9_Line9[1]`, `${S6}P9_Line9[0]`],
    ["sold_transported_weapons", `${S6}P9_Line11[1]`, `${S6}P9_Line11[0]`],
    ["weapons_training", `${S6}P9_Line12[1]`, `${S6}P9_Line12[0]`],
    ["recruited_child_soldiers", `${S6}P9_Line13[1]`, `${S6}P9_Line13[0]`],
    ["used_child_in_hostilities", `${S6}P9_Line14[1]`, `${S6}P9_Line14[0]`],
    ["committed_uncharged_crime", `${S7}P9_Line15a[1]`, `${S7}P9_Line15a[0]`],
    ["ever_arrested_or_charged", `${S7}P9_Line15b[1]`, `${S7}P9_Line15b[0]`],
    ["completed_sentence", `${S7}P12_Line16[1]`, `${S7}P12_Line16[0]`],
    ["prostitution", `${S8}P11_Line17A[1]`, `${S8}P11_Line17A[0]`],
    ["drug_trafficking", `${S8}P11_Line17B[1]`, `${S8}P11_Line17B[0]`],
    ["bigamy", `${S8}P11_Line17C[1]`, `${S8}P11_Line17C[0]`],
    ["married_for_benefit", `${S8}P12_Line17d[1]`, `${S8}P12_Line17d[0]`],
    ["helped_illegal_entry", `${S8}P12_Line17e[1]`, `${S8}P12_Line17e[0]`],
    ["illegal_gambling", `${S8}P12_Line17f[0]`, `${S8}P12_Line17f[1]`],
    ["failed_child_support", `${S8}P12_Line17g[1]`, `${S8}P12_Line17g[0]`],
    ["misrepresented_public_benefit", `${S8}P12_Line17h[1]`, `${S8}P12_Line17h[0]`],
    ["false_info_to_government", `${S8}P12_Line18[0]`, `${S8}P12_Line18[1]`],
    ["lied_for_immigration_benefit", `${S8}P12_Line19[0]`, `${S8}P12_Line19[1]`],
    ["in_removal_proceedings", `${S8}P12_Line20[1]`, `${S8}P12_Line20[0]`],
    ["ever_removed_deported", `${S8}P12_Line21[1]`, `${S8}P12_Line21[0]`],
    ["avoided_draft", `${S8}P12_Line23[1]`, `${S8}P12_Line23[0]`],
    ["applied_military_exemption", `${S8}P12_Line24[1]`, `${S8}P12_Line24[0]`],
    ["supports_constitution", `${S9}P12_Line31[1]`, `${S9}P12_Line31[0]`],
    ["understands_oath", `${S9}P12_Line32[0]`, `${S9}P12_Line32[1]`],
  ];

  it.each(ITEMS)("answers %s with the correct Yes/No checkbox pair (yes)", async (id, yesField, noField) => {
    const form = await fillAndReload({ ...ANSWERS, [id]: "yes" });
    expectYesNo(form, yesField, noField, true);
  });

  it.each(ITEMS)("answers %s with the correct Yes/No checkbox pair (no)", async (id, yesField, noField) => {
    const form = await fillAndReload({ ...ANSWERS, [id]: "no" });
    expectYesNo(form, yesField, noField, false);
  });

  it("gates registered_selective_service on male_18_to_26_in_us = yes", async () => {
    const yes = await fillAndReload({
      ...ANSWERS,
      male_18_to_26_in_us: "yes",
      registered_selective_service: "yes",
      selective_service_date: "2005-01-15",
      selective_service_number: "1234567890",
    });
    expectYesNo(yes, `${S8}P9_Line22a[1]`, `${S8}P9_Line22a[0]`, true);
    expectYesNo(yes, `${S8}Pt9_Line22b[1]`, `${S8}Pt9_Line22b[0]`, true);
    expect(yes.getTextField(`${S8}P9_Line22c_Date[0]`).getText()).toBe("01/15/2005");
    expect(yes.getTextField(`${S8}P9_Line22c_SSNumber[0]`).getText()).toBe("1234567890");

    const no = await fillAndReload({ ...ANSWERS, male_18_to_26_in_us: "no" });
    expectYesNo(no, `${S8}P9_Line22a[1]`, `${S8}P9_Line22a[0]`, false);
    // Not shown when male_18_to_26_in_us is "no" — neither box gets checked.
    expect(no.getCheckBox(`${S8}Pt9_Line22b[1]`).isChecked()).toBe(false);
    expect(no.getCheckBox(`${S8}Pt9_Line22b[0]`).isChecked()).toBe(false);
  });

  it("gates the military-service follow-ups on ever_served_military = yes", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      ever_served_military: "yes",
      currently_in_military: "yes",
      deploying_soon: "no",
      stationed_outside_us: "no",
      court_martialed_or_bad_discharge: "no",
      discharged_for_being_alien: "no",
      deserted_military: "no",
    });
    expectYesNo(form, `${S8}P12_Line25[1]`, `${S8}P12_Line25[0]`, true); // ever_served_military
    expectYesNo(form, `${S9}P12_Line26a[1]`, `${S9}P12_Line26a[0]`, true); // currently_in_military
    expectYesNo(form, `${S9}P12_Line26b[1]`, `${S9}P12_Line26b[0]`, false); // deploying_soon
    expectYesNo(form, `${S9}P12_Line26c[1]`, `${S9}P12_Line26c[0]`, false); // stationed_outside_us
    expectYesNo(form, `${S9}P12_Line27[0]`, `${S9}P12_Line27[1]`, false); // court_martialed (reversed)
    expectYesNo(form, `${S9}P12_Line28[0]`, `${S9}P12_Line28[1]`, false); // discharged_for_being_alien (reversed)
    expectYesNo(form, `${S9}P9_Line29[1]`, `${S9}P9_Line29[0]`, false); // deserted_military

    const notServed = await fillAndReload({ ...ANSWERS, ever_served_military: "no" });
    // Hidden when ever_served_military is "no" — neither box checked.
    expect(notServed.getCheckBox(`${S9}P12_Line26a[1]`).isChecked()).toBe(false);
    expect(notServed.getCheckBox(`${S9}P12_Line26a[0]`).isChecked()).toBe(false);
  });

  it("gates willing_renounce_title on has_noble_title = yes (reversed pair)", async () => {
    const withTitle = await fillAndReload({
      ...ANSWERS,
      has_noble_title: "yes",
      willing_renounce_title: "yes",
    });
    expectYesNo(withTitle, `${S9}P12_Line30a[0]`, `${S9}P12_Line30a[1]`, true);
    expectYesNo(withTitle, `${S9}P12_Line30b[0]`, `${S9}P12_Line30b[1]`, true);

    const noTitle = await fillAndReload({ ...ANSWERS, has_noble_title: "no" });
    expectYesNo(noTitle, `${S9}P12_Line30a[0]`, `${S9}P12_Line30a[1]`, false);
    expect(noTitle.getCheckBox(`${S9}P12_Line30b[0]`).isChecked()).toBe(false);
    expect(noTitle.getCheckBox(`${S9}P12_Line30b[1]`).isChecked()).toBe(false);
  });

  it("checks disability_exempt_from_oath = yes and hides the 4 oath-willingness questions", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      disability_exempt_from_oath: "yes",
      willing_take_oath: null,
      willing_bear_arms: null,
      willing_noncombatant_service: null,
      willing_civilian_work: null,
    });
    expectYesNo(form, `${S9}P12_Line33[0]`, `${S9}P12_Line33[1]`, true); // reversed pair
    expect(form.getCheckBox(`${S9}P12_Line34[1]`).isChecked()).toBe(false);
    expect(form.getCheckBox(`${S9}P12_Line34[0]`).isChecked()).toBe(false);
  });

  it("shows all 4 oath-willingness questions when not exempt, including the reversed pairs", async () => {
    const form = await fillAndReload(ANSWERS); // disability_exempt_from_oath: "no" in base answers
    expectYesNo(form, `${S9}P12_Line33[0]`, `${S9}P12_Line33[1]`, false);
    expectYesNo(form, `${S9}P12_Line34[1]`, `${S9}P12_Line34[0]`, true); // willing_take_oath
    expectYesNo(form, `${S9}P12_Line35[0]`, `${S9}P12_Line35[1]`, true); // willing_bear_arms (reversed)
    expectYesNo(form, `${S9}P12_Line36[1]`, `${S9}P12_Line36[0]`, true); // willing_noncombatant_service
    expectYesNo(form, `${S9}P12_Line37[0]`, `${S9}P12_Line37[1]`, true); // willing_civilian_work (reversed)
  });

  it("fills the crime-detail block only when ever_arrested_or_charged is yes", async () => {
    const form = await fillAndReload({
      ...ANSWERS,
      ever_arrested_or_charged: "yes",
      crime1_what: "Traffic violation",
      crime1_date: "2012-08-01",
      crime1_place: "Orlando, FL, United States",
      crime1_outcome: "No Charges Filed",
      crime1_sentence: "",
      crime1_conviction_date: null,
    });
    expect(form.getTextField(`${S7}P12_Line29_why1[0]`).getText()).toBe("Traffic violation");
    expect(form.getTextField(`${S7}P12_Line29_Date1[0]`).getText()).toBe("08/01/2012");
    expect(form.getTextField(`${S7}P12_Line29_Outcome1[1]`).getText()).toBe("Orlando, FL, United States");
    expect(form.getTextField(`${S7}P12_Line29_Outcome1[0]`).getText()).toBe("No Charges Filed");

    const clean = await fillAndReload(ANSWERS);
    expect(clean.getTextField(`${S7}P12_Line29_why1[0]`).getText()).toBeFalsy();
  });
});
