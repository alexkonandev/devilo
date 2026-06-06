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
  /** "client" = pagination côté client (Quotes), "server" = pagination côté serveur (Clients) */
  mode?: "client" | "server";
  /** Désactive les boutons et affiche "Chargement..." en mode serveur */
  isLoading?: boolean;
  /** Taille de page, utilisée en mode serveur pour calculer "start-end" */
  pageSize?: number;
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
  mode = "client",
  isLoading = false,
  pageSize = PAGE_SIZE,
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

  // Calcul start-end pour le mode serveur
  const start = mode === "server" ? (currentPage - 1) * pageSize + 1 : 0;
  const end = mode === "server" ? Math.min(currentPage * pageSize, totalItems) : 0;

  return (
    <div className="flex items-center justify-between mt-3 px-1">
      <span className={cn(DS_MONO, "text-[10px] text-slate-400")}>
        {mode === "server" ? (
          isLoading ? (
            "Chargement..."
          ) : (
            <>
              <span className="font-bold text-slate-700">{start}-{end}</span>
              <span className="mx-1">sur</span>
              <span className="font-bold text-slate-700">{totalItems}</span>
            </>
          )
        ) : (
          <>
            {totalItems} devis · Page {currentPage}/{totalPages}
          </>
        )}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded text-[10px] font-semibold transition-all",
            currentPage <= 1 || isLoading
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
              disabled={isLoading}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded text-[10px] font-semibold transition-all",
                p === currentPage
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100",
                isLoading && "opacity-50 cursor-not-allowed",
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded text-[10px] font-semibold transition-all",
            currentPage >= totalPages || isLoading
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