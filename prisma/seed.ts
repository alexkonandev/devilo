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
  
  // On ne nettoie que les thèmes système pour éviter de supprimer les thèmes perso des users
  await prisma.theme.deleteMany({ where: { isSystem: true } });

  console.log("🎨 INJECTION DES THÈMES SPATIAUX...");

  const themes = [
    {
      name: "STUDIO_INDIGO",
      description: "L'identité standard de la plateforme. Professionnel et technologique.",
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
    }
  ];

  for (const theme of themes) {
    await prisma.theme.create({
      data: theme,
    });
  }

  console.log(`✅ SEED THÈMES TERMINÉ : ${themes.length} thèmes injectés.`);
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