"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useQuotes } from "./components/quote-context";
import {
  cn,
  formatPrice,
  applySort,
  type SortConfig,
} from "@/lib/utils";
import {
  FileTextIcon,
  PlusIcon,
  CheckCircle,
  ClockClockwise,
  CalendarBlank,
  XCircle,
} from "@phosphor-icons/react";
import { PageHeader } from "@/components/shared/layout/page-header";
import { SearchBar } from "@/components/shared/ui/search-bar";
import { QuotesTable } from "./components/quotes-table";
import { QuoteCreationSheet } from "./components/quote-creation-sheet";
import { ExportActions } from "./components/export-actions";
import { DS_MONO } from "@/lib/design-system";
import { BTN_PRIMARY, BTN_SECONDARY } from "@/components/shared/ui/constants";
import { QuoteDetailSidebar } from "./components/quote-detail-sidebar";
import { FiltersDropdown } from "./components/filters-dropdown";
import { TablePagination, paginate } from "./components/table-pagination";
import { PAGE_SIZE } from "./components/constants";

// ═══════════════════════════════════════════════════════════════
// MAIN — Spatial Quotes Registry View (orchestration pure)
// ═══════════════════════════════════════════════════════════════

export function SpatialQuotesView() {
  const {
    quotes,
    filteredQuotes,
    searchQuery,
    setSearchQuery,
    stats,
    selectedQuoteIds,
    highlightThreshold,
  } = useQuotes();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const resetPage = useCallback(() => setCurrentPage(1), []);

  // Tri + pagination
  const sortedQuotes = useMemo(
    () => applySort(filteredQuotes, sortConfig.column, sortConfig.direction),
    [filteredQuotes, sortConfig],
  );
  const totalPages = Math.max(1, Math.ceil(sortedQuotes.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedQuotes = useMemo(
    () => paginate(sortedQuotes, safeCurrentPage, PAGE_SIZE),
    [sortedQuotes, safeCurrentPage],
  );

  const handleSort = useCallback(
    (column: SortConfig["column"]) => {
      setSortConfig((prev) => ({
        column,
        direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
      }));
      resetPage();
    },
    [resetPage],
  );

  const handleSearch = useCallback(
    (q: string) => { setSearchQuery(q); resetPage(); },
    [setSearchQuery, resetPage],
  );

  // États vides
  const isTotallyEmpty = quotes.length === 0;
  const isSearchEmpty = searchQuery && filteredQuotes.length === 0 && !isTotallyEmpty;
  const isFilterEmpty = !searchQuery && !isTotallyEmpty && filteredQuotes.length === 0;

  const renderEmptyState = () => {
    if (isTotallyEmpty)
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-slate-200 rounded-md">
          <FileTextIcon size={48} className="text-slate-200" weight="duotone" />
          <p className={cn(DS_MONO, "text-slate-400")}>Aucun devis trouvé</p>
          <p className={cn(DS_MONO, "text-[10px] text-slate-300 max-w-[250px] text-center")}>
            Créez votre premier devis pour commencer
          </p>
        </div>
      );
    if (isSearchEmpty)
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-slate-200 rounded-md">
          <span className="text-4xl text-slate-200">🔍</span>
          <p className={cn(DS_MONO, "text-slate-400")}>Aucun devis ne correspond à votre recherche</p>
          <p className={cn(DS_MONO, "text-[10px] text-slate-300 max-w-[250px] text-center")}>
            Essayez de modifier vos filtres ou votre recherche
          </p>
          <button onClick={() => setSearchQuery("")} className={cn(BTN_SECONDARY, "mt-2 text-[10px]")}>
            <XCircle size={10} weight="bold" /> Réinitialiser les filtres
          </button>
        </div>
      );
    if (isFilterEmpty)
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-slate-200 rounded-md">
          <CalendarBlank size={48} className="text-slate-200" weight="duotone" />
          <p className={cn(DS_MONO, "text-slate-400")}>Aucun devis dans cette période</p>
          <p className={cn(DS_MONO, "text-[10px] text-slate-300 max-w-[250px] text-center")}>
            Essayez de modifier vos filtres
          </p>
        </div>
      );
    return null;
  };

  const emptyState = renderEmptyState();

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      <div className="shrink-0 px-6 pt-6">
        <PageHeader
          title="Devis"
          description={
            <span className="inline-flex items-center gap-3">
              <span>{filteredQuotes.length} devis</span>
              <span className="w-px h-3 bg-slate-200" />
              <span className={cn(DS_MONO, "text-[10px] text-emerald-600 font-semibold")}>
                <CheckCircle size={10} className="inline mr-0.5" weight="fill" />
                {formatPrice(stats.totalCashCollected)} encaissé
              </span>
              <span className={cn(DS_MONO, "text-[10px] text-amber-600 font-semibold")}>
                <ClockClockwise size={10} className="inline mr-0.5" weight="fill" />
                {formatPrice(stats.totalPipelineValue)} en attente
              </span>
            </span>
          }
          actions={
            <>
              <SearchBar value={searchQuery} onChange={handleSearch} placeholder="Rechercher un devis…" />
              <FiltersDropdown />
              <ExportActions data={sortedQuotes} selectedIds={selectedQuoteIds} />
              <button onClick={() => setIsSheetOpen(true)} className={BTN_PRIMARY}>
                <PlusIcon size={12} weight="bold" /> Nouveau devis
              </button>
            </>
          }
        />
      </div>

      <div className="flex w-full flex-1 min-h-0 px-6 pb-6 pt-4 overflow-hidden gap-6">
        <div className="flex-[4] min-w-0 flex flex-col">
          {emptyState ?? (
            <>
              {selectedQuoteIds.size > 0 && (
                <div className="mb-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-md">
                  <span className={cn(DS_MONO, "text-[10px] text-indigo-700 font-semibold")}>
                    {selectedQuoteIds.size} devis sélectionné{selectedQuoteIds.size > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              <div className="flex-1 min-h-0 overflow-auto">
                <QuotesTable
                  data={paginatedQuotes}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  highlightThreshold={highlightThreshold}
                />
              </div>
              <TablePagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={sortedQuotes.length}
              />
            </>
          )}
        </div>

        <aside className="flex-[6] flex flex-col min-h-0 overflow-hidden">
          <QuoteDetailSidebar />
        </aside>
      </div>

      <QuoteCreationSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  );
}

export default SpatialQuotesView;