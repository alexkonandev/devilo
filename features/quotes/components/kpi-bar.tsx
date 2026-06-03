"use client";

import React from "react";
import { cn, formatPrice } from "@/lib/utils";
import { DS_MONO, DS_LABEL } from "@/lib/design-system";
import { QuoteRegistryStats } from "@/types/quote-registry";
import {
  ClockClockwise,
  CurrencyCircleDollar,
  CheckCircle,
  TrendUp,
} from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════
// KPI CARD
// ═══════════════════════════════════════════════════════════════

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}

function KpiCard({ icon, label, value, accent }: KpiCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-md border transition-all",
        accent
          ? "bg-indigo-50 border-indigo-200"
          : "bg-white border-slate-200",
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
          accent
            ? "bg-indigo-100 text-indigo-600"
            : "bg-slate-100 text-slate-500",
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span className={cn(DS_LABEL)}>{label}</span>
        <span
          className={cn(
            DS_MONO,
            "text-sm font-bold",
            accent ? "text-indigo-700" : "text-slate-900",
          )}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// KPI BAR — Barre des indicateurs clés
// ═══════════════════════════════════════════════════════════════

interface KpiBarProps {
  stats: QuoteRegistryStats;
}

export function KpiBar({ stats }: KpiBarProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <KpiCard
        icon={<ClockClockwise size={16} weight="duotone" />}
        label="En attente"
        value={formatPrice(stats.totalPipelineValue)}
      />
      <KpiCard
        icon={<CurrencyCircleDollar size={16} weight="duotone" />}
        label="En cours"
        value={formatPrice(stats.totalOutstandingValue)}
      />
      <KpiCard
        icon={<CheckCircle size={16} weight="duotone" />}
        label="Encaissé"
        value={formatPrice(stats.totalCashCollected)}
        accent
      />
      <KpiCard
        icon={<TrendUp size={16} weight="duotone" />}
        label="Taux conversion"
        value={`${stats.conversionRate.toFixed(1)}%`}
      />
    </div>
  );
}