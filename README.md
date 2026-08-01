# 📋 Factouro — Application de Devis Professionnelle

**Factouro** est un SaaS web professionnel de création, gestion et envoi de devis, conçu pour les freelances et les TPE/PME. L'application offre une interface moderne de type **Spatial UI**, un éditeur de devis temps réel, la génération de PDF A4 avec 15 templates, l'envoi par email, et la gestion complète des clients, du catalogue et de l'abonnement.

> 📚 **Documentation technique complète** : voir le [portail de documentation](./docs/README.md)

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
| **PDF** | Puppeteer / Playwright (Chromium via @sparticuz/chromium) |
| **UI** | Tailwind CSS 4, Radix UI, shadcn/ui, Framer Motion |
| **Icons** | Phosphor Icons, Lucide, Heroicons |
| **State Management** | Zustand (useKernelStore) |
| **Validation** | Zod |
| **Upload** | UploadThing |
| **Charts** | Recharts |
| **Tableaux** | TanStack Table |
| **Tests** | Vitest + Testing Library |

---

## 📁 Structure du Projet

```
my-app/
├── actions/                    # Server Actions Next.js
│   ├── billing-action.ts       # Abonnement Stripe, quotas
│   ├── client-action.ts        # CRUD clients (paginated, search)
│   ├── client-activity-action.ts # Timeline d'activités clients
│   ├── client-export-action.ts # Export CSV clients
│   ├── client-import-action.ts # Import CSV clients
│   ├── dashboard-actions.ts    # KPIs, analytics
│   ├── quote-editor-action.ts  # Sauvegarde devis
│   ├── quote-registry-action.ts # Registre des devis
│   ├── send-quote-email.ts     # Envoi email + PDF
│   ├── security-action.ts      # Sécurité, sessions, mot de passe
│   └── ... (19 fichiers au total)
│
├── app/
│   ├── (auth)/                 # Pages connexion/inscription
│   ├── (dashboard)/            # home, quotes, clients, billing, settings
│   ├── (editor)/               # Éditeur de devis (new, [id], export)
│   ├── (info)/                 # Pages légales (contact, privacy, terms)
│   ├── api/                    # print, pdf, webhooks, cron, uploadthing...
│   ├── generated/prisma/       # Client Prisma généré
│   └── onboarding/             # Onboarding nouveau user
│
├── components/
│   ├── editor/                 # Éditeur de devis (layout, sidebars, visualizer)
│   ├── landing/                # Landing page (hero, features, pricing, FAQ)
│   ├── pdf/                    # Rendus PDF (printable-quote)
│   ├── shared/                 # Composants partagés
│   ├── spatial-dock.tsx        # Dock de navigation
│   ├── spatial-status-bar.tsx  # Barre de statut
│   └── ui/                     # Composants shadcn/ui
│
├── features/                   # Vues métier (Spatial UI)
│   ├── clients/                # Répertoire clients
│   ├── quotes/                 # Liste des devis
│   ├── billing/                # Abonnement
│   ├── settings/               # Paramètres
│   ├── auth/                   # Formulaires
│   ├── dashboard/              # KPIs
│   ├── home/                   # Accueil
│   └── reminders/              # Rappels
│
├── hooks/
│   ├── use-kernel-store.ts     # Store Zustand global
│   └── use-debounce.ts         # Debounce
│
├── lib/
│   ├── auth.ts                 # Wrapper auth Clerk
│   ├── pdf-engine.ts           # Moteur PDF (serveur)
│   ├── print-template.ts       # Template HTML devis
│   ├── template-system.ts      # Définition des templates A4
│   ├── email.ts                # Envoi email (Resend)
│   ├── stripe.ts               # Client Stripe
│   ├── design-system.ts        # Tokens Design System
│   ├── validations/            # Schémas Zod (client, quote, settings)
│   └── templates/              # 15 templates HTML de devis
│
├── prisma/
│   ├── schema.prisma           # Modèle de données (10 modèles, 5 enums)
│   └── migrations/             # Migrations
│
├── types/                      # Types TypeScript (client, editor, dashboard...)
└── middleware.ts               # Clerk middleware (auth renforcée)
```

---

## 🧠 Architecture

### Spatial UI
L'interface utilise un concept de **Spatial UI** avec :
- Un dock latéral gauche de navigation (`spatial-dock.tsx`)
- Une barre de statut supérieure avec recherche ⌘K (`spatial-status-bar.tsx`)
- Des cartes "Bento" pour les contenus
- Un design system tokenisé via `design-system.ts`

### Modèle de Données (Prisma)
10 modèles interconnectés (voir `docs/BASE_DE_DONNEES.md`) :

```
User ───┐
   ├── CatalogOffer      (Services plateforme)
   ├── UserService       (Services personnalisés)
   ├── Client ─── Quote ─── QuoteLine
   ├── ClientActivity    (Timeline)
   ├── Subscription      (Stripe)
   ├── UserApiLimit      (Quotas)
   └── QuoteEvent        (Cycle de vie)
```

