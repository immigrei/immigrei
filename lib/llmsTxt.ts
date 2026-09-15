import guias from "@/app/documentos/guias/data";
import {
  DRAFTS_DIR,
  getExplainersBySection,
  SITE_URL,
  type ExplainerPage,
} from "@/lib/contentPages";
import { todosVistos } from "@/lib/vistosCatalog";
import { VISTO_PAGES } from "@/lib/vistoPages";

/**
 * llms.txt (llmstxt.org) — a plain-markdown map of the public site for LLM
 * agents and answer engines, plus llms-full.txt with the content inline.
 * Built from the same sources as app/sitemap.ts (VISTO_PAGES, guias, the
 * reviewed explainers), so it can never list a page that isn't public.
 */

const SUMMARY =
  "> Companheiro da jornada migratória de brasileiros nos EUA, em português: o que cada visto permite, o que acontece depois de protocolar um formulário do USCIS, o que cada status do caso significa e qual é o próximo passo — sempre com fonte oficial (uscis.gov, state.gov, ecfr.gov).";

const DISCLAIMER =
  "Todo o conteúdo é educacional e não constitui aconselhamento jurídico; para decisões sobre um caso específico, consulte um advogado de imigração licenciado.";

function visaEntries() {
  return Object.values(VISTO_PAGES).flatMap((page) => {
    const visto = todosVistos.find((v) => v.id === page.id);
    return visto ? [{ page, visto }] : [];
  });
}

function explainerLine(p: ExplainerPage) {
  return `- [${p.title}](${p.url}): ${p.description}`;
}

export function buildLlmsTxt(dir = DRAFTS_DIR): string {
  const status = getExplainersBySection("/status", dir);
  const entenda = getExplainersBySection("/entenda", dir);
  const sections: string[] = [
    "# immigrei",
    SUMMARY,
    `Todas as páginas abaixo são públicas, em português (PT-BR), e citam as fontes oficiais do governo americano. ${DISCLAIMER}`,
  ];

  if (status.length > 0) {
    sections.push(["## Status do caso no USCIS, explicados", ...status.map(explainerLine)].join("\n"));
  }
  if (entenda.length > 0) {
    sections.push(["## Entenda o processo", ...entenda.map(explainerLine)].join("\n"));
  }
  sections.push(
    [
      "## Vistos",
      ...visaEntries().map(
        ({ visto }) =>
          `- [${visto.codigo} — ${visto.nome}](${SITE_URL}/vistos/${visto.id}): ${visto.descricao}`,
      ),
    ].join("\n"),
  );
  sections.push(
    [
      "## Guias de integração nos EUA",
      ...guias.map((g) => `- [${g.titulo}](${SITE_URL}/documentos/guias/${g.id}): ${g.resumo}`),
    ].join("\n"),
  );
  sections.push(
    [
      "## Optional",
      `- [Texto completo](${SITE_URL}/llms-full.txt): o conteúdo de todas as páginas acima em um só arquivo`,
      `- [Nossa história](${SITE_URL}/nossa-historia): quem constrói a immigrei e por quê`,
      `- [Planos](${SITE_URL}/planos): o que é gratuito e o que é assinatura`,
    ].join("\n"),
  );

  return `${sections.join("\n\n")}\n`;
}

function explainerFull(p: ExplainerPage) {
  const faq = p.faq.map((f) => `**${f.q}**\n${f.a}`).join("\n\n");
  return [
    `# ${p.title}`,
    `URL: ${p.url}\nVerificado em: ${p.verificadoEm}`,
    p.body,
    faq && `## Perguntas frequentes\n\n${faq}`,
    p.sources.length > 0 && `Fontes oficiais:\n${p.sources.map((s) => `- ${s}`).join("\n")}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildLlmsFullTxt(dir = DRAFTS_DIR): string {
  const blocks: string[] = [`# immigrei — conteúdo completo\n\n${SUMMARY}\n\n${DISCLAIMER}`];

  for (const p of [...getExplainersBySection("/status", dir), ...getExplainersBySection("/entenda", dir)]) {
    blocks.push(explainerFull(p));
  }

  for (const { page, visto } of visaEntries()) {
    blocks.push(
      [
        `# ${visto.codigo} — ${visto.nome}`,
        `URL: ${SITE_URL}/vistos/${visto.id}\nVerificado em: ${page.verificadoEm}`,
        page.tagline,
        page.oQueE.join("\n\n"),
        `## Quem pode seguir por aqui\n${page.quemPode.map((q) => `- ${q}`).join("\n")}`,
        `## O que fecha esta porta\n${page.bloqueios.map((b) => `- ${b.titulo} (${b.base}): ${b.texto}`).join("\n")}`,
        `## Prazos e regras\n${page.prazos.map((p) => `- ${p.titulo}: ${p.texto}`).join("\n")}`,
        `Fontes oficiais:\n${page.fontesOficiais.map((f) => `- ${f.label}: ${f.url}`).join("\n")}`,
      ].join("\n\n"),
    );
  }

  for (const g of guias) {
    blocks.push(
      [
        `# ${g.titulo}`,
        `URL: ${SITE_URL}/documentos/guias/${g.id}`,
        g.resumo,
        g.passos.map((passo, i) => `${i + 1}. ${passo}`).join("\n"),
        `Dica: ${g.dicaChave}`,
        `Fonte oficial: ${g.fonteOficial.nome} — ${g.fonteOficial.url}`,
      ].join("\n\n"),
    );
  }

  return `${blocks.join("\n\n---\n\n")}\n`;
}
