import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExplainerHub, STATUS_SECTION } from "@/app/components/ExplainerArticle";
import { getExplainersBySection, SITE_URL } from "@/lib/contentPages";

const DESCRIPTION =
  "O que cada mensagem de status do seu caso no USCIS significa, em português — e qual é o próximo passo.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Status do caso no USCIS, explicados em português | immigrei",
  description: DESCRIPTION,
  alternates: { canonical: "/status" },
};

export default function StatusHub() {
  const pages = getExplainersBySection("/status");
  // No reviewed page yet → no hub (and nothing in the sitemap) rather than
  // an empty page for crawlers to index.
  if (pages.length === 0) notFound();
  return <ExplainerHub section={STATUS_SECTION} intro={DESCRIPTION} pages={pages} />;
}
