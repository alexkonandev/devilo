# Analyse d'Alignement Design : Catalog vs Quotes

> **Date :** 04/06/2026
> **Source de vérité :** `spatial-quotes-view.tsx` et ses composants associés
> **Cible analysée :** `spatial-catalog-view.tsx`

---

## Résumé Exécutif

**Diagnostic :** Le design du Catalog n'est **PAS aligné** avec la source de vérité Quotes. Le layout semble provenir d'un **autre univers produit** — typiquement un **outil de product management / portfolio matrix** (Notion database, Linear, ProductPlan) plutôt que d'une application de gestion de documents.

**Niveau d'alignement estimé :** ~25%
**Priorité de refactoring :** CRITIQUE — le layout est structurellement incompatible

---

## 1. Analyse des Origines du Layout

### Quotes — Architecture "Business App" (Source de Vérité ✅)

Le layout de Quotes suit le pattern **standard d'une application métier / gestion documentaire :**

```
┌────────────────────────────────────────────────────────────┐
│  PageHeader (titre + description inline + barre d'actions)  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ SearchBar │ │ Filters  │ │ Export   │ │ + Nouveau    │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
├───────────────────────────┬────────────────────────────────┤
│  flex-[4]                 │  flex-[6]                      │
│  ┌─────────────────────┐  │  ┌──────────────────────────┐  │
│  │ QuotesTable         │  │  │ QuoteDetailSidebar       │  │
│  │ (scrollable, tri)   │  │  │ ├── SectionCard          │  │
│  │ + Pagination         │  │  │ ├── SectionCard          │  │
│  └─────────────────────┘  │  │ └── SectionCard          │  │
└───────────────────────────┴────────────────────────────────┘
```

**Inspiration probable :** applications SaaS de gestion (Stripe dashboard, Resend, Raycast) — **horizontal flow**, lecture de gauche à droite (liste → détail).

### Catalog — Architecture "Product Management Tool" ❌

Le layout du Catalog est celui d'un **outil de Product Portfolio Management** (Notion database view, ProductPlan, Airfocus, Linear board) :

```
┌────────────────────────────────────────────────────────────┐
│  Pas de PageHeader                                         │
│  Grid 12 colonnes CSS                                      │
├──────────┬───────────────────────────────┬─────────────────┤
│ col-span-2│ col-span-6 ou col-span-10     │ col-span-4      │
│ leftSlot  │ mainSlot                      │ detailSlot      │
│           │                               │                 │
│ Recherche │ ┌─────────────────────────┐   │ ┌───────────┐  │
│ (Bento)   │ │ Portfolio Matrix        │   │ │ Service   │  │
│           │ │   2×2 Grid (Stars,      │   │ │ Detail    │  │
│ Source    │ │   Diamonds, Cows, Dead) │   │ │ Sidebar   │  │
│ (tabs)    │ │                         │   │ │           │  │
│           │ │ ou ServiceList (si      │   │ │ Header    │  │
│ Catégo-   │ │   viewMode="LIST")      │   │ │ Editable  │  │
│ ries      │ └─────────────────────────┘   │ │ Quadrant  │  │
│           │                               │ │ Prices    │  │
│ KPIs      │                               │ │ Margin %  │  │
│ (mini)    │                               │ └───────────┘  │
└───────────┴───────────────────────────────┴─────────────────┘
```

**Inspiration probable :** outils de **product management / portfolio analysis** (ProductPlan, Notion databases, Linear kanban boards, Amplitude analytics, Miro).

### Pourquoi c'est un problème ?

