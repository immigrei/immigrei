#!/usr/bin/env -S npx tsx
/**
 * Precomputes embeddings for the in-app search catalog (vistos + kits +
 * caminhos) via Voyage AI and writes lib/searchEmbeddings.json.
 *
 * The catalogs are static TS data, so there's no reason to call the
 * embeddings API on every server request — we embed once here and commit
 * the result. lib/searchIndex.ts compares each cached entry's `text`
 * against the live catalog at request time; if a kit/visto/manual's copy
 * changed since this last ran, that one entry silently falls back to
 * keyword-only matching (see lib/searchIndex.ts) instead of serving a
 * stale or wrong semantic match.
 *
 * Run whenever vistosCatalog.ts / kitsCatalog.ts / manuais.ts / the
 * SEARCH_SYNONYMS map in lib/searchCatalogEntries.ts changes:
 *   npm run build:search-embeddings
 *
 * Requires VOYAGE_API_KEY (from .env.local, since this runs outside
 * Next's own env loading).
 *
 * IMPORTANT (bug hit 2 ago 2026): lib/voyage.ts reads
 * process.env.VOYAGE_EMBED_MODEL as a MODULE-LEVEL constant, evaluated the
 * moment that module is imported. ES module imports are hoisted and run
 * before any of *this* file's own top-level code — so a static
 * `import { embedDocuments } from "../lib/voyage"` at the top of this file
 * would silently freeze MODEL to the default ("voyage-3.5-lite") before
 * loadEnvLocal() below ever gets a chance to set VOYAGE_EMBED_MODEL from
 * .env.local, regardless of what that variable is set to. That's why
 * embedDocuments is imported dynamically INSIDE main(), after
 * loadEnvLocal() has already populated process.env.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCatalogEntries } from "../lib/searchCatalogEntries";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// Next.js loads .env.local automatically for the app; a standalone script
// doesn't get that for free, so parse it ourselves (no new dependency for
// one file, KEY=VALUE per line, '#' comments, quotes stripped).
function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();

  if (!process.env.VOYAGE_API_KEY) {
    console.error(
      "VOYAGE_API_KEY não encontrada em .env.local. Crie uma conta em https://www.voyageai.com, gere uma chave e adicione VOYAGE_API_KEY=... antes de rodar este script."
    );
    process.exit(1);
  }

  // Dynamic import, on purpose — see the file-header comment above.
  const { embedDocuments } = await import("../lib/voyage");

  const entries = buildCatalogEntries();
  const model = process.env.VOYAGE_EMBED_MODEL || "voyage-3.5-lite";
  console.log(`Embedando ${entries.length} itens do catálogo (vistos + kits + caminhos) com ${model}...`);

  const embeddings = await embedDocuments(entries.map((e) => e.text));
  if (!embeddings) {
    console.error("Chamada à Voyage falhou — veja o warning acima. Nada foi escrito.");
    process.exit(1);
  }

  const out = entries.map((entry, i) => ({
    type: entry.type,
    id: entry.id,
    text: entry.text,
    embedding: embeddings[i],
  }));
  const outPath = path.join(ROOT, "lib", "searchEmbeddings.json");
  writeFileSync(outPath, JSON.stringify(out));
  console.log(`Escrito ${outPath} (${out.length} embeddings, modelo ${model}).`);
}

main();
