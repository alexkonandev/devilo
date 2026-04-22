"use client";

import React from "react";
import { CatalogService } from "@/types/catalog";
import { SpatialCard } from "@/features/dashboard/components/spatial-card";
import { cn } from "@/lib/utils";
import { TagIcon, TrashIcon } from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface ServiceCardProps {
  service: CatalogService;
  isActive: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
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

export function ServiceCard({
  service,
  isActive,
  onClick,
  onDelete,
}: ServiceCardProps) {
  const margin =
    service.baseCost && service.unitPrice > 0
      ? ((service.unitPrice - service.baseCost) / service.unitPrice) * 100
      : 0;

  return (
    <div onClick={onClick} className="cursor-pointer h-full relative group">
      <SpatialCard
        depth={isActive ? 3 : 1}
        variant={isActive ? "glow" : "glass"}
        className={cn(
          "h-full transition-all duration-500 flex flex-col justify-between",
          isActive && "ring-1 ring-indigo-300"
        )}
      >
        <div className="p-6 relative z-10">
          {/* Header: Category & Margin */}
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/60">
              <TagIcon
                size={10}
                weight="bold"
                className="text-slate-400"
              />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                {service.category || "Service"}
              </span>
            </div>

            {margin > 0 && (
              <span
                className={cn(
                  "text-[9px] font-black font-mono px-2 py-0.5 rounded-lg border",
                  margin > 50
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-amber-50 text-amber-600 border-amber-200"
                )}
              >
                {margin.toFixed(0)}%
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-slate-800 font-bold text-base leading-tight mb-2 line-clamp-2 min-h-[2.5rem] tracking-tight">
            {service.title}
          </h3>

          {/* Subtitle preview */}
          <p className="text-[11px] text-slate-400 line-clamp-2 mb-4 min-h-[2em]">
            {service.subtitle || "Aucune description..."}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-4 border-t border-slate-100">
            <span className="text-2xl font-black font-mono text-slate-800 tracking-tighter italic">
              {formatCFA(service.unitPrice).replace("F CFA", "")}
            </span>
            <span className="text-[10px] font-bold text-indigo-500 uppercase italic">
              XOF
            </span>
          </div>
        </div>
      </SpatialCard>

      {/* Hover Action: Delete */}
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 p-2.5 rounded-xl bg-rose-50 text-rose-500 border border-rose-200 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white hover:scale-110 z-20"
      >
        <TrashIcon size={14} weight="bold" />
      </button>
    </div>
  );
}
