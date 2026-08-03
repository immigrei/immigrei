// Unified search index over the 3 static catalogs that make up "in-app
// search" v1: vistos, kits de protocolo, caminhos. Hybrid matching —
// keyword substring score is always computed (cheap, sync, no external
// dependency); a semantic cosine-similarity score is added on top when a
// query embedding is available (Voyage AI, see lib/voyage.ts) and a valid,
// up-to-date cached embedding exists for that catalog entry. This means
// search never fully breaks if Voyage is down/unconfigured, or if an item
// was edited since the last `npm run build:search-embeddings` run.

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { buildCatalogEntries, buildFaqBankEntries, type CatalogEntry, type SearchResultType } from "@/lib/searchCatalogEntries";
import type { UserPlan } from "@/lib/plan";

export type { SearchResultType };

export interface SearchHit {
  type: SearchResultType;
  id: string;
  title: string;
  snippet: string;
  href: string;
  locked: boolean;
}

interface IndexEntry extends CatalogEntry {
  haystack: string; // normalized text, for keyword matching
}

// Mirrors lib/escolas.ts's normalize() — same accent-insensitive approach.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function buildIndex(): IndexEntry[] {
  return buildCatalogEntries().map((entry) => ({ ...entry, haystack: normalize(entry.text) }));
}

// Static data → build once at module load, not per-request.
const INDEX: IndexEntry[] = buildIndex();

interface FaqSearchEntry {
  id: string;
  perguntaN: string;
  resposta: string;
  vistosRelacionados: string[];
  text: string;
  haystack: string;
}

const FAQ_INDEX: FaqSearchEntry[] = buildFaqBankEntries().map((f) => ({
  id: f.id,
  perguntaN: normalize(f.pergunta),
  resposta: f.resposta,
  vistosRelacionados: f.vistosRelacionados,
  text: f.text,
  haystack: normalize(f.text),
}));

interface CachedEmbedding {
  type: SearchResultType;
  id: string;
  text: string;
  embedding: number[];
}

function loadCachedEmbeddings(): Map<string, CachedEmbedding> {
  const map = new Map<string, CachedEmbedding>();
  const filePath = path.join(process.cwd(), "lib", "searchEmbeddings.json");
  if (!existsSync(filePath)) return map; // not generated yet — pure keyword mode
  try {
    const raw: CachedEmbedding[] = JSON.parse(readFileSync(filePath, "utf8"));
    for (const entry of raw) map.set(`${entry.type}:${entry.id}`, entry);
  } catch (err) {
    console.warn("Failed to read lib/searchEmbeddings.json — falling back to keyword-only search:", err);
  }
  return map;
}

