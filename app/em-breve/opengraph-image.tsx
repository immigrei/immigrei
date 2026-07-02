import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Immigrei — Sua jornada migratória nos EUA, com clareza.";
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
        {/* Sprout symbol — growth, new roots */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          style={{ marginBottom: 28 }}
        >
          <circle cx="12" cy="12" r="12" fill="#E4EFE9" fillOpacity="0.16" />
          <path
            d="M12 19v-6"
            stroke="#FBF7EF"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M12 13c0-3 1.8-4.8 4.8-4.8 0 3-1.8 4.8-4.8 4.8Z"
            fill="#E8A33D"
          />
          <path
            d="M12 13c0-3-1.8-4.8-4.8-4.8 0 3 1.8 4.8 4.8 4.8Z"
            fill="#FBF7EF"
          />
        </svg>

        <div style={{ fontSize: 96, color: "#FBF7EF", letterSpacing: -2 }}>
          Immigrei
        </div>

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
