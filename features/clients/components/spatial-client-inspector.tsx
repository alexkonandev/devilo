"use client";

import React from "react";
import { ClientListItem } from "@/types/client";
import { SpatialCard } from "@/features/dashboard/components/spatial-card";
import { cn } from "@/lib/utils";
import {
  MapPinIcon,
  EnvelopeSimpleIcon,
  BuildingsIcon,
  ClockCounterClockwiseIcon,
  XIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { EditClientDialog } from "../edit-client-dialog";

// ═══════════════════════════════════════════════════════════════
// STATUS LABELS
// ═══════════════════════════════════════════════════════════════

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Brouillon", color: "text-amber-600 bg-amber-50 border-amber-200" },
  SENT: { label: "Envoyé", color: "text-blue-600 bg-blue-50 border-blue-200" },
  ACCEPTED: { label: "Accepté", color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  REJECTED: { label: "Refusé", color: "text-rose-600 bg-rose-50 border-rose-200" },
  PAID: { label: "Payé", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
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
  return (
    <SpatialCard
      depth={3}
      variant="glass"
      className="h-full flex flex-col border-l border-slate-200/60 rounded-l-2xl rounded-r-none relative overflow-hidden"
    >
      {/* ─── CLOSE BUTTON ─── */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={onClose}
          className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-600 transition-all hover:scale-105"
        >
          <XIcon size={16} weight="bold" />
        </button>
      </div>

      {/* ─── HEADER ─── */}
      <div className="p-8 pb-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-500">
              Dossier Client
            </span>
          </div>
          <EditClientDialog
            client={client}
            trigger={
              <button className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 text-indigo-500 hover:text-indigo-600 transition-all">
                <PencilSimpleIcon size={14} weight="bold" />
              </button>
            }
          />
        </div>

        <h2 className="text-3xl font-black text-slate-900 italic tracking-tight mb-3">
          {client.name}
        </h2>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <EnvelopeSimpleIcon size={14} weight="bold" className="text-slate-400" />
            {client.email || "Non renseigné"}
          </div>
          {client.taxId && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <BuildingsIcon size={14} weight="bold" className="text-slate-400" />
              {client.taxId}
            </div>
          )}
        </div>
      </div>

      {/* ─── SCROLLABLE BODY ─── */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
        {/* KPI Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2">
              Chiffre d&apos;Affaires
            </span>
            <p className="text-xl font-mono font-black text-slate-900 tracking-tighter italic">
              {formatCFA(client.totalSpent)}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2">
              Devis Générés
            </span>
            <p className="text-xl font-mono font-black text-slate-900 tracking-tighter italic">
              {client.quoteCount}
            </p>
          </div>
        </div>

        {/* Address */}
        {client.address && (
          <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-200/60 flex items-start gap-3">
            <MapPinIcon
              size={16}
              weight="bold"
              className="text-slate-400 mt-0.5 shrink-0"
            />
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-1">
                Localisation
              </span>
              <p className="text-sm text-slate-600 font-medium">
                {client.address}
              </p>
            </div>
          </div>
        )}

        {/* Activity Feed */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ClockCounterClockwiseIcon
              size={14}
              weight="bold"
              className="text-slate-400"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Historique des transactions
            </span>
          </div>

          <div className="space-y-2">
            {client.quotes && client.quotes.length > 0 ? (
              client.quotes.map((quote) => {
                const status = STATUS_LABELS[quote.status] || STATUS_LABELS.DRAFT;
                return (
                  <div
                    key={quote.id}
                    className="group p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/60 hover:border-indigo-200/60 transition-all flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {quote.number}
                        </span>
                        <span
                          className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border",
                            status.color
                          )}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(quote.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <span className="text-sm font-mono font-bold text-slate-800">
                      {formatCFA(quote.totalAmount)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-400 italic">
                  Aucune activité récente.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SpatialCard>
  );
}
