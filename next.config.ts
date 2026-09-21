import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained build for Docker (see ../Dockerfile in i_Do_Frontend) — bundles
  // only the deps actually needed at runtime instead of shipping node_modules whole.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.avataarskin.com",
        pathname: "/static/cms/**",
      },
    ],
  },
};

export default nextConfig;
