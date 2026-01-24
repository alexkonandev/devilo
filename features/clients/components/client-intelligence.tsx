"use client";

import React from "react";
import {
  TrendingUp,
  FileText,
  MessageSquare,
  Layers,
  Zap,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientListItem } from "@/types/client";

interface ClientIntelligenceProps {
  client?: ClientListItem;
}

export function ClientIntelligence({ client }: ClientIntelligenceProps) {
  if (!client) return <IntelligencePlaceholder />;

  return (
    <div className="flex flex-col h-full bg-white antialiased border-l border-slate-200 w-80 shrink-0 overflow-hidden">
      {/* 1. PROFIT ENGINE : LTV DISPLAY */}
      <section className="border-b border-slate-200">
        <div className="p-5 space-y-4 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              Profit_Engine_v1
            </span>
            <TrendingUp size={14} className="text-emerald-500" />
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">
              LTV_Gross_Revenue
            </label>
            <p className="font-mono text-slate-900 text-[22px] font-black tracking-tighter leading-none">
              {new Intl.NumberFormat("fr-CI").format(client.totalSpent)}
              <span className="text-[10px] ml-1 text-slate-400 uppercase font-bold">
                CFA
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <div className="h-1 flex-1 bg-slate-200">
              <div className="h-full bg-indigo-600 w-[65%]" />
            </div>
            <span className="text-[9px] font-mono font-bold text-slate-900">
              65%
            </span>
          </div>
        </div>
      </section>

      {/* 2. COMMAND CENTER : FAST ACTIONS */}
      <section className="flex-1 overflow-y-auto scrollbar-none divide-y divide-slate-200">
        <div className="px-5 py-3 bg-white sticky top-0 z-10 border-b border-slate-200">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900">
            Command_Center
          </span>
        </div>

        <div className="grid grid-cols-1 divide-y divide-slate-100">
          <IntelligenceButton
            icon={Zap}
            label="Relance_IA"
            sub="Générer texte contextuel"
            isPrimary
          />
          <IntelligenceButton
            icon={FileText}
            label="Export_Audit"
            sub="Générer rapport .PDF"
          />
          <IntelligenceButton
            icon={MessageSquare}
            label="Direct_Connect"
            sub="Ouvrir WhatsApp Business"
          />
        </div>

        {/* 3. ASSETS REPOSITORY */}
        <div className="bg-slate-50/30 min-h-full pb-10">
          <div className="px-5 py-3 border-b border-slate-200">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              Active_Assets
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            <DocumentItem label="Contrat_Cadre_2026.pdf" size="1.2 MB" />
            <DocumentItem label="RIB_Societe_V2.pdf" size="450 KB" />
            {client.quoteCount === 0 && (
              <div className="p-8 text-center border-b border-slate-200 border-dashed">
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                  Null_Asset_Registry
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER : SYSTEM STATUS */}
      <footer className="h-12 border-t border-slate-200 flex items-center px-5 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] font-mono font-black uppercase text-slate-400 tracking-tighter">
            Intelligence_Core_Active
          </span>
        </div>
      </footer>
    </div>
  );
}

// --- SOUS-COMPOSANTS (CHIRURGIE STUDIO) ---

function IntelligenceButton({
  icon: Icon,
  label,
  sub,
  isPrimary,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
  isPrimary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-5 py-4 flex items-start gap-4 transition-all group active:scale-[0.98]",
        isPrimary ? "bg-indigo-50/30" : "bg-white hover:bg-slate-50"
      )}
    >
      <Icon
        size={16}
        className={cn(
          "mt-0.5",
          isPrimary
            ? "text-indigo-600"
            : "text-slate-400 group-hover:text-indigo-600"
        )}
      />
      <div className="flex flex-col text-left">
        <span
          className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            isPrimary ? "text-indigo-600" : "text-slate-900"
          )}
        >
          {label}
        </span>
        <span className="text-[8px] font-bold uppercase text-slate-400 tracking-tight">
          {sub}
        </span>
      </div>
    </button>
  );
}

function DocumentItem({ label, size }: { label: string; size: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer group">
      <div className="flex items-center gap-3 truncate">
        <Layers
          size={14}
          className="text-slate-400 group-hover:text-indigo-600"
        />
        <span className="text-[10px] font-bold text-slate-700 truncate uppercase tracking-tighter">
          {label}
        </span>
      </div>
      <span className="text-[8px] font-mono font-bold text-slate-300">
        {size}
      </span>
    </div>
  );
}

function IntelligencePlaceholder() {
  return (
    <div className="h-full w-80 border-l border-slate-200 flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
      <div className="w-10 h-10 border border-slate-200 flex items-center justify-center bg-white mb-4">
        <Zap size={18} className="text-slate-300" />
      </div>
      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">
        Engine_Standby
      </p>
    </div>
  );
}
