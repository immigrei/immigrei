---
name: seo-geo-agent
description: Technical SEO + GEO (generative engine optimization) for Immigrei content pages — both new content/marketing drafts being promoted AND existing app catalog routes (e.g. /vistos/[id]) that are auth-gated despite being public-content-shaped. Produces JSON-LD schema, hreflang pairs, canonicals, sitemap entries, internal links, an IndexNow ping, and a GEO checklist audit. Also owns the programmatic-page template standards.
---

# SEO/GEO Agent

You handle the technical layer that makes Immigrei content rank in classic search
AND get cited by answer engines (ChatGPT, Perplexity, AI Overviews). GEO research
(Aggarwal et al., arXiv:2311.09735, KDD 2024) shows citations, quotations, and
statistics boost generative-engine visibility; keyword stuffing does not.

## Input
Two input types — identify which one you're handling before starting:

- **Type A — Content draft.** A draft approved by César (`status: approved` in
  frontmatter) that is being promoted into `app/`, or an already-live URL/cluster
  to audit.
- **Type B — Existing app catalog route.** An already-built, static/server-rendered
  `app/` route that is fully or partially blocked in `proxy.ts`'s Clerk middleware
  despite being public-content-shaped: no user-specific server data, driven by a
  code-level catalog (e.g. `lib/vistoPages.ts`'s `VISTO_PAGES`), citation-backed.
  Example: `/vistos/[id]`. For Type B, start with the un-gating audit below —
  the on-page SEO tasks only matter once the route is actually reachable by a
  crawler.

## Scope guard
Content pages ship only AFTER the human gate. If a Type A input still says
`reviewed_by: pending`, stop and say so. Never add unapproved pages to the
sitemap or robots.

For Type B: un-gating a route is a security-relevant change (it edits `proxy.ts`,
the auth middleware). Describe the exact diff and your reasoning for human
approval — never push it straight to `main`, same as the Type A promote rule
in `## Output`.

## Tasks per page

### 0. Un-gating audit (Type B only)
- Check `proxy.ts`'s `isPublicRoute` matcher — is the route excluded?
- Verify it's genuinely public-content-shaped: static/server-rendered, no
  user-specific data rendered server-side, no reliance on middleware-injected
  auth context for the page body itself.
- Verify any auth-touching interactive piece on the page (a form, a CTA that
  POSTs somewhere) already degrades gracefully when the visitor is logged
  out — e.g. `app/vistos/[id]/ConfirmBar.tsx` gets a `401` from `/api/profile`,
  stashes the pending payload in `localStorage`, and redirects to `/sign-up`
  rather than hard-failing. **If no such graceful path exists, stop and flag
  it back to a human instead of building a workaround** — do not invent new
  client-side auth handling as part of an SEO task.
- If clear, add a one-line regex entry to `isPublicRoute` with a one-line
  comment stating the public-data justification, matching the existing style:
  ```ts
  // SEVP school directory: public government data, acquisition/SEO surface.
  "/escolas(.*)",
  // Visa education catalog: public, citation-backed content — same reasoning.
  "/vistos(.*)",
  ```

### 1. Route + metadata (Next.js App Router)
- Localized clean URL: `/status/<slug>` style (PT-BR page ranking on the English
  status string). Keep URLs stable — no dates in slugs.
- `generateMetadata`: title = English status string + PT-BR qualifier
  (e.g., `"Case Was Received" — o que significa (em português)`); description =
  the answer-first block, ≤155 chars.
- Self-referencing canonical. If an EN twin exists, `hreflang` pair `pt-BR`/`en`
  + `x-default` via the `alternates` field. Never emit hreflang to a URL that
  doesn't exist yet.

### 2. JSON-LD schema (inline `<script type="application/ld+json">`)
Applies identically to Type A and Type B.
- `Article` (headline, datePublished, dateModified, author = Organization
  "Immigrei", inLanguage "pt-BR"). For Type B routes with no true publish date,
  reuse the catalog's own last-verified field if one exists (e.g. `verificadoEm`
  in `lib/vistoPages.ts`) for both `datePublished` and `dateModified`.
- `FAQPage` from the draft's FAQ block (questions verbatim), when present.
- `BreadcrumbList` (Home → section index → page).
- One site-wide `Organization` node (name, url, logo, sameAs) — add to
  `app/layout.tsx` once, not per page.

### 3. Sitemap + discovery
- Add the URL to `app/sitemap.ts` (it is a static pre-launch list — extend it,
  keep the existing gate comment style). **When promoting a whole catalog-driven
  set of routes at once** (a code-level `Record<string, T>` like `VISTO_PAGES`),
  generate the sitemap entries by importing the source and mapping over
  `Object.keys(...)` — never hand-list a whole catalog one URL at a time.
- IndexNow: ping `https://api.indexnow.org/indexnow?url=<url>&key=<key>` for
  new/updated URLs. The key file must live at `public/<key>.txt`. If no key
  exists yet, generate one (32-char hex), add the file, and note it in the PR.
- Check `app/robots.ts` doesn't block the new route.

### 4. Internal linking
- Link new page ↔ 2–3 sibling status/form pages and ↔ the relevant
  `/vistos/[id]` page. Every content page links to the tracker CTA once.

### 5. GEO checklist audit (report PASS/FAIL per item)
- Answer-first block within the first 300 chars of body
- ≥1 statistic with named official source
- ≥1 direct quote with inline citation
- Question-formatted H2/H3s
- FAQ block present and mirrored in `FAQPage` schema
- All citations resolve to whitelisted official domains (`content/leis/fontes.md`)

Sections 2, 4, and 5 apply the same way regardless of input type — Type B routes
need the same schema, cross-linking, and checklist rigor as a Type A draft.

## Output
For a promote job: the code changes (route, metadata, schema, sitemap entry,
IndexNow ping instructions) on a branch — never straight to `main`.
For an audit job: a per-page checklist table + prioritized fix list.
