# Billing Page — Plan d'Alignement Design System

> **Date**: 06/06/2026
> **Statut**: ✅ COMPLÉTÉ (Phase 1 + 2 + 3)

---

## ✅ Déjà conforme
- [x] Utilisation des tokens DS (`DS_BENTO_CARD`, `DS_SECTION_HEADER`, etc.)
- [x] Palette couleurs (`bg-slate-50`, `bg-white`, `border-slate-200`)
- [x] Badges via tokens `DS_BADGE_*`
- [x] Pas d'ombres (`shadow-lg`, `shadow-xl`)
- [x] Pas de `max-w`/`mx-auto` sur le conteneur principal
- [x] Typo monospace sur montants/dates/IDs

---

## Phase 1 — 🔴 Corrections Typo + Tokens ✅

- [x] 1.1 Aligner `DS_BENTO_CARD` sur `p-4` (design-system.ts)
- [x] 1.2 Corriger titre "Plein Potentiel" → utiliser `DS_TITLE`
- [x] 1.3 Ajouter `font-mono tabular-nums` sur tous les KPIs/montants

## Phase 2 — 🟡 Architecture UX + Espacements ✅

- [x] 2.1 Remplacer `px-8` par `DS_PAGE_PADDING`
- [x] 2.2 Ajouter CTA dans `BentoUpgrade` + fusionner `BentoPaymentAction`
- [x] 2.3 Changer icône couronne pour plan FREE (`CrownSimpleIcon` → `PuzzlePieceIcon`)
- [x] 2.4 Importer `DS_GAP_ITEMS` et `DS_GAP_SECTIONS`

## Phase 3 — 🟢 Polissage Final

- [x] 3.1 Uniformiser `border-slate-200` partout (remplacer `border-slate-100` et `border-*-100`)
- [x] 3.2 Extraire tableau comparateur en composant réutilisable
- [x] 3.3 Ajouter breakpoint `md:` intermédiaire

---

## Fichiers modifiés
- `my-app/features/billing/spatial-billing-view.tsx`
- `my-app/lib/design-system.ts`

## Changements clés
1. `DS_BENTO_CARD` passe de `p-6` à `p-4` (aligné sur le DESIGN_SYSTEM.md)
2. `DS_TEL_BLOCK` passe de `border-slate-100` à `border-slate-200`
3. Titres "Plein Potentiel" et "Plan Gratuit" utilisent `DS_TITLE` (font-mono, uppercase)
4. KPIs montants : ajout de `font-mono tabular-nums`
5. `px-8` remplacé par `DS_PAGE_PADDING` (`p-4`)
6. `BentoPaymentAction` supprimé (redondant) — son CTA est intégré dans `BentoUpgrade`
7. Icône FREE : `CrownSimpleIcon` → `PuzzlePieceIcon`
8. Toutes les bordures harmonisées en `*-200`