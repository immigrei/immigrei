import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Share card for explainer pages — what WhatsApp/Instagram show when a link
// is pasted. Same poster language as app/em-breve/opengraph-image.tsx;
// colors are hardcoded for the same reason (CSS variables don't exist in the
// OG renderer). Runs at build time only (Node runtime, static params).
export async function explainerOgImage(title: string, kicker: string) {
  const fraunces = await readFile(join(process.cwd(), "app/em-breve/Fraunces-SemiBold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1E5E4E",
          padding: "72px 80px",
          fontFamily: "Fraunces",
        }}
      >
        <div
          style={{
            fontSize: 26,
            color: "#E8A33D",
            textTransform: "uppercase",
            letterSpacing: 4,
          }}
        >
          {kicker}
        </div>
        <div style={{ fontSize: title.length > 70 ? 54 : 64, color: "#FBF7EF", lineHeight: 1.15 }}>
          {title}
        </div>
        <div style={{ fontSize: 44, color: "#E4EFE9" }}>immigrei</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Fraunces", data: fraunces, weight: 600 as const }],
    },
  );
}
