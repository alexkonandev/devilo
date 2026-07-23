"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SquaresFour } from "@phosphor-icons/react";

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
          "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
        )}
        title="Vue grille"
        aria-label="Vue grille"
        aria-pressed={true}
      >
        <SquaresFour size={12} weight="bold" />
      </button>
    </div>
  );
}
