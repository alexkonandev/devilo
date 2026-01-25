"use client";

import React from "react";
import {
  MagnifyingGlass,
  Funnel,
  ArrowsClockwise,
  Plus,
  Monitor,
  CloudArrowUp,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCatalog } from "./catalog-context";
import { cn } from "@/lib/utils";

export function CatalogToolbar() {
  const { isDragging, userServices, platformServices } = useCatalog();

  return (
    <div className="flex items-center justify-between w-full h-full gap-6">
      {/* 1. RECHERCHE GLOBALE (SEARCH) */}
      <div className="flex-1 max-w-md relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
          <MagnifyingGlass size={16} weight="bold" />
        </div>
        <Input
          placeholder="RECHERCHER_DANS_L'INVENTAIRE_GLOBAL..."
          className="h-9 w-full bg-slate-50 border-slate-200 rounded-none pl-10 text-[11px] font-mono tracking-tight focus-visible:ring-0 focus-visible:border-indigo-600 transition-all"
        />
      </div>

      {/* 2. STATUTS DE DENSITÉ (DATA_STATS) */}
      <div className="hidden md:flex items-center gap-8 border-x border-slate-100 px-8 h-full">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">
            My_Assets
          </span>
          <div className="flex items-center gap-2">
            <Monitor size={12} weight="fill" className="text-slate-900" />
            <span className="text-[12px] font-mono font-black text-slate-950">
              {userServices.length}
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">
            Platform_Pool
          </span>
          <div className="flex items-center gap-2">
            <CloudArrowUp size={12} weight="fill" className="text-indigo-500" />
            <span className="text-[12px] font-mono font-black text-slate-950">
              {platformServices.length}
            </span>
          </div>
        </div>
      </div>

      {/* 3. COMMANDES ACTIONS (CONTROLS) */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 border border-slate-200 transition-all",
            isDragging ? "bg-indigo-50 border-indigo-200" : "bg-white"
          )}
        >
          <ArrowsClockwise
            size={14}
            className={cn(
              "text-slate-400",
              isDragging && "animate-spin text-indigo-600"
            )}
          />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">
            {isDragging ? "Transfert_Actif" : "Sync_Ready"}
          </span>
        </div>

        <Button
          variant="outline"
          className="h-9 rounded-none border-slate-200 gap-2 hover:bg-slate-50 active:scale-95 transition-all"
        >
          <Funnel size={14} weight="bold" />
          <span className="text-[10px] font-black uppercase">Filtrer</span>
        </Button>

        <Button className="h-9 rounded-none bg-slate-900 text-white hover:bg-indigo-600 gap-2 px-4 transition-all">
          <Plus size={14} weight="bold" />
          <span className="text-[10px] font-black uppercase">
            Nouveau_Service
          </span>
        </Button>
      </div>
    </div>
  );
}
