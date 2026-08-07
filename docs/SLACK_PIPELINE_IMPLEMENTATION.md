# Slack Content Pipeline — Implementation Summary

**Status:** Skeleton complete — content-agent, compliance-fact-check gate, and dual-founder approval wired in — ready for setup & testing  
**Last updated:** 2026-08-07

## Dual-founder approval

Publishing now requires **both** César and Felipe to react ✅ — a single
approval is not enough. Configure with `SLACK_REQUIRED_APPROVERS` (comma-
separated Slack user IDs). Mechanics:

- 1st ✅ → status stays `pending_approval`, thread shows "X aprovou (1/2).
  Aguardando também: Y"
- 2nd ✅ (from the *other* required approver) → status flips to `approved`,
  thread shows "Aprovado por X e Y! Enviando para Postiz..."
- ❌ or ✏️ from **either** founder is unilateral — no need for both to agree
  to stop or revise something
- Anyone not in `SLACK_REQUIRED_APPROVERS` who reacts gets told they can't
  approve; the reaction is otherwise a no-op
- A reaction on an already-terminal draft (`approved` / `rejected` /
  `published`) is ignored with a note, so a late reaction can't reopen a
  decided item
- Approving is still blocked outright if `compliance_verdict = FAIL`,
  regardless of who reacts

## Which of the 6 marketing skills are in this pipeline

| Skill | In Slack pipeline? | Why |
|-------|--------------------|-----|
| `content-agent` | ✅ Yes | Generates the draft — the core of the flow |
| `compliance-fact-check` | ✅ Yes (mandatory gate) | YMYL/UPL risk — every draft must pass before a human sees an approve button |
| `distribution-assist` | ❌ No | Its own rule: "NEVER posts anywhere; the human presses post." It repurposes an *already-published* post into founder-led community assets (Reels, carousel, comment drafts for FB groups/WhatsApp/Reddit) — a separate, manual, downstream workflow, not part of automated approval→publish |
| `seo-geo-agent` | ❌ No | Optimizes blog/landing-page content for Google ranking — doesn't apply to social posts |
| `lifecycle-email` | ❌ No | Different channel (email), different trigger (user lifecycle events, not a topic) |
| `paid-experiment` | ❌ No | Ads strategy — a separate, deliberate spend decision, not something to auto-run off a Slack command |

## What was built

Slack → Content Agent → **Compliance-Fact-Check gate** → Approval → Postiz.

```
Slack /content-agent "topic"
  ↓
POST /api/slack-trigger
  ├─ Validate signature (HMAC-SHA256)
  ├─ Generate draft (content-agent, Anthropic API)
  ├─ Save state (Supabase, status=pending_compliance)
  ├─ Run compliance-fact-check (real tool-use loop: read_file/grep/glob
  │  against content/leis/, web_fetch restricted to official-source whitelist)
  ├─ FAIL  → post flags to thread, status=compliance_failed, NO approval buttons
  ├─ PASS/PASS_WITH_FLAGS → post draft + compliance summary + approval buttons
  └─ Return 200 to Slack
      ↓
  Human reviews & reacts (only reachable after a non-FAIL verdict)
  ✅ (approve) → blocked again server-side if compliance_verdict=FAIL → else update status → ready for Postiz
  ❌ (reject) → mark as rejected
  ✏️ (edit) → flag for revision
```

**Why compliance-fact-check runs as real tool use, not a second prompt:** the
skill's whole job is tracing every factual claim to `content/leis/` and
catching UPL language — that requires actually reading those files. A
"compliance check" that just asks Claude to remember the rules from a system
prompt isn't a check for a YMYL topic like immigration law; it's decoration.
`lib/compliance-check.ts` implements the same read_file/grep/glob/web_fetch
tools `.claude/agents/compliance-fact-check.md` specifies, scoped to the
repo's bundled `content/leis/` directory (read-only, available at Vercel
runtime) and to the domain whitelist in `content/leis/fontes.md`.

## Files created

### 1. **API Route:** `/app/api/slack-trigger/route.ts`
- Handles slash commands (`/content-agent`)
- Handles event subscriptions (reactions)
- URL verification (Slack handshake)
- Enforces the compliance gate before any approval UI is shown, and again
  server-side before honoring a ✅ reaction (defense in depth — someone could
  react on the FAIL message directly)

**Entry points:**
- `POST /api/slack-trigger` — receives all Slack events

**Logic flow:**
1. Validate Slack request signature (prevents spoofing)
2. Parse payload type (URL verification, slash command, event)
3. For slash commands:
   - Generate draft via Anthropic API (content-agent)
   - Save to Supabase, `status=pending_compliance`
   - Run compliance-fact-check gate
   - FAIL → post flags, stop (no approval UI)
   - else → post draft + compliance summary + approval buttons to Slack thread
