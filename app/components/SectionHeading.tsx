// Fraunces is display-only in this codebase and is always applied via an
// inline style — never a Tailwind class (see CLAUDE.md §4: Fraunces never on
// form labels/UI, and the font is loaded as a CSS variable, not a utility).
// This wraps that convention so every H1/H2/H3 stays consistent.

type HeadingSize = "hero" | "section" | "subsection";

const SIZE: Record<HeadingSize, string> = {
  hero: "text-5xl md:text-6xl font-semibold leading-tight",
  section: "text-2xl md:text-3xl font-semibold leading-tight",
  subsection: "text-xl md:text-2xl font-semibold leading-tight",
};

export default function SectionHeading({
  children,
  as: Tag = "h2",
  size = "section",
  className,
}: {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  size?: HeadingSize;
  className?: string;
}) {
  return (
    <Tag
      className={`text-ink ${SIZE[size]} ${className ?? ""}`}
      style={{ fontFamily: "var(--font-display)" }}
    >
      {children}
    </Tag>
  );
}
