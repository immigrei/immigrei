import { buildLlmsTxt } from "@/lib/llmsTxt";

// Built once at build time from the same catalogs as the sitemap.
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
