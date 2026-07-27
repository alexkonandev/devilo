"use client";

import React, { useState } from "react";
import { useQuotes } from "./quote-context";
import { cn } from "@/lib/utils";
import { DS_MONO, DS_LABEL, STUDIO_V2_BTN } from "@/lib/design-system";
import {
  FunnelSimple,
  XCircle,
  CalendarBlank,
  CurrencyCircleDollar,
} from "@phosphor-icons/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { STATUS_TABS, DATE_RANGE_OPTIONS } from "./constants";

// ═══════════════════════════════════════════════════════════════
// FILTERS DROPDOWN — Tous les filtres dans un Popover
// Les valeurs viennent du context (Phase 3.2)
// ═══════════════════════════════════════════════════════════════

export function FiltersDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    activeStatus, setActiveStatus,
    dateRange, setDateRange,
    customStartDate, setCustomStartDate,
    customEndDate, setCustomEndDate,
    amountMin, setAmountMin,
    amountMax, setAmountMax,
    resetFilters,
    hasActiveFilters,
  } = useQuotes();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            STUDIO_V2_BTN,
            hasActiveFilters && "bg-indigo-50 border-indigo-200 text-indigo-700",
          )}
        >
          <FunnelSimple size={12} weight={hasActiveFilters ? "fill" : "regular"} />
          Filtres
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
        className="w-[520px] p-4"
      >
        <div className="space-y-4">
          {/* ── Statut ── */}
          <div className="space-y-2">
            <span className={cn(DS_LABEL, "text-[9px] text-slate-400 uppercase tracking-wider")}>
              Statut
            </span>
            <div className="flex flex-wrap gap-1">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setActiveStatus(tab.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "px-2 py-1 rounded text-[10px] font-semibold transition-all",
                    activeStatus === tab.value
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          <div className="grid grid-cols-2 gap-4">
            {/* Filtre Date */}
            <div className="space-y-2">
              <span className={cn(DS_LABEL, "text-[9px] text-slate-400 uppercase tracking-wider")}>
                <CalendarBlank size={10} className="inline mr-1" weight="duotone" />
                Période
              </span>
              <div className="flex flex-wrap gap-1">
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDateRange(dateRange === opt.value ? null : opt.value)}
                    className={cn(
                      "px-2 py-1 rounded text-[10px] font-semibold transition-all",
                      dateRange === opt.value
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {dateRange === "custom" && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="date"
                    value={customStartDate ?? ""}
                    onChange={(e) => setCustomStartDate(e.target.value || null)}
                    className={cn(DS_MONO, "w-full px-2 py-1 text-[10px] rounded-md border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400")}
                    placeholder="Début"
                  />
                  <input
                    type="date"
                    value={customEndDate ?? ""}
                    onChange={(e) => setCustomEndDate(e.target.value || null)}
                    className={cn(DS_MONO, "w-full px-2 py-1 text-[10px] rounded-md border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400")}
                    placeholder="Fin"
                  />
                </div>
              )}
            </div>

            {/* Filtre Montant */}
            <div className="space-y-2">
              <span className={cn(DS_LABEL, "text-[9px] text-slate-400 uppercase tracking-wider")}>
                <CurrencyCircleDollar size={10} className="inline mr-1" weight="duotone" />
                Montant HT
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={amountMin}
                  onChange={(e) => setAmountMin(e.target.value)}
                  placeholder="Min"
                  className={cn(DS_MONO, "w-full px-2 py-1 text-[10px] rounded-md border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400")}
                />
                <span className="text-[10px] text-slate-400">→</span>
                <input
                  type="number"
                  value={amountMax}
                  onChange={(e) => setAmountMax(e.target.value)}
                  placeholder="Max"
                  className={cn(DS_MONO, "w-full px-2 py-1 text-[10px] rounded-md border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400")}
                />
              </div>
            </div>

            {/* Actions : Reset */}
            <div className="space-y-2 flex flex-col justify-end">
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    resetFilters();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center gap-1 px-2 py-1 rounded text-[10px] font-semibold text-rose-600 hover:bg-rose-50 transition-all"
                >
                  <XCircle size={10} weight="bold" />
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}