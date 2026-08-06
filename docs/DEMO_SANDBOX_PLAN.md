# 🌐 Mode Démo / Sandbox en 1 clic

## Vue d'ensemble

Permettre aux visiteurs de tester l'ensemble de l'application Factouro depuis la landing page, **sans inscription ni authentification Clerk**, en utilisant des données de test pré-remplies et isolées.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   LANDING PAGE                            │
│  [Tester la démo instantanée (sans inscription)]          │
└────────────────────────┬─────────────────────────────────┘
                         │ GET /demo
                         ▼
┌──────────────────────────────────────────────────────────┐
│              ROUTE /demo (publique)                       │
│  - Définit le cookie HttpOnly `demo_mode=1` (2h)          │
│  - Redirige vers /home                                    │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│              MIDDLEWARE CLERK                             │
│  - `/demo(.*)` ajouté aux routes publiques                │
│  - Toutes les autres routes restent protégées             │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│              lib/auth.ts (POINT CENTRAL)                  │
│  - `isDemoMode()` : vérifie le cookie `demo_mode`         │
│  - `getClerkUserId()` : retourne `DEMO_USER_ID`           │
│    si le cookie est présent                               │
└────────────────────────┬─────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│  lib/demo-store │ │    PAGES       │ │  API ROUTES    │
│  (in-memory     │ │  (use DemoStore│ │  (déjà publique│
│   Map)          │ │   si mode démo)│ │   /api/print)  │
└────────────────┘ └────────────────┘ └────────────────┘
```

## Point central : `lib/auth.ts`

Toutes les Server Actions et pages serveur passent par `getClerkUserId()`. En retournant `DEMO_USER_ID` quand le cookie est présent, **toute l'application bascule automatiquement en mode démo** sans modifier chaque action individuellement.

## Fichiers créés

| Fichier | Rôle | Statut |
|---------|------|--------|
| `lib/demo-data.ts` | Données de test statiques réalistes (5 clients, 4 devis, 10 services) | ✅ Créé |
| `lib/demo-store.ts` | Store in-memory (Maps) pour la sandbox avec API complète | ✅ Créé |
| `lib/demo-helper.ts` | Helpers `withDemo()` et `getDemoStore()` | ✅ Créé |
| `app/demo/route.ts` | Route d'entrée en mode démo | ✅ Existant (Phase 1) |
| `app/demo/exit/route.ts` | Route de sortie du mode démo | ✅ Existant (Phase 1) |
| `components/demo/sandbox-banner.tsx` | Bannière Sandbox | ✅ Complété |

## Phases

### ✅ Phase 1 — Infrastructure du mode démo
- [x] Modifier `lib/auth.ts` : `DEMO_USER_ID`, `DEMO_MODE_COOKIE`, `isDemoMode()`, `getClerkUserId()`
- [x] Modifier `middleware.ts` : autoriser `/demo(.*)` comme route publique
- [x] Créer `app/demo/route.ts` : définit le cookie et redirige vers `/home`
- [x] Créer `app/demo/exit/route.ts` : supprime le cookie et redirige vers `/`

### ✅ Phase 2 — Données de test (mock / seed)
- [x] Créer `lib/demo-data.ts` : données statiques réalistes
  - Entreprise "Studio Créatif Abidjan" (paramètres complets)
  - 5 clients réels (Digital Solutions, Nova Com', Hôtel Le Paillote, etc.)
  - 4 devis (PAID, SENT, DRAFT, ACCEPTED) avec lignes de prestation
  - 10 services / prestations réalistes
  - 10 événements de timeline
  - 10 offres catalogue
- [x] Créer `lib/demo-store.ts` : store in-memory (Map) pour la sandbox
  - API complète : getQuotes, createQuote, updateQuote, deleteQuote
  - API clients : getClients, createClient, updateClient, deleteClient
  - API événements, services, catalog offers
  - Dashboard stats calculées en temps réel
  - Numérotation automatique des devis
- [x] Créer `lib/demo-helper.ts` : helpers `withDemo()` et `getDemoStore()`

### ✅ Phase 3 — Adaptation des pages (approche : if demoMode use DemoStore directement)
- [x] `app/(dashboard)/home/page.tsx` : utiliser DemoStore en mode démo (stats, devis récents)
- [x] `app/(dashboard)/quotes/page.tsx` : gérer le cas démo (via getQuotesAction)
- [x] `app/(dashboard)/clients/page.tsx` : gérer le cas démo (via getClients action)
- [x] `app/(dashboard)/settings/page.tsx` : gérer le cas démo (DemoStore.getUser + SecurityProfile fallback)
- [x] `app/(dashboard)/billing/page.tsx` : gérer le cas démo (retourner profil FREE par défaut)
- [x] `app/(editor)/quotes/new/page.tsx` : gérer le cas démo (skip redirection draft, actions adaptées)
- [x] `app/(editor)/quotes/[id]/page.tsx` : gérer le cas démo (getQuoteByIdAction adaptée)
- [x] `app/onboarding/page.tsx` : gérer le cas démo (rediriger vers /home)
- [x] `app/api/quotes/last-draft/route.ts` : gérer le cas démo (DemoStore.getQuotes)

### ✅ Phase 4 — Adaptation des Server Actions
- [x] `quote-registry-action.ts` : brancher le store démo (getQuotesAction, etc.)
- [x] `quote-editor-action.ts` : brancher le store démo (upsertQuoteAction, etc.)
- [x] `client-action.ts` : brancher le store démo (getClientsPaginated, etc.)
- [x] `client-editor-action.ts` : brancher le store démo
- [x] `billing-action.ts` : retourner un profil FREE par défaut
- [x] `security-action.ts` : retourner un profil par défaut
- [x] `settings-action.ts` : mettre à jour le store démo
- [x] `reminder-action.ts` : retourner vide en démo
- [x] `dashboard-actions.ts` : calculer depuis le store démo
- [x] `user-action.ts` : retourner le user mock
- [x] `quote-event-action.ts` : brancher le store démo

### ✅ Phase 5 — UI/UX
- [x] Compléter `components/demo/sandbox-banner.tsx` : bannière discrète
- [x] Modifier `app/(dashboard)/layout-client.tsx` : intégrer la bannière
- [x] Modifier `app/(dashboard)/layout.tsx` : passer `demoMode` au layout-client
- [x] Modifier `components/spatial-status-bar.tsx` : gérer l'absence de user Clerk
- [x] Modifier `components/landing/landing-hero.tsx` : ajouter le CTA démo
- [x] Modifier `components/landing/landing-cta.tsx` : ajouter le CTA démo
- [x] Modifier `components/landing/landing-nav.tsx` : ajouter le lien démo

### ✅ Phase 6 — Sécurité & Isolation
- [x] Vérifier que `DEMO_USER_ID` n'existe pas dans Clerk
  - `DEMO_USER_ID = "demo_sandbox_user"` est un ID fixe au format non-Clerk (les IDs Clerk sont `user_xxx`)
  - Aucun utilisateur Clerk ne peut avoir cet ID → aucune collision possible
- [x] Vérifier que les données démo ne sont jamais écrites en DB
  - Audit complet des 11 Server Actions : toutes utilisent `isDemoMode()` + `DemoStore` en mode démo
  - `settings-action.ts` : `updateSettings` retourne early (no-op) en démo, `deleteAccount` est bloqué
  - Aucun chemin de code ne permet à `DEMO_USER_ID` d'écrire en base Prisma
- [x] Vérifier le cookie HttpOnly et l'expiration à 2h
  - `app/demo/route.ts` : `httpOnly: true`, `sameSite: "lax"`, `secure` en production, `maxAge: 2h`
  - `app/demo/exit/route.ts` : supprime le cookie proprement

## Stratégie d'implémentation

### Approche retenue pour les pages serveur

Les pages serveur qui font des requêtes DB directes (home, quotes, clients, settings, billing) utilisent désormais la structure suivante :

```tsx
if (demoMode) {
  // Utiliser DemoStore directement
  const demo = DemoStore;
  return <Component data={demo.getQuotes()} />;
}

