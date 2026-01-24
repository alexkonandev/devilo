// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Optimisation pour les icônes (Phosphor, Lucide, etc.)
    optimizePackageImports: ["@phosphor-icons/react", "lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io", // Domaine obligatoire pour Uploadthing
        port: "",
        pathname: "/f/**", // On autorise tous les fichiers dans le répertoire /f/
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
