# Roadmap d'Alignement Design — Page Catalog

**Objectif** : Restructurer la page Catalog pour l'aligner avec Quotes (source de vérité)  
**Design System** : Swift-Bento (`my-app/lib/design-system.ts`)  
**Document de référence** : `my-app/docs/DESIGN_ALIGNMENT_CATALOG_VS_QUOTES.md`  
**Diagnostic** : Layout issu d'un univers "Product Management Tool" (Linear/Notion), incompatible avec l'architecture "Business App" de Quotes

---

## Phase 1 — Quick Wins & Correctifs Tokens (1h) 🔵

*Correctifs immédiats, sans changement structurel, pour améliorer la conformité tokens*

### 1.1 — Remplacer `confirm()` natif JS par `AlertDialog`
- **Fichier** : `spatial-catalog-view.tsx` ligne 293
- **Action** : Importer et utiliser `AlertDialog` de `@/components/ui/alert-dialog` (déjà utilisé dans Quotes)
- **Code actuel** : `if (!confirm("Supprimer ce service ?")) return;`
- **Code cible** : Pattern identique à `QuoteDetailSidebar` (lignes 1085-1120) avec boutons "Annuler" / "Confirmer la suppression"
- **Import à ajouter** : `AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel`

### 1.2 — Remplacer `DS_BUTTON` par `BTN_PRIMARY` / `BTN_SECONDARY`
- **Fichier** : `spatial-catalog-view.tsx`
- **Ligne 495** : `<button onClick={handleAddNew} className={cn(DS_BUTTON)}>` → remplacer par `BTN_PRIMARY`
- **Lignes 746-748** : bouton "Importer" → remplacer par `BTN_SECONDARY + bg-amber-100`
- **Ligne 987** : bouton "Supprimer" → remplacer par `BTN_DANGER` (ou équivalent)
- **Note** : `BTN_PRIMARY` et `BTN_SECONDARY` sont déjà importés ligne 65 mais **jamais utilisés**

### 1.3 — Remplacer `toast.` par `notify.` pour les notifications
- **Fichiers** : `spatial-catalog-view.tsx` (lignes 277, 280, 287, 289, 297, 299)
- **Action** : Remplacer `toast.success(...)` par `notify.success("CODE", "message")` et `toast.error(...)` par `notify.error("CODE", "message")`
- **Import à changer** : supprimer `import { toast } from "sonner"`, ajouter `import { notify } from "@/lib/notifications"` (déjà utilisé dans catalog-context.tsx)

### 1.4 — Corriger les violations de tokens design system
- **Ligne 323** : `text-[11px] font-medium transition-all` → `DS_MONO`
- **Ligne 356** : idem
- **Ligne 404** : `text-[11px] font-medium transition-all border` → `DS_MONO`
- **Ligne 484** : `text-[9px] font-bold uppercase` → pas de token correspondant → garder mais documenter
- **Ligne 637** : `text-xs font-semibold text-slate-900 truncate` → `DS_MONO`
- **Ligne 648** : `text-xs font-bold text-slate-700` → `DS_MONO`

### 1.5 — Supprimer l'import inutilisé des icônes
- **Fichier** : `spatial-catalog-view.tsx` lignes 8-31
- **Icônes importées mais non utilisées** : `TrendUpIcon, TrendDownIcon, ChartPieIcon, ArrowRightIcon` (vérifier)
- **Action** : Nettoyer les imports morts

---

## Phase 2 — Restructuration du Layout Principal (2h) 🟠

*Refonte du layout pour passer d'une grille 12 colonnes "Product Tool" au pattern flex "Business App" de Quotes*

### 2.1 — Déplacer le `leftSlot` (sidebar filtres) dans un `PageHeader`
- **Objectif** : Remplacer l'architecture 3 colonnes (grid 12) par un header + 2 zones flex
- **Composants à déplacer** :
  - `SearchBar` → dans `PageHeader.actions`
  - `actionsSlot` (toggle Matrix/List + bouton Nouveau) → dans `PageHeader.actions`
  - Source tabs ("Mes services" / "Plateforme") → dans `PageHeader` ou barre de navigation secondaire
  - Filtres catégories → à intégrer dans le header ou garder en sidebar légère
  - KPIs (Services count, Avg margin %) → soit dans `PageHeader.description` soit supprimés (redondants avec la matrice)
