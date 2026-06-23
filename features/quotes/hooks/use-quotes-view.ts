"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuotes } from "../components/quote-context";
import { applySort, type SortConfig } from "@/lib/utils";
import { paginate } from "../components/table-pagination";
import { PAGE_SIZE } from "../components/constants";
import { QuoteRegistryItem } from "@/types/quote-registry";

export function useQuotesView() {
  const {
    quotes,
    filteredQuotes,
    searchQuery,
    setSearchQuery,
    selectedQuoteIds,
    highlightThreshold,
    setActiveStatus,
    deleteMultipleQuotes,
    clearSelection,
  } = useQuotes();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const resetPage = useCallback(() => setCurrentPage(1), []);

  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState<{
    open: boolean;
    title: string;
    description?: string;
    variant: "success" | "error" | "info";
  }>({ open: false, title: "", variant: "success" });

  const showBulkFeedback = (opts: { title: string; description?: string; variant?: "success" | "error" | "info" }) => {
    setBulkFeedback({ ...opts, open: true, variant: opts.variant || "success" });
  };

  const hideBulkFeedback = () => setBulkFeedback((prev) => ({ ...prev, open: false }));

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

  const isTotallyEmpty = quotes.length === 0;
  const isSearchEmpty = searchQuery && filteredQuotes.length === 0 && !isTotallyEmpty;
  const isFilterEmpty = !searchQuery && !isTotallyEmpty && filteredQuotes.length === 0;

  return {
    quotes,
    filteredQuotes,
    searchQuery,
    selectedQuoteIds,
    highlightThreshold,
    bulkConfirmOpen,
    bulkFeedback,
    isSheetOpen,
    sortConfig,
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
  };
}