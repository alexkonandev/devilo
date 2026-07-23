# Landing Page V3 — "Obsidian" (Refonte Totale)

> **Contexte :** Abandon total du design Swift-Bento (DS_LP actuel) pour un style **Dark + Glass Premium**.
> Palette : fond `#0a0a0b`, cards `#18181b`, accent indigo `#4f46e5`, verre dépoli.
> Inspiration : Linear / Vercel (dark) + Superhuman (glass).

---

## Phase 0 — Destruction

Supprimer les fichiers de l'ancienne landing :
- `components/landing/` (tout le dossier — 9 fichiers)
- `components/landing-page-view.tsx`
- `docs/LANDING_PAGE_REFACTOR_PLAN.md`

---

## Phase 1 — Fondations : CSS Globals + Tokens

### 1.1 `app/globals.css`
Ajouter les custom properties `--lp-*` pour le thème dark premium.

### 1.2 `lib/design-system.ts`
Réécrire tous les tokens `DS_LP_*` avec les nouvelles classes dark/glass.

---

## Phase 2 — Composants (9 sections)

### 2.1 Nav (`landing-nav.tsx`)
### 2.2 Hero (`landing-hero.tsx`)
### 2.3 Features (`landing-features.tsx`)
### 2.4 Workflow (`landing-workflow.tsx`)
### 2.5 Showcase (`landing-showcase.tsx`)
### 2.6 Pricing (`landing-pricing.tsx`)
### 2.7 FAQ (`landing-faq.tsx`)
### 2.8 CTA (`landing-cta.tsx`)
### 2.9 Footer (`landing-footer.tsx`)

---

## Phase 3 — Assemblage

### 3.1 `landing-page-view.tsx`
### 3.2 `app/page.tsx`

---

## Phase 4 — Build

---

## Tokens DS_LP V3

