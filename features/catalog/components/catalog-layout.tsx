"use client";

import React from "react";
import { useCatalog } from "./catalog-context";
import { cn } from "@/lib/utils";

interface CatalogLayoutProps {
  userInventory: React.ReactNode;
  platformInventory: React.ReactNode;
  toolbar: React.ReactNode;
}

export function CatalogLayout({
  userInventory,
  platformInventory,
  toolbar,
}: CatalogLayoutProps) {
  const { isDragging, userServices, platformServices } = useCatalog();

  return (
    <div className="flex flex-col h-[calc(100vh-2.5rem)] w-full bg-white overflow-hidden font-sans">
      {/* 1. GLOBAL COMMAND CENTER */}
      <header className="h-14 shrink-0 border-b border-slate-200 flex items-center px-6 bg-white z-30">
        {toolbar}
      </header>

      {/* 2. DUAL-STREAM VIEWPORT */}
      <div className="flex-1 flex min-h-0 divide-x-2 divide-slate-200 bg-slate-200">
        {/* COL GAUCHE : TARGET ZONE (60%) */}
        <section className="flex-[1.5] flex flex-col min-w-0 bg-white relative">
          <div className="h-10 px-4 flex items-center justify-between bg-slate-900 text-white shrink-0">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Personal_Assets
            </span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono font-bold opacity-50 uppercase">
                Active_Inventory
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-none p-2">
            {userInventory}
          </div>

          {/* OVERLAY DE RÉCEPTION : Actif uniquement pendant le drag */}
          <div
            className={cn(
              "absolute inset-0 bg-indigo-600/5 pointer-events-none border-4 border-dashed border-indigo-600/20 transition-opacity duration-300 m-2 z-10",
              isDragging ? "opacity-100 animate-pulse" : "opacity-0"
            )}
          />
        </section>

        {/* COL DROITE : SOURCE ZONE (40%) */}
        <section className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
          <div className="h-10 px-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Platform_Marketplace
            </span>
            <span className="text-[9px] font-mono font-bold text-slate-300 uppercase">
              Sourcing_Pool
            </span>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-none p-2 bg-slate-50/50">
            {platformInventory}
          </div>
        </section>
      </div>

      {/* 3. STATUS BAR (DENSITÉ INFO) */}
      <footer className="h-8 shrink-0 bg-white border-t border-slate-200 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
            {isDragging
              ? "Action_En_Cours : Relâcher_Pour_Importer"
              : "Prêt_Pour_Expansion_Catalogue"}
          </p>
        </div>
        <div className="flex gap-4">
          <span className="text-[8px] font-black text-slate-950 px-2 py-0.5 border border-slate-900">
            ASSETS: {userServices.length}
          </span>
          <span className="text-[8px] font-black text-slate-400 px-2 py-0.5 border border-slate-200">
            MARKET: {platformServices.length}
          </span>
        </div>
      </footer>
    </div>
  );
}
