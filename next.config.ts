import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return [
      {
        source: "/api/customers/:path*",
        destination: `${BACKEND_URL}/api/customers/:path*`,
      },
      {
        source: "/api/customers",
        destination: `${BACKEND_URL}/api/customers`,
      },
      {
        source: "/api/documents/:path*",
        destination: `${BACKEND_URL}/api/documents/:path*`,
      },
      {
        source: "/api/documents",
        destination: `${BACKEND_URL}/api/documents`,
      },
      {
        source: "/api/settings/:path*",
        destination: `${BACKEND_URL}/api/settings/:path*`,
      },
      {
        source: "/api/settings",
        destination: `${BACKEND_URL}/api/settings`,
      },
      {
        source: "/api/gemini/:path*",
        destination: `${BACKEND_URL}/api/gemini/:path*`,
      },
      {
        source: "/api/feature-requests/:path*",
        destination: `${BACKEND_URL}/api/feature-requests/:path*`,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
