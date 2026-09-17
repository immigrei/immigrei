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
 *   # A dated "no grace period" edition (USCIS publishes these ahead of the
 *   # effective date, often NOT yet at the form's canonical URL — see the
 *   # newsroom alert linked in content/leis/formularios/<form>.md for where
 *   # to actually get it). Writes to an explicit path instead of overwriting
 *   # the canonical asset, matching the get pdfAssetPath() pattern in
 *   # lib/forms/<form>.ts:
 *   node scripts/prepare-form-asset.mjs i-539 --out forms/i-539-09-15-26.pdf
 *
 *   # Decrypt a PDF already downloaded by hand (e.g. from a newsroom alert
 *   # link) instead of fetching the canonical URL — this is the step that
 *   # was skipped once already: a dated edition got committed straight from
 *   # USCIS, still AES-encrypted, and pdf-lib silently failed to open it in
 *   # production (see lib/forms/i-539.ts's file header for the incident):
 *   node scripts/prepare-form-asset.mjs i-539 --in /tmp/i-539-new.pdf --out forms/i-539-09-15-26.pdf
 *
 * Requires the `mupdf` dev dependency, and network access unless --in is given.
 */

import * as mupdf from "mupdf";
import { readFileSync, writeFileSync } from "node:fs";
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
  "n-400": {
    pdf: "https://www.uscis.gov/sites/default/files/document/forms/n-400.pdf",
    page: "https://www.uscis.gov/n-400",
    out: "public/forms/n-400.pdf",
  },
  "i-90": {
    pdf: "https://www.uscis.gov/sites/default/files/document/forms/i-90.pdf",
    page: "https://www.uscis.gov/i-90",
    out: "public/forms/i-90.pdf",
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

function parseArgs(argv) {
  const formId = argv[0];
  let inPath, outPath;
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === "--in") inPath = argv[++i];
    else if (argv[i] === "--out") outPath = argv[++i];
  }
  return { formId, inPath, outPath };
}

async function main() {
  const { formId, inPath, outPath } = parseArgs(process.argv.slice(2));
  const src = SOURCES[formId];
  if (!src) {
    console.error(`Unknown form "${formId}". Known: ${Object.keys(SOURCES).join(", ")}`);
    process.exit(1);
  }

  let bytes;
  if (inPath) {
    console.log(`Reading ${inPath}`);
    bytes = new Uint8Array(readFileSync(inPath));
  } else {
    console.log(`Downloading ${src.pdf}`);
    bytes = new Uint8Array(await fetch(src.pdf).then((r) => r.arrayBuffer()));
  }

  const doc = mupdf.Document.openDocument(bytes, "application/pdf");
  if (doc.needsPassword()) doc.authenticatePassword(""); // empty user password

  // encrypt=none strips the owner lock; the visible form is unchanged.
  const clean = doc.saveToBuffer("encrypt=none").asUint8Array();
  const dest = outPath ?? src.out;
  const destPath = path.join(process.cwd(), dest);
  writeFileSync(destPath, clean);
  console.log(`Wrote ${dest} (${clean.length} bytes)`);

  // Skip the live-page edition check when reading a local file for a dated
  // "no grace period" edition — the canonical page usually still lists the
  // OLD edition until the effective date, so the check would just be noise;
  // verify against the printed footer on the PDF's own first page instead.
  if (inPath) {
    console.log("Read from a local file — verify the edition against the PDF's own page-1 footer, not uscis.gov.");
    return;
  }

  const edition = await editionFromPage(src.page);
  console.log(
    edition
      ? `USCIS lists edition ${edition} — confirm this matches the \`edition\` in lib/forms/${formId}.ts`
      : `Could not read the edition date from ${src.page} — check it manually.`
  );
}

main();
