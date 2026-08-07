import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/demo/quotes/new",
        permanent: false,
      },
    ];
  },
  serverExternalPackages: [
    "@sparticuz/chromium",
    "playwright-core",
    "puppeteer-core",
  ],
  // Force l'inclusion des binaires brotli de Chromium dans le déploiement Serverless
  outputFileTracingIncludes: {
    "/**": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
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
};

export default nextConfig;
