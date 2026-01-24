"use client";

import React from "react";
import PrintableQuote from "@/components/pdf/printable-quote";
import { MonitorIcon, FilePdfIcon, ArrowsOutIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// --- TYPES STRICTS ---
import { EditorActiveQuote, EditorTheme } from "@/types/editor";

interface QuoteVisualizerProps {
  data: EditorActiveQuote | null;
  theme: EditorTheme | undefined;
  printRef: React.RefObject<HTMLDivElement | null>;
}

export const QuoteVisualizer = ({
  data,
  theme,
  printRef,
}: QuoteVisualizerProps) => {
  // 1. GESTION DES ÉTATS D'ATTENTE (Clean UI)
  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-12 h-12 border border-slate-200" />
            <div className="absolute inset-0 w-12 h-12 border-t-2 border-indigo-600 animate-spin" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            Initialisation Système
          </span>
        </div>
      </div>
    );
  }

  // Fallback Thème (Logique métier préservée avec typage propre)
  const effectiveTheme = (theme || {
    id: "default-fallback",
    name: "Design Standard",
    baseLayout: "swiss",
    color: "#4f46e5",
    config: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    isPremium: false,
    description: null,
    isSystem: true,
  }) as EditorTheme;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-hidden relative">
      {/* 2. BARRE D'ÉTAT (SYMMETRY & SYNC) */}
      <div className="h-10 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <MonitorIcon size={14} weight="bold" className="text-indigo-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
              Aperçu Studio
            </span>
          </div>
          <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
              Zoom: Auto
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
              Format: A4 Standard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-1 hover:bg-slate-50 transition-colors text-slate-500 hover:text-indigo-600">
            <ArrowsOutIcon size={14} />
            <span className="text-[9px] font-bold uppercase">Plein écran</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 text-white">
            <FilePdfIcon size={14} weight="bold" className="text-indigo-400" />
            <span className="text-[9px] font-bold uppercase tracking-tight">
              Prêt pour export
            </span>
          </div>
        </div>
      </div>

      {/* 3. ZONE DE RENDU (WORKSPACE) */}
      <div className="flex-1  scrollbar-none flex justify-center items-start  ">
        {/* Conteneur de la feuille : Ombre portée subtile mais profonde pour le relief */}
        <div
          className={cn(
            "bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-200 rounded-none",
            "transition-all duration-500 ease-in-out",
            "print:shadow-none print:border-0 print:m-0"
          )}
        >
          {/* On passe les props à PrintableQuote sans modifier la logique de ref */}
          <PrintableQuote ref={printRef} quote={data} theme={effectiveTheme} />
        </div>
      </div>

      {/* 4. LIGNE DE FORCE (FOCUS INDICATOR) */}
      <div className="absolute left-0 top-10 bottom-0 w-[2px] bg-indigo-500/10" />
    </div>
  );
};
