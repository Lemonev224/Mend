import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    env: {
    ADMIN_ACCESS_CODE: process.env.ADMIN_ACCESS_CODE,
  },
};

export default nextConfig;
