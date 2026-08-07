import { createHmac } from "crypto";

/**
 * Slack Pipeline Utilities
 * Shared helpers for content pipeline Slack integration
 */

export interface SlackPayload {
  type?: string;
  challenge?: string;
  command?: string;
  text?: string;
  user_id?: string;
  channel_id?: string;
  response_url?: string;
  trigger_id?: string;
  event?: SlackEvent;
}

export interface SlackEvent {
  type?: string;
  user?: string;
  reaction?: string;
  item?: {
    type?: string;
    channel?: string;
    ts?: string;
  };
}

export interface ContentPipelineRecord {
  id?: number;
  trigger_id: string;
  user_id: string;
  channel_id: string;
  topic: string;
  draft_content?: string;
  status:
    | "pending_compliance"
    | "compliance_failed"
    | "pending_approval"
    | "approved"
    | "rejected"
    | "edit_requested"
    | "published"
    | "failed";
  approved_by?: string;
  approved_at?: string;
  approved_by_users?: string[];
  published_by?: string;
  published_at?: string;
  postiz_post_id?: string;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Validate Slack request signature
 * Prevents replay attacks and verifies authenticity
 */
export function validateSlackSignature(
  signature: string | null,
  timestamp: string | null,
  body: string,
  secret: string
): boolean {
  if (!signature || !timestamp) return false;

  // Prevent replay attacks
  const now = Math.floor(Date.now() / 1000);
  const requestAge = now - parseInt(timestamp, 10);
  if (requestAge > 5 * 60) return false; // 5 minutes

  // Verify signature — Slack's spec requires a HEX digest, not base64:
  // https://docs.slack.dev/authentication/verifying-requests-from-slack
  const baseString = `v0:${timestamp}:${body}`;
  const hash = createHmac("sha256", secret).update(baseString).digest("hex");
  const expectedSignature = `v0=${hash}`;

  return constantTimeCompare(signature, expectedSignature);
}

/**
 * Constant-time string comparison (prevents timing attacks)
 */
function constantTimeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) return false;

  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }

  return result === 0;
}

/**
 * Post a message to Slack via response URL or bot token
 */
export async function postToSlack(
  targetOrUrl: string,
  payload: Record<string, unknown>
): Promise<void> {
  let url: string;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (targetOrUrl.startsWith("https://hooks.slack.com")) {
    // Response URL from slash command
    url = targetOrUrl;
  } else {
    // Bot token
    url = "https://slack.com/api/chat.postMessage";
    headers.Authorization = `Bearer ${targetOrUrl}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[slack-pipeline] postToSlack error:", response.status, error);
    throw new Error(`Slack API error: ${response.status}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  if (!(data.ok ?? false)) {
    console.error("[slack-pipeline] Slack API returned error:", data.error);
    throw new Error(`Slack API error: ${data.error}`);
  }
}

/**
 * Build Block Kit approval buttons for thread
 */
export function buildApprovalBlocks(
  draft: string,
  triggerId: string,
  authorName?: string
): Record<string, unknown>[] {
  const preview = draft.length > 300 ? draft.slice(0, 300) + "..." : draft;
  const footer = authorName ? `_Criado por: ${authorName}_` : "";

  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Rascunho de Conteúdo*\n\n${preview}\n\n${footer}`,
      },
    },
    {
      type: "actions",
      block_id: "approval_actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "✅ Aprovado" },
          value: "approve",
          style: "primary",
          action_id: `approve_${triggerId}`,
        },
        {
          type: "button",
          text: { type: "plain_text", text: "❌ Rejeitar" },
          value: "reject",
          style: "danger",
          action_id: `reject_${triggerId}`,
        },
        {
          type: "button",
          text: { type: "plain_text", text: "✏️ Editar" },
          value: "edit",
          action_id: `edit_${triggerId}`,
        },
      ],
    },
  ];
}

/**
 * Build reaction instruction message
 * Used if using emoji reactions instead of Block Kit buttons
 */
export function buildReactionInstructions(): Record<string, unknown>[] {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Como aprovar este rascunho:*\n• ✅ para aprovação\n• ❌ para rejeição\n• ✏️ para solicitar edição",
      },
    },
  ];
}

/**
 * Anthropic API: Generate content draft
 * Calls Claude with immigration content context
 */
export async function generateContentDraft(
  topic: string,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const systemPrompt = `Você é um especialista em conteúdo de imigração para Brazilians nos EUA.
Gere um rascunho de conteúdo marketing em português brasileiro (PT-BR) baseado no tópico fornecido.

Siga estas regras rigorosamente:
- Tone: amigável, direto, humanizado (a voz Immigrei)
- Estrutura: H1, introdução, seções com H2/H3, FAQ, CTA suave
- Inclua citações de fontes oficiais quando possível (USCIS, travel.state.gov, etc)
- Nunca dê conselhos personalizados — sempre referencie um profissional quando necessário
- Inclua disclaimer obrigatório: "Este conteúdo é informativo e não constitui aconselhamento jurídico; consulte um advogado de imigração licenciado para o seu caso."
- Use markdown formatting
- Limite a ~1500 caracteres para rascunho inicial`;

  const userPrompt = `Gere um rascunho de conteúdo sobre: "${topic}"`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${error}`);
  }

  interface AnthropicResponse {
    content?: Array<{ text?: string }>;
  }

  const data = (await response.json()) as AnthropicResponse;
  const content = data.content?.[0]?.text ?? "";

  if (!content) {
    throw new Error("Anthropic API returned empty response");
  }

  return content;
}

