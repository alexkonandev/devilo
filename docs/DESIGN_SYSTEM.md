# DevisExpress — Design System Manifest

> **Version**: 2.1 — Fintech Command Center  
> **Date**: Avril 2026  
> **Status**: Source de Vérité Absolue  

---

## 1. PHILOSOPHIE

**Edge-to-Edge Density**. Pas d'espacement superflu. Pas d'ombres flottantes. L'information est ROI. Chaque pixel sert l'action utilisateur.

**SaaS Pro Standard**. Densité chirurgicale, typographie monospace pour les données, hiérarchie visuelle immédiate.

**Deux régimes UI co-existent** :
1. **Régime Dashboard** (pages spatial-*) → navigation, consultation, gestion
2. **Régime Studio** (éditeur quotes/new) → création, édition, composition

Ces régimes ont des contraintes UX différentes et **consomment des tokens distincts** (voir §10).

---

## 2. LAYOUT GLOBAL — RÉGIME DASHBOARD

### Règles Absolues

```
┌─ Viewport ─────────────────────────────────────────────┐
│  ┌─ Top Bar (h-10 / 40px) ──────────────────────────┐   │
│  └───────────────────────────────────────────────────┘   │
│  ┌─ Sidebar (w-16 / 64px) ─┬─ Content Area ───────────┐  │
│  │                          │  h-[calc(100vh-2.5rem)]   │  │
│  │                          │  overflow-hidden         │  │
│  │                          │  (scroll dans enfants)    │  │
│  └──────────────────────────┴──────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

| Propriété | Valeur | Rationale |
|-----------|--------|-----------|
| **Top Bar** | `h-10` (40px) | Monolithique, pas de rounded |
| **Sidebar** | `w-16` (64px) | Rail étroit, icônes 18-20px |
| **Content** | `h-[calc(100vh-2.5rem)]` | Strict viewport moins top bar |
| **Scroll** | `overflow-hidden` global | Scroll délégué aux panneaux |
| **Padding** | `pt-10 pl-16` | Compensation HUD |

### Interdictions (Dashboard)

- ❌ **PAS DE** `max-w-[1400px]` ou `mx-auto` sur le main
- ❌ **PAS DE** `pb-12` ou margins bottom sur les conteneurs
- ❌ **PAS DE** ombres flottantes (`shadow-lg`, `shadow-xl`)
- ❌ **PAS DE** grands arrondis (`rounded-2xl`, `rounded-3xl`)
- ❌ **PAS DE** scroll global sur body/main

---

## 3. PALETTE & CONTENEURS — RÉGIME DASHBOARD

### Fonds

| Élément | Classe | Usage |
|---------|--------|-------|
| **Canevas App** | `bg-slate-50` | Fond de l'application |
| **Cartes/Bento** | `bg-white` | Conteneurs de données |
| **Hover State** | `hover:bg-slate-50` | Survol lignes de liste |
| **Active State** | `bg-indigo-50` | Élément sélectionné |

### Bordures

| Élément | Classe | Usage |
|---------|--------|-------|
| **Cartes** | `border border-slate-200` | Conteneurs principaux |
| **Dividers** | `border-b border-slate-200` | Séparations horizontales |
| **Séparation verticale** | `border-r border-slate-200` | Panes adjacents |
| **Hover accent** | `hover:border-indigo-300` | Interaction cartes |

### Arrondis

| Élément | Classe | Usage |
|---------|--------|-------|
| **Cartes** | `rounded-lg` | Standard (jamais plus) |
| **Badges/Pills** | `rounded` ou `rounded-md` | Labels compacts |
| **Inputs** | `rounded-md` | Champs de saisie |
| **Avatars** | `rounded` ou `rounded-md` | Initiales clients |

### Interdictions (Dashboard)

- ❌ **PAS DE** `shadow-none` explicite (c'est le défaut)
- ❌ **PAS DE** `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- ❌ **PAS DE** `backdrop-blur` sauf status bar
- ❌ **PAS DE** gradients de fond

