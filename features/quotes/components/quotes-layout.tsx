"use client";

import React from "react";
import Link from "next/link";
import { Plus, Pulse } from "@phosphor-icons/react";

interface QuotesLayoutProps {
  filters: React.ReactNode; // Contient déjà son propre Header (QuotesExplorer)
  mainList: React.ReactNode; // Liste centrale
  kpiPanel: React.ReactNode; // Panel d'intelligence
}

export function QuotesLayout({
  filters,
  mainList,
  kpiPanel,
}: QuotesLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-2.5rem)] w-full overflow-hidden bg-white select-none">
      {/* COL GAUCHE : EXPLORATEUR (RADAR) - Alignement strict sur Clients */}
      <aside className="w-80 shrink-0 border-r border-slate-200 flex flex-col bg-slate-50/30">
        {filters}
      </aside>

      {/* COL CENTRALE : INSPECTEUR (FOCUS) */}
      <main className="flex-1 min-w-0 flex flex-col bg-white">
        

        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
          {mainList}
        </div>
      </main>

      {/* COL DROITE : INTELLIGENCE (STRATÉGIE) - Alignement strict sur Clients */}
      <aside className="w-80 shrink-0 border-l border-slate-200 flex flex-col bg-slate-50/30">
        {kpiPanel}
      </aside>
    </div>
  );
}