// Read once per server process (same lifetime as INDEX) — regenerating the
// file requires a redeploy/restart anyway, no need to re-read per request.
//
// LOCAL DEV GOTCHA (hit this 1 ago 2026): if you run
// `npm run build:search-embeddings` while `next dev` is already running,
// the dev server keeps these OLD embeddings in memory — fs.readFileSync
// here isn't tracked by Next's module graph, so it doesn't hot-reload.
// Comparing a fresh query embedding against stale embeddings from a
// DIFFERENT Voyage model (e.g. query on voyage-3, cached docs still on
// voyage-3.5-lite) silently produces meaningless similarity scores — no
// error, just wrong/empty results. Restart `next dev` after regenerating.
const CACHED_EMBEDDINGS = loadCachedEmbeddings();

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Shared by catalog entries (against `title`) and FAQ entries (against
// `pergunta`) — same exact/startsWith/includes/haystack tiering either way.
function titleTierScore(titleN: string, haystack: string, nq: string): number {
  if (titleN === nq) return 100;
  if (titleN.startsWith(nq)) return 80;
  if (titleN.includes(nq)) return 60;
  if (haystack.includes(nq)) return 30;
  return 0;
}

function keywordScore(entry: IndexEntry, nq: string): number {
  return titleTierScore(normalize(entry.title), entry.haystack, nq);
}

const SEMANTIC_INCLUDE_THRESHOLD = 0.35;
const SEMANTIC_WEIGHT = 50;
// Product rule (Felipe, 1 ago 2026): never a dead end — same "always offer
// a parallel path" principle used elsewhere in the app. Voyage's similarity
// score has real run-to-run jitter for the same query (~0.9998 cosine
// between repeat calls, not 1.0 — confirmed empirically 1 ago 2026), so a
// hard threshold right at the boundary can flip a borderline-relevant item
// (e.g. K-1 for a spouse-related query) in or out between two runs of the
// identical search. Guaranteeing a minimum count — not just "at least one"
// — absorbs that jitter instead of being one score away from a dead end.
//
// BUT (Felipe, 2 ago 2026): this padding must not kick in when there's
// already a clear winner — it was drowning out a single obviously-right
// answer (e.g. "meus pdfs" → Cofre de Documentos) with unrelated filler
// just to reach the count. Padding is now reserved for genuinely ambiguous
// queries (no standout leader); see isConfidentLeader() below.
const MIN_RESULTS = 6;

// How far ahead the top result has to be, over the runner-up, to count as
// a standout answer rather than "several plausible options." Roughly one
// keyword-score tier (30/60/80/100) or half a semantic-weight unit.
const CONFIDENT_MARGIN = 25;
// Near-ties with the leader stay grouped together (e.g. two catalog entries
// that are both legitimately "the answer"), instead of arbitrarily keeping
// only one.
const CONFIDENT_TIE_BAND = 5;

/**
 * Server-only. `plan` decides which gated hits come back `locked: true`.
 * `queryEmbedding` is the result of `embedQuery()` (lib/voyage.ts) — pass
 * `null` when that call failed/timed out/wasn't configured, and matching
 * degrades gracefully to keyword-only.
 */
export function searchCatalogs(
  query: string,
  plan: UserPlan,
  queryEmbedding: number[] | null,
  limit = 20
): SearchHit[] {
  const nq = normalize(query.trim());
  if (!nq) return [];

  const scored = INDEX.map((entry) => {
    const kw = keywordScore(entry, nq);

    let semantic = 0;
    if (queryEmbedding) {
      const cached = CACHED_EMBEDDINGS.get(`${entry.type}:${entry.id}`);
      if (cached && cached.text === entry.text) {
        semantic = cosineSimilarity(queryEmbedding, cached.embedding);
      } else if (cached) {
        // Cached embedding exists but the catalog text has changed since
        // it was generated — don't trust a stale vector, just warn once
        // per process so it's visible in dev/server logs.
        console.warn(
          `Search embedding stale for ${entry.type}:${entry.id} — run "npm run build:search-embeddings"`
        );
      }
    }

    return { entry, score: kw + semantic * SEMANTIC_WEIGHT, kw, semantic };
  });

  const byScore = (a: (typeof scored)[number], b: (typeof scored)[number]) =>
    b.score - a.score || a.entry.title.localeCompare(b.entry.title, "pt-BR");

  const relevant = scored.filter((s) => s.kw > 0 || s.semantic >= SEMANTIC_INCLUDE_THRESHOLD).sort(byScore);
  const allSorted = [...scored].sort(byScore);

  let pool: typeof scored;
  if (relevant.length === 0) {
    // Nothing matched at all — never a dead end, show the closest guesses.
    pool = allSorted.slice(0, MIN_RESULTS);
  } else {
    const top = relevant[0];
    const runnerUp = allSorted[1];
    const isConfidentLeader = !runnerUp || top.score - runnerUp.score >= CONFIDENT_MARGIN;

    pool = isConfidentLeader
      ? relevant.filter((s) => top.score - s.score <= CONFIDENT_TIE_BAND)
      : relevant.length >= MIN_RESULTS
        ? relevant
        : allSorted.slice(0, MIN_RESULTS);
  }

  return pool.slice(0, limit).map(({ entry }) => ({
    type: entry.type,
    id: entry.id,
    title: entry.title,
    snippet: entry.snippet,
    href: entry.href,
    locked: entry.gated && plan === "free",
  }));
}

/**
 * Matches the query against the curated FAQ bank (lib/faqBank.ts) — never
 * live-generated, see that file's header for why. Returns the single
 * best-matching entry if it clears the same bar used to include a catalog
 * result (kw > 0 or semantic >= SEMANTIC_INCLUDE_THRESHOLD), else null.
 * There's only ever one FAQ answer shown per search, so no "confident
 * leader" logic is needed here — just "is the best match good enough."
 */
function matchFaq(nq: string, queryEmbedding: number[] | null): FaqSearchEntry | null {
  if (!nq || FAQ_INDEX.length === 0) return null;

  let best: { entry: FaqSearchEntry; score: number; kw: number; semantic: number } | null = null;
  for (const entry of FAQ_INDEX) {
    const kw = titleTierScore(entry.perguntaN, entry.haystack, nq);

    let semantic = 0;
    if (queryEmbedding) {
      const cached = CACHED_EMBEDDINGS.get(`pergunta:${entry.id}`);
      if (cached && cached.text === entry.text) {
        semantic = cosineSimilarity(queryEmbedding, cached.embedding);
      } else if (cached) {
        console.warn(`Search embedding stale for pergunta:${entry.id} — run "npm run build:search-embeddings"`);
      }
    }

    const score = kw + semantic * SEMANTIC_WEIGHT;
    if (!best || score > best.score) best = { entry, score, kw, semantic };
  }

  if (!best) return null;
  const qualifies = best.kw > 0 || best.semantic >= SEMANTIC_INCLUDE_THRESHOLD;
  return qualifies ? best.entry : null;
}

export interface SearchWithAnswer {
  answer: string | null;
  results: SearchHit[];
}

/**
 * Server-only. Same contract as searchCatalogs, plus a curated FAQ answer
 * when the query matches one well. The FAQ match never injects cards that
 * searchCatalogs wouldn't already return on its own — it only reorders the
 * existing pool, moving the FAQ's related vistos/kits/caminhos to the front.
 * This preserves the "don't dilute a confident single answer" behavior:
 * boosting can't turn a 1-card result into a padded list.
 */
export function searchWithAnswer(
  query: string,
  plan: UserPlan,
  queryEmbedding: number[] | null,
  limit = 20
): SearchWithAnswer {
  const results = searchCatalogs(query, plan, queryEmbedding, limit);

  const nq = normalize(query.trim());
  const faqHit = matchFaq(nq, queryEmbedding);
  if (!faqHit) return { answer: null, results };

  const boostedIds = new Set(faqHit.vistosRelacionados);
  const reordered = [...results].sort((a, b) => {
    const aBoost = boostedIds.has(a.id) ? 0 : 1;
    const bBoost = boostedIds.has(b.id) ? 0 : 1;
    return aBoost - bBoost; // stable sort — preserves relative order within each group
  });

  return { answer: faqHit.resposta, results: reordered };
}
