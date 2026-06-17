/**
 * Brazilian Consulate scraper
 * Sources: official Itamaraty consulate websites
 * Run once per month via cron — /api/cron/consulados
 *
 * Scrapes: Miami (cgmiami) and New York (novayork)
 * Looks for: itinerant service events, hours updates, announcements
 */

export type ConsuladoEvent = {
  consulado:   "miami" | "nyc";
  titulo:      string;
  descricao:   string;
  data_inicio: string | null;  // ISO date string or null if not parseable
  data_fim:    string | null;
  cidade:      string | null;  // city where itinerant service takes place
  estado:      string | null;
  servicos:    string[];        // CPF, Passaporte, etc.
  url_fonte:   string;
  tipo:        "itinerante" | "aviso" | "horario" | "outro";
  scraped_at:  string;
};

const CONSULADOS = [
  {
    id:   "miami" as const,
    nome: "Consulado-Geral de Miami",
    urls: [
      "https://www.cgmiami.gov.br/pt-br/consulado-geral-em-miami/servicos-itinerantes",
      "https://www.cgmiami.gov.br/pt-br/noticias",
    ],
  },
  {
    id:   "nyc" as const,
    nome: "Consulado-Geral de Nova York",
    urls: [
      "https://novayork.itamaraty.gov.br/pt-br/servicos_itinerantes.xml",
      "https://novayork.itamaraty.gov.br/pt-br/noticias",
    ],
  },
];

const SERVICOS_KEYWORDS: Record<string, string> = {
  passaporte: "Passaporte",
  cpf:        "CPF",
  "título":   "Título de Eleitor",
  titulo:     "Título de Eleitor",
  eleitor:    "Título de Eleitor",
  "certidão": "Certidão",
  certidao:   "Certidão",
  procuração: "Procuração",
  procuracao: "Procuração",
  autenticação: "Autenticação",
  autenticacao: "Autenticação",
  "registro de nascimento": "Registro de Nascimento",
};

// Brazilian state abbreviations + full names for location extraction
const BR_STATES = [
  "FL", "NY", "NJ", "CT", "MA", "PA", "GA", "TX", "CA", "IL",
  "Florida", "New York", "New Jersey", "Connecticut", "Massachusetts",
  "Georgia", "Texas", "California", "Illinois",
];

// US cities with Brazilian communities
const BR_CITIES = [
  "Miami", "Orlando", "Tampa", "Fort Lauderdale", "Boca Raton",
  "New York", "Newark", "Bridgeport", "Danbury", "Boston",
  "Atlanta", "Houston", "Dallas", "Los Angeles", "Chicago",
  "Philadelphia", "Washington", "Charlotte", "Jacksonville",
];

export async function scrapeAllConsulados(): Promise<ConsuladoEvent[]> {
  const all: ConsuladoEvent[] = [];

  for (const c of CONSULADOS) {
    for (const url of c.urls) {
      try {
        const events = await scrapeUrl(c.id, url);
        all.push(...events);
      } catch (err) {
        console.error(`[consulados] Failed to scrape ${url}:`, err);
      }
    }
  }

  return all;
}

async function scrapeUrl(
  consulado: "miami" | "nyc",
  url: string,
): Promise<ConsuladoEvent[]> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Immigrei/1.0; +https://immigrei.com)",
      "Accept":     "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);

  const html = await res.text();
  return parseEvents(consulado, html, url);
}

