import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { checkRateLimit, clientIp } from "./rate-limit";

type Row = { rl_key: string; created_at: string };

// Minimal in-memory stand-in for the one query shape checkRateLimit uses:
// .from("rate_limit_hits").{delete,select,insert}().eq/lt/gte(...) — enough
// to exercise the sliding-window logic without a real Supabase connection.
function fakeSupabase() {
  const rows: Row[] = [];

  function builder(op: "delete" | "select" | "insert", insertRow?: Partial<Row>) {
    const filters: Array<{ field: string; type: "eq" | "lt" | "gte"; value: unknown }> = [];
    let countMode = false;

    const chain = {
      eq(field: string, value: unknown) { filters.push({ field, type: "eq", value }); return chain; },
      lt(field: string, value: unknown) { filters.push({ field, type: "lt", value }); return chain; },
      gte(field: string, value: unknown) { filters.push({ field, type: "gte", value }); return chain; },
      select(_cols?: string, opts?: { count?: string; head?: boolean }) {
        if (opts?.count) countMode = true;
        return chain;
      },
      then(resolve: (v: unknown) => void) {
        const matches = (r: Row) =>
          filters.every((f) => {
            const rv = r[f.field as keyof Row];
            if (f.type === "eq") return rv === f.value;
            if (f.type === "lt") return rv < (f.value as string);
            return rv >= (f.value as string);
          });

        if (op === "delete") {
          for (let i = rows.length - 1; i >= 0; i--) if (matches(rows[i])) rows.splice(i, 1);
          resolve({ error: null });
        } else if (op === "insert") {
          rows.push({ rl_key: insertRow!.rl_key!, created_at: insertRow!.created_at ?? new Date().toISOString() });
          resolve({ error: null });
        } else {
          const matched = rows.filter(matches);
          resolve(countMode ? { count: matched.length, error: null } : { data: matched, error: null });
        }
        return Promise.resolve();
      },
    };
    return chain;
  }

  return {
    rows,
    from: () => ({
      delete: () => builder("delete"),
      select: (cols?: string, opts?: { count?: string; head?: boolean }) => builder("select").select(cols, opts),
      insert: (row: Partial<Row>) => builder("insert", row),
    }),
  } as unknown as SupabaseClient;
}

describe("checkRateLimit", () => {
  it("permite enquanto estiver dentro do limite", async () => {
    const client = fakeSupabase();
    for (let i = 0; i < 3; i++) {
      expect(await checkRateLimit("k", { max: 5, windowMs: 60_000 }, client)).toBe(true);
    }
  });

  it("bloqueia assim que atinge o limite", async () => {
    const client = fakeSupabase();
    for (let i = 0; i < 5; i++) {
      expect(await checkRateLimit("k", { max: 5, windowMs: 60_000 }, client)).toBe(true);
    }
    expect(await checkRateLimit("k", { max: 5, windowMs: 60_000 }, client)).toBe(false);
  });

  it("chaves diferentes têm limites independentes", async () => {
    const client = fakeSupabase();
    for (let i = 0; i < 5; i++) {
      expect(await checkRateLimit("a", { max: 5, windowMs: 60_000 }, client)).toBe(true);
    }
    expect(await checkRateLimit("a", { max: 5, windowMs: 60_000 }, client)).toBe(false);
    expect(await checkRateLimit("b", { max: 5, windowMs: 60_000 }, client)).toBe(true);
  });

  it("libera depois que a janela expira", async () => {
    const client = fakeSupabase();
    const rows = (client as unknown as { rows: Row[] }).rows;
    // Simula um hit antigo, fora da janela de 1 minuto.
    rows.push({ rl_key: "k", created_at: new Date(Date.now() - 120_000).toISOString() });
    expect(await checkRateLimit("k", { max: 1, windowMs: 60_000 }, client)).toBe(true);
  });
});

describe("clientIp", () => {
  it("lê o primeiro IP de x-forwarded-for", () => {
    const req = new Request("http://localhost", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
    expect(clientIp(req)).toBe("1.2.3.4");
  });

  it("cai para 'unknown' sem o header", () => {
    const req = new Request("http://localhost");
    expect(clientIp(req)).toBe("unknown");
  });
});
