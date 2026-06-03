"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DS_MICRO, DS_LABEL, DS_MONO } from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════════════════════
// DATA TABLE — Tableau HTML professionnel réutilisable
// Design : borders fines, padding généreux, survol de ligne hover:bg-slate-50
// ═══════════════════════════════════════════════════════════════════════════════

export interface ColumnDef<T> {
  /** Clé unique pour la colonne */
  key: string;
  /** Label affiché dans l'en-tête (thead) */
  label: string;
  /** Fonction de rendu de la cellule */
  render: (item: T) => React.ReactNode;
  /** Classes additionnelles pour les cellules de cette colonne */
  className?: string;
  /** Classe pour l'en-tête uniquement */
  headerClassName?: string;
  /** Alignement du texte (par défaut "left") */
  align?: "left" | "center" | "right";
  /** Render personnalisé pour l'en-tête (remplace le label) */
  headerRender?: () => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  /** Fonction appelée au clic sur une ligne */
  onRowClick?: (item: T) => void;
  /** Classes additionnelles pour le conteneur */
  className?: string;
  /** Message affiché quand il n'y a pas de données */
  emptyMessage?: string;
  /** Render personnalisé pour l'état vide */
  emptyState?: React.ReactNode;
  /** Classes additionnelles par ligne (ex: pour highlight la sélection) */
  getRowClassName?: (item: T, index: number) => string | undefined;
  /** Mode compact — réduit le padding des cellules à px-2 py-2 */
  compact?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  className,
  emptyMessage = "Aucune donnée",
  emptyState,
  getRowClassName,
  compact,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-24 gap-3 bg-white border border-slate-200 rounded-md",
          className,
        )}
      >
        {emptyState ?? (
          <>
            <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center text-slate-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </div>
            <p className={cn(DS_MONO, "text-slate-400")}>{emptyMessage}</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full overflow-x-auto bg-white border border-slate-200 rounded-md",
        className,
      )}
    >
          <table className="w-full border-collapse">
            {/* ─── EN-TÊTE ─── */}
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      compact ? "px-2 py-2" : "px-4 py-3",
                      "text-[10px] font-bold uppercase tracking-wide text-slate-500",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.headerClassName,
                    )}
                  >
                    {col.headerRender ? col.headerRender() : col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* ─── CORPS ─── */}
            <tbody>
              {data.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "border-b border-slate-100 transition-colors duration-200 hover:bg-slate-50",
                    onRowClick && "cursor-pointer",
                    getRowClassName?.(item, rowIndex),
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                    className={cn(
                      compact ? "px-2 py-2" : "px-4 py-3",
                      "text-sm text-slate-700",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.className,
                    )}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
    </div>
  );
}