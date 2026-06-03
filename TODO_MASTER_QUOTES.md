# 📋 TODO MASTER — PAGE QUOTES : TOUT RÉGLER MAINTENANT

> Fichier unique regroupant l'ensemble des correctifs à appliquer sur la page Quotes
> avant d'étendre la refonte aux autres pages.
> Rien n'est remis à plus tard — on règle tout.

---

## PHASE 1 — FONDATIONS & SÉCURITÉ 🔴
> Objectif : sécuriser le backend, nettoyer les incohérences critiques, centraliser les helpers.
> Effort estimé : ~4h

### 1.1 — Validation Zod sur toutes les server actions
- [ ] **Créer `lib/validations/quote.ts`** avec les schémas Zod :
  - `upsertQuoteSchema` : titre, client (nom, email, adresse), items (title, quantity, unitPrice), financials, etc.
  - `updateQuoteInlineSchema` : champs éditables (number, issueDate, vatRatePercent, client fields)
  - `updateQuoteStatusSchema` : id + status enum
  - `deleteQuoteSchema` : id (CUID valide)
- [ ] **Ajouter Zod dans `upsertQuoteAction`** (`quote-editor-action.ts`) avant la logique métier
- [ ] **Ajouter Zod dans `updateQuoteInlineAction`** (`quote-editor-action.ts`)
- [ ] **Ajouter Zod dans `updateQuoteStatusAction`** (`quote-registry-action.ts`)
- [ ] **Ajouter Zod dans `deleteQuoteAction`** (`quote-registry-action.ts`)
- [ ] **Retourner les erreurs Zod** dans `ActionResponse.error` avec les détails

### 1.2 — Index Prisma pour les performances
- [ ] **Ajouter sur le modèle `Quote`** dans `prisma/schema.prisma` :
  ```prisma
  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@index([userId, status])
  ```
- [ ] **Exécuter** `pnpm prisma migrate dev --name add_quote_indexes`

### 1.3 — Centraliser les helpers métier
- [ ] **Vérifier que `computeTotalHT(q: QuoteRegistryItem): number`** existe dans `lib/utils.ts`
- [ ] **Remplacer les implémentations locales** par `computeTotalHT(q)` dans :
  - `spatial-quotes-view.tsx` : lignes 84-87, 154
  - `quote-detail-sidebar.tsx` : lignes 236-238, 695-699
  - `quotes-table.tsx` : ligne 159
  - `quote-context.tsx` : lignes 58, 139
  - `export-actions.tsx` : lignes 52, 92
- [ ] **Supprimer les `reduce`** et imports inutilisés après refactor
- [ ] **Vérifier que `formatPrice` et `formatDate`** sont bien dans `lib/utils.ts` et utilisés partout

### 1.4 — Supprimer les actions dupliquées
- [ ] **Dans `quote-editor-action.ts`**, supprimer `deleteQuoteAction` (déjà dans `quote-registry-action.ts`)
- [ ] **Vérifier les imports** dans `quote-detail-sidebar.tsx` — rediriger vers `quote-registry-action.ts`
- [ ] **Supprimer `updateQuoteStatusAction`** de `quote-editor-action.ts` si présent
- [ ] **Nettoyer les `revalidatePath` redondants** — garder uniquement ceux nécessaires côté serveur, utiliser `router.refresh()` côté client

### 1.5 — Supprimer le dead code
- [ ] **Supprimer** `features/quotes/components/QuoteCard.tsx`
- [ ] **Supprimer** `features/quotes/components/send-email-modal.tsx` (remplacé par `email-send-form.tsx`)
- [ ] **Vérifier qu'aucun import** ne référence ces fichiers dans le projet
- [ ] **Vérifier les imports inutilisés** avec `pnpm lint`

---

## PHASE 2 — UNIFICATION DESIGN SYSTEM 🔴🟠
> Objectif : un seul système de tokens, plus de doublons, cohérence visuelle complète.
> Effort estimé : ~3h

### 2.1 — Uniformiser les tokens boutons
- [ ] **Dans `quote-creation-sheet.tsx`** :
  - Remplacer `DS_BUTTON` (l.238) par `BTN_PRIMARY`
  - Remplacer `DS_BUTTON_SECONDARY` (l.227) par `BTN_SECONDARY`
  - Remplacer `DS_SECTION_TITLE` (l.143) par `DS_LABEL`
