import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Damián Martín — Diseñador UI/UX & generalista";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 120px",
          background: "#0f0f0f",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Accent dot */}
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#3b5bff",
            marginBottom: 32,
          }}
        />

        {/* Name */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: "#f5f5f5",
            letterSpacing: -3,
            lineHeight: 1,
            marginBottom: 24,
          }}
        >
          Damián Martín
        </div>

        {/* Role */}
        <div
          style={{
            fontSize: 32,
            color: "#888",
            letterSpacing: -0.5,
            marginBottom: 48,
          }}
        >
          Diseñador UI/UX · Branding · Producto digital
        </div>

        {/* Divider */}
        <div
          style={{
            width: 360,
            height: 1,
            background: "#2a2a2a",
            marginBottom: 40,
          }}
        />

        {/* Stats */}
        {/* color literal = aprox --color-text-muted del theme light;
            opengraph-image corre en edge runtime y no puede leer CSS tokens. */}
        <div style={{ fontSize: 24, color: "#706a61" }}>
          8+ años · 30+ proyectos · Sevilla
        </div>

        {/* URL badge */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 120,
            fontSize: 22,
            color: "#444",
          }}
        >
          damianmartin.es
        </div>
      </div>
    ),
    { ...size }
  );
}
