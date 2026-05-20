# Plan Technique — Refonte complète de `spatial-clients-view.tsx`

## 1. Architecture de Gestion d'État (State Management)

### États Locaux (React `useState`)
| Variable | Type | Rôle |
|---|---|---|
| `viewMode` | `"list" \| "detail"` | Bascule entre Vue Liste (Dashboarding) et Vue Détail d'un client |
| `selectedClientId` | `string \| null` | Client actuellement visualisé en mode détail |
| `clients` | `ClientListItem[]` | Cache local des clients paginés |
| `page`, `limit`, `total`, `totalPages` | `number` | Pagination côté client |
| `searchQuery` | `string` | Filtre textuel (recherche par nom) |
| `healthFilter` | `"all" \| "good" \| "warning" \| "bad"` | Filtre par score de santé |
| `isLoading` | `boolean` | Spinner pendant les fetchs |
| `selectedIds` | `Set<string>` | Sélection multi-lignes pour bulk delete |

### Récupération des données
- **Client-side fetching** via `useEffect` + appels à `getClientsPaginated(page, limit, searchQuery)` de `@/actions/client-action`
- Pas de Server Components ici car la page est interactive (filtres, selection, modals)
- Re-fetch automatique au changement de `page`, `limit`, `searchQuery`

### Logique de filtrage
- **Recherche textuelle** : déléguée à l'action `getClientsPaginated` (query param côté API)
- **Filtre par santé** : post-filtrage côté client via `useMemo` sur `clients` avec `healthScore()` (émeraude ≥80, indigo ≥50, ambre ≥30, rose <30)

---

## 2. Structure de la Grille (Swift-Bento Layout)

### Phase 1 — Header (col-span-12)
```
┌──────────────────────────────────────────────────────┐
│ [Titre CLIENTS]  [Bouton NOUVEAU CLIENT]  │  [Search] [Importer] │
└──────────────────────────────────────────────────────┘
```
- Conteneur : `DS_BENTO_CARD` avec padding minimal `p-3`
- Token titre : `DS_TITLE`
- Token input : `DS_INPUT`
- Token action primaire : `DS_BUTTON`
- Token action secondaire : `DS_BUTTON_SECONDARY`
- Icône loupe : `MagnifyingGlassIcon` avec `DS_ICON_SM`
- Largeur max de la search : `max-w-xs`

### Phase 2 — Dashboarding (col-span-3 + col-span-9)
```
┌─────────────┬─────────────────────────────────────────┐
│ col-span-3  │           col-span-9                    │
│ RELANCES    │ ┌──────────────────────────────────┐    │
│ DS_BENTO    │ │ HEADER interne "CLIENTS" +       │    │
│ _CARD       │ │ mini-avatars récents superposés  │    │
│             │ ├──────────────────────────────────┤    │
│ [Item 1] ●  │ │ TABLE                            │    │
│ [Item 2] 2  │ │ [ ] #  Client    │  CA │ D | C │    │
│ [Item 3] ●  │ │ ──────────────────────────────── │    │
│ ...         │ │ hover:bg-slate-50 sur chaque tr  │    │
│             │ │ DS_LABEL headers, DS_MONO cells  │    │
│             │ └──────────────────────────────────┘    │
│             │ PAGINATION                              │
└─────────────┴─────────────────────────────────────────┘
```

**Tokens DS utilisés :**
- `DS_BENTO_CARD` pour chaque bloc
- `DS_LABEL` pour les titres de section ("RELANCES", "CLIENTS")
- `DS_MONO` pour tous les chiffres (compteur relances, CA, Devis, Conv.)
- `DS_TEL_BLOCK` pour chaque item de relance
- `DS_MICRO` pour les badges (ex: "2 brouillons")
- `DS_BADGE_DANGER` pour le badge "Aucun devis"
- `DS_ICON_WRAPPER` + icône `WarningCircle` pour le bloc Relances
- `DS_GAP_GRID` (gap-4) entre les colonnes

**Règle "Zero-Value"** : CA=0 → `—` (em-dash) en `text-slate-300`
**Règle "Santé"** : dot coloré `w-1.5 h-1.5 rounded-full` — `emerald-500` ≥80, `indigo-500` ≥50, `amber-500` ≥30, `rose-500` <30

**Colonnes de la table :**
| # | Checkbox | Santé | Client | CA (right) | Devis (right) | Conv. (right) | Actions |
|---|---|---|---|---|---|---|---|
| `w-5` | `w-5` | `w-1.5` | `flex-1` | `w-20` | `w-12` | `w-12` | `w-10` |

**Quick Actions par ligne :**
- Copie email (bouton icône `EnvelopeSimpleIcon`)
- Dropdown (icône `DotsThreeVertical`) : Éditer, Fiche client, Supprimer

### Phase 3 — Vue Détail (Overlay)
```
┌──────────────────────────────────────────────────────┐
│ fixed top-10 left-16 right-0 bottom-0 z-40 bg-white  │
│ <ClientInspector client={...} onBack= onEdit= />     │
└──────────────────────────────────────────────────────┘
```
- Overlay plein écran (sans la sidebar de navigation gauche `left-16`)
- Composant réutilisable : `ClientInspector` (déjà existant)
- Callbacks : `onBack` → retour à la liste, `onEdit` → ouvre `ClientEditForm`

---

## 3. Spécifications du Design System (DS Implementation)

