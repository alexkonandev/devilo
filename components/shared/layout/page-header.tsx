"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DS_LABEL, DS_TITLE } from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE HEADER — Bande titre + actions générique
// ═══════════════════════════════════════════════════════════════════════════════

export interface PageHeaderProps {
  /** Titre principal de la page */
  title: string;
  /** Description optionnelle (sous-titre visible à droite du titre) */
  description?: React.ReactNode;
  /** Slot actions — boutons personnalisés passés en children */
  actions?: React.ReactNode;
  /** Classes additionnelles pour le conteneur */
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-5 py-3 bg-white border border-slate-200 rounded-md",
        className,
      )}
    >
      {/* Groupe gauche : Titre + Description */}
      <div className="flex items-center gap-3 min-w-0">
        <span className={cn(DS_TITLE, "truncate")}>
          {title}
        </span>
        {description && (
          <p
            className={cn(
              DS_LABEL,
              "pl-3 border-l border-slate-100 truncate",
            )}
          >
            {description}
          </p>
        )}
      </div>

      {/* Groupe droite : Actions */}
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}