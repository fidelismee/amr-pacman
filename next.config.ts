// next.config.ts
import type { NextConfig } from "next";
import withPWA from "next-pwa";

// Declare process to avoid TypeScript errors
declare const process: {
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
  };
};

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Add empty turbopack config to resolve webpack/Turbopack conflict
  turbopack: {},
};

const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

export default pwaConfig(nextConfig);