**Snapshots** : Chaque Quote stocke des snapshots figés (company, client) pour que le PDF reste intact même si les données source changent.

### Authentification (middleware)
Le middleware Clerk protège les routes, bloque les API non publiques, et redirige les utilisateurs connectés vers `/home` (voir `docs/AUTHENTIFICATION.md`).

### Server Actions
Toutes les mutations sont des **Next.js Server Actions** (`"use server"`) avec un pattern `ActionResponse<T>` (voir `docs/SERVER_ACTIONS.md`) :

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

## 🎯 Fonctionnalités

### ✅ Clients
- Liste paginée avec recherche plein texte 🔍
- Filtres intelligents (À relancer, Inactifs, Tous)
- Smart Tips : indicateurs contextuels (concentration CA, relance prioritaire, rétention)
- Vue détail : KPIs, historique devis, contact, timeline d'activités
- Sélection multiple + suppression groupée
- Import/Export CSV
- Formulaire complet (Contact, Adresse, Légal, Notes)

### ✅ Devis
- Éditeur temps réel avec 3 panneaux (client, lignes, catalogue)
- Sidebar finance : TVA, remise, devise, synthèse TTC
- Sidebar légal : échéance, validité, référence
- Gestion des statuts (Brouillon → Envoyé → Accepté/Refusé → Payé)
- Snapshots company/client (données figées)
- Calcul de marge brute (baseCost)
- Timeline d'événements (QuoteEvent)

### ✅ Templates & PDF
- **15 templates** A4 (2 gratuits : Minimal Invoice, Modern Obsidian — 13 premium)
- Visualisation A4 temps réel dans l'éditeur
- Génération PDF via Puppeteer/Chromium
- Pagination multi-pages (printable-quote)

### ✅ Email
- Envoi devis par email avec PDF en pièce jointe
- Passage automatique du statut en SENT après envoi
- Log dans ClientActivity

### ✅ Dashboard
- KPIs : CA total, CA en attente, taux de conversion, devis actifs
- Top clients avec health score et vélocité de paiement
- Activité récente, services suggérés

### ✅ Facturation
- Plans FREE (5 devis) et PRO (illimité)
- Checkout Stripe + portail client
- Quotas API (UserApiLimit)
- Webhooks Stripe (sync abonnement)

### ✅ Sécurité
- Gestion des sessions (révocation)
- Mots de passe robustes (zxcvbn-ts)
- Suppression sécurisée du compte

### ✅ Rappels
- Relances automatiques pour devis en attente
- Notifications dans la barre de statut

---

## 📚 Guide d'Utilisation

### Créer un devis
1. Cliquez sur **Nouveau Devis** (bouton dans le dock ou page devis)
2. Sélectionnez un client (ou créez-en un)
3. Ajoutez des lignes de prestation (prix vente, coût de base)
4. Configurez TVA, remise, devise, échéance, template
5. Visualisez le rendu A4 en temps réel
6. Enregistrez (brouillon), exportez en PDF ou envoyez par email

### Importer des clients (CSV)
1. Allez dans **Clients** → bouton **Importer**
2. Déposez un fichier CSV (nom, email, téléphone, adresse...)
3. Prévisualisez les données
4. Validez l'import (avec détection des doublons)

### Gérer l'abonnement
1. Allez dans **Facturation**
2. Consultez votre plan actuel et votre quota utilisé
3. Cliquez sur **Passer à PRO** pour souscrire via Stripe

---

## 🧪 Tests

```bash
# Lancer les tests unitaires
pnpm test

# Mode watch
pnpm test:watch
```

Les tests sont dans `actions/__test__/` et `features/` (clients, quotes).

---

## 🌐 Déploiement

### Vercel (recommandé)
```bash
# Installer Vercel CLI
pnpm add -g vercel

# Déployer
vercel
```

La base de données Neon est automatiquement gérée via Prisma. Configurez toutes les variables d'environnement dans le dashboard Vercel.

---

## 📚 Documentation

Le portail de documentation complet se trouve dans [`docs/`](./docs/README.md) :

| Document | Contenu |
|----------|---------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Vue d'ensemble, stack, structure |
| [BASE_DE_DONNEES.md](./docs/BASE_DE_DONNEES.md) | Modèle de données |
| [AUTHENTIFICATION.md](./docs/AUTHENTIFICATION.md) | Auth & sécurité |
| [SERVER_ACTIONS.md](./docs/SERVER_ACTIONS.md) | Server Actions |
| [API_ROUTES.md](./docs/API_ROUTES.md) | Routes API |
| [COMPOSANTS_ET_FEATURES.md](./docs/COMPOSANTS_ET_FEATURES.md) | UI & features |
| [TEMPLATES_DEVIS.md](./docs/TEMPLATES_DEVIS.md) | Templates & PDF |

---

## 🗺️ Feuille de route

Voir les fichiers TODO du projet (`TODO_V1.md`, `TODO_MASTER_QUOTES.md`, etc.) pour le suivi détaillé.

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