"use client";

import { cn, formatDateShort, formatPriceCompact, computeTotalHT, type SortConfig } from "@/lib/utils";
import { QuoteRegistryItem, QuoteStatus } from "@/types/quote-registry";
import { useQuotes } from "./quote-context";
import {
  DS_MONO,
  DS_LABEL,
  DS_BADGE_ACTIVE,
  DS_BADGE_SUCCESS,
  DS_BADGE_DANGER,
  DS_BADGE_NEUTRAL,
  DS_BADGE_ACCEPTED,
  DS_BADGE_CANCELLED,
} from "@/lib/design-system";
import { CaretUp, CaretDown } from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════════
// BADGES STATUT
// ═══════════════════════════════════════════════════════════════════

const STATUS_BADGE_CLASS: Record<QuoteStatus, string> = {
  DRAFT: DS_BADGE_NEUTRAL,
  SENT: DS_BADGE_ACTIVE,
  ACCEPTED: DS_BADGE_ACCEPTED,
  PAID: DS_BADGE_SUCCESS,
  REJECTED: DS_BADGE_DANGER,
  CANCELLED: DS_BADGE_CANCELLED,
};

const STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  ACCEPTED: "Accepté",
  PAID: "Payé",
  REJECTED: "Refusé",
  CANCELLED: "Annulé",
};

// ═══════════════════════════════════════════════════════════════════
// COLUMN WIDTHS (constantes partagées th/td)
// ═══════════════════════════════════════════════════════════════════

const COL_CLIENT    = "min-w-[160px]";
const COL_NUMBER    = "w-[110px]";
const COL_DATE      = "w-[80px]";
const COL_STATUS    = "w-[90px]";
const COL_AMOUNT    = "w-[100px]";

// ═══════════════════════════════════════════════════════════════════
// SORT ARROW RENDERER
// ═══════════════════════════════════════════════════════════════════

