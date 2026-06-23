"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  DS_TITLE,
  DS_LABEL,
  DS_ICON_WRAPPER,
  DS_MICRO,
} from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG HEADER — Header premium pour les pages de configuration & billing
//
// Style :
//   • Carte bento discrète avec une barre d'accent colorée à gauche
//   • Titre en DS_TITLE + description contextuelle en DS_LABEL
//   • Badge de catégorie avec icône (ex: "Identité", "Abonnement")
//   • Slot actions en extrémité droite
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConfigHeaderProps {
  /** Titre principal de la page */
  title: string;
  /** Description (sous le titre) */
  description: string;
  /** Icône / catégorie (ex: "Paramètres", "Facturation") */
  category: {
    icon: React.ElementType;
    label: string;
  };
  /** Badge optionnel (statut, plan, etc.) */
  badge?: React.ReactNode;
  /** Slot actions */
  actions?: React.ReactNode;
  /** Couleur d'accent (ex: "indigo", "violet", "emerald") — définit la barre latérale */
  accent?: "indigo" | "violet" | "emerald" | "slate";
  /** Classes additionnelles */
  className?: string;
}

const ACCENT_BARS: Record<string, string> = {
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  slate: "bg-slate-500",
};

const ACCENT_ICON_BG: Record<string, string> = {
  indigo: "bg-indigo-50",
  violet: "bg-violet-50",
  emerald: "bg-emerald-50",
  slate: "bg-slate-50",
};

const ACCENT_ICON_COLOR: Record<string, string> = {
  indigo: "text-indigo-500",
  violet: "text-violet-500",
  emerald: "text-emerald-500",
  slate: "text-slate-500",
};

export function ConfigHeader({
  title,
  description,
  category,
  badge,
  actions,
  accent = "indigo",
  className,
}: ConfigHeaderProps) {
  const Icon = category.icon;

  return (
    <div
      className={cn(
        "relative bg-white border border-slate-200 rounded-md overflow-hidden",
        className,
      )}
    >
      {/* Barre d'accent verticale à gauche */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[3px]",
          ACCENT_BARS[accent],
        )}
      />

      <div className="flex items-center justify-between p-3 pl-4">
        {/* Groupe gauche : icône + titre + description */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Icône de catégorie */}
          <div
            className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
              ACCENT_ICON_BG[accent],
            )}
          >
            <Icon
              size={12}
              weight="bold"
              className={ACCENT_ICON_COLOR[accent]}
            />
          </div>

          {/* Titre + meta */}
          <div className="min-w-0">
            {/* Badge catégorie */}
            <div className="flex items-center gap-2">
              <span className={cn(DS_LABEL, "text-slate-400")}>
                {category.label}
              </span>
             
            </div>

            {/* Titre */}
            <h1 className={cn("font-mono text-[13px] uppercase tracking-tight text-slate-900 leading-tight")}>
              {title}
            </h1>

            
          </div>
        </div>

        {/* Groupe droite : actions */}
        {actions && (
          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}