// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM — Référentiel Bento unique (source de vérité)
// Style: Swift-Bento — bordures 1px, pas d'ombres, padding 1.5rem, typo monotone
// Toutes les sections UI doivent consommer ces tokens exclusivement.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Typographie ─────────────────────────────────────────────────────────────
export const DS_MICRO = "font-mono text-[10px] uppercase tracking-tight text-slate-500";
export const DS_LABEL =
  "font-mono text-[11px] uppercase tracking-wide text-slate-400";
export const DS_MONO = "font-mono text-[11px] tabular-nums leading-none";
export const DS_TITLE = "font-mono text-xl uppercase tracking-tight text-slate-900";
export const DS_BODY = "font-sans text-sm text-slate-600 leading-relaxed";

// ─── Surfaces ────────────────────────────────────────────────────────────────
export const DS_CARD = "bg-white border border-slate-200 rounded-md";
export const DS_INPUT =
  "bg-white border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all";
export const DS_BUTTON =
  "flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-mono text-[10px] uppercase tracking-wide transition-all";

export const DS_BUTTON_SECONDARY =
  "flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md font-mono text-[10px] uppercase tracking-wide transition-all";

// ─── BentoCard wrapper — Swift-Bento style ──────────────────────────────────
// Padding constant 1.5rem (24px), bordure 1px gris clair, pas d'ombres
export const DS_BENTO_CARD = "bg-white border border-slate-200 rounded-md p-6";

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

// ─── Telemetry (sidebar info blocks) ────────────────────────────────────────
export const DS_TEL_BLOCK =
  "p-2 bg-slate-50/80 rounded-md border border-slate-100";

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

