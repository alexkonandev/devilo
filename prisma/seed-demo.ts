import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.js";
import { resetAndSeedDemo } from "../lib/demo-seed.js";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🧹 NETTOYAGE DES DONNÉES DÉMO EXISTANTES...");
  console.log("🔄 RÉEXÉCUTION DU SEED (atomic transaction)...");

  await resetAndSeedDemo(prisma);

  console.log("✅ SEED DÉMO TERMINÉ : 4 clients et 6 devis injectés.");
  console.log(`   Utilisateur : user_demo_sandbox`);
  console.log(`   Numéros de devis : DEV-001 → DEV-006`);
}

main()
  .catch((e) => {
    console.error("❌ ERREUR_SEED_DEMO:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });