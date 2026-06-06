"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DS_LABEL, DS_MONO } from "@/lib/design-system";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlanComparisonRow {
  feature: string;
  free: string;
  pro: string;
}

export interface PlanComparatorProps {
  rows: PlanComparisonRow[];
  isPro?: boolean;
  title?: string;
}

// ─── Data par défaut ─────────────────────────────────────────────────────────

export const DEFAULT_PLAN_COMPARISON: PlanComparisonRow[] = [
  { feature: "Devis", free: "5 max", pro: "Illimités" },
  { feature: "Filigrane", free: "Oui", pro: "Non" },
  { feature: "Export PDF", free: "Standard", pro: "Haute Définition" },
  { feature: "Support", free: "Email", pro: "Prioritaire 24/7" },
  { feature: "Thèmes", free: "Basiques", pro: "Premium inclus" },
  { feature: "Historique", free: "30 jours", pro: "Complet" },
];

// ─── Composant ───────────────────────────────────────────────────────────────

export function PlanComparator({
  rows,
  isPro = false,
  title,
}: PlanComparatorProps) {
  return (
    <div>
      {title && (
        <span className={cn(DS_LABEL, "text-slate-500 mb-2 block")}>
          {title}
        </span>
      )}
      <div className="rounded border border-slate-200 overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-3 bg-slate-50 px-2.5 py-1.5">
          <span className={cn(DS_LABEL, "text-slate-400")}>
            Fonctionnalité
          </span>
          <span className={cn(DS_LABEL, "text-slate-400 text-center")}>
            Free
          </span>
          <span className={cn(DS_LABEL, "text-indigo-500 text-center")}>
            Pro
          </span>
        </div>

        {/* Data rows */}
        {rows.map((row) => (
          <div
            key={row.feature}
            className="grid grid-cols-3 px-2.5 py-1.5 border-t border-slate-50 hover:bg-slate-50/50 transition-colors"
          >
            <span className="text-[10px] font-medium text-slate-600">
              {row.feature}
            </span>
            <span
              className={cn(
                DS_MONO,
                "text-center",
                isPro ? "text-slate-300 line-through" : "text-slate-500",
              )}
            >
              {row.free}
            </span>
            <span
              className={cn(
                DS_MONO,
                "text-center font-bold",
                isPro ? "text-emerald-600" : "text-indigo-600",
              )}
            >
              {row.pro}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}