4. For reactions:
   - Refuse ✅ server-side if `compliance_verdict=FAIL`
   - Update status in Supabase
   - Post confirmation in thread

### 2. **Utilities:** `/lib/slack-pipeline.ts`
- Reusable functions for Slack + content-agent
- Types: `SlackPayload`, `SlackEvent`, `ContentPipelineRecord`
- Functions:
  - `validateSlackSignature()` — HMAC-SHA256 validation + replay protection
  - `postToSlack()` — send messages via bot token or response URL
  - `generateContentDraft()` — call Anthropic API with the content-agent system prompt
  - `buildApprovalBlocks()` — Block Kit buttons for thread
  - `reactionToStatus()` — map emoji to approval status
  - `buildApprovalNotification()` — confirmation messages

### 3. **Compliance gate:** `/lib/compliance-check.ts`
- `runComplianceCheck(draft, topic, apiKey)` — real agentic tool-use loop
  mirroring `.claude/agents/compliance-fact-check.md`
- Tools implemented against the live repo (bundled read-only at Vercel runtime):
  - `read_file` — reads a repo-relative file (capped to 8KB)
  - `grep` — regex search across `content/leis/` + `lib/uscis-status-pt.ts`
  - `glob` — lists files under `content/leis/` matching a pattern
  - `web_fetch` — fetches a URL, **hard-refuses** any host not in the
    `content/leis/fontes.md` whitelist (uscis.gov, ecfr.gov, travel.state.gov, etc.)
- Loop caps at 10 tool-use iterations to bound cost/latency
- `parseVerdict()` — extracts `VERDICT`, `FLAGS`, `VERIFIED CLAIMS`, `UNVERIFIED`
  from the model's final text block
- `formatComplianceForSlack()` — renders the verdict as a Slack mrkdwn block

### 4. **Database:**
- `/supabase/migrations/20260807_create_content_pipeline.sql` — `content_pipeline` table:
  - `trigger_id` — Slack message timestamp (unique identifier)
  - `user_id` — who triggered the command
  - `channel_id` — where it was triggered
  - `topic` — user's input
  - `draft_content` — generated text
  - `status` — pending_compliance | compliance_failed | pending_approval | approved | rejected | edit_requested | published | failed
  - `approved_by`, `approved_at` — approval metadata
  - `postiz_post_id` — for linking to published content
  - Indexes on status, user_id, created_at
- `/supabase/migrations/20260807b_add_compliance_columns.sql` — adds:
  - `compliance_verdict` — PASS | PASS_WITH_FLAGS | FAIL
  - `compliance_report` — full raw verdict text (flags, unverified claims)
  - `compliance_checked_at`
- `/supabase/migrations/20260807c_add_dual_approval.sql` — adds:
  - `approved_by_users` — text array; source of truth for "has everyone approved"

### 5. **Setup Guide:** `/docs/SLACK_PIPELINE_SETUP.md`
- Step-by-step instructions for:
  - Creating Slack App
  - Configuring OAuth scopes
  - Registering slash command
  - Enabling event subscriptions
  - Getting API keys (Slack, Anthropic)
  - Testing end-to-end

## Environment variables needed

Add to Vercel:

```
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=sig_...
ANTHROPIC_API_KEY=sk-ant-...
```

Optional (for future Postiz integration):
```
POSTIZ_API_KEY=...
```

## Next steps (in order)

### Phase 1: Verify setup
1. **Create Slack App** — follow `/docs/SLACK_PIPELINE_SETUP.md` steps 1–5
2. **Get credentials** — copy bot token + signing secret
3. **Configure Vercel env** — add the 3 required variables
4. **Apply migration** — `supabase migration up` (or via Supabase UI)
5. **Deploy** — push branch to Vercel

### Phase 2: Test slash command
1. Go to Slack workspace → any channel
2. Type: `/content-agent "test: O que significa status 'Request for Additional Evidence'?"`
3. Expect:
   - Immediate ack: ⏳ Gerando rascunho...
   - Draft posted in thread within 5 seconds
   - Buttons: ✅ Approve, ❌ Reject, ✏️ Edit
4. Click ✅ to approve
5. Thread should update: ✅ Aprovado!

**Also verify the compliance gate fires:**
- Between draft and approval buttons, the thread should show
  ":mag: Rodando compliance-fact-check..." then either the compliance summary
  (PASS/PASS_WITH_FLAGS, buttons appear) or a 🚨 FAIL message with flags and
  no buttons at all.
