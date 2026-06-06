# Roadmap Refonte Design — Page Catalogue

**Date** : 05/06/2026  
**Problème** : La page Catalogue est conçue comme un outil de "Product Portfolio Management" (matrice BCG, métriques artificielles) alors qu'elle devrait être un **catalogue de services B2B** — un outil de consultation, sélection et configuration rapide.

**Design System** : Swift-Bento (`my-app/lib/design-system.ts`)  
**Référence** : `spatial-quotes-view.tsx` (Quotes) — pattern "Business App" réussi

---

## 🔴 Phase 1 — Fondations : Nettoyage et Stabilisation ✅

*Phase 1 terminée le 05/06/2026*

### 1.1 — ✅ Déjà fait : Extraction des composants du monolithe
- `PortfolioMatrix` → extrait dans `components/portfolio-matrix.tsx` **(SUPPRIMÉ)**
- `ServiceList` → extrait dans `components/service-list.tsx` **(CONSERVÉ, adapté)**
- `ServiceDetailSidebar` → extrait dans `components/service-detail-sidebar.tsx` **(CONSERVÉ, adapté)**
- `FilterSidebar` → extrait dans `components/filter-sidebar.tsx` **(À REMPLACER en Phase 3)**
- `spatial-catalog-view.tsx` → réécrit comme orchestreur pur **(ADAPTÉ)**

### 1.2 — ✅ Supprimé : Matrice BCG et dépendances mortes
- **Supprimé** `components/portfolio-matrix.tsx` ✓
- **Supprimé** `components/portfolio-matrix-constants.ts` ✓
- **Types supprimés** : `QuadrantType`, `QuadrantConfig`, `ServiceMetrics` ✓
- **Imports nettoyés** dans tous les fichiers ✓
- `format-utils.ts` : `formatCurrency` supprimé, seul `formatCompact` conservé ✓

### 1.3 — ✅ Conservé et adapté
- `ServiceList` → conservé comme vue liste, types locaux `ServiceCatalogItem` ✓
- `ServiceDetailSidebar` → conservé, types locaux `ServiceDetailItem`, quadrant retiré ✓
- `formatCompact` → conservé dans `format-utils.ts` ✓
- Les états vides → conservés dans l'orchestrateur ✓
- La pagination → consolidée (plus de toggle MATRIX/LIST) ✓
- `spatial-catalog-view.tsx` → simplifié (plus de calcul de quadrant, plus de viewMode) ✓

### 1.4 — 📁 Structure actuelle
```
features/catalog/
├── components/
│   ├── constants.ts              ← PAGE_SIZE, CATEGORIES, VIEW_MODES, SOURCE_TABS
│   ├── types.ts                  ← Types simples (CategoryFilter uniquement) ✓
│   ├── catalog-context.tsx       ← Inchangé (context provider)
│   ├── service-list.tsx          ← Vue liste alternative (adapté, types locaux)
│   ├── service-detail-sidebar.tsx ← Panneau détail (adapté, sans quadrant)
│   ├── filter-sidebar.tsx        ← À remplacer par FiltersDropdown (Phase 3)
│   └── format-utils.ts           ← formatCompact uniquement
└── spatial-catalog-view.tsx      ← Orchestrateur (adapté, simplifié)
```

---

## 🟠 Phase 2 — Nouvelle Architecture Visuelle (2h)

*Refonte complète du layout et du système de cartes*

