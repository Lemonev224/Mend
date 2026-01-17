// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ADMIN_ACCESS_CODE: process.env.ADMIN_ACCESS_CODE,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }
    return config;
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['mendapp.tech', 'localhost:3000'],
    },
  },
  // Move turbopack to the root level
  // This tells Next.js to ignore the webpack conflict or how to handle it
  // Note: If your version still errors on this key, use Option 2.
};

export default nextConfig;