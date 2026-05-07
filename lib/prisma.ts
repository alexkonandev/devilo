import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // Utilisation de var pour le scope global en dev
  var __db: { pool: Pool; prisma: PrismaClient } | undefined;
}

const connectionString = process.env.DATABASE_URL!;

const getDb = () => {
  if (!global.__db) {
    const pool = new Pool({
      connectionString,
      max: 5, // Réduit pour Neon Free Tier (évite les limites de connexions)
      // Timeout augmenté pour les connexions lentes à Neon
      connectionTimeoutMillis: 10000,
      // Fermer les connexions inactives rapidement (Neon coupe à ~30s)
      idleTimeoutMillis: 15000,
      // Ne JAMAIS fermer complètement le pool (évite les timeouts aléatoires)
      allowExitOnIdle: false,
      // Recycler les connexions après N requêtes (évite les connexions "zombie")
      maxUses: 100,
    });

    // Gestion d'erreurs du pool avec reconnexion automatique
    pool.on("error", (err) => {
      console.error("[DB Pool Error]", err.message);
      // Ne pas reset global.__db immédiatement — laisser le pool se rétablir
    });

    pool.on("connect", () => {
      console.log("[DB Pool] New connection established");
    });

    pool.on("remove", () => {
      console.log("[DB Pool] Connection removed (idle/timeout)");
    });

    const adapter = new PrismaPg(pool);
    global.__db = {
      pool,
      prisma: new PrismaClient({
        adapter,
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
      }),
    };
  }
  return global.__db;
};

const dbInstance = getDb();
export const prisma = dbInstance.prisma;
export const pool = dbInstance.pool; // Utile si tu as besoin de SQL brut (ROI performance)

export default prisma;