| Caractéristique | Quotes (App Métier) | Catalog (Product Tool) | Problème |
|----------------|-------------------|----------------------|----------|
| **Header** | Barre titre + actions horizontale | Aucun — actions diluées dans leftSlot | L'utilisateur ne trouve pas les actions au même endroit |
| **Navigation** | Haut → Bas, Gauche → Droite | Gauche → Centre → Droite (3 colonnes) | Pattern mental différent |
| **Filtres** | `Popover` (Dropdown) dédié | Inline dans sidebar gauche | L'utilisateur cherche les filtres en haut |
| **Actions principales** | En haut à droite (Créer, Exporter) | En-haut du mainSlot | Désorientation |
| **Scroll** | Table scrollable indépendante | Tout le contenu scroll dans mainSlot | Pas de pagination, pas de stabilité |
| **Accent visuel** | Table de données | Matrice 2×2 colorée | Changement de paradigme visuel |

### Conclusion sur l'origine du layout

Le Catalog semble avoir été construit en s'inspirant d'un **dashboard de product management** (matrice BCG/portefeuille produit) plutôt que du design system de l'application. La grille 12 colonnes, la sidebar gauche en `DS_BENTO_CARD` empilées, et la matrice Portfolio sont des patterns qu'on retrouve typiquement dans :
- **Linear** (product management boards)
- **Notion** (database views avec sidebar filters)
- **ProductPlan / Aha!** (roadmapping tools)
- **Miro** (tableaux de stratégie)

