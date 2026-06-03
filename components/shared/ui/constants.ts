// ═══════════════════════════════════════════════════════════════════════════════
// SHARED UI STYLE CONSTANTS — Variantes centralisées pour boutons & badges
// Consomme les tokens du Design System (lib/design-system.ts) comme source de vérité
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Boutons ──────────────────────────────────────────────────────────────────
// Variantes primaire, secondaire, ghost, danger
export const BTN_PRIMARY =
  "flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[10px] font-semibold uppercase tracking-wide transition-all";

export const BTN_SECONDARY =
  "flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-[10px] font-semibold uppercase tracking-wide transition-all";

export const BTN_GHOST =
  "flex items-center gap-1 px-3 py-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-md text-[10px] font-semibold uppercase tracking-wide transition-all";

export const BTN_DANGER =
  "flex items-center gap-1 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-md text-[10px] font-semibold uppercase tracking-wide transition-all";

// ─── Icônes ───────────────────────────────────────────────────────────────────
export const ICON_SM = 12;
export const ICON_XS = 10;