- [ ] **Supprimer de `lib/design-system.ts`** les tokens orphelins :
  - `DS_BUTTON`, `DS_BUTTON_SECONDARY`
  - `DS_SECTION_TITLE`
  - `DS_INPUT` (si inutilisé ailleurs dans le projet)
  - `DS_GAP_SECTIONS` (si inutilisé ailleurs)
- [ ] **Vérifier** qu'aucun autre composant n'importe ces tokens supprimés

### 2.2 — Styliser les inputs bruts du FiltersDropdown
- [ ] **Inputs date** (customStartDate, customEndDate) : classes `DS_MONO`, `rounded-md`, `border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400`
- [ ] **Inputs montant** (amountMin, amountMax) : même traitement
- [ ] **Input seuil** (highlightThreshold) : même traitement
- [ ] **Utiliser `cn()`** avec classes conditionnelles pour l'état focus

### 2.3 — Corriger le badge ACCEPTED
- [ ] **Ajouter `DS_BADGE_ACCEPTED`** dans `lib/design-system.ts` :
  ```typescript
  export const DS_BADGE_ACCEPTED = "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200";
  ```
- [ ] **Dans `quote-detail-sidebar.tsx`** l.68 : remplacer `DS_BADGE_ACTIVE ?? DS_BADGE_NEUTRAL` par `DS_BADGE_ACCEPTED`
- [ ] **Dans `quotes-table.tsx`** l.23 : remplacer `ACCEPTED: DS_BADGE_SUCCESS` par `ACCEPTED: DS_BADGE_ACCEPTED`
- [ ] **Ajouter `STATUS_BADGE["ACCEPTED"]`** dans les badges du tableau si manquant

### 2.4 — Améliorer les états vides
- [ ] **Créer un état vide "recherche sans résultat"** :
  - Icône différent (🔍 magnifying glass)
  - Message : `"Aucun devis ne correspond à votre recherche"`
  - Suggestion : `"Essayez de modifier vos filtres ou votre recherche"`
  - Bouton : `"Réinitialiser les filtres"`
- [ ] **Créer un état vide "filtres sans résultat"** :
  - Message : `"Aucun devis dans cette période"`
  - Bouton : `"Réinitialiser les filtres"`
- [ ] **Garder l'état vide générique** uniquement quand `quotes.length === 0` (pas de devis du tout)
- [ ] **Distinguer les 3 cas** dans `SpatialQuotesView` via une condition

### 2.5 — QA Design System
- [ ] **`pnpm build`** — doit passer sans erreur
- [ ] **`pnpm lint`** — doit passer sans erreur
- [ ] **Vérifier visuellement** que les alignements sont respectés (tableau ↔ sidebar)
- [ ] **Vérifier les couleurs des statuts** cohérentes entre tableau et sidebar

---

## PHASE 3 — LOGIQUE MÉTIER & DATA FLOW 🟠
> Objectif : timeline persistée, filtres dans l'URL, smart search internationalisé, statut CANCELLED.
> Effort estimé : ~5h

### 3.1 — Persister la timeline en base de données
- [ ] **Ajouter le modèle `QuoteEvent`** dans `prisma/schema.prisma` :
  ```prisma
  model QuoteEvent {
    id        String      @id @default(cuid())
    quoteId   String
    quote     Quote       @relation(fields: [quoteId], references: [id])
    type      String      // created | sent | viewed | status_changed | reminder | note
    status    QuoteStatus?
    metadata  Json?
    createdAt DateTime    @default(now())
    createdBy String?

    @@index([quoteId])
    @@index([createdAt])
  }
  ```
- [ ] **Exécuter** `pnpm prisma migrate dev --name add_quote_event`
- [ ] **Créer `actions/quote-event-action.ts`** :
  - `logQuoteEventAction(quoteId, type, metadata)` → insert en base
  - `getQuoteEventsAction(quoteId, limit?)` → requête ordonnée par createdAt DESC
- [ ] **Logger automatiquement** :
  - Création de devis : `logQuoteEventAction(quote.id, "created")`
  - Changement de statut : `logQuoteEventAction(quote.id, "status_changed", { from: oldStatus, to: newStatus })`
  - Envoi email : `logQuoteEventAction(quote.id, "sent", { email, subject, quoteNumber })`
- [ ] **Modifier `getQuoteTimelineAction`** pour lire depuis `QuoteEvent` au lieu de la timeline synthétique
- [ ] **Supprimer la timeline synthétique** basée sur `createdAt`/`updatedAt`
- [ ] **Afficher les vrais événements** dans `QuoteDetailSidebar` au lieu des 3 activités client

### 3.2 — Unifier la logique de filtres (split actuel en 2 endroits)
- [ ] **Déplacer les filtres date et montant** de `spatial-quotes-view.tsx` vers `quote-context.tsx` :
  - `dateRange`, `customStartDate`, `customEndDate`
  - `amountMin`, `amountMax`
  - `highlightThreshold`
- [ ] **Ajouter un `useMemo` global `filteredQuotes`** qui combine TOUS les filtres :
  - statut × texte × smart search × date × montant
- [ ] **Supprimer `applyLocalFilters`** de `spatial-quotes-view.tsx`
- [ ] **Supprimer les états locaux** de `SpatialQuotesView` (dateRange, amountMin/Max, etc.)
- [ ] **Nettoyer les props** passées à `FiltersDropdown` — tout vient du context maintenant

### 3.3 — Persister les filtres dans l'URL
- [ ] **Utiliser `useSearchParams`** de Next.js pour synchroniser les filtres avec l'URL :
  - `?status=SENT&dateRange=30d&amountMin=1000&amountMax=&q=client`
- [ ] **Initialiser les filtres** depuis `searchParams` au chargement
- [ ] **Mettre à jour l'URL** à chaque changement de filtre (sans rechargement avec `router.push` + `shallow`)
- [ ] **Ajouter un bouton** "Copier le lien filtré" dans le dropdown des filtres

### 3.4 — Internationaliser le smart search
- [ ] **Extraire les mots-clés** dans une constante :
  ```typescript
  const SEARCH_KEYWORDS = {
    lastMonth: ["dernier mois", "last month", "le mois dernier", "this month"],
    lastWeek: ["dernière semaine", "last week", "cette semaine", "this week"],
  };
  ```
- [ ] **Détection insensible à la casse** pour toutes les expressions
- [ ] **Ajouter le support anglais** complet
- [ ] **Ajouter les expressions génériques** : "ce mois", "cette semaine"

### 3.5 — Ajouter le statut CANCELLED (Annulé)
- [ ] **Vérifier si `CANCELLED`** existe dans l'enum Prisma `QuoteStatus` — sinon l'ajouter
- [ ] **Exécuter** `pnpm prisma migrate dev --name add_cancelled_status`
- [ ] **Ajouter aux tabs** : `{ label: "Annulé", value: "CANCELLED" }`
- [ ] **Ajouter au badge** : `CANCELLED: DS_BADGE_DANGER` (avec style grisé)
- [ ] **Ajouter au label** : `CANCELLED: "Annulé"`
- [ ] **Exclure "Annulé"** du calcul `pipeline` et `outstanding` dans les stats

### 3.6 — Rendre les boutons BatchMode fonctionnels
- [ ] **Handler "Envoyer sélection"** :
  - Récupérer les emails des clients des devis sélectionnés
  - Ouvrir `EmailSendForm` en mode batch
- [ ] **Handler "Supprimer sélection"** :
  - Ouvrir une `AlertDialog` de confirmation
  - Boucler sur `deleteQuoteAction` pour chaque ID sélectionné
  - Gérer les erreurs avec rollback et notification de progression

---

## PHASE 4 — DÉCOUPAGE & ARCHITECTURE 🟡
> Objectif : `SpatialQuotesView` < 150 lignes, composants atomiques.
> Effort estimé : ~3h

### 4.1 — Extraire les sous-composants de `SpatialQuotesView`
- [ ] **Créer `components/kpi-bar.tsx`** : refactorer les 3 `KpiCard` en composant dédié
- [ ] **Créer `components/filters-dropdown.tsx`** : déplacer `FiltersDropdown` (l.232-438)
- [ ] **Créer `components/table-pagination.tsx`** : déplacer `Pagination` (l.440-521)
- [ ] **Créer `components/status-tabs.tsx`** : déplacer `StatusTabs` (l.524-546)
- [ ] **Extraire `applyLocalFilters`, `applySort`, `paginate`** dans `lib/utils.ts` (si pas déjà fait)
- [ ] **Résultat** : `SpatialQuotesView` < 150 lignes (orchestration pure)

