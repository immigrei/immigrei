/**
 * Visa Bulletin parser
 * Source: travel.state.gov (official — Dept. of State / NVC)
 *
 * Published every 2nd Saturday of the month.
 * We fetch, parse, and save to Supabase once a month.
 */

const BULLETIN_INDEX_URL =
  "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html";

export type BulletinSnapshot = {
  bulletinMonth:    string;    // "2025-07"
  bulletinUrl:      string;
  publishedAt:      string;    // "2025-06-14"
  familyDates:      Record<string, Record<string, string>>;
  employmentDates:  Record<string, Record<string, string>>;
  rawText:          string;
};

// Fetch the index page and find the latest bulletin URL
async function getLatestBulletinUrl(): Promise<string> {
  const res  = await fetch(BULLETIN_INDEX_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Immigrei/1.0; +https://immigrei.com)" },
    signal:  AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Bulletin index HTTP ${res.status}`);
  const html = await res.text();

  // Links look like: /content/travel/en/legal/visa-law0/visa-bulletin/2025/visa-bulletin-for-july-2025.html
  const match = html.match(/href="(\/content\/travel\/en\/legal\/visa-law0\/visa-bulletin\/\d{4}\/[^"]+\.html)"/i);
  if (!match) throw new Error("Could not find latest bulletin URL in index page");
  return "https://travel.state.gov" + match[1];
}

// Parse bulletin month from URL
function parseBulletinMonth(url: string): string {
  // e.g. visa-bulletin-for-july-2025.html → 2025-07
  const months: Record<string, string> = {
    january: "01", february: "02", march: "03", april: "04",
    may: "05", june: "06", july: "07", august: "08",
    september: "09", october: "10", november: "11", december: "12",
  };
  const match = url.match(/visa-bulletin-for-([a-z]+)-(\d{4})\.html/i);
  if (!match) return new Date().toISOString().slice(0, 7);
  const month = months[match[1].toLowerCase()] ?? "01";
  return `${match[2]}-${month}`;
}

// Parse a date table from the bulletin HTML
// Tables have format: Category | All Chargeability | Brazil | China | India | Mexico | Philippines
function parsePriorityDateTable(html: string, tableIndex: number): Record<string, Record<string, string>> {
  // Extract all tables
  const tableMatches = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)];
  if (!tableMatches[tableIndex]) return {};

  const tableHtml = tableMatches[tableIndex][0];
  const rows      = [...tableHtml.matchAll(/<tr[\s\S]*?<\/tr>/gi)];
  if (rows.length < 2) return {};

  // Header row → get country columns
  const headerCells = [...rows[0][0].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)]
    .map(m => cleanCell(m[1]));

  const result: Record<string, Record<string, string>> = {};

  for (let i = 1; i < rows.length; i++) {
    const cells = [...rows[i][0].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)]
      .map(m => cleanCell(m[1]));
    if (cells.length < 2) continue;

    const category = cells[0];
    if (!category) continue;
    result[category] = {};

    for (let j = 1; j < cells.length; j++) {
      const col = headerCells[j]?.toLowerCase().replace(/\s+/g, "_") ?? `col_${j}`;
      result[category][col] = cells[j] ?? "C"; // "C" = current
    }
  }

  return result;
}

function cleanCell(raw: string): string {
  return raw.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export async function fetchLatestBulletin(): Promise<BulletinSnapshot> {
  const bulletinUrl = await getLatestBulletinUrl();
  const bulletinMonth = parseBulletinMonth(bulletinUrl);

  const res = await fetch(bulletinUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Immigrei/1.0; +https://immigrei.com)" },
    signal:  AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Bulletin page HTTP ${res.status}`);
  const html = await res.text();

  // Table A = Final Action Dates (what matters for filing)
  // Table B = Dates for Filing (when you can file)
  // Family-based is usually the 1st table, Employment-based the 2nd or 3rd
  const familyDates     = parsePriorityDateTable(html, 0);
  const employmentDates = parsePriorityDateTable(html, 1);

  // Raw text for fallback
  const rawText = cleanCell(html).slice(0, 8000); // cap at 8kb

  // Extract publish date from <time> tag or title
  const dateMatch = html.match(/<time[^>]*datetime="([^"]+)"/i);
  const publishedAt = dateMatch ? dateMatch[1].slice(0, 10) : new Date().toISOString().slice(0, 10);

  return { bulletinMonth, bulletinUrl, publishedAt, familyDates, employmentDates, rawText };
}
