"use client";

import React from "react";
import { FileTextIcon, CalendarBlank, XCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { DS_MONO } from "@/lib/design-system";
import { BTN_SECONDARY } from "@/components/shared/ui/constants";

interface QuotesEmptyStateProps {
  variant: "totallyEmpty" | "searchEmpty" | "filterEmpty";
  onResetFilters?: () => void;
  onResetSearch?: () => void;
  setSearchQuery?: (q: string) => void;
}

export function QuotesEmptyState({ variant, setSearchQuery }: QuotesEmptyStateProps) {
  if (variant === "totallyEmpty") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-slate-200 rounded-md">
        <FileTextIcon size={48} className="text-slate-200" weight="duotone" />
        <p className={cn(DS_MONO, "text-slate-400")}>Aucun devis trouvé</p>
        <p className={cn(DS_MONO, "text-[10px] text-slate-300 max-w-[250px] text-center")}>
          Créez votre premier devis pour commencer
        </p>
      </div>
    );
  }

  if (variant === "searchEmpty") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-slate-200 rounded-md">
        <span className="text-4xl text-slate-200">🔍</span>
        <p className={cn(DS_MONO, "text-slate-400")}>Aucun devis ne correspond à votre recherche</p>
        <p className={cn(DS_MONO, "text-[10px] text-slate-300 max-w-[250px] text-center")}>
          Essayez de modifier vos filtres ou votre recherche
        </p>
        <button onClick={() => setSearchQuery?.("")} className={cn(BTN_SECONDARY, "mt-2 text-[10px]")}>
          <XCircle size={10} weight="bold" /> Réinitialiser les filtres
        </button>
      </div>
    );
  }

  // filterEmpty
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-slate-200 rounded-md">
      <CalendarBlank size={48} className="text-slate-200" weight="duotone" />
      <p className={cn(DS_MONO, "text-slate-400")}>Aucun devis dans cette période</p>
      <p className={cn(DS_MONO, "text-[10px] text-slate-300 max-w-[250px] text-center")}>
        Essayez de modifier vos filtres
      </p>
    </div>
  );
}