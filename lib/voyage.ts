// Thin wrapper over Voyage AI's embeddings REST API — no SDK, just fetch,
// since this is the only call we make. Used both at build time (embedding
// the static catalogs, see scripts/build-search-embeddings.ts) and at
// request time (embedding the user's search query, see app/api/search).
//
// Voyage recommends asymmetric input_type ("document" vs "query") for
// retrieval — it measurably improves match quality over embedding both
// sides the same way, so callers must say which one they're doing.

const ENDPOINT = "https://api.voyageai.com/v1/embeddings";
const MODEL = process.env.VOYAGE_EMBED_MODEL || "voyage-3.5-lite";
const TIMEOUT_MS = 3_000;

type InputType = "query" | "document";

async function embed(input: string[], inputType: InputType): Promise<number[][] | null> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) return null; // no key configured — caller falls back to keyword-only search

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input, model: MODEL, input_type: inputType }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn(`Voyage embeddings request failed: ${res.status} ${res.statusText}`);
      return null;
    }

    const body = await res.json();
    // Voyage returns data in the same order as input, each with an `index`
    // — sort defensively instead of trusting array order.
    const sorted = [...body.data].sort((a, b) => a.index - b.index);
    return sorted.map((d) => d.embedding as number[]);
  } catch (err) {
    console.warn("Voyage embeddings request errored:", err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Embed a single user search query. Returns null on any failure (missing key, timeout, API error) — callers must fall back to keyword-only matching. */
export async function embedQuery(text: string): Promise<number[] | null> {
  const result = await embed([text], "query");
  return result ? result[0] : null;
}

/** Embed catalog documents in bulk (used only by scripts/build-search-embeddings.ts). */
export async function embedDocuments(texts: string[]): Promise<number[][] | null> {
  return embed(texts, "document");
}