---

## 4. TYPOGRAPHIE — RÉGIME DASHBOARD

### Grille Typo Standardisée (tokens DS)

```typescript
export const DS_LABEL = "font-mono text-[9px] uppercase tracking-wide text-slate-500";
export const DS_MONO  = "font-mono text-[11px] tabular-nums leading-snug";
export const DS_TITLE = "font-mono text-xl uppercase tracking-tight text-slate-900";
export const DS_H2    = "font-mono text-base uppercase tracking-tight text-slate-900";
export const DS_BODY  = "font-sans text-sm text-slate-600 leading-relaxed";
export const DS_MICRO = DS_LABEL; // alias legacy
```

### Échelle Type

| Usage | Classe / Token | Exemple |
|-------|----------------|---------|
| **Titre de section** | `DS_TITLE` / `font-mono text-xl` | "TABLEAU DE BORD" |
| **Sous-titre** | `DS_H2` / `font-mono text-base` | "ACTIVITÉ RÉCENTE" |
| **Corps** | `DS_BODY` / `font-sans text-sm` | Descriptifs, paragraphes |
| **Labels (micro)** | `DS_LABEL` / `text-[9px] uppercase` | "CA TOTAL", "EN ATTENTE" |
| **Données monospace** | `DS_MONO` / `font-mono text-[11px]` | Montants, dates, IDs |
| **KPI Numbers** | `text-lg font-bold text-slate-900 tabular-nums` | Montants en header |
| **Large KPI** | `text-2xl font-black tracking-tight` | Chiffres principaux |

### Monospace (Données Techniques)

**RÈGLE ABSOLUE**: Tout ce qui doit s'aligner en colonnes = `font-mono`

```
Montants:     font-mono font-bold tabular-nums
Dates:        font-mono text-[11px]
IDs/Numéros:  font-mono text-xs
Quantités:    font-mono tabular-nums
```

### Hiérarchie Couleurs Texte

| Élément | Couleur | Usage |
|---------|---------|-------|
| **Primaire** | `text-slate-900` | Titres, données importantes |
| **Secondaire** | `text-slate-700` | Texte standard |
| **Tertiaire** | `text-slate-500` | Labels, meta-info |
| **Quaternaire** | `text-slate-400` | Placeholders, disabled |
| **Accent** | `text-indigo-600` | Liens, actions |

---

## 5. DENSITÉ & SPACING — RÉGIME DASHBOARD

### Grid/Flex Gaps

| Contexte | Gap | Usage |
|----------|-----|-------|
| **Bento Grids** | `gap-2` ou `gap-3` | Groupes de cartes denses |
| **List Items** | `gap-2` | Lignes de listes |
| **Form Fields** | `gap-3` ou `gap-4` | Champs de formulaire |
| **Section Spacing** | `space-y-4` | Blocs majeurs |

### Padding Interne (Cards)

| Taille | Usage |
|--------|-------|
| **Compact** | `p-2.5` ou `p-3` | Lignes de liste, petits items |
| **Standard** | `p-4` | Cartes Bento standard |
| **Large** | `p-5` | Headers de section |

### Padding List Items

**RÈGLE**: Les lignes de liste utilisent `py-2` ou `py-2.5` pour densité chirurgicale.

```tsx
// Master List Item (Quotes Page Standard)
<div className="px-3 py-2 ...">  // Dense, scannable
```

---

## 6. STATUTS & BADGES — RÉGIME DASHBOARD

### Configuration Standard

```typescript
const STATUS_CONFIG = {
  PAID:     { bg: "bg-emerald-100",   text: "text-emerald-700",   border: "border-emerald-200",   dot: "bg-emerald-500" },
  SENT:     { bg: "bg-blue-100",      text: "text-blue-700",      border: "border-blue-200",      dot: "bg-blue-500" },
  ACCEPTED: { bg: "bg-indigo-100",    text: "text-indigo-700",    border: "border-indigo-200",    dot: "bg-indigo-500" },
  DRAFT:    { bg: "bg-amber-100",     text: "text-amber-700",     border: "border-amber-200",     dot: "bg-amber-500" },
  REJECTED: { bg: "bg-rose-100",      text: "text-rose-700",      border: "border-rose-200",      dot: "bg-rose-500" },
};
```

