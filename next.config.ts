// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@sparticuz/chromium",
    "playwright-core",
    "puppeteer-core",
  ],
  experimental: {
    // Optimisation pour les icônes (Phosphor, Lucide, etc.)
    optimizePackageImports: ["@phosphor-icons/react", "lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/f/**",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
        port: "",
        pathname: "/f/**",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
