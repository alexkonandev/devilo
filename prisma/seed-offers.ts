import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const MY_USER_ID = "user_3G7kyu3hK2G6uaI3XHekUB9Q3pD";

const offers = [
  // ═══════════════════════════════════
  // 🌐 WEB — Développement web
  // ═══════════════════════════════════
  {
    category: "WEB",
    title: "Site vitrine 5 pages",
    subtitle: "Site responsive, SEO de base, formulaire de contact, hébergement 1 an inclus",
    unitPrice: 350000,
    annualPrice: null,
    isPremium: false,
    userId: MY_USER_ID,
  },
  {
    category: "WEB",
    title: "Site e-commerce complet",
    subtitle: "Jusqu'à 50 produits, paiement mobile money, dashboard commandes, livraison",
    unitPrice: 1200000,
    annualPrice: null,
    isPremium: true,
    userId: MY_USER_ID,
  },
  {
    category: "WEB",
    title: "Application web sur-mesure",
    subtitle: "Next.js / Node.js, dashboard admin, base de données PostgreSQL, API REST",
    unitPrice: 2500000,
    annualPrice: null,
    isPremium: true,
    userId: MY_USER_ID,
  },

  // ═══════════════════════════════════
  // 🎨 DESIGN — Design & Création
  // ═══════════════════════════════════
  {
    category: "DESIGN",
    title: "Logo + charte graphique",
    subtitle: "Logo principal + déclinaisons, charte 30 pages, kit réseaux sociaux",
    unitPrice: 500000,
    annualPrice: null,
    isPremium: false,
    userId: MY_USER_ID,
  },
  {
    category: "DESIGN",
    title: "Catalogue produit 30 pages",
    subtitle: "Maquette, mise en page, typographie, export print ready + PDF",
    unitPrice: 600000,
    annualPrice: null,
    isPremium: false,
    userId: MY_USER_ID,
  },
  {
    category: "DESIGN",
    title: "UI/UX Design application",
    subtitle: "Maquette Figma complète, prototype interactif, composants réutilisables",
    unitPrice: 800000,
    annualPrice: null,
    isPremium: true,
    userId: MY_USER_ID,
  },

  // ═══════════════════════════════════
  // 📈 SEO & MARKETING — Marketing digital
  // ═══════════════════════════════════
  {
    category: "SEO",
    title: "Audit SEO complet",
    subtitle: "Analyse technique, backlinks, mots-clés, recommandations et plan d'action",
    unitPrice: 250000,
    annualPrice: null,
    isPremium: false,
    userId: MY_USER_ID,
  },
  {
    category: "SEO",
    title: "Campagne Google Ads 1 mois",
    subtitle: "Structure de campagne, mots-clés, annonces, suivi et rapport de performance",
    unitPrice: 400000,
    annualPrice: null,
    isPremium: false,
    userId: MY_USER_ID,
  },
  {
    category: "SEO",
    title: "Stratégie réseaux sociaux 3 mois",
    subtitle: "Calendrier éditorial, création de contenu, community management, reporting",
    unitPrice: 350000,
    annualPrice: 3000000,
    isPremium: false,
    userId: MY_USER_ID,
  },

  // ═══════════════════════════════════
  // 🔧 MAINTENANCE — Maintenance & Support
  // ═══════════════════════════════════
  {
    category: "MAINTENANCE",
    title: "Maintenance site mensuelle",
    subtitle: "Mises à jour CMS, plugins, backups hebdomadaires, sécurité, uptime monitoring",
    unitPrice: 100000,
    annualPrice: 1000000,
    isPremium: false,
    userId: MY_USER_ID,
  },
  {
    category: "MAINTENANCE",
    title: "Support technique 10h/mois",
    subtitle: "Assistance prioritaire, interventions urgentes, hotline 7j/7",
    unitPrice: 200000,
    annualPrice: 2000000,
    isPremium: true,
    userId: MY_USER_ID,
  },
  {
    category: "MAINTENANCE",
    title: "Hébergement VPS managé",
    subtitle: "VPS 2 vCPU/4Go RAM, SSL, backups quotidiens, supervision 24/7, CDN",
    unitPrice: 50000,
    annualPrice: 500000,
    isPremium: false,
    userId: MY_USER_ID,
  },

  // ═══════════════════════════════════
  // 💼 CONSULTING — Conseil & Stratégie
  // ═══════════════════════════════════
  {
    category: "CONSULTING",
    title: "Audit stratégique digital",
    subtitle: "Analyse complète des processus, feuille de route 6 mois, budget et KPI",
    unitPrice: 750000,
    annualPrice: null,
    isPremium: true,
    userId: MY_USER_ID,
  },
  {
    category: "CONSULTING",
    title: "Formation WordPress 3 jours",
    subtitle: "Administration, gestion de contenu, sécurité, optimisation des performances",
    unitPrice: 450000,
    annualPrice: null,
    isPremium: false,
    userId: MY_USER_ID,
  },
  {
    category: "CONSULTING",
    title: "Accompagnement transformation digitale",
    subtitle: "Coaching 3 mois, 10h/mois, suivi personnalisé, ateliers équipe",
    unitPrice: 900000,
    annualPrice: null,
    isPremium: true,
    userId: MY_USER_ID,
  },
];

async function main() {
  console.log("🧹 NETTOYAGE DES OFFRES CATALOGUE...");
  await prisma.catalogOffer.deleteMany({});

  console.log("📦 INJECTION DES 15 OFFRES DE SUGGESTIONS...");

  for (const offer of offers) {
    await prisma.catalogOffer.create({ data: offer });
    console.log(`   ✅ [${offer.category}] ${offer.title} — ${offer.unitPrice.toLocaleString()} XOF`);
  }

  const total = await prisma.catalogOffer.count();
  console.log(`\n🎉 SEED TERMINÉ : ${total} offres de suggestions injectées.`);
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