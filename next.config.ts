// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ADMIN_ACCESS_CODE: process.env.ADMIN_ACCESS_CODE,
  },
  // Add this to handle Node.js modules on client
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to import fs/path modules on client
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }
    return config;
  },
  // Enable server actions for email sending
  experimental: {
    serverActions: {
      allowedOrigins: ['mendapp.tech', 'localhost:3000'],
    },
  },
};

export default nextConfig;