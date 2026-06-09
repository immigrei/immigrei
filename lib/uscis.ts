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

  const statusLower = status.toLowerCase();
  const isApproved  = statusLower.includes("approved") || statusLower.includes("accepted");
  const isDenied    = statusLower.includes("denied") || statusLower.includes("rejected") || statusLower.includes("terminated");
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
