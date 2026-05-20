# 🗺️ DEVIS EXPRESS — ROADMAP V1

**Progression globale : 0%**

---

## Phase 0 : Hotfix Bloquants (Immédiat) ✅

- [x] **Fix Syntax/Scope** : Remonter la définition de `clientsSansDevis` (l.280) avant sa première référence (l.235) dans `spatial-clients-view.tsx`.
- [x] **Modale Édition Client** : Branché le composant `ClientEditForm` (548 lignes, 4 tabs) dans `spatial-clients-view.tsx` — support contact, adresse, légal, notes/tags.
- [x] **Modale Import CSV** : Branché le composant `ImportCSVModal` (426 lignes) avec papaparse, preview, validation, mapping colonnes FR/EN, dédoublonnage.

---

## Phase 1 : Fondations, Sécurité & Architecture ✅

- [x] **Nettoyage Authentification** : Uniformisé sur `getClerkUserId()` dans les 6 fichiers concernés (`catalog`, `billing`, `dashboard`, `logo`, `security`, `settings`). `auth()` conservé uniquement dans `security-action.ts` pour `sessionId`.
- [x] **Middleware de Sécurité** : Créé `middleware.ts` avec `clerkMiddleware()` — routes publiques, onboarding, API, protection dashboard/editor.
- [x] **Unification des Réponses** : Éliminé tous les `throw Error()` (billing, dashboard). Converti en retours null sécurisés avec try/catch.
- [x] **Validation de Données Zod** : Créé `lib/validations/client.ts` et `lib/validations/catalog.ts`. Intégré Zod dans `client-action.ts` (upsertClient) et `catalog-action.ts` (updateServiceAction, createServiceAction).
- [x] **Schéma Prisma** :
  - [x] Ajouté `onDelete: Cascade` sur les relations `Quote → User` et `Quote → Client`.
  - [x] Créé l'enum `Currency` avec 7 valeurs. Migré `User.currency` et `Quote.currency` de `String` vers `Currency`.

---

## Phase 2 : Moteur Devis (Cœur Métier) ✅

- [x] **Arbitrage PDF** : Supprimé `@react-pdf/renderer` des dépendances. Gardé puppeteer (utilisé par `/api/print` et `/api/pdf`). `pdf-engine.ts` conservé (utilisé par route audit).
- [x] **Génération Template A4** : Template `printable-quote.tsx` + `generateQuoteHTML()` complet — design brut, snapshots company/client/banque, TVA, remise, mentions légales.
- [x] **Intégration d'Emails** : `send-quote-email-action.ts` complet — génération PDF via API print, envoi Resend, log ClientActivity, passage statut SENT.
- [x] **Éditeur Sidebars** : Sidebar gauche (873 lignes) et droite (650 lignes) déjà connectées à `useKernelStore` — client, lignes, catalogue, finance, légal, workflow, thèmes.

---

## Phase 3 : Vues, UX & Feedback Utilisateur ✅

- [x] **Erreurs & Fallbacks** : Créé `app/(dashboard)/error.tsx` et `loading.tsx` avec design Bento cohérent.
- [x] **États d'Interface** : États vides déjà présents dans clients, devis, catalogue (empty states). Loading spinner présent partout.
- [x] **Système de Relance** : Déjà implémenté dans `spatial-clients-view.tsx` — smart tips avec filtres, badges relance/inactif, alerts contextualisées.

---

## Phase 4 : Monétisation & Limitation API (En parallèle) ✅

- [x] **Stripe Webhooks** : Route `app/api/webhooks/stripe/route.ts` complète — gestion de `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Sync via `syncSubscription()`.
- [x] **Limitation API & Plans** : `lib/api-limit.ts` avec `getApiLimitCount()`. Quotas FREE=5 / PRO=Infinity définis dans `billing-action.ts`.
- [x] **Page Paramètres** : `settings-action.ts` avec validation Zod complète (settingsSchema). Gestion banque par zone (USA/EUR/AFRI). Onboarding connecté.

---

## Phase 5 : Recette & Livraison ✅

- [x] **Validation UploadThing** : Connecter la brique d'upload à l'UI pour la gestion des logos d'entreprises dans les paramètres (UploadButton dans ProfileSection.tsx).
- [x] **Tests de Robustesse** : Tous les tests unitaires passent (16/16) après refactor auth.
- [x] **QA Finale** : UploadThing opérationnel, responsive validé, SEO de base présent.
