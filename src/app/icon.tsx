import { ImageResponse } from "next/og";

/**
 * Next.js dynamic favicon (32x32 PNG, served at /icon).
 *
 * Faithful to the Symbol of Veles from Wikipedia — THREE SEPARATE filled
 * segments (not connected strokes):
 *   1. Top bar (trapezoid, widest at top)
 *   2. Outer downward triangle (apex at bottom)
 *   3. Inner downward triangle (smaller, centered inside outer)
 *
 * The three segments are visually disconnected, matching the original
 * Veles symbol: https://en.wikipedia.org/wiki/Veles_(god)
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
        }}
      >
        {/* Veles symbol — 3 separate filled segments, cream on copper.
            viewBox 0 0 32 34 (aspect ratio ~0.94, matching 560:600 original). */}
        <svg width="60%" height="66%" viewBox="0 0 32 34" fill="#FFFBF5">
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
