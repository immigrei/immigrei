import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ENTENDA_SECTION, ExplainerHub } from "@/app/components/ExplainerArticle";
import { getExplainersBySection, SITE_URL } from "@/lib/contentPages";

const DESCRIPTION =
  "Recibos, prazos e o que acontece depois de protocolar cada formulário do USCIS — explicado em português, com fonte oficial.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Entenda o processo migratório, em português | immigrei",
  description: DESCRIPTION,
  alternates: { canonical: "/entenda" },
};

export default function EntendaHub() {
  const pages = getExplainersBySection("/entenda");
  // No reviewed page yet → no hub (see app/status/page.tsx).
  if (pages.length === 0) notFound();
  return <ExplainerHub section={ENTENDA_SECTION} intro={DESCRIPTION} pages={pages} />;
}
