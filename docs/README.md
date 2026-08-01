# 📚 Portail de Documentation — Factouro

Bienvenue sur la documentation complète de **Factouro**, le SaaS de création et gestion de devis pour freelances et TPE/PME.

---

## 📖 Navigation

| Fichier | Contenu |
|---------|---------|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | 🏗️ Vue d'ensemble, stack, structure du projet, conventions |
| [`BASE_DE_DONNEES.md`](./BASE_DE_DONNEES.md) | 🗄️ Modèle de données Prisma (10 modèles, 5 enums, ERD) |
| [`AUTHENTIFICATION.md`](./AUTHENTIFICATION.md) | 🔐 Middleware Clerk, routes, sécurité |
| [`SERVER_ACTIONS.md`](./SERVER_ACTIONS.md) | ⚙️ Toutes les Server Actions (19 fichiers) |
| [`API_ROUTES.md`](./API_ROUTES.md) | 🌐 Toutes les routes API |
| [`COMPOSANTS_ET_FEATURES.md`](./COMPOSANTS_ET_FEATURES.md) | 🎨 Composants, features, editor, landing, hooks, types |
| [`TEMPLATES_DEVIS.md`](./TEMPLATES_DEVIS.md) | 🖼️ Les 15 templates + pipeline PDF |
| [`DOCUMENTATION_PLAN.md`](./DOCUMENTATION_PLAN.md) | 🗂️ Plan & checklist de progression |

---

## 🚀 Stack Technique

| Catégorie | Technologie |
|-----------|-------------|
| **Framework** | Next.js 16 (App Router) |
| **Langage** | TypeScript 5 |
| **Base de données** | PostgreSQL (Neon) + Prisma 7 |
| **Authentification** | Clerk |
| **Paiement** | Stripe |
| **Email** | Resend |
| **PDF** | Puppeteer / Playwright |
| **UI** | Tailwind 4, Radix UI, shadcn/ui |
| **State** | Zustand |
| **Validation** | Zod |
| **Tests** | Vitest |

---

## 🏛️ Vue d'ensemble rapide

Factouro est une application full-stack Next.js 16 qui permet de :

- ✅ Créer des **devis professionnels** avec un éditeur temps réel (3 panneaux)
- ✅ Gérer les **clients** (CRUD, import/export CSV, timeline d'activités)
- ✅ Générer des **PDF** A4 avec 15 templates (2 gratuits, 13 premium)
- ✅ Envoyer les devis par **email** avec PDF en pièce jointe
- ✅ Suivre le **cycle de vie** (brouillon → envoyé → accepté/refusé → payé)
- ✅ Gérer l'**abonnement** (plans FREE/PRO/ENTERPRISE via Stripe)

---

## 📁 Structure clé

```
my-app/
├── actions/       # 19 Server Actions
├── app/           # App Router (auth, dashboard, editor, info, api)
├── components/    # UI (editor, landing, pdf, spatial, ui)
├── features/      # Vues métier (clients, quotes, billing, settings)
├── lib/           # Logique (auth, pdf, templates, validations)
├── prisma/        # Schema & migrations
├── types/         # Types TypeScript
└── middleware.ts  # Auth Clerk
```

---

## 🔗 Liens utiles

- **Application** : `my-app/`
- **README principal** : [`../README.md`](../README.md)
- **Docs existantes** : dossiers `docs/`, `features/*/` et `docs/` des plans (audits, roadmaps)
- **TODO** : `TODO_V1.md`, `TODO_MASTER_QUOTES.md`, `TODO_ALIGNEMENT.md`, `TODO_CLIENT_FEATURES.md`