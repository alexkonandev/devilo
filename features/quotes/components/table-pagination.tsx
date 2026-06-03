"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DS_MONO } from "@/lib/design-system";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { PAGE_SIZE } from "./constants";
import { QuoteRegistryItem } from "@/types/quote-registry";
import { type SortConfig } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  safeCurrentPage: number;
}

// ═══════════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════════

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <div className="flex items-center justify-between mt-3 px-1">
      <span className={cn(DS_MONO, "text-[10px] text-slate-400")}>
        {totalItems} devis · Page {currentPage}/{totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded text-[10px] font-semibold transition-all",
            currentPage <= 1
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-500 hover:bg-slate-100",
          )}
        >
          <CaretLeft size={10} weight="bold" />
        </button>
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`e-${i}`} className="w-5 text-center text-[10px] text-slate-300">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded text-[10px] font-semibold transition-all",
                p === currentPage
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100",
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded text-[10px] font-semibold transition-all",
            currentPage >= totalPages
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-500 hover:bg-slate-100",
          )}
        >
          <CaretRight size={10} weight="bold" />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HELPERS PAGINATION
// ═══════════════════════════════════════════════════════════════

export function paginate<T>(items: T[], page: number, pageSize: number = PAGE_SIZE): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

/**
 * Calcule l'état de pagination à partir d'un tableau d'items
 */
export function usePaginationState(
  items: QuoteRegistryItem[],
  currentPage: number,
): PaginationState {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  return { currentPage, totalPages, safeCurrentPage };
}