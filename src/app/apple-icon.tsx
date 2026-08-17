import { ImageResponse } from "next/og";

/**
 * Next.js dynamic apple-touch-icon (180x180 PNG, served at /apple-icon).
 *
 * Professional 3-segment Veles symbol for iOS home screen.
 * Filled segments (not strokes) with sheen + shadow for premium look.
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
          background:
            "linear-gradient(135deg, #F59E0B 0%, #D97706 30%, #B45309 65%, #7C2D12 100%)",
          borderRadius: "22%",
          position: "relative",
        }}
      >
        {/* Top sheen */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "50%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0) 50%)",
            borderRadius: "22%",
          }}
        />
        {/* Bottom shadow for depth */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "40%",
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.28) 100%)",
            borderRadius: "22%",
          }}
        />
        {/* Veles symbol — 3 filled segments */}
        <svg width="55%" height="62%" viewBox="0 0 100 110" fill="#FFFBF5" style={{ position: "relative" }}>
          {/* Segment 1: Top bar (trapezoid) */}
          <path d="M5 5 L95 5 L88 22 L12 22 Z" />
          {/* Segment 2: Outer downward triangle */}
          <path d="M10 28 L50 105 L90 28 Z" />
          {/* Segment 3: Inner downward triangle */}
          <path d="M28 32 L50 70 L72 32 Z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