- **Code cible** :
  ```tsx
  <div className="flex flex-col h-full w-full bg-slate-50">
    <div className="shrink-0 px-6 pt-6">
      <PageHeader
        title="Catalogue"
        description={
          <span className="inline-flex items-center gap-3">
            <span>{filteredServices.length} services</span>
          </span>
        }
        actions={
          <>
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher un service…" />
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded">
              <button onClick={() => setViewMode("MATRIX")} className={...}>Matrix</button>
              <button onClick={() => setViewMode("LIST")} className={...}>Liste</button>
            </div>
            <button onClick={handleAddNew} className={BTN_PRIMARY}>
              <PlusIcon size={12} weight="bold" /> Nouveau service
            </button>
          </>
        }
      />
    </div>
    <div className="flex w-full flex-1 min-h-0 px-6 pb-6 pt-4 overflow-hidden gap-6">
      {/* Sidebar filtres compacte (optionnelle) */}
      <aside className="w-48 shrink-0 flex flex-col gap-2 overflow-y-auto">
        {/* Source tabs */}
        {/* Catégories */}
      </aside>
      <div className="flex-[4] min-w-0 flex flex-col">
        {viewMode === "MATRIX" ? <PortfolioMatrix ... /> : <ServiceList ... />}
      </div>
      {activeService && (
        <aside className="flex-[6] flex flex-col min-h-0 overflow-hidden">
          <ServiceDetailSidebar ... />
        </aside>
      )}
    </div>
  </div>
  ```

### 2.2 — Standardiser les espacements et le fond
- `px-6 pt-6` pour le conteneur header (comme Quotes) au lieu de `px-4 py-3`
- `gap-6` entre les colonnes (comme Quotes)
- `bg-slate-50` sur la page entière
- `flex-[4]` pour la zone principale, `flex-[6]` pour le détail

### 2.3 — Gérer les états "filtres inactifs" quand la sidebar est cachée
- Si la sidebar filtres est réduite/optionnelle, proposer un bouton "Filtres" qui l'affiche
- Ou intégrer les catégories dans un `FiltersDropdown` similaire à Quotes

---

## Phase 3 — ServiceDetailSidebar : Migration vers `SectionCard` (1h30) 🟠

*Refonte du panneau de détail pour utiliser le pattern standardisé SectionCard + InfoRow*

### 3.1 — Créer / Importer `SectionCard` et `InfoRow`
- **Action** : Soit extraire `SectionCard` et `InfoRow` de `spatial-quotes-view.tsx` vers un composant partagé dans `@/components/shared/`, soit les dupliquer temporairement
- **Recommandation** : Les extraire dans `@/components/shared/layout/section-card.tsx` pour les rendre disponibles à toutes les pages

### 3.2 — Refondre `ServiceDetailSidebar`
- **Structure cible** :
  ```
  ┌─────────────────────────────────────────┐
  │ Header: "Fiche Service"                 │
  │ ├── Éditer / Sauver / Annuler / Fermer  │
  ├─────────────────────────────────────────┤
  │ SectionCard "Détails du Service"        │
  │ ├── InfoRow "Nom" → titre éditable     │
  │ ├── InfoRow "Catégorie" → badge        │
  │ ├── InfoRow "Quadrant" → badge coloré  │
  ├─────────────────────────────────────────┤
  │ SectionCard "Tarification"             │
  │ ├── InfoRow "Prix unitaire" → montant  │
  │ ├── InfoRow "Coût de revient" → montant│
  │ ├── InfoRow "Marge nette" → % + barre  │
  ├─────────────────────────────────────────┤
  │ SectionCard "Actions"                   │
  │ └── Bouton Supprimer (AlertDialog)      │
  └─────────────────────────────────────────┘
  ```
- **Modifications** :
  - Remplacer `DS_BENTO_CARD` + titres inline par `SectionCard`
  - Remplacer les blocs inline (prix, coût, marge) par `InfoRow`
  - Standardiser les icônes (14px, duotone, `w-7 h-7` comme Quotes)
  - Uniformiser les badges quadrant avec `DS_BADGE_*`
  - `p-5` au lieu de `p-6` (comme Quotes)

### 3.3 — Remplacer l'édition inline "auto-save" par le pattern "save/cancel"
- **Problème** : `updateLocalService` sauvegarde immédiatement sans confirmation
- **Solution** : Suivre le pattern Quotes → état `isEditing` → `editData` local → bouton "Sauver" + "Annuler"
- **Actions** :
  - Ajouter `editData: ServiceMetrics | null`
  - Sur "Sauver" : appeler `updateLocalService` puis fermer l'édition
  - Sur "Annuler" : restaurer les valeurs originales
  - Ajouter un spinner de sauvegarde

---

## Phase 4 — Refactor : Extraction des composants du monolithe (1h) 🟡

