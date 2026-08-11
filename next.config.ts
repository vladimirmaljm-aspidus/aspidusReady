import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // Type errors are now fixed — keep strict checking enabled so regressions
    // are caught at build time instead of leaking into production.
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking — don't allow embedding in iframes
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Force HTTPS for 1 year
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // Control referrer information
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Content Security Policy — restrict what can load/execute
          { key: "Content-Security-Policy", value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js needs unsafe-inline/eval
            "style-src 'self' 'unsafe-inline'",                   // Tailwind needs inline styles
            "img-src 'self' data: https: blob:",                   // Images from any HTTPS + data URLs
            "font-src 'self' data:",                               // Fonts
            "connect-src 'self' https://*.supabase.co https://nominatim.openstreetmap.org https://maps.googleapis.com",  // API connections
            "worker-src 'self' blob:",                             // MapLibre GL tile-parsing worker (self-hosted basemap, no external tile service)
            "frame-ancestors 'none'",                              // No iframe embedding
            "form-action 'self'",                                  // Forms only to same origin
            "base-uri 'self'",                                     // Base tag only same origin
            "object-src 'none'",                                   // No <object>/<embed> tags
          ].join("; ") },
          // Permissions Policy — disable unnecessary browser features
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
