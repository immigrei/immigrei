import type { Documento } from "@/app/documentos/[vistoId]/data";

// Heurística para prever a categoria de um documento a partir dos campos que
// já existem no checklist estático, sem precisar anotar cada item na mão.
// Prévia para validar a divisão do cofre antes de promover `categoria` a um
// campo real em Documento (data.ts) ou no Supabase.
export type Categoria =
  | "Identidade"
  | "Financeiro"
  | "Tradução"
  | "Formulários"
  | "Acadêmico/Profissional";

export const CATEGORIAS: Categoria[] = [
  "Identidade",
  "Financeiro",
  "Tradução",
  "Formulários",
  "Acadêmico/Profissional",
];

const FINANCEIRO_KEYWORDS = [
  "financeiro", "banc", "recursos", "patrocinador", "renda", "imposto",
  "declaração", "extrato", "salário", "bens", "afidavit", "i-864", "i864",
];
const ACADEMICO_KEYWORDS = [
  "histórico", "escolar", "diploma", "acadêmico", "curso", "faculdade",
  "universidade", "profissional", "currículo", "cv", "experiência", "emprego",
  "carta de aceitação", "carta de oferta", "credencial",
];
const IDENTIDADE_KEYWORDS = [
  "passaporte", "identidade", "foto", "certidão de nascimento",
  "certidão de casamento", "rg", "vínculo",
];

export function precisaTraducao(doc: Documento): boolean {
  return doc.descricao.toLowerCase().includes("tradução");
}

export function inferCategoria(doc: Documento): Categoria {
  const texto = `${doc.nome} ${doc.descricao}`.toLowerCase();

  if (precisaTraducao(doc)) return "Tradução";
  if (doc.formulario || doc.formId) return "Formulários";
  if (FINANCEIRO_KEYWORDS.some((k) => texto.includes(k))) return "Financeiro";
  if (ACADEMICO_KEYWORDS.some((k) => texto.includes(k))) return "Acadêmico/Profissional";
  if (IDENTIDADE_KEYWORDS.some((k) => texto.includes(k))) return "Identidade";

  return "Identidade";
}
