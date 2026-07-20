import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "immigrei — Sua jornada migratória nos EUA, com clareza.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand poster, not a site thumbnail. Everything important sits in the
// central square so WhatsApp's square crop still reads as the brand.
// Colors hardcoded: CSS variables don't exist in the OG renderer.
export default async function OgImage() {
  const fraunces = await fetch(
    new URL("./Fraunces-SemiBold.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#1E5E4E",
          fontFamily: "Fraunces",
        }}
      >
        {/* Brand icon — 6-step trajectory + amber next-step arrow (manual §01).
            Cream dots for contrast on the pine background; arrow always amber. */}
        <svg
          width="132"
          height="132"
          viewBox="0 0 24 24"
          fill="none"
          style={{ marginBottom: 28 }}
        >
          <g transform="translate(1.549 1.423) rotate(12 12 12)">
            <circle cx="4.2" cy="20.2" r="1.7" fill="#F4EEE2" fillOpacity="0.15" />
            <circle cx="7.4" cy="17.6" r="1.7" fill="#F4EEE2" fillOpacity="0.3" />
            <circle cx="6" cy="13.6" r="1.7" fill="#F4EEE2" fillOpacity="0.45" />
            <circle cx="9.8" cy="11.6" r="1.7" fill="#F4EEE2" fillOpacity="0.62" />
            <circle cx="8.6" cy="7.8" r="1.7" fill="#F4EEE2" fillOpacity="0.82" />
            <circle cx="12.4" cy="6.4" r="1.85" fill="#F4EEE2" />
            <path
              d="M12.2 2.2 H16.6 V6.6"
              fill="none"
              stroke="#E8A33D"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>

        <div style={{ fontSize: 96, color: "#FBF7EF" }}>immigrei</div>

        <div
          style={{
            fontSize: 30,
            color: "#E4EFE9",
            marginTop: 20,
          }}
        >
          Sua jornada migratória nos EUA, com clareza.
        </div>

        <div
          style={{
            fontSize: 22,
            color: "#E8A33D",
            marginTop: 44,
            textTransform: "uppercase",
            letterSpacing: 4,
          }}
        >
          Em breve — entre na lista
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Fraunces", data: fraunces, weight: 600 as const }],
    },
  );
}
