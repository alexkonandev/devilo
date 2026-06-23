"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { DS_MONO } from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════
// ALPHA NAV — Barre de navigation alphabétique A-Z + Tous
// ═══════════════════════════════════════════════════════════════

const ALPHABET = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
) as string[];

interface AlphaNavProps {
  /** Map lettre → nombre de clients commençant par cette lettre */
  letterCounts: Record<string, number>;
  /** Lettre actuellement sélectionnée (null = "Tous") */
  selectedLetter: string | null;
  /** Callback de sélection */
  onSelectLetter: (letter: string | null) => void;
  /** Nombre total de clients */
  totalCount: number;
}

export function AlphaNav({
  letterCounts,
  selectedLetter,
  onSelectLetter,
  totalCount,
}: AlphaNavProps) {
  const hasAnyClient = totalCount > 0;

  return (
    <nav className="flex flex-col gap-1" aria-label="Navigation alphabétique">
      {/* Bouton "Tous" */}
      <button
        onClick={() => onSelectLetter(null)}
        className={cn(
          "flex items-center justify-between px-3 py-1.5 rounded-md transition-all text-left",
          selectedLetter === null
            ? "bg-teal-100 text-teal-800 font-bold"
            : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800",
          DS_MONO
        )}
        aria-current={selectedLetter === null ? "page" : undefined}
      >
        <span className="text-[10px] uppercase tracking-wide font-semibold">
          Tous
        </span>
        <span className="text-[9px] tabular-nums opacity-60">
          {totalCount}
        </span>
      </button>

      {/* Séparateur */}
      <div className="h-px bg-stone-200 dark:bg-stone-800 mx-2 my-1" />

      {/* Lettres A-Z */}
      <div className="flex flex-col gap-0.5">
        {ALPHABET.map((letter) => {
          const count = letterCounts[letter] ?? 0;
          const isActive = selectedLetter === letter;
          const isDisabled = !hasAnyClient || count === 0;

          return (
            <button
              key={letter}
              onClick={() => {
                if (!isDisabled) onSelectLetter(letter);
              }}
              disabled={isDisabled}
              className={cn(
                "flex items-center justify-between px-3 py-1 rounded-md transition-all text-left",
                isActive
                  ? "bg-teal-100 text-teal-800 font-bold"
                  : isDisabled
                  ? "text-stone-300 dark:text-stone-600 cursor-not-allowed"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800",
                DS_MONO
              )}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Lettre ${letter}${count > 0 ? `, ${count} client${count > 1 ? "s" : ""}` : ", aucun client"}`}
            >
              <span className="text-[11px] font-bold w-5 text-center">
                {letter}
              </span>
              {count > 0 && (
                <span className="text-[9px] tabular-nums opacity-60">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Hook utilitaire pour calculer les compteurs par lettre
 */
export function useLetterCounts(
  clients: { name: string }[]
): Record<string, number> {
  return useMemo(() => {
    const counts: Record<string, number> = {};
    for (const client of clients) {
      const firstChar = client.name?.charAt(0)?.toUpperCase() ?? "";
      if (firstChar >= "A" && firstChar <= "Z") {
        counts[firstChar] = (counts[firstChar] ?? 0) + 1;
      }
    }
    return counts;
  }, [clients]);
}