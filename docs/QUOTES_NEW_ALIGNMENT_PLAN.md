# Plan de Correction UI/UX — `quotes/new` Alignment Bento

> **Objectif** : Aligner complètement la page `quotes/new` (et ses composants enfants) sur le Design System Bento défini dans `docs/DESIGN_SYSTEM.md` et `lib/design-system.ts`.
> **Pages concernées** : `quote-editor-layout.tsx`, `studio-sidebar-left.tsx`, `studio-sidebar-right.tsx`, `floating-toolbar.tsx`
> **Layout parent** : `app/(editor)/layout.tsx`

---

## Phase 1 — Nettoyage Visuel Prioritaire (SHADOWS, ROUNDED, BACKDROP-BLUR)
**Impact visuel immédiat sans casser la logique métier**

- [ ] **1.1** — Supprimer toutes les `shadow-*` des conteneurs (ISLAND, toolbar, top bar)
- [ ] **1.2** — Remplacer `rounded-2xl` → `rounded-lg` (conteneurs), `rounded-xl` → `rounded-md` (inputs/boutons)
- [ ] **1.3** — Supprimer `backdrop-blur-*` de tous les composants, utiliser fonds 100% opaques
- [ ] **1.4** — Supprimer les `shadow-lg`/`shadow-md`/`shadow-sm` des boutons et cartes

**Fichiers concernés** : `quote-editor-layout.tsx`, `studio-sidebar-left.tsx`, `studio-sidebar-right.tsx`, `floating-toolbar.tsx`

---

## Phase 2 — Tokenisation DS (Design System Tokens)
**Importer et utiliser les tokens du design system**

- [x] **2.1** — Importer `DS_LABEL`, `DS_MONO`, `DS_BODY`, `DS_CARD`, `DS_INPUT`, `DS_BUTTON`, `DS_ICON_SM` depuis `@/lib/design-system`
- [x] **2.2** — Remplacer les classes custom `ISLAND`, `MICRO_LABEL`, `COMPACT_LABEL`, `FIELD_LABEL` par les tokens DS correspondants
- [x] **2.3** — Uniformiser les labels `text-[7px]` → `DS_LABEL` (`text-[9px] font-mono uppercase`)
- [x] **2.4** — Remplacer les inputs customs par `DS_INPUT`
- [x] **2.5** — Uniformiser les tailles d'icônes : `size={20}` → `DS_ICON_SM` (12px) dans les sections/labels

**Fichiers concernés** : `studio-sidebar-left.tsx`, `studio-sidebar-right.tsx`, `floating-toolbar.tsx`

---

## Phase 3 — Suppression des Gradients & Effets Décoratifs
**Nettoyer les fonds non conformes**

- [x] **3.1** — Supprimer les `bg-linear-to-br` et remplacer par `bg-white` ou `bg-slate-50`
- [x] **3.2** — Supprimer les divs décoratives avec `blur-md`/`blur-2xl` (cercles floutés)
- [x] **3.3** — Supprimer les `bg-[radial-gradient(...)]` (patterns overlay)
- [x] **3.4** — Supprimer les `border-white/20` et `border-slate-200/60` → `border-slate-200`

**Fichiers concernés** : `studio-sidebar-left.tsx`, `studio-sidebar-right.tsx`, `floating-toolbar.tsx`

---

## Phase 4 — Refonte du Layout & Top Bar
**Aligner la structure de page sur le standard Bento**

- [ ] **4.1** — Remplacer le layout `fixed inset-0` par `DS_PAGE_SHELL` + `DS_PAGE_PADDING`
- [ ] **4.2** — Déplacer la top bar flottante centrée en header standard (en haut, à gauche, non fixed)
- [ ] **4.3** — Aligner la hauteur du header sur le standard `h-10` (40px)
- [ ] **4.4** — Remplacer la bottom toolbar flottante par un footer standard ou une barre d'action fixe en bas

**Fichiers concernés** : `quote-editor-layout.tsx`, `CreateQuoteClient.tsx`, `app/(editor)/layout.tsx`

---

## Phase 5 — Polissage Final & Validation
**Vérification exhaustive de conformité**

- [ ] **5.1** — Vérifier qu'aucune ombre ne subsiste (`shadow-*`)
- [ ] **5.2** — Vérifier que les arrondis max sont `rounded-lg` (conteneurs) et `rounded-md` (inputs)
- [ ] **5.3** — Vérifier l'absence de `backdrop-blur`
- [ ] **5.4** — Vérifier l'absence de gradients
- [ ] **5.5** — Vérifier que les tokens DS sont utilisés systématiquement
- [ ] **5.6** — Vérifier la densité : `gap-2`/`gap-3`, `p-3`/`p-4`
- [ ] **5.7** — Test visuel : la page doit ressembler aux autres pages alignées (settings, dashboard)

**Fichiers concernés** : Tous les fichiers modifiés dans les phases 1-4

---

## Résumé des Fichiers Impactés

| Fichier | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|---------|---------|---------|---------|---------|
| `quote-editor-layout.tsx` | ✅ | - | - | ✅ |
| `studio-sidebar-left.tsx` | ✅ | ✅ | ✅ | - |
| `studio-sidebar-right.tsx` | ✅ | ✅ | ✅ | - |
| `floating-toolbar.tsx` | ✅ | ✅ | ✅ | - |
| `app/(editor)/layout.tsx` | - | - | - | ✅ |
| `CreateQuoteClient.tsx` | - | - | - | ✅ |