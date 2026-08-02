// Shared catalog-entry builder for in-app search — used both by
// lib/searchIndex.ts (at request time) and scripts/build-search-embeddings.ts
// (to generate lib/searchEmbeddings.json). Centralized so the exact text
// embedded always matches the text searchIndex.ts compares against for
// staleness — these must never drift apart.

import { todosVistos } from "@/lib/vistosCatalog";
import { KITS } from "@/lib/kitsCatalog";
import { MANUAIS } from "@/lib/manuais";

export type SearchResultType = "visto" | "kit" | "manual";

export interface CatalogEntry {
  type: SearchResultType;
  id: string;
  title: string;
  snippet: string;
  href: string;
  gated: boolean; // does the detail route enforce plan !== "free"?
  text: string;   // exact string embedded — never shown in the UI
}

// Search-only synonyms for common everyday phrasing that doesn't literally
// appear in the formal catalog copy (e.g. someone searching "esposa" won't
// match "Cônjuge ou Filho de Residente Permanente" on keywords alone).
// Never shown to the user — only widens what searchIndex.ts's keyword
// matcher and the embedded text can match on. Keyed by "type:id".
const SEARCH_SYNONYMS: Record<string, string> = {
  "visto:k1": "esposa esposo marido cônjuge casamento namorada namorado",
  "kit:k1": "esposa esposo marido cônjuge casamento namorada namorado",
  "kit:familia-ir": "esposa esposo marido cônjuge casado casada casamento trazer minha família",
  "kit:family-gc": "esposa esposo marido cônjuge casado casada casamento",
  "kit:family-gc-overstay": "esposa esposo marido cônjuge casado casada",
  "kit:dependente-cos": "esposa esposo marido cônjuge",
};

function withSynonyms(type: SearchResultType, id: string, text: string): string {
  const extra = SEARCH_SYNONYMS[`${type}:${id}`];
  return extra ? `${text} ${extra}` : text;
}

export function buildCatalogEntries(): CatalogEntry[] {
  const vistoEntries: CatalogEntry[] = todosVistos.map((v) => ({
    type: "visto",
    id: v.id,
    title: `${v.codigo} — ${v.nome}`,
    snippet: v.descricao,
    href: `/vistos/${v.id}`,
    gated: false, // /vistos/[id] is fully public today
    text: withSynonyms("visto", v.id, `${v.codigo} ${v.nome} ${v.descricao} ${v.badge}`),
  }));

  const kitEntries: CatalogEntry[] = KITS.map((k) => ({
    type: "kit",
    id: k.id,
    title: k.titulo,
    snippet: k.descricao,
    href: `/documentos/${k.id}`,
    gated: true, // app/documentos/[vistoId]/page.tsx always gates
    text: withSynonyms("kit", k.id, `${k.codigo} ${k.titulo} ${k.descricao}`),
  }));

  const manualEntries: CatalogEntry[] = Object.values(MANUAIS).map((m) => ({
    type: "manual",
    id: m.slug,
    title: m.titulo,
    snippet: m.subtitulo,
    href: `/caminhos/${m.slug}`,
    gated: true, // app/caminhos/[slug]/page.tsx always gates
    text: withSynonyms("manual", m.slug, `${m.badge} ${m.titulo} ${m.subtitulo}`),
  }));

  return [...vistoEntries, ...kitEntries, ...manualEntries];
}
