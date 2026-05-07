"use client";

import React from "react";
import Link from "next/link";
import { useQuotes } from "./components/quote-context";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
import {
  MagnifyingGlassIcon,
  FileTextIcon,
  XCircleIcon,
  CurrencyCircleDollarIcon,
  TrendUpIcon,
  ClockIcon,
  PlusIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { QuoteStatus, QuoteRegistryItem } from "@/types/quote-registry";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_BENTO_CARD,
  DS_ICON_WRAPPER,
  DS_ICON_SM,
  DS_BUTTON,
  DS_INPUT,
  DS_PAGE_SHELL,
  DS_PAGE_GRID,
} from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════
// STATUS TOKENS (alignés sur le design system)
// ═══════════════════════════════════════════════════════════════

const STATUS_STYLE: Record<
  QuoteStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  DRAFT: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200/60",
    dot: "bg-amber-500",
  },
  SENT: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200/60",
    dot: "bg-blue-500",
  },
  ACCEPTED: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-200/60",
    dot: "bg-indigo-500",
  },
  PAID: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200/60",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-200/60",
    dot: "bg-rose-500",
  },
};

// ═══════════════════════════════════════════════════════════════
// KPI HELPERS
// ═══════════════════════════════════════════════════════════════

function useQuoteStats() {
  const { stats } = useQuotes();

  const formatCFA = (amount: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return { stats, formatCFA };
}

// ═══════════════════════════════════════════════════════════════
// QUOTE BENTO CARD - Registre scrollable
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// QUOTE BENTO CARD — Registre scrollable
// ═══════════════════════════════════════════════════════════════

function QuoteBentoCard({ quote }: { quote: QuoteRegistryItem }) {
  const { quickStatusChange } = useQuotes();
  const style = STATUS_STYLE[quote.status];

  const totalHT = quote.lines.reduce(
    (acc, ln) => acc + ln.unitPrice * ln.quantity,
    0,
  );

  const formatCFA = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <div className={cn(DS_BENTO_CARD, "flex flex-col gap-3")}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={cn(DS_MONO, "font-bold text-slate-900 truncate")}>
            {quote.client.name}
          </p>
          <p className={cn(DS_MICRO, "text-slate-400")}>{quote.number}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border shrink-0",
                style.bg,
                style.text,
                style.border,
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full inline-block mr-1",
                  style.dot,
                )}
              />
              {quote.status}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[120px]">
            {(
              ["DRAFT", "SENT", "ACCEPTED", "PAID", "REJECTED"] as QuoteStatus[]
            ).map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => quickStatusChange(quote.id, s)}
                className={cn(
                  "text-[10px] font-bold uppercase cursor-pointer",
                  quote.status === s && "bg-slate-100",
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full mr-2",
                    STATUS_STYLE[s].dot,
                  )}
                />
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Montant */}
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-black text-slate-900 tabular-nums">
          {new Intl.NumberFormat("fr-FR").format(totalHT)}
        </span>
        <span className={cn(DS_LABEL, "text-slate-400")}>XOF HT</span>
      </div>

      {/* Lignes */}
      {quote.lines.length > 0 && (
        <div className="space-y-1">
          {quote.lines.slice(0, 2).map((ln, i) => (
            <div key={i} className="flex items-center justify-between">
              <span
                className={cn(
                  DS_MICRO,
                  "text-slate-500 truncate max-w-[160px]",
                )}
              >
                {ln.title}
              </span>
              <span className={cn(DS_MONO, "text-slate-400")}>
                {ln.quantity} × {formatCFA(ln.unitPrice)}
              </span>
            </div>
          ))}
          {quote.lines.length > 2 && (
            <span className={cn(DS_MICRO, "text-slate-300")}>
              +{quote.lines.length - 2} ligne(s)
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <span className={cn(DS_MICRO, "text-slate-400")}>
          {new Date(quote.issueDate).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
        <Link
          href={`/quotes/new?id=${quote.id}`}
          className={cn(DS_BUTTON, "py-1 px-2 text-[9px]")}
        >
          <PencilSimpleIcon size={10} weight="bold" />
          Éditer
        </Link>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN — Bento Scrollable Registry
// ═══════════════════════════════════════════════════════════════

export function SpatialQuotesView() {
  const { filteredQuotes, searchQuery, setSearchQuery } = useQuotes();
  const { stats, formatCFA } = useQuoteStats();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Devis"
        subtitle={`${filteredQuotes.length} devis`}
        actions={
          <Link href="/quotes/new" className={cn(DS_BUTTON)}>
            <PlusIcon size={DS_ICON_SM} weight="bold" />
            Nouveau devis
          </Link>
        }
      />

      <div className={DS_PAGE_SHELL}>
        <div className={cn(DS_PAGE_GRID, "p-4")}>
          {/* ROW 0 — KPI 1: En-cours */}
          <div
            className={cn(DS_BENTO_CARD, "col-span-3 flex items-center gap-3")}
          >
            <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
              <ClockIcon
                size={DS_ICON_SM}
                className="text-indigo-600"
                weight="bold"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  DS_MONO,
                  "font-bold text-slate-900 text-lg leading-none",
                )}
              >
                {formatCFA(stats.totalPipelineValue)}
              </p>
              <p className={cn(DS_MICRO, "text-slate-400 mt-0.5")}>
                {stats.countByStatus.SENT} envoyés
              </p>
            </div>
          </div>

          {/* ROW 0 — KPI 2: Conversion */}
          <div
            className={cn(DS_BENTO_CARD, "col-span-3 flex items-center gap-3")}
          >
            <div className={cn(DS_ICON_WRAPPER, "bg-emerald-50")}>
              <TrendUpIcon
                size={DS_ICON_SM}
                className="text-emerald-600"
                weight="bold"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  DS_MONO,
                  "font-bold text-slate-900 text-lg leading-none",
                )}
              >
                {stats.conversionRate.toFixed(1)}%
              </p>
              <p className={cn(DS_MICRO, "text-slate-400 mt-0.5")}>
                Conversion
              </p>
            </div>
          </div>

          {/* ROW 0 — KPI 3: Encaissé */}
          <div
            className={cn(DS_BENTO_CARD, "col-span-3 flex items-center gap-3")}
          >
            <div className={cn(DS_ICON_WRAPPER, "bg-emerald-50")}>
              <CurrencyCircleDollarIcon
                size={DS_ICON_SM}
                className="text-emerald-600"
                weight="bold"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  DS_MONO,
                  "font-bold text-slate-900 text-lg leading-none",
                )}
              >
                {formatCFA(stats.totalCashCollected)}
              </p>
              <p className={cn(DS_MICRO, "text-slate-400 mt-0.5")}>
                {stats.countByStatus.PAID} payés
              </p>
            </div>
          </div>

          {/* ROW 0 — KPI 4: Brouillons */}
          <div
            className={cn(DS_BENTO_CARD, "col-span-3 flex items-center gap-3")}
          >
            <div className={cn(DS_ICON_WRAPPER, "bg-amber-50")}>
              <FileTextIcon
                size={DS_ICON_SM}
                className="text-amber-600"
                weight="bold"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  DS_MONO,
                  "font-bold text-slate-900 text-lg leading-none",
                )}
              >
                {stats.countByStatus.DRAFT}
              </p>
              <p className={cn(DS_MICRO, "text-slate-400 mt-0.5")}>
                Brouillons
              </p>
            </div>
          </div>

          {/* ROW 1 — Recherche */}
          <div className="col-span-12">
            <div className="relative max-w-sm">
              <MagnifyingGlassIcon
                size={DS_ICON_SM}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un devis…"
                className={cn(DS_INPUT, "pl-8 w-full")}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <XCircleIcon size={DS_ICON_SM} />
                </button>
              )}
            </div>
          </div>

          {/* ROW 2 — Grille de cards */}
          {filteredQuotes.length === 0 ? (
            <div className="col-span-12 flex flex-col items-center justify-center py-24 gap-3">
              <FileTextIcon
                size={48}
                className="text-slate-200"
                weight="duotone"
              />
              <p className={cn(DS_MONO, "text-slate-400")}>
                Aucun devis trouvé
              </p>
            </div>
          ) : (
            filteredQuotes.map((quote) => (
              <div
                key={quote.id}
                className="col-span-12 md:col-span-6 lg:col-span-4"
              >
                <QuoteBentoCard quote={quote} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default SpatialQuotesView;
