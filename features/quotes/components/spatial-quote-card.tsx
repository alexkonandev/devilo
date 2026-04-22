"use client";

import React from "react";
import { QuoteRegistryItem } from "@/types/quote-registry";
import { cn } from "@/lib/utils";
import {
  ClockIcon,
  PaperPlaneTiltIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  DotsThreeVerticalIcon,
  PencilSimpleIcon,
  TrashIcon,
  CoinsIcon,
  CalendarBlankIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useQuotes } from "./quote-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ═══════════════════════════════════════════════════════════════
// STATUS CONFIG
// ═══════════════════════════════════════════════════════════════

const statusConfig: Record<
  string,
  { color: string; bg: string; border: string; icon: React.ElementType; label: string }
> = {
  DRAFT: {
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: ClockIcon,
    label: "Brouillon",
  },
  SENT: {
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: PaperPlaneTiltIcon,
    label: "Envoyé",
  },
  ACCEPTED: {
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    icon: CheckCircleIcon,
    label: "Accepté",
  },
  PAID: {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CoinsIcon,
    label: "Payé",
  },
  REJECTED: {
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: WarningCircleIcon,
    label: "Refusé",
  },
};

// ═══════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════

function formatCFA(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

interface QuoteRowProps {
  quote: QuoteRegistryItem;
}

export function QuoteRow({ quote }: QuoteRowProps) {
  const { updateStatus, deleteQuote } = useQuotes();
  const config = statusConfig[quote.status] || statusConfig.DRAFT;
  const StatusIcon = config.icon;

  const totalHT = quote.lines.reduce(
    (acc, ln) => acc + ln.unitPrice * ln.quantity,
    0
  );

  const dateFormatted = new Date(quote.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="group grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-5 items-center hover:bg-slate-50 transition-all rounded-xl cursor-default">
      {/* Reference */}
      <div className="md:col-span-2">
        <span className="font-mono text-[11px] font-bold text-indigo-500 uppercase tracking-widest">
          {quote.number}
        </span>
      </div>

      {/* Client */}
      <div className="md:col-span-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-[11px] font-black text-slate-500 shrink-0">
          {quote.client.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate tracking-tight">
            {quote.client.name}
          </p>
          {quote.client.email && (
            <p className="text-[10px] text-slate-400 truncate">
              {quote.client.email}
            </p>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="md:col-span-2 md:text-right">
        <span className="font-mono text-base font-black text-slate-800 tracking-tighter italic">
          {formatCFA(totalHT)}
        </span>
      </div>

      {/* Status Badge */}
      <div className="md:col-span-2 md:flex md:justify-center">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[9px] font-black uppercase tracking-widest",
            config.color,
            config.bg,
            config.border
          )}
        >
          <StatusIcon size={12} weight="fill" />
          {config.label}
        </span>
      </div>

      {/* Date */}
      <div className="md:col-span-2 flex items-center gap-1.5">
        <CalendarBlankIcon size={12} weight="bold" className="text-slate-300" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {dateFormatted}
        </span>
      </div>

      {/* Actions Dropdown */}
      <div className="md:col-span-1 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger className="opacity-50 group-hover:opacity-100 transition-opacity p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 outline-none">
            <DotsThreeVerticalIcon size={18} weight="bold" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-white border-slate-200 text-slate-700 rounded-xl shadow-xl shadow-slate-200/50"
          >
            <DropdownMenuLabel className="text-[9px] uppercase tracking-[0.2em] text-slate-400">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />

            <DropdownMenuItem
              asChild
              className="focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer"
            >
              <Link
                href={`/quotes/${quote.id}/edit`}
                className="flex items-center gap-2 text-xs font-bold"
              >
                <PencilSimpleIcon size={14} />
                Modifier
              </Link>
            </DropdownMenuItem>

            {quote.status !== "PAID" && (
              <DropdownMenuItem
                onClick={() => updateStatus(quote.id, "PAID")}
                className="focus:bg-emerald-50 focus:text-emerald-600 cursor-pointer flex items-center gap-2 text-xs font-bold text-emerald-600"
              >
                <CoinsIcon size={14} />
                Encaisser
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-slate-100" />

            <DropdownMenuItem
              onClick={() => deleteQuote(quote.id)}
              className="focus:bg-rose-50 focus:text-rose-600 cursor-pointer flex items-center gap-2 text-xs font-bold text-rose-500"
            >
              <TrashIcon size={14} />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
