import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Keep dev linting, but don't fail production builds due to ESLint issues
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