### 4.2 — Nettoyer les `useCallback` superflus
- [ ] **Simplifier** `handleDateRange`, `handleAmountMin`, `handleAmountMax`, `handleCustomStartDate`, `handleCustomEndDate`
- [ ] **Remplacer** par un seul `useCallback` générique ou supprimer car les setters sont déjà stables
- [ ] **Conserver uniquement** `handleSort`, `resetFilters`, `handleSearch`

### 4.3 — Vérifier les exports (par défaut vs nommé)
- [ ] **Dans `spatial-quotes-view.tsx`** : l.819 a `export default SpatialQuotesView`
- [ ] **Vérifier l'import** dans `app/(dashboard)/quotes/page.tsx` — cohérent avec l'export ?
- [ ] **Uniformiser** tous les exports du module Quotes (tout en nommé si possible)

---

## PHASE 5 — TESTS 🧪
> Objectif : couverture minimale des composants critiques et de la logique métier.
> Effort estimé : ~3h30

### 5.1 — Tests du quote-context
- [ ] **Créer** `features/quotes/__test__/quote-context.test.tsx`
- [ ] Tester le filtrage par statut
- [ ] Tester le filtrage par texte (client, numéro, lignes)
- [ ] Tester le smart filtering (`>5000`, `<10000`)
- [ ] Tester le calcul des stats (pipeline, outstanding, collected, conversionRate)
- [ ] Tester le quickStatusChange (optimistic update + rollback)
- [ ] Tester la multi-sélection (toggle, selectAll, clearSelection)
- [ ] Tester la sélection master-detail (selectQuote vide le Set)

### 5.2 — Tests des utils
- [ ] **Ajouter des tests dans** `lib/utils.test.ts` ou `actions/__test__/utils.test.ts`
- [ ] Tester `computeTotalHT` : somme des unitPrice × quantity
- [ ] Tester `formatPrice` : 15000 → "15 000 XOF"
- [ ] Tester `formatPriceCompact` : 15000 → "15k", 1500000 → "1.5M"
- [ ] Tester `formatDateShort` : 2024-01-15 → "15/01/24"
- [ ] Tester `formatDateLong` : 2024-01-15 → "15 janvier 2024"
- [ ] Tester `formatDateTime` : → "15 janvier 2024 à 14:30"
- [ ] Tester les cas limites : 0, null, undefined, très grandes valeurs

### 5.3 — Tests des server actions
- [ ] **Créer** `actions/__test__/quote-registry-action.test.ts`
- [ ] Tester `getQuotesAction` : format de retour, userId invalide
- [ ] Tester `updateQuoteStatusAction` : changement de statut, ID inexistant
- [ ] Tester `deleteQuoteAction` : suppression, déjà supprimé, userId inexistant
- [ ] Tester `getQuoteTimelineAction` : format de la timeline, quoteId invalide

### 5.4 — Tests des composants UI
- [ ] **Créer** `features/quotes/__test__/quotes-table.test.tsx`
- [ ] Tester le rendu : colonnes présentes, données affichées
- [ ] Tester le tri : clic sur en-tête → direction change
- [ ] Tester la sélection : clic → master-detail, Ctrl+clic → multi-sélection
- [ ] Tester l'état vide : data=[] → message "Aucun devis trouvé"
- [ ] Tester le highlight threshold : couleur conditionnelle appliquée
- [ ] **Créer** `features/quotes/__test__/export-actions.test.tsx`
- [ ] Tester l'export CSV : format du fichier généré
- [ ] Tester le compteur : s'affiche quand selectedIds non vide

### 5.5 — Tests de non-régression
- [ ] Tester que tous les composants s'affichent sans erreur console
- [ ] Tester les transitions `AnimatePresence` entre les modes empty/single/batch
- [ ] Tester la réactivité : redimensionnement de la fenêtre
- [ ] Tester l'accessibilité : tabulation, aria-labels sur les boutons d'action

---

## PHASE 6 — QA FINAL & NETTOYAGE ✅
> Objectif : build propre, doc à jour, fichiers superflus supprimés.
> Effort estimé : ~1h30

### 6.1 — Vérifications finales
- [ ] **`pnpm build`** passe sans erreur ni warning
- [ ] **`pnpm lint`** passe sans erreur
- [ ] **`pnpm test`** — tous les tests passent
- [ ] **Vérifier qu'aucun import n'est cassé** après les suppressions de code
- [ ] **Vérifier qu'aucun token mort** ne subsiste dans `lib/design-system.ts`
- [ ] **Vérifier que les types générés Prisma** sont à jour (`pnpm prisma generate`)

