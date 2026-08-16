import { ImageResponse } from "next/og";

/**
 * Next.js dynamic favicon (32x32 PNG, served at /icon).
 *
 * Generated at build/runtime by Satori (next/og). Replaces the static
 * src/app/icon.svg so the favicon is a real PNG that all browsers
 * (including iOS Safari) render reliably.
 *
 * Design: Veles symbol (inverted A — downward triangle with crossbar)
 * in cream (#FFFBF5) on a multi-stop copper gradient tile.
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
        {/* Veles symbol (inverted A): two legs meeting at bottom apex + horizontal crossbar.
            Bold 4px strokes (→ 2px at 16x16 render) with round caps/joins for crispness. */}
        <svg width="62%" height="62%" viewBox="0 0 32 32" fill="none">
          <path
            d="M7 8 L16 27 L25 8"
            stroke="#FFFBF5"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.5 15 L21.5 15"
            stroke="#FFFBF5"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
