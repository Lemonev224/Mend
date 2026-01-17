// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ADMIN_ACCESS_CODE: process.env.ADMIN_ACCESS_CODE,
  },
  // Keep your webpack config for Node.js module fallbacks
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
  // This is the required fix for Next.js 16+
  turbopack: {}, 
  
  experimental: {
    serverActions: {
      allowedOrigins: ['mendapp.tech', 'localhost:3000'],
    },
  },
};

export default nextConfig;