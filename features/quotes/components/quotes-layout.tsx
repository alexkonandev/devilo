"use client";

import React from "react";

interface QuotesLayoutProps {
  filters: React.ReactNode; // G : Navigation par statut (Brouillons, Payés, etc.)
  mainList: React.ReactNode; // C : Le listing principal (Le Ledger)
  kpiPanel: React.ReactNode; // D : Statistiques de performance (Revenus, Pipeline)
}

export function QuotesLayout({
  filters,
  mainList,
  kpiPanel,
}: QuotesLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-2.5rem)] w-full overflow-hidden bg-slate-50">
      {/* 1. STATUS_NAVIGATION (G) - Étroit & Tactique */}
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="h-12 px-4 flex items-center border-b border-slate-100 bg-slate-50/50">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Pipeline_Status
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">{filters}</div>
      </aside>

      {/* 2. QUOTE_LEDGER (C) - La vue centrale massive */}
      <main className="flex-1 min-w-0 flex flex-col bg-white">
        <div className="h-12 px-6 flex items-center justify-between border-b border-slate-200">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
            Registry_Master_View
          </span>
          {/* Espace pour une barre de recherche rapide ici */}
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-none p-4">
          {mainList}
        </div>
      </main>

      {/* 3. CASH_INTELLIGENCE (D) - Focus sur le profit global */}
      <aside className="w-80 shrink-0 border-l border-slate-200 bg-slate-50/30 flex flex-col">
        <div className="h-12 px-4 flex items-center border-b border-slate-200 bg-white">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
            Financial_Insights
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{kpiPanel}</div>
      </aside>
    </div>
  );
}