### 6.2 — Tests visuels et fonctionnels
- [ ] **Ouvrir la page Quotes** — vérifier qu'aucun padding ne "saute"
- [ ] **Tester l'édition inline sidebar** — modifier un champ, sauvegarder, vérifier
- [ ] **Tester l'export CSV** — exporter la vue filtrée, ouvrir le fichier
- [ ] **Tester l'export PDF** — exporter, vérifier le rendu
- [ ] **Tester BatchMode** — sélection multiple, envoyer, supprimer
- [ ] **Tester les transitions** — navigation entre les modes empty/single/batch
- [ ] **Tester la persistance des filtres** — recharger la page, les filtres sont-ils conservés ?

### 6.3 — Nettoyage des fichiers
- [ ] **Supprimer** `TODO_QUOTES_TABLE_FEATURES.md`
- [ ] **Supprimer** `TODO_SIDEBAR_INLINE_ACTIONS.md`
- [ ] **Supprimer** `TODO_UI_CONSISTENCY.md`
- [ ] **Garder uniquement** `TODO_MASTER_QUOTES.md` comme référence unique
- [ ] **Mettre à jour** `TODO_V1.md` si nécessaire

### 6.4 — Documenter le design system
- [ ] **Mettre à jour** `docs/DESIGN_SYSTEM.md` avec :
  - La grille typo standardisée (DS_TITLE, DS_H2, DS_BODY, DS_MONO, DS_LABEL)
  - La palette de badges (DS_BADGE_NEUTRAL, ACTIVE, SUCCESS, ACCEPTED, WARNING, DANGER)
  - Les tokens boutons (BTN_PRIMARY, BTN_SECONDARY, BTN_DANGER)
  - Le padding standard (px-5 pour conteneurs niveau 1)
  - Les arrondis standard (rounded-md pour cards, boutons, inputs)

---

## 📊 RÉCAPITULATIF

| Phase | Contenu | Tâches | Effort | Dépendances |
|-------|---------|--------|--------|-------------|
| **Phase 1** 🔴 | Fondations & Sécurité (Zod, index, helpers, dead code) | ~25 | ~4h | Aucune |
| **Phase 2** 🔴🟠 | Unification Design System (tokens, inputs, badges, QA) | ~18 | ~3h | Phase 1 |
| **Phase 3** 🟠 | Logique Métier (timeline, filtres, URL, i18n, batch) | ~22 | ~5h | Phase 1 |
| **Phase 4** 🟡 | Découpage Architecture (composants, useCallback, exports) | ~10 | ~3h | Phase 2+3 |
| **Phase 5** 🧪 | Tests (context, utils, actions, UI, régression) | ~28 | ~3h30 | Phase 1+2 |
| **Phase 6** ✅ | QA Final & Nettoyage (build, doc, fichiers) | ~12 | ~1h30 | Toutes |
| **TOTAL** | | **~115 tâches** | **~20h** | |

## ✅ CHECKLIST DE VALIDATION FINALE

Avant de déclarer la page Quotes "prête pour refonte", cocher tout ça :

- [ ] `pnpm build` passe sans erreur ni warning
- [ ] `pnpm lint` passe sans erreur
- [ ] Tous les tests passent (`pnpm test`)
- [ ] Zod valide toutes les server actions
- [ ] Les index Prisma sont créés et migrés
- [ ] Tous les tokens DS sont uniformes (plus de `DS_BUTTON` vs `BTN_PRIMARY`)
- [ ] Tous les helpers métier sont centralisés dans `lib/utils.ts`
- [ ] Les filtres sont tous dans `quote-context.tsx` (finie la duplication)
- [ ] `SpatialQuotesView` fait moins de 200 lignes
- [ ] Les sous-composants sont dans `features/quotes/components/`
- [ ] La timeline est persistée en base (table `QuoteEvent`)
- [ ] Le dead code est supprimé (`QuoteCard`, `send-email-modal`)
- [ ] Les actions batch (BatchMode) sont fonctionnelles
- [ ] Les états vides sont spécifiques et utiles
- [ ] Le badge ACCEPTED a son propre style (`DS_BADGE_ACCEPTED`)
- [ ] Le smart search est internationalisé (fr + en)
- [ ] Les filtres sont persistés dans l'URL
- [ ] Le statut CANCELLED est supporté
- [ ] `docs/DESIGN_SYSTEM.md` est à jour
- [ ] Tous les fichiers TODO *.md superflus sont supprimés