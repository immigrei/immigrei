// The bg-cream-2/border-pine-tint/rounded-2xl block repeated across every
// marketing page (pillars, value grids, pain-point quotes). Centralized so
// the shape only needs to change in one place.

type CardPadding = "sm" | "md" | "lg";

const PADDING: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  padding = "md",
  className,
}: {
  children: React.ReactNode;
  padding?: CardPadding;
  className?: string;
}) {
  return (
    <div
      className={`bg-cream-2 border border-pine-tint rounded-2xl ${PADDING[padding]} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
