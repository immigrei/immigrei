# Slack Content Pipeline Setup

This document walks through configuring the Slack integration for the content pipeline:
Slack → Content Agent (Claude) → Approval (Block Kit) → Postiz

## Architecture

```
Slack slash command: /content-agent "topic"
  ↓
POST /api/slack-trigger (webhook)
  ↓
validate signature → generate draft via Anthropic API
  ↓
save state to Supabase (content_pipeline table)
  ↓
post draft in thread with approval buttons (Block Kit)
  ↓
human reacts with ✅ (approve), ❌ (reject), ✏️ (edit)
  ↓
update status in Supabase → trigger Postiz API (if approved)
```

## Prerequisites

- Slack workspace admin access
- Anthropic Console access (for API key)
- Vercel environment variable access
- Supabase console access

## Step 1: Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Name: `Immigrei Content Pipeline`
4. Workspace: select your workspace
5. Click **Create App**

## Step 2: Configure OAuth & Permissions

1. Left sidebar → **OAuth & Permissions**
2. Scroll to **Scopes** → **Bot Token Scopes**
3. Add these scopes:
   - `chat:write` — post messages
   - `chat:write.public` — post in public channels
   - `commands` — register slash commands
   - `channels:history` — read channel history (for reactions)
   - `reactions:read` — read reactions
4. Scroll up → **OAuth Tokens for Your Workspace**
5. Click **Install to Workspace** (or reinstall if already done)
6. Copy **Bot User OAuth Token** (starts with `xoxb-`)
   - Save this as `SLACK_BOT_TOKEN` in Vercel

## Step 3: Register Slash Command

1. Left sidebar → **Slash Commands** → **Create New Command**
2. Command: `/content-agent`
3. Request URL: `https://immigrei.vercel.app/api/slack-trigger`
   - (Replace with your actual Vercel domain if different)
4. Short Description: `Disparar Content Agent para gerar rascunho de conteúdo`
5. Usage hint: `"tema do conteúdo aqui"` (optional)
6. Escape channels, users, and list of channels: all **OFF**
7. Click **Save**

## Step 4: Configure Event Subscriptions

1. Left sidebar → **Event Subscriptions**
2. Toggle **Enable Events** → ON
3. Request URL: `https://immigrei.vercel.app/api/slack-trigger`
4. Wait for verification (should say ✓ Verified)
5. Scroll to **Subscribe to bot events**
6. Add these event types:
   - `message` — for tracking message threads
   - `app_mention` — if you want to mention the bot
   - `reaction_added` — for approval reactions (✅, ❌, ✏️)
7. Click **Save Events**

## Step 5: Get Signing Secret

1. Left sidebar → **Basic Information**
2. Find **Signing Secret** under "App Credentials"
3. Copy it (starts with `sig_`)
4. Save this as `SLACK_SIGNING_SECRET` in Vercel

## Step 6: Configure Vercel Environment Variables

Add these to Vercel → Project Settings → Environment Variables:

```
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=sig_...
ANTHROPIC_API_KEY=sk-ant-...
```

### `SLACK_BOT_TOKEN`
- Source: OAuth & Permissions → Bot User OAuth Token
- Access: post messages, react to threads, update status

### `SLACK_SIGNING_SECRET`
- Source: Basic Information → Signing Secret
- Access: verify incoming Slack requests are authentic

### `ANTHROPIC_API_KEY`
- Source: [console.anthropic.com](https://console.anthropic.com) → API Keys
- Create a new project called `immigrei-automation` to isolate this usage
- Create an API key in that project
- Cost: ~$5–10/month estimated for this volume

## Step 7: Apply Supabase Migration

1. In local development: `supabase migration up`
2. In production: apply via Vercel dashboard using Supabase CLI or UI
3. Verify table exists: Supabase Dashboard → SQL Editor
   - Run: `SELECT * FROM content_pipeline LIMIT 1;`

## Step 8: Test End-to-End

1. In Slack, go to a channel where the Immigrei bot is installed
2. Type: `/content-agent "test: visa bulletin status message"`
3. Expect:
   - Immediate ack: ⏳ Disparando Content Agent...
   - Draft posted in thread within 5 seconds
   - Buttons for ✅ Approve, ❌ Reject, ✏️ Edit
4. Click ✅ to approve
5. Thread should update with confirmation

### Debugging

If the slash command doesn't work:
- Check Vercel logs: `vercel logs`
- Check Slack app error logs: api.slack.com/apps → [app name] → Activity
- Verify signing secret is correct: decode JWT if needed
- Verify webhook URL is reachable (should return 200 with `{"ok": true}` for test requests)

## Step 9: Connect Postiz (for Publishing)

Once approvals are working, integrate Postiz:

1. In `/api/slack-trigger/route.ts`, uncomment the Postiz section
2. Get Postiz API key from their dashboard
3. Add `POSTIZ_API_KEY` to Vercel env
4. Approved drafts will auto-publish to Instagram, Facebook, TikTok, LinkedIn

## Future: Add Interactive Buttons Instead of Reactions

Currently, approval uses emoji reactions (✅, ❌, ✏️). To upgrade to Block Kit interactive buttons:

1. Modify `/api/slack-trigger/route.ts` → `buildApprovalBlocks()`
2. Enable **Interactivity** in Slack App settings
3. Set Request URL: `https://immigrei.vercel.app/api/slack-interactions`
4. Create new route: `app/api/slack-interactions/route.ts`
5. Handle `action_id` values from button clicks

This is the recommended long-term approach (more reliable than emoji reactions).

## Costs

| Service | Cost | Notes |
|---------|------|-------|
| Anthropic API | ~$5–10/mo | Pay-per-token, ~500 words per draft × ~20 drafts/month |
| Slack | $0 | Free tier sufficient for this webhook + slash commands |
| Supabase | $0 | Uses free tier storage |
| Vercel | $0 | Serverless function calls are within free tier |

## Troubleshooting

### "invalid signature" error
- Verify `SLACK_SIGNING_SECRET` is correct
- Check that it's the Signing Secret, not the OAuth token
- Timing issue? Slack rejects requests older than 5 minutes

### "Chat postMessage failed"
- Verify `SLACK_BOT_TOKEN` is correct
- Verify bot is installed in the target channel
- Check scopes include `chat:write`

### "Anthropic API error"
- Verify `ANTHROPIC_API_KEY` is set and correct
- Check account has available credits
- Check rate limits (shouldn't be hit at this volume)

### "Supabase error"
- Verify migration was applied: `SELECT * FROM content_pipeline;`
- Check service role key is set in `.env.local` (local development)

## References

- [Slack API Docs](https://api.slack.com/docs)
- [Slack Slash Commands](https://api.slack.com/interactivity/slash-commands)
- [Slack Events API](https://api.slack.com/events-api)
- [Slack Block Kit](https://api.slack.com/block-kit)
- [Anthropic API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
