// Immigrei brand mark — the single source of truth for the logo.
// Follows the Manual de Identidade Visual (V1.0):
//   - Wordmark is always lowercase "immigrei" in Fraunces.
//   - The icon (6-step trajectory + amber next-step arrow) rides 12° and is
//     never rotated, mirrored, or recolored — the arrow stays amber on every
//     background; only the dots switch tone for contrast.
//   - "lockup" (icon + wordmark) is for comfortable sizes (hero, auth, footer).
//     Compact spots like the app header use "wordmark" alone, because the icon's
//     six dots turn to mud below ~40px (manual §01/§02).

type LogoTone = "pine" | "cream";
type LogoVariant = "wordmark" | "lockup";

const TONE: Record<LogoTone, string> = {
  pine: "var(--pine)", // dots on light surfaces (cream)
  cream: "var(--cream)", // inverted: dots on dark surfaces (pine)
};

function BrandIcon({ dot, className }: { dot: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Trajectory tilted a fixed 12° — do not rotate beyond this. */}
      <g transform="translate(1.549 1.423) rotate(12 12 12)">
        <circle cx="4.2" cy="20.2" r="1.7" fill={dot} opacity="0.15" />
        <circle cx="7.4" cy="17.6" r="1.7" fill={dot} opacity="0.3" />
        <circle cx="6" cy="13.6" r="1.7" fill={dot} opacity="0.45" />
        <circle cx="9.8" cy="11.6" r="1.7" fill={dot} opacity="0.62" />
        <circle cx="8.6" cy="7.8" r="1.7" fill={dot} opacity="0.82" />
        <circle cx="12.4" cy="6.4" r="1.85" fill={dot} />
        {/* Next-step arrow — always amber, on every background. */}
        <path
          d="M12.2 2.2 H16.6 V6.6"
          fill="none"
          stroke="var(--amber)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export default function Logo({
  variant = "wordmark",
  tone = "pine",
  className,
}: {
  variant?: LogoVariant;
  tone?: LogoTone;
  /** Sizing hook — set the font size here (e.g. "text-2xl"); the icon scales with it. */
  className?: string;
}) {
  const color = TONE[tone];

  return (
    <span
      className={`inline-flex items-center gap-[0.4em] font-semibold leading-none ${className ?? ""}`}
      style={{ fontFamily: "var(--font-display)", color }}
    >
      {variant === "lockup" && (
        <BrandIcon dot={color} className="h-[1.05em] w-auto shrink-0" />
      )}
      immigrei
    </span>
  );
}
