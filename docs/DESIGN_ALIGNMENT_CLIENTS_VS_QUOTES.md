# Analyse d'Alignement Design — Page Clients vs Page Quotes

**Date** : 04/06/2026  
**Source de vérité** : `my-app/features/quotes/spatial-quotes-view.tsx` & composants associés  
**Page analysée** : `my-app/features/clients/spatial-clients-view.tsx` & composants associés  
**Design System** : `my-app/lib/design-system.ts` (Swift-Bento)

---

## Résumé Exécutif

| Critère | Statut |
|---------|--------|
| ✅ Composants partagés alignés | `PageHeader`, `SearchBar`, `BTN_PRIMARY`, `BTN_SECONDARY` |
| ✅ Design System tokens utilisés | `DS_MONO`, `DS_LABEL`, `DS_MICRO` |
| ❌ Structure de layout divergente | Padding, conteneurs, overflow |
| ❌ Table vs Liste | Quotes = `<table>` HTML natif ; Clients = `<div>` grid-based |
| ❌ Badges de statut | Quotes = tokens `DS_BADGE_*` ; Clients = classes inline `BADGE_CLASSES` |
| ❌ KPIs / Métriques | Quotes = dans header ; Clients = dans le panneau détail (stat cards) |
| ❌ Filtres | Quotes = `FiltersDropdown` composant dédié ; Clients = filtres inline ad-hoc |
| ❌ Multi-sélection | Quotes = Ctrl+click ; Clients = checkboxes explicites |
| ❌ États vides | Quotes = 3 états riches ; Clients = aucun état vide (table) |
| ⚠️ Édition inline | Clients uniquement (via `EditableField`) |
| ⚠️ Suppression | Quotes = via context ; Clients = AlertDialog custom |
| ⚠️ Pagination | Quotes = `TablePagination` partagé ; Clients = `ClientPagination` propre |

---

## 1. Structure du Layout

### Quotes (Source de vérité)
```tsx
<div className="flex flex-col h-full w-full bg-slate-50">
  <div className="shrink-0 px-6 pt-6">              {/* Header */}
    <PageHeader ... />
  </div>
  <div className="flex w-full flex-1 min-h-0 px-6 pb-6 pt-4 overflow-hidden gap-6">
    <div className="flex-[4] min-w-0 flex flex-col">   {/* Table */}
      <QuotesTable ... />
    </div>
    <aside className="flex-[6] flex flex-col min-h-0 overflow-hidden"> {/* Detail */}
      <QuoteDetailSidebar />
    </aside>
  </div>
</div>
```

### Clients
```tsx
<div className="flex flex-col h-full py-6">            {/* ← py-6 au lieu de px-6 pt-6 */}
  <div className="flex-1 overflow-hidden bg-slate-50">
    <div className="flex flex-col gap-6 h-full">
      <div className="shrink-0 px-6">                   {/* ← pas de pt-6 */}
        <PageHeader ... />
      </div>
      <div className="flex-1 flex overflow-hidden px-6 gap-6">
        <div className="w-1/3 min-w-[350px] max-w-[500px] shrink-0 ..."> {/* ← largeur fixe */}
          <ClientTable ... />
        </div>
        <div className="flex-1 overflow-y-auto">          {/* ← pas d'aside */}
          <ClientDetailPanel ... />
        </div>
      </div>
    </div>
  </div>
</div>
```

### Problèmes identifiés

| # | Problème | Impact |
|---|----------|--------|
| 1 | `py-6` sur le conteneur root au lieu de `px-6 pt-6` | Espacement vertical différent |
| 2 | Niveau de div intermédiaire `flex-1 overflow-hidden bg-slate-50` | Structure plus complexe que nécessaire |
| 3 | `gap-6` entre header et contenu (vs Quotes qui utilise `pt-4` sur le conteneur) | Espacement header/contenu différent |
| 4 | Largeur table en `w-1/3 min-w-[350px] max-w-[500px]` (fixe) vs `flex-[4]` (ratio) | Pas responsive, ne s'adapte pas à la taille de l'écran |
| 5 | Panel détail en `<div>` vs `<aside>` (sémantique) | Accessibilité moindre |
| 6 | Pas de `min-h-0` sur la colonne panel détail | Risque de débordement vertical |

---

## 2. Tableau / Liste des entités

### Quotes — `QuotesTable.tsx`
- ✅ Vraie table HTML `<table>` avec `<thead>` et `<tbody>`
- ✅ En-têtes triables avec flèches de tri (`CaretUp`/`CaretDown`)
- ✅ Colonnes fixes : Client | N° Devis | Date | Statut | Montant HT
- ✅ Largeurs de colonnes constantes : `COL_CLIENT`, `COL_NUMBER`, `COL_DATE`, `COL_STATUS`, `COL_AMOUNT`
- ✅ Gestion de sélection via `useQuotes()` context
- ✅ Highlight conditionnel des montants (dégradé amber/orange/rose selon seuil)
- ✅ Badges de statut via `DS_BADGE_*` tokens
- ✅ Hover row : `hover:bg-slate-50` / `hover:bg-indigo-100` (actif)
- ✅ État vide inline avec message centré

