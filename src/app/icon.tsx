import { ImageResponse } from "next/og";

/**
 * Next.js dynamic favicon (32x32 PNG, served at /icon).
 *
 * Professional 3-segment Veles symbol matching Wikipedia original:
 *   1. Top bar (trapezoid — wide top, narrow bottom)
 *   2. Outer downward triangle (large, apex at bottom)
 *   3. Inner downward triangle (smaller, gap between it and outer)
 *
 * All segments are FILLED (not stroked) in cream on copper gradient.
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
          position: "relative",
        }}
      >
        {/* Top sheen for depth */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "50%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%)",
            borderRadius: "22%",
          }}
        />
        {/* Veles symbol — 3 filled segments matching Wikipedia original */}
        <svg width="55%" height="60%" viewBox="0 0 100 110" fill="#FFFBF5" style={{ position: "relative" }}>
          {/* Segment 1: Top bar (trapezoid — wide at top, narrow at bottom) */}
          <path d="M5 5 L95 5 L88 22 L12 22 Z" />
          {/* Segment 2: Outer downward triangle (apex at bottom center) */}
          <path d="M10 28 L50 105 L90 28 Z" />
          {/* Segment 3: Inner downward triangle (smaller, gap between it and outer) */}
          <path d="M28 32 L50 70 L72 32 Z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
