/**
 * USCIS Case Status
 * Source: the official Torch API (developer.uscis.gov) — nothing else.
 *
 * No unofficial APIs, no scraping, no Reddit, no forums.
 * Data comes exclusively from uscis.gov, over the credentialed API.
 */

export type CaseStatusResult = {
  receiptNumber: string;
  status:        string;       // e.g. "Case Was Received"
  statusDate:    string;       // e.g. "July 10, 2025"
  description:   string;       // full explanation text
  isApproved:    boolean;
  isPending:     boolean;
  isDenied:      boolean;
  fetchedAt:     string;       // ISO timestamp
  error?:        string;
};

// ── Official Torch API (developer.uscis.gov) ────────────────────────────────
// The only path. Sandbox: https://api-int.uscis.gov (test receipts only);
// production: https://api.uscis.gov (granted after the USCIS demo).
const USCIS_API_BASE =
  process.env.USCIS_API_BASE ?? "https://api-int.uscis.gov";
const USCIS_CLIENT_ID = process.env.USCIS_CLIENT_ID;
const USCIS_CLIENT_SECRET = process.env.USCIS_CLIENT_SECRET;

// USCIS Torch API Developer Support corrected this on Aug 7, 2026 (the 4020
// value assigned Aug 2 was sent in error) — required on every case-status
// request until they confirm it and send the scheduler link.
const USCIS_DEMO_ID = process.env.USCIS_DEMO_ID ?? "4022";

// True while we run against the Torch sandbox (api-int). The sandbox only
// answers the official staging receipt numbers — every real receipt is a 404
// — and only operates M-F 7AM-8PM EST. Production (api.uscis.gov) flips this
// off via USCIS_API_BASE.
export function isUscisSandbox(): boolean {
  return USCIS_API_BASE.includes("api-int");
}

let cachedToken: { token: string; expiresAt: number } | null = null;

// Carries the HTTP status so callers can route it through describeApiFailure()
// — the same specific, user-honest handling every case-status response gets
// — instead of the generic catch-all in fetchCaseStatus().
class UscisOauthError extends Error {
  constructor(public readonly httpStatus: number) {
    super(`USCIS oauth returned HTTP ${httpStatus}`);
  }
}

// Structured request logging for the two outbound USCIS calls.
//
// Vercel's function logs only cover the *incoming* invocation — an outbound
// fetch is invisible unless we log it ourselves. These lines are what makes
// the backend↔USCIS hop demonstrable (the browser network tab only ever sees
// browser↔our-own-route).
//
// Never log a credential value. The token is reduced to a length, the client
// secret is never referenced, and the client id is reported as present/absent.
function logUscisRequest(method: string, url: string, headers: Record<string, string>) {
  console.log(`[uscis] → ${method} ${url} ${JSON.stringify(headers)}`);
}
function logUscisResponse(method: string, url: string, status: number, startedAt: number) {
  console.log(`[uscis] ← ${status} ${method} ${url} (${Date.now() - startedAt}ms)`);
}

async function getUscisApiToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const url = `${USCIS_API_BASE}/oauth/accesstoken`;
  const startedAt = Date.now();
  logUscisRequest("POST", url, {
    "content-type": "application/x-www-form-urlencoded",
    grant_type: "client_credentials",
    client_id: USCIS_CLIENT_ID ? "[set, redacted]" : "[MISSING]",
    client_secret: USCIS_CLIENT_SECRET ? "[set, redacted]" : "[MISSING]",
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: USCIS_CLIENT_ID!,
      client_secret: USCIS_CLIENT_SECRET!,
    }).toString(),
    signal: AbortSignal.timeout(10_000),
  });
  logUscisResponse("POST", url, res.status, startedAt);

  if (!res.ok) throw new UscisOauthError(res.status);
  const data = await res.json();
  const expiresIn = Number(data.expires_in ?? 1800);
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  console.log(`[uscis] token cached, expires_in=${expiresIn}s (reused until 60s before expiry)`);
  return cachedToken.token;
}

