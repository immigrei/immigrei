import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  validateSlackSignature,
  postToSlack,
  generateContentDraft,
  buildApprovalBlocks,
  buildApprovalNotification,
  reactionToStatus,
  isAuthorizedApprover,
  allApproversDone,
  buildUnauthorizedApproverNotice,
  buildPartialApprovalNotice,
  buildFullApprovalNotice,
  buildApprovalRequirementNotice,
  getRequiredApprovers,
  type SlackPayload,
} from "@/lib/slack-pipeline";
import { runComplianceCheck, formatComplianceForSlack } from "@/lib/compliance-check";

/**
 * Slack event & command handler for the content pipeline.
 * Slack → API trigger → Content Agent → Draft in thread with approval buttons.
 *
 * Setup docs: /docs/SLACK_PIPELINE_SETUP.md
 */

// Slash commands arrive as application/x-www-form-urlencoded (e.g. "token=...&command=...");
// only the Events API (url_verification, reaction_added) sends JSON.
function parseSlackBody(contentType: string | null, body: string): SlackPayload {
  if (contentType?.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(body);
    return {
      command: params.get("command") ?? undefined,
      text: params.get("text") ?? undefined,
      user_id: params.get("user_id") ?? undefined,
      channel_id: params.get("channel_id") ?? undefined,
      response_url: params.get("response_url") ?? undefined,
      trigger_id: params.get("trigger_id") ?? undefined,
    };
  }
  return JSON.parse(body) as SlackPayload;
}

