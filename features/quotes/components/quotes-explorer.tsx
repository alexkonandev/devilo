"use client";

import React from "react";
import { useQuotes } from "./quote-context";
import { QuoteStatus } from "@/types/quote-registry";
import { cn } from "@/lib/utils";
import {
  ListBullets,
  FileText,
  PaperPlaneTilt,
  Hourglass,
  CheckCircle,
  XCircle,
  MagnifyingGlass,
} from "@phosphor-icons/react";

// Définition de la configuration (Source de vérité pour la navigation)
const STATUS_CONFIG = [
  { id: "ALL", label: "TOUS_LES_DEVIS", icon: ListBullets },
  { id: "DRAFT", label: "BROUILLONS", icon: FileText },
  { id: "SENT", label: "ENVOYÉS", icon: PaperPlaneTilt },
  { id: "ACCEPTED", label: "ACCEPTÉS", icon: Hourglass },
  { id: "PAID", label: "PAYÉS", icon: CheckCircle },
  { id: "REJECTED", label: "REFUSÉS", icon: XCircle },
] as const;

export function QuotesExplorer() {
  const { activeStatus, setActiveStatus, stats, search, setSearch } =
    useQuotes();

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-[320px] overflow-hidden">
      {/* 00. HEADER : SYNC (Miroir du Radar Contacts) */}
      <header className="h-15 shrink-0 flex items-center px-4 justify-between border-b border-slate-200 bg-white z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-1">
            Flux_Transactions
          </span>
          <span className="text-[14px] font-bold text-slate-900 tracking-tight">
            Registre_Devis
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col min-h-0">
        {/* 01. MODULE RECHERCHE (Standardisé sur Scan_Database) */}
        <section className="py-5 border-b border-slate-100 bg-slate-50/30">
          <div className="px-4">
            <div className="relative group">
              <MagnifyingGlass
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                size={14}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="RECHERCHER UN DEVIS..."
                className="w-full bg-white border border-slate-200 pl-9 pr-3 h-9 text-[11px] font-bold uppercase outline-none focus:border-indigo-600 transition-all placeholder:text-slate-200"
              />
            </div>
          </div>
        </section>

        {/* 02. FEED DE NAVIGATION (Verticale pour éviter que l'utilisateur craque) */}
        <nav className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto scrollbar-none">
            {STATUS_CONFIG.map((status) => {
              const isActive = activeStatus === status.id;
              const count =
                stats.countByStatus[status.id as QuoteStatus | "ALL"] || 0;

              return (
                <button
                  key={status.id}
                  onClick={() =>
                    setActiveStatus(status.id as QuoteStatus | "ALL")
                  }
                  className={cn(
                    "w-full p-4 flex items-center justify-between border-b border-slate-100 transition-none group relative text-left",
                    isActive ? "bg-slate-50/50" : "hover:bg-slate-50/30"
                  )}
                >
                  {/* Indicateur actif (Identique à Clients) */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                  )}

                  <div className="flex items-center gap-3">
                    <status.icon
                      size={16}
                      weight={isActive ? "bold" : "regular"}
                      className={
                        isActive ? "text-indigo-600" : "text-slate-400"
                      }
                    />
                    <span
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-tight",
                        isActive ? "text-slate-900" : "text-slate-500"
                      )}
                    >
                      {status.label.replace(/_/g, " ")}
                    </span>
                  </div>

                  <span
                    className={cn(
                      "font-mono text-[11px] font-bold",
                      isActive ? "text-indigo-600" : "text-slate-300"
                    )}
                  >
                    {count.toString().padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* FOOTER SYNC (Cohérence avec le Radar) */}
      <footer className="mt-auto border-t border-slate-900 bg-white p-5 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Registre_Actif
          </span>
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase">
              Stable_V1
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
