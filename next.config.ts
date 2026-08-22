import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  images: {
    qualities: [70, 70, 70, 70, 70, 70, 75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.orduaklarinsaat.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // /admin/login -> /auth/login rewrite
  async rewrites() {
    return [
      {
        source: '/admin/login',
        destination: '/auth/login',
      },
    ]
  },
};

export default nextConfig;
