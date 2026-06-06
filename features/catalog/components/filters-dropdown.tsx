"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { DS_LABEL } from "@/lib/design-system";
import { BTN_SECONDARY } from "@/components/shared/ui/constants";
import { FunnelSimple, XCircle } from "@phosphor-icons/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CATEGORY_LABELS } from "./constants";
import { CategoryFilter } from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// FILTERS DROPDOWN — Filtre catégorie dans un Popover (pattern Quotes)
// Phase 3.1 : Remplace filter-sidebar.tsx
// ═══════════════════════════════════════════════════════════════════════════════

interface FiltersDropdownProps {
  categoryFilter: CategoryFilter;
  onCategoryChange: (filter: CategoryFilter) => void;
}

const CATEGORY_OPTIONS: { key: CategoryFilter; label: string }[] = [
  { key: "ALL", label: "Toutes catégories" },
  { key: "GENERAL", label: "Général" },
  { key: "TECHNIC", label: "Technique" },
  { key: "CONSULTING", label: "Conseil" },
  { key: "SUBSCRIPTION", label: "Abonnement" },
];

export function FiltersDropdown({
  categoryFilter,
  onCategoryChange,
}: FiltersDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = categoryFilter !== "ALL";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            BTN_SECONDARY,
            "text-[10px]",
            hasActiveFilters && "bg-indigo-50 border-indigo-200 text-indigo-700",
          )}
        >
          <FunnelSimple size={12} weight={hasActiveFilters ? "fill" : "regular"} />
          {hasActiveFilters ? `Catégorie : ${CATEGORY_LABELS[categoryFilter]}` : "Filtres"}
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="center"
        sideOffset={6}
        collisionPadding={{ right: 24, left: 24 }}
        className="w-48 p-2"
      >
        <div className="space-y-1">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => {
                onCategoryChange(option.key);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-semibold transition-all text-left",
                categoryFilter === option.key
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  categoryFilter === option.key ? "bg-indigo-500" : "bg-slate-300",
                )}
              />
              {option.label}
            </button>
          ))}

          {hasActiveFilters && (
            <>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  onCategoryChange("ALL");
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-semibold text-rose-600 hover:bg-rose-50 transition-all"
              >
                <XCircle size={10} weight="bold" />
                Réinitialiser
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}