### Format Badge

```tsx
<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border">
  <span className="w-1 h-1 rounded-full" /> {/* Dot */}
  LABEL
</span>
```

---

## 7. COMPOSANTS RÉCURRENTS

### Bento Card

```tsx
<div className="p-4 bg-white rounded-lg border border-slate-200">
  {/* Header micro */}
  <div className="flex items-center gap-1.5 mb-2 text-slate-400">
    <Icon size={14} />
    <span className="text-[9px] font-bold uppercase tracking-wider">TITRE</span>
  </div>
  {/* Content */}
  ...
</div>
```

### KPI Card (Header Telemetry)

```tsx
<div className="flex items-center gap-3 p-3 border-r border-slate-200">
  <div className="w-8 h-8 rounded-md bg-{color}-50 flex items-center justify-center">
    <Icon size={16} className="text-{color}-600" weight="bold" />
  </div>
  <div>
    <div className="flex items-baseline gap-1">
      <span className="text-lg font-bold text-slate-900 tabular-nums">VALUE</span>
      <span className="text-[10px] text-slate-400">UNIT</span>
    </div>
    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">LABEL</span>
  </div>
</div>
```

### Empty State

```tsx
<div className="border border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center">
  <Icon size={24} className="text-slate-300 mb-2" />
  <p className="text-sm text-slate-500">Titre</p>
  <p className="text-xs text-slate-400">Sous-titre explicatif</p>
</div>
```

---

## 8. EXEMPLE: PAGE CLIENT ALIGNÉE

