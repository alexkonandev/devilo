# 📋 Devis Express — Application de Devis Professionnelle

**Devis Express** est une application web professionnelle de création, gestion et envoi de devis, conçue pour les freelances et les TPE/PME. Elle offre une interface moderne de type **Spatial UI** avec un éditeur de devis temps réel, la génération de PDF, l'envoi par email, et la gestion complète des clients et du catalogue.

---

## 🚀 Stack Technique

| Catégorie | Technologie |
|-----------|-------------|
| **Framework** | Next.js 16 (App Router) |
| **Langage** | TypeScript 5 |
| **Base de données** | PostgreSQL (via Neon) |
| **ORM** | Prisma 7 |
| **Authentification** | Clerk |
| **Paiement** | Stripe |
| **Email** | Resend |
| **PDF** | Puppeteer (Chromium via @sparticuz/chromium) |
| **UI** | Tailwind CSS 4 avec Design System Brutalist/Bento |
| **State Management** | Zustand (useKernelStore) |
| **Validation** | Zod |
| **Upload** | UploadThing |
| **Charts** | Recharts |

---

## 📁 Structure du Projet

```
my-app/
├── actions/                    # Server Actions Next.js
│   ├── billing-action.ts       # Abonnement Stripe, quotas
│   ├── catalog-action.ts       # Catalogue services
│   ├── client-action.ts        # CRUD clients (paginated, search)
│   ├── client-import-action.ts # Import CSV clients
│   ├── dashboard-actions.ts    # KPIs, analytics
│   ├── quote-editor-action.ts  # Sauvegarde devis
│   ├── send-quote-email.ts     # Envoi email + PDF
│   └── settings-action.ts      # Paramètres utilisateur
│
├── app/
│   ├── (auth)/                 # Pages connexion/inscription
│   ├── (dashboard)/            # Dashboard, clients, devis, catalogue
│   │   ├── clients/            # Gestion des clients
│   │   ├── quotes/             # Liste des devis
│   │   ├── catalog/            # Catalogue de services
│   │   ├── dashboard/          # Tableau de bord
│   │   └── settings/           # Paramètres
│   ├── (editor)/               # Éditeur de devis
│   │   └── quotes/[id]/        # Studio d'édition
│   ├── api/
│   │   ├── print/              # Route de génération PDF
│   │   ├── webhooks/stripe/    # Webhooks Stripe
│   │   └── uploadthing/        # Upload fichiers
│   └── onboarding/             # Onboarding nouveau user
│
├── components/
│   ├── editor/                 # Éditeur de devis
│   │   ├── quote-editor-layout.tsx
│   │   ├── studio-sidebar-left.tsx   # Sidebar client/catalogue
│   │   ├── studio-sidebar-right.tsx  # Sidebar finance/légal
│   │   ├── QuoteVisualizer.tsx      # Visualisation A4
│   │   └── floating-toolbar.tsx     # Barre d'outils flottante
│   ├── layout/                 # Layout global
│   │   ├── spatial-dock.tsx    # Dock spatial
│   │   └── spatial-status-bar.tsx
│   ├── pdf/                    # Template PDF
│   │   └── printable-quote.tsx
│   └── ui/                     # Composants UI (shadcn/ui)
│
├── features/                   # Vues métier (Spatial UI)
│   ├── clients/
│   │   └── spatial-clients-view.tsx  # Vue complète clients
│   ├── quotes/
│   │   └── spatial-quotes-view.tsx   # Liste devis
│   ├── catalog/
│   │   └── spatial-catalog-view.tsx  # Catalogue
│   ├── dashboard/
│   │   └── dashboard-view.tsx        # KPIs
│   └── billing/
│       └── spatial-billing-view.tsx  # Abonnement
│
├── lib/
│   ├── prisma.ts               # Client Prisma
│   ├── auth.ts                 # Wrapper auth Clerk
│   ├── pdf-engine.ts           # Moteur PDF (serveur)
│   ├── print-template.ts       # Template HTML devis
│   ├── email.ts                # Envoi email (Resend)
│   ├── stripe.ts               # Client Stripe
│   ├── api-limit.ts            # Quotas API
│   ├── design-system.ts        # Tokens Design System
│   └── validations/            # Schémas Zod
│       ├── client.ts
│       ├── catalog.ts
│       └── settings.ts
│
├── prisma/
│   ├── schema.prisma           # Modèle de données
│   └── migrations/             # Migrations Prisma
│
└── middleware.ts               # Clerk middleware
```

---

## 🧠 Architecture

### Spatial UI
L'interface utilise un concept de **Spatial UI** avec :
- Un dock latéral gauche (navigation)
- Une barre de statut en haut
- Un fond animé (AnimatedBackground)
- Des cartes "Bento" pour les contenus
- Un design system tokenisé via `design-system.ts`

### Modèle de Données (Prisma)
9 modèles interconnectés :

```
User ───┐
   ├── CatalogOffer      (Services plateforme)
   ├── UserService       (Services personnalisés)
   ├── Client ─── Quote ─── QuoteLine
   ├── ClientActivity    (Timeline)
   ├── Subscription      (Stripe)
   └── UserApiLimit      (Quotas)
```

