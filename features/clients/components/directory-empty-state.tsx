"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DS_MONO } from "@/lib/design-system";
import { AddressBook, MagnifyingGlass, LetterCircleV } from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════
// DIRECTORY EMPTY STATES — 3 états vides pour le répertoire
// ═══════════════════════════════════════════════════════════════

interface DirectoryEmptyStateProps {
  variant: "empty" | "search" | "letter";
  onReset?: () => void;
  letter?: string | null;
}

export function DirectoryEmptyState({
  variant,
  onReset,
  letter,
}: DirectoryEmptyStateProps) {
  if (variant === "empty") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center">
          <AddressBook size={32} className="text-stone-300" weight="duotone" />
        </div>
        <div className="text-center space-y-1">
          <p className={cn(DS_MONO, "text-stone-400 font-semibold")}>
            Votre répertoire est vide
          </p>
          <p className={cn(DS_MONO, "text-[10px] text-stone-300 max-w-[220px] mx-auto")}>
            Ajoutez votre premier contact pour commencer à constituer votre carnet d'adresses
          </p>
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
            Aucun résultat
          </p>
          <p className={cn(DS_MONO, "text-[10px] text-stone-300 max-w-[220px] mx-auto")}>
            Aucun contact ne correspond à votre recherche
          </p>
          {onReset && (
            <button
              onClick={onReset}
              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-stone-200 rounded-md text-[9px] font-mono font-bold uppercase tracking-wide text-stone-500 hover:bg-stone-50 transition-colors"
            >
              Réinitialiser
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