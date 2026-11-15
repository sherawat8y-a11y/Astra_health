import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ["node:sqlite"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        sqlite: false,
        "node:sqlite": false,
        "node:path": false,
        "node:fs": false,
      };
    }
    return config;
  },
};

export default nextConfig;