function parseEvents(
  consulado: "miami" | "nyc",
  html: string,
  sourceUrl: string,
): ConsuladoEvent[] {
  const scraped_at = new Date().toISOString();
  const events: ConsuladoEvent[] = [];

  // Extract text blocks — article, li, div with date-like patterns
  const blocks = extractTextBlocks(html);

  for (const block of blocks) {
    const lower = block.toLowerCase();

    // Must mention itinerant service or relevant consular activity
    const isItinerante =
      lower.includes("itinerante") ||
      lower.includes("atendimento") ||
      lower.includes("passaporte") ||
      lower.includes("cpf") ||
      lower.includes("título de eleitor") ||
      lower.includes("titulo de eleitor");

    if (!isItinerante) continue;
    if (block.length < 30 || block.length > 3000) continue;

    const tipo = lower.includes("itinerante") ? "itinerante"
               : lower.includes("aviso") || lower.includes("atenção") ? "aviso"
               : lower.includes("horário") || lower.includes("horario") ? "horario"
               : "outro";

    const lines   = block.split(/\n/).map(l => l.trim()).filter(Boolean);
    const titulo  = lines[0]?.slice(0, 120) ?? "Atendimento consular";
    const descricao = lines.slice(1).join(" ").slice(0, 800) || block.slice(0, 400);

    const datas    = extractDates(block);
    const cidade   = extractCity(block);
    const estado   = extractState(block);
    const servicos = extractServicos(block);

    events.push({
      consulado,
      titulo,
      descricao,
      data_inicio: datas[0] ?? null,
      data_fim:    datas[1] ?? null,
      cidade,
      estado,
      servicos,
      url_fonte:   sourceUrl,
      tipo,
      scraped_at,
    });
  }

  // Deduplicate by titulo similarity
  return dedup(events);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractTextBlocks(html: string): string[] {
  // Pull content from article, section, li, and div blocks
  const blockPattern = /<(?:article|section|li|div|p)[^>]*>([\s\S]*?)<\/(?:article|section|li|div|p)>/gi;
  const blocks: string[] = [];
  let match;

  while ((match = blockPattern.exec(html)) !== null) {
    const text = cleanHtml(match[1]);
    if (text.length > 40) blocks.push(text);
  }

  return blocks;
}

function cleanHtml(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g,  "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g,   "<")
    .replace(/&gt;/g,   ">")
    .replace(/&#39;/g,  "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g,    " ")
    .trim();
}

function extractDates(text: string): [string | null, string | null] {
  // Match DD/MM/YYYY or Month DD, YYYY or YYYY-MM-DD
  const ptDate  = /(\d{1,2})\/(\d{1,2})\/(\d{4})/g;
  const enDate  = /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/gi;
  const isoDate = /(\d{4})-(\d{2})-(\d{2})/g;

  const found: string[] = [];

  let m;
  while ((m = ptDate.exec(text)) !== null && found.length < 2) {
    const [, d, mo, y] = m;
    const iso = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
    if (isValidDate(iso)) found.push(iso);
  }

  const MONTHS: Record<string, string> = {
    january:"01",february:"02",march:"03",april:"04",may:"05",june:"06",
    july:"07",august:"08",september:"09",october:"10",november:"11",december:"12",
  };
  while ((m = enDate.exec(text)) !== null && found.length < 2) {
    const [, mon, d, y] = m;
    const iso = `${y}-${MONTHS[mon.toLowerCase()]}-${d.padStart(2, "0")}`;
    if (isValidDate(iso)) found.push(iso);
  }

  while ((m = isoDate.exec(text)) !== null && found.length < 2) {
    if (isValidDate(m[0])) found.push(m[0]);
  }

  return [found[0] ?? null, found[1] ?? null];
}

function isValidDate(iso: string): boolean {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  const year = d.getFullYear();
  return year >= 2024 && year <= 2030;
}

function extractCity(text: string): string | null {
  for (const city of BR_CITIES) {
    if (text.includes(city)) return city;
  }
  return null;
}

function extractState(text: string): string | null {
  for (const st of BR_STATES) {
    const re = new RegExp(`\\b${st}\\b`);
    if (re.test(text)) return st;
  }
  return null;
}

function extractServicos(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const [kw, label] of Object.entries(SERVICOS_KEYWORDS)) {
    if (lower.includes(kw)) found.add(label);
  }
  return [...found];
}

function dedup(events: ConsuladoEvent[]): ConsuladoEvent[] {
  const seen = new Set<string>();
  return events.filter(e => {
    const key = `${e.consulado}|${e.titulo.slice(0, 60)}|${e.data_inicio}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