// ─── Landing Page — Swift-Bento style ───────────────────────────────────────
// Bordures 1px, pas d'ombres, padding constant, typo monotone
export const DS_LP_NAV = "fixed top-0 left-0 right-0 z-50";
export const DS_LP_NAV_INNER = "flex items-center justify-between h-16 mt-2 px-6 rounded-md bg-white border border-slate-200";
export const DS_LP_HERO = "relative min-h-screen flex items-center justify-center px-4 pt-20";
export const DS_LP_SECTION = "py-24 px-4 sm:px-6";
export const DS_LP_SECTION_ALT = "py-24 px-4 sm:px-6 bg-slate-50";
export const DS_LP_CTA = "py-24 px-4 sm:px-6 bg-slate-900 text-white";
export const DS_LP_FOOTER = "py-16 px-4 sm:px-6 border-t border-slate-200 bg-white";
export const DS_LP_MAX_W = "max-w-6xl mx-auto";
export const DS_LP_MAX_W_SM = "max-w-5xl mx-auto";
export const DS_LP_MAX_W_MD = "max-w-4xl mx-auto";
export const DS_LP_MAX_W_LG = "max-w-3xl mx-auto";
export const DS_LP_GRID_2 = "grid sm:grid-cols-2 gap-6";
export const DS_LP_GRID_3 = "grid md:grid-cols-3 gap-6";
export const DS_LP_GRID_4 = "grid sm:grid-cols-2 lg:grid-cols-4 gap-6";
export const DS_LP_FEATURES_GRID = "grid sm:grid-cols-2 lg:grid-cols-3 gap-6";
export const DS_LP_HEADER = "text-center mb-12";
export const DS_LP_TITLE = "font-mono text-3xl sm:text-4xl uppercase tracking-tight mt-4";
export const DS_LP_ACCENT = "w-8 h-px bg-slate-900 mt-6 mx-auto";
export const DS_LP_BADGE = "inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-100 border border-slate-200 mb-8";
export const DS_LP_BADGE_TEXT = "font-mono text-[10px] uppercase tracking-wide text-slate-600";
export const DS_LP_HERO_TITLE = "font-mono text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight leading-tight";
export const DS_LP_HERO_DESC = "mt-6 font-sans text-base sm:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed";
export const DS_LP_HERO_CTA = "mt-10 flex flex-col sm:flex-row items-center justify-center gap-4";
export const DS_LP_HERO_STATS = "mt-16 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto";
export const DS_LP_STAT_VAL = "font-mono text-2xl text-slate-900";
export const DS_LP_STAT_LBL = "font-mono text-[10px] uppercase tracking-wide text-slate-400 mt-1";
export const DS_LP_CARD = "p-6";
export const DS_LP_CARD_ICON = "w-10 h-10 rounded-md flex items-center justify-center mb-4";
export const DS_LP_CARD_TITLE = "font-mono text-base uppercase tracking-tight mb-2";
export const DS_LP_CARD_DESC = "font-sans text-sm text-slate-500 leading-relaxed";
export const DS_LP_PRICE_CARD = "p-6 flex flex-col relative";
export const DS_LP_PRICE_POP = "border-slate-900 bg-white";
export const DS_LP_PRICE_BADGE = "absolute top-0 right-0 px-3 py-1 rounded-md bg-slate-900 text-white font-mono text-[9px] uppercase tracking-wide";
export const DS_LP_PRICE_NAME = "font-mono text-lg uppercase tracking-tight";
export const DS_LP_PRICE_AMT = "font-mono text-3xl text-slate-900 mt-2";
export const DS_LP_PRICE_PER = "font-mono text-sm text-slate-400";
export const DS_LP_PRICE_DESC = "font-sans text-sm text-slate-500 leading-relaxed";
export const DS_LP_PRICE_FEAT = "space-y-2 mb-6 flex-1";
export const DS_LP_PRICE_FEAT_ITEM = "flex items-start gap-2 font-sans text-sm text-slate-600";
export const DS_LP_PRICE_CHECK = "text-slate-900 mt-0.5 shrink-0";
export const DS_LP_PRICE_CTA = "w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-mono text-[10px] uppercase tracking-wide transition-all group";
export const DS_LP_PRICE_CTA_PRI = "bg-slate-900 text-white hover:bg-slate-800";
export const DS_LP_PRICE_CTA_SEC = "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50";
export const DS_LP_FAQ_ITEM = "p-6 border border-slate-200 rounded-md bg-white";
export const DS_LP_FAQ_Q = "flex items-center justify-between gap-4 font-mono text-sm uppercase tracking-tight text-slate-800 list-none cursor-pointer";
export const DS_LP_FAQ_ARR = "text-slate-400 group-open:rotate-90 transition-transform shrink-0";
export const DS_LP_FAQ_A = "mt-4 font-sans text-sm text-slate-500 leading-relaxed";
export const DS_LP_FINAL = "relative max-w-3xl mx-auto text-center space-y-6";
export const DS_LP_FINAL_TITLE = "font-mono text-3xl sm:text-4xl uppercase tracking-tight";
export const DS_LP_FINAL_DESC = "mt-4 font-sans text-base text-slate-400 max-w-xl mx-auto leading-relaxed";
export const DS_LP_FINAL_BTNS = "mt-8 flex flex-col sm:flex-row items-center justify-center gap-4";
export const DS_LP_FINAL_BTN_PRI = "inline-flex items-center gap-2 px-8 py-3 rounded-md bg-white text-slate-900 font-mono text-[10px] uppercase tracking-wide hover:bg-slate-100 transition-all group";
export const DS_LP_FINAL_BTN_SEC = "inline-flex items-center gap-2 px-8 py-3 rounded-md font-mono text-[10px] uppercase tracking-wide text-slate-400 hover:text-white transition-all";
export const DS_LP_FOOTER_BRAND = "flex items-center gap-2.5 mb-4";
export const DS_LP_FOOTER_LOGO = "w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center";
export const DS_LP_FOOTER_NAME = "font-mono text-xs uppercase tracking-tight";
export const DS_LP_FOOTER_DESC = "font-sans text-xs text-slate-500 leading-relaxed max-w-xs";
export const DS_LP_FOOTER_TITRE = "font-mono text-[10px] uppercase tracking-wide text-slate-400 mb-4";
export const DS_LP_FOOTER_LIEN = "font-sans text-xs text-slate-600 hover:text-slate-900 transition-colors";
export const DS_LP_FOOTER_BASE = "mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4";
export const DS_LP_FOOTER_COPY = "font-mono text-[10px] text-slate-400 uppercase tracking-wide";
export const DS_LP_FOOTER_TAG = "flex items-center gap-3 text-slate-300";
export const DS_LP_FOOTER_TAG_TXT = "font-mono text-[10px] uppercase tracking-wide";
export const DS_LP_SHOW = "py-24 px-4 sm:px-6 bg-slate-50";
export const DS_LP_SHOW_FRAME = "p-2 border border-slate-200 rounded-md";
export const DS_LP_SHOW_NAV = "flex items-center gap-1.5 px-4 py-3 bg-slate-100 border-b border-slate-200";
export const DS_LP_SHOW_DOT = "w-2 h-2 rounded-full bg-slate-300";
export const DS_LP_SHOW_URL = "ml-3 flex-1 max-w-md h-6 bg-white rounded-sm border border-slate-200 flex items-center px-3";
export const DS_LP_SHOW_URL_TXT = "font-mono text-[9px] text-slate-400";
export const DS_LP_SHOW_CNT = "p-8 md:p-12";
export const DS_LP_SHOW_INNER = "max-w-2xl mx-auto space-y-4";
export const DS_LP_SHOW_HEAD = "flex items-center justify-between pb-6 border-b border-slate-200";
export const DS_LP_SHOW_HEAD_LBL = "font-mono text-[10px] uppercase tracking-wide text-slate-400";
export const DS_LP_SHOW_HEAD_TIT = "font-mono text-xl text-slate-900";
export const DS_LP_SHOW_HEAD_ICO = "w-12 h-12 rounded-md bg-slate-900 flex items-center justify-center";
export const DS_LP_SHOW_ITEMS = "space-y-2";
export const DS_LP_SHOW_ITEM = "flex items-center justify-between py-3 px-4 rounded-md bg-slate-50 border border-slate-100";
export const DS_LP_SHOW_ITEM_NAM = "font-sans text-sm font-medium text-slate-800";
export const DS_LP_SHOW_ITEM_QTY = "font-mono text-[10px] text-slate-400";
export const DS_LP_SHOW_ITEM_PRIX = "font-mono text-sm text-slate-900";
export const DS_LP_SHOW_TOT = "flex items-center justify-between pt-4 border-t border-slate-200";
export const DS_LP_SHOW_TOT_LBL = "font-mono text-[10px] uppercase tracking-wide text-slate-400";
export const DS_LP_SHOW_TOT_VAL = "font-mono text-2xl text-slate-900";
export const DS_LP_SHOW_ACT = "flex gap-2 pt-4";
export const DS_LP_SHOW_ACT_PRI = "flex-1 h-10 rounded-md bg-slate-900 flex items-center justify-center";
export const DS_LP_SHOW_ACT_PRI_TXT = "font-mono text-[9px] uppercase tracking-wide text-white";
export const DS_LP_SHOW_ACT_SEC = "w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center";
export const DS_LP_GRAD_BTN = "relative inline-flex items-center gap-2 px-6 py-3 rounded-md font-mono text-[10px] uppercase tracking-wide text-white bg-slate-900 hover:bg-slate-800 transition-all group";
export const DS_LP_GRAD_BTN_IN = "relative flex items-center gap-2";
export const DS_LP_GRAD_BTN_SHN = "absolute inset-0 rounded-md bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity";
export const DS_LP_OUT_BTN = "inline-flex items-center gap-2 px-6 py-3 rounded-md font-mono text-[10px] uppercase tracking-wide text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all";
export const DS_LP_NAV_LIEN = "font-mono text-[10px] uppercase tracking-wide text-slate-500 hover:text-slate-900 transition-colors";
export const DS_LP_NAV_CONN = "hidden sm:inline-flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] uppercase tracking-wide text-slate-500 hover:text-slate-900 transition-colors";

// ─── Objet legacy (compat avec les fichiers existants) ──────────────────────
export const DS = {
  micro: DS_MICRO,
  label: DS_LABEL,
  mono: DS_MONO,
  card: DS_CARD,
  input: DS_INPUT,
  button: DS_BUTTON,
} as const;
