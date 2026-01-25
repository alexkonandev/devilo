"use client";

import React, { useMemo } from "react";
import { useQuotes } from "./quote-context";
import { cn } from "@/lib/utils";

export function QuotesMiniChart() {
  const { quotes } = useQuotes();

  // 1. AGRÉGATION DES DONNÉES (6 derniers mois)
  const chartData = useMemo(() => {
    const monthlyData: Record<string, number> = {};
    const now = new Date();

    // Initialisation des 6 derniers mois à 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short" });
      monthlyData[key] = 0;
    }

    // Accumulation du CA Encaissé (PAID)
    quotes
      .filter((q) => q.status === "PAID")
      .forEach((q) => {
        const date = new Date(q.createdAt);
        const key = date.toLocaleString("default", { month: "short" });
        if (monthlyData.hasOwnProperty(key)) {
          const totalHT = q.lines.reduce(
            (acc, ln) => acc + ln.unitPrice * ln.quantity,
            0
          );
          monthlyData[key] += totalHT;
        }
      });

    return Object.entries(monthlyData).map(([name, value]) => ({
      name,
      value,
    }));
  }, [quotes]);

  // 2. CALCUL DU TRACÉ SVG (Sparkline)
  const maxValue = Math.max(...chartData.map((d) => d.value), 1);
  const height = 40;
  const width = 180;
  const padding = 4;

  const points = chartData
    .map((d, i) => {
      const x = (i / (chartData.length - 1)) * (width - padding * 2) + padding;
      const y =
        height - (d.value / maxValue) * (height - padding * 2) - padding;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="mt-6 p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden relative group">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Revenue Momentum
          </h4>
          <p className="text-xs font-bold text-white">6 Derniers Mois</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
            LIVE
          </span>
        </div>
      </div>

      {/* LE SPARKLINE (SVG ultra-léger) */}
      <div className="relative h-12 w-full">
        <svg className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Surface remplie */}
          <path
            d={`M ${points.split(" ")[0]} L ${points} L ${
              width - padding
            },${height} L ${padding},${height} Z`}
            fill="url(#gradient)"
            className="transition-all duration-500 ease-in-out"
          />

          {/* Ligne de tendance */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
      </div>

      {/* AXE DES MOIS */}
      <div className="flex justify-between mt-2">
        {chartData.map((d, i) => (
          <span
            key={i}
            className="text-[8px] font-bold text-slate-600 uppercase"
          >
            {d.name}
          </span>
        ))}
      </div>

      {/* Overlay de décoration tactique */}
      <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="w-16 h-16 border-t-2 border-r-2 border-white rounded-tr-lg" />
      </div>
    </div>
  );
}
