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

  console.log("🧹 NETTOYAGE_RADICAL...");

  // Suppression par ordre de dépendance
  await prisma.quoteLine.deleteMany({});
  await prisma.quote.deleteMany({});
  await prisma.userService.deleteMany({});
  await prisma.catalogOffer.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});

  console.log(`🚀 INITIALISATION_ALEX : ${USER_EMAIL}`);

  // 1. Profil Entrepreneur
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

  console.log("📦 INJECTION_MARKET_OFFERS (CatalogOffer)...");

  // 2. Offres Globales (Marketplace) - Dans ton schéma, elles sont liées à un User
  const marketOffers = [
    {
      userId: USER_ID,
      title: "ARCHITECTURE_MICROSERVICES",
      subtitle: "Conception scale-out avec gRPC/RabbitMQ.",
      category: "BACKEND",
      unitPrice: 1200000,
      isPremium: true,
    },
    {
      userId: USER_ID,
      title: "UI_KIT_TAILWIND_PRO",
      subtitle: "Bibliothèque de composants React documentés.",
      category: "FRONTEND",
      unitPrice: 350000,
      isPremium: false,
    },
  ];

  for (const offer of marketOffers) {
    await prisma.catalogOffer.create({ data: offer });
  }

  console.log("👤 INJECTION_INVENTAIRE_PERSO (UserService)...");

  // 3. Tes Services Personnels (Ton catalogue de vente direct)
  const personalServices = [
    {
      userId: USER_ID,
      title: "DEVELOPPEMENT_COCKPIT_GESTION",
      subtitle: "Next.js 15 + Neon DB (Production Ready)",
      unitPrice: 1250000,
    },
  ];

  for (const service of personalServices) {
    await prisma.userService.create({ data: service });
  }

  // 4. Client & Devis
  const client = await prisma.client.create({
    data: {
      userId: user.id,
      name: "ORANGE CI",
      email: "billing@orange.ci",
      siret: "CI-ABJ-1996-B-112",
    },
  });

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
            subtitle: "Next.js 15 + Neon DB",
            quantity: 1,
            unitPrice: 1250000,
          },
        ],
      },
    },
  });

  console.log("✅ SEED_COMPLET : ALEX, TON SYSTEME EST ALIGNÉ SUR TON SCHEMA.");
}

main()
  .catch((e) => {
    console.error("❌ ERREUR_SEED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
