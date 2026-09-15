import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ExplainerArticle, {
  ENTENDA_SECTION,
  explainerMetadata,
} from "@/app/components/ExplainerArticle";
import {
  getExplainerPage,
  getExplainersBySection,
  relatedExplainers,
} from "@/lib/contentPages";

// Process explainers — receipt-number decoder, I-797, "o que acontece depois
// de protocolar o I-xxx". Same gate as /status: only reviewed drafts exist.
export const dynamicParams = false;

export function generateStaticParams() {
  return getExplainersBySection("/entenda").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getExplainerPage("/entenda", slug);
  return page ? explainerMetadata(page) : {};
}

export default async function EntendaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getExplainerPage("/entenda", slug);
  if (!page) notFound();
  return (
    <ExplainerArticle page={page} section={ENTENDA_SECTION} related={relatedExplainers(page)} />
  );
}
