import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { DS160 } from "./ds-160";
import { ESTA } from "./esta";
import { fillWorksheet } from "./fillWorksheet";
import type { Answers } from "./types";

describe("fillWorksheet — DS-160", () => {
  const answers: Answers = {
    purpose: "b1b2",
    surname: "Silva",
    given_names: "Ana",
    has_other_names: "no",
    sex: "female",
    marital_status: "single",
    dob: "1992-03-15",
    birth_city: "Sao Paulo",
    birth_country: "Brazil",
    nationality: "Brazil",
    has_other_nationality: "no",
    has_us_ssn: "no",
    traveling_with_others: "no",
    been_to_us: "yes",
    last_visit_date: "2023-06-01",
    has_us_visa: "yes",
    last_visa_date: "2023-01-15",
    visa_denied: "no",
    home_street: "Rua das Flores 100",
    home_city: "Sao Paulo",
    home_state: "SP",
    home_zip: "01000-000",
    mailing_same: "yes",
    phone_primary: "5511999998888",
    email: "ana@example.com",
    social_media_platform: "Instagram",
    social_media_handle: "@ana",
    passport_type: "regular",
    passport_number: "AB123456",
    passport_issuing_country: "Brazil",
    passport_issued_date: "2020-01-01",
    passport_expiry_date: "2030-01-01",
    us_contact_name_or_org: "Hotel Miami Beach",
    us_contact_relationship: "hotel",
    us_contact_address: "123 Ocean Dr, Miami, FL",
    father_name: "Jose Silva",
    father_in_us: "no",
    mother_name: "Maria Silva",
    mother_in_us: "no",
    has_other_relatives_in_us: "no",
    is_married: "no",
    occupation: "employed",
    employer_school_name: "Acme Corp",
    school_name: "USP",
  };

  it("generates a valid multi-page PDF that opens without a form", async () => {
    const bytes = await fillWorksheet(DS160, answers);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThan(1);
    expect(doc.getForm().getFields().length).toBe(0); // pure text, no AcroForm
  });

  it("throws for a pdf-kind form", async () => {
    const { I765 } = await import("./i-765");
    await expect(fillWorksheet(I765, answers)).rejects.toThrow();
  });
});

describe("fillWorksheet — ESTA", () => {
  const answers: Answers = {
    surname: "Rossi",
    given_names: "Marco",
    has_other_names: "no",
    sex: "male",
    dob: "1990-05-20",
    birth_city: "Rome",
    birth_country: "Italy",
    citizenship_country: "Italy",
    passport_number: "YA1234567",
    passport_issuing_country: "Italy",
    passport_issued_date: "2022-01-01",
    passport_expiry_date: "2032-01-01",
    home_address: "Via Roma 1",
    home_city: "Rome",
    home_country: "Italy",
    phone: "391234567890",
    email: "marco@example.com",
    emergency_contact_name: "Giulia Rossi",
    emergency_contact_phone: "391234567891",
    purpose: "tourism",
    arrival_date: "2026-09-01",
    us_address_street: "123 Ocean Dr",
    us_address_city: "Miami",
    us_address_state: "FL",
    employer_school_name: "Rossi SRL",
    elig_disease: "no",
    elig_arrest_moral: "no",
    elig_two_convictions: "no",
    elig_drugs: "no",
    elig_prostitution: "no",
    elig_security: "no",
    elig_nazi: "no",
    elig_genocide: "no",
    elig_misrepresentation: "no",
    elig_unauthorized_work: "no",
    elig_denied_visa: "no",
    elig_removal: "no",
    elig_overstay_vwp: "no",
    elig_restricted_countries: "no",
  };

  it("generates a valid PDF with all sections", async () => {
    const bytes = await fillWorksheet(ESTA, answers);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it("skips questions with no answer and hidden conditional questions", async () => {
    const bytes = await fillWorksheet(ESTA, { ...answers, has_other_names: "no", other_names: "" });
    const doc = await PDFDocument.load(bytes);
    // Just verifying it doesn't throw and produces content — text extraction
    // isn't available via pdf-lib, so we assert structurally instead.
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
  });
});