// Every documented Torch response code gets an explicit, user-honest
// treatment (production-demo requirement: handle ALL documented codes).
export function describeApiFailure(
  httpStatus: number,
  normalized: string,
  fetchedAt: string,
): CaseStatusResult {
  const base = {
    receiptNumber: normalized,
    statusDate: "",
    isApproved: false, isPending: false, isDenied: false,
    fetchedAt,
  };
  switch (httpStatus) {
    case 400:
      return { ...base, status: "Número de recibo inválido",
        description: "O USCIS não reconheceu o formato desse número. Confira os 13 caracteres (3 letras + 10 dígitos) no topo da sua notificação I-797.",
        error: "bad_request" };
    case 401:
    case 403:
      return { ...base, status: "Verificação temporariamente indisponível",
        description: "Nossa credencial junto ao USCIS precisa ser renovada. Já fomos avisados — tente novamente em alguns minutos.",
        error: `auth_${httpStatus}` };
    case 404:
      return { ...base, status: "Caso não encontrado",
        description: isUscisSandbox()
          ? "Estamos no ambiente de testes do USCIS: por enquanto só números de recibo de teste funcionam. Números reais passarão a funcionar quando o USCIS liberar nosso acesso de produção."
          : "O USCIS não encontrou um caso com esse número de recibo. Confira os 13 caracteres no topo da sua notificação I-797.",
        error: "not_found" };
    case 422:
      return { ...base, status: "Número de recibo inválido",
        description: "O USCIS não reconheceu o formato desse número. Confira os 13 caracteres (3 letras + 10 dígitos) no topo da sua notificação I-797.",
        error: "unprocessable" };
    case 429:
      return { ...base, status: "Muitas consultas agora",
        description: "Atingimos o limite de consultas do USCIS neste momento. Sua verificação será refeita automaticamente — não é preciso fazer nada.",
        error: "rate_limited" };
    case 503:
      return { ...base, status: "USCIS temporariamente indisponível",
        description: isUscisSandbox()
          ? "O ambiente de testes do USCIS só funciona de segunda a sexta, das 7h às 20h (horário de Nova York). Tente novamente dentro desse horário."
          : "O sistema do USCIS está em manutenção. Verificamos seus casos toda semana automaticamente — tente de novo mais tarde.",
        error: "service_unavailable" };
    default:
      return { ...base, status: "USCIS temporariamente indisponível",
        description: "O sistema do USCIS não respondeu (isso inclui o horário de manutenção deles). Verificamos seus casos toda semana automaticamente — tente de novo mais tarde.",
        error: `http_${httpStatus}` };
  }
}

// Pure payload mapper — tolerant to the documented Torch field variants.
export function mapCaseStatusPayload(
  normalized: string,
  data: Record<string, unknown>,
  fetchedAt: string,
): CaseStatusResult {
  const cs = (data.case_status ?? data.caseStatus ?? data) as Record<string, unknown>;
  const status = String(
    cs.current_case_status_text_en ?? cs.actionCodeText ?? cs.status ?? "",
  );
  const description = String(
    cs.current_case_status_desc_en ?? cs.actionCodeDesc ?? cs.description ?? "",
  );
  const statusDate = String(cs.modifiedDate ?? cs.actionCodeDate ?? "");
  const isApproved = isApprovedStatus(status);
  const isDenied = isDeniedStatus(status);
  return {
    receiptNumber: normalized,
    status: status || "Status não encontrado",
    statusDate,
    description: cleanHtml(description),
    isApproved,
    isPending: !isApproved && !isDenied,
    isDenied,
    fetchedAt,
  };
}

// One case-status request, logged on the way out and on the way back.
async function callCaseStatus(
  normalized: string,
  token: string,
  attempt?: string,
): Promise<Response> {
  const url = `${USCIS_API_BASE}/case-status/${normalized}`;
  const startedAt = Date.now();
  logUscisRequest("GET", url, {
    authorization: `Bearer [redacted, ${token.length} chars]`,
    demo_id: USCIS_DEMO_ID,
    ...(attempt ? { attempt } : {}),
  });
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, demo_id: USCIS_DEMO_ID },
    signal: AbortSignal.timeout(10_000),
  });
  logUscisResponse("GET", url, res.status, startedAt);
  return res;
}

async function fetchCaseStatusViaApi(
  normalized: string,
  fetchedAt: string,
): Promise<CaseStatusResult> {
  let token: string;
  try {
    token = await getUscisApiToken();
  } catch (err) {
    // Bad/revoked credentials fail here, before we ever reach the
    // case-status call — route through the same 401/403 messaging a
    // case-status-level auth failure would get, instead of falling
    // through to fetchCaseStatus()'s generic catch-all.
    if (err instanceof UscisOauthError) {
      return describeApiFailure(err.httpStatus, normalized, fetchedAt);
    }
    throw err;
  }

  let res = await callCaseStatus(normalized, token);

  // 401 once: the cached token may have just expired — refresh and retry.
  if (res.status === 401 && cachedToken) {
    console.log("[uscis] 401 with a cached token — clearing cache, one retry then give up");
    cachedToken = null;
    try {
      token = await getUscisApiToken();
    } catch (err) {
      if (err instanceof UscisOauthError) {
        return describeApiFailure(err.httpStatus, normalized, fetchedAt);
      }
      throw err;
    }
    res = await callCaseStatus(normalized, token, "retry-after-401");
  }

  if (!res.ok) return describeApiFailure(res.status, normalized, fetchedAt);

  const data = await res.json();
  return mapCaseStatusPayload(normalized, data, fetchedAt);
}

