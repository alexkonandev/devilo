"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  DS_MICRO,
  DS_LABEL,
  DS_ICON_WRAPPER,
  DS_BUTTON,
} from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE SHELL — Grammaire structurelle commune (Dashboard, Devis, Clients, Catalogue)
//
// Structure : [telemetry optionnel] + grille 12 cols [left | main | detail]
// Pas de header redondant — la topbar du layout principal s'en charge déjà.
// ═══════════════════════════════════════════════════════════════════════════════

export interface PageShellProps {
  // ─── Colonnes ────────────────────────────────────────────────────────────
  /** Colonne gauche — contexte, filtres Bento */
  left?: React.ReactNode;
  /** Colonne centrale — contenu principal */
  main: React.ReactNode;
  /** Colonne droite — détail / éditeur inline */
  detail?: React.ReactNode;

  // ─── Largeurs optionnelles ───────────────────────────────────────────────
  leftCols?: string;
  mainCols?: string;
  detailCols?: string;

  /** Bande KPI/Telemetry en haut (optionnel) */
  telemetry?: React.ReactNode;
}

export function PageShell({
  left,
  main,
  detail,
  leftCols = "col-span-2",
  mainCols,
  detailCols = "col-span-4",
  telemetry,
}: PageShellProps) {
  const hasLeft = Boolean(left);
  const hasDetail = Boolean(detail);

  const computedMainCols =
    mainCols ??
    (() => {
      if (hasLeft && hasDetail) return "col-span-6";
      if (hasLeft && !hasDetail) return "col-span-10";
      if (!hasLeft && hasDetail) return "col-span-8";
      return "col-span-12";
    })();

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* ═══ BANDE TÉLÉMÉTRIE (optionnelle) ═══ */}
      {telemetry && (
        <div className="shrink-0 border-b border-slate-100">{telemetry}</div>
      )}

      {/* ═══ GRILLE 12 COLS ═══ */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {hasLeft && (
          <div
            className={cn(
              leftCols,
              "border-r border-slate-100 overflow-hidden",
            )}
          >
            {left}
          </div>
        )}

        <div className={cn(computedMainCols, "overflow-hidden")}>{main}</div>

        {hasDetail && (
          <div
            className={cn(
              detailCols,
              "border-l border-slate-100 overflow-hidden",
            )}
          >
            {detail}
          </div>
        )}
      </div>
    </div>
  );
}

export { DS_MICRO, DS_LABEL, DS_ICON_WRAPPER, DS_BUTTON };
