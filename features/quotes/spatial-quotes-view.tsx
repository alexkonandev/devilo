"use client";

import React from "react";
import {
  PlusIcon,
  FileTextIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  DS_MONO,
  STUDIO_V2_BTN_PRIMARY,
  STUDIO_V2_CARD,
} from "@/lib/design-system";
import { ConfirmDialog } from "@/components/shared/ui/confirm-dialog";
import { SuccessFeedback } from "@/components/shared/ui/success-feedback";
import { SearchBar } from "@/components/shared/ui/search-bar";

import { useQuotesView } from "./hooks/use-quotes-view";
import { CompletionAlert } from "./components/completion-alert";
import { QuotesTable } from "./components/quotes-table";
import { QuotesEmptyState } from "./components/quotes-empty-state";
import { QuoteCreationSheet } from "./components/quote-creation-sheet";
import { ExportActions } from "./components/export-actions";
import { QuoteDetailSidebar } from "./components/quote-detail-sidebar";
import { FiltersDropdown } from "./components/filters-dropdown";
import { TablePagination } from "./components/table-pagination";

export function SpatialQuotesView() {
  const {
    searchQuery,
    selectedQuoteIds,
    highlightThreshold,
    bulkConfirmOpen,
    bulkFeedback,
    isSheetOpen,
    currentPage,
    safeCurrentPage,
    totalPages,
    paginatedQuotes,
    isTotallyEmpty,
    isSearchEmpty,
    isFilterEmpty,
    setCurrentPage,
    setBulkConfirmOpen,
    setIsSheetOpen,
    setSearchQuery,
    setActiveStatus,
    handleSort,
    handleSearch,
    showBulkFeedback,
    hideBulkFeedback,
    deleteMultipleQuotes,
    clearSelection,
    sortConfig,
  } = useQuotesView();

  const emptyVariant = isTotallyEmpty ? "totallyEmpty" : isSearchEmpty ? "searchEmpty" : "filterEmpty";
  const totalItems = paginatedQuotes.length;

  // Pleine page empty state pour les nouveaux utilisateurs (aucun devis du tout)
  if (isTotallyEmpty) {
    return (
      <div className="flex flex-col h-full w-full bg-slate-50">
        <div className="flex-1 flex items-center justify-center">
          <QuotesEmptyState
            variant="totallyEmpty"
            setSearchQuery={setSearchQuery}
            onAddClient={() => setIsSheetOpen(true)}
          />
        </div>
        <QuoteCreationSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      {/* === HEADER V2 === */}
      <header className="flex items-center h-12 px-3 border-b border-slate-200 bg-white shrink-0 gap-2">
        <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
          <FileTextIcon size={12} className="text-indigo-600" weight="bold" />
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-800 tracking-tight">
          Devis
        </span>
        <span className="text-[8px] font-mono text-slate-400">
          {totalItems} devis
        </span>
        <div className="flex-1" />
        <SearchBar value={searchQuery} onChange={handleSearch} placeholder="Rechercher un devis…" />
        <FiltersDropdown />
        <ExportActions data={paginatedQuotes} selectedIds={selectedQuoteIds} />
        <button onClick={() => setIsSheetOpen(true)} className={STUDIO_V2_BTN_PRIMARY}>
          <PlusIcon size={12} weight="bold" />
        </button>
      </header>

      {/* === COMPLETION ALERT === */}
      <div className="shrink-0 px-4 pt-3">
        <CompletionAlert
          quotes={[]}
          onFilterStatus={setActiveStatus}
        />
      </div>

      {/* === CONTENU === */}
      <div className="flex w-full flex-1 min-h-0 px-4 pb-4 pt-3 overflow-hidden gap-4">
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Bulk selection bar */}
          {selectedQuoteIds.size > 0 && (
            <div className={cn(STUDIO_V2_CARD, "mb-2 px-3 py-2 flex items-center justify-between")}>
              <span className={cn(DS_MONO, "text-[10px] text-slate-700 font-semibold")}>
                {selectedQuoteIds.size} devis sélectionné{selectedQuoteIds.size > 1 ? "s" : ""}
              </span>
              <button
                onClick={() => setBulkConfirmOpen(true)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-mono font-bold uppercase tracking-wider",
                  "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all"
                )}
              >
                Supprimer
              </button>
            </div>
          )}

          {/* Content area */}
          {isSearchEmpty || isFilterEmpty ? (
            <QuotesEmptyState
              variant={emptyVariant}
              setSearchQuery={setSearchQuery}
            />
          ) : (
            <>
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
                totalItems={totalItems}
              />
            </>
          )}
        </div>

        <aside className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <QuoteDetailSidebar />
        </aside>
      </div>

      <ConfirmDialog
        open={bulkConfirmOpen}
        onConfirm={async () => {
          await deleteMultipleQuotes(Array.from(selectedQuoteIds));
          setBulkConfirmOpen(false);
          showBulkFeedback({ title: "DEVIS SUPPRIMÉS", description: `${selectedQuoteIds.size} devis supprimés.` });
          clearSelection();
        }}
        onCancel={() => setBulkConfirmOpen(false)}
        variant="delete"
        title="SUPPRIMER LES DEVIS"
        description={`Cette action est irréversible. ${selectedQuoteIds.size} devis seront définitivement supprimés.`}
      />

      <SuccessFeedback
        open={bulkFeedback.open}
        onClose={hideBulkFeedback}
        title={bulkFeedback.title}
        description={bulkFeedback.description}
        variant={bulkFeedback.variant}
        autoClose={2500}
      />

      <QuoteCreationSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  );
}

export default SpatialQuotesView;