"use client";

import React from "react";
import { ClientListItem } from "@/types/client";
import { cn } from "@/lib/utils";
import {
  EnvelopeSimpleIcon,
  MapPinIcon,
  HashIcon,
  FileTextIcon,
  CurrencyCircleDollarIcon,
} from "@phosphor-icons/react";

interface ClientListRowDenseProps {
  client: ClientListItem;
  isActive: boolean;
  onClick: () => void;
}

// ═══════════════════════════════════════════════════════════════
// DENSE CLIENT LIST ROW - Maximum Data Density
// ═══════════════════════════════════════════════════════════════

export function ClientListRowDense({
  client,
  isActive,
  onClick,
}: ClientListRowDenseProps) {
  // Format date: "12 janv. 2024"
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format montant: "1.2M" ou "450k"
  const formatCompact = (amount: number) => {
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}M`;
    }
    return `${(amount / 1000).toFixed(0)}k`;
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all",
        "hover:bg-slate-50",
        isActive && "bg-indigo-50/50 hover:bg-indigo-50/70"
      )}
    >
      {/* ─── AVATAR ─── */}
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 transition-colors",
          isActive
            ? "bg-indigo-100 text-indigo-600"
            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
        )}
      >
        {client.name.slice(0, 2).toUpperCase()}
      </div>

      {/* ─── MAIN INFO BLOCK ─── */}
      <div className="flex-1 min-w-0">
        {/* Name + Date inline */}
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
            {client.name}
          </h4>
          <span className="text-[9px] text-slate-300 shrink-0">
            {formatDate(client.createdAt)}
          </span>
        </div>

        {/* Email · Address · TaxId row */}
        <div className="flex items-center gap-2 mt-0.5">
          {/* Email */}
          {client.email && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <EnvelopeSimpleIcon size={9} weight="bold" />
              <span className="truncate max-w-[120px]">{client.email}</span>
            </div>
          )}

          {/* Separator */}
          {client.email && client.address && (
            <span className="text-slate-300">·</span>
          )}

          {/* Address */}
          {client.address && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <MapPinIcon size={9} weight="bold" />
              <span className="truncate max-w-[140px]">{client.address}</span>
            </div>
          )}

          {/* TaxId Badge - centered, technical look */}
          {client.taxId && (
            <div className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/60">
              <HashIcon size={8} weight="bold" className="text-slate-400" />
              <span className="text-[10px] font-mono font-medium text-slate-600">
                {client.taxId}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── METRICS ─── */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Quote count */}
        <div className="flex items-center gap-1 text-right">
          <FileTextIcon size={10} weight="duotone" className="text-slate-400" />
          <span className="text-xs font-mono font-bold text-slate-700">
            {client.quoteCount || 0}
          </span>
        </div>

        {/* Total spent */}
        <div className="flex items-center gap-1 text-right min-w-[50px]">
          <CurrencyCircleDollarIcon
            size={10}
            weight="duotone"
            className="text-slate-400"
          />
          <span className="text-xs font-mono font-bold text-slate-700">
            {client.totalSpent ? formatCompact(client.totalSpent) : "0"}
          </span>
        </div>
      </div>
    </div>
  );
}
