import { ImageResponse } from "next/og";

/**
 * Next.js dynamic apple-touch-icon (180x180 PNG, served at /apple-icon).
 *
 * Faithful to the Symbol of Veles from Wikipedia — THREE SEPARATE filled
 * segments (not connected strokes):
 *   1. Top bar (trapezoid, widest at top)
 *   2. Outer downward triangle (apex at bottom)
 *   3. Inner downward triangle (smaller, centered inside outer)
 *
 * iOS Safari requires PNG (SVG support is unreliable for home screen icons).
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
        {/* Veles symbol — 3 separate filled segments, cream on copper.
            viewBox 0 0 32 34 (aspect ratio ~0.94, matching 560:600 original). */}
        <svg
          width="58%"
          height="64%"
          viewBox="0 0 32 34"
          fill="#FFFBF5"
          style={{ position: "relative" }}
        >
          {/* Segment 1: Top bar (trapezoid — wider at top, narrower at bottom) */}
          <path d="M2 2 L30 2 L27 9 L5 9 Z" />
          {/* Segment 2: Outer downward triangle (apex at bottom center) */}
          <path d="M4 11 L16 32 L28 11 Z" />
          {/* Segment 3: Inner downward triangle (smaller, centered, gap between it and outer) */}
          <path d="M10 13 L16 23 L22 13 Z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
