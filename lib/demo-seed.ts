// lib/demo-seed.ts
// ─────────────────────────────────────────────────────────────────────────────
// Logique réutilisable de Reset & Re-seeding des données de démo (Sandbox).
// Utilisée par :
//   - app/api/demo/reset/route.ts  (reset automatisé via l'UI démo)
//   - prisma/seed-demo.ts          (script CLI de seed initial)
//
// Sécurité : TOUTES les opérations sont strictement ciblées sur DEMO_USER_ID.
// Cette fonction ne touche JAMAIS aux données de vrais utilisateurs.
// ─────────────────────────────────────────────────────────────────────────────
import { PrismaClient } from "../app/generated/prisma/client.js";

export const DEMO_USER_ID = "user_demo_sandbox";
export const DEMO_EMAIL = "demo@factouro.ci";

/**
 * Supprime puis réinjecte de façon atomique (transaction) les données de démo
 * pour l'utilisateur sandbox, puis restaure l'état pristine (4 clients, 6 devis).
 *
 * @param prisma Instance Prisma partagée (lib/prisma.ts) ou autonome (seed CLI).
 */
export async function resetAndSeedDemo(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // ═══════════════════════════════════════════════════════════════════════
    // 1. NETTOYAGE CIBLÉ — UNIQUEMENT les données de DEMO_USER_ID
    // ═══════════════════════════════════════════════════════════════════════
    // Supprimer les événements et lignes de devis (ordre inverse des FK)
    const demoQuotes = await tx.quote.findMany({
      where: { userId: DEMO_USER_ID },
      select: { id: true },
    });
    const quoteIds = demoQuotes.map((q) => q.id);

    if (quoteIds.length > 0) {
      await tx.quoteEvent.deleteMany({ where: { quoteId: { in: quoteIds } } });
      await tx.quoteLine.deleteMany({ where: { quoteId: { in: quoteIds } } });
    }
    await tx.quote.deleteMany({ where: { userId: DEMO_USER_ID } });

    // Supprimer les activités des clients démo, puis les clients
    const demoClients = await tx.client.findMany({
      where: { userId: DEMO_USER_ID },
      select: { id: true },
    });
    const clientIds = demoClients.map((c) => c.id);

    if (clientIds.length > 0) {
      await tx.clientActivity.deleteMany({ where: { clientId: { in: clientIds } } });
    }
    await tx.client.deleteMany({ where: { userId: DEMO_USER_ID } });

    // Nettoyage des entités résiduelles liées à l'utilisateur démo
    await tx.quoteEvent.deleteMany({ where: { userId: DEMO_USER_ID } });
    await tx.clientActivity.deleteMany({ where: { userId: DEMO_USER_ID } });
    await tx.catalogOffer.deleteMany({ where: { userId: DEMO_USER_ID } });
    await tx.userService.deleteMany({ where: { userId: DEMO_USER_ID } });
    await tx.subscription.deleteMany({ where: { userId: DEMO_USER_ID } });
    await tx.userApiLimit.deleteMany({ where: { userId: DEMO_USER_ID } });
    await tx.user.deleteMany({ where: { id: DEMO_USER_ID } });

    // ═══════════════════════════════════════════════════════════════════════
    // 2. UPSERT DE L'UTILISATEUR DÉMO
    // ═══════════════════════════════════════════════════════════════════════
    await tx.user.upsert({
      where: { id: DEMO_USER_ID },
      update: {
        email: DEMO_EMAIL,
        plan: "PRO",
        profession: "CREATIVE",
        businessModel: "PROJECT",
        companyName: "Studio Design & Tech",
        companyLogo: "/logo-icon.svg",
        taxId: "RCCM-ABJ-2024-D-00001",
        taxIdLabel: "RCCM",
        companyEmail: "contact@studiodesign.ci",
        companyPhone: "+225 07 07 00 11 22",
        companyWebsite: "https://studiodesign.ci",
        currency: "EUR",
        defaultVatRate: 20,
        quotePrefix: "DEV-",
        nextQuoteNumber: 1,
        defaultTerms:
          "Paiement : 40% à la commande, solde à la livraison. Garantie de 3 mois sur les défauts de conception. TVA incluse.",
        companyAddressDetails: "Cocody Angré 7e Tranche, Immeuble Le Mansard",
        companyCity: "ABIDJAN",
      },
      create: {
        id: DEMO_USER_ID,
        email: DEMO_EMAIL,
        plan: "PRO",
        profession: "CREATIVE",
        businessModel: "PROJECT",
        companyName: "Studio Design & Tech",
        companyLogo: "/logo-icon.svg",
        taxId: "RCCM-ABJ-2024-D-00001",
        taxIdLabel: "RCCM",
        companyEmail: "contact@studiodesign.ci",
        companyPhone: "+225 07 07 00 11 22",
        companyWebsite: "https://studiodesign.ci",
        currency: "EUR",
        defaultVatRate: 20,
        quotePrefix: "DEV-",
        nextQuoteNumber: 1,
        defaultTerms:
          "Paiement : 40% à la commande, solde à la livraison. Garantie de 3 mois sur les défauts de conception. TVA incluse.",
        companyAddressDetails: "Cocody Angré 7e Tranche, Immeuble Le Mansard",
        companyCity: "ABIDJAN",
      },
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 3. INJECTION DES 4 CLIENTS & 6 DEVIS D'ORIGINE (PRISTINE STATE)
    // ═══════════════════════════════════════════════════════════════════════
    let quoteIndex = 0;
    const nextNumber = () => {
      quoteIndex++;
      return `DEV-${String(quoteIndex).padStart(3, "0")}`;
    };

    // ─── CLIENT 1 : Nova Studio (Agence design) ───
    await tx.client.create({
      data: {
        name: "Nova Studio",
        email: "contact@novastudio.ci",
        phone: "+225 07 08 12 34 56",
        address: "Rue des Jardins, Immeuble Eburnie",
        addressLine2: "3e étage",
        city: "Abidjan Plateau",
        postalCode: "01 BP 1234",
        country: "CI",
        taxId: "RCCM-ABJ-2023-B-12345",
        tvaNumber: "CI-123456789",
        legalForm: "SARL",
        representativeName: "Kouamé Jean-Baptiste",
        representativePosition: "Directeur Général",
        notes: "Agence de design digital. Projets variés, facturation régulière.",
        userId: DEMO_USER_ID,
        activities: {
          create: [
            {
              type: "CREATION",
              content: "Création du compte client",
              createdAt: new Date("2024-01-10T09:00:00Z"),
              userId: DEMO_USER_ID,
            },
            {
              type: "EMAIL",
              content: "Premier contact commercial établi",
              createdAt: new Date("2024-01-12T14:30:00Z"),
              userId: DEMO_USER_ID,
            },
          ],
        },
        quotes: {
          create: [
            // DEVIS 1 : Refonte site vitrine (PAID)
            {
              title: "Refonte site vitrine + SEO",
              number: nextNumber(),
              status: "PAID",
              issueDate: new Date("2024-02-01T10:00:00Z"),
              dueDate: new Date("2024-03-03T10:00:00Z"),
              validityDays: 30,
              currency: "EUR",
              vatRatePercent: 20,
              discount: 0,
              terms:
                "Paiement : 40% à la commande, solde à la livraison. Garantie de 3 mois sur les défauts de conception.",
              companyName: "Studio Design & Tech",
              companyEmail: "contact@studiodesign.ci",
              companyAddress: "Cocody Angré 7e Tranche, Abidjan",
              companyTaxId: "RCCM-ABJ-2024-D-00001",
              companyTaxIdL: "RCCM",
              companyWebsite: "https://studiodesign.ci",
              clientName: "Nova Studio",
              clientEmail: "contact@novastudio.ci",
              clientAddress: "Rue des Jardins, Immeuble Eburnie, Abidjan Plateau",
              clientTaxId: "RCCM-ABJ-2023-B-12345",
              userId: DEMO_USER_ID,
              events: {
                create: [
                  { type: "created", createdAt: new Date("2024-02-01T10:00:00Z"), userId: DEMO_USER_ID },
                  { type: "sent", createdAt: new Date("2024-02-02T09:15:00Z"), userId: DEMO_USER_ID },
                  { type: "viewed", createdAt: new Date("2024-02-03T11:30:00Z"), userId: DEMO_USER_ID },
                  { type: "status_changed", status: "PAID", createdAt: new Date("2024-02-05T16:00:00Z"), userId: DEMO_USER_ID, metadata: { from: "SENT", to: "PAID" } },
                ],
              },
              lines: {
                create: [
                  { title: "Design UX/UI du site", subtitle: "Maquettage Figma, 10 pages + responsive", quantity: 1, unitPrice: 1200, baseCost: 500 },
                  { title: "Intégration Next.js", subtitle: "Développement front-end, performances optimisées", quantity: 1, unitPrice: 1800, baseCost: 800 },
                  { title: "Rédaction contenu SEO", subtitle: "10 pages optimisées, mots-clés ciblés", quantity: 1, unitPrice: 600, baseCost: 250 },
                  { title: "Configuration hébergement + domaine", subtitle: "VPS, 1 an, SSL inclus", quantity: 1, unitPrice: 300, baseCost: 150 },
                ],
              },
            },
            // DEVIS 2 : Campagne social media (SENT)
            {
              title: "Campagne social media 3 mois",
              number: nextNumber(),
              status: "SENT",
              issueDate: new Date("2024-06-15T09:00:00Z"),
              dueDate: new Date("2024-07-15T09:00:00Z"),
              validityDays: 30,
              currency: "EUR",
              vatRatePercent: 20,
              discount: 5,
              terms: "Budget pub facturé en sus. Rapport mensuel fourni. Prépaiment requis pour le premier mois.",
              companyName: "Studio Design & Tech",
              companyEmail: "contact@studiodesign.ci",
              companyAddress: "Cocody Angré 7e Tranche, Abidjan",
              companyTaxId: "RCCM-ABJ-2024-D-00001",
              companyTaxIdL: "RCCM",
              companyWebsite: "https://studiodesign.ci",
              clientName: "Nova Studio",
              clientEmail: "contact@novastudio.ci",
              clientAddress: "Rue des Jardins, Immeuble Eburnie, Abidjan Plateau",
              clientTaxId: "RCCM-ABJ-2023-B-12345",
              userId: DEMO_USER_ID,
              events: {
                create: [
                  { type: "created", createdAt: new Date("2024-06-15T09:00:00Z"), userId: DEMO_USER_ID },
                  { type: "sent", createdAt: new Date("2024-06-16T10:30:00Z"), userId: DEMO_USER_ID },
                  { type: "viewed", createdAt: new Date("2024-06-17T08:45:00Z"), userId: DEMO_USER_ID },
                ],
              },
              lines: {
                create: [
                  { title: "Configuration et stratégie", subtitle: "Persona, calendrier éditorial, ton de marque", quantity: 1, unitPrice: 500, baseCost: 200 },
                  { title: "Gestion et création de contenu", subtitle: "3 mois de posts, stories, visuels", quantity: 3, unitPrice: 400, baseCost: 150 },
                  { title: "Publicité Facebook/Instagram", subtitle: "Ciblage, création de campagnes, reporting", quantity: 3, unitPrice: 350, baseCost: 120 },
                  { title: "Budget publicitaire mensuel estimé", subtitle: "Meta Ads (facturé en sus)", quantity: 3, unitPrice: 800, baseCost: 800 },
                ],
              },
            },
          ],
        },
      },
    });

    // ─── CLIENT 2 : TechNova Solutions (IT) ───
    await tx.client.create({
      data: {
        name: "TechNova Solutions",
        email: "info@technova.ci",
        phone: "+225 01 01 78 90 12",
        address: "Boulevard Giscard d'Estaing, Immeuble CAP",
        addressLine2: "7e étage",
        city: "Abidjan Marcory",
        postalCode: "15 BP 5678",
        country: "CI",
        taxId: "RCCM-ABJ-2022-B-67890",
        tvaNumber: "CI-987654321",
        legalForm: "SA",
        representativeName: "Diallo Fatoumata",
        representativePosition: "Directrice des Systèmes d'Information",
        notes: "Client stratégique. Plusieurs projets d'infogérance en cours.",
        userId: DEMO_USER_ID,
        activities: {
          create: [
            {
              type: "CREATION",
              content: "Création du compte client suite à appel d'offres remporté",
              createdAt: new Date("2023-11-01T08:00:00Z"),
              userId: DEMO_USER_ID,
            },
            {
              type: "NOTE",
              content: "Client très exigeant sur les délais. Prévoir des marges.",
              createdAt: new Date("2023-11-15T10:00:00Z"),
              userId: DEMO_USER_ID,
            },
          ],
        },
        quotes: {
          create: [
            // DEVIS 1 : Infogérance parc (PAID)
            {
              title: "Infogérance parc informatique 2025",
              number: nextNumber(),
              status: "PAID",
              issueDate: new Date("2024-12-01T08:00:00Z"),
              dueDate: new Date("2024-12-31T08:00:00Z"),
              validityDays: 30,
              currency: "EUR",
              vatRatePercent: 20,
              discount: 0,
              terms: "Contrat annuel renouvelable par tacite reconduction. Facturation trimestrielle. Paiement à 30 jours.",
              companyName: "Studio Design & Tech",
              companyEmail: "contact@studiodesign.ci",
              companyAddress: "Cocody Angré 7e Tranche, Abidjan",
              companyTaxId: "RCCM-ABJ-2024-D-00001",
              companyTaxIdL: "RCCM",
              companyWebsite: "https://studiodesign.ci",
              clientName: "TechNova Solutions",
              clientEmail: "info@technova.ci",
              clientAddress: "Boulevard Giscard d'Estaing, Immeuble CAP, Abidjan Marcory",
              clientTaxId: "RCCM-ABJ-2022-B-67890",
              userId: DEMO_USER_ID,
              events: {
                create: [
                  { type: "created", createdAt: new Date("2024-12-01T08:00:00Z"), userId: DEMO_USER_ID },
                  { type: "sent", createdAt: new Date("2024-12-02T10:00:00Z"), userId: DEMO_USER_ID },
                  { type: "viewed", createdAt: new Date("2024-12-03T14:00:00Z"), userId: DEMO_USER_ID },
                  { type: "status_changed", status: "PAID", createdAt: new Date("2024-12-10T09:00:00Z"), userId: DEMO_USER_ID, metadata: { from: "SENT", to: "PAID" } },
                ],
              },
              lines: {
                create: [
                  { title: "Supervision et maintenance préventive", subtitle: "50 postes, serveurs, réseau. Supervision 24/7", quantity: 12, unitPrice: 450, baseCost: 200 },
                  { title: "Support technique N1/N2", subtitle: "Assistance téléphonique et remote, 8h-18h", quantity: 12, unitPrice: 300, baseCost: 120 },
                  { title: "Sauvegarde et plan de reprise", subtitle: "Backup quotidien cloud + local, test mensuel", quantity: 12, unitPrice: 250, baseCost: 100 },
                  { title: "Licences antivirus ESET", subtitle: "50 postes, renouvellement annuel", quantity: 1, unitPrice: 1500, baseCost: 900 },
                ],
              },
            },
            // DEVIS 2 : Migration cloud (SENT)
            {
              title: "Migration infrastructure cloud AWS",
              number: nextNumber(),
              status: "SENT",
              issueDate: new Date("2025-01-15T10:00:00Z"),
              dueDate: new Date("2025-02-15T10:00:00Z"),
              validityDays: 30,
              currency: "EUR",
              vatRatePercent: 20,
              discount: 10,
              terms: "Projet estimé sur 2 mois. Coûts d'infrastructure AWS en sus. Remise de 10% pour signature avant le 15/02.",
              companyName: "Studio Design & Tech",
              companyEmail: "contact@studiodesign.ci",
              companyAddress: "Cocody Angré 7e Tranche, Abidjan",
              companyTaxId: "RCCM-ABJ-2024-D-00001",
              companyTaxIdL: "RCCM",
              companyWebsite: "https://studiodesign.ci",
              clientName: "TechNova Solutions",
              clientEmail: "info@technova.ci",
              clientAddress: "Boulevard Giscard d'Estaing, Immeuble CAP, Abidjan Marcory",
              clientTaxId: "RCCM-ABJ-2022-B-67890",
              userId: DEMO_USER_ID,
              events: {
                create: [
                  { type: "created", createdAt: new Date("2025-01-15T10:00:00Z"), userId: DEMO_USER_ID },
                  { type: "sent", createdAt: new Date("2025-01-16T14:00:00Z"), userId: DEMO_USER_ID },
                  { type: "viewed", createdAt: new Date("2025-01-20T09:00:00Z"), userId: DEMO_USER_ID },
                ],
              },
              lines: {
                create: [
                  { title: "Audit et plan de migration", subtitle: "Inventaire, analyse dépendances, planification", quantity: 1, unitPrice: 800, baseCost: 350 },
                  { title: "Migration serveurs web (5 unités)", subtitle: "EC2, ELB, Auto-scaling, optimisation", quantity: 5, unitPrice: 350, baseCost: 150 },
                  { title: "Migration base de données", subtitle: "RDS PostgreSQL, migration, réplication, backup", quantity: 1, unitPrice: 700, baseCost: 300 },
                  { title: "Mise en place CI/CD", subtitle: "GitHub Actions, Docker, ECR, ECS", quantity: 1, unitPrice: 550, baseCost: 250 },
                  { title: "Formation équipe interne", subtitle: "5 jours, gestion console AWS, monitoring", quantity: 1, unitPrice: 900, baseCost: 400 },
                ],
              },
            },
          ],
        },
      },
    });

    // ─── CLIENT 3 : Maison Lumière (Retail) ───
    await tx.client.create({
      data: {
        name: "Maison Lumière",
        email: "contact@maisonlumiere.ci",
        phone: "+225 05 05 43 21 09",
        address: "Rue Paul Langevin, Zone Commerciale",
        addressLine2: "Boutique 12",
        city: "Grand-Bassam",
        postalCode: "02 BP 3456",
        country: "CI",
        taxId: "RCCM-BSM-2021-A-11223",
        tvaNumber: "CI-456789123",
        legalForm: "SARL",
        representativeName: "Traoré Moussa",
        representativePosition: "CEO",
        notes: "Boutique de luminaires haut de gamme. Besoins récurrents en e-commerce.",
        userId: DEMO_USER_ID,
        activities: {
          create: [
            {
              type: "CREATION",
              content: "Compte créé suite à recommandation de Nova Studio",
              createdAt: new Date("2024-07-15T09:00:00Z"),
              userId: DEMO_USER_ID,
            },
          ],
        },
        quotes: {
          create: [
            // DEVIS 1 : Site e-commerce (DRAFT)
            {
              title: "Développement site e-commerce",
              number: nextNumber(),
              status: "DRAFT",
              issueDate: new Date("2025-02-10T11:00:00Z"),
              dueDate: new Date("2025-04-10T11:00:00Z"),
              validityDays: 60,
              currency: "EUR",
              vatRatePercent: 20,
              discount: 0,
              terms: "Paiement en 3 phases : 40% lancement, 30% MVP, 30% livraison finale. Délai estimé : 3 mois.",
              companyName: "Studio Design & Tech",
              companyEmail: "contact@studiodesign.ci",
              companyAddress: "Cocody Angré 7e Tranche, Abidjan",
              companyTaxId: "RCCM-ABJ-2024-D-00001",
              companyTaxIdL: "RCCM",
              companyWebsite: "https://studiodesign.ci",
              clientName: "Maison Lumière",
              clientEmail: "contact@maisonlumiere.ci",
              clientAddress: "Rue Paul Langevin, Zone Commerciale, Grand-Bassam",
              clientTaxId: "RCCM-BSM-2021-A-11223",
              userId: DEMO_USER_ID,
              events: {
                create: [
                  { type: "created", createdAt: new Date("2025-02-10T11:00:00Z"), userId: DEMO_USER_ID },
                ],
              },
              lines: {
                create: [
                  { title: "Conception UX/UI e-commerce", subtitle: "Catalogue, panier, paiement, dashboard client", quantity: 1, unitPrice: 1500, baseCost: 650 },
                  { title: "Développement front-end (Next.js)", subtitle: "Interface responsive, catalogue produits, panier", quantity: 1, unitPrice: 2500, baseCost: 1100 },
                  { title: "Développement back-end (API)", subtitle: "Node.js, PostgreSQL, authentification, rôles", quantity: 1, unitPrice: 2200, baseCost: 950 },
                  { title: "Intégration paiement mobile money", subtitle: "Orange Money, MTN MoMo, Wave", quantity: 1, unitPrice: 600, baseCost: 300 },
                  { title: "Formation équipe (3 jours)", subtitle: "Administration, gestion commandes, support", quantity: 1, unitPrice: 600, baseCost: 250 },
                ],
              },
            },
          ],
        },
      },
    });

    // ─── CLIENT 4 : Atelier Vert (Éco-construction) ───
    await tx.client.create({
      data: {
        name: "Atelier Vert",
        email: "projets@ateliervert.ci",
        phone: "+225 02 03 45 67 89",
        address: "Boulevard de l'Université, Quartier Millionnaire",
        addressLine2: "Immeuble Le Baobab",
        city: "Yamoussoukro",
        postalCode: "BP 567 Yamoussoukro",
        country: "CI",
        taxId: "RCCM-YKR-2024-B-44556",
        tvaNumber: "CI-321654987",
        legalForm: "SA",
        representativeName: "Koné Amidou",
        representativePosition: "Directeur Général",
        notes: "Entreprise d'éco-construction. Projets d'architecture durable.",
        userId: DEMO_USER_ID,
        activities: {
          create: [
            {
              type: "CREATION",
              content: "Création du compte suite au salon de l'éco-construction 2025",
              createdAt: new Date("2025-01-20T14:00:00Z"),
              userId: DEMO_USER_ID,
            },
          ],
        },
        quotes: {
          create: [
            // DEVIS 1 : Site portfolio + galerie (DRAFT)
            {
              title: "Site portfolio + galerie projets",
              number: nextNumber(),
              status: "DRAFT",
              issueDate: new Date("2025-03-01T09:00:00Z"),
              dueDate: new Date("2025-04-01T09:00:00Z"),
              validityDays: 30,
              currency: "EUR",
              vatRatePercent: 20,
              discount: 0,
              terms: "Site one-page avec galerie. Hébergement 1 an offert. CMS headless pour mise à jour.",
              companyName: "Studio Design & Tech",
              companyEmail: "contact@studiodesign.ci",
              companyAddress: "Cocody Angré 7e Tranche, Abidjan",
              companyTaxId: "RCCM-ABJ-2024-D-00001",
              companyTaxIdL: "RCCM",
              companyWebsite: "https://studiodesign.ci",
              clientName: "Atelier Vert",
              clientEmail: "projets@ateliervert.ci",
              clientAddress: "Boulevard de l'Université, Quartier Millionnaire, Yamoussoukro",
              clientTaxId: "RCCM-YKR-2024-B-44556",
              userId: DEMO_USER_ID,
              events: {
                create: [
                  { type: "created", createdAt: new Date("2025-03-01T09:00:00Z"), userId: DEMO_USER_ID },
                ],
              },
              lines: {
                create: [
                  { title: "Design UI/UX one-page", subtitle: "Maquette Figma, animations scroll, responsive", quantity: 1, unitPrice: 800, baseCost: 350 },
                  { title: "Intégration Next.js + Tailwind", subtitle: "Développement front-end, performances optimisées", quantity: 1, unitPrice: 1200, baseCost: 550 },
                  { title: "Galerie portfolio avec filtre", subtitle: "Catégories, lightbox, lazy loading, tri dynamique", quantity: 1, unitPrice: 500, baseCost: 220 },
                  { title: "Formulaire de contact + CRM", subtitle: "Formulaire avec validation, stockage HubSpot", quantity: 1, unitPrice: 300, baseCost: 120 },
                  { title: "SEO et performances", subtitle: "Optimisation Lighthouse, meta tags, sitemap", quantity: 1, unitPrice: 400, baseCost: 180 },
                ],
              },
            },
            // DEVIS 2 : Audit transformation digitale (REJECTED)
            {
              title: "Audit transformation digitale",
              number: nextNumber(),
              status: "REJECTED",
              issueDate: new Date("2025-03-15T10:00:00Z"),
              dueDate: new Date("2025-04-15T10:00:00Z"),
              validityDays: 30,
              currency: "EUR",
              vatRatePercent: 20,
              discount: 15,
              terms: "Audit sur 4 semaines. Livraison d'un rapport stratégique et d'un plan d'action priorisé.",
              companyName: "Studio Design & Tech",
              companyEmail: "contact@studiodesign.ci",
              companyAddress: "Cocody Angré 7e Tranche, Abidjan",
              companyTaxId: "RCCM-ABJ-2024-D-00001",
              companyTaxIdL: "RCCM",
              companyWebsite: "https://studiodesign.ci",
              clientName: "Atelier Vert",
              clientEmail: "projets@ateliervert.ci",
              clientAddress: "Boulevard de l'Université, Quartier Millionnaire, Yamoussoukro",
              clientTaxId: "RCCM-YKR-2024-B-44556",
              userId: DEMO_USER_ID,
              events: {
                create: [
                  { type: "created", createdAt: new Date("2025-03-15T10:00:00Z"), userId: DEMO_USER_ID },
                  { type: "sent", createdAt: new Date("2025-03-16T11:00:00Z"), userId: DEMO_USER_ID },
                  { type: "viewed", createdAt: new Date("2025-03-18T09:00:00Z"), userId: DEMO_USER_ID },
                  { type: "status_changed", status: "REJECTED", createdAt: new Date("2025-03-25T16:00:00Z"), userId: DEMO_USER_ID, metadata: { from: "SENT", to: "REJECTED", reason: "Budget non approuvé par la direction" } },
                ],
              },
              lines: {
                create: [
                  { title: "Audit des processus métier", subtitle: "Analyse supply chain, production, distribution", quantity: 1, unitPrice: 1000, baseCost: 450 },
                  { title: "Audit système d'information", subtitle: "ERP, outils existants, infrastructure IT", quantity: 1, unitPrice: 800, baseCost: 350 },
                  { title: "Recommandations stratégiques", subtitle: "Feuille de route, budget, planning, KPI", quantity: 1, unitPrice: 700, baseCost: 300 },
                  { title: "Ateliers de co-construction (x3)", subtitle: "3 ateliers avec direction et équipes clés", quantity: 3, unitPrice: 250, baseCost: 100 },
                ],
              },
            },
          ],
        },
      },
    });
  });
}