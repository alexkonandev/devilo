// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM — Référentiel Bento unique (source de vérité)
// Style: Swift-Bento — bordures 1px, pas d'ombres, padding 1.5rem, typo monotone
// Toutes les sections UI doivent consommer ces tokens exclusivement.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Typographie ─────────────────────────────────────────────────────────────
// Règle : font-mono réservé aux chiffres (montants, numéros, codes).
// Les labels, titres, descriptions et textes courants sont en font-sans.
export const DS_LABEL =
  "font-sans text-[9px] uppercase tracking-wide text-slate-600 font-semibold";
export const DS_MICRO = DS_LABEL; // alias — sera supprimé progressivement
export const DS_MONO = "font-mono text-[11px] tabular-nums leading-snug";
export const DS_TITLE = "font-sans text-normal uppercase tracking-tight text-slate-900";
export const DS_H2 = "font-sans text-base uppercase tracking-tight text-slate-900";
export const DS_BODY = "font-sans text-sm text-slate-600 leading-relaxed";

// ─── Surfaces ────────────────────────────────────────────────────────────────
export const DS_CARD = "bg-white border border-slate-200 rounded-md";
export const DS_INPUT =
  "bg-white border border-slate-200 px-3 py-2 font-sans text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all";
export const DS_BUTTON =
  "flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-sans text-[10px] uppercase tracking-wide transition-all";

export const DS_BUTTON_SECONDARY =
  "flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md font-sans text-[10px] uppercase tracking-wide transition-all";

// ─── BentoCard wrapper — Swift-Bento style ──────────────────────────────────
// Padding constant 1rem (16px), bordure 1px gris clair, pas d'ombres
export const DS_BENTO_CARD = "bg-white border border-slate-200 rounded-md p-4";

// ─── Section Header ─────────────────────────────────────────────────────────
// Usage: <div className={DS_SECTION_HEADER}> <div className={DS_ICON_WRAPPER}> ...
export const DS_SECTION_HEADER = "flex items-center justify-between mb-4";
export const DS_ICON_WRAPPER =
  "w-6 h-6 rounded-md flex items-center justify-center";
export const DS_SECTION_TITLE =
  "text-[9px] uppercase font-bold tracking-tighter text-slate-600";

// ─── Badges ─────────────────────────────────────────────────────────────────
export const DS_BADGE_ACTIVE =
  "px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200";
export const DS_BADGE_SUCCESS =
  "px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200";
export const DS_BADGE_WARNING =
  "px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-amber-50 text-amber-600 border border-amber-200";
export const DS_BADGE_DANGER =
  "px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-rose-50 text-rose-600 border border-rose-200";
export const DS_BADGE_NEUTRAL =
  "px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-slate-50 text-slate-600 border border-slate-200";
export const DS_BADGE_CANCELLED =
  "px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-slate-100 text-slate-400 border border-slate-300 line-through";

// ─── Rounded — token d'arrondi unique pour inputs/surfaces ────────────────
export const DS_ROUNDED = "rounded-md";

// ─── Telemetry (sidebar info blocks) ────────────────────────────────────────
export const DS_TEL_BLOCK =
  "p-2 bg-slate-50 rounded-md border border-slate-200";

// ─── Progress / Gauge ───────────────────────────────────────────────────────
export const DS_PROGRESS_TRACK =
  "h-1.5 bg-slate-100 rounded-full overflow-hidden";
export const DS_PROGRESS_BAR = "h-full rounded-full transition-all";

// ─── Icônes ─────────────────────────────────────────────────────────────────
export const DS_ICON_SM = 12; // taille standard dans les headers/labels
export const DS_ICON_XS = 10; // taille check/x inline

// ─── Espacements récurrents ─────────────────────────────────────────────────
export const DS_GAP_GRID = "gap-4"; // grille principale
export const DS_GAP_ITEMS = "gap-2"; // items dans un groupe
export const DS_GAP_SECTIONS = "space-y-6"; // entre blocs de formulaire
export const DS_MB_SECTION_TITLE = "mb-4"; // sous le header

// ─── Layout (extrait de spatial-settings-view.tsx) ──────────────────────────
// Zone de contenu scrollable (= <main> dans Settings, = root dans pages sans sidebar)
export const DS_PAGE_SHELL = "h-full overflow-y-auto bg-slate-50";
export const DS_PAGE_PADDING = "p-4";
export const DS_PAGE_CONTAINER = "max-w-6xl mx-auto";
export const DS_PAGE_GRID = "grid grid-cols-12 gap-4";

