"use client";

import React from "react";
import { useQuotes } from "./quote-context";
import { cn } from "@/lib/utils";
import {
  ChartLineUp,
  Wallet,
  Target,
  TrendUp,
  TrendDown,
  Warning,
  CurrencyCircleDollar,
} from "@phosphor-icons/react";

export function QuotesStatsGrid() {
  const { stats } = useQuotes();

  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const cashProgress = Math.min(
    (stats.totalCashCollected / (stats.totalPipelineValue || 1)) * 100,
    100
  );

  return (
    <div className="flex flex-col h-full bg-[#fcfcfc] border-l border-slate-200 select-none">
      <div className="flex-1 overflow-y-auto scrollbar-none p-4 space-y-4">
        {/* 1. MASTER METRIC : TRÉSORERIE (Décollée avec Padding) */}
        <div className="bg-slate-900 p-6 text-white relative overflow-hidden border border-black shadow-lg shadow-slate-200">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-3 bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Trésorerie_Encaissée
              </span>
            </div>

            <div className="font-mono text-3xl font-black tracking-tighter mb-6">
              {formatCFA(stats.totalCashCollected)}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
                <span>Ratio_Collecte</span>
                <span className="text-emerald-500">
                  {cashProgress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-[2px] bg-white/10">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                  style={{ width: `${cashProgress}%` }}
                />
              </div>
            </div>
          </div>
          {/* Filigrane technique discret */}
          <ChartLineUp
            size={100}
            weight="bold"
            className="absolute -right-6 -bottom-6 opacity-5 text-white"
          />
        </div>

        {/* 2. SECONDARY METRICS : BLOCS INDUSTRIELS */}
        <div className="space-y-3">
          {/* Pipeline - Carte Blanche épurée */}
          <div className="p-5 bg-white border border-slate-200 hover:border-slate-400 transition-colors group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Pipeline_Global
                </span>
                <span className="font-mono text-xl font-black text-slate-900 tracking-tighter">
                  {formatCFA(stats.totalPipelineValue)}
                </span>
              </div>
              <Wallet
                size={18}
                weight="duotone"
                className="text-slate-300 group-hover:text-indigo-600 transition-colors"
              />
            </div>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">
              Capacité du cycle actuel
            </span>
          </div>

          {/* Performance - Carte Blanche épurée */}
          <div className="p-5 bg-white border border-slate-200 hover:border-slate-400 transition-colors group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Taux_Conversion
                </span>
                <span className="font-mono text-xl font-black text-slate-900 tracking-tighter">
                  {stats.conversionRate.toFixed(1)}%
                </span>
              </div>
              <Target
                size={18}
                weight="duotone"
                className="text-slate-300 group-hover:text-indigo-600 transition-colors"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "h-1.5 w-1.5",
                  stats.conversionRate > 50 ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
              <span className="text-[8px] font-black uppercase text-slate-500">
                {stats.conversionRate > 50
                  ? "OPTIMISATION_VALIDE"
                  : "ALERTE_CLOSING"}
              </span>
            </div>
          </div>
        </div>

        {/* ALERTES (Industrial Alert) */}
        {stats.totalPipelineValue === 0 && (
          <div className="p-4 border-2 border-amber-500 bg-amber-50/50 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-amber-600">
              <Warning weight="fill" size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                System_Alert
              </span>
            </div>
            <p className="text-[9px] font-bold text-amber-800 uppercase">
              Aucun flux financier détecté.
            </p>
          </div>
        )}
      </div>

      {/* FOOTER : HISTOGRAMME INTÉGRÉ */}
      <div className="p-5 bg-white border-t border-slate-200">
        <div className="flex justify-between items-end h-16 gap-1 mb-4">
          {[40, 70, 45, 90, 65, 80].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-slate-100 hover:bg-slate-900 transition-all"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
            Data_Stream
          </span>
          
        </div>
      </div>
    </div>
  );
}