**Snapshots** : Chaque Quote stocke des snapshots figés (company, client, bank) pour que le PDF reste intact même si les données source changent.

### Server Actions
Toutes les mutations sont des **Next.js Server Actions** (`"use server"`) avec un pattern `ActionResponse<T>` :
```typescript
type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

---

## 🔧 Installation & Configuration

### Prérequis
- Node.js 20+
- pnpm (recommandé)
- PostgreSQL (via Neon ou local)
- Compte Clerk, Stripe, Resend, UploadThing

### Installation

```bash
# Cloner le projet
git clone https://github.com/votre-compte/devis-express.git
cd devis-express/my-app

# Installer les dépendances
pnpm install

# Générer le client Prisma
pnpm postinstall

# Lancer les migrations
npx prisma migrate dev

# Démarrer le serveur de développement
pnpm dev
```

### Variables d'Environnement
Créez un fichier `.env` à la racine de `my-app/` :

```env
# === Base de données ===
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# === Authentification ===
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# === Stripe ===
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."

# === Email ===
RESEND_API_KEY="re_..."

# === Upload ===
UPLOADTHING_SECRET="sk_..."
UPLOADTHING_APP_ID="..."

# === URL ===
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🎯 Fonctionnalités V1

### ✅ Clients
- Liste paginée avec recherche plein texte 🔍
- Filtres intelligents (À relancer, Inactifs, Tous)
- Smart Tips : indicateurs contextuels (concentration CA, relance prioritaire, rétention)
- Vue détail : KPIs, historique devis, contact
- Sélection multiple + suppression groupée
- Copie email rapide
- Import CSV avec preview et validation
- Formulaire complet (Contact, Adresse, Légal, Notes/Tags)

### ✅ Devis
- Éditeur temps réel avec 3 panneaux (client, lignes, catalogue)
- Sidebar finance : TVA, remise, devise, synthèse TTC
- Sidebar légal : échéance, validité, référence
- Gestion des statuts (Brouillon → Envoyé → Accepté/Refusé → Payé)
- Snapshots company/client/banque (données figées)
- Calcul de marge brute (baseCost)

### ✅ PDF & Email
- Génération PDF via Puppeteer/Chromium
- Template A4 design Brutalist/Bento
- Coordonnées bancaires géo-spécifiques (USA/EUR/AFRI)
- Envoi email via Resend avec pièce jointe PDF
- Passage automatique du statut en SENT après envoi
- Log dans ClientActivity

### ✅ Catalogue
- Services personnels (UserService) et plateforme (CatalogOffer)
- Création, modification, suppression
- Import depuis le catalogue plateforme

### ✅ Dashboard
- KPIs : CA total, CA en attente, taux de conversion, devis actifs
- Top clients avec health score et vélocité de paiement
- Activité récente (5 derniers devis)
- Services suggérés

### ✅ Facturation
- Plans FREE (5 devis) et PRO (illimité)
- Checkout Stripe
- Portail client Stripe
- Quotas API

---

## 📚 Guide d'Utilisation

### Créer un devis
1. Cliquez sur **Nouveau Devis** dans la barre latérale ou la page devis
2. Sélectionnez un client (ou créez-en un)
3. Ajoutez des lignes de prestation (prix vente, coût de base)
4. Configurez TVA, remise, devise, échéance
5. Visualisez le rendu A4 en temps réel
6. Enregistrez (brouillon) ou envoyez par email

### Importer des clients (CSV)
1. Allez dans **Clients** → bouton **Importer**
2. Déposez un fichier CSV (format : nom, email, téléphone, adresse...)
3. Prévisualisez les données
4. Validez l'import (avec détection des doublons)

### Gérer l'abonnement
1. Allez dans **Facturation**
2. Consultez votre plan actuel, votre quota utilisé
3. Cliquez sur **Passer à PRO** pour souscrire via Stripe

---

## 🧪 Tests

```bash
# Lancer les tests unitaires
pnpm test

# Mode watch
pnpm test:watch
```

Les tests sont dans `actions/__test__/` (catalog, client, design, quote, user).

---

## 🌐 Déploiement

### Vercel (recommandé)
```bash
# Installer Vercel CLI
pnpm add -g vercel

# Déployer
vercel
```

La base de données Neon est automatiquement gérée via Prisma.
Assurez-vous d'avoir configuré toutes les variables d'environnement dans le dashboard Vercel.

---

## 🗺️ Feuille de route V1

Voir le fichier [`TODO_V1.md`](./TODO_V1.md) pour le suivi détaillé.

| Phase | Statut |
|-------|--------|
| Phase 0 — Hotfix Bloquants | ✅ Terminée |
| Phase 1 — Fondations & Sécurité | ✅ Terminée |
| Phase 2 — Moteur Devis | ✅ Terminée |
| Phase 3 — Vues & UX | ✅ Terminée |
| Phase 4 — Monétisation | ✅ Terminée |
| Phase 5 — Recette & Livraison | ✅ Terminée |

---

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Committez (`git commit -m 'Ajout feature'`)
4. Push (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

---

## 📝 Licence

MIT — Libre utilisation, modification et distribution.