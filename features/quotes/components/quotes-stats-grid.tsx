"use client";

import React from "react";
import { useQuotes } from "./quote-context";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export function QuotesStatsGrid() {
  const { stats } = useQuotes();

  // Helper pour le formatage CFA
  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const cards = [
    {
      title: "Pipeline Total",
      value: formatCFA(stats.totalPipelineValue),
      description: "Argent potentiel (DRAFT, SENT, ACCEPTED)",
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "Volume de travail",
    },
    {
      title: "Cash Collected",
      value: formatCFA(stats.totalCashCollected),
      description: "Chiffre d'affaires HT encaissé",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: "Profit réel",
    },
    {
      title: "Taux de Conversion",
      value: `${stats.conversionRate.toFixed(1)}%`,
      description: "Efficacité du closing (SENT vs PAID)",
      icon: Target,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      trend: stats.conversionRate > 50 ? "Excellent" : "À optimiser",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
        Financial Intelligence
      </h2>

      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="relative overflow-hidden bg-white border border-slate-200 p-4 rounded-xl shadow-sm transition-all hover:shadow-md hover:border-slate-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                  {card.title}
                </p>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {card.value}
                </h3>
              </div>
              <div className={cn("p-2 rounded-lg", card.bgColor, card.color)}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-[10px] text-slate-400 font-medium leading-tight max-w-[120px]">
                {card.description}
              </p>
              <div
                className={cn(
                  "flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md",
                  card.color,
                  card.bgColor
                )}
              >
                {card.title === "Taux de Conversion" &&
                stats.conversionRate > 50 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : null}
                {card.trend}
              </div>
            </div>

            {/* Barre de progression visuelle pour le pipeline vs cash */}
            {card.title === "Cash Collected" && (
              <div className="mt-3 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000"
                  style={{
                    width: `${Math.min(
                      (stats.totalCashCollected /
                        (stats.totalPipelineValue || 1)) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Warning Zone : Si le pipeline est trop faible */}
      {stats.totalPipelineValue === 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-3">
          <div className="p-2 bg-white rounded-full">
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-[10px] text-amber-700 font-bold leading-tight">
            ALERTE : Pipeline vide. <br />
            Prospectez pour sécuriser le mois prochain.
          </p>
        </div>
      )}
    </div>
  );
}
