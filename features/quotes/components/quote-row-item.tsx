"use client";

import React from "react";
import { QuoteRegistryItem } from "@/types/quote-registry";
import { useQuotes } from "./quote-context";
import { cn } from "@/lib/utils";
import {
  DotsThreeVertical,
  ArrowSquareOut,
  DownloadSimple,
  Trash,
  CheckCircle,
  Clock,
  WarningCircle,
  Icon,
} from "@phosphor-icons/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuoteRowItemProps {
  quote: QuoteRegistryItem;
}

export function QuoteRowItem({ quote }: QuoteRowItemProps) {
  const { updateStatus, deleteQuote } = useQuotes();

  const totalHT = quote.lines.reduce(
    (acc, ln) => acc + ln.unitPrice * ln.quantity,
    0
  );

  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statusStyles: Record<
    string,
    { border: string; text: string; icon: Icon }
  > = {
    DRAFT: { border: "border-amber-200", text: "text-amber-600", icon: Clock },
    SENT: {
      border: "border-blue-200",
      text: "text-blue-600",
      icon: ArrowSquareOut,
    },
    ACCEPTED: {
      border: "border-indigo-200",
      text: "text-indigo-600",
      icon: CheckCircle,
    },
    PAID: {
      border: "border-emerald-200",
      text: "text-emerald-600",
      icon: CheckCircle,
    },
    REJECTED: {
      border: "border-rose-200",
      text: "text-rose-600",
      icon: WarningCircle,
    },
  };

  const currentStatus = statusStyles[quote.status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="group grid grid-cols-12 items-center px-4 py-2 bg-white border-b border-slate-200 hover:bg-slate-50 transition-colors rounded-none shadow-none">
      {/* RÉFÉRENCE : MONO & DENSE */}
      <div className="col-span-2 flex flex-col gap-0.5">
        <span className="font-mono text-[11px] font-black uppercase text-slate-900 leading-none">
          {quote.number}
        </span>
        <span className="font-mono text-[9px] text-slate-400 uppercase tracking-tighter">
          {new Date(quote.createdAt).toLocaleDateString("fr-FR")}
        </span>
      </div>

      {/* CLIENT : FOCUS NOM */}
      <div className="col-span-4 flex flex-col">
        <span className="text-[12px] font-bold text-slate-800 uppercase tracking-tight truncate pr-4">
          {quote.client.name}
        </span>
        <span className="text-[10px] text-slate-400 font-medium truncate pr-4">
          {quote.client.email}
        </span>
      </div>

      {/* FINANCE : ALIGNEMENT DROITE STRICT */}
      <div className="col-span-2 text-right">
        <span className="font-mono text-[13px] font-black text-slate-900 tabular-nums">
          {formatCFA(totalHT)}
        </span>
      </div>

      {/* STATUT : BADGE INDUSTRIEL (SANS BG) */}
      <div className="col-span-2 flex justify-center">
        <div
          className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 border rounded-none text-[9px] font-black uppercase tracking-widest",
            currentStatus.border,
            currentStatus.text
          )}
        >
          <StatusIcon size={12} weight="bold" />
          {quote.status}
        </div>
      </div>

      {/* ACTIONS : DISCRET & RÉACTIF */}
      <div className="col-span-2 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 hover:text-indigo-600 outline-none transition-colors cursor-pointer">
            <DotsThreeVertical
              size={18}
              weight="bold"
              className="text-slate-400"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-none border-slate-200 shadow-none min-w-[180px]"
          >
            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Opérations
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem
              asChild
              className="rounded-none focus:bg-slate-50 cursor-pointer"
            >
              <Link
                href={`/quotes/${quote.id}/edit`}
                className="flex items-center gap-2 text-[11px] font-bold uppercase"
              >
                <ArrowSquareOut size={14} className="text-slate-400" /> Éditer
                l'actif
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-none focus:bg-slate-50 cursor-pointer flex items-center gap-2 text-[11px] font-bold uppercase">
              <DownloadSimple size={14} className="text-slate-400" /> Exporter
              PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            {quote.status !== "PAID" && (
              <DropdownMenuItem
                onClick={() => updateStatus(quote.id, "PAID")}
                className="rounded-none focus:bg-emerald-50 text-emerald-600 cursor-pointer flex items-center gap-2 text-[11px] font-black uppercase"
              >
                <CheckCircle size={14} weight="bold" /> Encaisser flux
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => deleteQuote(quote.id)}
              className="rounded-none focus:bg-rose-50 text-rose-600 cursor-pointer flex items-center gap-2 text-[11px] font-black uppercase"
            >
              <Trash size={14} weight="bold" /> Purger archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