/**
 * Dual-founder approval
 * Publishing requires BOTH César and Felipe to react ✅ — a single approver
 * is not enough. Configure via SLACK_REQUIRED_APPROVERS (comma-separated
 * Slack user IDs, e.g. "U01ABCDEF,U02GHIJKL"). Find a user's ID in Slack:
 * profile → "..." → Copy member ID.
 */
export function getRequiredApprovers(): string[] {
  const raw = process.env.SLACK_REQUIRED_APPROVERS ?? "";
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isAuthorizedApprover(userId: string): boolean {
  const required = getRequiredApprovers();
  return required.length > 0 && required.includes(userId);
}

/** Slack IDs of required approvers who have not yet approved. */
export function pendingApprovers(approvedByUsers: string[]): string[] {
  return getRequiredApprovers().filter((id) => !approvedByUsers.includes(id));
}

export function allApproversDone(approvedByUsers: string[]): boolean {
  const required = getRequiredApprovers();
  return required.length > 0 && required.every((id) => approvedByUsers.includes(id));
}

/** Static notice shown alongside approval buttons stating who must approve. */
export function buildApprovalRequirementNotice(): string {
  const required = getRequiredApprovers();
  const mentions = required.map(formatUserMention).join(" e ");
  return `_Requer aprovação de ambos: ${mentions || "(SLACK_REQUIRED_APPROVERS não configurado)"}_`;
}

/** Message shown when a non-approver reacts on an approval-gated draft. */
export function buildUnauthorizedApproverNotice(): string {
  const required = getRequiredApprovers();
  const mentions = required.map(formatUserMention).join(" e ");
  return `:no_entry: Só ${mentions || "os aprovadores configurados"} podem aprovar, rejeitar ou pedir edição neste rascunho.`;
}

/** Message shown after one of two required approvals lands. */
export function buildPartialApprovalNotice(userId: string, approvedByUsers: string[]): string {
  const required = getRequiredApprovers();
  const remaining = pendingApprovers(approvedByUsers);
  const remainingMentions = remaining.map(formatUserMention).join(", ");
  return `:white_check_mark: ${formatUserMention(userId)} aprovou (${approvedByUsers.length}/${required.length}). Aguardando também: ${remainingMentions}.`;
}

/** Message shown once every required approver has approved. */
export function buildFullApprovalNotice(approvedByUsers: string[]): string {
  const mentions = approvedByUsers.map(formatUserMention).join(" e ");
  return `:white_check_mark: Aprovado por ${mentions}! Enviando para Postiz...`;
}

/**
 * Map emoji reactions to approval status
 */
export function reactionToStatus(
  reaction: string
): "approved" | "rejected" | "edit_requested" | null {
  switch (reaction) {
    case "white_check_mark":
    case "✅":
      return "approved";
    case "x":
    case "❌":
      return "rejected";
    case "pencil2":
    case "✏️":
      return "edit_requested";
    default:
      return null;
  }
}

/**
 * Get user display name from Slack user ID
 * Placeholder — would need Slack API call in production
 */
export function formatUserMention(userId: string): string {
  return `<@${userId}>`;
}

/**
 * Build notification message for a unilateral decision (reject / edit-request).
 * "approved" is NOT handled here — dual approval uses buildPartialApprovalNotice
 * / buildFullApprovalNotice instead, since a single ✅ is never the whole story.
 */
export function buildApprovalNotification(
  status: "rejected" | "edit_requested",
  userId: string
): string {
  const user = formatUserMention(userId);

  const messages: Record<"rejected" | "edit_requested", string> = {
    rejected: `:x: Rejeitado por ${user}. Este rascunho será descartado.`,
    edit_requested: `:pencil2: Edição solicitada por ${user}. Aguardando revisão...`,
  };

  return messages[status];
}
