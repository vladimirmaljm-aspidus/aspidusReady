import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    // Type errors are now fixed — keep strict checking enabled so regressions
    // are caught at build time instead of leaking into production.
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
};

export default nextConfig;
