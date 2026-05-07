"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DS_MICRO, DS_MONO } from "@/lib/design-system";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

interface ClientPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function ClientPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  isLoading,
}: ClientPaginationProps) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-200">
      {/* Info */}
      <span className={cn(DS_MICRO, "text-slate-500")}>
        {isLoading ? (
          "Chargement..."
        ) : (
          <>
            <span className={cn(DS_MONO, "text-slate-700 font-bold")}>
              {start}-{end}
            </span>
            <span className="mx-1">sur</span>
            <span className={cn(DS_MONO, "text-slate-700 font-bold")}>
              {total}
            </span>
          </>
        )}
      </span>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isLoading}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded transition-colors",
            page <= 1 || isLoading
              ? "text-slate-300 cursor-not-allowed"
              : "hover:bg-slate-200 text-slate-600"
          )}
        >
          <CaretLeft size={14} weight="bold" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-0.5">
          {getPageNumbers().map((p, i) => (
            <React.Fragment key={i}>
              {p === "..." ? (
                <span className={cn(DS_MICRO, "text-slate-400 px-1")}>...</span>
              ) : (
                <button
                  onClick={() => onPageChange(p as number)}
                  disabled={isLoading}
                  className={cn(
                    "w-7 h-7 flex items-center justify-center rounded text-[11px] font-bold transition-colors",
                    p === page
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-slate-200 text-slate-600"
                  )}
                >
                  {p}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded transition-colors",
            page >= totalPages || isLoading
              ? "text-slate-300 cursor-not-allowed"
              : "hover:bg-slate-200 text-slate-600"
          )}
        >
          <CaretRight size={14} weight="bold" />
        </button>
      </div>
    </div>
  );
}

export default ClientPagination;
