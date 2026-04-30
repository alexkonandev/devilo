# DevisExpress — Design System Manifest

> **Version**: 2.0 — Fintech Command Center  
> **Date**: Avril 2026  
> **Status**: Source de Vérité Absolue  

---

## 1. PHILOSOPHIE

**Edge-to-Edge Density**. Pas d'espacement superflu. Pas d'ombres flottantes. L'information est ROI. Chaque pixel sert l'action utilisateur.

**SaaS Pro Standard**. Densité chirurgicale, typographie monospace pour les données, hiérarchie visuelle immédiate.

---

## 2. LAYOUT GLOBAL

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

### Interdictions

- ❌ **PAS DE** `max-w-[1400px]` ou `mx-auto` sur le main
- ❌ **PAS DE** `pb-12` ou margins bottom sur les conteneurs
- ❌ **PAS DE** ombres flottantes (`shadow-lg`, `shadow-xl`)
- ❌ **PAS DE** grands arrondis (`rounded-2xl`, `rounded-3xl`)
- ❌ **PAS DE** scroll global sur body/main

---

## 3. PALETTE & CONTENEURS

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

### Interdictions

- ❌ **PAS DE** `shadow-none` explicite (c'est le défaut)
- ❌ **PAS DE** `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- ❌ **PAS DE** `backdrop-blur` sauf status bar
- ❌ **PAS DE** gradients de fond

---

## 4. TYPOGRAPHIE

### Échelle Type

| Usage | Classe | Exemple |
|-------|--------|---------|
| **Micro Labels** | `text-[9px] uppercase font-bold tracking-wider text-slate-500` | "CA TOTAL", "EN ATTENTE" |
| **Small Data** | `text-[11px] font-medium text-slate-700` | Emails, sous-titres |
| **Body** | `text-xs font-semibold text-slate-800` | Noms, titres secondaires |
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

## 5. DENSITÉ & SPACING

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

## 6. STATUTS & BADGES

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

## 9. CHECKLIST DE VALIDATION

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

**DERNIÈRE MISE À JOUR**: Dashboard & Quotes pages validées comme Source de Vérité.