// ─── Landing Page V3 — Obsidian (Dark + Glass Premium) ─────────────────────
// Refonte totale. Style dark premium avec verre dépoli.
// Palette : fond #0a0a0b, cards #18181b, accent indigo #4f46e5.

// Layout
export const DS_LP_MAX_W = "max-w-6xl mx-auto";
export const DS_LP_SECTION = "py-24 px-4 sm:px-6 bg-[var(--lp-bg)]";
export const DS_LP_SECTION_ALT = "py-24 px-4 sm:px-6 bg-[#111113]";
export const DS_LP_HEADER = "text-center mb-16";
export const DS_LP_TITLE = "text-4xl sm:text-5xl font-bold tracking-tight text-[var(--lp-text)]";
export const DS_LP_ACCENT = "w-12 h-1 bg-[var(--lp-accent)] rounded-full mt-6 mx-auto";
export const DS_LP_TAG = "inline-block font-mono text-[11px] font-semibold uppercase tracking-widest text-[var(--lp-accent)] mb-4";

// Navigation (glass)
export const DS_LP_NAV = "fixed top-0 left-0 right-0 z-50 flex justify-center pt-8";
export const DS_LP_NAV_INNER = "flex items-center justify-between px-3 py-3 w-[calc(100%-4rem)] max-w-6xl rounded-xl bg-black/80 backdrop-blur-md border border-[var(--lp-glass-border)]";
export const DS_LP_NAV_LINK = "text-sm text-zinc-300 hover:text-white transition-colors";
export const DS_LP_NAV_CTA = "inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white border border-zinc-700 text-zinc-900 hover:border-zinc-500 hover:text-zinc-700 text-sm font-medium hover:opacity-90 transition-all";

// Hero
export const DS_LP_HERO = "relative min-h-screen flex items-center justify-center px-4 pt-20 bg-[var(--lp-gradient-hero)]";
export const DS_LP_HERO_TITLE = "text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent";
export const DS_LP_HERO_DESC = "mt-4 text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed";
export const DS_LP_HERO_CTA = "mt-10 flex flex-col sm:flex-row items-center justify-center gap-4";

// Stats (KPI cards)
export const DS_LP_STATS = "mt-16 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto";
export const DS_LP_STAT_CARD = "bg-[var(--lp-card)] border border-[var(--lp-border)] rounded-xl p-5 text-center";
export const DS_LP_STAT_VAL = "text-3xl font-bold text-white tabular-nums";
export const DS_LP_STAT_LBL = "text-xs text-zinc-500 mt-1";

// Grids
export const DS_LP_GRID_2 = "grid sm:grid-cols-2 gap-4";
export const DS_LP_GRID_3 = "grid md:grid-cols-3 gap-4";

// Cards (features, etc.)
export const DS_LP_CARD = "bg-[var(--lp-card)] border border-[var(--lp-border)] rounded-xl p-6 hover:border-zinc-600 transition-colors";
export const DS_LP_CARD_ICON = "w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4";
export const DS_LP_CARD_TITLE = "text-lg font-semibold text-white mb-1";
export const DS_LP_CARD_DESC = "text-sm text-zinc-400 leading-relaxed";
export const DS_LP_CARD_TAG = "text-[11px] font-mono font-semibold uppercase tracking-widest text-[var(--lp-accent)] mb-2";

// Pipeline / Workflow
export const DS_LP_PIPELINE = "flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12";
export const DS_LP_PIPELINE_STEP = "flex flex-col items-center gap-3 text-center";
export const DS_LP_PIPELINE_NUM = "flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[var(--lp-accent)] text-sm font-bold font-mono";
export const DS_LP_PIPELINE_ICON = "w-14 h-14 rounded-xl bg-[var(--lp-card)] border border-[var(--lp-border)] flex items-center justify-center";
export const DS_LP_PIPELINE_TITLE = "text-base font-semibold text-white";
export const DS_LP_PIPELINE_DESC = "text-sm text-zinc-500";

