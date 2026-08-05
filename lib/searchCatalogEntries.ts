// Shared catalog-entry builder for in-app search — used both by
// lib/searchIndex.ts (at request time) and scripts/build-search-embeddings.ts
// (to generate lib/searchEmbeddings.json). Centralized so the exact text
// embedded always matches the text searchIndex.ts compares against for
// staleness — these must never drift apart.

import { todosVistos } from "@/lib/vistosCatalog";
import { KITS } from "@/lib/kitsCatalog";
import { MANUAIS } from "@/lib/manuais";
import { FAQ_BANK } from "@/lib/faqBank";
import guias from "@/app/documentos/guias/data";

export type SearchResultType = "visto" | "kit" | "manual" | "atalho" | "guia";

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

// Static in-app destinations that aren't part of the vistos/kits/caminhos
// catalog but people search for by intent anyway (e.g. "meus pdfs" should
// find the document vault, not the closest unrelated catalog entry).
const ATALHOS: Omit<CatalogEntry, "type">[] = [
  {
    id: "cofre",
    title: "Cofre de Documentos",
    snippet: "Guarde e organize os arquivos da sua jornada em um só lugar.",
    href: "/documentos/cofre",
    gated: true, // app/documentos/cofre/page.tsx always gates
    text: "Cofre de Documentos meus pdfs meus documentos meus arquivos uploads comprovantes passaporte identidade digitalizar anexos",
  },
  {
    id: "painel",
    title: "Painel",
    snippet: "Acompanhe o progresso da sua jornada e os próximos passos.",
    href: "/painel",
    gated: false,
    text: "Painel meu progresso próximos passos status da jornada resumo",
  },
  {
    id: "comunidade",
    title: "Comunidade",
    snippet: "Relatos de brasileiros que já passaram pelo que você está vivendo.",
    href: "/comunidade",
    gated: true, // app/api/community/route.ts strips content for free
    text: "Comunidade relatos experiências outros brasileiros histórias fórum",
  },
  {
    id: "profissionais",
    title: "Profissionais",
    snippet: "Conecte-se com advogados e profissionais de imigração.",
    href: "/profissionais",
    gated: false,
    text: "Profissionais advogado advogados consultoria jurídica indicação",
  },
];

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

  const atalhoEntries: CatalogEntry[] = ATALHOS.map((a) => ({ type: "atalho", ...a }));

  // Guias de Integração (/documentos/guias/[id]) — public content, never
  // gated. infoExtra.itens (e.g. the DMV state list) is folded into the
  // embedded text so a query like "carteira sem status" or "california
  // carteira de motorista" can match it semantically.
  const guiaEntries: CatalogEntry[] = guias.map((g) => ({
    type: "guia",
    id: g.id,
    title: g.titulo,
    snippet: g.resumo,
    href: `/documentos/guias/${g.id}`,
    gated: false,
    text: `${g.titulo} ${g.categoria} ${g.resumo} ${g.passos.join(" ")} ${g.dicaChave} ${g.infoExtra?.itens.join(" ") ?? ""}`,
  }));

  return [...vistoEntries, ...kitEntries, ...manualEntries, ...atalhoEntries, ...guiaEntries];
}

// A FAQ entry isn't a clickable card — no href/gated — it's the source of an
// "answer" paragraph shown above the card results (see lib/searchIndex.ts).
// Kept as a separate type/builder from CatalogEntry rather than shoehorning
// it into that shape.
export interface FaqIndexEntry {
  id: string;
  pergunta: string; // scored like CatalogEntry.title (exact/startsWith/includes tiers)
  resposta: string;
  vistosRelacionados: string[];
  text: string; // exact string embedded — mirrors CatalogEntry.text
}

export function buildFaqBankEntries(): FaqIndexEntry[] {
  return FAQ_BANK.map((f) => ({
    id: f.id,
    pergunta: f.pergunta,
    resposta: f.resposta,
    vistosRelacionados: f.vistosRelacionados,
    text: `${f.categoria} ${f.pergunta}`,
  }));
}
