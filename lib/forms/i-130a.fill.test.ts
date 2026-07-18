import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { I130A } from "./i-130a";
import { fillPdf } from "./fillPdf";
import type { Answers } from "./types";

// The Brazilian spouse beneficiary (who will receive the green card) living
// in Brazil — the counterpart of the I-130 fill test.
const ANSWERS: Answers = {
  family_name: "Silva",
  given_name: "Ana",
  addr1_street: "Rua das Flores 100",
  addr1_city: "Sao Paulo",
  addr1_province: "Sao Paulo",
  addr1_postal: "01000-000",
  addr1_country: "Brazil",
  addr1_from: "2020-01-01",
  last_abroad_street: "Rua das Flores 100",
  last_abroad_city: "Sao Paulo",
  last_abroad_province: "Sao Paulo",
  last_abroad_country: "Brazil",
  last_abroad_from: "2020-01-01",
  parent1_family: "Silva",
  parent1_given: "Jose",
  parent1_sex: "male",
  parent1_birth_city: "Campinas",
  parent1_birth_country: "Brazil",
  parent1_res_city: "Campinas",
  parent1_res_country: "Brazil",
  parent2_family: "Souza",
  parent2_given: "Maria",
  parent2_sex: "female",
  parent2_birth_country: "Brazil",
  parent2_res_city: "Deceased",
  employer1_name: "Padaria Estrela",
  employer1_city: "Sao Paulo",
  employer1_country: "Brazil",
  employer1_occupation: "Baker",
  employer1_from: "2022-05-01",
  daytime_phone: "5511999998888",
  email: "ana@example.com",
};

async function fillAndReload(answers: Answers) {
  const bytes = await fillPdf(I130A, answers);
  const doc = await PDFDocument.load(bytes);
  return doc.getForm();
}

describe("I-130A fill", () => {
  it("writes the beneficiary's name on page 1 and the Part 7 header", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[0].Pt1Line3a_FamilyName[0]").getText()).toBe("Silva");
    expect(form.getTextField("form1[0].#subform[5].Pt1Line3a_FamilyName[1]").getText()).toBe("Silva");
    expect(form.getTextField("form1[0].#subform[0].Pt1Line3b_GivenName[0]").getText()).toBe("Ana");
  });

  it("fills the current address (Brazil: province/postal/country, no state)", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[0].Pt1Line4a_StreetNumberName[0]").getText()).toBe(
      "Rua das Flores 100"
    );
    expect(form.getTextField("form1[0].#subform[0].Pt1Line4f_Province[0]").getText()).toBe("Sao Paulo");
    expect(form.getTextField("form1[0].#subform[0].Pt1Line4h_Country[0]").getText()).toBe("Brazil");
  });

  it("formats dates as USCIS mm/dd/yyyy", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[0].Pt1Line5a_DateFrom[0]").getText()).toBe("01/01/2020");
    expect(form.getTextField("form1[0].#subform[1].Pt2Line4a_DateFrom[0]").getText()).toBe("05/01/2022");
  });

  it("writes parent 1's residence city onto its mislabeled field", async () => {
    const form = await fillAndReload(ANSWERS);
    // Item 15 (city of residence) lives in Pt1Line14_CountryofBirth — verified positionally.
    expect(form.getTextField("form1[0].#subform[1].Pt1Line14_CountryofBirth[0]").getText()).toBe("Campinas");
    expect(form.getTextField("form1[0].#subform[1].Pt1Line13_CountryofBirth[0]").getText()).toBe("Brazil");
  });

  it("handles a deceased parent 2 and shifted parent-2 fields", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[1].Pt1Line16_FamilyName[0]").getText()).toBe("Souza");
    expect(form.getTextField("form1[0].#subform[1].Pt1Line20_CityTownVillageofRes[0]").getText()).toBe("Deceased");
    expect(form.getCheckBox("form1[0].#subform[1].Pt1Line19_Female[0]").isChecked()).toBe(true);
  });

  it("fills employment and contact info", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[1].Pt2Line1_EmployerOrCompName[0]").getText()).toBe(
      "Padaria Estrela"
    );
    expect(form.getTextField("form1[0].#subform[2].Pt4Line5_Email[0]").getText()).toBe("ana@example.com");
  });

  it("leaves signature, interpreter and preparer blocks untouched", async () => {
    const form = await fillAndReload(ANSWERS);
    expect(form.getTextField("form1[0].#subform[2].Pt4Line6a_Signature[0]").getText()).toBeFalsy();
    expect(form.getTextField("form1[0].#subform[3].Pt5Line1a_InterpreterFamilyName[0]").getText()).toBeFalsy();
    expect(form.getTextField("form1[0].#subform[3].Pt6Line1a_PreparerFamilyName[0]").getText()).toBeFalsy();
  });
});