// Showcase (démo produit)
export const DS_LP_SHOWCASE = "bg-[var(--lp-card)] border border-[var(--lp-border)] rounded-xl overflow-hidden";
export const DS_LP_SHOWCASE_HEADER = "flex items-center gap-2 px-4 py-3 bg-[#121214] border-b border-[var(--lp-border)]";
export const DS_LP_SHOWCASE_DOT = "w-2.5 h-2.5 rounded-full bg-zinc-700";
export const DS_LP_SHOWCASE_BADGE = "text-[10px] font-mono font-semibold uppercase tracking-widest text-[var(--lp-accent)] ml-auto";

// Pricing
export const DS_LP_PRICE_CARD = "bg-[var(--lp-card)] border border-[var(--lp-border)] rounded-xl p-6 flex flex-col relative";
export const DS_LP_PRICE_POP = "border-[var(--lp-accent)] shadow-[0_0_20px_var(--lp-accent-glow)]";
export const DS_LP_PRICE_BADGE = "absolute -top-3 right-4 px-3 py-1 rounded-lg bg-[var(--lp-accent)] text-white text-[10px] font-mono font-semibold uppercase tracking-widest";
export const DS_LP_PRICE_NAME = "text-lg font-semibold text-white";
export const DS_LP_PRICE_AMT = "text-4xl font-bold text-white mt-2";
export const DS_LP_PRICE_PER = "text-sm text-zinc-500 font-normal";
export const DS_LP_PRICE_DESC = "text-sm text-zinc-400 mt-1";
export const DS_LP_PRICE_FEAT = "space-y-3 my-6 flex-1";
export const DS_LP_PRICE_FEAT_ITEM = "flex items-start gap-2 text-sm text-zinc-400";
export const DS_LP_PRICE_CHECK = "text-[var(--lp-accent)] mt-0.5 shrink-0";
export const DS_LP_PRICE_CTA = "w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all";
export const DS_LP_PRICE_CTA_PRI = "bg-[var(--lp-accent)] text-white hover:opacity-90";
export const DS_LP_PRICE_CTA_SEC = "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white";

// FAQ
export const DS_LP_FAQ_ITEM = "bg-[var(--lp-card)] border border-[var(--lp-border)] rounded-xl overflow-hidden";
export const DS_LP_FAQ_Q = "flex items-center justify-between gap-4 px-6 py-4 text-sm font-medium text-white list-none cursor-pointer";
export const DS_LP_FAQ_ARR = "text-zinc-500 group-open:rotate-90 transition-transform shrink-0";
export const DS_LP_FAQ_A = "px-6 pb-4 text-sm text-zinc-400 leading-relaxed";
export const DS_LP_FAQ_REF = "text-[10px] font-mono font-semibold tracking-widest text-[var(--lp-accent)]";

// Final CTA
export const DS_LP_CTA = "py-24 px-4 sm:px-6 bg-gradient-to-b from-[var(--lp-bg)] to-[#111113]";
export const DS_LP_FINAL = "max-w-3xl mx-auto text-center space-y-6";
export const DS_LP_FINAL_TITLE = "text-4xl sm:text-5xl font-bold tracking-tight text-white";
export const DS_LP_FINAL_DESC = "text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed";
export const DS_LP_FINAL_BTNS = "flex flex-col sm:flex-row items-center justify-center gap-4";
export const DS_LP_FINAL_BTN_PRI = "inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-zinc-900 font-medium text-sm hover:bg-zinc-100 transition-all";
export const DS_LP_FINAL_BTN_SEC = "inline-flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-sm text-zinc-400 border border-zinc-800 hover:text-white transition-all";