export async function POST(req: NextRequest) {
  const secret = process.env.SLACK_SIGNING_SECRET;
  const botToken = process.env.SLACK_BOT_TOKEN;

  if (!secret || !botToken) {
    console.error("[slack-trigger] Missing SLACK_SIGNING_SECRET or SLACK_BOT_TOKEN");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  if (getRequiredApprovers().length < 2) {
    // Not a hard failure — lets the draft/compliance flow still be testable —
    // but approval can never complete like this, so make it loud.
    console.error(
      "[slack-trigger] SLACK_REQUIRED_APPROVERS has fewer than 2 IDs — dual approval cannot complete. Set it to both founders' Slack user IDs."
    );
  }

  const timestamp = req.headers.get("x-slack-request-timestamp");
  const signature = req.headers.get("x-slack-signature");
  const body = await req.text();

  // Validate signature and timestamp
  if (!validateSlackSignature(signature, timestamp, body, secret)) {
    console.warn("[slack-trigger] Invalid signature or timestamp");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const payload = parseSlackBody(req.headers.get("content-type"), body);

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

      // 2. Generate content via Anthropic API (content-agent)
      const draft = await generateContentDraft(text!, apiKey);

      // 3. Save draft, pending compliance check — no approval buttons yet.
      // A FAIL must never reach a human with an "approve" button next to it.
      const { error: insertError } = await supabaseAdmin.from("content_pipeline").insert([
        {
          trigger_id,
          user_id,
          channel_id,
          topic: text,
          draft_content: draft,
          status: "pending_compliance",
          created_at: new Date().toISOString(),
        },
      ]);
      if (insertError) throw new Error(`Falha ao salvar: ${insertError.message}`);

      // 4. Compliance-fact-check gate (mandatory — see .claude/agents/compliance-fact-check.md)
      await postToSlack(response_url!, {
        text: ":mag: Rodando compliance-fact-check (YMYL/UPL)...",
      });

      const compliance = await runComplianceCheck(draft, text!, apiKey);

      const passed = compliance.verdict !== "FAIL";
      await supabaseAdmin
        .from("content_pipeline")
        .update({
          status: passed ? "pending_approval" : "compliance_failed",
          compliance_verdict: compliance.verdict,
          compliance_report: compliance.raw,
          compliance_checked_at: new Date().toISOString(),
        })
        .eq("trigger_id", trigger_id);

      const complianceSummary = formatComplianceForSlack(compliance);

      if (!passed) {
        // FAIL: never show approval buttons. Content-agent has to fix and re-run.
        await postToSlack(response_url!, {
          text: `:rotating_light: *Compliance FAIL — rascunho bloqueado*\n\n${complianceSummary}`,
        });
        return;
      }

      // 5. PASS / PASS_WITH_FLAGS: show draft + compliance summary + approval buttons
      const blocks = [
        ...buildApprovalBlocks(draft, trigger_id!, user_id),
        { type: "context", elements: [{ type: "mrkdwn", text: buildApprovalRequirementNotice() }] },
        { type: "divider" },
        { type: "section", text: { type: "mrkdwn", text: complianceSummary } },
      ];
      await postToSlack(response_url!, { blocks });

      // 6. Reply in channel
      await postToSlack(botToken, {
        channel: channel_id,
        text: `:white_check_mark: Rascunho pronto para aprovação (compliance: ${compliance.verdict}).`,
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

      // Publishing decisions (approve/reject/edit) are restricted to the two
      // founders. Anyone else reacting is a no-op, not an error.
      if (!isAuthorizedApprover(user)) {
        if (status === "approved" || status === "rejected" || status === "edit_requested") {
          await postToSlack(botToken, {
            channel: item.channel,
            thread_ts: item.ts,
            text: buildUnauthorizedApproverNotice(),
          });
        }
        return;
      }

      const { data: row, error: fetchError } = await supabaseAdmin
        .from("content_pipeline")
        .select("compliance_verdict, approved_by_users, status")
        .eq("trigger_id", item.ts)
        .single();

      if (fetchError || !row) {
        console.error("[slack-trigger] Failed to fetch pipeline row:", fetchError?.message);
        return;
      }

      const TERMINAL_STATUSES = ["approved", "rejected", "published"];
      if (TERMINAL_STATUSES.includes(row.status)) {
        // Already decided — a late reaction (e.g. someone approving after a
        // rejection, or re-approving a published draft) shouldn't reopen it.
        await postToSlack(botToken, {
          channel: item.channel,
          thread_ts: item.ts,
          text: `:information_source: Este rascunho já está em estado final (${row.status}) — reação ignorada.`,
        });
        return;
      }

      // Defense in depth: even though a FAIL never gets approval buttons,
      // refuse an "approved" reaction on a row that failed compliance —
      // someone could still react ✅ on the FAIL message manually.
      if (status === "approved" && row.compliance_verdict === "FAIL") {
        await postToSlack(botToken, {
          channel: item.channel,
          thread_ts: item.ts,
          text: `:no_entry: Este rascunho falhou no compliance-fact-check e não pode ser aprovado. Peça uma nova versão ao content-agent.`,
        });
        return;
      }

      if (status === "approved") {
        // Dual-founder approval: a single ✅ is not enough — both required
        // approvers (SLACK_REQUIRED_APPROVERS) must react before publishing.
        const existing: string[] = row.approved_by_users ?? [];
        if (existing.includes(user)) return; // already counted, avoid duplicate notification

        const approvedByUsers = [...existing, user];
        const complete = allApproversDone(approvedByUsers);

        const { error } = await supabaseAdmin
          .from("content_pipeline")
          .update({
            approved_by_users: approvedByUsers,
            approved_by: user,
            approved_at: new Date().toISOString(),
            status: complete ? "approved" : "pending_approval",
          })
          .eq("trigger_id", item.ts);

        if (error) {
          console.error("[slack-trigger] Failed to update pipeline:", error.message);
          return;
        }

        const notification = complete
          ? buildFullApprovalNotice(approvedByUsers)
          : buildPartialApprovalNotice(user, approvedByUsers);

        await postToSlack(botToken, {
          channel: item.channel,
          thread_ts: item.ts,
          text: notification,
        });
        return;
      }

      // Reject / edit-requested: either founder can act unilaterally —
      // no need to wait for both when the answer is "stop" or "change this".
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

