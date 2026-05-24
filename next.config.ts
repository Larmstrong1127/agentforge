import type { NextConfig } from "next";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

// Force override system env vars with .env.local values (handles empty Windows env vars)
dotenvConfig({ path: resolve(process.cwd(), ".env.local"), override: true });

const nextConfig: NextConfig = {};

export default nextConfig;
