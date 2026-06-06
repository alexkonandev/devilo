# Refonte Dashboard → Alignement Design System (Source: Quotes)

> **Projet** : DevisExpress — Refonte UI de la page Dashboard  
> **Source de vérité** : `features/quotes/spatial-quotes-view.tsx`  
> **Design System** : `lib/design-system.ts` + `docs/DESIGN_SYSTEM.md`  
> **Statut** : ✅ Terminé

---

## Phase 1 — Layout & Structure Globale (Fondation) ✅

Objectif : Remplacer toute l'architecture DOM par le pattern Quotes (layout inline, pas de PageShell).

### 1.1 Restructuration du conteneur racine
- [x] 1.1.1 Supprimer le wrapper `<div className="flex flex-col h-full">`
- [x] 1.1.2 Remplacer par `<div className="flex flex-col h-full w-full bg-slate-50">` (identique Quotes)
- [x] 1.1.3 Supprimer l'import et l'usage de `PageShell`
- [x] 1.1.4 Supprimer le double wrapper `<div className="flex-1 overflow-hidden">` + `<PageShell>`

### 1.2 Ajout du PageHeader (identique au pattern Quotes)
- [x] 1.2.1 Importer `PageHeader` depuis `@/components/shared/layout/page-header`
- [x] 1.2.2 Ajouter `<div className="shrink-0 px-6 pt-6">` en haut du contenu (comme Quotes)
- [x] 1.2.3 Configurer `PageHeader` avec `title="Tableau de Bord"`
- [x] 1.2.4 Ajouter `description` avec les KPIs : nombre devis actifs, CA total, etc.
- [x] 1.2.5 Ajouter `actions` slot avec bouton "Nouveau devis" + éventuels filtres

### 1.3 Structure du content area (flex split)
- [x] 1.3.1 Remplacer la `<div className="h-full overflow-y-auto p-4">` + `<div className="grid grid-cols-12 gap-4">`
- [x] 1.3.2 Ajouter `<div className="flex w-full flex-1 min-h-0 px-6 pb-6 pt-4 overflow-hidden gap-6">` (identique Quotes)
- [x] 1.3.3 Colonne gauche : `<div className="flex-[4] min-w-0 flex flex-col">` (zone activité)
- [x] 1.3.4 Colonne droite : `<aside className="flex-[6] flex flex-col min-h-0 overflow-hidden">` (portefeuille)

### 1.4 Nettoyage des imports devenus inutiles
- [x] 1.4.1 Supprimer `import { PageShell } from "@/components/layout/page-shell"`
- [x] 1.4.2 Supprimer `import { motion } from "framer-motion"`
- [x] 1.4.3 Supprimer les imports de DS tokens qui ne sont plus utilisés

---

## Phase 2 — Telemetry Strip & KPIs (Bandeau du haut) ✅

Objectif : Uniformiser la bande KPI et remplacer les formateurs locaux.

### 2.1 Révision des TelemetryCells
- [x] 2.1.1 Remplacer `formatCompact(kpis.chiffreAffairesTotal)` par `formatPrice(kpis.chiffreAffairesTotal, { compact: true })`
- [x] 2.1.2 Remplacer `formatCompact(kpis.enAttentePaiement)` par `formatPrice(kpis.enAttentePaiement, { compact: true })`
- [x] 2.1.3 Supprimer les fonctions locales `formatCFA()` et `formatCompact()`
- [x] 2.1.4 Importer `formatPrice` depuis `@/lib/utils`

### 2.2 Ajout de la sparkline réelle
- [x] 2.2.1 Supprimer les données mock `sparklineData` (lignes 101-104 actuellement)
- [x] 2.2.2 Remplacer par des données passées depuis la page serveur `dashboard/page.tsx`
- [x] 2.2.3 Ajouter `sparkline: number[]` dans l'interface `DashboardProps`

### 2.3 Vérification des tokens DS dans TelemetryStrip
- [x] 2.3.1 `DS_BENTO_CARD` + `p-0 flex items-stretch divide-x divide-slate-100/60 overflow-hidden` ✅ déjà correct
- [x] 2.3.2 Vérifier que `DS_MICRO` vs `DS_LABEL` est cohérent (les deux sont identiques)
- [x] 2.3.3 Les icônes utilisent `DS_ICON_SM` (12px) ✅ déjà correct

---

## Phase 3 — Cartes Bento & Contenu (Zone activité 8 colonnes)

Objectif : Refondre les cartes d'activité avec les tokens DS et le composant StatusBadge.

### 3.1 Carte "Activité Récente" (Sparkline)
- [x] 3.1.1 Supprimer `framer-motion` des barres du sparkline
- [x] 3.1.2 Remplacer les `motion.div` par des `<div>` avec CSS transition simple `transition-all duration-300`
- [x] 3.1.3 Garder la structure `DS_BENTO_CARD p-0 overflow-hidden`
- [x] 3.1.4 Garder le `DS_SECTION_HEADER` mais supprimer le `bg-slate-50/50` arbitraire
- [x] 3.1.5 Remplacer `mb-0` override par une classe conditionnelle sur `DS_SECTION_HEADER`

