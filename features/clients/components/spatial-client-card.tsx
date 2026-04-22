"use client";

import React from "react";
import { ClientListItem } from "@/types/client";
import { SpatialCard } from "@/features/dashboard/components/spatial-card";
import { cn } from "@/lib/utils";
import {
  CrownIcon,
  EnvelopeSimpleIcon,
  FileTextIcon,
  CurrencyCircleDollarIcon,
} from "@phosphor-icons/react";

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

interface SpatialClientCardProps {
  client: ClientListItem;
  isActive: boolean;
  onClick: () => void;
}

export function SpatialClientCard({
  client,
  isActive,
  onClick,
}: SpatialClientCardProps) {
  const isVIP = client.totalSpent > 1000000;
  const hasActivity = client.quoteCount > 0;

  return (
    <div onClick={onClick} className="cursor-pointer h-full">
      <SpatialCard
        depth={isActive ? 3 : 1}
        variant={isActive ? "glow" : "glass"}
        className={cn(
          "h-full transition-all duration-500 group relative overflow-hidden",
          isActive && "ring-1 ring-indigo-300"
        )}
      >
        {/* VIP ghost icon */}
        {isVIP && (
          <div className="absolute top-4 right-4 opacity-[0.04] pointer-events-none">
            <CrownIcon size={80} weight="duotone" />
          </div>
        )}

        <div className="relative z-10 p-6 flex flex-col h-full gap-4">
          {/* Avatar + Identity */}
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 border transition-colors",
                isVIP
                  ? "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 border-amber-200"
                  : hasActivity
                  ? "bg-indigo-50 text-indigo-600 border-indigo-200/60"
                  : "bg-slate-50 text-slate-400 border-slate-200/60"
              )}
            >
              {client.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-slate-800 tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                {client.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                <EnvelopeSimpleIcon size={12} weight="bold" />
                <span className="text-[11px] font-medium truncate">
                  {client.email || "Non renseigné"}
                </span>
              </div>
            </div>
          </div>

          {/* KPI Row */}
          <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <FileTextIcon
                  size={10}
                  weight="bold"
                  className="text-slate-400"
                />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Dossiers
                </span>
              </div>
              <span className="font-mono text-sm font-black text-slate-700">
                {client.quoteCount}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <CurrencyCircleDollarIcon
                  size={10}
                  weight="bold"
                  className="text-slate-400"
                />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Volume
                </span>
              </div>
              <span
                className={cn(
                  "font-mono text-sm font-black",
                  isVIP ? "text-amber-500" : "text-emerald-500"
                )}
              >
                {formatCFA(client.totalSpent)}
              </span>
            </div>
          </div>
        </div>
      </SpatialCard>
    </div>
  );
}
