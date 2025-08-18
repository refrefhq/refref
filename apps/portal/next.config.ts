import type { NextConfig } from "next";
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "@/env";

const config: NextConfig = {
  async redirects() {
    return [
      {
        source: "/settings",
        destination: "/settings/profile",
        permanent: true,
      },
    ];
  },
  transpilePackages: ["@refref/ui"],
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    // using asset/source to load the script
    // causes minify etc to run and typeof window becomes undefined
    config.module.rules.push({
      test: /\.es\.js$/,
      use: ["raw-loader"],
    });

    return config;
  },
  turbopack: {
    rules: {
      // Configure Turbopack to handle .es.js scripts as assets
      "*.es.js": {
        loaders: ["raw-loader"],
      },
    },
  },
};

export default config;
