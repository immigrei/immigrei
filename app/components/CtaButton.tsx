import Link from "next/link";

// The amber pill CTA repeated across every marketing page's hero and final
// CTA. Pure styled anchor — no client logic. Not to be confused with
// PlanButton.tsx, which has Clerk/Stripe branching for the pricing page.

export default function CtaButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-block bg-amber hover:bg-amber-deep text-ink font-semibold text-base px-8 py-4 rounded-xl transition-colors ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}