```tsx
// Layout container
<div className="h-full flex">
  {/* Master Pane - 350px */}
  <div className="w-[350px] border-r border-slate-200 flex flex-col">
    {/* Header - aligné avec DetailPane header */}
    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
      <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-indigo-500">
        Carnet d'Adresses
      </span>
      {/* ... */}
    </div>
    {/* List - dense */}
    <div className="flex-1 overflow-y-auto">
      <div className="px-3 py-2 ..."> {/* py-2 = densité */}
    </div>
  </div>

  {/* Detail Pane */}
  <div className="flex-1 flex flex-col bg-slate-50">
    {/* Header - même hauteur que Master */}
    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
      <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-indigo-500">
        Fiche Client
      </span>
    </div>
    
    {/* Bento Grid Content */}
    <div className="flex-1 overflow-y-auto p-5">
      <div className="grid grid-cols-3 gap-3">
        {/* Identity Card */}
        <div className="col-span-2 p-4 bg-white rounded-lg border border-slate-200">
          ...
        </div>
        {/* Stats Card - MÊME HAUTEUR */}
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          ...
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 9. CHECKLIST DE VALIDATION — RÉGIME DASHBOARD

Avant de soumettre une refonte UI:

- [ ] Pas de `max-w` ou `mx-auto` sur les conteneurs principaux
- [ ] Height strict `calc(100vh-2.5rem)` sur le layout
- [ ] `overflow-hidden` global, scroll dans les enfants
- [ ] Cartes: `bg-white border border-slate-200 rounded-lg`
- [ ] Pas d'ombres sur les cartes de données
- [ ] Typographie monospace sur les montants/dates/IDs
- [ ] Labels en `text-[9px] uppercase font-bold tracking-wider`
- [ ] Densité: `gap-2` ou `gap-3`, `p-3` ou `p-4`
- [ ] Badges avec dot colorée et border
- [ ] Empty states avec border-dashed explicite

---

## 10. RÉGIME STUDIO — DIALECTE SPÉCIFIQUE À L'ÉDITEUR

> L'éditeur de devis (`/quotes/new`) est un **environnement de composition** (type studio graphique / atelier).
> Ses contraintes UX sont différentes du régime Dashboard : densité plus élevée, contrôles d'édition, preview A4.
> Il définit **ses propres tokens locaux** dans `studio-sidebar-left.tsx` et `quote-editor-layout.tsx`.
> **Ce n'est pas un bug, c'est une feature.** Les deux régimes sont officiels et co-existent.

### 10.1 Tokens Studio — Locaux et Assumés

```typescript
// studio-sidebar-left.tsx — Tokens compacts pour l'atelier d'édition
const SIDEBAR_CARD       = "bg-white border border-slate-200 rounded-md p-3";
const SIDEBAR_TAB_ACTIVE = "bg-white text-slate-900 border border-slate-200";
const SIDEBAR_TAB_INACTIVE = "text-slate-500 hover:text-slate-800";
const SIDEBAR_INPUT      = "w-full bg-white border border-slate-200 px-2.5 py-1.5 font-mono text-[10px] text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all";
const SIDEBAR_LABEL      = "text-[8px] font-mono uppercase tracking-wider text-slate-600 mb-1 block";
```

| Token Studio | Dashboard Equivalent | Différence Intentionnelle |
|---|---|---|
| `SIDEBAR_CARD = p-3` | `DS_BENTO_CARD = p-4` | Plus dense (atelier vs lecture) |
| `SIDEBAR_LABEL = text-[8px]` | `DS_LABEL = text-[9px]` | Micro-typo pour sidebar outillage |
| `SIDEBAR_INPUT = text-[10px] px-2.5` | `DS_INPUT = text-sm px-3` | Plus compact pour manipulation rapide |
| `rounded-md` partout | `rounded-lg` partout | Même radius, cohérence préservée |
| `border-slate-200` | `border-slate-200` | **Même couleur de bordure** |

### 10.2 Layout Studio

```
┌─────────────────────────────────────────────────────────┐
│ ┌─ Top Bar (h-12 / 48px) ──────────────────────────┐   │
│ │ [Nouveau] [Supprimer]  Studio│Aperçu  -/+  Thème  Export│
│ └───────────────────────────────────────────────────┘   │
│ ┌─ Sidebar L (360px) ─┬─ Document A4 ─┬─ Sidebar R (300px)│
│ │                     │  (centré,      │                    │
│ │  Client / Lignes    │   zoomable)    │  Propriétés        │
│ │  / Offres           │                │  du document       │
│ │                     │                │                    │
│ └─────────────────────┴────────────────┴────────────────────┘
└─────────────────────────────────────────────────────────┘
```

**Différences clés avec le layout Dashboard :**
- Top Bar : `h-12` (48px) vs `h-10` (40px) — plus d'outils d'édition
- Pas de `SpatialDock` ni `SpatialStatusBar` — l'éditeur a ses propres contrôles
- Pas de padding `pt-10 pl-16` — le layout est autonome
- Sidebars de taille fixe (360px / 300px) vs ratio flexible (flex-[4]/flex-[6])
- Le document A4 est centré et zoomable

### 10.3 Typographie Studio vs Dashboard

| Usage | Studio | Dashboard |
|-------|--------|-----------|
| **Labels sidebar** | `text-[7px]` à `text-[8px]` | `text-[9px]` |
| **Données lignes** | `text-[10px] font-mono` | `text-[11px] DS_MONO` |
| **Titres sections** | `text-[8px] uppercase` | `DS_LABEL` standard |
| **Input values** | `text-[10px] font-mono` | `text-sm font-sans` |
| **Noms items** | `text-[10px] font-mono font-bold` | `DS_BODY` |

### 10.4 Sous-tabs et Variantes (Studio uniquement)

Le Studio utilise des sous-tabs pour l'onglet Catalogue (Inventaire / Suggestion) avec un style distinct :

```typescript
// Sous-tabs Inventaire
const SUBTAB_ACTIVE = "bg-white text-indigo-700 border border-indigo-200 shadow-[0_1px_2px_rgba(79,70,229,0.06)]";
// Sous-tabs Suggestion (variante violette)
const SUBTAB_VARIANT_SUGGESTION = "bg-white text-violet-700 border border-violet-200 shadow-[0_1px_2px_rgba(124,58,237,0.06)]";
```

Ces variantes sont propres au Studio et ne doivent **pas** être répliquées dans le régime Dashboard.

### 10.5 Composants Internes Studio

Le Studio définit ses propres composants internes compacts :
- `NavTab` — navigation principale Client / Devis / Offres
- `SubTabButton` — sous-onglets avec variante "suggestion" (violet)
- `CompactField` — champ avec label
- `CompactInput` / `CompactTextarea` — inputs réduits
- `CompactAlert` — alertes compactes (type amber)
- `SuggestionBadge` — badge de pertinence avec score (Match XX%)

Ces composants sont internes au Studio et ne sont pas destinés à être partagés avec le Dashboard.

### 10.6 Focus Mode

Le Studio supporte un mode `focusMode` (via contexte `FocusContext`) qui masque les panneaux latéraux pour se concentrer sur le document. Ce mécanisme est propre à l'éditeur.

---

## 11. DOCUMENT A4 — APPLICATION DU DIALECTE STUDIO

> Le document A4 imprimable/PDF (`printable-quote.tsx` → `generateQuoteHTML()`) doit **consommer les valeurs du dialecte Studio**, pas les tokens Dashboard.

### État actuel (résolu)

Le template HTML de print (`lib/print-template.ts`) expose désormais un objet `PRINT_STYLES` qui centralise tous les tokens du document A4, alignés sur le dialecte Studio.

```typescript
// lib/print-template.ts — Exporté et utilisable
export const PRINT_STYLES = {
  label:     "text-[7px] font-mono uppercase tracking-wider text-slate-400",
  data:      "text-[10px] font-mono font-bold text-slate-700",
  badge:     "inline-flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-md border border-slate-100",
  itemTitle: "text-[11px] font-bold text-slate-900 mb-0.5 uppercase",
  totalCard: "w-[85mm] bg-slate-900 rounded-2xl p-6 text-white shadow-xl ...",
  // ... tous les tokens print documentés
};
```

Ces tokens sont utilisés via un shorthand `const S = PRINT_STYLES` dans le template HTML.

### Correspondance A4 ↔ Studio

| Zone A4 | Token PRINT_STYLES | Philosophie Studio |
|---|---|---|
| **Labels section** | `S.label` → `text-[7px] font-mono uppercase tracking-wider text-slate-400` | Aligné sur `STUDIO_LABEL` (même tracking, même font) |
| **Données monospace** | `S.data` → `text-[10px] font-mono font-bold text-slate-700` | Aligné sur `STUDIO_MONO` (même taille 10px) |
| **Badge / meta** | `S.badge` → `bg-slate-50 border border-slate-100` | Même pattern que CompactAlert / sidebar |
| **Noms items** | `S.itemTitle` → `text-[11px] font-bold uppercase` | Densité Studio, taille adaptée print |
| **Carte totale** | `S.totalCard` → `bg-white border border-slate-200 rounded-lg p-6 relative overflow-hidden` avec un dégradé doux `blur-[60px] opacity-25` couleur thème | Accent via un cercle flouté positionné `absolute -right-10 -top-10` — pas de fond contrasté, pas de bordure latérale |
| **Couleur accent** | `themeColor` injecté dynamiquement | ✅ Même mécanisme qu'avant |
| **Palette** | `slate-900` / `slate-700` / `slate-500` / `slate-400` / `indigo-600` | ✅ Identique à l'éditeur Studio |

### Principes appliqués

1. **Tailles print conservées** — les textes A4 sont plus grands que l'UI écran (11px items vs 10px Studio)
2. **Palette alignée** — `slate-900`/`slate-700`/`slate-500`, `indigo-600` pour l'email
3. **`font-sans` (Inter)** pour le corps — le monospace est réservé aux données techniques
4. **Arrondis plus grands en print** — `rounded-xl`, `rounded-2xl` pour une hiérarchie visuelle renforcée
5. **Ombres acceptables en print** — `shadow-xl` car artefact final, pas composant d'interface
6. **Tokens centralisés et réutilisables** — `PRINT_STYLES` peut être importé par d'autres composants

---

## 12. COHABITATION DES DEUX RÉGIMES

### Règle d'or

**Le régime Studio ne doit PAS être forcé à consommer les tokens Dashboard, et inversement.**

Ce qui les unit :
- Même **palette de couleurs** (slate, indigo, emerald, amber, rose)
- Même **philosophie** (bordures fines, pas de background patterns, typo monospace pour les données)
- Même **radius de base** (`rounded-md` = 6px, `rounded-lg` = 8px)

Ce qui les distingue :
- **Densité** : Dashboard = aéré (p-4, gap-4) vs Studio = compact (p-3, gap-2)
- **Échelle typo** : Dashboard = 9px/11px/14px vs Studio = 7px/8px/10px
- **Layout** : Dashboard = master/detail fluide vs Studio = document centré + sidebars fixes
- **Navigation** : Dashboard = SpatialDock vs Studio = top bar outillage

### Interdictions transverses

- ❌ **PAS DE** mélange des tokens (pas de `SIDEBAR_INPUT` dans une page Dashboard)
- ❌ **PAS DE** duplication inutile (si un token Dashboard convient à l'éditeur, l'utiliser)
- ❌ **PAS DE** composant Studio importé dans le Dashboard

---

## 13. CHECKLIST DE VALIDATION — RÉGIME STUDIO

Avant de modifier l'éditeur :

- [ ] Les tokens locaux `SIDEBAR_*` sont utilisés de façon cohérente
- [ ] Pas d'import de tokens Dashboard (`DS_BENTO_CARD`, `DS_INPUT`) dans les composants Studio
- [ ] Le document A4 print suit ses propres règles de lisibilité (pas calqué sur l'UI écran)
- [ ] `rounded-2xl` et ombres sont réservés au print A4 uniquement
- [ ] Pas de `SpatialDock` ou `SpatialStatusBar` dans l'éditeur
- [ ] Le focus mode cache bien les deux sidebars (pas un seul côté)
- [ ] Les sous-tabs violet (Suggestion) sont isolés au composant catalogue du Studio

---

## 14. CHECKLIST DE VALIDATION GLOBALE

Avant de soumettre une refonte UI:

- [ ] Le bon régime est identifié (Dashboard ou Studio) avant d'appliquer des tokens
- [ ] Pas de `max-w` ou `mx-auto` sur les conteneurs principaux (Dashboard)
- [ ] Height strict `calc(100vh-2.5rem)` sur le layout (Dashboard)
- [ ] `overflow-hidden` global, scroll dans les enfants (Dashboard)
- [ ] Cartes Studio : `bg-white border border-slate-200 rounded-md p-3`
- [ ] Cartes Dashboard : `bg-white border border-slate-200 rounded-lg p-4`
- [ ] A4 print : lisibilité avant tout, arrondis et ombres autorisés
- [ ] Typographie monospace sur les montants/dates/IDs (les deux régimes)
- [ ] Labels en `text-[9px] uppercase font-bold tracking-wider` (Dashboard)
- [ ] Labels en `text-[8px] font-mono uppercase tracking-wider` (Studio)
- [ ] Densité: `gap-2` ou `gap-3`, `p-3` ou `p-4`
- [ ] Badges avec dot colorée et border
- [ ] Empty states avec border-dashed explicite

---

**DERNIÈRE MISE À JOUR**: Ajout du régime Studio v2.0 — dialecte officiel de l'éditeur de devis.