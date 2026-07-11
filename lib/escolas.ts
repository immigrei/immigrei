/**
 * SEVP-certified schools directory.
 *
 * Data source: DHS Study in the States certified school list (public data),
 * parsed from https://studyinthestates.dhs.gov/school-search into
 * lib/data/sevp-schools.json by scripts/parse-sevp-pdf.py.
 * DHS republishes the list roughly monthly — rerun the script to refresh.
 */

import data from "./data/sevp-schools.json";

export type EscolaCampus = {
  school_name: string;
  campus_name: string;
  accepts_f: boolean;
  accepts_m: boolean;
  city: string;
  state: string;
  campus_code: string;
};

export type EscolasData = {
  updated: string;
  source: string;
  campuses: EscolaCampus[];
};

const db = data as EscolasData;

export const ESCOLAS_UPDATED = db.updated;
export const ESCOLAS_SOURCE = db.source;

/** US states + territories that appear in the SEVP list, PT-BR labels. */
export const US_STATES: Record<string, string> = {
  AL: "Alabama", AK: "Alasca", AZ: "Arizona", AR: "Arkansas",
  CA: "Califórnia", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  DC: "Distrito de Columbia", FL: "Flórida", GA: "Geórgia", HI: "Havaí",
  ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine",
  MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska",
  NV: "Nevada", NH: "New Hampshire", NJ: "Nova Jersey", NM: "Novo México",
  NY: "Nova York", NC: "Carolina do Norte", ND: "Dakota do Norte",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pensilvânia",
  RI: "Rhode Island", SC: "Carolina do Sul", SD: "Dakota do Sul",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virgínia", WA: "Washington", WV: "Virgínia Ocidental",
  WI: "Wisconsin", WY: "Wyoming", PR: "Porto Rico", GU: "Guam",
  VI: "Ilhas Virgens Americanas", MP: "Marianas do Norte", AS: "Samoa Americana",
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export type EscolasQuery = {
  q?: string;
  state?: string;
  tipo?: "f" | "m";
  page?: number;
  perPage?: number;
};

export type EscolasResult = {
  campuses: EscolaCampus[];
  total: number;
  page: number;
  perPage: number;
  updated: string;
};

export function searchEscolas({
  q,
  state,
  tipo,
  page = 1,
  perPage = 25,
}: EscolasQuery): EscolasResult {
  const nq = q ? normalize(q) : "";

  const matches = db.campuses.filter((c) => {
    if (state && c.state !== state) return false;
    if (tipo === "f" && !c.accepts_f) return false;
    if (tipo === "m" && !c.accepts_m) return false;
    if (nq) {
      const haystack = normalize(
        `${c.school_name} ${c.campus_name} ${c.city}`
      );
      if (!haystack.includes(nq)) return false;
    }
    return true;
  });

  const start = (page - 1) * perPage;
  return {
    campuses: matches.slice(start, start + perPage),
    total: matches.length,
    page,
    perPage,
    updated: db.updated,
  };
}

/** States that actually have campuses, for the filter dropdown. */
export function statesWithCampuses(): { code: string; label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const c of db.campuses) {
    counts.set(c.state, (counts.get(c.state) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([code, count]) => ({ code, label: US_STATES[code] ?? code, count }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}