// Shared status classifiers — used by the parser, the cron and the dashboard
export function isDeniedStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("denied") || s.includes("rejected") || s.includes("terminated");
}

export function isApprovedStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("approved") || s.includes("accepted");
}

/**
 * Is this a genuine status change — one worth storing and emailing about?
 *
 * Anything carrying `error` is a failure to *read* the status, not a new
 * status. A 404, 429, 503 or auth failure must never overwrite the stored
 * status or trigger a "seu caso mudou" email: describeApiFailure() puts a
 * human-readable Portuguese string in `status` precisely so the UI can show
 * it, and that string is not a case status.
 *
 * This matters most in the sandbox, where every real user receipt returns
 * 404 — without this gate the weekly cron would email every user to say their
 * case was not found.
 */
export function isRealStatusChange(
  result: CaseStatusResult,
  lastStatus: string | null,
): boolean {
  if (result.error) return false;
  if (!result.status) return false;
  // mapCaseStatusPayload's empty-payload fallback — a successful HTTP call
  // that carried no usable status, so there is nothing to report.
  if (result.status === "Status não encontrado") return false;
  return result.status !== lastStatus;
}

// Normalize receipt number: remove spaces/dashes, uppercase
export function normalizeReceiptNumber(raw: string): string {
  return raw.replace(/[\s\-]/g, "").toUpperCase().trim();
}

// Validate receipt number format (3 letters + 10 digits)
export function isValidReceiptNumber(receipt: string): boolean {
  return /^[A-Z]{3}\d{10}$/.test(normalizeReceiptNumber(receipt));
}

export async function fetchCaseStatus(receiptNumber: string): Promise<CaseStatusResult> {
  const normalized = normalizeReceiptNumber(receiptNumber);
  const fetchedAt  = new Date().toISOString();

  if (!isValidReceiptNumber(normalized)) {
    return {
      receiptNumber: normalized,
      status: "Invalid Receipt Number",
      statusDate: "",
      description: "O número de recibo deve ter 3 letras seguidas de 10 dígitos (ex: IOE0123456789).",
      isApproved: false, isPending: false, isDenied: false,
      fetchedAt, error: "invalid_format",
    };
  }

  // Fail loudly rather than degrade silently. Without credentials there is no
  // legitimate way to reach USCIS — the old egov fallback scraped the public
  // site with a spoofed User-Agent, which is exactly what we should not do to
  // the agency granting us API access. A misconfigured deploy should be
  // obvious in the logs, not hidden behind a generic "try again later".
  if (!USCIS_CLIENT_ID || !USCIS_CLIENT_SECRET) {
    console.error(
      "[uscis] USCIS_CLIENT_ID/USCIS_CLIENT_SECRET not configured — refusing to call USCIS",
    );
    return {
      receiptNumber: normalized,
      status: "Verificação temporariamente indisponível",
      statusDate: "",
      description:
        "Nossa credencial junto ao USCIS não está configurada. Já fomos avisados — tente novamente em alguns minutos.",
      isApproved: false, isPending: false, isDenied: false,
      fetchedAt, error: "missing_credentials",
    };
  }

  try {
    return await fetchCaseStatusViaApi(normalized, fetchedAt);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[uscis] unexpected failure for ${normalized}: ${message}`);
    return {
      receiptNumber: normalized,
      status: "Verificação indisponível",
      statusDate: "",
      description: "Não foi possível verificar o status do caso neste momento. O USCIS pode estar com instabilidade. Tente novamente mais tarde.",
      isApproved: false, isPending: false, isDenied: false,
      fetchedAt, error: message,
    };
  }
}

// The Torch API returns HTML entities inside its description text, so this
// stays even though the HTML-scraping path is gone.
function cleanHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")   // strip tags
    .replace(/&amp;/g,  "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g,   "<")
    .replace(/&gt;/g,   ">")
    .replace(/&#39;/g,  "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
