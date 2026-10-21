import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // lets you open the dev server on 127.0.0.1 too (e.g. a second login session for testing riders)
  allowedDevOrigins: ["127.0.0.1"],
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
