"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DS_MONO } from "@/lib/design-system";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════
// CLIENT PAGINATION — Pagination dédiée au répertoire clients
// ═══════════════════════════════════════════════════════════════

interface ClientPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function ClientPagination({
  page,
  totalPages,
  total,
  onPageChange,
}: ClientPaginationProps) {
  if (totalPages <= 1) return null;

  // Calcul des pages visibles (max 5)
  const getVisiblePages = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const delta = 2;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    pages.push(1);
    if (left > 2) pages.push("ellipsis");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("ellipsis");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800 mt-4">
      <span className={cn(DS_MONO, "text-[10px] text-stone-400 dark:text-stone-500")}>
        {total} contact{total > 1 ? "s" : ""}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            page <= 1
              ? "text-stone-300 dark:text-stone-600 cursor-not-allowed"
              : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-200"
          )}
          aria-label="Page précédente"
        >
          <CaretLeft size={12} weight="bold" />
        </button>

        {visiblePages.map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`ellipsis-${i}`}
              className={cn(DS_MONO, "text-[10px] text-stone-300 px-1")}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "min-w-[28px] h-7 rounded-md text-[10px] font-mono font-bold transition-colors",
                p === page
                  ? "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300"
                  : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-200"
              )}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Page ${p}`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            page >= totalPages
              ? "text-stone-300 dark:text-stone-600 cursor-not-allowed"
              : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-200"
          )}
          aria-label="Page suivante"
        >
          <CaretRight size={12} weight="bold" />
        </button>
      </div>
    </div>
  );
}