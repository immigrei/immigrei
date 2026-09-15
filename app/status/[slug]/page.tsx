import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ExplainerArticle, {
  STATUS_SECTION,
  explainerMetadata,
} from "@/app/components/ExplainerArticle";
import {
  getExplainerPage,
  getExplainersBySection,
  relatedExplainers,
} from "@/lib/contentPages";

// USCIS case-status messages explained in PT-BR, ranking on the English
// status string. Only drafts that cleared the human review gate exist here
// (lib/contentPages.ts) — any other slug is a 404, never a runtime render.
export const dynamicParams = false;

export function generateStaticParams() {
  return getExplainersBySection("/status").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getExplainerPage("/status", slug);
  return page ? explainerMetadata(page) : {};
}

export default async function StatusPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getExplainerPage("/status", slug);
  if (!page) notFound();
  return (
    <ExplainerArticle page={page} section={STATUS_SECTION} related={relatedExplainers(page)} />
  );
}