### Clients — `ClientTable.tsx`
- ❌ **Liste `<div>`-based** avec `grid grid-cols-[1fr_auto]` — pas de table HTML
- ❌ **Pas d'en-têtes de colonnes triables** — juste des filtres inline
- ❌ **Checkboxes explicites** pour la sélection (vs Ctrl+click)
- ❌ **Badges de statut en dur** (`BADGE_CLASSES`) — pas via les tokens `DS_BADGE_*`
  - `DS_BADGE_ACTIVE` utilise `bg-indigo-50` mais `BADGE_CLASSES.SENT` utilise `bg-blue-50`
  - Couleurs divergentes : indigo vs blue pour le même concept "Envoyé"
- ⚠️ Contient le `ClientPagination` intégré (vs composant partagé)
- ⚠️ Bulk actions bar custom en bas du header (pas dans Quotes)
- ⚠️ Mini-avatars "RÉCENTS" circulaires — feature propre à Clients

---

## 3. PageHeader

Les deux pages utilisent le **même composant** `PageHeader` avec les mêmes styles :
```tsx
// base : flex items-center justify-between px-5 py-3 bg-white border border-slate-200 rounded-md
```

✅ **Alignement parfait** sur ce composant.

### Différence dans l'utilisation :

**Quotes** :
```tsx
<PageHeader
  title="Devis"
  description={<span>...{filteredQuotes.length} devis...encaissé...en attente</span>}
  actions={<SearchBar /><FiltersDropdown /><ExportActions /><button>Nouveau devis</button>}
/>
```

**Clients** :
```tsx
<PageHeader
  title="Clients"
  description={`${total} client${total > 1 ? "s" : ""}`}
  actions={<SearchBar /><button>Importer</button><button>Nouveau Client</button>}
/>
```

✅ Structure identique.  
✅ Mêmes composants d'action (`SearchBar`, `BTN_PRIMARY`, `BTN_SECONDARY`).  
⚠️ Quotes inclut des KPIs financiers dans la `description`. Clients n'affiche que le count.

---

## 4. Boutons et SearchBar

✅ `SearchBar` — même composant partagé, mêmes props (`value`, `onChange`, `placeholder`).  
✅ `BTN_PRIMARY` — `"flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-mono text-[10px] uppercase tracking-wide transition-all"`  
✅ `BTN_SECONDARY` — `"flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md font-mono text-[10px] uppercase tracking-wide transition-all"`  

**Aucun problème d'alignement.**

---

## 5. Design Tokens Utilisés

| Token | Quotes | Clients | Aligné ? |
|-------|--------|---------|----------|
| `DS_MONO` | ✅ `font-mono text-[11px] tabular-nums leading-snug` | ✅ | ✅ |
| `DS_LABEL` | ✅ `font-mono text-[9px] uppercase tracking-wide text-slate-500` | ✅ | ✅ |
| `DS_MICRO` | ✅ (alias de `DS_LABEL`) | ✅ | ✅ |
| `DS_BADGE_*` | ✅ 6 tokens badges (ACTIVE, SUCCESS, WARNING, DANGER, ACCEPTED, NEUTRAL, CANCELLED) | ❌ Classes inline `BADGE_CLASSES` | ❌ |
| `DS_CARD` | `bg-white border border-slate-200 rounded-md` | ✅ Utilisé ? Non, `SECTION_CLASS` en dur | ⚠️ |
| `DS_INPUT` | ✅ | ✅ Dans `EditableField` | ✅ |
| `DS_BUTTON_SECONDARY` | ✅ | ✅ Imports mais pas utilisé (utilise `BTN_SECONDARY`) | ⚠️ |
| `DS_TITLE` | ✅ | ✅ (via PageHeader) | ✅ |
| `DS_TEL_BLOCK` | ✅ (sidebar) | N/A | - |
| `DS_PROGRESS_*` | ✅ | N/A | - |

---

## 6. Gestion des États

### Quotes — 3 états vides riches :
1. **Totalement vide** (`quotes.length === 0`) — icône `FileTextIcon`, message + sous-message
2. **Recherche vide** (`isSearchEmpty`) — emoji 🔍, message + bouton "Réinitialiser"
3. **Filtre vide** (`isFilterEmpty`) — icône `CalendarBlank`, message

### Clients :
- ❌ **Aucun état vide** pour la table/liste des clients
- ✅ Un état vide dans `ClientDetailPanel` quand aucun client sélectionné : icône `UserCircle` + "SÉLECTIONNEZ UN CLIENT"
- ⚠️ Le composant gère le loading via `isLoading` mais sans squelette/shimmer

---

## 7. Filtres et Recherche

### Quotes
- `FiltersDropdown` composant dédié (dropdown avec options de statut)
- `SearchBar` pour recherche textuelle
- Filtres combinés gérés par le context `useQuotes()`

### Clients
- ❌ **Filtres inline ad-hoc** directement dans `ClientTable` :
  ```tsx
  <button key="all">Tous</button>
  <button key="relance">À relancer (X)</button>
  <button key="inactif">Inactifs (X)</button>
  ```
