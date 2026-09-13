// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Tell Next.js to load pdf-parse at runtime, not bundle it
    serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