### 2.1 — Nouveau layout général
```
┌────────────────────────────────────────────────────────────────┐
│ ═══ PageHeader ═══════════════════════════════════════════════ │
│ Catalogue                                                     │
│ 24 services · Prix moy. 45 000 XOF · Total 1 080 000 XOF     │
│ [🔍 Rechercher…] [Filtres ▼] [＋ Nouveau service]            │
├────────────────────────────────────────────────────────────────┤
│ ┌─ Source Tabs (inline, sans sidebar) ──────────────────────┐ │
│ │ ● Mes services (24)            ○ Plateforme (12)         │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
│ ┌─── Zone principale ─────────────────── [Détail] ───────────┐│
│ │ ┌──────┐ ┌──────┐ ┌──────┐             ┌────────────────┐││
│ │ │ Carte │ │ Carte │ │ Carte │            │ ServiceDetail  │││
│ │ │       │ │       │ │       │            │ Sidebar        │││
│ │ │ Prix  │ │ Prix  │ │ Prix  │            │                │││
│ │ │ Marge │ │ Marge │ │ Marge │            │ SectionCard   │││
│ │ └──────┘ └──────┘ └──────┘             │ SectionCard   │││
│ │ ┌──────┐ ┌──────┐                       │ SectionCard   │││
│ │ │ Carte │ │ Carte │                      └────────────────┘││
│ │ └──────┘ └──────┘                                          ││
│ └────────────────────────────────────────────────────────────┘│
│ [← Page 1/3 →]                                                │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 — ServiceCard (Nouveau composant)
**Fichier** : `components/service-card.tsx`

Design d'une carte moderne, dense, lisible :

```tsx
interface ServiceCardProps {
  service: CatalogService;
  margin: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onInject: (service: CatalogService) => void;
}
```

**Apparence** :
```
┌─────────────────────────────────┐
│ [Badge catégorie]  [⋮ menu]     │
│                                 │
│ Nom du service                  │ ← DS_MONO truncate
│ Description optionnelle         │ ← DS_LABEL truncate
│                                 │
│ ─────────────────────────────── │
│                                 │
│ Prix   45 000 XOF     Marge 32% │ ← Chiffres clés
│                              ██░│ ← Barre de marge colorée
│                                 │
│ [↗ Injecter dans un devis]     │ ← CTA principal
└─────────────────────────────────┘
```

**Règles de design** :
- `p-4` (padding 1rem, plus dense que le BentoCard standard)
- Catégorie en badge `DS_BADGE_*` coloré selon type
- Barre de marge : verte si >50%, ambre si 20-50%, rose si <20%
- Bordure indigo si sélectionné
- Hover : `border-slate-300` subtil
- Menu contextuel (⋮) avec "Éditer", "Dupliquer", "Supprimer"
- Le CTA "Injecter" n'apparaît que si un devis est ouvert (via `useKernelStore`)

### 2.3 — ServiceGrid (Nouveau composant)
**Fichier** : `components/service-grid.tsx`

- Grille responsive : `grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3`
- Scrollable : `overflow-y-auto`
- Empty state intégré si `services.length === 0`
- Prend les services déjà filtrés + paginés

### 2.4 — Source Tabs inline
**Plus de sidebar de 192px** qui mange l'espace. Les tabs "Mes services / Plateforme" deviennent inline :

```tsx
<div className="flex items-center gap-2 mb-4">
  <button className={cn(activeTab === "INVENTORY" ? "bg-slate-900 text-white" : "bg-white text-slate-500 border border-slate-200", "px-3 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wide")}>
    <CubeIcon size={12} weight="fill" /> Mes services {userServices.length}
  </button>
  <button ...>
    Plateforme {platformServices.length}
  </button>
