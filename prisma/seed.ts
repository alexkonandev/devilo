
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🧹 NETTOYAGE DES THÈMES...");
  // Nettoyage des thèmes système
  await prisma.theme.deleteMany({ where: { isSystem: true } });

  console.log("🎨 INJECTION DES THÈMES SPATIAUX...");
  const themes = [
    {
      name: "STUDIO_INDIGO",
      description: "L\"identité standard de la plateforme. Professionnel et technologique.",
      color: "#6366f1",
      baseLayout: "standard",
      isSystem: true,
      isPremium: false,
      config: {
        fontFamily: "Inter",
        borderRadius: "4px",
        primaryContrast: "#ffffff",
      },
    },
    {
      name: "ARCTIC_EMERALD",
      description: "Un style frais et épuré, idéal pour les projets environnementaux ou créatifs.",
      color: "#10b981",
      baseLayout: "minimal",
      isSystem: true,
      isPremium: true,
      config: {
        fontFamily: "Inter",
        borderRadius: "2px",
        primaryContrast: "#ffffff",
      },
    },
    {
      name: "DEEP_SLATE",
      description: "Minimalisme absolu. Noir profond et gris acier pour un rendu haut de gamme.",
      color: "#0f172a",
      baseLayout: "modern",
      isSystem: true,
      isPremium: true,
      config: {
        fontFamily: "Inter",
        borderRadius: "0px",
        primaryContrast: "#ffffff",
      },
    },
    {
      name: "CRIMSON_VELVET",
      description: "Énergie et passion. Un thème qui ne passe pas inaperçu.",
      color: "#f43f5e",
      baseLayout: "standard",
      isSystem: true,
      isPremium: true,
      config: {
        fontFamily: "Inter",
        borderRadius: "8px",
        primaryContrast: "#ffffff",
      },
    },
  ];

  for (const theme of themes) {
    await prisma.theme.create({ data: theme });
  }

  console.log(`✅ SEED THÈMES TERMINÉ : ${themes.length} thèmes injectés.`);

  // -----------------------------------------------------------------
  // Ajout de données factices pour les clients, devis et lignes de devis
  // -----------------------------------------------------------------
  console.log("🧹 NETTOYAGE DES CLIENTS, DEVIS ET LIGNES...");
  await prisma.quoteLine.deleteMany({});
  await prisma.quote.deleteMany({});
  await prisma.client.deleteMany({});

  console.log("📦 INJECTION DES CLIENTS FACTICES...");
  const userId = "user_2a6zR2L6q410zP90M6D6D9V7"; // Remplacez par un ID utilisateur valide si nécessaire

  const client1 = await prisma.client.create({
    data: {
      name: "SARL Lumière Bleue",
      email: "contact@lumierebleue.ci",
      phone: "0707123456",
      address: "Rue des Jardins",
      city: "Abidjan",
      postalCode: "00225",
      country: "CI",
      taxId: "RCCM-ABJ-2023-B-12345",
      userId: userId,
      quotes: {
        create: [
          {
            number: "D001",
            status: "PAID",
            createdAt: new Date("2023-01-15T10:00:00Z"),
            userId: userId, // Added userId here
            lines: {
              create: [
                { title: "Développement site web", quantity: 1, unitPrice: 1500000 },
                { title: "Maintenance annuelle", quantity: 1, unitPrice: 300000 },
              ],
            },
          },
          {
            number: "D002",
            status: "SENT",
            createdAt: new Date("2023-03-20T11:00:00Z"),
            userId: userId, // Added userId here
            lines: {
              create: [
                { title: "Consulting SEO", quantity: 5, unitPrice: 50000 },
              ],
            },
          },
        ],
      },
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: "Ivoire Services SA",
      email: "info@ivoireservices.ci",
      phone: "0101789012",
      address: "Boulevard Giscard d\"Estaing",
      city: "Abidjan",
      postalCode: "00225",
      country: "CI",
      taxId: "RCCM-ABJ-2022-B-67890",
      userId: userId,
      quotes: {
        create: [
          {
            number: "D003",
            status: "DRAFT",
            createdAt: new Date("2023-04-10T09:00:00Z"),
            userId: userId, // Added userId here
            lines: {
              create: [
                { title: "Audit cybersécurité", quantity: 1, unitPrice: 750000 },
              ],
            },
          },
        ],
      },
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: "Global Technologies",
      email: "sales@globaltech.ci",
      phone: "0505432109",
      address: "Rue Paul Langevin",
      city: "Grand-Bassam",
      postalCode: "00225",
      country: "CI",
      taxId: "RCCM-BSM-2021-A-11223",
      userId: userId,
      quotes: {
        create: [
          {
            number: "D004",
            status: "PAID",
            createdAt: new Date("2022-08-01T14:00:00Z"),
            userId: userId, // Added userId here
            lines: {
              create: [
                { title: "Installation réseau", quantity: 1, unitPrice: 2000000 },
                { title: "Formation IT", quantity: 3, unitPrice: 150000 },
              ],
            },
          },
          {
            number: "D005",
            status: "REJECTED",
            createdAt: new Date("2023-02-01T10:00:00Z"),
            userId: userId, // Added userId here
            lines: {
              create: [
                { title: "Upgrade serveurs", quantity: 1, unitPrice: 1000000 },
              ],
            },
          },
        ],
      },
    },
  });

  const client4 = await prisma.client.create({
    data: {
      name: "Alpha Design",
      email: "info@alphadesign.ci",
      phone: "0708998877",
      address: "Cocody Angré",
      city: "Abidjan",
      postalCode: "00225",
      country: "CI",
      taxId: "RCCM-ABJ-2023-B-99887",
      userId: userId,
      createdAt: new Date("2023-01-01T08:00:00Z"), // Client inactif sans devis récent
    },
  });

  console.log(`✅ SEED CLIENTS TERMINÉ : ${[client1, client2, client3, client4].length} clients injectés.`);

}

main()
  .catch((e) => {
    console.error("❌ ERREUR_SEED_THEMES:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
