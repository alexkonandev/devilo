"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DS_LABEL, DS_MONO } from "@/lib/design-system";

/**
 * Section wrapper — Carte discrète avec bordure
 * Extraite de spatial-quotes-view.tsx pour être shared entre pages
 */
export function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
      {/* En-tête de section */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-100 bg-slate-50/50">
        {icon && (
          <span className="text-slate-400 shrink-0">{icon}</span>
        )}
        <span className={cn(DS_LABEL, "text-[10px] text-slate-500 uppercase tracking-wider")}>
          {title}
        </span>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

/**
 * Ligne d'information clé-valeur
 * Extraite de spatial-quotes-view.tsx pour être shared entre pages
 */
export function InfoRow({
  label,
  value,
  children,
  icon,
  mono,
  badge,
}: {
  label: string;
  value?: string | React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  mono?: boolean;
  badge?: React.ReactNode;
}) {
  const displayValue = children ?? value;

  return (
    <div className="flex items-start gap-3">
      {icon && (
        <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={cn(DS_LABEL, "text-[9px] mb-0.5")}>{label}</p>
        {badge ? (
          badge
        ) : (
          <div
            className={cn(
              mono ? DS_MONO : "font-sans text-sm",
              "text-slate-800 leading-snug break-words",
            )}
          >
            {displayValue}
          </div>
        )}
      </div>
    </div>
  );
}