"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { DS_MONO, DS_LABEL, STUDIO_V2_BTN } from "@/lib/design-system";
import {
  FunnelSimple,
  XCircle,
} from "@phosphor-icons/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FILTER_OPTIONS } from "./client-constants";

interface ClientFiltersDropdownProps {
  activeFilter: string;
  onFilterChange: (value: string) => void;
  searchQuery: string;
  onResetSearch: () => void;
}

export function ClientFiltersDropdown({
  activeFilter,
  onFilterChange,
  searchQuery,
  onResetSearch,
}: ClientFiltersDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilter = activeFilter !== "all" || searchQuery.length > 0;
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            STUDIO_V2_BTN,
            hasActiveFilter && "bg-indigo-50 border-indigo-200 text-indigo-700",
          )}
        >
          <FunnelSimple size={12} weight={hasActiveFilter ? "fill" : "regular"} />
          Filtres
          {hasActiveFilter && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="center"
        sideOffset={6}
        collisionPadding={{ right: 24, left: 24 }}
        className="w-[280px] p-4"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <span className={cn(DS_LABEL, "text-[9px] text-slate-400 uppercase tracking-wider")}>
              Filtres
            </span>
            <div className="flex flex-wrap gap-1">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onFilterChange(opt.value);
                  }}
                  className={cn(
                    "px-2 py-1 rounded text-[10px] font-semibold transition-all",
                    activeFilter === opt.value
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          <div className="space-y-2">
            {hasActiveFilter && (
              <button
                onClick={() => {
                  onFilterChange("all");
                  onResetSearch();
                }}
                className="flex items-center justify-center gap-1 w-full px-2 py-1 rounded text-[10px] font-semibold text-rose-600 hover:bg-rose-50 transition-all"
              >
                <XCircle size={10} weight="bold" />
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}