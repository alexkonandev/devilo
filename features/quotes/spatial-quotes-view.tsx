"use client";

import React, { useMemo, useState, useTransition } from "react";
import { useQuotes } from "./components/quote-context";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FileTextIcon,
  FilesIcon,
  PencilSimpleIcon,
  PaperPlaneTiltIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyCircleDollarIcon,
  TrendUpIcon,
  ClockIcon,
  EnvelopeSimpleIcon,
  DownloadSimpleIcon,
  ArrowRightIcon,
  DotsThreeVerticalIcon,
  CopyIcon,
  CalendarIcon,
  HashIcon,
  CaretUpIcon,
  CaretDownIcon,
  SelectionBackgroundIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { QuoteStatus, QuoteRegistryItem } from "@/types/quote-registry";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS - High Density Compact Mode
// ═══════════════════════════════════════════════════════════════

const DS = {
  text: {
    xs: "text-[11px] font-medium",
    sm: "text-[13px] font-medium",
    mono: "font-mono text-[11px]",
    micro: "text-[9px] font-bold uppercase tracking-wider",
  },
  status: {
    DRAFT: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
    SENT: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
      dot: "bg-blue-500",
    },
    ACCEPTED: {
      bg: "bg-indigo-100",
      text: "text-indigo-700",
      border: "border-indigo-200",
      dot: "bg-indigo-500",
    },
    PAID: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    REJECTED: {
      bg: "bg-rose-100",
      text: "text-rose-700",
      border: "border-rose-200",
      dot: "bg-rose-500",
    },
  },
};

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ═══════════════════════════════════════════════════════════════
// FINANCIAL TELEMETRY HUD (Tâche 2)
// ═══════════════════════════════════════════════════════════════

function TelemetryHUD() {
  const { stats } = useQuotes();

  // Format CFA
  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Sparkline data from dailyActivity
  const sparklineData = useMemo(() => {
    if (!stats.dailyActivity) return [];
    const dates = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split("T")[0];
    });
    return dates.map((date) => stats.dailyActivity?.get(date) || 0);
  }, [stats.dailyActivity]);

  const maxValue = Math.max(...sparklineData, 1);
  const sparklinePath = sparklineData
    .map((value, i) => {
      const x = (i / (sparklineData.length - 1)) * 60;
      const y = 20 - (value / maxValue) * 20;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const hudItems = [
    {
      icon: ClockIcon,
      label: "En-cours",
      value: formatCFA(stats.totalPipelineValue),
      subtext: `${stats.countByStatus.SENT} devis envoyés`,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: TrendUpIcon,
      label: "Conversion",
      value: `${stats.conversionRate.toFixed(1)}%`,
      subtext: "Payés / Envoyés",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: CurrencyCircleDollarIcon,
      label: "Encaissé",
      value: formatCFA(stats.totalCashCollected),
      subtext: `${stats.countByStatus.PAID} devis payés`,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 px-4 py-3 border-b border-slate-200 bg-white">
      {hudItems.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-slate-50/50"
        >
          <div
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center",
              item.bg,
            )}
          >
            <item.icon size={16} className={item.color} weight="bold" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-[13px] font-bold text-slate-900 tabular-nums truncate">
                {item.value}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                {item.label}
              </span>
              <span className="text-[9px] text-slate-400">·</span>
              <span className="text-[9px] text-slate-500">{item.subtext}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Sparkline Mini Chart */}
      <div className="hidden lg:flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-slate-50/50 col-span-3 lg:col-span-1">
        <div className="flex-1">
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1">
            Pipeline 30j
          </div>
          <svg width="60" height="24" className="text-indigo-500">
            <path
              d={sparklinePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MASTER LIST ITEM - High Density (Tâche 4)
// ═══════════════════════════════════════════════════════════════

interface MasterListItemProps {
  quote: QuoteRegistryItem;
  index: number;
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

function MasterListItem({
  quote,
  index,
  isActive,
  isSelected,
  onClick,
  onContextMenu,
}: MasterListItemProps) {
  const { quickStatusChange, toggleSelection, activeQuoteId, selectQuote } =
    useQuotes();

  const totalHT = quote.lines.reduce(
    (acc, ln) => acc + ln.unitPrice * ln.quantity,
    0,
  );

  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statusStyle = DS.status[quote.status];

  // Priority sorting: DRAFT and SENT (unpaid) get priority visual
  const isPriority = quote.status === "DRAFT" || quote.status === "SENT";

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn(
        "group relative flex items-center gap-2 px-3 py-2 cursor-pointer transition-all",
        "border-b border-slate-100 hover:bg-slate-50",
        isActive && "bg-indigo-50/60 hover:bg-indigo-50/80",
        isSelected && "bg-amber-50/60",
        isPriority && !isActive && "border-l-2 border-l-amber-400",
      )}
    >
      {/* Selection Checkbox */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          toggleSelection(quote.id);
        }}
        className={cn(
          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
          isSelected
            ? "bg-indigo-500 border-indigo-500"
            : "border-slate-300 bg-white group-hover:border-slate-400",
        )}
      >
        {isSelected && (
          <CheckCircleIcon size={12} className="text-white" weight="bold" />
        )}
      </div>

      {/* Index Number */}
      <span className={cn("w-5 text-right", DS.text.mono, "text-slate-400")}>
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        {/* Ref */}
        <div className="w-20 shrink-0">
          <span className={cn(DS.text.mono, "text-slate-900 font-bold")}>
            {quote.number}
          </span>
        </div>

        {/* Client */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(DS.text.sm, "text-slate-900 truncate font-semibold")}
          >
            {quote.client.name}
          </p>
          <p className={cn(DS.text.xs, "text-slate-500 truncate")}>
            {quote.client.email}
          </p>
        </div>

        {/* Amount */}
        <div className="w-24 text-right shrink-0">
          <p
            className={cn(DS.text.sm, "font-bold text-slate-900 tabular-nums")}
          >
            {formatCFA(totalHT)}
          </p>
        </div>

        {/* Status Badge - High Saturation for small size */}
        <div className="w-20 shrink-0 flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                  "border transition-colors flex items-center gap-1",
                  statusStyle.bg,
                  statusStyle.text,
                  statusStyle.border,
                )}
              >
                <span
                  className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)}
                />
                {quote.status}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              {(
                [
                  "DRAFT",
                  "SENT",
                  "ACCEPTED",
                  "PAID",
                  "REJECTED",
                ] as QuoteStatus[]
              ).map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => quickStatusChange(quote.id, status)}
                  className={cn(
                    "text-[11px] font-bold uppercase cursor-pointer",
                    quote.status === status && "bg-slate-100",
                  )}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full mr-2",
                      DS.status[status].dot,
                    )}
                  />
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500"
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MASTER PANE (Sidebar Gauche - 30%)
// ═══════════════════════════════════════════════════════════════

