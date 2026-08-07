# Slack Content Pipeline — Implementation Summary

**Status:** Skeleton complete, ready for setup & testing  
**Last updated:** 2026-08-07

## What was built

The skeleton of the Slack → Content Agent → Approval → Postiz pipeline.

```
Slack /content-agent "topic"
  ↓
POST /api/slack-trigger
  ├─ Validate signature (HMAC-SHA256)
  ├─ Generate draft (Anthropic API)
  ├─ Save state (Supabase)
  ├─ Post approval buttons (Block Kit)
  └─ Return 200 to Slack
      ↓
  Human reviews & reacts
  ✅ (approve) → Update status → Ready for Postiz
  ❌ (reject) → Mark as rejected
  ✏️ (edit) → Flag for revision
```

## Files created

### 1. **API Route:** `/app/api/slack-trigger/route.ts`
- ~165 lines, dependency-injected from `lib/slack-pipeline.ts`
- Handles slash commands (`/content-agent`)
- Handles event subscriptions (reactions)
- URL verification (Slack handshake)

**Entry points:**
- `POST /api/slack-trigger` — receives all Slack events

**Logic flow:**
1. Validate Slack request signature (prevents spoofing)
2. Parse payload type (URL verification, slash command, event)
3. For slash commands:
   - Generate draft via Anthropic API
   - Save to Supabase (`content_pipeline` table)
   - Post draft + approval buttons to Slack thread
4. For reactions:
   - Update status in Supabase
   - Post confirmation in thread

### 2. **Utilities:** `/lib/slack-pipeline.ts`
- ~280 lines of reusable functions
- Types: `SlackPayload`, `SlackEvent`, `ContentPipelineRecord`
- Functions:
  - `validateSlackSignature()` — HMAC-SHA256 validation + replay protection
  - `postToSlack()` — send messages via bot token or response URL
  - `generateContentDraft()` — call Anthropic API with system prompt
  - `buildApprovalBlocks()` — Block Kit buttons for thread
  - `reactionToStatus()` — map emoji to approval status
  - `buildApprovalNotification()` — confirmation messages

### 3. **Database:** `/supabase/migrations/20260807_create_content_pipeline.sql`
- `content_pipeline` table with columns:
  - `trigger_id` — Slack message timestamp (unique identifier)
  - `user_id` — who triggered the command
  - `channel_id` — where it was triggered
  - `topic` — user's input
  - `draft_content` — generated text
  - `status` — pending_approval | approved | rejected | edit_requested | published | failed
  - `approved_by`, `approved_at` — approval metadata
  - `postiz_post_id` — for linking to published content
  - Indexes on status, user_id, created_at

### 4. **Setup Guide:** `/docs/SLACK_PIPELINE_SETUP.md`
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

1. **Content Agent** — currently calls Anthropic directly with a basic prompt
   - Future: could integrate with the `content-agent` Claude Code skill (more sophisticated)
   - Trade-off: direct API is simpler to deploy, skill-based would need async job handling

2. **Approval flow** — uses emoji reactions (async, can miss reactions)
   - Better: Block Kit interactive buttons (already in code, just needs interactivity route)
   - To upgrade: enable Interactivity in Slack App, create `/api/slack-interactions/route.ts`

3. **No undo/edit flow** — once rejected/approved, no re-do button
   - Future: add manual "reopen" workflow or queue for revision

4. **No rate limiting** — any user can spam `/content-agent`
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

## Cost estimate (monthly)

| Service | Usage | Cost |
|---------|-------|------|
| Anthropic API | ~20 drafts × 500 words | ~$0.10–$0.50 |
| Slack | Slash commands + events | $0 (free tier) |
| Supabase | ~100 records | $0 (free tier) |
| Vercel | ~20 function invocations | $0 (free tier) |
| **Total** | | **<$1** |

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
