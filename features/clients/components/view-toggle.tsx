"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { List, SquaresFour } from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════
// VIEW TOGGLE — Bascule grille/liste pour le répertoire clients
// ═══════════════════════════════════════════════════════════════

interface ViewToggleProps {
  viewMode: "grid" | "list";
  onChange: (mode: "grid" | "list") => void;
}

export function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-md overflow-hidden">
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "p-1.5 transition-colors",
          viewMode === "grid"
            ? "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300"
            : "bg-white dark:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
        )}
        title="Vue grille"
        aria-label="Vue grille"
        aria-pressed={viewMode === "grid"}
      >
        <SquaresFour size={12} weight="bold" />
      </button>
      <div className="w-px h-4 bg-stone-200" />
      <button
        onClick={() => onChange("list")}
        className={cn(
          "p-1.5 transition-colors",
          viewMode === "list"
            ? "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300"
            : "bg-white dark:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
        )}
        title="Vue liste"
        aria-label="Vue liste"
        aria-pressed={viewMode === "list"}
      >
        <List size={12} weight="bold" />
      </button>
    </div>
  );
}