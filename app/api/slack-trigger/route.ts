import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  validateSlackSignature,
  postToSlack,
  generateContentDraft,
  buildApprovalBlocks,
  buildApprovalNotification,
  reactionToStatus,
  type SlackPayload,
} from "@/lib/slack-pipeline";

/**
 * Slack event & command handler for the content pipeline.
 * Slack → API trigger → Content Agent → Draft in thread with approval buttons.
 *
 * Setup docs: /docs/SLACK_PIPELINE_SETUP.md
 */

export async function POST(req: NextRequest) {
  const secret = process.env.SLACK_SIGNING_SECRET;
  const botToken = process.env.SLACK_BOT_TOKEN;

  if (!secret || !botToken) {
    console.error("[slack-trigger] Missing SLACK_SIGNING_SECRET or SLACK_BOT_TOKEN");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const timestamp = req.headers.get("x-slack-request-timestamp");
  const signature = req.headers.get("x-slack-signature");
  const body = await req.text();

  // Validate signature and timestamp
  if (!validateSlackSignature(signature, timestamp, body, secret)) {
    console.warn("[slack-trigger] Invalid signature or timestamp");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body) as SlackPayload;

  // Handle Slack URL verification (handshake)
  if (payload.type === "url_verification") {
    return NextResponse.json({ challenge: payload.challenge });
  }

  // Handle slash commands
  if (payload.command) {
    return await handleSlashCommand(payload, botToken);
  }

  // Handle event callbacks
  if (payload.event) {
    return await handleEvent(payload, botToken);
  }

  return NextResponse.json({ ok: true });
}

async function handleSlashCommand(payload: SlackPayload, botToken: string) {
  const { command, text, user_id, channel_id, response_url, trigger_id } = payload;

  if (command !== "/content-agent") {
    return NextResponse.json({ text: "Comando não reconhecido" }, { status: 400 });
  }

  // Acknowledge immediately — Slack expects response within 3 seconds
  // Use response_url for async updates
  (async () => {
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

      // 1. Acknowledge receipt
      await postToSlack(response_url!, { text: ":hourglass_flowing_sand: Gerando rascunho..." });

      // 2. Generate content via Anthropic API
      const draft = await generateContentDraft(text!, apiKey);

      // 3. Save to Supabase for tracking
      const { error } = await supabaseAdmin.from("content_pipeline").insert([
        {
          trigger_id,
          user_id,
          channel_id,
          topic: text,
          draft_content: draft,
          status: "pending_approval",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw new Error(`Falha ao salvar: ${error.message}`);

      // 4. Post draft with approval buttons
      const blocks = buildApprovalBlocks(draft, trigger_id!, user_id);
      await postToSlack(response_url!, { blocks });

      // 5. Reply in channel
      await postToSlack(botToken, {
        channel: channel_id,
        text: `:white_check_mark: Rascunho pronto para aprovação.`,
        thread_ts: trigger_id,
      });
    } catch (err) {
      console.error("[slack-trigger] Slash command error:", err);
      const message = err instanceof Error ? err.message : "erro desconhecido";
      await postToSlack(response_url!, {
        text: `:x: Erro ao gerar rascunho: ${message}`,
      }).catch(() => {
        // Silent fail if response_url is no longer valid
      });
    }
  })();

  return NextResponse.json({ ok: true });
}

async function handleEvent(payload: SlackPayload, botToken: string) {
  const event = payload.event;

  if (!event || event.type !== "reaction_added") {
    return NextResponse.json({ ok: true });
  }

  const { user, reaction, item } = event;
  if (!user || !reaction || !item?.channel || !item?.ts) {
    return NextResponse.json({ ok: true });
  }

  // Handle approval reactions
  (async () => {
    try {
      const status = reactionToStatus(reaction);
      if (!status) return;

      // Update Supabase
      const { error } = await supabaseAdmin
        .from("content_pipeline")
        .update({
          status,
          approved_by: user,
          approved_at: new Date().toISOString(),
        })
        .eq("trigger_id", item.ts);

      if (error) {
        console.error("[slack-trigger] Failed to update pipeline:", error.message);
        return;
      }

      // Notify in thread
      const notification = buildApprovalNotification(status, user);
      await postToSlack(botToken, {
        channel: item.channel,
        thread_ts: item.ts,
        text: notification,
      });
    } catch (err) {
      console.error("[slack-trigger] Reaction handler error:", err);
    }
  })();

  return NextResponse.json({ ok: true });
}

