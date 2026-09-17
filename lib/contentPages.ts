import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

/**
 * Public explainer pages — "/status/[slug]" (USCIS status messages) and
 * "/entenda/[slug]" (decoders, form lifecycles).
 *
 * The source of truth is the content pipeline's own drafts in
 * content/marketing/drafts/. A draft only becomes a page once it clears
 * EVERY publish gate in `publishBlockers` — above all César's
 * `status: approved` + `reviewed_by` (content/marketing/README.md). This
 * module can never publish around that human gate (YMYL/UPL).
 *
 * Only read at build time (every consumer is statically generated), so the
 * markdown never has to be traced into a serverless bundle.
 */

export const DRAFTS_DIR = join(process.cwd(), "content/marketing/drafts");
export const SITE_URL = "https://immigrei.app";

const SECTION_BY_TYPE = {
  status: "/status",
  decoder: "/entenda",
  "form-lifecycle": "/entenda",
} as const;

export type ExplainerType = keyof typeof SECTION_BY_TYPE;
export type ExplainerSection = (typeof SECTION_BY_TYPE)[ExplainerType];

export type ExplainerFaq = {
  q: string;
  /** Answer as markdown (may carry bold/links). */
  a: string;
  /** Plain-text answer for the FAQPage JSON-LD. */
  aText: string;
};

export type ExplainerPage = {
  slug: string;
  type: ExplainerType;
  title: string;
  queryTarget: string;
  /** Answer-first block as plain text, ≤155 chars — the meta description. */
  description: string;
  /** Markdown before "## Perguntas frequentes", editorial comments stripped. */
  body: string;
  faq: ExplainerFaq[];
  /** Markdown after the FAQ block (CTA + disclaimer). */
  closing: string;
  /** Public https sources only — content/leis paths are internal references. */
  sources: string[];
  verificadoEm: string;
  path: string;
  url: string;
};

/** A draft that is NOT public yet, and why — feeds César's review digest. */
export type PendingDraft = {
  slug: string;
  type: string;
  title: string;
  compliance: string;
  blockers: string[];
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const FAQ_HEADING = /^## Perguntas frequentes\s*$/m;

// js-yaml turns an unquoted `2026-09-13` into a Date — normalize both shapes.
function yamlDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").trim();
}

function publishBlockers(file: string, data: Record<string, unknown>, rawBody: string): string[] {
  const blockers: string[] = [];
  const status = String(data.status ?? "").trim();
  if (status !== "approved" && status !== "published") {
    blockers.push(`status: ${status || "ausente"}`);
  }
  const reviewedBy = String(data.reviewed_by ?? "").trim();
  if (!reviewedBy || reviewedBy === "pending") blockers.push("reviewed_by pendente");
  const compliance = String(data.compliance_check ?? "").trim();
  if (!compliance.startsWith("PASS")) blockers.push(`compliance_check: ${compliance || "ausente"}`);
  if (!(String(data.type) in SECTION_BY_TYPE)) blockers.push(`type "${data.type}" não vira página`);
  if (!ISO_DATE.test(yamlDate(data.verificado_em))) blockers.push("verificado_em sem data");
  if (/<!--\s*VERIFY/.test(rawBody)) blockers.push("marcadores VERIFY em aberto");
  if (data.slug !== file.replace(/\.md$/, "")) blockers.push("slug não bate com o nome do arquivo");
  return blockers;
}

