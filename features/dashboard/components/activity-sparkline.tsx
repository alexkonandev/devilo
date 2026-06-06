"use client";

import React from "react";
import Link from "next/link";
import { TrendUpIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { BTN_SECONDARY } from "@/components/shared/ui/constants";
import {
  DS_MICRO,
  DS_BENTO_CARD,
  DS_SECTION_HEADER,
  DS_ICON_WRAPPER,
  DS_ICON_SM,
  DS_TEL_BLOCK,
} from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVITY SPARKLINE — Carte graphique "Activité Récente"
// ═══════════════════════════════════════════════════════════════════════════════

interface ActivitySparklineProps {
  data: number[];
}

export function ActivitySparkline({ data }: ActivitySparklineProps) {
  const maxVal = Math.max(...data);

  return (
    <div className={cn(DS_BENTO_CARD, "p-0 overflow-hidden")}>
      <div
        className={cn(
          DS_SECTION_HEADER,
          "px-3 py-2 border-b border-slate-100/60 mb-0",
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
            <TrendUpIcon size={DS_ICON_SM} className="text-indigo-500" />
          </div>
          <span className={cn(DS_MICRO, "text-slate-600")}>
            Activité Récente
          </span>
        </div>
        <Link
          href="/quotes"
          className={cn(BTN_SECONDARY, "px-2.5 py-1 text-[9px]")}
        >
          Voir tout
          <ArrowRightIcon size={DS_ICON_SM} weight="bold" />
        </Link>
      </div>
      <div className={cn(DS_TEL_BLOCK, "h-24 rounded-none border-0")}>
        <div className="h-full flex items-end gap-1">
          {data.slice(-20).map((value, i) => (
            <div
              key={i}
              style={{ height: `${(value / maxVal) * 100}%` }}
              className="flex-1 bg-indigo-200 hover:bg-indigo-400 rounded-t-sm transition-all duration-300 cursor-pointer"
            />
          ))}
        </div>
      </div>
    </div>
  );
}