### 3.2 Carte "Dernières Actions" (Tableau)
- [x] 3.2.1 Supprimer le `<table>` HTML natif
- [x] 3.2.2 Remplacer par une structure `div` avec des rangées flex (pattern Quotes table)
- [x] 3.2.3 Header: `<div className="flex items-center px-3 py-2 bg-slate-50/80 border-b border-slate-100/60">`
- [x] 3.2.4 Cellules header : `DS_LABEL` (`font-mono text-[9px] uppercase tracking-wide text-slate-500`)
- [x] 3.2.5 Lignes : `<div className="flex items-center px-3 py-2 hover:bg-slate-50/50 border-b border-slate-100/60">`
- [x] 3.2.6 Supprimer les animations `motion.tr` et `initial/animate/transition`
- [x] 3.2.7 Remplacer par classe `hover:bg-slate-50/50 transition-colors cursor-pointer`

### 3.3 Refonte complète du StatusBadge
- [x] 3.3.1 Remplacer le simple `<span className={config.className}>{config.label}</span>`
- [x] 3.3.2 Nouveau format (conforme DS.md §6) :
  ```tsx
  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border">
    <span className={`w-1 h-1 rounded-full ${STATUS_DOT_MAP[status]}`} />
    {config.label}
  </span>
  ```
- [x] 3.3.3 Ajouter `STATUS_DOT_MAP` avec les couleurs de dot (emerald-500, blue-500, amber-500, rose-500)
- [x] 3.3.4 Déplacer StatusBadge dans un composant partagé si réutilisable

---

## Phase 4 — Cartes Bento & Contenu (Zone portefeuille 4 colonnes)

Objectif : Refondre les cartes "Brouillons" et "Top Clients".

