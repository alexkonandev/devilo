import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const MY_USER_ID = "user_3G7kyu3hK2G6uaI3XHekUB9Q3pD";

async function getNextQuoteNumber(): Promise<string> {
  // Trouver le dernier numéro de devis existant
  const lastQuote = await prisma.quote.findFirst({
    orderBy: { createdAt: "desc" },
    select: { number: true },
  });

  if (!lastQuote) return "001";

  // Extraire la partie numérique (ex: "D020" → 20, ou "020" → 20)
  const numPart = lastQuote.number.replace(/^D?0*/, "");
  const lastNum = parseInt(numPart, 10);
  if (isNaN(lastNum)) return "001";

  const nextNum = lastNum + 1;
  return String(nextNum).padStart(3, "0");
}

async function main() {
  console.log("🧹 NETTOYAGE DES THÈMES...");
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
    },
  ];

  for (const theme of themes) {
    await prisma.theme.create({ data: theme });
  }

  // ─── TEMPLATES A4 (système de templates) ───
  const templates = [
    {
      name: "Classic Indigo",
      description: "Layout classique professionnel avec accents indigo",
      color: "#6366f1",
      baseLayout: "classic",
      isSystem: true,
      isPremium: false,
      config: {
        templateId: "classic-indigo",
        layout: "classic",
        headerStyle: "default",
        footerStyle: "default",
        sectionStyle: "cards",
        colors: {
          primary: "#6366f1",
          accent: "#818cf8",
          background: "#ffffff",
          surface: "#f8fafc",
          text: "#0f172a",
          textMuted: "#64748b",
          border: "#e2e8f0",
          highlight: "#eef2ff",
        },
        typography: {
          fontFamily: "Inter",
          fontScale: 1.0,
          labelCase: "uppercase",
        },
        spacing: {
          paddingX: 40,
          paddingY: 32,
          gap: 16,
        },
        options: {
          showHeaderBar: true,
          showBadges: true,
          showSummaryCard: true,
          showLegalFooter: true,
          showBlurDecoration: true,
          headerBorderStyle: "bar",
        },
      },
    },
    {
      name: "Modern Obsidian",
      description: "Design épuré et moderne avec accents ambre chauds",
      color: "#0f172a",
      baseLayout: "modern",
      isSystem: true,
      isPremium: true,
      config: {
        templateId: "modern-obsidian",
        layout: "modern",
        headerStyle: "minimal",
        footerStyle: "minimal",
        sectionStyle: "minimal",
        colors: {
          primary: "#0f172a",
          accent: "#f59e0b",
          background: "#ffffff",
          surface: "#fafafa",
          text: "#0f172a",
          textMuted: "#94a3b8",
          border: "#f1f5f9",
          highlight: "#fffbeb",
        },
        typography: {
          fontFamily: "Inter",
          fontScale: 1.0,
          labelCase: "uppercase",
        },
        spacing: {
          paddingX: 48,
          paddingY: 40,
          gap: 20,
        },
        options: {
          showHeaderBar: false,
          showBadges: false,
          showSummaryCard: true,
          showLegalFooter: true,
          showBlurDecoration: false,
          headerBorderStyle: "shadow",
        },
      },
    },
  ];

  for (const template of templates) {
    await prisma.theme.create({ data: template });
  }

  console.log(`✅ SEED THÈMES TERMINÉ : ${themes.length} thèmes + ${templates.length} templates injectés.`);

  console.log("🧹 NETTOYAGE DES CLIENTS, DEVIS, LIGNES ET ÉVÉNEMENTS...");
  await prisma.quoteEvent.deleteMany({});
  await prisma.quoteLine.deleteMany({});
  await prisma.quote.deleteMany({});
  await prisma.clientActivity.deleteMany({});
  await prisma.client.deleteMany({});

  // Détection intelligente du prochain numéro de devis
  const baseNum = parseInt(await getNextQuoteNumber(), 10);
  console.log(`📊 Dernier numéro de devis trouvé, prochain : D${String(baseNum).padStart(3, "0")}`);

  let quoteIndex = 0;
  const nextNumber = () => {
    quoteIndex++;
    return String(baseNum + quoteIndex - 1).padStart(3, "0");
  };

  console.log("📦 INJECTION DES CLIENTS ET DEVIS...");

  // ═══════════════════════════════════════════
  // CLIENT 1 : SARL Lumière Bleue (Communication)
  // ═══════════════════════════════════════════
  const client1 = await prisma.client.create({
    data: {
      name: "SARL Lumière Bleue",
      email: "contact@lumierebleue.ci",
      phone: "+225 07 07 12 34 56",
      address: "Rue des Jardins, Immeuble Eburnie",
      city: "Abidjan Plateau",
      postalCode: "01 BP 1234",
      country: "CI",
      taxId: "RCCM-ABJ-2023-B-12345",
      tvaNumber: "CI-123456789",
      legalForm: "SARL",
      representativeName: "Kouamé Jean-Baptiste",
      representativePosition: "Directeur Général",
      notes: "Client fidèle depuis 2023. Secteur communication digitale.",
      userId: MY_USER_ID,
      activities: {
        create: [
          {
            type: "CREATION",
            content: "Création du compte client",
            createdAt: new Date("2023-01-10T09:00:00Z"),
            userId: MY_USER_ID,
          },
          {
            type: "EMAIL",
            content: "Premier contact commercial établi",
            createdAt: new Date("2023-01-12T14:30:00Z"),
            userId: MY_USER_ID,
          },
        ],
      },
      quotes: {
        create: [
          // ─── DEVIS 1 : Refonte site vitrine + SEO ───
          {
            title: "Refonte site vitrine + SEO",
            number: nextNumber(),
            status: "PAID",
            issueDate: new Date("2023-02-01T10:00:00Z"),
            dueDate: new Date("2023-03-03T10:00:00Z"),
            validityDays: 30,
            currency: "XOF",
            vatRatePercent: 18,
            discount: 0,
            terms: "Paiement : 40% à la commande, solde à la livraison. Garantie de 3 mois sur les défauts de conception.",
            companyName: "Factouro SARL",
            companyEmail: "factures@factouro.ci",
            companyAddress: "Cocody Angré 7e Tranche, Abidjan",
            companyTaxId: "RCCM-ABJ-2022-A-54321",
            companyTaxIdL: "RCCM",
            companyWebsite: "https://factouro.ci",
            clientName: "SARL Lumière Bleue",
            clientEmail: "contact@lumierebleue.ci",
            clientAddress: "Rue des Jardins, Immeuble Eburnie, Abidjan Plateau",
            clientTaxId: "RCCM-ABJ-2023-B-12345",
            userId: MY_USER_ID,
            events: {
              create: [
                { type: "created", createdAt: new Date("2023-02-01T10:00:00Z"), userId: MY_USER_ID },
                { type: "sent", createdAt: new Date("2023-02-02T09:15:00Z"), userId: MY_USER_ID },
                { type: "viewed", createdAt: new Date("2023-02-03T11:30:00Z"), userId: MY_USER_ID },
                { type: "status_changed", status: "PAID", createdAt: new Date("2023-02-05T16:00:00Z"), userId: MY_USER_ID, metadata: { from: "SENT", to: "PAID" } },
              ],
            },
            lines: {
              create: [
                { title: "Design UX/UI du site", subtitle: "Maquettage Figma, 10 pages + responsive", quantity: 1, unitPrice: 800000, baseCost: 350000 },
                { title: "Intégration WordPress", subtitle: "Thème sur-mesure + plugins essentiels", quantity: 1, unitPrice: 500000, baseCost: 200000 },
                { title: "Rédaction contenu SEO", subtitle: "10 pages optimisées, mots-clés ciblés", quantity: 1, unitPrice: 250000, baseCost: 100000 },
                { title: "Configuration hébergement + nom de domaine", subtitle: "OVH, 1 an, SSL inclus", quantity: 1, unitPrice: 150000, baseCost: 80000 },
              ],
            },
          },
          // ─── DEVIS 2 : Campagne Google Ads ───
          {
            title: "Campagne Google Ads 3 mois",
            number: nextNumber(),
            status: "SENT",
            issueDate: new Date("2023-06-15T09:00:00Z"),
            dueDate: new Date("2023-07-15T09:00:00Z"),
            validityDays: 30,
            currency: "XOF",
            vatRatePercent: 18,
            discount: 5,
            terms: "Budget pub facturé en sus. Rapport mensuel fourni. Prépaiment requis pour le premier mois.",
            companyName: "Factouro SARL",
            companyEmail: "factures@factouro.ci",
            companyAddress: "Cocody Angré 7e Tranche, Abidjan",
            companyTaxId: "RCCM-ABJ-2022-A-54321",
            companyTaxIdL: "RCCM",
            companyWebsite: "https://factouro.ci",
            clientName: "SARL Lumière Bleue",
            clientEmail: "contact@lumierebleue.ci",
            clientAddress: "Rue des Jardins, Immeuble Eburnie, Abidjan Plateau",
            clientTaxId: "RCCM-ABJ-2023-B-12345",
            userId: MY_USER_ID,
            events: {
              create: [
                { type: "created", createdAt: new Date("2023-06-15T09:00:00Z"), userId: MY_USER_ID },
                { type: "sent", createdAt: new Date("2023-06-16T10:30:00Z"), userId: MY_USER_ID },
                { type: "viewed", createdAt: new Date("2023-06-17T08:45:00Z"), userId: MY_USER_ID },
              ],
            },
            lines: {
              create: [
                { title: "Configuration et structure campagne", subtitle: "Mots-clés, extensions, pages de destination", quantity: 1, unitPrice: 350000, baseCost: 150000 },
                { title: "Gestion et optimisation mensuelle", subtitle: "3 mois de suivi, A/B testing, rapports", quantity: 3, unitPrice: 250000, baseCost: 100000 },
                { title: "Création visuels display", subtitle: "5 bannières responsive", quantity: 1, unitPrice: 200000, baseCost: 80000 },
                { title: "Budget publicitaire mensuel estimé", subtitle: "Google Ads (facturé en sus)", quantity: 3, unitPrice: 500000, baseCost: 500000 },
              ],
            },
          },
          // ─── DEVIS 3 : Formation réseaux sociaux ───
          {
            title: "Formation gestion réseaux sociaux",
            number: nextNumber(),
            status: "DRAFT",
            issueDate: new Date("2024-01-10T11:00:00Z"),
            dueDate: new Date("2024-03-10T11:00:00Z"),
            validityDays: 60,
            currency: "XOF",
            vatRatePercent: 18,
            discount: 0,
            terms: "Formation en présentiel ou visio. Support PDF inclus. Attestation de formation délivrée.",
            companyName: "Factouro SARL",
            companyEmail: "factures@factouro.ci",
            companyAddress: "Cocody Angré 7e Tranche, Abidjan",
            companyTaxId: "RCCM-ABJ-2022-A-54321",
            companyTaxIdL: "RCCM",
            companyWebsite: "https://factouro.ci",
            clientName: "SARL Lumière Bleue",
            clientEmail: "contact@lumierebleue.ci",
            clientAddress: "Rue des Jardins, Immeuble Eburnie, Abidjan Plateau",
            clientTaxId: "RCCM-ABJ-2023-B-12345",
            userId: MY_USER_ID,
            events: {
              create: [
                { type: "created", createdAt: new Date("2024-01-10T11:00:00Z"), userId: MY_USER_ID },
              ],
            },
            lines: {
              create: [
                { title: "Module 1 : Stratégie de contenu", subtitle: "Calendrier éditorial, persona, ton de marque", quantity: 1, unitPrice: 300000, baseCost: 120000 },
                { title: "Module 2 : Publicité Facebook/Instagram", subtitle: "Ciblage, création de campagnes, reporting", quantity: 1, unitPrice: 350000, baseCost: 140000 },
                { title: "Module 3 : LinkedIn pour B2B", subtitle: "Optimisation profil, social selling, publicité", quantity: 1, unitPrice: 250000, baseCost: 100000 },
                { title: "Accompagnement 1 mois post-formation", subtitle: "Suivi personnalisé, correction des exercices", quantity: 1, unitPrice: 200000, baseCost: 80000 },
              ],
            },
          },
        ],
      },
    },
  });

  // ═══════════════════════════════════════════
  // CLIENT 2 : Ivoire Services SA (IT & Infogérance)
  // ═══════════════════════════════════════════
  const client2 = await prisma.client.create({
    data: {
      name: "Ivoire Services SA",
      email: "info@ivoireservices.ci",
      phone: "+225 01 01 78 90 12",
      address: "Boulevard Giscard d'Estaing, Immeuble CAP",
      city: "Abidjan Marcory",
      postalCode: "15 BP 5678",
      country: "CI",
      taxId: "RCCM-ABJ-2022-B-67890",
      tvaNumber: "CI-987654321",
      legalForm: "SA",
      representativeName: "Diallo Fatoumata",
      representativePosition: "Directrice des Systèmes d'Information",
      notes: "Client stratégique. Plusieurs projets d'infogérance en cours.",
      userId: MY_USER_ID,
      activities: {
        create: [
          {
            type: "CREATION",
            content: "Création du compte client suite à appel d'offres remporté",
            createdAt: new Date("2022-11-01T08:00:00Z"),
            userId: MY_USER_ID,
          },
          {
            type: "NOTE",
            content: "Client très exigeant sur les délais. Prévoir des marges.",
            createdAt: new Date("2022-11-15T10:00:00Z"),
            userId: MY_USER_ID,
          },
        ],
      },
      quotes: {
        create: [
          // ─── DEVIS 1 : Infogérance parc informatique ───
          {
            title: "Infogérance parc informatique 2024",
            number: nextNumber(),
            status: "PAID",
            issueDate: new Date("2023-12-01T08:00:00Z"),
            dueDate: new Date("2023-12-31T08:00:00Z"),
            validityDays: 30,
            currency: "XOF",
            vatRatePercent: 18,
            discount: 0,
            terms: "Contrat annuel renouvelable par tacite reconduction. Facturation trimestrielle. Paiement à 30 jours.",
            companyName: "Factouro SARL",
            companyEmail: "factures@factouro.ci",
            companyAddress: "Cocody Angré 7e Tranche, Abidjan",
            companyTaxId: "RCCM-ABJ-2022-A-54321",
            companyTaxIdL: "RCCM",
            companyWebsite: "https://factouro.ci",
            clientName: "Ivoire Services SA",
            clientEmail: "info@ivoireservices.ci",
            clientAddress: "Boulevard Giscard d'Estaing, Immeuble CAP, Abidjan Marcory",
            clientTaxId: "RCCM-ABJ-2022-B-67890",
            userId: MY_USER_ID,
            events: {
              create: [
                { type: "created", createdAt: new Date("2023-12-01T08:00:00Z"), userId: MY_USER_ID },
                { type: "sent", createdAt: new Date("2023-12-02T10:00:00Z"), userId: MY_USER_ID },
                { type: "viewed", createdAt: new Date("2023-12-03T14:00:00Z"), userId: MY_USER_ID },
                { type: "status_changed", status: "PAID", createdAt: new Date("2023-12-10T09:00:00Z"), userId: MY_USER_ID, metadata: { from: "SENT", to: "PAID" } },
              ],
            },
            lines: {
              create: [
                { title: "Supervision et maintenance préventive", subtitle: "50 postes, serveurs, réseau. Supervision 24/7", quantity: 12, unitPrice: 350000, baseCost: 150000 },
                { title: "Support technique N1/N2", subtitle: "Assistance téléphonique et remote, 8h-18h", quantity: 12, unitPrice: 250000, baseCost: 100000 },
                { title: "Sauvegarde et plan de reprise", subtitle: "Backup quotidien cloud + local, test mensuel", quantity: 12, unitPrice: 200000, baseCost: 80000 },
                { title: "Licences antivirus ESET", subtitle: "50 postes, renouvellement annuel", quantity: 1, unitPrice: 1200000, baseCost: 800000 },
              ],
            },
          },
          // ─── DEVIS 2 : Audit cybersécurité ───
          {
            title: "Audit cybersécurité complet",
            number: nextNumber(),
            status: "REJECTED",
            issueDate: new Date("2024-03-01T09:00:00Z"),
            dueDate: new Date("2024-03-31T09:00:00Z"),
            validityDays: 30,
            currency: "XOF",
            vatRatePercent: 18,
            discount: 0,
            terms: "Rapport d'audit livré sous 3 semaines. Préconisations et plan d'action inclus.",
            companyName: "Factouro SARL",
            companyEmail: "factures@factouro.ci",
            companyAddress: "Cocody Angré 7e Tranche, Abidjan",
            companyTaxId: "RCCM-ABJ-2022-A-54321",
            companyTaxIdL: "RCCM",
            companyWebsite: "https://factouro.ci",
            clientName: "Ivoire Services SA",
            clientEmail: "info@ivoireservices.ci",
            clientAddress: "Boulevard Giscard d'Estaing, Immeuble CAP, Abidjan Marcory",
            clientTaxId: "RCCM-ABJ-2022-B-67890",
            userId: MY_USER_ID,
            events: {
              create: [
                { type: "created", createdAt: new Date("2024-03-01T09:00:00Z"), userId: MY_USER_ID },
                { type: "sent", createdAt: new Date("2024-03-02T11:00:00Z"), userId: MY_USER_ID },
                { type: "viewed", createdAt: new Date("2024-03-03T15:00:00Z"), userId: MY_USER_ID },
                { type: "status_changed", status: "REJECTED", createdAt: new Date("2024-03-10T08:00:00Z"), userId: MY_USER_ID, metadata: { from: "SENT", to: "REJECTED", reason: "Budget non approuvé par la direction" } },
              ],
            },
            lines: {
              create: [
                { title: "Audit infrastructure réseau", subtitle: "Test d'intrusion, analyse vulnérabilités, firewall, VPN", quantity: 1, unitPrice: 1200000, baseCost: 500000 },
                { title: "Audit applications métier", subtitle: "Analyse code OWASP Top 10, tests d'intrusion applicatifs", quantity: 1, unitPrice: 800000, baseCost: 350000 },
                { title: "Rapport et préconisations", subtitle: "Rapport détaillé, tableau de priorisation, feuille de route", quantity: 1, unitPrice: 500000, baseCost: 200000 },
                { title: "Réunion de restitution", subtitle: "Présentation direction + atelier plan d'action", quantity: 1, unitPrice: 200000, baseCost: 80000 },
              ],
            },
          },
          // ─── DEVIS 3 : Migration cloud AWS ───
          {
            title: "Migration infrastructure cloud AWS",
            number: nextNumber(),
            status: "SENT",
            issueDate: new Date("2024-09-01T10:00:00Z"),
            dueDate: new Date("2024-10-01T10:00:00Z"),
            validityDays: 30,
            currency: "XOF",
            vatRatePercent: 18,
            discount: 10,
            terms: "Projet estimé sur 2 mois. Coûts d'infrastructure AWS en sus. Remise de 10% pour signature avant le 15/09.",
            companyName: "Factouro SARL",
            companyEmail: "factures@factouro.ci",
            companyAddress: "Cocody Angré 7e Tranche, Abidjan",
            companyTaxId: "RCCM-ABJ-2022-A-54321",
            companyTaxIdL: "RCCM",
            companyWebsite: "https://factouro.ci",
            clientName: "Ivoire Services SA",
            clientEmail: "info@ivoireservices.ci",
            clientAddress: "Boulevard Giscard d'Estaing, Immeuble CAP, Abidjan Marcory",
            clientTaxId: "RCCM-ABJ-2022-B-67890",
            userId: MY_USER_ID,
            events: {
              create: [
                { type: "created", createdAt: new Date("2024-09-01T10:00:00Z"), userId: MY_USER_ID },
                { type: "sent", createdAt: new Date("2024-09-02T14:00:00Z"), userId: MY_USER_ID },
                { type: "viewed", createdAt: new Date("2024-09-05T09:00:00Z"), userId: MY_USER_ID },
              ],
            },
            lines: {
              create: [
                { title: "Audit et plan de migration", subtitle: "Inventaire, analyse dépendances, planification", quantity: 1, unitPrice: 600000, baseCost: 250000 },
                { title: "Migration serveurs web (5 unités)", subtitle: "EC2, ELB, Auto-scaling, optimisation Tarif", quantity: 5, unitPrice: 250000, baseCost: 120000 },
                { title: "Migration base de données", subtitle: "RDS PostgreSQL, migration, réplication, backup", quantity: 1, unitPrice: 500000, baseCost: 200000 },
                { title: "Mise en place CI/CD", subtitle: "GitHub Actions, Docker, ECR, ECS", quantity: 1, unitPrice: 400000, baseCost: 180000 },
                { title: "Formation équipe interne", subtitle: "5 jours, gestion console AWS, monitoring, sécurité", quantity: 1, unitPrice: 750000, baseCost: 300000 },
                { title: "Support post-migration 1 mois", subtitle: "Suivi, optimisation, correction incidents", quantity: 1, unitPrice: 500000, baseCost: 200000 },
              ],
            },
          },
        ],
      },
    },
  });

  // ═══════════════════════════════════════════
  // CLIENT 3 : Global Technologies (Réseaux & Télécoms)
  // ═══════════════════════════════════════════
  const client3 = await prisma.client.create({
    data: {
      name: "Global Technologies",
      email: "sales@globaltech.ci",
      phone: "+225 05 05 43 21 09",
      address: "Rue Paul Langevin, Zone Industrielle",
      city: "Grand-Bassam",
      postalCode: "02 BP 3456",
      country: "CI",
      taxId: "RCCM-BSM-2021-A-11223",
      tvaNumber: "CI-456789123",
      legalForm: "SARL",
      representativeName: "Traoré Moussa",
      representativePosition: "CEO",
      notes: "PME dynamique. Croissance rapide, besoins récurrents en infrastructure.",
      userId: MY_USER_ID,
      activities: {
        create: [
          {
            type: "CREATION",
            content: "Compte créé suite à recommandation d'Ivoire Services",
            createdAt: new Date("2022-07-15T09:00:00Z"),
            userId: MY_USER_ID,
          },
        ],
      },
      quotes: {
        create: [
          // ─── DEVIS 1 : Installation réseau fibre ───
          {
            title: "Installation réseau fibre optique bâtiment",
            number: nextNumber(),
            status: "PAID",
            issueDate: new Date("2022-08-01T10:00:00Z"),
            dueDate: new Date("2022-08-31T10:00:00Z"),
            validityDays: 30,
            currency: "XOF",
            vatRatePercent: 18,
            discount: 0,
            terms: "Paiement : 50% à la commande, 25% à mi-parcours, 25% à la réception. Garantie 1 an.",
            companyName: "Factouro SARL",
            companyEmail: "factures@factouro.ci",
            companyAddress: "Cocody Angré 7e Tranche, Abidjan",
            companyTaxId: "RCCM-ABJ-2022-A-54321",
            companyTaxIdL: "RCCM",
            companyWebsite: "https://factouro.ci",
            clientName: "Global Technologies",
            clientEmail: "sales@globaltech.ci",
            clientAddress: "Rue Paul Langevin, Zone Industrielle, Grand-Bassam",
            clientTaxId: "RCCM-BSM-2021-A-11223",
            userId: MY_USER_ID,
            events: {
              create: [
                { type: "created", createdAt: new Date("2022-08-01T10:00:00Z"), userId: MY_USER_ID },
                { type: "sent", createdAt: new Date("2022-08-02T08:00:00Z"), userId: MY_USER_ID },
                { type: "viewed", createdAt: new Date("2022-08-03T10:00:00Z"), userId: MY_USER_ID },
                { type: "status_changed", status: "PAID", createdAt: new Date("2022-08-05T14:00:00Z"), userId: MY_USER_ID, metadata: { from: "SENT", to: "PAID" } },
              ],
            },
            lines: {
              create: [
                { title: "Câblage fibre optique (500m)", subtitle: "FTTO, 12 brins, gaines techniques, boîtiers", quantity: 1, unitPrice: 1500000, baseCost: 700000 },
                { title: "Baie de brassage 42U", subtitle: "Baie complète, switchs, répartiteurs, onduleur", quantity: 1, unitPrice: 900000, baseCost: 500000 },
                { title: "Points d'accès WiFi 6 (x8)", subtitle: "UniFi U6 Pro, alimentation PoE, gestion cloud", quantity: 8, unitPrice: 120000, baseCost: 60000 },
                { title: "Installation et configuration", subtitle: "Câblage, sertissage, test certification, mise en service", quantity: 1, unitPrice: 600000, baseCost: 300000 },
                { title: "Formation utilisateurs (1 jour)", subtitle: "Utilisation réseau, bonnes pratiques, procédures", quantity: 1, unitPrice: 200000, baseCost: 80000 },
              ],
            },
          },
          // ─── DEVIS 2 : Solution visioconférence ───
          {
            title: "Solution visioconférence salles réunion",
            number: nextNumber(),
            status: "DRAFT",
            issueDate: new Date("2024-06-15T11:00:00Z"),
            dueDate: new Date("2024-07-15T11:00:00Z"),
            validityDays: 30,
            currency: "XOF",
            vatRatePercent: 18,
            discount: 5,
            terms: "Remise de 5% pour achat groupé des 3 salles. Installation sous 2 semaines après commande.",
            companyName: "Factouro SARL",
            companyEmail: "factures@factouro.ci",
            companyAddress: "Cocody Angré 7e Tranche, Abidjan",
            companyTaxId: "RCCM-ABJ-2022-A-54321",
            companyTaxIdL: "RCCM",
            companyWebsite: "https://factouro.ci",
            clientName: "Global Technologies",
            clientEmail: "sales@globaltech.ci",
            clientAddress: "Rue Paul Langevin, Zone Industrielle, Grand-Bassam",
            clientTaxId: "RCCM-BSM-2021-A-11223",
            userId: MY_USER_ID,
            events: {
              create: [
                { type: "created", createdAt: new Date("2024-06-15T11:00:00Z"), userId: MY_USER_ID },
              ],
            },
            lines: {
              create: [
                { title: "Kit visioconférence salle 1 (grande)", subtitle: "Écran 86\", soundbar, caméra 4K, micros", quantity: 1, unitPrice: 2500000, baseCost: 1400000 },
                { title: "Kit visioconférence salle 2 (moyenne)", subtitle: "Écran 65\", soundbar, caméra 1080p, micros", quantity: 1, unitPrice: 1500000, baseCost: 800000 },
                { title: "Kit visioconférence salle 3 (petite)", subtitle: "Écran 55\", webcam 4K, micro casque", quantity: 1, unitPrice: 800000, baseCost: 400000 },
                { title: "Licences Zoom Rooms (x3)", subtitle: "Licences annuelles, gestion centralisée", quantity: 3, unitPrice: 250000, baseCost: 150000 },
                { title: "Installation et intégration", subtitle: "Montage, câblage, configuration, test", quantity: 1, unitPrice: 500000, baseCost: 250000 },
              ],
            },
          },
          // ─── DEVIS 3 : Maintenance réseau annuelle ───
          {
            title: "Contrat maintenance réseau 2025",
            number: nextNumber(),
            status: "SENT",
            issueDate: new Date("2024-11-01T09:00:00Z"),
            dueDate: new Date("2024-12-01T09:00:00Z"),
            validityDays: 30,
            currency: "XOF",
            vatRatePercent: 18,
            discount: 0,
            terms: "Contrat annuel. Engagement 12 mois. Intervention sous 4h ouvrées. Paiement mensuel.",
            companyName: "Factouro SARL",
            companyEmail: "factures@factouro.ci",
            companyAddress: "Cocody Angré 7e Tranche, Abidjan",
            companyTaxId: "RCCM-ABJ-2022-A-54321",
            companyTaxIdL: "RCCM",
            companyWebsite: "https://factouro.ci",
            clientName: "Global Technologies",
            clientEmail: "sales@globaltech.ci",
            clientAddress: "Rue Paul Langevin, Zone Industrielle, Grand-Bassam",
            clientTaxId: "RCCM-BSM-2021-A-11223",
            userId: MY_USER_ID,
            events: {
              create: [
                { type: "created", createdAt: new Date("2024-11-01T09:00:00Z"), userId: MY_USER_ID },
                { type: "sent", createdAt: new Date("2024-11-02T10:00:00Z"), userId: MY_USER_ID },
                { type: "viewed", createdAt: new Date("2024-11-05T14:00:00Z"), userId: MY_USER_ID },
              ],
            },
            lines: {
              create: [
                { title: "Maintenance préventive réseau", subtitle: "4 visites trimestrielles, audit, rapports", quantity: 4, unitPrice: 300000, baseCost: 150000 },
                { title: "Maintenance curative (forfait 20h)", subtitle: "Interventions correctives, pièces en sus", quantity: 1, unitPrice: 600000, baseCost: 300000 },
                { title: "Supervision réseau (NOC)", subtitle: "Surveillance 24/7, alertes, reporting mensuel", quantity: 12, unitPrice: 150000, baseCost: 60000 },
                { title: "Mise à jour firmware et sécurité", subtitle: "Switchs, pare-feu, AP, routeurs", quantity: 4, unitPrice: 100000, baseCost: 40000 },
              ],
            },
          },
        ],
      },
    },
  });

  // ═══════════════════════════════════════════
  // CLIENT 4 : Alpha Design Studio (Design & Branding)
  // ═══════════════════════════════════════════
  const client4 = await prisma.client.create({
    data: {
      name: "Alpha Design Studio",
      email: "info@alphadesign.ci",
      phone: "+225 07 08 99 88 77",
      address: "Cocody Angré, Immeuble Le Mansard",
      city: "Abidjan",
      postalCode: "04 BP 7890",
      country: "CI",
      taxId: "RCCM-ABJ-2023-B-99887",
      tvaNumber: "CI-789123456",
      legalForm: "SARL",
      representativeName: "Bamba Aïcha",
      representativePosition: "Directrice Artistique",
      notes: "Agence de design. Projets variés, facturation régulière.",
      userId: MY_USER_ID,
      activities: {
        create: [
          {
            type: "CREATION",
            content: "Compte créé via formulaire de contact site web",
            createdAt: new Date("2023-01-05T10:00:00Z"),
            userId: MY_USER_ID,
          },
        ],
      },
      quotes: {
        create: [
          // ─── DEVIS 1 : Identité visuelle complète ───
          {
            title: "Création identité visuelle complète",
            number: nextNumber(),
            status: "SENT",
            issueDate: new Date("2023-06-01T09:00:00Z"),
            dueDate: new Date("2023-07-01T09:00:00Z"),
            validityDays: 30,
            currency: "XOF",
            vatRatePercent: 18,
            discount: 0,
            terms: "3 propositions de direction artistique. 2 rounds de révisions. Livrables en haute résolution.",
            companyName: "Factouro SARL",
            companyEmail: "factures@factouro.ci",
            companyAddress: "Cocody Angré 7e Tranche, Abidjan",
            companyTaxId: "RCCM-ABJ-2022-A-54321",
            companyTaxIdL: "RCCM",
            companyWebsite: "https://factouro.ci",
            clientName: "Alpha Design Studio",
            clientEmail: "info@alphadesign.ci",
            clientAddress: "Cocody Angré, Immeuble Le Mansard, Abidjan",
            clientTaxId: "RCCM-ABJ-2023-B-99887",
            userId: MY_USER_ID,
            events: {
              create: [
                { type: "created", createdAt: new Date("2023-06-01T09:00:00Z"), userId: MY_USER_ID },
                { type: "sent", createdAt: new Date("2023-06-02T11:00:00Z"), userId: MY_USER_ID },
                { type: "viewed", createdAt: new Date("2023-06-03T10:00:00Z"), userId: MY_USER_ID },
              ],
            },
            lines: {
              create: [
                { title: "Logo principal + déclinaisons", subtitle: "Couleur, noir & blanc, fond clair/foncé, favicon", quantity: 1, unitPrice: 500000, baseCost: 200000 },
                { title: "Charte graphique complète", subtitle: "PDF 40 pages : couleurs, typographie, usage, exemples", quantity: 1, unitPrice: 350000, baseCost: 150000 },
                { title: "Cartes de visite (recto-verso)", subtitle: "Design + print 500 exemplaires, papier premium 350g", quantity: 1, unitPrice: 250000, baseCost: 120000 },
                { title: "Papeterie (en-tête, enveloppe)", subtitle: "Design compatible charte, fichiers print ready", quantity: 1, unitPrice: 150000, baseCost: 60000 },
                { title: "Template PowerPoint", subtitle: "5 slides types, animation, charte respectée", quantity: 1, unitPrice: 100000, baseCost: 40000 },
                { title: "Kit réseaux sociaux", subtitle: "Bannières LinkedIn, Facebook, Instagram, Twitter", quantity: 1, unitPrice: 150000, baseCost: 60000 },
              ],
            },
          },
          // ─── DEVIS 2 : Refonte catalogue produits ───
          {
            title: "Refonte catalogue produits 2024",
            number: nextNumber(),
            status: "PAID",
            issueDate: new Date("2024-01-15T10:00:00Z"),
            dueDate: new Date("2024-02-15T10:00:00Z"),
            validityDays: 30,
            currency: "XOF",
            vatRatePercent: 18,
            discount: 0,
            terms: "Catalogue 60 pages. Photos produits non incluses. Impression confiée à notre prestataire.",
            companyName: "Factouro SARL",
            companyEmail: "factures@factouro.ci",
            companyAddress: "Cocody Angré 7e Tranche, Abidjan",
            companyTaxId: "RCCM-ABJ-2022-A-54321",
            companyTaxIdL: "RCCM",
            companyWebsite: "https://factouro.ci",
            clientName: "Alpha Design Studio",
            clientEmail: "info@alphadesign.ci",
            clientAddress: "Cocody Angré, Immeuble Le Mansard, Abidjan",
            clientTaxId: "RCCM-ABJ-2023-B-99887",
            userId: MY_USER_ID,
            events: {
              create: [
                { type: "created", createdAt: new Date("2024-01-15T10:00:00Z"), userId: MY_USER_ID },
                { type: "sent", createdAt: new Date("2024-01-16T14:00:00Z"), userId: MY_USER_ID },
                { type: "viewed", createdAt: new Date("2024-01-17T09:00:00Z"), userId: MY_USER_ID },
                { type: "status_changed", status: "PAID", createdAt: new Date("2024-01-20T11:00:00Z"), userId: MY_USER_ID, metadata: { from: "SENT", to: "PAID" } },
              ],
            },
            lines: {
              create: [
                { title: "Maquette et structure du catalogue", subtitle: "Architecture, zoning, templates pages", quantity: 1, unitPrice: 400000, baseCost: 180000 },
                { title: "Design 60 pages", subtitle: "Mise en page, typographie, habillage visuel", quantity: 60, unitPrice: 15000, baseCost: 6000 },
                { title: "Couverture et reliure", subtitle: "Design couverture rigide + dos, dos carré collé", quantity: 1, unitPrice: 200000, baseCost: 80000 },
                { title: "Relecture et corrections", subtitle: "3 passages, corrections ortho/typo/coquilles", quantity: 1, unitPrice: 150000, baseCost: 60000 },
                { title: "Export print ready + version PDF", subtitle: "Fichiers séparés pour l'imprimeur + version web", quantity: 1, unitPrice: 100000, baseCost: 40000 },
              ],
            },
          },
          // ─── DEVIS 3 : Site portfolio ───
          {
            title: "Site portfolio one-page",
            number: nextNumber(),
            status: "DRAFT",
            issueDate: new Date("2024-10-01T11:00:00Z"),
            dueDate: new Date("2024-12-01T11:00:00Z"),
            validityDays: 60,
            currency: "XOF",
            vatRatePercent: 18,
            discount: 0,
            terms: "Site one-page avec galerie. Hébergement 1 an offert. CMS headless pour mise à jour.",
            companyName: "Factouro SARL",
            companyEmail: "factures@factouro.ci",
            companyAddress: "Cocody Angré 7e Tranche, Abidjan",
            companyTaxId: "RCCM-ABJ-2022-A-54321",
            companyTaxIdL: "RCCM",
            companyWebsite: "https://factouro.ci",
            clientName: "Alpha Design Studio",
            clientEmail: "info@alphadesign.ci",
            clientAddress: "Cocody Angré, Immeuble Le Mansard, Abidjan",
            clientTaxId: "RCCM-ABJ-2023-B-99887",
            userId: MY_USER_ID,
            events: {
              create: [
                { type: "created", createdAt: new Date("2024-10-01T11:00:00Z"), userId: MY_USER_ID },
              ],
            },
            lines: {
              create: [
                { title: "Design UI/UX one-page", subtitle: "Maquette Figma, animations scroll, responsive", quantity: 1, unitPrice: 400000, baseCost: 180000 },
                { title: "Intégration Next.js + Tailwind", subtitle: "Développement front-end, performances optimisées", quantity: 1, unitPrice: 600000, baseCost: 280000 },
                { title: "Galerie portfolio avec filtre", subtitle: "Catégories, lightbox, lazy loading, tri dynamique", quantity: 1, unitPrice: 250000, baseCost: 120000 },
                { title: "Formulaire de contact + CRM", subtitle: "Formulaire avec validation, stockage HubSpot", quantity: 1, unitPrice: 150000, baseCost: 60000 },
                { title: "SEO et performances", subtitle: "Optimisation Lighthouse, meta tags, sitemap, analytics", quantity: 1, unitPrice: 200000, baseCost: 80000 },
                { title: "Hébergement VPS 1 an", subtitle: "VPS 2 vCPU, 4Go RAM, 80Go SSD, SSL, backups", quantity: 1, unitPrice: 240000, baseCost: 120000 },
              ],
            },
          },
        ],
      },
    },
  });

  // ═══════════════════════════════════════════
  // CLIENT 5 : Groupe Agrifood CI (Agroalimentaire)
  // ═══════════════════════════════════════════
  const client5 = await prisma.client.create({
    data: {
      name: "Groupe Agrifood CI",
      email: "contact@agrifoodci.ci",
      phone: "+225 02 03 45 67 89",
      address: "Boulevard de l'Université, Quartier Millionnaire",
      city: "Yamoussoukro",
      postalCode: "BP 567 Yamoussoukro",
      country: "CI",
      taxId: "RCCM-YKR-2024-B-44556",
      tvaNumber: "CI-321654987",
      legalForm: "SA",
      representativeName: "Koné Amidou",
      representativePosition: "Directeur Général",
      notes: "Nouveau client. Secteur agroalimentaire en pleine expansion.",
      userId: MY_USER_ID,
      activities: {
        create: [
          {
            type: "CREATION",
            content: "Création du compte suite au salon de l'agro-industrie 2024",
            createdAt: new Date("2024-11-20T14:00:00Z"),
            userId: MY_USER_ID,
          },
        ],
      },
      quotes: {
        create: [
          // ─── DEVIS 1 : Conseil transformation digitale ───
          {
            title: "Audit et conseil transformation digitale",
            number: nextNumber(),
            status: "DRAFT",
            issueDate: new Date("2024-12-01T09:00:00Z"),
            dueDate: new Date("2025-01-01T09:00:00Z"),
            validityDays: 30,
            currency: "XOF",
            vatRatePercent: 18,
            discount: 0,
            terms: "Audit sur 4 semaines. Livraison d'un rapport stratégique et d'un plan d'action priorisé.",
            companyName: "Factouro SARL",
            companyEmail: "factures@factouro.ci",
            companyAddress: "Cocody Angré 7e Tranche, Abidjan",
            companyTaxId: "RCCM-ABJ-2022-A-54321",
            companyTaxIdL: "RCCM",
            companyWebsite: "https://factouro.ci",
            clientName: "Groupe Agrifood CI",
            clientEmail: "contact@agrifoodci.ci",
            clientAddress: "Boulevard de l'Université, Quartier Millionnaire, Yamoussoukro",
            clientTaxId: "RCCM-YKR-2024-B-44556",
            userId: MY_USER_ID,
            events: {
              create: [
                { type: "created", createdAt: new Date("2024-12-01T09:00:00Z"), userId: MY_USER_ID },
              ],
            },
            lines: {
              create: [
                { title: "Audit des processus métier", subtitle: "Analyse supply chain, production, distribution, finances", quantity: 1, unitPrice: 800000, baseCost: 350000 },
                { title: "Audit système d'information", subtitle: "ERP, outils existants, infrastructure IT, sécurité", quantity: 1, unitPrice: 600000, baseCost: 250000 },
                { title: "Recommandations stratégiques", subtitle: "Feuille de route, budget, planning, KPI", quantity: 1, unitPrice: 500000, baseCost: 200000 },
                { title: "Ateliers de co-construction (x3)", subtitle: "3 ateliers avec direction et équipes clés", quantity: 3, unitPrice: 200000, baseCost: 80000 },
                { title: "Rapport final et présentation", subtitle: "Rapport 80 pages + présentation CA", quantity: 1, unitPrice: 300000, baseCost: 120000 },
              ],
            },
          },
          // ─── DEVIS 2 : Développement site e-commerce ───
          {
            title: "Développement plateforme e-commerce B2B",
            number: nextNumber(),
            status: "SENT",
            issueDate: new Date("2025-01-15T10:00:00Z"),
            dueDate: new Date("2025-02-15T10:00:00Z"),
            validityDays: 30,
            currency: "XOF",
            vatRatePercent: 18,
            discount: 0,
            terms: "Paiement en 3 phases : 40% lancement, 30% MVP, 30% livraison finale. Délai estimé : 4 mois.",
            companyName: "Factouro SARL",
            companyEmail: "factures@factouro.ci",
            companyAddress: "Cocody Angré 7e Tranche, Abidjan",
            companyTaxId: "RCCM-ABJ-2022-A-54321",
            companyTaxIdL: "RCCM",
            companyWebsite: "https://factouro.ci",
            clientName: "Groupe Agrifood CI",
            clientEmail: "contact@agrifoodci.ci",
            clientAddress: "Boulevard de l'Université, Quartier Millionnaire, Yamoussoukro",
            clientTaxId: "RCCM-YKR-2024-B-44556",
            userId: MY_USER_ID,
            events: {
              create: [
                { type: "created", createdAt: new Date("2025-01-15T10:00:00Z"), userId: MY_USER_ID },
                { type: "sent", createdAt: new Date("2025-01-16T09:00:00Z"), userId: MY_USER_ID },
                { type: "viewed", createdAt: new Date("2025-01-20T11:00:00Z"), userId: MY_USER_ID },
              ],
            },
            lines: {
              create: [
                { title: "Conception UX/UI plateforme B2B", subtitle: "Catalogues, devis, commandes, paiement, suivi", quantity: 1, unitPrice: 1200000, baseCost: 500000 },
                { title: "Développement front-end (Next.js)", subtitle: "Interface responsive, dashboard client, panier", quantity: 1, unitPrice: 2000000, baseCost: 900000 },
                { title: "Développement back-end (API REST)", subtitle: "Node.js, PostgreSQL, authentification, rôles", quantity: 1, unitPrice: 1800000, baseCost: 800000 },
                { title: "Intégration paiement mobile money", subtitle: "Orange Money, MTN MoMo, Wave", quantity: 1, unitPrice: 500000, baseCost: 250000 },
                { title: "Module catalogue produits", subtitle: "Gestion des stocks, catégories, prix, photos", quantity: 1, unitPrice: 400000, baseCost: 200000 },
                { title: "Formation équipe (5 jours)", subtitle: "Administration, gestion commandes, support", quantity: 1, unitPrice: 500000, baseCost: 200000 },
                { title: "Hébergement cloud 1 an", subtitle: "AWS t3.medium, RDS, S3, CDN, SSL", quantity: 1, unitPrice: 600000, baseCost: 300000 },
              ],
            },
          },
          // ─── DEVIS 3 : Application suivi production ───
          {
            title: "Application mobile suivi production agricole",
            number: nextNumber(),
            status: "REJECTED",
            issueDate: new Date("2025-03-01T11:00:00Z"),
            dueDate: new Date("2025-03-31T11:00:00Z"),
            validityDays: 30,
            currency: "XOF",
            vatRatePercent: 18,
            discount: 15,
            terms: "Remise de 15% pour première collaboration. Application iOS et Android via React Native.",
            companyName: "Factouro SARL",
            companyEmail: "factures@factouro.ci",
            companyAddress: "Cocody Angré 7e Tranche, Abidjan",
            companyTaxId: "RCCM-ABJ-2022-A-54321",
            companyTaxIdL: "RCCM",
            companyWebsite: "https://factouro.ci",
            clientName: "Groupe Agrifood CI",
            clientEmail: "contact@agrifoodci.ci",
            clientAddress: "Boulevard de l'Université, Quartier Millionnaire, Yamoussoukro",
            clientTaxId: "RCCM-YKR-2024-B-44556",
            userId: MY_USER_ID,
            events: {
              create: [
                { type: "created", createdAt: new Date("2025-03-01T11:00:00Z"), userId: MY_USER_ID },
                { type: "sent", createdAt: new Date("2025-03-02T14:00:00Z"), userId: MY_USER_ID },
                { type: "viewed", createdAt: new Date("2025-03-05T10:00:00Z"), userId: MY_USER_ID },
                { type: "status_changed", status: "REJECTED", createdAt: new Date("2025-03-15T16:00:00Z"), userId: MY_USER_ID, metadata: { from: "SENT", to: "REJECTED", reason: "Projet reporté au prochain exercice fiscal" } },
              ],
            },
            lines: {
              create: [
                { title: "Design UX/App mobile", subtitle: "Maquette Figma, parcours utilisateur, composants", quantity: 1, unitPrice: 600000, baseCost: 250000 },
                { title: "Développement React Native", subtitle: "iOS + Android, code partagé, notifications push", quantity: 1, unitPrice: 2500000, baseCost: 1100000 },
                { title: "Module suivi récoltes", subtitle: "Saisie données, photos, géolocalisation, rapports", quantity: 1, unitPrice: 500000, baseCost: 250000 },
                { title: "Module stocks intrants", subtitle: "Engrais, semences, pesticides, alertes seuil", quantity: 1, unitPrice: 400000, baseCost: 200000 },
                { title: "Dashboard administrateur web", subtitle: "Statistiques, cartographie, export Excel", quantity: 1, unitPrice: 500000, baseCost: 250000 },
                { title: "Déploiement stores (Apple + Google)", subtitle: "Comptes développeur, soumission, suivi", quantity: 1, unitPrice: 200000, baseCost: 100000 },
                { title: "Formation et documentation", subtitle: "Guide utilisateur, vidéos tutorielles, support 1 mois", quantity: 1, unitPrice: 300000, baseCost: 150000 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ SEED TERMINÉ : 5 clients et 15 devis injectés.`);
  console.log(`   Numéros de devis : D${String(baseNum).padStart(3, "0")} → D${String(baseNum + 14).padStart(3, "0")}`);
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