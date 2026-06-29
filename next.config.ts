import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['firebase-admin', 'jwks-rsa', 'jose'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sudospaces.com",
      },
    ],
  },
  allowedDevOrigins: ["192.168.68.107"],
};

export default nextConfig;
