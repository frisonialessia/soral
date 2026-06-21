// app/opengraph-image.tsx
// Imagen Open Graph (la que se ve al compartir el enlace). Generada con next/og.
import { ImageResponse } from "next/og";

export const alt = "Soral — Turnover prediction for manufacturing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F3F6FD",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 9999,
              background: "linear-gradient(135deg,#5B6EF5,#8476FF 55%,#EB4F6C)",
            }}
          />
          <div style={{ fontSize: 34, fontWeight: 700, color: "#2B2D42" }}>Soral</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: "#2B2D42",
              lineHeight: 1.05,
              letterSpacing: -1,
              maxWidth: 1000,
            }}
          >
            Know who is leaving — before they do.
          </div>
          <div style={{ fontSize: 30, color: "#6B7088", maxWidth: 920 }}>
            Explainable turnover risk scores and retention plays for the factory floor.
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#A9AEC2" }}>
          Turnover prediction for manufacturing · maquiladoras
        </div>
      </div>
    ),
    { ...size }
  );
}
