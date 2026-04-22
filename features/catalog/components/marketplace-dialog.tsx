"use client";

import React, { useState } from "react";
import { CatalogService } from "@/types/catalog";
import { SpatialCard } from "@/features/dashboard/components/spatial-card";
import { cn } from "@/lib/utils";
import {
  TagIcon,
  LightningIcon,
  CloudArrowDownIcon,
  CrownIcon,
} from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface PlatformServiceCardProps {
  service: CatalogService;
  onImport: () => void;
  isImporting: boolean;
}

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

export function PlatformServiceCard({
  service,
  onImport,
  isImporting,
}: PlatformServiceCardProps) {
  return (
    <SpatialCard
      depth={1}
      variant="glass"
      className="h-full flex flex-col justify-between"
      mountDelay={0}
    >
      <div className="p-6 relative z-10">
        {/* Header: Category + Premium badge */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/60">
            <TagIcon size={10} weight="bold" className="text-slate-400" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
              {service.category}
            </span>
          </div>

          {service.isPremium && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200">
              <CrownIcon size={10} weight="fill" className="text-amber-500" />
              <span className="text-[8px] font-black uppercase tracking-widest text-amber-500">
                Premium
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-slate-800 font-bold text-base leading-tight mb-2 line-clamp-2 min-h-[2.5rem] tracking-tight group-hover:text-indigo-600 transition-colors">
          {service.title}
        </h3>

        {/* Subtitle */}
        <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed mb-4 min-h-[3em]">
          {service.subtitle || "Module de service prêt à l'emploi."}
        </p>
      </div>

      {/* Footer: Price + Import */}
      <div className="px-6 pb-6 pt-0 relative z-10">
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-black text-lg text-slate-800 tracking-tighter italic">
              {formatCFA(service.unitPrice).replace("F CFA", "")}
            </span>
            <span className="text-[10px] font-bold text-indigo-500 uppercase italic">
              XOF
            </span>
          </div>

          <button
            onClick={onImport}
            disabled={isImporting}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
              isImporting
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-indigo-50 text-indigo-600 border border-indigo-200/60 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-500/20"
            )}
          >
            {isImporting ? (
              <LightningIcon
                size={14}
                weight="fill"
                className="animate-pulse"
              />
            ) : (
              <CloudArrowDownIcon size={14} weight="bold" />
            )}
            {isImporting ? "Import..." : "Importer"}
          </button>
        </div>
      </div>
    </SpatialCard>
  );
}