/** Markdown → plain text, for meta descriptions and JSON-LD. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

function splitBody(rawBody: string) {
  // Drafts carry internal <!-- VERIFY/COMPLIANCE --> notes — never public.
  const clean = rawBody.replace(/<!--[\s\S]*?-->/g, "").trim();
  const heading = FAQ_HEADING.exec(clean);
  if (!heading) return { body: clean, faqText: "", closing: "" };
  const rest = clean.slice(heading.index + heading[0].length);
  const rule = /^---\s*$/m.exec(rest);
  return {
    body: clean.slice(0, heading.index).trim(),
    faqText: rule ? rest.slice(0, rule.index) : rest,
    closing: rule ? rest.slice(rule.index + rule[0].length).trim() : "",
  };
}

// FAQ convention in every draft: a paragraph opening with the bold question
// ("**…?**") followed by the answer; later paragraphs continue that answer.
function parseFaq(text: string): ExplainerFaq[] {
  const items: { q: string; a: string }[] = [];
  for (const paragraph of text.split(/\n\s*\n/)) {
    const p = paragraph.trim();
    if (!p) continue;
    const question = /^\*\*([^*]+\?)\*\*\s*([\s\S]*)$/.exec(p);
    if (question) items.push({ q: question[1].trim(), a: question[2].trim() });
    else if (items.length > 0) items[items.length - 1].a += `\n\n${p}`;
  }
  return items
    .filter((item) => item.a)
    .map((item) => ({ ...item, aText: plainText(item.a) }));
}

function scan(dir: string) {
  const pages: ExplainerPage[] = [];
  const pending: PendingDraft[] = [];

  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  for (const file of files) {
    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(readFileSync(join(dir, file), "utf8"));
    } catch {
      // A hand-edited frontmatter typo must not break the whole build — it
      // just keeps that one draft off the site until someone fixes it.
      pending.push({
        slug: file.replace(/\.md$/, ""),
        type: "",
        title: file,
        compliance: "",
        blockers: ["frontmatter YAML inválido (valor com ': ' precisa de aspas)"],
      });
      continue;
    }
    const { data, content } = parsed;
    const blockers = publishBlockers(file, data, content);
    const slug = String(data.slug ?? file.replace(/\.md$/, ""));
    const title = String(data.title ?? slug);

    if (blockers.length > 0) {
      pending.push({
        slug,
        type: String(data.type ?? ""),
        title,
        compliance: String(data.compliance_check ?? ""),
        blockers,
      });
      continue;
    }

    const type = data.type as ExplainerType;
    const { body, faqText, closing } = splitBody(content);
    const firstParagraph = body.split(/\n\s*\n/)[0] ?? "";
    const path = `${SECTION_BY_TYPE[type]}/${slug}`;
    pages.push({
      slug,
      type,
      title,
      queryTarget: String(data.query_target ?? ""),
      description: truncate(plainText(firstParagraph), 155),
      body,
      faq: parseFaq(faqText),
      closing,
      sources: ((data.sources as unknown[]) ?? [])
        .map(String)
        .filter((s) => s.startsWith("https://")),
      verificadoEm: yamlDate(data.verificado_em),
      path,
      url: `${SITE_URL}${path}`,
    });
  }

  return { pages, pending };
}

// Several build-time consumers (both routes, sitemap, llms.txt) read the
// same folder — parse it once per directory.
const cache = new Map<string, ReturnType<typeof scan>>();

function scanCached(dir: string) {
  let result = cache.get(dir);
  if (!result) {
    result = scan(dir);
    cache.set(dir, result);
  }
  return result;
}

export function getExplainerPages(dir = DRAFTS_DIR): ExplainerPage[] {
  return scanCached(dir).pages;
}

export function getPendingDrafts(dir = DRAFTS_DIR): PendingDraft[] {
  return scanCached(dir).pending;
}

export function getExplainersBySection(section: ExplainerSection, dir = DRAFTS_DIR) {
  return getExplainerPages(dir).filter((p) => SECTION_BY_TYPE[p.type] === section);
}

export function getExplainerPage(
  section: ExplainerSection,
  slug: string,
  dir = DRAFTS_DIR,
): ExplainerPage | null {
  return getExplainersBySection(section, dir).find((p) => p.slug === slug) ?? null;
}

/** Sibling pages for internal linking — same type first, then the rest. */
export function relatedExplainers(page: ExplainerPage, limit = 3, dir = DRAFTS_DIR) {
  const others = getExplainerPages(dir).filter((p) => p.slug !== page.slug);
  return [
    ...others.filter((p) => p.type === page.type),
    ...others.filter((p) => p.type !== page.type),
  ].slice(0, limit);
}
