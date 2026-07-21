import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Sliding-window rate limit backed by the `rate_limit_hits` table (see
 * supabase/migrations/021_add_rate_limit_hits.sql) — same pattern
 * app/api/community/route.ts already used by hand for its 3/day cap,
 * generalized so every route can share it without Redis/Upstash.
 */
export async function checkRateLimit(
  key: string,
  opts: { max: number; windowMs: number },
  client: SupabaseClient = supabaseAdmin
): Promise<boolean> {
  const since = new Date(Date.now() - opts.windowMs).toISOString();

  // Opportunistic cleanup: drop this key's expired hits before counting.
  await client.from("rate_limit_hits").delete().eq("rl_key", key).lt("created_at", since);

  const { count } = await client
    .from("rate_limit_hits")
    .select("*", { count: "exact", head: true })
    .eq("rl_key", key)
    .gte("created_at", since);

  if ((count ?? 0) >= opts.max) return false;

  await client.from("rate_limit_hits").insert({ rl_key: key });
  return true;
}

// Vercel sets x-forwarded-for on every request; first entry is the client.
export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
