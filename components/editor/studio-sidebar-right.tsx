"use client";

import {
  PaletteIcon,
  CheckIcon,
  Icon,
  ChartBarIcon,
  ReceiptIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { EditorActiveQuote, EditorTheme } from "@/types/editor";

interface StudioSidebarRightProps {
  activeQuote: EditorActiveQuote;
  availableThemes: EditorTheme[];
  currentTheme: string;
  setTheme: (theme: string) => void;
  totals: { totalTTC: number; subTotal: number };
}

export const StudioSidebarRight = ({
  activeQuote,
  availableThemes,
  currentTheme,
  setTheme,
  totals,
}: StudioSidebarRightProps) => {
  // Logique métier préservée : calcul des taxes et remises pour affichage
  const discount = activeQuote.financials.discountAmountEuros || 0;
  const vatAmount = totals.totalTTC - totals.subTotal;

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 w-[300px] overflow-hidden rounded-none shadow-none">
      {/* 00. HEADER : SYNC H-16 */}
      <header className="h-15 shrink-0 flex items-center px-6 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-1 h-4 bg-indigo-600" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900">
            Performance & Style
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {/* 01. SECTION : DÉCOMPOSITION FINANCIÈRE (Le cœur du Profit) */}
        <section className="py-8 border-b border-slate-100">
          <div className="flex items-center gap-2 px-6 mb-6">
            <ChartBarIcon size={16} weight="bold" className="text-indigo-600" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-900">
              Analyse Financière
            </span>
          </div>

          <div className="px-6 space-y-3">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-slate-500 font-medium">
                Sous-total brut
              </span>
              <span className="font-mono-numbers font-semibold text-slate-900">
                {totals.subTotal.toLocaleString("fr-FR")} €
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-rose-500 font-medium italic">
                  Remise appliquée
                </span>
                <span className="font-mono-numbers font-semibold text-rose-600">
                  -{discount.toLocaleString("fr-FR")} €
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-[12px]">
              <span className="text-slate-500 font-medium">
                Impact TVA ({activeQuote.financials.vatRatePercent}%)
              </span>
              <span className="font-mono-numbers font-semibold text-slate-900">
                +{vatAmount.toLocaleString("fr-FR")} €
              </span>
            </div>

            <div className="h-px bg-slate-100 my-4" />
          </div>
        </section>

        {/* 02. SECTION : IDENTITÉ VISUELLE */}
        <section className="py-8">
          <div className="flex items-center gap-2 px-6 mb-6">
            <PaletteIcon size={16} weight="bold" className="text-indigo-600" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-900">
              Moteur de Style
            </span>
          </div>

          <div className="px-6 space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {availableThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className={cn(
                    "group flex items-center justify-between p-4 border transition-all relative rounded-none text-left",
                    currentTheme === theme.id
                      ? "border-slate-900 bg-white ring-1 ring-slate-900"
                      : "border-slate-100 hover:border-slate-300 bg-slate-50/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-3.5 rounded-none border border-slate-950/10"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span
                      className={cn(
                        "text-[12px] font-bold uppercase tracking-tight",
                        currentTheme === theme.id
                          ? "text-slate-900"
                          : "text-slate-400"
                      )}
                    >
                      {theme.name}
                    </span>
                  </div>
                  {currentTheme === theme.id && (
                    <CheckIcon
                      size={14}
                      weight="bold"
                      className="text-slate-900"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        
      </div>

      {/* 04. FOOTER : TERMINAL DE PROFIT */}
      <footer className="shrink-0">
        <div className="bg-slate-950 px-4 py-8 space-y-1 relative overflow-hidden border-t border-white/5">
          {/* Accentuation CAO */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-600" />

          <div className="flex justify-between items-end relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-slate-200 text-[10px] font-bold uppercase tracking-[0.2em]">
                Net à Payer TTC
              </span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-emerald-500/90 font-bold uppercase tracking-tighter">
                  Prêt pour émission
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono-numbers text-[28px] font-bold text-white leading-none tracking-tighter ">
                {totals.totalTTC.toLocaleString("fr-FR")}€
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
