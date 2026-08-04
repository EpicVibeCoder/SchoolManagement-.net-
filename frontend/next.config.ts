import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "path";

// Load monorepo root .env (one file for Docker + API + frontend)
loadEnvConfig(path.join(__dirname, ".."));
const nextConfig: NextConfig = {};
export default nextConfig;