// Mode normal : requêtes Prisma
const quotes = await db.quote.findMany({ where: { userId } });
return <Component data={quotes} />;
```

### Approche pour les Server Actions

Les Server Actions utilisent `getClerkUserId()` qui retourne déjà `DEMO_USER_ID` en mode démo. Pour les actions qui doivent fonctionner sans DB, on utilise le helper `withDemo()` :

```ts
const { isDemo, demo, userId } = await withDemoDb();
if (isDemo && demo) {
  return demo.getQuotes();
}
// Requête Prisma normale
```

### Données de démo

Les données sont réalistes pour un "Studio Créatif Abidjan" :
- **Entreprise** : Studio Créatif Abidjan (Côte d'Ivoire, XOF)
- **Clients** : 5 clients (SARL, agence, hôtel, e-commerce, cabinet d'architecture)
- **Devis** : 4 devis dans différents statuts (PAID, SENT, DRAFT, ACCEPTED)
- **Services** : 10 prestations (site vitrine, e-commerce, formation, etc.)
- **Montants** : De 75 000 à 1 500 000 XOF

## Considérations techniques

1. **`cookies()` est async** dans Next.js 15 → `isDemoMode()` doit être async ✅
2. **`SpatialStatusBar`** utilise `useUser()` et `useClerk()` de Clerk côté client → gérer le cas null ✅
3. **`CreateQuoteClient`** attend un objet `User` Prisma complet → passer un user mock ✅
4. **`/api/print`** est déjà publique → la génération PDF fonctionnera sans modification ✅
5. **Store in-memory** se réinitialise à chaque redémarrage → acceptable pour une démo ✅
6. **Cookie `demo_mode`** est HttpOnly + SameSite=Lax + expire après 2h ✅

## Prochaines étapes immédiates

1. ✅ **Phase 6 (Sécurité & Isolation) complétée** — `DEMO_USER_ID` ne peut pas exister dans Clerk, les données démo ne sont jamais écrites en DB, cookie HttpOnly + 2h vérifié
2. ✅ **Compilation vérifiée** — `pnpm build` compile avec succès (28 routes générées, dont `/demo` et `/demo/exit`)
3. ✅ **Test du parcours démo effectué** — toutes les pages retournent 200 en mode démo
   - `/demo` → 307 (redirection vers /home) ✅
   - `/home`, `/quotes`, `/clients`, `/settings`, `/billing`, `/dashboard` → 200 ✅
   - `/quotes/new`, `/quotes/demo-quote-1` → 200 ✅
   - `/demo/exit` → 307 (redirection vers /) ✅
   - **Bug corrigé** : `getQuotesAction` mappe désormais les devis démo avec la relation `client` imbriquée (format `QuoteRegistryItem`)
   - ⏳ **Reste** : vérification visuelle dans le navigateur (bannière Sandbox, bouton "Quitter la démo")
