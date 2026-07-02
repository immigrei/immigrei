import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Immigrei — Sua jornada migratória nos EUA, com clareza.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand colors hardcoded: CSS variables don't exist in the OG renderer.
export default function OgImage() {
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
          background: "#F4EEE2",
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: "#1E5E4E",
            marginBottom: 32,
          }}
        >
          Immigrei
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 600,
            color: "#1B2520",
            textAlign: "center",
            lineHeight: 1.15,
            marginBottom: 32,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>Sua jornada migratória</span>
          <span style={{ display: "flex" }}>
            nos EUA,&nbsp;<span style={{ color: "#1E5E4E" }}>com clareza.</span>
          </span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#55615A",
            marginBottom: 48,
          }}
        >
          Construído por imigrantes, para imigrantes. Em português.
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#FBF7EF",
            background: "#E8A33D",
            padding: "18px 44px",
            borderRadius: 16,
          }}
        >
          Entrar na lista de espera →
        </div>
      </div>
    ),
    size,
  );
}
