import { explainerOgImage } from "@/app/components/explainerOgImage";
import { getExplainerPage, getExplainersBySection } from "@/lib/contentPages";

export const alt = "immigrei — status do USCIS explicado em português";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getExplainersBySection("/status").map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getExplainerPage("/status", slug);
  return explainerOgImage(page?.title ?? "immigrei", "Status do USCIS, em português");
}
