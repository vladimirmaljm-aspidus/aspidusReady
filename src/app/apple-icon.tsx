import { ImageResponse } from "next/og";

/**
 * Next.js dynamic apple-touch-icon (180x180 PNG, served at /apple-icon).
 *
 * iOS Safari requires a PNG apple-touch-icon (SVG support is unreliable).
 * This file is auto-detected by Next.js App Router and served at /apple-icon
 * with Content-Type: image/png. It's referenced by the metadata.icons.apple
 * config in layout.tsx and by the manifest.json icons array.
 *
 * Design: Veles symbol (inverted A) on a polished copper gradient tile,
 * with top sheen + bottom inner shadow for a 3D premium look at 180x180.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background:
            "linear-gradient(135deg, #F59E0B 0%, #D97706 30%, #B45309 65%, #7C2D12 100%)",
          borderRadius: "22%",
        }}
      >
        {/* Top sheen overlay (white highlight fading out toward middle) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0) 50%)",
            borderRadius: "22%",
          }}
        />
        {/* Bottom inner shadow overlay (darkening the bottom edge for depth) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.28) 100%)",
            borderRadius: "22%",
          }}
        />
        {/* Veles symbol (inverted A) — bold strokes scaled for 180x180 */}
        <svg
          width="58%"
          height="58%"
          viewBox="0 0 32 32"
          fill="none"
          style={{ position: "relative" }}
        >
          <path
            d="M7 8 L16 27 L25 8"
            stroke="#FFFBF5"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.5 15 L21.5 15"
            stroke="#FFFBF5"
            strokeWidth="4.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