*Casser le fichier `spatial-catalog-view.tsx` (1198 lignes) en sous-composants extraits, comme Quotes*

**Problème** : Le fichier actuel est un monolithe avec PortfolioMatrix, ServiceList, ServiceDetailSidebar définis inline.  
**Solution** : Extraire chaque composant dans son propre fichier dans `features/catalog/components/`

### 4.0.1 — Extraire `PortfolioMatrix` → `components/portfolio-matrix.tsx`
- Inline actuellement (lignes 573-699)
- Props : `services`, `selectedId`, `onSelect`
- Dépend de : `ServiceMetrics`, `QuadrantType`, `QUADRANTS`
- Importer depuis `@/lib/design-system` (DS_BENTO_CARD, DS_MONO, DS_LABEL, DS_CARD, etc.)

### 4.0.2 — Extraire `ServiceList` → `components/service-list.tsx`
- Inline actuellement (lignes 708-801)
- Props : `services`, `selectedId`, `onSelect`, `onDelete`, `onImport`, `isMarketplace`
- Dépend de : `DS_CARD`, `DS_GAP_ITEMS`, `DS_MONO`, `DS_ICON_XS`, `BTN_SECONDARY`, `ArrowRightIcon`, `TrashIcon`, `formatCompact`

### 4.0.3 — Extraire `ServiceDetailSidebar` → `components/service-detail-sidebar.tsx`
- Inline actuellement (lignes 808-1091)
- Props : `service`, `onClose`, `onDelete`
- Dépend de : `useCatalog`, `SectionCard`, `InfoRow`, `DS_*` tokens, `BTN_DANGER`
- Garder toute la logique édition (isEditing, editData, save/cancel)

### 4.0.4 — Extraire `FilterSidebar` → `components/filter-sidebar.tsx`
- Inline actuellement (lignes 340-444)
- Props : `activeTab`, `setActiveTab`, `categoryFilter`, `setCategoryFilter`, `userServices.length`, `platformServices.length`
- Dépend de : `DS_BENTO_CARD`, `DS_MICRO`, `DS_MONO`, icônes CubeIcon, StorefrontIcon

### 4.0.5 — Réécrire `spatial-catalog-view.tsx` comme orchestreur pur (< 120 lignes)
```tsx
export function SpatialCatalogView() {
  // 1. Hooks (useCatalog, useState pour tabs/filters/view/page)
  // 2. useMemo pour servicesWithMetrics, filteredServices, activeService, paginatedServices
  // 3. États vides (isEmpty, isSearchEmpty, isFilterEmpty)
  // 4. Rendu : PageHeader + flex contenu
  return (
    <>
      <div className="flex flex-col h-full w-full bg-slate-50">
        <div className="shrink-0 px-6 pt-6">
          <PageHeader title="Catalogue" description={kpiSlot} actions={actionsSlot} />
        </div>
        <div className="flex w-full flex-1 min-h-0 px-6 pb-6 pt-4 overflow-hidden gap-6">
          <FilterSidebar ... />
          <div className="flex-[4] min-w-0 flex flex-col overflow-hidden">
            {isEmptyState ? <EmptyState /> : viewMode === "MATRIX" ? <PortfolioMatrix /> : <><ServiceList /><Pagination /></>}
          </div>
          {activeService && <ServiceDetailSidebar />}
        </div>
      </div>
      <AlertDialogSuppression />
    </>
  );
}
```

---

## Phase 4bis — États Vides (30min) 🟡

*Ajout des 3 états vides dans le nouvel orchestreur (après extraction)*

### 4.1 — État "Aucun service" (totalement vide)
- **Quand** : `userServices.length === 0 && activeTab === "INVENTORY"`
- **Visuel** : `PackageIcon` size={48}, message "Aucun service dans votre inventaire", sous-message, bouton "Créer un service" BTN_PRIMARY

### 4.2 — État "Recherche vide"
- **Quand** : `searchQuery && filteredServices.length === 0 && userServices.length > 0`
- **Visuel** : `MagnifyingGlassIcon` size={48}, message, bouton "Réinitialiser les filtres" BTN_SECONDARY

### 4.3 — État "Filtre vide"
- **Quand** : `categoryFilter !== "ALL" && filteredServices.length === 0 && !searchQuery`
- **Visuel** : `FunnelSimple` size={48}, message dynamique par catégorie, bouton "Voir tous les services"

---

## Phase 4ter — Pagination vue liste (30min) 🟡

*Pagination intégrée après extraction de ServiceList*

