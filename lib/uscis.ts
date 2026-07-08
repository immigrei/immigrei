/**
 * USCIS Case Status
 * Source: egov.uscis.gov (official public endpoint — same used by the website)
 *
 * No unofficial APIs, no Reddit, no forums.
 * Data comes exclusively from uscis.gov.
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

const USCIS_STATUS_URL = "https://egov.uscis.gov/casestatus/mycasestatus.do";

// ── Official Torch API (developer.uscis.gov) ────────────────────────────────
// Preferred path. Sandbox: https://api-int.uscis.gov (test receipts only);
// production: https://api.uscis.gov (granted after the USCIS demo).
// Legacy egov scraping now returns 403 (Akamai bot protection) and only
// remains as a fallback while credentials are not configured.
const USCIS_API_BASE =
  process.env.USCIS_API_BASE ?? "https://api-int.uscis.gov";
const USCIS_CLIENT_ID = process.env.USCIS_CLIENT_ID;
const USCIS_CLIENT_SECRET = process.env.USCIS_CLIENT_SECRET;

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getUscisApiToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }
  const res = await fetch(`${USCIS_API_BASE}/oauth/accesstoken`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: USCIS_CLIENT_ID!,
      client_secret: USCIS_CLIENT_SECRET!,
    }).toString(),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`USCIS oauth returned HTTP ${res.status}`);
  const data = await res.json();
  const expiresIn = Number(data.expires_in ?? 1800);
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  return cachedToken.token;
}

async function fetchCaseStatusViaApi(
  normalized: string,
  fetchedAt: string,
): Promise<CaseStatusResult> {
  const token = await getUscisApiToken();
  const res = await fetch(`${USCIS_API_BASE}/case-status/${normalized}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 404) {
    return {
      receiptNumber: normalized,
      status: "Caso não encontrado",
      statusDate: "",
      description:
        "O USCIS não encontrou um caso com esse número de recibo. Confira os 13 caracteres no topo da sua notificação I-797.",
      isApproved: false, isPending: false, isDenied: false,
      fetchedAt, error: "not_found",
    };
  }
  if (!res.ok) throw new Error(`USCIS API returned HTTP ${res.status}`);
  const data = await res.json();
  // Field names tolerant to the documented variants of the Torch payload.
  const cs = data.case_status ?? data.caseStatus ?? data;
  const status =
    cs.current_case_status_text_en ?? cs.actionCodeText ?? cs.status ?? "";
  const description =
    cs.current_case_status_desc_en ?? cs.actionCodeDesc ?? cs.description ?? "";
  const statusDate = cs.modifiedDate ?? cs.actionCodeDate ?? "";
  const isApproved = isApprovedStatus(status);
  const isDenied = isDeniedStatus(status);
  return {
    receiptNumber: normalized,
    status: status || "Status não encontrado",
    statusDate,
    description: cleanHtml(String(description)),
    isApproved,
    isPending: !isApproved && !isDenied,
    isDenied,
    fetchedAt,
  };
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

  try {
    if (USCIS_CLIENT_ID && USCIS_CLIENT_SECRET) {
      return await fetchCaseStatusViaApi(normalized, fetchedAt);
    }

    const body = new URLSearchParams({
      appReceiptNum: normalized,
      caseStatusSearchBtn: "CHECK STATUS",
    });

    const res = await fetch(USCIS_STATUS_URL, {
      method:  "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Use a standard browser UA to avoid blocks
        "User-Agent": "Mozilla/5.0 (compatible; Immigrei/1.0; +https://immigrei.com)",
        "Referer":    "https://egov.uscis.gov/casestatus/landing.do",
      },
      body: body.toString(),
      // Respect a 10s timeout — don't hang the cron
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      throw new Error(`USCIS returned HTTP ${res.status}`);
    }

    const html = await res.text();
    return parseCaseStatusHtml(normalized, html, fetchedAt);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
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

function parseCaseStatusHtml(
  receiptNumber: string,
  html: string,
  fetchedAt: string,
): CaseStatusResult {
  // USCIS returns the status inside:
  //   <div class="rows text-center"> <h1>Case Was Received</h1> <p>On July 10...</p> </div>
  // We parse with regex (no DOM parser in edge runtime)

  const statusMatch = html.match(/<h1[^>]*>\s*([\s\S]*?)\s*<\/h1>/i);
  const descMatch   = html.match(/<p[^>]*class="[^"]*appointment-sec[^"]*"[^>]*>([\s\S]*?)<\/p>/i)
                   ?? html.match(/<div[^>]*class="[^"]*rows[^"]*text-center[^"]*"[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);

  const status      = statusMatch ? cleanHtml(statusMatch[1]) : "Status não encontrado";
  const description = descMatch   ? cleanHtml(descMatch[1])   : "";

  // Extract date from description (e.g. "On July 10, 2025, we ...")
  const dateMatch = description.match(/(?:On\s+)?([A-Z][a-z]+ \d{1,2},\s*\d{4})/);
  const statusDate = dateMatch ? dateMatch[1] : "";

  const isApproved  = isApprovedStatus(status);
  const isDenied    = isDeniedStatus(status);
  const isPending   = !isApproved && !isDenied;

  return { receiptNumber, status, statusDate, description, isApproved, isPending, isDenied, fetchedAt };
}

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