function SortArrow({
  column,
  sortConfig,
}: {
  column: SortConfig["column"];
  sortConfig: SortConfig;
}) {
  if (sortConfig.column !== column) {
    return (
      <span className="ml-1 opacity-0 group-hover:opacity-40 transition-opacity">
        <CaretUp size={8} weight="bold" />
      </span>
    );
  }
  return (
    <span className="ml-1 text-slate-700">
      {sortConfig.direction === "asc" ? (
        <CaretUp size={8} weight="fill" />
      ) : (
        <CaretDown size={8} weight="fill" />
      )}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════
// QUOTES TABLE — Tableau HTML natif, Master-Detail prêt
// ═══════════════════════════════════════════════════════════════════

interface QuotesTableProps {
  data: QuoteRegistryItem[];
  sortConfig?: SortConfig;
  onSort?: (column: SortConfig["column"]) => void;
  /** Seuil de coloration conditionnelle (montant HT) */
  highlightThreshold?: number | null;
}

export function QuotesTable({ data, sortConfig, onSort, highlightThreshold }: QuotesTableProps) {
  const { selectQuote, toggleSelection, activeQuoteId } = useQuotes();

  const effectiveSort: SortConfig = sortConfig ?? { column: null, direction: "asc" };

  const handleRowClick = (quoteId: string, e: React.MouseEvent) => {
    // Si la touche Ctrl/Meta est maintenue, on toggle la multi-sélection
    if (e.ctrlKey || e.metaKey) {
      toggleSelection(quoteId);
      return;
    }
    // Sinon, sélection simple (master-detail)
    selectQuote(quoteId);
  };

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden">
      <table className="w-full table-fixed border-collapse bg-white">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th
              className={`${COL_CLIENT} px-2 py-2 text-left ${DS_LABEL} group cursor-pointer select-none hover:text-slate-700 transition-colors`}
              onClick={() => onSort?.("client" as SortConfig["column"])}
            >
              <span className="inline-flex items-center">
                Client
                <SortArrow column="client" sortConfig={effectiveSort} />
              </span>
            </th>
            <th
              className={`${COL_NUMBER} px-2 py-2 text-left ${DS_LABEL} group cursor-pointer select-none hover:text-slate-700 transition-colors`}
              onClick={() => onSort?.("number")}
            >
              <span className="inline-flex items-center">
                N° Devis
                <SortArrow column="number" sortConfig={effectiveSort} />
              </span>
            </th>
            <th
              className={`${COL_DATE} px-2 py-2 text-left ${DS_LABEL} tabular-nums group cursor-pointer select-none hover:text-slate-700 transition-colors`}
              onClick={() => onSort?.("issueDate")}
            >
              <span className="inline-flex items-center">
                Date
                <SortArrow column="issueDate" sortConfig={effectiveSort} />
              </span>
            </th>
            <th className={`${COL_STATUS} px-2 py-2 text-left ${DS_LABEL}`}>
              Statut
            </th>
            <th
              className={`${COL_AMOUNT} px-2 py-2 text-right ${DS_LABEL} tabular-nums group cursor-pointer select-none hover:text-slate-700 transition-colors`}
              onClick={() => onSort?.("totalHT")}
            >
              <span className="inline-flex items-center justify-end">
                Montant HT
                <SortArrow column="totalHT" sortConfig={effectiveSort} />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((quote) => {
            const totalHT = computeTotalHT(quote);

            const isActive = activeQuoteId === quote.id;

            return (
              <tr
                key={quote.id}
                onClick={(e) => handleRowClick(quote.id, e)}
                className={cn(
                  "border-b border-slate-100 transition-colors duration-200 cursor-pointer",
                  isActive
                    ? "bg-indigo-50 hover:bg-indigo-100"
                    : "hover:bg-slate-50",
                )}
              >
                <td className={`${COL_CLIENT} px-2 py-2 text-left align-middle`}>
                  <span className={cn(DS_MONO, "font-semibold text-slate-900 truncate block text-xs")}>
                    {quote.client.name}
                  </span>
                </td>
                <td className={`${COL_NUMBER} px-2 py-2 text-left align-middle`}>
                  <span className={cn(DS_MONO, "text-xs text-slate-500")}>
                    {quote.number}
                  </span>
                </td>
                <td className={`${COL_DATE} px-2 py-2 text-left align-middle tabular-nums`}>
                  <span className={cn(DS_MONO, "text-[11px] text-slate-500")}>
                    {formatDateShort(quote.issueDate)}
                  </span>
                </td>
                <td className={`${COL_STATUS} px-2 py-2 text-left align-middle`}>
                  <span className={STATUS_BADGE_CLASS[quote.status]}>
                    {STATUS_LABELS[quote.status]}
                  </span>
                </td>
                <td className={`${COL_AMOUNT} px-2 py-2 text-right align-middle tabular-nums`}>
                  <span
                    className={cn(
                      DS_MONO,
                      "font-semibold text-xs",
                      (() => {
                        if (highlightThreshold == null) return "text-slate-900";
                        const ratio = totalHT / highlightThreshold;
                        // Dégradé : < 50% = normal, 50-80% = amber, 80-100% = orange, >= 100% = rose/red
                        if (ratio >= 1.0) return "text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded";
                        if (ratio >= 0.8) return "text-orange-600";
                        if (ratio >= 0.5) return "text-amber-600";
                        return "text-slate-900";
                      })(),
                    )}
                  >
                    {(() => {
                      if (highlightThreshold != null && totalHT >= highlightThreshold) {
                        return (
                          <>
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 mr-1 animate-pulse" />
                            {formatPriceCompact(totalHT)}
                          </>
                        );
                      }
                      return formatPriceCompact(totalHT);
                    })()}
                  </span>
                </td>
              </tr>
            );
          })}

          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="px-2 py-12 text-center text-slate-400">
                <span className={cn(DS_MONO, "text-xs")}>Aucun devis trouvé</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}