// Small uppercase label used above headings across every marketing page
// (hero eyebrow, section labels). Amber by default per the brand system.

type EyebrowTone = "amber" | "pine";

const TONE: Record<EyebrowTone, string> = {
  amber: "text-amber",
  pine: "text-pine",
};

export default function Eyebrow({
  children,
  tone = "amber",
  className,
}: {
  children: React.ReactNode;
  tone?: EyebrowTone;
  className?: string;
}) {
  return (
    <p
      className={`text-xs font-bold uppercase tracking-widest ${TONE[tone]} ${className ?? ""}`}
    >
      {children}
    </p>
  );
}