| Élément | Token | Contexte |
|---|---|---|
| Fond de page | `DS_PAGE_SHELL` | `h-full overflow-y-auto bg-slate-50` |
| Padding grille | `DS_PAGE_PADDING` | `p-4` |
| Grille 12 colonnes | `DS_PAGE_GRID` | `grid grid-cols-12 gap-4` |
| Bloc Bento | `DS_BENTO_CARD` | `bg-white border border-slate-200 rounded-md p-6` |
| Bloc télémétrie | `DS_TEL_BLOCK` | `p-2 bg-slate-50/80 rounded-md border border-slate-100` |
| Titre page | `DS_TITLE` | `font-mono text-xl uppercase tracking-tight text-slate-900` |
| Label section | `DS_LABEL` | `font-mono text-[11px] uppercase tracking-wide text-slate-400` |
| Chiffres | `DS_MONO` | `font-mono text-[11px] tabular-nums leading-none` |
| Micro-typo | `DS_MICRO` | `font-mono text-[10px] uppercase tracking-tight text-slate-500` |
| Input | `DS_INPUT` | `bg-white border border-slate-200 px-3 py-2 font-mono text-sm` |
| Bouton primaire | `DS_BUTTON` | `flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-md` |
| Bouton secondaire | `DS_BUTTON_SECONDARY` | `flex ... bg-white text-slate-700 border border-slate-200` |
| Badge danger | `DS_BADGE_DANGER` | `px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200` |
| Wrapper icône | `DS_ICON_WRAPPER` | `w-6 h-6 rounded-md flex items-center justify-center` |
| Taille icône | `DS_ICON_SM` | `12` |
| Gaps grille | `DS_GAP_GRID` (constant) | `gap-4` |
| Conteneur max-width | `DS_PAGE_CONTAINER` | `max-w-6xl mx-auto` |

---

## 4. Logique Métier & Data Density

### Règle "Zero-Value"
```
if (revenue === 0) → afficher "\u2014" (em-dash) en text-slate-300
if (quotesCount === 0) → afficher "\u2014"
if (convRate === 0) → afficher "\u2014%"
```
Objectif : l'œil repère immédiatement les lignes avec des données positives.

### Colonne "Santé" (Health Score)
```ts
// Scoring basé sur le taux de conversion + volume CA
score = rev * 0.5 + conv * 50
couleurs : emerald ≥80 | indigo ≥50 | amber ≥30 | rose <30
```

### Colonne "Conversion"
```ts
if (quotesCount === 0) → convRate = 0 → afficher em-dash
if (convRate > 50) → text-emerald-600 (bonne conversion)
if (convRate <= 50) → text-slate-600 (neutre)
```

### Actions rapides par ligne
| Action | Déclencheur | Comportement |
|---|---|---|
| Copier email | Clic icône `EnvelopeSimpleIcon` | `navigator.clipboard.writeText(email)` + feedback visuel 1.2s |
| Éditer | Dropdown → "Éditer" | Ouvre `ClientEditForm` en modal |
| Fiche client | Dropdown → "Fiche client" | Navigation vers `/clients?id={id}` via `Link` |
| Supprimer | Dropdown → "Supprimer" | `confirm()` + `deleteClient(id)` + toast + refetch |
| Bulk delete | Barre actions en haut | `deleteManyClients(Array.from(selectedIds))` |

---

## 5. Workflow de Développement (5 Étapes)

### Étape 1 — Shell + Header (Phase 1)
- Réimporter tous les tokens DS nécessaires
- Restaurer le state management complet (useState, useMemo, useCallback, useEffect)
- Restaurer les utilitaires (formatCompact, healthScore, healthColor)
- Implémenter uniquement la Ligne 1 (Header avec titre + search + buttons)
- **Validation :** Header fonctionnel avec recherche qui filtre

### Étape 2 — Bloc Relances (Phase 2, col-span-3)
- Ajouter le bloc RELANCES dans `col-span-12 lg:col-span-3`
- `DS_BENTO_CARD` avec icône `WarningCircle`, titre `DS_LABEL`, compteur `DS_MONO`
- Items en `DS_TEL_BLOCK` avec pastille rouge `w-1.5 h-1.5` ou badge `DS_MICRO`
- Dériver `clientsSansDevis` via `useMemo`
- **Validation :** Bloc relances visible avec données dynamiques

### Étape 3 — Table (Phase 2, col-span-9)
- Ajouter la Table dans `col-span-12 lg:col-span-9`
- Header interne avec titre + mini-avatars récents superposés
- Tableau avec `DS_LABEL` pour `<thead>` et `DS_MONO` pour les cellules
- `hover:bg-slate-50` sur chaque `<tr>`
- Règle "Zero-Value" (em-dash)
- **Validation :** Table affichée avec données paginées, hover fonctionnel

### Étape 4 — Actions rapides + Pagination
- Bouton copie email avec feedback visuel
- Dropdown par ligne (Éditer, Fiche, Supprimer)
- Bulk delete bar (visible quand `selectedIds.size > 0`)
- Réintégrer `ClientPagination`
- **Validation :** Toutes les interactions fonctionnent (copie, edit modal, delete, pagination)

### Étape 5 — Vue Détail + Modals + Polish
- Overlay `ClientInspector` quand `viewingClient !== null`
- Modal `ClientEditForm` quand `isEditModalOpen`
- Modal `ImportCSVModal`
- `DS_PAGE_CONTAINER` sur le tout pour limiter l'étalement
- Vérifier que `DS_GAP_GRID` (gap-4) est respecté entre toutes les `DS_BENTO_CARD`
- **Validation :** Parcours complet : liste → clic client → détail → retour → édition → sauvegarde → refetch