"use client";

import React from "react";
import { useCatalog } from "./catalog-context";
import {
  Calculator,
  TrendUp,
  TrendDown,
  Percent,
  CurrencyDollar,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface MarginCalculatorProps {
  originalPrice: number;
  sellingPrice: number;
}

export function MarginCalculator({
  originalPrice,
  sellingPrice,
}: MarginCalculatorProps) {
  // Calcul de la marge brute
  const marginAmount = sellingPrice - originalPrice;
  const marginPercent =
    originalPrice > 0 ? (marginAmount / sellingPrice) * 100 : 0;
  const isProfitable = marginAmount > 0;

  return (
    <div className="bg-slate-900 p-4 border-l-4 border-indigo-500">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={16} weight="bold" className="text-indigo-400" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
          Analyse_De_Rentabilité
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* COLONNE A : LEVIER DE PRIX */}
        <div className="space-y-3">
          <div>
            <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">
              Coût_Source
            </p>
            <p className="text-[12px] font-mono font-bold text-slate-300">
              {new Intl.NumberFormat("fr-CI").format(originalPrice)}{" "}
              <span className="text-[8px]">CFA</span>
            </p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">
              Prix_Vente
            </p>
            <p className="text-[14px] font-mono font-black text-white">
              {new Intl.NumberFormat("fr-CI").format(sellingPrice)}{" "}
              <span className="text-[10px]">CFA</span>
            </p>
          </div>
        </div>

        {/* COLONNE B : RÉSULTAT NET */}
        <div
          className={cn(
            "flex flex-col justify-center p-3 border",
            isProfitable
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-rose-500/30 bg-rose-500/5"
          )}
        >
          <div className="flex items-center gap-1 mb-1">
            {isProfitable ? (
              <TrendUp size={14} weight="bold" className="text-emerald-500" />
            ) : (
              <TrendDown size={14} weight="bold" className="text-rose-500" />
            )}
            <span
              className={cn(
                "text-[10px] font-black uppercase",
                isProfitable ? "text-emerald-500" : "text-rose-500"
              )}
            >
              Marge_Nette
            </span>
          </div>

          <p
            className={cn(
              "text-[18px] font-mono font-black leading-none",
              isProfitable ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {marginPercent.toFixed(1)}%
          </p>
          <p className="text-[9px] font-mono text-slate-500 mt-1">
            +{new Intl.NumberFormat("fr-CI").format(marginAmount)} CFA
          </p>
        </div>
      </div>

      {/* BARRE DE PROGRESSION VISUELLE */}
      <div className="mt-4 h-1 w-full bg-slate-800 relative overflow-hidden">
        <div
          className={cn(
            "absolute inset-y-0 left-0 transition-all duration-500",
            isProfitable ? "bg-emerald-500" : "bg-rose-500"
          )}
          style={{ width: `${Math.min(Math.max(marginPercent, 0), 100)}%` }}
        />
      </div>

      {marginPercent < 20 && isProfitable && (
        <p className="mt-2 text-[8px] font-bold text-amber-500 uppercase animate-pulse">
          Attention : Marge_Faible pour un modèle Nomad.
        </p>
      )}
    </div>
  );
}
