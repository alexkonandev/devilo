import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  PrismaClient,
  QuoteStatus,
  PlanStatus,
  Profession,
  BusinessModel,
} from "../app/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const USER_ID = "user_38cjHYDUKxIeuFplxEkzrvbxbkF";
  const USER_EMAIL = "alexkonan.dev@gmail.com";

  console.log("🧹 NETTOYAGE RADICAL DU SYSTÈME...");

  await prisma.quoteLine.deleteMany({});
  await prisma.quote.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});

  console.log(`🚀 INJECTION DE L'ACTIF : ${USER_EMAIL}`);

  // 1. Profil de l'entrepreneur Alex
  const user = await prisma.user.create({
    data: {
      id: USER_ID,
      email: USER_EMAIL,
      plan: PlanStatus.PRO,
      profession: Profession.TECH,
      businessModel: BusinessModel.PROJECT,
      isOnboarded: true,
      companyName: "STUDIO DIGITAL IVOIRE",
      taxId: "CI-ABJ-2026-B-88",
      taxIdLabel: "RCCM",
      currency: "CFA",
      defaultVatRate: 18.0,
      quotePrefix: "QT-",
    },
  });

  // 2. Client Test : ORANGE CI
  const client = await prisma.client.create({
    data: {
      userId: user.id,
      name: "ORANGE CI",
      email: "billing@orange.ci",
      siret: "CI-ABJ-1996-B-112",
    },
  });

  // 3. Premier Devis à 1.25M
  await prisma.quote.create({
    data: {
      userId: user.id,
      clientId: client.id,
      number: "QT-26-001",
      status: QuoteStatus.DRAFT,
      vatRatePercent: 18.0,
      lines: {
        create: [
          {
            title: "DÉVELOPPEMENT COCKPIT GESTION",
            subtitle: "Next.js 15 + Neon DB (Production Ready)",
            quantity: 1,
            unitPrice: 1250000,
          },
        ],
      },
    },
  });

  console.log("✅ SEED TERMINÉ : ALEX, TON SYSTÈME EST PRÊT.");
}

main()
  .catch((e) => {
    console.error("❌ ERREUR CRITIQUE SEED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
