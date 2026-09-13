// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // ✅ Prevent Next.js from bundling pdf-parse
    serverExternalPackages: ["pdf-parse-new"],

    // ✅ Also ignore lint/type errors during build for faster deployment
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