- `SearchBar` pour recherche textuelle
- Filtres gérés avec des `useState` locaux (`activeFilter`)

---

## 8. Panneau de Détail / Sidebar

### Quotes — `QuoteDetailSidebar`
- Panel informatif (lecture seule)
- Affiche les détails d'un devis sélectionné
- Utilise `DS_TEL_BLOCK`, `DS_PROGRESS_*`

### Clients — `ClientDetailPanel`
- ✅ **Bien plus riche** : édition inline (Email, Téléphone, Adresse)
- ✅ Section Résumé avec avatar/initials
- ✅ Section Indicateurs (CA TOTAL, TOTAL DEVIS, DERNIÈRE ACTIVITÉ)
- ✅ Section Historique des devis (tableau)
- ✅ Section Notes internes avec auto-save
- ⚠️ Scrollbar custom `[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200`

---

## 9. Pagination

### Quotes — `TablePagination`
- Composant partagé réutilisable
- Pagination côté client (`paginate()` helper)
- `PAGE_SIZE` constant

### Clients — `ClientPagination`
- ⚠️ Composant propre à Clients (`./client-pagination.tsx`)
- Pagination serveur avec `page`, `limit(25)`, `totalPages`
- Interface différente

---

## 10. Design Tokens Badges — Incohérence Critique

Le problème le plus important concerne les badges de statut :

### Quotes (source de vérité)
```tsx
// DS_BADGE_ACTIVE (SENT):
"px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200"
// DS_BADGE_SUCCESS (PAID):
"px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200"
// etc.
```

### Clients (définition locale)
```tsx
// SENT:
"bg-blue-50 text-blue-700 border-blue-200"      // ← BLUE au lieu de INDIGO !
// PAID:
"bg-emerald-50 text-emerald-700 border-emerald-200"
```

**Différence** : `bg-indigo-50` vs `bg-blue-50` pour le statut "Envoyé".  
Les badges `PAID`, `DRAFT`, `REJECTED` sont alignés mais utilisent `text-*-700` vs `text-*-600`.

---

## 11. Recommandations pour l'Alignement

### Priorité Haute 🔴

1. **Migrer `ClientTable` vers une vraie table HTML `<table>`**
   - Reprendre le pattern de `QuotesTable` (en-têtes triables, colonnes fixes, hover states)
   - Utiliser les constantes de largeur de colonnes comme dans Quotes

2. **Uniformiser les badges de statut**
   - Remplacer `BADGE_CLASSES` par les tokens `DS_BADGE_*` du design system
   - `SENT` doit utiliser `DS_BADGE_ACTIVE` (indigo, pas blue)

3. **Ajouter des états vides dans `ClientTable`**
   - Au moins un état "Aucun client trouvé" pour la recherche vide
   - Reprendre le pattern des 3 états de Quotes

### Priorité Moyenne 🟡

4. **Harmoniser le layout**
   - Remplacer `py-6` sur le root par `pt-6` (comme Quotes)
   - Supprimer la div intermédiaire `flex-1 overflow-hidden bg-slate-50`
   - Utiliser `flex-[4]` et `flex-[6]` au lieu de `w-1/3 min-w-[350px] max-w-[500px]`
   - Utiliser `<aside>` pour le panel détail

5. **Standardiser la pagination**
   - Utiliser `TablePagination` partagé au lieu de `ClientPagination`

6. **Extraire les filtres dans un composant dédié**
   - Créer un `ClientFiltersDropdown` ou réutiliser le pattern de `FiltersDropdown`

### Priorité Basse 🟢

7. **Migrer vers `DS_CARD`** au lieu de `SECTION_CLASS` en dur
8. **Supprimer les scrollbar customs redondantes** (utiliser une classe globale)
9. **Utiliser `DS_BUTTON_SECONDARY`** importé (déjà importé mais pas utilisé)
10. **Ajouter `min-h-0`** sur les conteneurs flexibles pour éviter les débordements

---

## Score d'Alignement Global

| Catégorie | Score | Commentaire |
|-----------|-------|-------------|
| Layout | 50% | Structure différente, padding/overflow divergents |
| Table/Liste | 30% | Pattern radicalement différent (HTML table vs div grid) |
| PageHeader | 100% | Parfaitement aligné |
| Boutons | 100% | Parfaitement aligné |
| SearchBar | 100% | Parfaitement aligné |
| Design Tokens | 70% | DS_MONO/LABEL ok, mais DS_BADGE_* pas utilisé |
| États vides | 20% | Manque total d'états vides dans la table |
| Filtres | 40% | Pattern différent (inline vs dropdown) |
| Pagination | 50% | Composant propriétaire vs partagé |

**Score Global** : **~62%** — La page clients utilise les bons composants partagés (PageHeader, SearchBar, boutons) mais diverge significativement sur l'implémentation interne (table vs liste, badges, filtres, états vides). Le design system est partiellement respecté mais pas pour les badges qui sont une incohérence critique.