Alors que Quotes s'inspire de :
- **Stripe** (dashboard admin)
- **Resend** (gestion d'envois)
- **Raycast / Linear** (mais dans leur mode "list/detail")

### Écarts identifiés
| Aspect | Quotes | Catalog | Impact |
|--------|--------|---------|--------|
| **Header** | `PageHeader` unifié | Aucun header, actions dans `actionsSlot` intégré à la grille | **CRITIQUE** — rupture d'expérience utilisateur entre les pages |
| **Disposition** | Flex 4/6 (table + détail) | Grid 12 colonnes (3 zones) | **MAJEUR** — incohérence de navigation |
| **Padding** | `px-6 pt-6` / `gap-6` | `px-4 py-3` / `gap-4` | **MINEUR** — mais perceptible |

---

## 2. Composants Réutilisables

### 2.1 PageHeader ❌ (Non utilisé dans Catalog)
- **Quotes** : Utilise `PageHeader` de `@/components/shared/layout/page-header` avec un `title`, `description` (stats inline) et `actions` (tous les boutons)
- **Catalog** : N'utilise PAS `PageHeader`. Les actions sont rendues via `actionsSlot` et la navigation se fait via `leftSlot` (colonne gauche)

**Recommandation :** Implémenter `PageHeader` dans Catalog pour la barre titre + actions (boutons Nouveau, toggle Matrix/List)

### 2.2 KpiBar ❌ (Pattern différent)
- **Quotes** : `KpiBar` -> grille de `KpiCard` (4 cartes : En attente, En cours, Encaissé, Taux conversion) avec icônes Phosphor, couleurs accent/normal
- **Catalog** : KPIs intégrés dans `leftSlot` (2 mini-cartes : Services count, Avg margin %) avec style `bg-slate-50` minimaliste

| Aspect | Quotes KpiCard | Catalog KPI |
|--------|---------------|-------------|
| Structure | `w-8 h-8 icon bg` + `label` + `value` | `text-center p-1.5 bg-slate-50` |
| Richess données | 4 indicateurs | 2 indicateurs |
| Utilisation tokens | `DS_LABEL`, `DS_MONO` | `DS_MONO`, `DS_MICRO` |
| Visuel | Cartes stand-alone avec accent | Mini-bloc dans sidebar |

### 2.3 SearchBar ⚠️ (Utilisé mais différemment)
- **Quotes** : Dans `PageHeader` actions, inline
- **Catalog** : Dans `leftSlot` bento card "Recherche"

Les deux utilisent le même composant `SearchBar` de `@/components/shared/ui/search-bar` — c'est un point positif.

### 2.4 FiltersDropdown ❌ (Non utilisé)
- **Quotes** : `FiltersDropdown` sophistiqué avec Popover, statut, période, montant, seuil, reset, copie lien
- **Catalog** : Filtres inline dans `leftSlot` (Source tabs "Mes services"/"Plateforme" + Catégories list)

### 2.5 BTN_PRIMARY / BTN_SECONDARY ❌ (Non utilisés dans Catalog)
- **Quotes** : Utilise `BTN_PRIMARY`, `BTN_SECONDARY`, `BTN_DANGER` de `@/components/shared/ui/constants` de façon systématique
- **Catalog** : Utilise `DS_BUTTON` directement (qui a un style légèrement différent) et des classes personnalisées

**Recommandation :** Harmoniser en faveur de `BTN_PRIMARY` / `BTN_SECONDARY`

---

## 3. Sidebar / Panneau de Détail

### Quotes — QuoteDetailSidebar ✅ (Pattern de référence)
```
┌────────────────────────────────┐
│ Header: "Consultation Devis"   │
│ ├── Éditer / Suppr. / Sauver   │
├────────────────────────────────┤
│ SectionCard "En-tête Devis"     │
│ ├── N° Devis, Date, Statut,    │
│ │   Montant TTC, TVA détail    │
│ ├── InfoRow (icon + label +    │
│ │   value/badge)               │
├────────────────────────────────┤
│ SectionCard "Lignes du Devis"   │
│ ├── Micro colonnes headers     │
│ ├── Line items (title, qty×PU, │
│ │   total) + Totaux (HT/TTC)   │
├────────────────────────────────┤
│ SectionCard "Infos Client"     │
│ ├── Nom, Email, Tél, Adresse,  │
│ │   Tags                       │
├────────────────────────────────┤
│ SectionCard "Timeline"         │
│ └── Événements chronologiques  │
└────────────────────────────────┘
```

### Catalog — ServiceDetailSidebar ❌
```
┌────────────────────────────────┐
│ Header: "Fiche Service"        │
│ ├── Éditer / Fermer            │
├────────────────────────────────┤
│ Titre + Catégorie badge        │
├────────────────────────────────┤
│ DS_BENTO_CARD "Quadrant Badge" │
├────────────────────────────────┤
│ DS_GAP_GRID:                   │
│ ├── DS_TEL_BLOCK "Prix unit."  │
│ ├── DS_TEL_BLOCK "Coût rev."   │
├────────────────────────────────┤
│ DS_BENTO_CARD "Marge nette"    │
│ ├── Progress bar               │
│ ├── Profit / unité             │
├────────────────────────────────┤
│ [si édition] Catégorie select  │
├────────────────────────────────┤
│ DS_GAP_ITEMS:                  │
│ └── Bouton Supprimer           │
└────────────────────────────────┘
```

### Différences clés
| Aspect | Quotes | Catalog |
|--------|--------|---------|
| **Section pattern** | `SectionCard` (header + content padding-5) | `DS_BENTO_CARD` directement (padding-6) |
| **InfoRow** | Composant avec icon wrapper w-7 h-7, label, value badge | Pas de composant InfoRow — inline |
| **Modales** | `AlertDialog` pour confirmation suppression | `confirm()` natif JS |
| **Données** | Timeline, tags, calculs TVA | Quadrant, margin progress bar, editable inline |
| **Édition** | Full inline editing avec save/cancel | Édition inline directe (auto-save via updateLocalService) |

---

## 4. Tokens Design System — Audit de Conformité

| Token | Quotes | Catalog |
|-------|--------|---------|
| **DS_TITLE** | `text-xl uppercase` ✅ | Non utilisé ❌ (`text-sm font-bold`) |
| **DS_H2** | Utilisé dans sections ✅ | Non utilisé ❌ |
| **DS_LABEL** | `text-[9px] uppercase` ✅✅ | `text-[9px] uppercase` ✅✅ |
| **DS_MONO** | `text-[11px]` ✅✅ | `text-[11px]` + `text-[10px]` custom ❌ |
| **DS_CARD** | Pour table rows ✅ | Pour service cards ✅ |
| **DS_BENTO_CARD** | Pour section containers ✅ | Pour quadrant + sidebar sections ✅ |
| **DS_BUTTON** | Non utilisé (préfère BTN_PRIMARY) ❌ | Utilisé pour "Nouveau" ✅ |
| **DS_SECTION_HEADER** | Non applicable | Utilisé ✅ |
| **DS_ICON_WRAPPER** | `w-7 h-7` pour InfoRow | `w-6 h-6` ✅ (différent) |
| **DS_BADGE_*** | Tous les badges standard | `DS_BADGE_ACTIVE` pour catégorie, customs pour quadrant |
| **DS_PROGRESS_*** | Non applicable | Utilisé ✅ |
| **DS_TEL_BLOCK** | Non utilisé | Utilisé pour blocs prix |
| **DS_GAP_GRID** | Non utilisé | `gap-4` ✅ |
| **DS_GAP_ITEMS** | Pour listes ✅ | Pour listes + services dans quadrants ✅ |

### Violations directes des tokens
1. **Catalog ligne 323** : `text-[11px] font-medium transition-all` au lieu de `DS_MONO` ou classe standard
2. **Catalog ligne 484** : `text-[9px] font-bold uppercase` pour toggle view — pas de token correspondant
3. **Catalog ligne 496** : `DS_BUTTON` avec icon `PlusIcon` — manque de cohérence avec les autres pages

---

## 5. Typographie et Hiérarchie

| Élément | Quotes | Catalog |
|---------|--------|---------|
| **Titre page** | `PageHeader` → `DS_TITLE` (`font-mono text-xl uppercase`) | Aucun titre de page |
| **Section title** | `SectionCard` header → `DS_LABEL text-[10px]` | `DS_MICRO text-slate-400 mb-1.5` |
| **Sous-titre** | `DS_LABEL text-[9px] pl-3 border-l` | `text-xs text-slate-500` |
| **Service/client name** | `text-[13px] font-semibold` | `text-xs font-semibold` (matrix), `text-sm font-semibold` (list) |
| **Prix** | `DS_MONO text-sm font-bold` | `DS_MONO text-sm font-bold` (identique) |

---

## 6. États et Feedback

### États Vides
| Type | Quotes | Catalog |
|------|--------|---------|
| **Aucune donnée** | `FileTextIcon + texte + suggestion` ✅ | Pas géré (quadrants vides = placeholder) ⚠️ |
| **Recherche vide** | `Emoji + message + reset button` ✅ | Non géré ❌ |
| **Filtre vide** | `CalendarBlank + message` ✅ | Non géré ❌ |
| **Sidebar vide** | `EmptyState` avec `SelectionInverse icon + texte` ✅ | `Sélectionnez un service + icon wrapper` ✅ |

### Feedback Actions
| Action | Quotes | Catalog |
|--------|--------|---------|
| **Création** | Sheet modale + toast ✅ | Toast seulement ✅ |
| **Suppression** | `AlertDialog` avec confirmation ✅ | `confirm()` natif JS (pas de dialog custom) ⚠️ |
| **Erreur** | `notify.error()` avec code ✅ | `toast.error()` ✅ |
| **Loading** | Spinners, disabled states ✅ | `isPending` (useTransition) ⚠️ |

---

## 7. Fonctionnalités Manquantes dans Catalog

| Fonctionnalité | Quotes | Catalog | Priorité |
|----------------|--------|---------|----------|
| **Pagination** | `TablePagination` + `PAGE_SIZE` | Pas de pagination | MOYENNE |
| **Export** | `ExportActions` (CSV, PDF, print) | Pas d'export | BASSE |
| **Sélection multiple** | Checkbox + batch mode | Pas de sélection multiple | BASSE |
| **Timeline / Historique** | Section avec événements | Pas de timeline | BASSE |
| **Filtres avancés** | `FiltersDropdown` (statut, date, montant, seuil) | Filtres basiques (catégorie uniquement) | MOYENNE |
| **Copie de lien filtré** | Oui | Non | TRÈS BASSE |
| **Édition complète inline** | Save/cancel pattern avec back-end | Auto-save local uniquement | MOYENNE |

---

## 8. Recommandations Prioritaires

### Priorité Critique 🔴
1. **Intégrer `PageHeader`** — remplacer le `leftSlot`/`actionsSlot` dispersé par un vrai `PageHeader` en haut de la page, avec titre, description et actions
2. **Uniformiser les boutons** — remplacer `DS_BUTTON` par `BTN_PRIMARY` / `BTN_SECONDARY`

### Priorité Haute 🟠
3. **Restructurer le layout** — passer du système Grid 12 colonnes à un layout Flex similaire à Quotes (ou standardiser le pattern de grille)
4. **Implémenter `SectionCard`** pour la sidebar de détail au lieu de `DS_BENTO_CARD` brut
5. **Ajouter `DS_TITLE` ou `DS_H2`** pour les titres de sections et remplacer les `text-[13px]` custom

### Priorité Moyenne 🟡
6. **Ajouter la pagination** pour la vue liste
7. **Utiliser `AlertDialog`** au lieu de `confirm()` natif pour la suppression
8. **Ajouter les états vides** (search empty, filter empty)

### Priorité Basse 🟢
9. **Ajouter `ExportActions`** dans le header
10. **Uniformiser tous les paddings** avec `DS_PAGE_PADDING`

---

## 9. Checklist de Conformité

- [ ] `PageHeader` présent et standardisé
- [ ] Boutons utilisant `BTN_PRIMARY` / `BTN_SECONDARY`
- [ ] Layout cohérent (flex ou grid standard)
- [ ] `DS_TITLE`, `DS_H2`, `DS_LABEL`, `DS_MONO` respectés
- [ ] `SectionCard` utilisé pour les sidebars
- [ ] États vides gérés (no data, no search results, no filters)
- [ ] `AlertDialog` pour les confirmations destructives
- [ ] Badges utilisant `DS_BADGE_*`
- [ ] KPIs utilisant `KpiBar` ou pattern standardisé
- [ ] Pagination présente
- [ ] `FiltersDropdown` unifié ou pattern cohérent
- [ ] Taille des icônes via `DS_ICON_SM` / `DS_ICON_XS`

---

## Annexe : Extrait de Code Quotes — Pattern à Répliquer

```tsx
// Quotes — SpatialQuotesView (ligne 127-193)
<div className="flex flex-col h-full w-full bg-slate-50">
  <div className="shrink-0 px-6 pt-6">
    <PageHeader
      title="Devis"
      description={...}
      actions={
        <>
          <SearchBar ... />
          <FiltersDropdown />
          <ExportActions />
          <button className={BTN_PRIMARY}>Nouveau devis</button>
        </>
      }
    />
  </div>
  <div className="flex w-full flex-1 min-h-0 px-6 pb-6 pt-4 overflow-hidden gap-6">
    <div className="flex-[4] min-w-0 flex flex-col">
      <QuotesTable />
      <TablePagination />
    </div>
    <aside className="flex-[6] flex flex-col min-h-0 overflow-hidden">
      <QuoteDetailSidebar />
    </aside>
  </div>
</div>
```

```tsx
// Quotes — SectionCard (quote-detail-sidebar.tsx ligne 98-123)
function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-100 bg-slate-50/50">
        <span className="text-slate-400 shrink-0">{icon}</span>
        <span className={cn(DS_LABEL, "text-[10px] text-slate-500 uppercase tracking-wider")}>
          {title}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
```

---

## Conclusion

Le Catalog a été développé avec une architecture indépendante et des patterns custom qui divergent significativement de la source de vérité Quotes. Les écarts les plus impactants concernent :

1. **L'absence de `PageHeader`** (structure fondamentale de la page)
2. **L'utilisation de boutons non standardisés**
3. **L'implémentation de sections de détail sans le pattern `SectionCard`**
4. **L'absence de gestion des états vides**

Un refactoring ciblé sur ces 4 points permettrait d'atteindre ~80% d'alignement.