function MasterPane() {
  const {
    filteredQuotes,
    searchQuery,
    setSearchQuery,
    activeQuoteId,
    selectQuote,
    selectedQuoteIds,
    toggleSelection,
    selectAll,
    clearSelection,
  } = useQuotes();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    quoteId: string | null;
  }>({ x: 0, y: 0, quoteId: null });

  const activeIndex = filteredQuotes.findIndex((q) => q.id === activeQuoteId);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const currentIndex = activeQuoteId
          ? filteredQuotes.findIndex((q) => q.id === activeQuoteId)
          : -1;

        let newIndex: number;
        if (e.key === "ArrowUp") {
          newIndex =
            currentIndex <= 0 ? filteredQuotes.length - 1 : currentIndex - 1;
        } else {
          newIndex =
            currentIndex >= filteredQuotes.length - 1 ? 0 : currentIndex + 1;
        }

        if (filteredQuotes[newIndex]) {
          selectQuote(filteredQuotes[newIndex].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredQuotes, activeQuoteId, selectQuote]);

  return (
    <div className="w-[30%] min-w-[320px] flex flex-col border-r border-slate-200 bg-white">
      {/* Master Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className={cn(DS.text.micro, "text-slate-500")}>Devis</span>
          <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
            {filteredQuotes.length.toString().padStart(3, "0")}
          </span>
          {selectedQuoteIds.size > 0 && (
            <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1">
              <SelectionBackgroundIcon size={10} />
              {selectedQuoteIds.size}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedQuoteIds.size > 0 && (
            <button
              onClick={clearSelection}
              className="text-[9px] text-slate-400 hover:text-slate-600 px-2 py-1"
            >
              Vider
            </button>
          )}
          <button
            onClick={selectAll}
            className="text-[9px] text-slate-400 hover:text-slate-600 px-2 py-1"
          >
            Tout
          </button>
        </div>
      </div>

      {/* Smart Search Input */}
      <div className="px-3 py-2 border-b border-slate-200">
        <div className="relative">
          <MagnifyingGlassIcon
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nom, >5000, 2024-01..."
            className="w-full h-8 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <XCircleIcon size={14} />
            </button>
          )}
        </div>
        <p className="mt-1 text-[9px] text-slate-400">
          ↑↓ naviguer · → prévisualiser · Clique-droit statut
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredQuotes.map((quote, index) => (
          <MasterListItem
            key={quote.id}
            quote={quote}
            index={index}
            isActive={activeQuoteId === quote.id}
            isSelected={selectedQuoteIds.has(quote.id)}
            onClick={() => selectQuote(quote.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, quoteId: quote.id });
            }}
          />
        ))}
      </div>

      {/* Batch Actions Footer */}
      <AnimatePresence>
        {selectedQuoteIds.size > 1 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="border-t border-slate-200 bg-amber-50 px-3 py-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800">
                {selectedQuoteIds.size} devis sélectionnés
              </span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded text-[11px] font-bold hover:bg-amber-700 transition-colors">
                <DownloadSimpleIcon size={12} weight="bold" />
                Export PDF
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// A4 LIVE PREVIEW PANE (Centre - 50%) - Tâche 1
// ═══════════════════════════════════════════════════════════════

function A4LivePreview() {
  const { activeQuoteId, filteredQuotes } = useQuotes();
  const [isPending, startTransition] = useTransition();

  const activeQuote = filteredQuotes.find((q) => q.id === activeQuoteId);

  if (!activeQuote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <FileTextIcon
            size={48}
            className="text-slate-300 mx-auto mb-3"
            weight="duotone"
          />
          <p className="text-[13px] text-slate-500 font-medium">
            Sélectionnez un devis pour prévisualiser
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Utilisez les flèches pour naviguer
          </p>
        </div>
      </div>
    );
  }

  const totalHT = activeQuote.lines.reduce(
    (acc, ln) => acc + ln.unitPrice * ln.quantity,
    0,
  );
  const totalTTC = totalHT * (1 + activeQuote.vatRatePercent / 100);

  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: activeQuote.currency || "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex-1 bg-slate-100 overflow-auto p-6">
      <motion.div
        key={activeQuote.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
        className="max-w-[210mm] mx-auto bg-white shadow-lg min-h-[297mm] p-[15mm]"
      >
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-[24px] font-black text-slate-900 uppercase tracking-tight">
                Devis
              </h1>
              <p className="text-[13px] text-slate-500 mt-1">
                {activeQuote.number}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-400">Date d'émission</p>
              <p className="text-[13px] font-bold text-slate-900">
                {new Date(activeQuote.issueDate).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        </div>

        {/* Company / Client Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Émetteur
            </p>
            <p className="text-[13px] font-bold text-slate-900">
              {activeQuote.companyName || "Votre Entreprise"}
            </p>
            <p className="text-[11px] text-slate-600">
              {activeQuote.companyAddress}
            </p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
              Client
            </p>
            {/* Ghost Editable Name */}
            <div className="group cursor-text">
              <p className="text-[13px] font-bold text-slate-900 border-b border-transparent group-hover:border-indigo-300 group-focus-within:border-indigo-500 transition-colors">
                {activeQuote.clientName || activeQuote.client.name}
              </p>
              <p className="text-[9px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Cliquer pour modifier
              </p>
            </div>
            <p className="text-[11px] text-slate-600">
              {activeQuote.clientAddress || activeQuote.client.address}
            </p>
          </div>
        </div>

        {/* Lines Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b-2 border-slate-900">
              <th className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 py-2">
                Description
              </th>
              <th className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 py-2 w-20">
                Qté
              </th>
              <th className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 py-2 w-28">
                PU
              </th>
              <th className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 py-2 w-28">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {activeQuote.lines.map((line, i) => (
              <tr
                key={line.id}
                className="border-b border-slate-100 group hover:bg-slate-50"
              >
                <td className="py-2">
                  <div className="group/editable cursor-text">
                    <p className="text-[12px] text-slate-900 font-medium">
                      {line.title}
                    </p>
                    {line.subtitle && (
                      <p className="text-[10px] text-slate-500">
                        {line.subtitle}
                      </p>
                    )}
                    <p className="text-[9px] text-indigo-400 opacity-0 group-hover/editable:opacity-100 transition-opacity">
                      ✎ Modifier
                    </p>
                  </div>
                </td>
                <td className="text-right py-2">
                  <span className="text-[12px] text-slate-900 tabular-nums">
                    {line.quantity}
                  </span>
                </td>
                <td className="text-right py-2">
                  <span className="text-[12px] text-slate-900 tabular-nums">
                    {formatCFA(line.unitPrice)}
                  </span>
                </td>
                <td className="text-right py-2">
                  <span className="text-[12px] font-bold text-slate-900 tabular-nums">
                    {formatCFA(line.unitPrice * line.quantity)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-[12px]">
              <span className="text-slate-500">Total HT</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatCFA(totalHT)}
              </span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-slate-500">
                TVA ({activeQuote.vatRatePercent}%)
              </span>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatCFA(totalHT * (activeQuote.vatRatePercent / 100))}
              </span>
            </div>
            <div className="flex justify-between text-[16px] font-black border-t-2 border-slate-900 pt-2">
              <span className="text-slate-900">Total TTC</span>
              <span className="text-slate-900 tabular-nums">
                {formatCFA(totalTTC)}
              </span>
            </div>
          </div>
        </div>

        {/* Terms */}
        {activeQuote.terms && (
          <div className="mt-8 p-3 bg-slate-50 rounded text-[11px] text-slate-600">
            <p className="font-bold text-slate-700 mb-1">Conditions</p>
            {activeQuote.terms}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ACTION & TELEMETRY PANEL (Droite - 20%)
// ═══════════════════════════════════════════════════════════════

function ActionPanel() {
  const {
    activeQuoteId,
    filteredQuotes,
    timeline,
    isLoadingTimeline,
    quickStatusChange,
  } = useQuotes();

  const activeQuote = filteredQuotes.find((q) => q.id === activeQuoteId);

  if (!activeQuote) {
    return (
      <div className="w-[20%] min-w-[200px] bg-white border-l border-slate-200 p-4">
        <p className="text-[13px] text-slate-400 text-center">
          Sélectionnez un devis
        </p>
      </div>
    );
  }

  const statusStyle = DS.status[activeQuote.status];

  return (
    <div className="w-[20%] min-w-[200px] bg-white border-l border-slate-200 flex flex-col">
      {/* Actions Header */}
      <div className="p-3 border-b border-slate-200">
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Actions Rapides
        </p>
        <div className="space-y-1.5">
          <button className="w-full flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded text-[12px] font-bold hover:bg-indigo-700 transition-colors">
            <EnvelopeSimpleIcon size={14} weight="bold" />
            Envoyer
          </button>
          <div className="flex gap-1.5">
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded text-[11px] font-bold hover:bg-slate-200 transition-colors">
              <DownloadSimpleIcon size={14} weight="bold" />
              PDF
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded text-[11px] font-bold hover:bg-slate-200 transition-colors">
              <CopyIcon size={14} weight="bold" />
              Dup.
            </button>
          </div>
        </div>
      </div>

      {/* Status Transition */}
      <div className="p-3 border-b border-slate-200">
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Changement de Statut
        </p>
        <div className="flex flex-wrap gap-1">
          {(["DRAFT", "SENT", "ACCEPTED", "PAID", "REJECTED"] as QuoteStatus[])
            .filter((s) => s !== activeQuote.status)
            .map((status) => (
              <button
                key={status}
                onClick={() => quickStatusChange(activeQuote.id, status)}
                className={cn(
                  "px-2 py-1 rounded text-[10px] font-bold uppercase border transition-colors",
                  DS.status[status].bg,
                  DS.status[status].text,
                  DS.status[status].border,
                )}
              >
                → {status}
              </button>
            ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          Historique
        </p>
        {isLoadingTimeline ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : timeline.length === 0 ? (
          <p className="text-[11px] text-slate-400">Aucun historique</p>
        ) : (
          <div className="space-y-3">
            {timeline.map((event, index) => (
              <div key={event.id} className="flex gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  {index < timeline.length - 1 && (
                    <div className="w-px flex-1 bg-slate-200 my-1" />
                  )}
                </div>
                <div className="flex-1 pb-3">
                  <p className="text-[11px] font-bold text-slate-900">
                    {event.type === "created" && "Création"}
                    {event.type === "sent" && "Envoyé"}
                    {event.type === "status_changed" && `→ ${event.status}`}
                    {event.type === "viewed" && "Consulté"}
                  </p>
                  <p className="text-[9px] text-slate-500">
                    {new Date(event.createdAt).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">ID</span>
            <span className="font-mono text-slate-600">
              {activeQuote.id.slice(0, 8)}
            </span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">Modifié</span>
            <span className="text-slate-600">
              {new Date(activeQuote.updatedAt).toLocaleDateString("fr-FR")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN TRIPLE-PANE LAYOUT
// ═══════════════════════════════════════════════════════════════

export function SpatialQuotesView() {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Telemetry HUD - Top Bar */}
      <TelemetryHUD />

      {/* Triple-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Master Pane - 30% */}
        <MasterPane />

        {/* A4 Live Preview - 50% */}
        <A4LivePreview />

        {/* Action & Telemetry Panel - 20% */}
        <ActionPanel />
      </div>
    </div>
  );
}

export default SpatialQuotesView;
