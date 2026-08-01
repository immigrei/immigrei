---
name: stack-status
description: Audits every connector in Immigrei's stack — Supabase, Clerk, Stripe, Sentry, PostHog, Resend, USCIS API, Vercel crons, GitHub Actions CI — plus the MCP tools available to Claude in the current session, flags what's wired vs. missing/needs-auth, and publishes a hosted status dashboard Artifact. Use when the user asks for a "connector dashboard", "stack status", "what's connected", "o que falta conectar", or wants a gap check across integrations.
---

# Stack Status Dashboard

A read-only audit that turns into a hosted Artifact. Never guess connector
status from memory — always re-derive it from the repo and the current
session, since both drift between runs.

## 1. Scan the codebase (read-only)

- `package.json` — dependencies that imply a connector (stripe, resend,
  @sentry/nextjs, posthog-js, @clerk/nextjs, @supabase/supabase-js, etc.)
- `grep -rhoE "process\.env\.[A-Z_0-9]+"` across `app/` and `lib/` — every env
  var the code actually reads
- `.env.local` — `grep -oE "^[A-Z_0-9]+=" .env.local` for **key names only,
  never values** — cross-reference against the vars found above to see
  what's referenced-but-unset
- `vercel.json` — cron jobs and schedules
- `app/api/webhooks/*` and `app/api/cron/*` — what's actually wired vs. just
  configured
- Sentry: check for `sentry.client.config.ts` / `sentry.server.config.ts` /
  `sentry.edge.config.ts` — a missing client config with the package
  installed means browser errors aren't captured
- `.github/workflows/` — CI coverage
- `.claude/skills/` and `.claude/agents/` rosters

Grep for actual usage, not just presence — e.g. `lib/uscis.ts` sets
`USCIS_API_BASE` default to the sandbox host (`api-int.uscis.gov`); flag
sandbox-vs-production distinctly from "wired". Read `lib/notifications.ts`
(or equivalent) to see which transactional flows are actually implemented,
not just which package is installed.

## 2. Cross-check known context

Read the "Known gaps" section of `CLAUDE.md` and check
`~/.claude/projects/-Users-cesaraugustotse-Developer-Immigrei-app/memory/`
for project memories (e.g. launch sequencing) that explain *why* something
is intentionally deferred vs. actually broken. Don't flag an intentional
deferral as an accidental gap — say which it is.

## 3. Read MCP connector state for this session

The system reminders at session start list: tools already loaded,
deferred-tool names (available via ToolSearch), servers requiring auth, and
servers still connecting. Split into three buckets: connected, pending auth
(tell the user these need claude.ai connector settings or `/mcp` —
never something you can authorize), still connecting.

## 4. Classify every finding

- ✅ **ok** — wired and confirmed in use
- ⚠️ **warn** — package/key present but partial, unconfirmed, or
  intentionally sandboxed
- 🔴 **crit** — blocks real functionality (e.g. production data path running
  against sandbox)
- ⚪ **mute** — informational / not required for the product (e.g. unrelated
  personal MCPs, unauthenticated optional tools)

## 5. Publish the dashboard

Before writing HTML, load the `artifact-design` skill — this is a UI/tool,
not a document: lead with a summary strip (counts by severity), put alerts
above the fold, use semantic color separate from the brand accent, tabular
digits, and evidence paths in a monospace chip so findings are checkable at
a glance. Follow Immigrei's brand tokens from `CLAUDE.md` §4 (pine/amber/
cream/ink/sage/clay) for both light and dark themes — this is an internal
ops tool, not marketing, so keep type utilitarian (no Fraunces on
functional rows; a serif touch on the H1 alone is enough of a brand nod).

**Reuse the same hosted link on every run**: call `Artifact` with
`action: "list"` first and look for the artifact titled "Immigrei — Status
dos Conectores". If found, republish with its `url` so the link stays
stable; otherwise publish fresh with `favicon: "🔌"` (keep this favicon on
every future run — don't change it).

Write the working HTML file to the scratchpad directory, not into the
Immigrei repo — this is an ops artifact, not app code.

## 6. Summarize in chat

After publishing, give the user a short text summary (counts + the 1–3 most
severe alerts) — don't make them open the link to know if something's on
fire.
