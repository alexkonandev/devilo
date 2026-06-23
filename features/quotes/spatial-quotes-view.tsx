"use client";

import React from "react";
import {
  PlusIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { DS_MONO } from "@/lib/design-system";
import { BTN_PRIMARY, BTN_SECONDARY } from "@/components/shared/ui/constants";
import { PageHeader } from "@/components/shared/layout/page-header";
import { SearchBar } from "@/components/shared/ui/search-bar";
import { ConfirmDialog } from "@/components/shared/ui/confirm-dialog";
import { SuccessFeedback } from "@/components/shared/ui/success-feedback";

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

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      <div className="shrink-0 px-6 pt-6">
        <PageHeader
          title="Devis"
          description={`${paginatedQuotes.length} devis`}
          actions={
            <>
              <SearchBar value={searchQuery} onChange={handleSearch} placeholder="Rechercher un devis…" />
              <FiltersDropdown />
              <ExportActions data={paginatedQuotes} selectedIds={selectedQuoteIds} />
              <button onClick={() => setIsSheetOpen(true)} className={BTN_PRIMARY}>
                <PlusIcon size={12} weight="bold" /> Nouveau devis
              </button>
            </>
          }
        />
      </div>

      <div className="shrink-0 px-6 pt-3">
        <CompletionAlert
          quotes={[]}
          onFilterStatus={setActiveStatus}
        />
      </div>

      <div className="flex w-full flex-1 min-h-0 px-6 pb-6 pt-4 overflow-hidden gap-6">
        <div className="flex-[4] min-w-0 flex flex-col">
          {isTotallyEmpty || isSearchEmpty || isFilterEmpty ? (
            <QuotesEmptyState
              variant={emptyVariant}
              setSearchQuery={setSearchQuery}
            />
          ) : (
            <>
              {selectedQuoteIds.size > 0 && (
                <div className="mb-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-md flex items-center justify-between">
                  <span className={cn(DS_MONO, "text-[10px] text-indigo-700 font-semibold")}>
                    {selectedQuoteIds.size} devis sélectionné{selectedQuoteIds.size > 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => setBulkConfirmOpen(true)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all text-[8px] font-mono font-bold uppercase tracking-wider"
                  >
                    Supprimer
                  </button>
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
                totalItems={paginatedQuotes.length}
              />
            </>
          )}
        </div>

        <aside className="flex-[6] flex flex-col min-h-0 overflow-hidden">
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