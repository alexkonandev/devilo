# Dashboard V2 — Plan de refonte

> **Objectif** : Améliorer l'expérience page d'accueil avec un message de bienvenue, densifier les cartes, corriger les incohérences DS, et découper le monolithe en composants atomiques.

---

## Phase 1 — Atomic Decomposition ✅
Découper `dashboard-view.tsx` en composants réutilisables dans `features/dashboard/components/`.

| Fichier | Responsabilité |
|---------|---------------|
| `components/welcome-banner.tsx` | Carte d'accueil avec prénom + KPIs denses (remplace PageHeader) |
| `components/activity-sparkline.tsx` | Carte graphique activité récente |
| `components/recent-actions-table.tsx` | Tableau dernières actions (badges DS + prix compact) |
| `components/draft-quotes-card.tsx` | Carte brouillons en cours |
| `components/top-clients-card.tsx` | Carte top clients densifiée (healthScore visible) |
| `components/status-badge.tsx` | StatusBadge mutualisé avec tokens DS_BADGE_* |

---

## Phase 2 — Welcome Banner (KPIs card personnalisée) ✅
- ✅ `firstName` récupéré via `currentUser()` dans `page.tsx`
- ✅ Carte d'accueil avec "Bonjour [prénom]" + sous-titre de bienvenue
- ✅ KPIs affichés en grille dense (4 cartes : CA, en attente, conversion, devis actifs)
- ✅ Plus de `PageHeader` — remplacé par une UI plus riche
- ✅ Build TypeScript : 0 erreurs

---

## Phase 3 — Densification Top Clients ✅
- ✅ `max-h-64` supprimé → pas de limite de hauteur artificielle
- ✅ `healthScore` affiché avec badge coloré (EXCELLENT→vert/emerald, GOOD→orange/amber, SLOW→rouge/rose)
- ✅ Deuxième ligne d'info structurée : [HEALTH_BADGE] · X devis · Yj paiement
- ✅ Build TypeScript : 0 erreurs

---

## Phase 4 — Finalisation & cleanup ✅
- ✅ `dashboard-view.tsx` réécrit en orchestrateur (97 lignes au lieu de 399)
- ✅ Imports inutilisés nettoyés
- ✅ Build TypeScript : 0 erreurs

---

## Résumé des changements

| Fichier | Avant | Après |
|---------|-------|-------|
| `features/dashboard/dashboard-view.tsx` | 399 lignes monolithe | 97 lignes orchestrateur |
| `features/dashboard/components/status-badge.tsx` | — | **Nouveau** — badges DS tokens |
| `features/dashboard/components/welcome-banner.tsx` | — | **Nouveau** — accueil + KPIs |
| `features/dashboard/components/activity-sparkline.tsx` | — | **Nouveau** — sparkline |
| `features/dashboard/components/recent-actions-table.tsx` | — | **Nouveau** — tableau + badges DS + prix compact |
| `features/dashboard/components/draft-quotes-card.tsx` | — | **Nouveau** — brouillons |
| `features/dashboard/components/top-clients-card.tsx` | — | **Nouveau** — top clients densifié + healthScore |
| `app/(dashboard)/dashboard/page.tsx` | `auth()` uniquement | `auth()` + `currentUser()` → firstName |
| `features/dashboard/DASHBOARD_V2_PLAN.md` | — | Ce document |

---

## Problèmes résolus

| Problème | Solution |
|----------|----------|
| Message de bienvenue absent | `currentUser().firstName` → "Bonjour Alexandre" |
| Top Clients trop peu dense (hauteur réduite) | `max-h-64` supprimé + healthScore + 2 lignes structurées |
| Badges non conformes DS | `StatusBadge` utilise `DS_BADGE_*` tokens (identique à Quotes) |
| Prix trop longs dans tableau | `formatPriceCompact()` → "37.2M" au lieu de "37 200 000" |
| Monolithe 399 lignes | 6 composants atomiques + 1 orchestrateur |