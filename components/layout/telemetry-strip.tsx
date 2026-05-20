"use client";

import React from "react";
import { type IconProps } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_BENTO_CARD,
  DS_ICON_WRAPPER,
  DS_ICON_SM,
} from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════════════════════
// TELEMETRY STRIP — Bande KPI standardisée pour PageShell
// Single bento card contenant 4 cellules compactes séparées par divide-x
// Réutilisable dans toutes les pages (Dashboard, Clients, Catalogue, Devis…)
// ═══════════════════════════════════════════════════════════════════════════════

export interface TelemetryItem {
  /** Icône Phosphor */
  icon: React.ComponentType<IconProps>;
  /** Classe bg pour le wrapper d'icône (ex: "bg-indigo-50") */
  iconBg?: string;
  /** Classe text pour l'icône (ex: "text-indigo-600") */
  iconColor?: string;
  /** Valeur principale (déjà formatée) */
  value: string;
  /** Unité (XOF, %, etc.) */
  unit: string;
  /** Label descriptif (ex: "CA Global") */
  label: string;
  /** Détail optionnel (ex: "+12%", "5 devis") */
  detail?: string;
  /** Classe text pour le détail (ex: "text-indigo-500") */
  detailColor?: string;
}

export interface SparklineCell {
  /** Type spécial "sparkline" */
  variant: "sparkline";
  /** Label */
  label: string;
  /** Valeur numérique */
  value: string;
  /** Données du sparkline (0-1 normalisé ou absolu) */
  sparklineData: number[];
  /** Couleur du trait */
  color?: string;
}

export type TelemetryCell = TelemetryItem | SparklineCell;

interface TelemetryStripProps {
  cells: TelemetryCell[];
}

function isSparkline(cell: TelemetryCell): cell is SparklineCell {
  return (cell as SparklineCell).variant === "sparkline";
}

export function TelemetryStrip({ cells }: TelemetryStripProps) {
  return (
    <div
      className={cn(
        DS_BENTO_CARD,
        "p-0 flex items-stretch divide-x divide-slate-100/60 overflow-hidden",
      )}
    >
      {cells.map((cell, i) => {
        if (isSparkline(cell)) {
          return <SparklineCell key={i} cell={cell} />;
        }
        return <KpiCell key={i} cell={cell} />;
      })}
    </div>
  );
}

// ─── Cellule KPI standard ────────────────────────────────────────────────────

function KpiCell({
  cell: { icon: Icon, iconBg = "bg-indigo-50", iconColor = "text-indigo-600", value, unit, label, detail, detailColor = "text-indigo-600" },
}: {
  cell: TelemetryItem;
}) {
  return (
    <div className="flex-1 flex items-center gap-2.5 p-3">
      <div className={cn(DS_ICON_WRAPPER, iconBg, "shrink-0")}>
        <Icon size={DS_ICON_SM} className={iconColor} weight="bold" />
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-slate-900 tabular-nums">
            {value}
          </span>
          <span className={cn(DS_MICRO, "text-slate-400")}>{unit}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={cn(DS_MICRO, "text-slate-500")}>{label}</span>
          {detail && (
            <>
              <span className={cn(DS_MICRO, "text-slate-300")}>·</span>
              <span className={cn(DS_MICRO, detailColor)}>{detail}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Cellule Sparkline ───────────────────────────────────────────────────────

function SparklineCell({
  cell: { label, value, sparklineData, color = "text-indigo-400" },
}: {
  cell: SparklineCell;
}) {
  const maxValue = Math.max(...sparklineData, 1);
  const path = sparklineData
    .map((v, i) => {
      const x = (i / (sparklineData.length - 1)) * 60;
      const y = 20 - (v / maxValue) * 20;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="flex-1 flex items-center gap-2.5 p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className={cn(DS_MICRO, "text-slate-500")}>{label}</span>
          <span className={cn(DS_MONO, "font-bold text-slate-900")}>
            {value}
          </span>
        </div>
        <svg width="100%" height="16" className={color}>
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}