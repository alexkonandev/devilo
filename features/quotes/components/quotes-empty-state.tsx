"use client";

import React from "react";
import { FileText, RocketLaunch } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { DS_MONO, STUDIO_V2_CARD } from "@/lib/design-system";
import { BTN_PRIMARY } from "@/components/shared/ui/constants";

interface QuotesEmptyStateProps {
  variant: "totallyEmpty" | "searchEmpty" | "filterEmpty";
  onResetFilters?: () => void;
  onResetSearch?: () => void;
  setSearchQuery?: (q: string) => void;
  onAddClient?: () => void;
}

export function QuotesEmptyState({
  variant,
  setSearchQuery,
  onAddClient,
}: QuotesEmptyStateProps) {
  if (variant === "totallyEmpty") {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div
          className={cn(
            STUDIO_V2_CARD,
            "flex flex-col items-center text-center py-12 px-8 max-w-md w-full"
          )}
        >
          <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-5">
            <RocketLaunch size={28} weight="bold" className="text-indigo-600" />
          </div>
          <p className={cn(DS_MONO, "text-sm font-bold text-slate-900")}>
            Aucun devis pour le moment
          </p>
          <p
            className={cn(
              DS_MONO,
              "text-[11px] text-slate-400 mt-2 leading-relaxed max-w-sm"
            )}
          >
            Creer votre premier devis pour commencer a suivre votre activite
            commerciale.
          </p>
          <button onClick={onAddClient} className={cn(BTN_PRIMARY, "mt-6")}>
            <FileText size={12} weight="bold" />
            Creer un devis
          </button>
        </div>
      </div>
    );
  }

  if (variant === "searchEmpty") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-slate-200 rounded-md">
        <span className="text-4xl text-slate-200">🔍</span>
        <p className={cn(DS_MONO, "text-slate-400")}>
          Aucun devis ne correspond a votre recherche
        </p>
        <p
          className={cn(
            DS_MONO,
            "text-[10px] text-slate-300 max-w-[250px] text-center"
          )}
        >
          Essayez de modifier vos filtres ou votre recherche
        </p>
        <button
          onClick={() => setSearchQuery?.("")}
          className={cn(BTN_PRIMARY, "mt-2")}
        >
          Reinitialiser les filtres
        </button>
      </div>
    );
  }

  // filterEmpty
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-slate-200 rounded-md">
      <span className="text-4xl text-slate-200">📅</span>
      <p className={cn(DS_MONO, "text-slate-400")}>
        Aucun devis dans cette periode
      </p>
      <p
        className={cn(
          DS_MONO,
          "text-[10px] text-slate-300 max-w-[250px] text-center"
        )}
      >
        Essayez de modifier vos filtres
      </p>
    </div>
  );
}
