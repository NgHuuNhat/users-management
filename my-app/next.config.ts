import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // serverExternalPackages: ["firebase-admin"],
  serverExternalPackages: ['firebase-admin', 'jwks-rsa', 'jose'],
};

export default nextConfig;