- Try a topic likely to trigger a FAIL (e.g. one that invites "você deve
  aplicar para X") to confirm the block actually works, not just the happy path.

### Phase 3: Test reactions (if using emoji instead of buttons)
- Current implementation uses emoji reactions: `white_check_mark`, `x`, `pencil2`
- Alternative: upgrade to Block Kit buttons (better UX, more reliable)
- See "Future improvements" section below

### Phase 4: Connect Postiz
1. In `/api/slack-trigger/route.ts`, uncomment Postiz section (when ready)
2. Get Postiz API key from their dashboard
3. Add `POSTIZ_API_KEY` to Vercel env
4. Test: approve a draft → should appear queued in Postiz

### Phase 5: Add error alerting
- Set up Sentry integration (one-time setup)
- Create Slack webhook for alerts channel
- Config Sentry to route `/api/slack-trigger` errors to Slack

## Current limitations

1. **Content Agent** — currently calls Anthropic directly with a condensed
   system prompt, not the full `.claude/skills/content-agent/SKILL.md` research
   pipeline (it doesn't read `content/leis/` before drafting the way the real
   skill does — only compliance-fact-check does real file access today)
   - Future: give content-agent the same read_file/grep/glob tools compliance
     already has, so it drafts from the knowledge base instead of general
     model knowledge
   - Trade-off: direct API is simpler to deploy; tool-using generation costs
     more tokens and latency per draft

2. **Compliance-fact-check** — implemented as a real tool-use loop (see above),
   capped at 10 tool iterations. A draft needing more research than that will
   hit the cap and fail to converge (throws, surfaces as an error in Slack) —
   watch for this in testing; raise the cap if it happens often.

3. **Approval flow** — uses emoji reactions (async, can miss reactions)
   - Better: Block Kit interactive buttons (already in code, just needs interactivity route)
   - To upgrade: enable Interactivity in Slack App, create `/api/slack-interactions/route.ts`

4. **No undo/edit flow** — once rejected/approved, no re-do button
   - Future: add manual "reopen" workflow or queue for revision

5. **No rate limiting** — any user can spam `/content-agent`
   - Future: add per-user quota or require channel membership

## Security considerations

✅ **Implemented:**
- HMAC-SHA256 signature validation (prevents spoofing)
- Timestamp validation (prevents replay attacks, 5-min window)
- Timing-attack-resistant comparison
- Service role key only (no user-row-level access for now)

🚧 **Not yet:**
- Rate limiting per user
- Audit trail (who approved when)
- Encryption of draft content
- PII scrubbing before Postiz

## Testing checklist

Before marking as complete:

- [ ] Slack App created & installed in workspace
- [ ] `/content-agent` slash command works (ack + draft in thread)
- [ ] Approval buttons appear and update status in Supabase
- [ ] Error messages appear in thread if API fails
- [ ] Vercel logs show no 500 errors
- [ ] `content_pipeline` table populated after first test
- [ ] Anthropic API usage appears in console.anthropic.com
- [ ] A FAIL-worthy topic actually gets blocked (no approval buttons, flags shown)
- [ ] A PASS/PASS_WITH_FLAGS topic shows the compliance summary alongside buttons
- [ ] Reacting ✅ on a `compliance_failed` row is refused (test by reacting on
      the FAIL message directly, not just trusting the missing buttons)
- [ ] A single founder's ✅ leaves status at `pending_approval` and posts "1/2"
- [ ] The second founder's ✅ flips status to `approved` and posts the full notice
- [ ] A non-founder's ✅/❌/✏️ is refused and does not change status
- [ ] ❌ or ✏️ from one founder alone takes effect immediately (no waiting for both)
- [ ] Reacting again on an already-`approved`/`rejected` row is ignored with a note

## Cost estimate (monthly)

Compliance-fact-check adds a second, tool-using API call per draft (multiple
turns while it reads `content/leis/`), which costs more than the single-shot
draft generation.

| Service | Usage | Cost |
|---------|-------|------|
| Anthropic API — content-agent | ~20 drafts × 500 words | ~$0.10–$0.50 |
| Anthropic API — compliance-fact-check | ~20 checks × up to 10 tool turns | ~$0.50–$2.00 |
| Slack | Slash commands + events | $0 (free tier) |
| Supabase | ~100 records | $0 (free tier) |
| Vercel | ~20 function invocations | $0 (free tier) |
| **Total** | | **~$1–3** |

## Files not modified

- No existing app code changed
- No breaking changes to auth, payments, or other flows
- All new routes scoped to `/api/slack-trigger/*`

## References

- [Slack API Docs](https://api.slack.com/docs)
- [Slack Slash Commands](https://api.slack.com/interactivity/slash-commands)
- [Slack Events API](https://api.slack.com/events-api)
- [Slack Block Kit](https://api.slack.com/block-kit)
- [Anthropic API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Supabase SQL](https://supabase.com/docs/guides/getting-started/quickstart)

---

**Ready to set up?** Start with `/docs/SLACK_PIPELINE_SETUP.md` Step 1.
