"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  DS_BENTO_CARD,
  DS_ICON_WRAPPER,
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_BADGE_SUCCESS,
  DS_BADGE_WARNING,
  DS_BADGE_DANGER,
  DS_ICON_SM,
} from "@/lib/design-system";
import {
  ReceiptIcon,
  ArrowSquareOutIcon,
} from "@phosphor-icons/react";
import type { BillingProfile } from "@/actions/billing-action";

interface InvoicesCardProps {
  invoices: BillingProfile["invoices"];
  className?: string;
}

export function InvoicesCard({ invoices, className }: InvoicesCardProps) {
  return (
    <div className={cn(DS_BENTO_CARD, "p-3", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className={cn(DS_ICON_WRAPPER, "bg-slate-50")}>
            <ReceiptIcon size={DS_ICON_SM} className="text-slate-400" />
          </div>
          <span className={cn(DS_MICRO)}>
            Historique Factures
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn(DS_MONO, "text-[9px] text-slate-400")}>
            {invoices.length} facture{invoices.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="py-8 text-center">
          <div
            className={cn(
              DS_ICON_WRAPPER,
              "bg-slate-50 mx-auto mb-3 w-10 h-10",
            )}
          >
            <ReceiptIcon size={16} className="text-slate-300" />
          </div>
          <p className="text-xs text-slate-400 mb-1">Aucune facture</p>
          <p className="text-[10px] text-slate-300">
            Vos factures apparaîtront ici après votre premier paiement.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between p-2.5 rounded border border-slate-200 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn(DS_ICON_WRAPPER, "bg-slate-50")}>
                  <ReceiptIcon size={DS_ICON_SM} className="text-slate-400" />
                </div>
                <div>
                  <span className={cn(DS_MONO, "text-slate-700 block")}>
                    {new Date(inv.date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {inv.id.slice(0, 16)}...
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(DS_MONO, "text-slate-900 font-bold")}>
                  {inv.amount.toLocaleString("fr-FR")} {inv.currency}
                </span>
                <span
                  className={
                    inv.status === "paid"
                      ? DS_BADGE_SUCCESS
                      : inv.status === "open"
                        ? DS_BADGE_WARNING
                        : DS_BADGE_DANGER
                  }
                >
                  {inv.status === "paid"
                    ? "PAYÉ"
                    : inv.status === "open"
                      ? "EN ATTENTE"
                      : inv.status.toUpperCase()}
                </span>
                {inv.pdfUrl && (
                  <a
                    href={inv.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 hover:text-indigo-600"
                  >
                    <ArrowSquareOutIcon size={DS_ICON_SM} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}