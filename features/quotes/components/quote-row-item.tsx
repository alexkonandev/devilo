"use client";

import React from "react";
import { QuoteRegistryItem } from "@/types/quote-registry";
import { useQuotes } from "./quote-context";
import { cn } from "@/lib/utils";
import {
  MoreVertical,
  ExternalLink,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Assure-toi d'avoir shadcn/ui dropdown
import { Icon } from "@phosphor-icons/react";

interface QuoteRowItemProps {
  quote: QuoteRegistryItem;
}

export function QuoteRowItem({ quote }: QuoteRowItemProps) {
  const { updateStatus, deleteQuote } = useQuotes();

  // 1. CALCUL DU MONTANT HT (Logique métier rapide)
  const totalHT = quote.lines.reduce(
    (acc, ln) => acc + ln.unitPrice * ln.quantity,
    0
  );

  // 2. FORMATAGE CFA STRICT
  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // 3. CONFIGURATION DES BADGES
  const statusStyles: Record<string, { bg: string; text: string; icon: Icon }> =
    {
      DRAFT: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
      SENT: { bg: "bg-blue-100", text: "text-blue-700", icon: ExternalLink },
      ACCEPTED: {
        bg: "bg-indigo-100",
        text: "text-indigo-700",
        icon: CheckCircle,
      },
      PAID: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: CheckCircle,
      },
      REJECTED: { bg: "bg-rose-100", text: "text-rose-700", icon: AlertCircle },
    };

  const currentStatus = statusStyles[quote.status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="group grid grid-cols-12 items-center px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-200 animate-in fade-in slide-in-from-left-2">
      {/* RÉFÉRENCE */}
      <div className="col-span-2 flex flex-col">
        <span className="text-xs font-black text-slate-900 tracking-tight">
          {quote.number}
        </span>
        <span className="text-[10px] text-slate-400 font-medium">
          {new Date(quote.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* CLIENT */}
      <div className="col-span-4 flex flex-col">
        <span className="text-sm font-bold text-slate-700 truncate pr-4">
          {quote.client.name}
        </span>
        <span className="text-[10px] text-slate-400 truncate pr-4">
          {quote.client.email}
        </span>
      </div>

      {/* MONTANT HT */}
      <div className="col-span-2 text-right">
        <span className="text-sm font-black text-slate-900">
          {formatCFA(totalHT)}
        </span>
      </div>

      {/* STATUT (BADGE) */}
      <div className="col-span-2 flex justify-center">
        <div
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
            currentStatus.bg,
            currentStatus.text
          )}
        >
          <StatusIcon className="w-3 h-3" />
          {quote.status}
        </div>
      </div>

      {/* ACTIONS (DROPDOWN) */}
      <div className="col-span-2 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-900 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions du devis</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Lien vers ton éditeur existant */}
            <DropdownMenuItem asChild>
              <Link
                href={`/quotes/${quote.id}/edit`}
                className="cursor-pointer flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-blue-500" /> Modifier le
                devis
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
              <Download className="w-4 h-4 text-slate-500" /> Télécharger PDF
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Changement de statut rapide */}
            {quote.status !== "PAID" && (
              <DropdownMenuItem
                onClick={() => updateStatus(quote.id, "PAID")}
                className="cursor-pointer flex items-center gap-2 text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
              >
                <CheckCircle className="w-4 h-4" /> Marquer comme PAYÉ
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => deleteQuote(quote.id)}
              className="cursor-pointer flex items-center gap-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50"
            >
              <Trash2 className="w-4 h-4" /> Supprimer l&apos;archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