</div>
```

### 2.5 — KPIs réels dans le header
Remplacer `kpiSlot` : pas de marge moyenne (peu pertinente), mais :
- **Nombre de services** : `{filteredServices.length} services`
- **Prix moyen** : `Moy. {formatCurrency(averagePrice)}`
- **Total catalogue** : `Total {formatCurrency(totalPrice)}` (si tab inventaire)

Couleurs : text-slate-500 pour le nombre, text-indigo-600 pour le total.

---

## 🟡 Phase 3 — FiltersDropdown et Actions (1h30)

*Un filtrage moderne comme Quotes, pas une sidebar*

### 3.1 — FiltersDropdown (Nouveau composant)
**Fichier** : `components/filters-dropdown.tsx`

Pattern exact de `features/quotes/components/filters-dropdown.tsx` :
- Utilise `Popover`, `Command` de `@/components/ui/`
- Badge `hasActiveFilters` (indigo) si filtre actif
- Options : "Toutes catégories", "Général", "Technique", "Conseil", "Abonnement"
- Icône `FunnelSimple` + texte "Catégorie : {label}" quand actif

### 3.2 — Actions manquantes
- **Bouton "Injecter dans un devis"** : Disponible dans chaque carte + dans le header si service sélectionné
- **Export CSV** : Via `ExportActions` de Quotes (ou version simplifiée inline)
- **Sélection multiple** : Optionnel (MVP : sélection simple)

### 3.3 — Menu contextuel sur les cartes
Dropdown trois points (⋮) avec :
- "Éditer" → ouvre le panneau détail en mode édition
- "Dupliquer" → crée une copie du service
- "Supprimer" → AlertDialog de confirmation

---

## 🟢 Phase 4 — Finalisation et Polissage (1h)

### 4.1 — ServiceDetailSidebar : Améliorations
- Ajouter un bouton "Injecter dans un devis" dans les actions
- Rendre le quadrant obsolète (BDG) → remplacer par "Rentabilité" (barre colorée)
- Uniformiser les icônes 14px, w-7 h-7 (pattern Quotes)

### 4.2 — Animations et transitions
- `motion.div` avec `initial={{ opacity: 0, y: 10 }}` sur les cartes (stagger 0.03s)
- Transition de vue (grille ↔ liste) : fade
- Pagination : pas d'animation (performant)
- Filtres : pas d'animation (reactif)

### 4.3 — Tests et Validation
- `pnpm run test` ✅
- `npx tsc --noEmit` ✅
- Vérifier manuellement :
  - Layout responsive (2 col → 3 col → 4 col)
  - Filtres : popover fonctionnel, badge actif
  - États vides : 3 cas (aucun service, recherche, filtre)
  - Pagination : navigation, reset sur filtre
  - Notifications : `notify.success/error` avec code
  - Injection devis : fonctionne uniquement si devis ouvert

### 4.4 — Nettoyage final
- Supprimer `portfolio-matrix.tsx`, `portfolio-matrix-constants.ts` ✅
- Supprimer les imports `motion`/`AnimatePresence` si non utilisés
- Vérifier qu'aucune référence à `QuadrantType` ne subsiste ✅
- Mettre à jour les tests si besoin

---

## Résumé de l'Effort

| Phase | Durée | Priorité | Impact | Statut |
|-------|-------|----------|--------|--------|
| 1 — Nettoyage | 1h | 🔴 Critique | Fondations | ✅ Terminé |
| 2 — Nouveau Layout | 2h | 🟠 Haute | Élevé | ❌ À faire |
| 3 — Filtres & Actions | 1h30 | 🟡 Haute | Moyen | ❌ À faire |
| 4 — Finalisation | 1h | 🟢 Moyenne | Faible | ❌ À faire |
| **Total** | **~5h30** | | | |

## État d'Avancement Actuel

- [x] **Phase 1.1** — Extraction des composants du monolithe ✅
- [x] **Phase 1.2** — Suppression matrice BCG et dépendances mortes ✅
- [x] **Phase 1.3** — Conservation et adaptation des composants existants ✅
- [x] **Phase 1.4** — Structure fichiers cible ✅
- [ ] **Phase 2.1** — Nouveau layout général
- [ ] **Phase 2.2** — ServiceCard (nouveau composant)
- [ ] **Phase 2.3** — ServiceGrid (nouveau composant)
- [ ] **Phase 2.4** — Source Tabs inline
- [ ] **Phase 2.5** — KPIs réels dans le header
- [ ] **Phase 3.1** — FiltersDropdown
- [ ] **Phase 3.2** — Actions manquantes (inject, export)
- [ ] **Phase 3.3** — Menu contextuel cartes
- [ ] **Phase 4.1** — ServiceDetailSidebar améliorations
- [ ] **Phase 4.2** — Animations
- [ ] **Phase 4.3** — Tests et validation
- [ ] **Phase 4.4** — Nettoyage final

## Dépendances

| Phase | Dépend de | Débloque |
|-------|-----------|----------|
| 1 | Rien | Phases 2-4 |
| 2 | Phase 1 (nettoyage terminé) ✅ | Phases 3-4 |
| 3 | Phase 2 (layout stable) | Phase 4 |
| 4 | Phases 1-3 | Rien |