### 4.4 — Pagination pour la vue liste
- Pagination inline (ou via TablePagination adapté)
- `PAGE_SIZE = 20` depuis `constants.ts`
- Reset page 1 sur changement de filtre
- Masquée si `filteredServices.length <= PAGE_SIZE`

---

## Phase 5 — Fonctionnalités & Refactor Final (2h) 🟢

*Dernière couche : fonctionnalités manquantes, nettoyage et tests*

### 5.1 — Ajouter un `FiltersDropdown` pour les catégories
- **Ou** : Garder les filtres inline dans une sidebar compacte (optionnel)
- **Si dropdown** : Suivre le pattern `FiltersDropdown` de Quotes (Popover avec options)
- **Catégories** : GENERAL, TECHNIC, CONSULTING, SUBSCRIPTION

### 5.2 — Ajouter la source tabs dans le header
- Remplacer les boutons "Mes services" / "Plateforme" par des tabs dans le header
- Pattern : `<button className={activeTab === "INVENTORY" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}>` (comme `STATUS_TABS` dans Quotes)
- Afficher le compte : `userServices.length` / `platformServices.length`

### 5.3 — Nettoyer les fichiers et composants inutilisés
- Vérifier si `spatial-service-card.tsx` et `spatial-service-editor.tsx` sont utilisés (subagent signale leur existence)
- Si oui : les aligner aussi avec le design system
- Si non : les supprimer

### 5.4 — Ajouter un `ExportActions` basique
- **Optionnel** : Exporter la liste des services en CSV
- Pattern : suivre `ExportActions` de Quotes mais simplifié (uniquement CSV côté client)

### 5.5 — Créer un fichier `constants.ts`
- **Fichier** : `features/catalog/components/constants.ts`
- **Exporter** :
  - `PAGE_SIZE = 20`
  - `CATEGORIES` : liste des catégories avec labels et couleurs
  - `VIEW_MODES` : MATRIX / LIST
  - `SOURCE_TABS` : INVENTORY / MARKETPLACE

### 5.6 — Tests & Validation
- Vérifier que `pnpm run test` passe
- Vérifier que `npx tsc --noEmit` compile sans erreur
- Vérifier manuellement dans le navigateur :
  - Layout : PageHeader visible, espacements corrects
  - Sidebar détail : sections avec `SectionCard`, icônes standardisées
  - Suppression : `AlertDialog` avec confirmation
  - États vides : sans services, recherche sans résultat, filtre vide
  - Pagination : navigation entre les pages, reset sur filtre
  - Notifications : `notify.success/error` avec code

---

## Résumé de l'Effort

| Phase | Durée | Priorité | Impact |
|-------|-------|----------|--------|
| 1 — Quick Wins & Tokens | 1h | 🔵 Haute | Faible |
| 2 — Layout Principal | 2h | 🟠 Critique | Élevé |
| 3 — ServiceDetailSidebar | 1h30 | 🟠 Haute | Moyen |
| 4 — États Vides & Pagination | 1h30 | 🟡 Haute | Élevé |
| 5 — Fonctionnalités & Final | 2h | 🟢 Moyenne | Moyen |
| **Total** | **~8h** | | |

## Ordre d'Exécution Recommandé

```
Phase 1 (Quick Wins) — 1h
    ↓
Phase 2 (Layout) — 2h          ← Étape la plus impactante
    ↓
Phase 3 (DetailSidebar) — 1h30
    ↕
Phase 4 (États vides) — 1h30   ← Peut être fait en parallèle de Phase 3
    ↓
Phase 5 (Final) — 2h
```

## Dépendances entre Phases

| Phase | Dépend de | Débloque |
|-------|-----------|----------|
| 1 | Rien | Phase 2 (nettoyage préalable) |
| 2 | Phase 1 | Phase 3, 4, 5 |
| 3 | Phase 2 (layout stable) | Rien |
| 4 | Phase 2 (slot mainSlot défini) | Rien |
| 5 | Phase 1 (notifications), Phase 2, Phase 4 | Rien |

## Risques & Mitigations

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| La matrice Portfolio 2×2 ne tient pas dans un layout flex 4/6 | Élevée | La garder en vue alternative (toggle Matrix/List) mais dans le même conteneur flex |
| `SectionCard` n'existe pas encore en shared | Certaine | La créer dans `@/components/shared/layout/section-card.tsx` (bénéfice pour toutes les pages) |
| Régressions visuelles sur la matrice | Moyenne | Ajouter un mode "comparaison" temporaire : ancien layout / nouveau layout |
| Les filtres inline (catégories) perdent en accessibilité | Faible | Les garder dans une sidebar compacte optionnelle si retirés du header |