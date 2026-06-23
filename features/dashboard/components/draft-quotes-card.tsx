"use client";

import React from "react";
import Link from "next/link";
import { FileTextIcon, PlusIcon } from "@phosphor-icons/react";
import { cn, formatPriceCompact } from "@/lib/utils";
import { BTN_PRIMARY } from "@/components/shared/ui/constants";
import {
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_BENTO_CARD,
  DS_SECTION_HEADER,
  DS_ICON_WRAPPER,
  DS_ICON_SM,
} from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════════════════════
// DRAFT QUOTES CARD — Brouillons en cours
// ═══════════════════════════════════════════════════════════════════════════════

interface DraftQuoteItem {
  id: string;
  projetTitre: string;
  clientNom: string;
  montant: number;
  date: string;
}

interface DraftQuotesCardProps {
  items: DraftQuoteItem[];
}

export function DraftQuotesCard({ items }: DraftQuotesCardProps) {
  return (
    <div className={cn(DS_BENTO_CARD, "p-0 overflow-hidden")}>
      <div
        className={cn(
          DS_SECTION_HEADER,
          "px-3 py-2 border-b border-slate-100/60 mb-0",
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
            <FileTextIcon size={DS_ICON_SM} className="text-indigo-500" />
          </div>
          <span className={cn(DS_MICRO, "text-slate-600")}>
            Brouillons en cours
          </span>
        </div>
        <Link href="/quotes/new" className={BTN_PRIMARY}>
          <PlusIcon size={DS_ICON_SM} weight="bold" />
          Créer
        </Link>
      </div>
      <div className="max-h-48 overflow-y-auto p-2 space-y-1.5">
        {items.map((draft) => (
          <Link
            key={draft.id}
            href={`/quotes?id=${draft.id}`}
            className={cn(
              DS_BENTO_CARD,
              "block hover:border-indigo-300 transition-colors",
            )}
          >
            <div className="flex items-start justify-between mb-1">
              <span
                className={cn(
                  DS_MONO,
                  "font-bold text-slate-900 truncate max-w-[140px]",
                )}
              >
                {draft.projetTitre}
              </span>
              <span className={cn(DS_MONO, "font-bold text-slate-700")}>
                {formatPriceCompact(draft.montant)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={cn(DS_LABEL, "text-slate-500")}>{draft.clientNom}</span>
              <span className={cn(DS_MICRO, "text-slate-400")}>{draft.date}</span>
            </div>
          </Link>
        ))}
        {items.length === 0 && (
          <div className="border border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center">
            <FileTextIcon size={24} className="text-slate-300 mb-2" />
            <p className={cn(DS_MONO, "text-slate-400")}>Aucun brouillon</p>
            <p className={cn(DS_LABEL, "text-slate-300")}>Créez un nouveau devis</p>
          </div>
        )}
      </div>
    </div>
  );
}