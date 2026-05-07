// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM — Référentiel Bento unique (source de vérité)
// Toutes les sections UI doivent consommer ces tokens exclusivement.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Typographie ─────────────────────────────────────────────────────────────
export const DS_MICRO = "text-[9px] uppercase font-bold tracking-tighter";
export const DS_LABEL =
  "text-[10px] uppercase font-bold tracking-wider text-slate-400";
export const DS_MONO = "font-mono text-[11px] tabular-nums leading-none";

// ─── Surfaces ────────────────────────────────────────────────────────────────
export const DS_CARD = "bg-white border border-slate-100";
export const DS_INPUT =
  "bg-slate-100/50 border-0 border-b border-slate-200 focus:border-indigo-400 focus:bg-white focus:ring-0 transition-all";
export const DS_BUTTON =
  "flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[9px] font-bold uppercase tracking-wider transition-all";

export const DS_BUTTON_SECONDARY =
  "flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[9px] font-bold uppercase tracking-wider transition-all";

// ─── BentoCard wrapper ──────────────────────────────────────────────────────
export const DS_BENTO_CARD = "bg-white border border-slate-200 rounded p-4";

// ─── Section Header ─────────────────────────────────────────────────────────
// Usage: <div className={DS_SECTION_HEADER}> <div className={DS_ICON_WRAPPER}> ...
export const DS_SECTION_HEADER = "flex items-center justify-between mb-4";
export const DS_ICON_WRAPPER =
  "w-6 h-6 rounded flex items-center justify-center";
export const DS_SECTION_TITLE =
  "text-[9px] uppercase font-bold tracking-tighter text-slate-600";

// ─── Badges ─────────────────────────────────────────────────────────────────
export const DS_BADGE_ACTIVE =
  "px-1.5 py-0.5 rounded text-[8px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200";
export const DS_BADGE_SUCCESS =
  "px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200";
export const DS_BADGE_WARNING =
  "px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-50 text-amber-600 border border-amber-200";
export const DS_BADGE_DANGER =
  "px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-50 text-rose-600 border border-rose-200";

// ─── Telemetry (sidebar info blocks) ────────────────────────────────────────
export const DS_TEL_BLOCK =
  "p-2 bg-slate-50/80 rounded border border-slate-100";

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

// ─── Objet legacy (compat avec les fichiers existants) ──────────────────────
export const DS = {
  micro: DS_MICRO,
  label: DS_LABEL,
  mono: DS_MONO,
  card: DS_CARD,
  input: DS_INPUT,
  button: DS_BUTTON,
} as const;
