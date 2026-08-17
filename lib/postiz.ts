/**
 * Postiz integration — publishes an approved content_pipeline draft to the
 * connected social accounts (Instagram, Facebook Page) via Postiz's public API.
 *
 * Docs: https://docs.postiz.com/public-api
 */

const POSTIZ_API_BASE = "https://api.postiz.com/public/v1";

interface PostizIntegration {
  id: string;
  name?: string;
  platform?: string;
}

interface PostizCreatePostResponse {
  id?: string;
  postId?: string;
  [key: string]: unknown;
}

/**
 * Lists the social accounts connected to the Postiz workspace, so callers
 * can resolve integration IDs by platform name (e.g. "instagram", "facebook")
 * instead of hardcoding IDs.
 */
export async function listPostizIntegrations(apiKey: string): Promise<PostizIntegration[]> {
  const response = await fetch(`${POSTIZ_API_BASE}/integrations`, {
    headers: { Authorization: apiKey },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Postiz integrations error (${response.status}): ${error}`);
  }

  return (await response.json()) as PostizIntegration[];
}

/**
 * Publishes draft content immediately to the given Postiz integration IDs.
 * Returns the Postiz post ID so it can be saved in content_pipeline.postiz_post_id.
 */
export async function publishToPostiz(
  draft: string,
  integrationIds: string[],
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error("POSTIZ_API_KEY not configured");
  }
  if (integrationIds.length === 0) {
    throw new Error("No Postiz integration IDs configured (POSTIZ_INTEGRATION_IDS)");
  }

  const response = await fetch(`${POSTIZ_API_BASE}/posts`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "now",
      date: new Date().toISOString(),
      shortLink: false,
      tags: [],
      posts: integrationIds.map((id) => ({
        integration: { id },
        value: [{ content: draft }],
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Postiz publish error (${response.status}): ${error}`);
  }

  const data = (await response.json()) as PostizCreatePostResponse;
  const postId = data.id ?? data.postId;
  if (!postId) {
    throw new Error("Postiz response did not include a post ID");
  }

  return postId;
}

/** Reads POSTIZ_INTEGRATION_IDS (comma-separated Postiz integration IDs) from env. */
export function getPostizIntegrationIds(): string[] {
  const raw = process.env.POSTIZ_INTEGRATION_IDS ?? "";
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}
