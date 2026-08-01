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
  icon,
}: {
  children: React.ReactNode;
  padding?: CardPadding;
  className?: string;
  /** Optional line icon, shown in a tinted circle badge above the content. */
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`bg-cream-2 border border-pine-tint rounded-2xl ${PADDING[padding]} ${className ?? ""}`}
    >
      {icon && (
        <div className="w-11 h-11 rounded-full bg-pine-tint flex items-center justify-center mb-4 text-pine">
          {icon}
        </div>
      )}
      {children}
    </div>
  );
}