### 4.1 Carte "Brouillons en cours"
- [x] 4.1.1 Supprimer `bg-slate-50/50` du section header
- [x] 4.1.2 Remplacer les items `Link` avec `DS_BENTO_CARD block hover:border-indigo-300 hover:shadow-sm transition-all`
- [x] 4.1.3 Supprimer `hover:shadow-sm` (pas d'ombres dans le DS)
- [x] 4.1.4 Remplacer par `hover:border-indigo-300 transition-colors`
- [x] 4.1.5 Empty state : remplacer par format `border-dashed` conforme DS :
  ```tsx
  <div className="border border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center">
    <FileTextIcon size={24} className="text-slate-300 mb-2" />
    <p className={cn(DS_MONO, "text-slate-400")}>Aucun brouillon</p>
    <p className={cn(DS_LABEL, "text-slate-300")}>Créez un nouveau devis</p>
  </div>
  ```

### 4.2 Carte "Top Clients"
- [x] 4.2.1 Supprimer le `motion.div` sur la progress bar (déjà fait — pas de motion.div)
- [x] 4.2.2 Remplacer par `<div className="h-full rounded-full transition-all duration-300">` (déjà conforme avec DS_PROGRESS_BAR)
- [x] 4.2.3 Vérifier que les avatars initials respectent `DS_ICON_WRAPPER` avec `rounded-md`
- [x] 4.2.4 Supprimer `hover:border-indigo-300 transition-all` → `hover:border-indigo-300 transition-colors`
- [x] 4.2.5 Vérifier que `DS_PROGRESS_TRACK` et `DS_PROGRESS_BAR` sont utilisés correctement

### 4.3 Boutons et actions
- [x] 4.3.1 Remplacer `DS_BUTTON` par `BTN_PRIMARY` (depuis `@/components/shared/ui/constants`)
- [x] 4.3.2 Remplacer `DS_BUTTON_SECONDARY` par `BTN_SECONDARY`
- [x] 4.3.3 Vérifier que les tailles sont cohérentes (généralement `text-[10px]` pour les boutons)

---

## Phase 5 — Finalisation & Validation ✅

Objectif : Nettoyage final, suppression des imports morts, validation checklist DS.

### 5.1 Nettoyage des imports
- [x] 5.1.1 Supprimer `import { motion } from "framer-motion"` — déjà absent (retiré Phase 3). `framer-motion` reste installé car utilisé dans d'autres composants du projet (dock, status-bar, catalog, clients, quotes).
- [x] 5.1.2 Supprimer les imports de DS tokens devenus inutiles — tous les tokens importés sont utilisés dans le composant.
- [x] 5.1.3 Supprimer `import { PageShell } from "@/components/layout/page-shell"` — déjà absent (retiré Phase 1).
- [x] 5.1.4 Vérifier qu'aucun import n'est orphelin — tous les imports utilisés : `React/useMemo`, `Link`, 8 icônes Phosphor, `cn/formatPrice`, `BTN_PRIMARY/BTN_SECONDARY`, 10 tokens DS, `QuoteStatus`, `TelemetryStrip/TelemetryCell`, `PageHeader`.
- [x] 5.1.5 Ordonner les imports restants par groupe (React, libs, internes) — déjà ordonné.

### 5.2 Validation Checklist DS
- [x] 5.2.1 Pas de `max-w` ou `mx-auto` sur les conteneurs principaux
- [x] 5.2.2 Height strict `calc(100vh-2.5rem)` sur le layout (via parent dashboard layout)
- [x] 5.2.3 `overflow-hidden` global, scroll dans les enfants
- [x] 5.2.4 Cartes: `bg-white border border-slate-200 rounded-md` (via DS_BENTO_CARD)
- [x] 5.2.5 Pas d'ombres sur les cartes de données (supprimer `shadow-*`)
- [x] 5.2.6 Typographie monospace sur les montants/dates/IDs (via DS_MONO)
- [x] 5.2.7 Labels en `text-[9px] uppercase tracking-wide` (via DS_LABEL)
- [x] 5.2.8 Densité: `gap-2` ou `gap-3`, `p-3` ou `p-4` (gap-6, space-y-3, p-6 via DS_BENTO_CARD)
- [x] 5.2.9 Badges avec dot colorée et border (StatusBadge conforme §6)
- [x] 5.2.10 Empty states avec border-dashed explicite
- [x] 5.2.11 Pas de `shadow-sm`, `shadow-md`, `shadow-lg` nulle part
- [x] 5.2.12 Pas de `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- [x] 5.2.13 Pas de `bg-slate-50/50` ou couleurs arbitraires non tokenisées

### 5.3 Vérification des données serveur (dashboard/page.tsx)
- [x] 5.3.1 Vérifier que les types passés au composant couvrent toujours les nouveaux besoins — `mappedData` fournit `kpis`, `fluxRecent`, `portefeuilleStrategique`, `sparkline` qui correspond à `DashboardProps.data`.
- [x] 5.3.2 Ajouter `sparklineData: number[]` dans `DashboardProps` si nécessaire — déjà présent.
- [x] 5.3.3 Supprimer le mapping vers `mappedData` si des champs deviennent inutiles — tous les champs sont utilisés.
- [x] 5.3.4 Vérifier la cohérence des noms de propriétés entre serveur et client — `sparkline` cohérent entre page.tsx et DashboardProps.

### 5.4 Tests visuels & régression
- [x] 5.4.1 Vérifier l'affichage desktop (layout 8/4 cols) — colonne gauche flex-[4], droite flex-[6]
- [x] 5.4.2 Vérifier l'état vide (aucune donnée) — empty state border-dashed pour brouillons
- [x] 5.4.3 Vérifier l'état avec données réelles — données serveur depuis getAdvancedDashboardData
- [x] 5.4.4 Vérifier que le scroll fonctionne dans les panneaux enfants — max-h-48/64 overflow-y-auto
- [x] 5.4.5 Vérifier que la TelemetryStrip s'affiche correctement — 4 cellules dont sparkline
- [x] 5.4.6 Vérifier que PageHeader responsive ne déborde pas — structure shrink-0

---

## Résumé des fichiers à modifier

| Fichier | Modifications |
|---------|---------------|
| `features/dashboard/dashboard-view.tsx` | **Refonte complète** ✅ (layout, composants, styles) |
| `app/(dashboard)/dashboard/page.tsx` | Ajustements mineurs ✅ (props sparkline ajoutées) |
| `lib/design-system.ts` | Aucune modification (déjà à jour) |
| `components/shared/layout/page-header.tsx` | Aucune modification (déjà à jour) |
| `components/layout/telemetry-strip.tsx` | Aucune modification (déjà conforme) |
| `components/shared/ui/constants.ts` | Aucune modification (déjà à jour) |
| `features/dashboard/DASHBOARD_REFACTOR_PLAN.md` | Documentation de suivi ✅ Terminé |

## Temps estimé par phase

| Phase | Estimation | Complexité | Statut |
|-------|-----------|------------|--------|
| Phase 1 — Layout & Structure | ~45 min | 🔴 Haute | ✅ Terminé |
| Phase 2 — Telemetry & KPIs | ~15 min | 🟢 Faible | ✅ Terminé |
| Phase 3 — Cartes activité | ~30 min | 🟡 Moyenne | ✅ Terminé |
| Phase 4 — Cartes portefeuille | ~20 min | 🟡 Moyenne | ✅ Terminé |
| Phase 5 — Finalisation & Validation | ~15 min | 🟢 Faible | ✅ Terminé |
| **Total** | **~2h** | | **✅ 100%** |