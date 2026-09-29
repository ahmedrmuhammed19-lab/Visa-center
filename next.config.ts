import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Prisma needs these env vars to be available at build time
  // for the schema validation step that happens during client init
  experimental: {
    // No specific config needed
  },
};

export default nextConfig;
