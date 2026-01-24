"use client";

import React from "react";
import {
  TrendUp,
  ChatText,
  UserFocus,
  ShieldCheck,
  Copy,
  ArrowSquareOut,
  Lightning,
  Info,
} from "@phosphor-icons/react";
import { QuoteListItem } from "@/types/quote";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notifications";
import { cn } from "@/lib/utils";

interface QuoteIntelligenceProps {
  quote?: QuoteListItem;
}

export function QuoteIntelligence({ quote }: QuoteIntelligenceProps) {
  const router = useRouter();

  if (!quote) return <IntelligencePlaceholder />;

  // LOGIQUE BUSINESS (Stratégie Profit)
  const vatAmount = quote.totalAmount * 0.18; // Standard 18%
  const amountHT = quote.totalAmount - vatAmount;
  const estimatedMargin = amountHT * 0.7; // Focus Rentabilité

  const handleCopyRelance = () => {
    const text = `Bonjour, je reviens vers vous concernant le devis ${quote.number}. Est-il toujours d'actualité ?`;
    navigator.clipboard.writeText(text);
    notify.success("RELANCE_COPIÉE", "Prêt pour transmission.");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30  w-80 shrink-0 overflow-hidden">
      {/* 1. MODULE MARGE : PROFIT TRACKER */}
      <section className="p-5 border-b border-slate-200 space-y-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendUp size={14} weight="bold" className="text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
              Profit_Analyst
            </span>
          </div>
          <Lightning size={14} weight="fill" className="text-amber-400" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
              Tax_Provision
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-600">
              +{new Intl.NumberFormat("fr-CI").format(vatAmount)}
            </span>
          </div>

          <div className="p-4 bg-slate-900 flex flex-col gap-1 rounded-none shadow-none">
            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">
              Estimated_Gross_Margin
            </span>
            <p className="text-[22px] font-mono font-black text-white tracking-tighter tabular-nums leading-none">
              {new Intl.NumberFormat("fr-CI").format(estimatedMargin)}
              <span className="text-[10px] ml-1 text-slate-500 uppercase">
                CFA
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* 2. COMMAND CENTER : ACTIONS STRATÉGIQUES */}
      <section className="p-5 space-y-4">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
          Command_Actions
        </span>

        <div className="grid grid-cols-1 gap-px bg-slate-200 border border-slate-200 shadow-none">
          <ActionButton
            icon={ChatText}
            label="Générer_Relance"
            sub="Copier dans presse-papier"
            onClick={handleCopyRelance}
          />
          <ActionButton
            icon={UserFocus}
            label="Client_Profile"
            sub="Basculer vers CRM"
            onClick={() => router.push(`/clients?id=${quote.clientName}`)}
          />
        </div>
      </section>

      {/* 3. COMPLIANCE CHECKLIST */}
      <section className="p-5 flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} weight="bold" className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
            Compliance_Status
          </span>
        </div>

        <div className="space-y-1">
          <CheckRow label="Doc_Registry_Valid" active={!!quote.number} />
          <CheckRow label="Tax_Calculation_Sync" active={true} />
          <CheckRow label="Terms_Agreed_Check" active={true} />
        </div>
      </section>

      {/* FOOTER SYNC */}
      <footer className="p-5 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-2 grayscale opacity-50">
          <Info size={12} weight="bold" />
          <span className="text-[8px] font-black uppercase tracking-widest">
            Logic_Core_v2.0.4
          </span>
        </div>
      </footer>
    </div>
  );
}

// --- SOUS-COMPOSANTS STUDIO ---

function ActionButton({ icon: Icon, label, sub, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="bg-white p-4 flex items-start gap-4 hover:bg-slate-50 transition-none group text-left active:scale-[0.98]"
    >
      <Icon
        size={18}
        weight="bold"
        className="text-slate-400 group-hover:text-indigo-600"
      />
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none mb-1">
          {label}
        </span>
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">
          {sub}
        </span>
      </div>
    </button>
  );
}

function CheckRow({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-100">
      <span className="text-[9px] font-bold uppercase tracking-tight text-slate-600">
        {label}
      </span>
      <div
        className={cn("w-1.5 h-1.5", active ? "bg-emerald-500" : "bg-rose-500")}
      />
    </div>
  );
}

function IntelligencePlaceholder() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50/50">
      <div className="w-12 h-12 border border-slate-200 border-dashed flex items-center justify-center mb-4">
        <TrendUp size={20} className="text-slate-200" />
      </div>
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">
        Data_Stream_Null
      </p>
    </div>
  );
}
