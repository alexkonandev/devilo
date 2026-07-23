"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DS_MONO, STUDIO_V2_CARD } from "@/lib/design-system";
import { BTN_PRIMARY } from "@/components/shared/ui/constants";
import { AddressBook, MagnifyingGlass, UserPlus } from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════
// DIRECTORY EMPTY STATES — 3 etats vides pour le repertoire
// ═══════════════════════════════════════════════════════════════

interface DirectoryEmptyStateProps {
  variant: "empty" | "search" | "letter";
  onReset?: () => void;
  letter?: string | null;
  onAddClient?: () => void;
}

export function DirectoryEmptyState({
  variant,
  onReset,
  letter,
  onAddClient,
}: DirectoryEmptyStateProps) {
  if (variant === "empty") {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className={cn(STUDIO_V2_CARD, "flex flex-col items-center text-center py-12 px-8 max-w-md w-full")}>
          <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-5">
            <AddressBook size={28} weight="bold" className="text-indigo-600" />
          </div>
          <p className={cn(DS_MONO, "text-sm font-bold text-slate-900")}>
            Votre repertoire est vide
          </p>
          <p className={cn(DS_MONO, "text-[11px] text-slate-400 mt-2 leading-relaxed max-w-sm")}>
            Ajoutez votre premier contact pour constituer votre carnet d'adresses.
          </p>
          <button onClick={onAddClient} className={cn(BTN_PRIMARY, "mt-6")}>
            <UserPlus size={12} weight="bold" />
            Ajouter un client
          </button>
        </div>
      </div>
    );
  }

  if (variant === "search") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center">
          <MagnifyingGlass size={32} className="text-stone-300" weight="duotone" />
        </div>
        <div className="text-center space-y-1">
          <p className={cn(DS_MONO, "text-stone-400 font-semibold")}>
            Aucun resultat
          </p>
          <p className={cn(DS_MONO, "text-[10px] text-stone-300 max-w-[220px] mx-auto")}>
            Aucun contact ne correspond a votre recherche
          </p>
          {onReset && (
            <button
              onClick={onReset}
              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wide text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Reinitialiser
            </button>
          )}
        </div>
      </div>
    );
  }

  // letter variant
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center">
        <span className="text-2xl font-bold text-stone-300">
          {letter ?? "?"}
        </span>
      </div>
      <div className="text-center space-y-1">
        <p className={cn(DS_MONO, "text-stone-400 font-semibold")}>
          Aucun contact
        </p>
        <p className={cn(DS_MONO, "text-[10px] text-stone-300 max-w-[220px] mx-auto")}>
          Aucun contact ne commence par la lettre <strong>{letter}</strong>
        </p>
        {onReset && (
          <button
            onClick={onReset}
            className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-stone-200 rounded-md text-[9px] font-mono font-bold uppercase tracking-wide text-stone-500 hover:bg-stone-50 transition-colors"
          >
            Voir tous les contacts
          </button>
        )}
      </div>
    </div>
  );
}