// Footer
export const DS_LP_FOOTER = "py-16 px-4 sm:px-6 border-t border-[var(--lp-border)] bg-[var(--lp-bg)]";
export const DS_LP_FOOTER_GRID = "grid grid-cols-2 md:grid-cols-4 gap-8";
export const DS_LP_FOOTER_BRAND = "flex items-center gap-2.5 mb-4";
export const DS_LP_FOOTER_LOGO = "w-7 h-7 rounded-lg bg-[var(--lp-accent)] flex items-center justify-center";
export const DS_LP_FOOTER_NAME = "text-sm font-semibold text-white";
export const DS_LP_FOOTER_DESC = "text-xs text-zinc-500 leading-relaxed max-w-xs";
export const DS_LP_FOOTER_TITRE = "text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-600 mb-4";
export const DS_LP_FOOTER_LIEN = "text-xs text-zinc-400 hover:text-white transition-colors";
export const DS_LP_FOOTER_BASE = "mt-12 pt-8 border-t border-[var(--lp-border)] flex flex-col sm:flex-row items-center justify-center gap-4";
export const DS_LP_FOOTER_COPY = "text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-600";
export const DS_LP_FOOTER_STATUS = "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--lp-glass)] border border-[var(--lp-glass-border)]";
export const DS_LP_FOOTER_STATUS_DOT = "w-1.5 h-1.5 rounded-full bg-emerald-500";
export const DS_LP_FOOTER_STATUS_TXT = "text-[9px] font-mono font-semibold uppercase tracking-widest text-zinc-500";

// ═══════════════════════════════════════════════════════════════════════════════
// RÉGIME STUDIO — Tokens compacts pour l'éditeur de devis (quotes/new)
// Dialecte officiel du design system, distinct du régime Dashboard.
// Voir DESIGN_SYSTEM.md §10 pour la documentation complète.
// ═══════════════════════════════════════════════════════════════════════════════

export const STUDIO_CARD =
  "bg-white border border-slate-200 rounded-md p-3";
export const STUDIO_TAB_ACTIVE =
  "bg-white text-slate-900 border border-slate-200";
export const STUDIO_TAB_INACTIVE =
  "text-slate-500 hover:text-slate-800";
export const STUDIO_INPUT =
  "w-full bg-white border border-slate-200 px-2.5 py-1.5 font-sans text-[10px] text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all";
export const STUDIO_LABEL =
  "text-[8px] font-sans uppercase tracking-wider text-slate-600 mb-1 block";
export const STUDIO_MONO =
  "text-[10px] font-mono tabular-nums leading-snug";
export const STUDIO_ICON_SM = 12;
export const STUDIO_ICON_XS = 10;

// ─── Étiquette ultra-compacte dans les headers / topbars ───────────────────
// Usage: dans les boutons de l'éditeur où l'espace est critique (7px)
export const STUDIO_HEADER_LABEL =
  "text-[7px] font-sans uppercase tracking-wider font-semibold leading-none";
export const STUDIO_HEADER_BTN =
  "inline-flex items-center justify-center gap-1 h-7 px-2.5 rounded-md transition-all";
export const STUDIO_HEADER_BTN_SM =
  "inline-flex items-center justify-center h-7 w-7 rounded-md transition-all";

// ═══════════════════════════════════════════════════════════════════════════════
// RÉGIME STUDIO V2 — Dashboard refonte (inspiré page export)
// Cartes border-2 rounded-xl, header fixe, hover states
// ═══════════════════════════════════════════════════════════════════════════════

export const STUDIO_V2_CARD =
  "bg-white border border-slate-200 rounded-xl p-3.5 hover:border-slate-300 transition-all duration-200";
export const STUDIO_V2_CARD_SELECTED =
  "border-indigo-500 bg-indigo-50/60 shadow-sm shadow-indigo-100 ring-1 ring-indigo-200";
export const STUDIO_V2_HEADER =
  "flex items-center h-12 px-3 border-b border-slate-200 bg-white shrink-0 gap-2";
export const STUDIO_V2_HEADER_TITLE =
  "text-[10px] font-sans font-bold text-slate-800 tracking-tight";
export const STUDIO_V2_BTN =
  "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-sans font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all";
export const STUDIO_V2_BTN_PRIMARY =
  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-sans font-bold bg-indigo-600 text-white border border-indigo-600 hover:bg-indigo-700 transition-all";
export const STUDIO_V2_BADGE =
  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[6px] font-sans font-bold uppercase tracking-wider";
export const STUDIO_V2_KPI_CARD =
  "bg-white border-2 border-slate-200 rounded-xl p-3 hover:border-slate-300 transition-all duration-200";
export const STUDIO_V2_ICON_WRAP =
  "w-8 h-8 rounded-xl flex items-center justify-center";

// ─── Objet legacy (compat avec les fichiers existants) ──────────────────────
export const DS = {
  label: DS_LABEL,
  mono: DS_MONO,
  card: DS_CARD,
  input: DS_INPUT,
  button: DS_BUTTON,
} as const;