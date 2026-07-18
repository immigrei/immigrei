#!/usr/bin/env node
/**
 * Ingest an official USCIS form into a fillable asset the app can use.
 *
 * USCIS ships its PDFs AES-encrypted (owner-locked, empty user password) and as
 * hybrid AcroForm+XFA. pdf-lib can neither decrypt nor read XFA, so we normalize
 * once here: download from the official source, decrypt with mupdf, and write a
 * clean AcroForm PDF to public/forms/. The Next.js runtime only ever fills that
 * clean asset with pdf-lib — mupdf stays a dev dependency.
 *
 * "Official source always": run this to refresh whenever USCIS publishes a new
 * edition. It prints the edition date currently listed on uscis.gov so you can
 * confirm it still matches the `edition` pinned in lib/forms/<form>.ts before
 * shipping. If they differ, re-map the fields (they can move between editions).
 *
 * Usage:
 *   node scripts/prepare-form-asset.mjs i-765
 *
 * Requires network access and the `mupdf` dev dependency.
 */

import * as mupdf from "mupdf";
import { writeFileSync } from "node:fs";
import path from "node:path";

// Official sources per form id.
const SOURCES = {
  "g-1145": {
    pdf: "https://www.uscis.gov/sites/default/files/document/forms/g-1145.pdf",
    page: "https://www.uscis.gov/g-1145",
    out: "public/forms/g-1145.pdf",
  },
  "i-129f": {
    pdf: "https://www.uscis.gov/sites/default/files/document/forms/i-129f.pdf",
    page: "https://www.uscis.gov/i-129f",
    out: "public/forms/i-129f.pdf",
  },
  "i-765": {
    pdf: "https://www.uscis.gov/sites/default/files/document/forms/i-765.pdf",
    page: "https://www.uscis.gov/i-765",
    out: "public/forms/i-765.pdf",
  },
  "i-130": {
    pdf: "https://www.uscis.gov/sites/default/files/document/forms/i-130.pdf",
    page: "https://www.uscis.gov/i-130",
    out: "public/forms/i-130.pdf",
  },
  "i-130a": {
    pdf: "https://www.uscis.gov/sites/default/files/document/forms/i-130a.pdf",
    page: "https://www.uscis.gov/i-130",
    out: "public/forms/i-130a.pdf",
  },
  "i-131": {
    pdf: "https://www.uscis.gov/sites/default/files/document/forms/i-131.pdf",
    page: "https://www.uscis.gov/i-131",
    out: "public/forms/i-131.pdf",
  },
  "i-485": {
    pdf: "https://www.uscis.gov/sites/default/files/document/forms/i-485.pdf",
    page: "https://www.uscis.gov/i-485",
    out: "public/forms/i-485.pdf",
  },
  "i-864": {
    pdf: "https://www.uscis.gov/sites/default/files/document/forms/i-864.pdf",
    page: "https://www.uscis.gov/i-864",
    out: "public/forms/i-864.pdf",
  },
  "i-539": {
    pdf: "https://www.uscis.gov/sites/default/files/document/forms/i-539.pdf",
    page: "https://www.uscis.gov/i-539",
    out: "public/forms/i-539.pdf",
  },
};

async function editionFromPage(pageUrl) {
  try {
    const html = await fetch(pageUrl).then((r) => r.text());
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const m = text.match(/Edition Date.{0,200}?(\d{2}\/\d{2}\/\d{2})/i);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

async function main() {
  const formId = process.argv[2];
  const src = SOURCES[formId];
  if (!src) {
    console.error(`Unknown form "${formId}". Known: ${Object.keys(SOURCES).join(", ")}`);
    process.exit(1);
  }

  console.log(`Downloading ${src.pdf}`);
  const bytes = new Uint8Array(await fetch(src.pdf).then((r) => r.arrayBuffer()));

  const doc = mupdf.Document.openDocument(bytes, "application/pdf");
  if (doc.needsPassword()) doc.authenticatePassword(""); // empty user password

  // encrypt=none strips the owner lock; the visible form is unchanged.
  const clean = doc.saveToBuffer("encrypt=none").asUint8Array();
  const outPath = path.join(process.cwd(), src.out);
  writeFileSync(outPath, clean);
  console.log(`Wrote ${src.out} (${clean.length} bytes)`);

  const edition = await editionFromPage(src.page);
  console.log(
    edition
      ? `USCIS lists edition ${edition} — confirm this matches the \`edition\` in lib/forms/${formId}.ts`
      : `Could not read the edition date from ${src.page} — check it manually.`
  );
}

main();
