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
      max: 10, // Limite basse pour Neon Free Tier (évite la saturation)
      connectionTimeoutMillis: 5000,
      // Réduire l'idle timeout : Neon coupe agressivement les connexions inactives
      idleTimeoutMillis: 30000,
      // Vérifier la validité de la connexion avant usage
      allowExitOnIdle: true,
    });

    // Gestion d'erreur sur le pool pour éviter de faire crash le process node
    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
      global.__db = undefined; // Forcer la recréation au prochain appel
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
