"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  STUDIO_V2_CARD,
  DS_ICON_WRAPPER,
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_TEL_BLOCK,
  DS_PROGRESS_TRACK,
  DS_PROGRESS_BAR,
  DS_ICON_SM,
} from "@/lib/design-system";
import {
  TrendUpIcon,
  FileTextIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CurrencyCircleDollarIcon,
} from "@phosphor-icons/react";
import type { BillingProfile } from "@/actions/billing-action";

interface AnalyticsCardProps {
  billingProfile: BillingProfile;
  className?: string;
}

export function AnalyticsCard({ billingProfile, className }: AnalyticsCardProps) {
  const { monthlyStats } = billingProfile;
  const isPro =
    billingProfile.plan === "PRO" || billingProfile.plan === "ENTERPRISE";

  const stats = [
    {
      label: "Devis ce mois",
      value: monthlyStats.quotesThisMonth,
      icon: FileTextIcon,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      barColor: "bg-indigo-400",
    },
    {
      label: "Acceptés / Payés",
      value: monthlyStats.quotesAccepted,
      icon: CheckCircleIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      barColor: "bg-emerald-400",
    },
    {
      label: "Total historique",
      value: monthlyStats.quotesTotal,
      icon: ChartBarIcon,
      color: "text-slate-500",
      bg: "bg-slate-50",
      barColor: "bg-slate-400",
    },
  ];

  const maxVal = Math.max(...stats.map((s) => s.value), 1);

  return (
    <div className={cn(STUDIO_V2_CARD, className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
            <TrendUpIcon size={DS_ICON_SM} className="text-indigo-500" />
          </div>
          <span className={cn(DS_MICRO)}>
            Activité Mensuelle
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn(DS_MONO, "text-[9px] text-slate-400")}>
            {new Date().toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {isPro && (
        <div
          className={cn(DS_TEL_BLOCK, "bg-emerald-50 border-emerald-200 mb-4")}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className={cn(DS_LABEL, "text-emerald-500")}>
                Revenu HT ce mois
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-emerald-700 font-mono tabular-nums">
                    {monthlyStats.revenueThisMonth.toLocaleString("fr-FR")}
                  </span>
                <span className={cn(DS_MONO, "text-emerald-500")}>
                  {billingProfile.nextPayment?.currency ?? "XOF"}
                </span>
              </div>
            </div>
            <CurrencyCircleDollarIcon size={20} className="text-emerald-300" />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {stats.map((s) => {
          const Icon = s.icon;
          const barWidth = Math.max((s.value / maxVal) * 100, 4);
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={cn(DS_ICON_WRAPPER, s.bg)}>
                    <Icon size={DS_ICON_SM} className={s.color} />
                  </div>
                  <span className={cn(DS_LABEL, "text-slate-500")}>
                    {s.label}
                  </span>
                </div>
                <span className={cn(DS_MONO, "text-slate-800 font-bold")}>
                  {s.value}
                </span>
              </div>
              <div className={DS_PROGRESS_TRACK}>
                <div
                  className={cn(DS_PROGRESS_BAR, s.barColor)}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}