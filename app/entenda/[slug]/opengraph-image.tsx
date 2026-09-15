import { explainerOgImage } from "@/app/components/explainerOgImage";
import { getExplainerPage, getExplainersBySection } from "@/lib/contentPages";

export const alt = "immigrei — o processo migratório explicado em português";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getExplainersBySection("/entenda").map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getExplainerPage("/entenda", slug);
  return explainerOgImage(page?.title ?? "immigrei", "Entenda o processo");
}
