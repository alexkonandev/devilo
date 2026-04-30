"use client";

import React from "react";
import { ClientListItem } from "@/types/client";
import { cn } from "@/lib/utils";
import {
  MapPinIcon,
  EnvelopeSimpleIcon,
  BuildingsIcon,
  ClockCounterClockwiseIcon,
  XIcon,
  PencilSimpleIcon,
  CurrencyCircleDollarIcon,
  FileTextIcon,
} from "@phosphor-icons/react";
import { EditClientDialog } from "../edit-client-dialog";

// ═══════════════════════════════════════════════════════════════
// STATUS LABELS
// ═══════════════════════════════════════════════════════════════

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: {
    label: "Brouillon",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  SENT: { label: "Envoyé", color: "text-blue-600 bg-blue-50 border-blue-200" },
  ACCEPTED: {
    label: "Accepté",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
  REJECTED: {
    label: "Refusé",
    color: "text-rose-600 bg-rose-50 border-rose-200",
  },
  PAID: {
    label: "Payé",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
};

// ═══════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════

function formatCFA(amount: number): string {
  return new Intl.NumberFormat("fr-CI", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

interface SpatialClientInspectorProps {
  client: ClientListItem;
  onClose?: () => void;
}

export function SpatialClientInspector({
  client,
  onClose,
}: SpatialClientInspectorProps) {
  const isVIP = client.totalSpent > 1_000_000;

  return (
    <div className="h-full flex flex-col bg-white/95 backdrop-blur-md border-l border-slate-200/60 overflow-hidden">
      {/* ─── HEADER ─── */}
      <div className="px-5 py-4 border-b border-slate-100 shrink-0">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_6px_rgba(99,102,241,0.4)]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-indigo-500">
              Dossier Client
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <EditClientDialog
              client={client}
              trigger={
                <button className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 hover:border-indigo-200 text-slate-400 hover:text-indigo-500 transition-all">
                  <PencilSimpleIcon size={13} weight="bold" />
                </button>
              }
            />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200/60 hover:border-rose-200 text-slate-400 hover:text-rose-500 transition-all"
            >
              <XIcon size={13} weight="bold" />
            </button>
          </div>
        </div>

        {/* Avatar + Identity */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border",
              isVIP
                ? "bg-amber-50 text-amber-600 border-amber-200"
                : "bg-indigo-50 text-indigo-600 border-indigo-200/60",
            )}
          >
            {client.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-black text-slate-900 tracking-tight truncate">
              {client.name}
            </h2>
            <div className="flex flex-col gap-0.5 mt-0.5">
              {client.email && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <EnvelopeSimpleIcon size={10} weight="bold" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
              {client.taxId && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <BuildingsIcon size={10} weight="bold" />
                  <span>{client.taxId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── KPI STRIP ─── */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100 shrink-0">
        <div className="px-5 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <CurrencyCircleDollarIcon
              size={10}
              weight="bold"
              className="text-slate-400"
            />
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">
              CA Total
            </span>
          </div>
          <p
            className={cn(
              "text-sm font-mono font-black tracking-tight",
              isVIP ? "text-amber-500" : "text-slate-900",
            )}
          >
            {formatCFA(client.totalSpent)}
          </p>
        </div>
        <div className="px-5 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <FileTextIcon size={10} weight="bold" className="text-slate-400" />
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Devis
            </span>
          </div>
          <p className="text-sm font-mono font-black text-slate-900">
            {client.quoteCount}
          </p>
        </div>
      </div>

      {/* ─── ADDRESS ─── */}
      {client.address && (
        <div className="px-5 py-3 border-b border-slate-100 shrink-0">
          <div className="flex items-start gap-2">
            <MapPinIcon
              size={12}
              weight="bold"
              className="text-slate-400 mt-0.5 shrink-0"
            />
            <div>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-0.5">
                Adresse
              </span>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {client.address}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── ACTIVITY FEED ─── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-3 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <div className="flex items-center gap-1.5">
            <ClockCounterClockwiseIcon
              size={11}
              weight="bold"
              className="text-slate-400"
            />
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Historique des transactions
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100/60">
          {client.quotes && client.quotes.length > 0 ? (
            client.quotes.map((quote) => {
              const status = STATUS_LABELS[quote.status] || STATUS_LABELS.DRAFT;
              return (
                <div
                  key={quote.id}
                  className="group px-5 py-3 hover:bg-slate-50 transition-colors flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {quote.number}
                      </span>
                      <span
                        className={cn(
                          "text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border",
                          status.color,
                        )}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-mono">
                      {new Date(quote.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {formatCFA(quote.totalAmount)}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center">
              <p className="text-[10px] text-slate-400">
                Aucune activité récente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
