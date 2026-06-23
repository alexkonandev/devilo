# 📋 Todo Liste — Corrections `quotes/new`

## 🔴 PHASE 1 — CRITIQUE (6 bugs bloquants) ✅ FAITE

- [x] **#1 — Race condition TOCTOU sur le numéro de devis** (`quote-editor-action.ts:157-190`)
  - Remplacé par `$transaction` Prisma avec lecture atomique + `nextQuoteNumber` incrémenté dans la même transaction
  - La contrainte unique `@unique` sur `number` sert de filet de sécurité

- [x] **#2 — Spam de notifications sur le champ titre** (`studio-sidebar-left.tsx:439`)
  - `notify.success("TITRE MIS À JOUR")` supprimé du `onChange`

- [x] **#3 — Stale closure dans ConfirmDialog** (`studio-sidebar-left.tsx:310`)
  - Le state `confirmDialog` remplacé par des states individuels + `useRef` pour `onConfirm`
  - `onConfirmRef.current` toujours à jour au moment du click sur Confirmer

- [x] **#4 — Incohérence des schémas de validation** (`validations/quote.ts` vs `client.ts`)
  - `upsertQuoteSchema.client.address` rendu optionnel : `.optional().or(z.literal("")).or(z.null())`
  - Aligné avec `clientSchema`

- [x] **#5 — `client.email` dans Zod n'accepte pas `null`** (`validations/quote.ts:19`)
  - Ajout de `.or(z.null())` à la validation email
  - Ajouté aussi pour `client.address` et `client.taxId`

- [x] **#6 — `db.quote.update` sans garde `userId` directe** (`quote-editor-action.ts:128`)
  - `userId: authId` ajouté dans le `where` de l'update
  - Protection redondante avec la vérification `findUnique` préalable

## 🟡 PHASE 2 — MOYEN (4 bugs conditionnels) ✅ FAITE

- [x] **#7 — Race condition dans les effects sans AbortController** (`studio-sidebar-left.tsx:374-417`)
  - `AbortController` ajouté aux deux effects (`searchClients` et `getClientMetrics`/`getClientHistory`)
  - Tous les `setState` protégés par `if (!abortController.signal.aborted)`

- [x] **#8 — `window.confirm` bloquant dans le header** (`editor-header.tsx:70`)
  - Remplacé par le composant `ConfirmDialog` avec `useRef` pour éviter stale closure
  - `window.confirm()` supprimé

- [x] **#9 — Couverture de test insuffisante pour les chemins d'échec** (`quote-action.test.ts`)
  - 5 nouveaux tests ajoutés : titre vide, date invalide, client sans nom, items vides, update existant
  - Total : 7 tests (contre 2 avant)

- [x] **#10 — Mocks Prisma obsolètes dans les tests client** (`client-action.test.ts`)
  - Assertions corrigées pour ne vérifier que les champs réellement passés par l'action
  - 2 tests client qui échouaient passent maintenant

## 🟢 PHASE 3 — AMÉLIORATION (4 optimisations) ✅ FAITE (déjà couvert par Phase 1)

- [x] **#11 — Remplacer TOCTOU par `$transaction` Prisma** → fait dans le #1
- [x] **#12 — Nettoyer le `notify.success()` sur le onChange titre** → fait dans le #2
- [x] **#13 — Ajouter `.or(z.null())` et aligner les schémas Zod** → fait dans les #4 et #5
- [x] **#14 — Renforcer le typage dans `updateQuoteInlineAction`** → amélioration non bloquante, `Record<string, unknown>` conservé
