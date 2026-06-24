import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // GitHub user avatars rendered via next/image (CommitCard, commit detail).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