```
DS_LP_MAX_W → "max-w-6xl mx-auto"
DS_LP_SECTION → "py-24 px-4 sm:px-6 bg-[var(--lp-bg)]"
DS_LP_SECTION_ALT → "py-24 px-4 sm:px-6 bg-[#111113]"
DS_LP_HEADER → "text-center mb-16"
DS_LP_TITLE → "text-4xl sm:text-5xl font-bold tracking-tight text-[var(--lp-text)]"
DS_LP_ACCENT → "w-12 h-1 bg-[var(--lp-accent)] rounded-full mt-6 mx-auto"
DS_LP_TAG → "inline-block font-mono text-[11px] font-semibold uppercase tracking-widest text-[var(--lp-accent)] mb-4"
DS_LP_NAV → "fixed top-0 left-0 right-0 z-50 flex justify-center pt-3"
DS_LP_NAV_INNER → "flex items-center justify-between h-12 px-5 w-[calc(100%-2rem)] max-w-5xl rounded-xl bg-[var(--lp-glass)] backdrop-blur-xl border border-[var(--lp-glass-border)]"
DS_LP_NAV_LINK → "text-sm text-zinc-400 hover:text-white transition-colors"
DS_LP_NAV_CTA → "inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[var(--lp-accent)] text-white text-sm font-medium hover:opacity-90 transition-all"
DS_LP_HERO → "relative min-h-screen flex items-center justify-center px-4 pt-20 bg-[var(--lp-gradient-hero)]"
DS_LP_HERO_TITLE → "text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent"
DS_LP_HERO_DESC → "mt-4 text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
DS_LP_HERO_CTA → "mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
DS_LP_STATS → "mt-16 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
DS_LP_STAT_CARD → "bg-[var(--lp-card)] border border-[var(--lp-border)] rounded-xl p-5 text-center"
DS_LP_STAT_VAL → "text-3xl font-bold text-white tabular-nums"
DS_LP_STAT_LBL → "text-xs text-zinc-500 mt-1"
DS_LP_GRID_2 → "grid sm:grid-cols-2 gap-4"
DS_LP_GRID_3 → "grid md:grid-cols-3 gap-4"
DS_LP_CARD → "bg-[var(--lp-card)] border border-[var(--lp-border)] rounded-xl p-6 hover:border-zinc-600 transition-colors"
DS_LP_CARD_ICON → "w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4"
DS_LP_CARD_TITLE → "text-lg font-semibold text-white mb-1"
DS_LP_CARD_DESC → "text-sm text-zinc-400 leading-relaxed"
DS_LP_CARD_TAG → "text-[11px] font-mono font-semibold uppercase tracking-widest text-[var(--lp-accent)] mb-2"
DS_LP_PIPELINE → "flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12"
DS_LP_PIPELINE_STEP → "flex flex-col items-center gap-3 text-center"
DS_LP_PIPELINE_NUM → "flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[var(--lp-accent)] text-sm font-bold font-mono"
DS_LP_PIPELINE_ICON → "w-14 h-14 rounded-xl bg-[var(--lp-card)] border border-[var(--lp-border)] flex items-center justify-center"
DS_LP_PIPELINE_TITLE → "text-base font-semibold text-white"
DS_LP_PIPELINE_DESC → "text-sm text-zinc-500"
DS_LP_SHOWCASE → "bg-[var(--lp-card)] border border-[var(--lp-border)] rounded-xl overflow-hidden"
DS_LP_SHOWCASE_HEADER → "flex items-center gap-2 px-4 py-3 bg-[#121214] border-b border-[var(--lp-border)]"
DS_LP_SHOWCASE_DOT → "w-2.5 h-2.5 rounded-full bg-zinc-700"
DS_LP_SHOWCASE_BADGE → "text-[10px] font-mono font-semibold uppercase tracking-widest text-[var(--lp-accent)] ml-auto"
DS_LP_PRICE_CARD → "bg-[var(--lp-card)] border border-[var(--lp-border)] rounded-xl p-6 flex flex-col relative"
DS_LP_PRICE_POP → "border-[var(--lp-accent)] shadow-[0_0_20px_var(--lp-accent-glow)]"
DS_LP_PRICE_BADGE → "absolute -top-3 right-4 px-3 py-1 rounded-lg bg-[var(--lp-accent)] text-white text-[10px] font-mono font-semibold uppercase tracking-widest"
DS_LP_PRICE_NAME → "text-lg font-semibold text-white"
DS_LP_PRICE_AMT → "text-4xl font-bold text-white mt-2"
DS_LP_PRICE_PER → "text-sm text-zinc-500 font-normal"
DS_LP_PRICE_DESC → "text-sm text-zinc-400 mt-1"
DS_LP_PRICE_FEAT → "space-y-3 my-6 flex-1"
DS_LP_PRICE_FEAT_ITEM → "flex items-start gap-2 text-sm text-zinc-400"
DS_LP_PRICE_CHECK → "text-[var(--lp-accent)] mt-0.5 shrink-0"
DS_LP_PRICE_CTA → "w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all"
DS_LP_PRICE_CTA_PRI → "bg-[var(--lp-accent)] text-white hover:opacity-90"
DS_LP_PRICE_CTA_SEC → "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
DS_LP_FAQ_ITEM → "bg-[var(--lp-card)] border border-[var(--lp-border)] rounded-xl overflow-hidden"
DS_LP_FAQ_Q → "flex items-center justify-between gap-4 px-6 py-4 text-sm font-medium text-white list-none cursor-pointer"
DS_LP_FAQ_ARR → "text-zinc-500 group-open:rotate-90 transition-transform shrink-0"
DS_LP_FAQ_A → "px-6 pb-4 text-sm text-zinc-400 leading-relaxed"
DS_LP_FAQ_REF → "text-[10px] font-mono font-semibold tracking-widest text-[var(--lp-accent)]"
DS_LP_CTA → "py-24 px-4 sm:px-6 bg-gradient-to-b from-[var(--lp-bg)] to-[#111113]"
DS_LP_FINAL → "max-w-3xl mx-auto text-center space-y-6"
DS_LP_FINAL_TITLE → "text-4xl sm:text-5xl font-bold tracking-tight text-white"
DS_LP_FINAL_DESC → "text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed"
DS_LP_FINAL_BTNS → "flex flex-col sm:flex-row items-center justify-center gap-4"
DS_LP_FINAL_BTN_PRI → "inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-zinc-900 font-medium text-sm hover:bg-zinc-100 transition-all"
DS_LP_FINAL_BTN_SEC → "inline-flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-sm text-zinc-400 border border-zinc-800 hover:text-white transition-all"
DS_LP_FOOTER → "py-16 px-4 sm:px-6 border-t border-[var(--lp-border)] bg-[var(--lp-bg)]"
DS_LP_FOOTER_GRID → "grid grid-cols-2 md:grid-cols-4 gap-8"
DS_LP_FOOTER_BRAND → "flex items-center gap-2.5 mb-4"
DS_LP_FOOTER_LOGO → "w-7 h-7 rounded-lg bg-[var(--lp-accent)] flex items-center justify-center"
DS_LP_FOOTER_NAME → "text-sm font-semibold text-white"
DS_LP_FOOTER_DESC → "text-xs text-zinc-500 leading-relaxed max-w-xs"
DS_LP_FOOTER_TITRE → "text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-600 mb-4"
DS_LP_FOOTER_LIEN → "text-xs text-zinc-400 hover:text-white transition-colors"
DS_LP_FOOTER_BASE → "mt-12 pt-8 border-t border-[var(--lp-border)] flex flex-col sm:flex-row items-center justify-between gap-4"
DS_LP_FOOTER_COPY → "text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-600"
DS_LP_FOOTER_STATUS → "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--lp-glass)] border border-[var(--lp-glass-border)]"
DS_LP_FOOTER_STATUS_DOT → "w-1.5 h-1.5 rounded-full bg-emerald-500"
DS_LP_FOOTER_STATUS_TXT → "text-[9px] font-mono font-semibold uppercase tracking-widest text-zinc-500"
```

---

## Checklist

- [ ] Phase 0 — Destruction des fichiers anciens
- [ ] Phase 1 — CSS globals + tokens design-system
- [ ] Phase 2.1 — Nav
- [ ] Phase 2.2 — Hero
- [ ] Phase 2.3 — Features
- [ ] Phase 2.4 — Workflow
- [ ] Phase 2.5 — Showcase
- [ ] Phase 2.6 — Pricing
- [ ] Phase 2.7 — FAQ
- [ ] Phase 2.8 — CTA
- [ ] Phase 2.9 — Footer
- [ ] Phase 3 — Assemblage dans landing-page-view.tsx
- [ ] Phase 4 — Build & vérification