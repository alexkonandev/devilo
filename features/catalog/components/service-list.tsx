"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRightIcon, TrashIcon } from "@phosphor-icons/react";
import { BTN_SECONDARY } from "@/components/shared/ui/constants";
import {
  DS_CARD,
  DS_GAP_ITEMS,
  DS_MONO,
} from "@/lib/design-system";
import { formatCompact } from "./format-utils";

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE LIST - Vue liste alternative
// ═══════════════════════════════════════════════════════════════════════════════

// Type local : étend CatalogService avec margin (+ revenue conservé pour compatibilité)
interface ServiceCatalogItem {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  unitPrice: number;
  baseCost: number | null;
  margin: number;
  revenue: number;
}

interface ServiceListProps {
  services: ServiceCatalogItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onImport: (id: string) => void;
  isMarketplace: boolean;
}

export function ServiceList({
  services,
  selectedId,
  onSelect,
  onDelete,
  onImport,
  isMarketplace,
}: ServiceListProps) {
  const categoryColors: Record<string, string> = {
    GENERAL: "bg-slate-100 text-slate-600",
    TECHNIC: "bg-blue-100 text-blue-600",
    CONSULTING: "bg-purple-100 text-purple-600",
    SUBSCRIPTION: "bg-emerald-100 text-emerald-600",
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className={DS_GAP_ITEMS}>
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onSelect(service.id)}
            className={cn(
              DS_CARD,
              "flex items-center justify-between p-3 rounded cursor-pointer transition-all",
              selectedId === service.id
                ? "border-indigo-400 bg-indigo-50/30"
                : "hover:border-slate-300",
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                  categoryColors[service.category] || categoryColors.GENERAL,
                )}
              >
                {service.category.slice(0, 3)}
              </span>
              <div className="flex-1 min-w-0">
                <p className={cn(DS_MONO, "truncate")}>
                  {service.title}
                </p>
                <p className={cn(DS_MONO, "text-[10px] text-slate-500")}>
                  Marge: {Math.round(service.margin)}% ·{" "}
                  {formatCompact(service.revenue)} CA
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn(DS_MONO)}>
                {formatCompact(service.unitPrice)}
              </span>
              {isMarketplace ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onImport(service.id);
                  }}
                  className={cn(
                    BTN_SECONDARY,
                    "bg-amber-100 text-amber-700 hover:bg-amber-200",
                  )}
                >
                  <ArrowRightIcon size={10} weight="bold" />
                  Importer
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(service.id);
                  }}
                  className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <TrashIcon size={14} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}