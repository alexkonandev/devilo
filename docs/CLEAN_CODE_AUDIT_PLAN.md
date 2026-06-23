# Clean Code Audit — Plan d'Action

Date : 23/06/2026
Auteur : Audit automatique basé sur les principes de Clean Code (Robert C. Martin)

## Phase 1 — Éradication du Code Mort
- [x] `features/clients/components/client-detail-sidebar.tsx` → **Supprimé** (comment-only, lignes retirées : 2)
- [x] `features/clients/components/client-edit-form.tsx` → **Supprimé** (comment-only, lignes retirées : 3)
- [x] `features/clients/components/client-inspector.tsx` → **Supprimé** (comment-only, lignes retirées : 3)
- [ ] `features/clients/audit-template.tsx` → **Conservé** (utilisé par `app/api/clients/[id]/audit/route.ts`)

## Phase 2 — Imports Orphelins
- [x] `features/quotes/components/quotes-table.tsx` → Aucun changement (pas d'import `JSX`/`useCallback`)
- [x] `features/dashboard/components/welcome-banner.tsx` → Aucun changement (`TrendUpIcon` utilisé lignes 66, 73)
- [x] `components/shared/layout/section-card.tsx` → Aucun changement (`DS_MONO` utilisé ligne 73)

## Phase 3 — Code Commenté
- [x] `features/dashboard/dashboard-view.tsx` → Aucun changement (séparateurs esthétiques uniquement)
- [x] `features/dashboard/components/top-clients-card.tsx` → Aucun changement
- [x] `components/editor/studio-sidebar-left.tsx` → Aucun changement
- [x] `components/editor/studio-sidebar-right.tsx` → Aucun changement
- [x] `lib/design-system.ts` → Aucun changement
- [x] `lib/utils.ts` → Aucun changement

**Bilan Phases 1-3 :** 3 fichiers supprimés, 0 lignes de code commenté trouvées, 0 imports orphelins.

## Phase 4 — Noms Révélateurs ✅
- [x] `lib/utils.ts` → `data` → `classes` (paramètre de `cn()`)
- [x] `features/clients/components/client-completion-alert.tsx` → `item` → `alert`
- [x] `features/quotes/components/completion-alert.tsx` → `item` → `alert`
- [x] `components/spatial-dock.tsx` → `item` → `navItem`
- [x] `app/(dashboard)/dashboard/page.tsx` → `item` → `activity` / `client`
- [x] `features/dashboard/components/welcome-banner.tsx` → `item` → `kpi`
- [x] `features/dashboard/components/recent-actions-table.tsx` → `item` → `action`
- [x] `features/dashboard/components/draft-quotes-card.tsx` → `item` → `draft`

## Phase 5 — Responsabilité Unique ✅
- [x] `getClientsPaginated()` → **Objet params unique** (`GetClientsPaginatedParams`)
- [ ] `getDashboardMetrics()` → Non applicable (remplacé par `getAdvancedDashboardData`)
- [ ] `getQuotesPaginated()` → Non trouvé dans le codebase

## Phase 6 — Composants Monolithiques ✅
- [x] `spatial-clients-view.tsx` → **Extraction du hook** `use-clients.ts` + composant `DeleteClientDialog`
- [x] `spatial-quotes-view.tsx` → **Extraction du hook** `use-quotes-view.ts` + composant `QuotesEmptyState`
