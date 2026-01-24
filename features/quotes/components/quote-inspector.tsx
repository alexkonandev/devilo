"use client";

import React from "react";
import {
  CalendarBlank,
  User,
  Hash,
  ArrowRight,
  ClockCounterClockwise,
  Info,
  FileCode,
  Money,
  CaretRight,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { QuoteListItem, QuoteStatus } from "@/types/quote";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface QuoteInspectorProps {
  quote?: QuoteListItem;
}

export function QuoteInspector({ quote }: QuoteInspectorProps) {
  const router = useRouter();

  if (!quote) return <InspectorPlaceholder />;

  const amountHT = quote.totalAmount / 1.18; // Exemple TVA 18% (Standard CI)
  const vatAmount = quote.totalAmount - amountHT;

  return (
    <div className="flex flex-col h-full bg-white antialiased overflow-hidden">
      {/* 1. HEADER : IDENTITÉ SYSTÈME H-20 */}
      <header className="h-24 shrink-0 border-b border-slate-200 flex items-center justify-between px-8 bg-white">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 border border-slate-200 bg-slate-50 flex items-center justify-center">
            <FileCode size={24} className="text-slate-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
                DOSSIER_ID: {quote.number}
              </span>
              <StatusBadge status={quote.status} />
            </div>
            <h2 className="text-[24px] font-black text-slate-950 uppercase tracking-tighter leading-none">
              {quote.clientName}
            </h2>
          </div>
        </div>

        <button
          onClick={() => router.push(`/quotes/editor/${quote.id}`)}
          className="h-10 px-6 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-3 active:scale-95"
        >
          Ouvrir_Studio_Production
          <ArrowRight size={14} weight="bold" />
        </button>
      </header>

      {/* 2. BODY : GRILLE DE DONNÉES & ANALYSE */}
      <div className="flex-1 overflow-y-auto scrollbar-none divide-y divide-slate-100">
        {/* SECTION 01 : META MÉTRIQUES */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
          <MetaTile
            icon={CalendarBlank}
            label="Date_Émission"
            value={format(new Date(quote.createdAt), "dd.MM.yy")}
          />
          <MetaTile icon={User} label="Responsable_Flux" value="Admin_Root" />
          <MetaTile
            icon={ClockCounterClockwise}
            label="Last_Sync"
            value={format(new Date(quote.updatedAt), "HH:mm:ss")}
          />
        </div>

        <div className="p-8 grid grid-cols-12 gap-12">
          {/* ANALYSE FINANCIÈRE */}
          <div className="col-span-7 space-y-6">
            <div className="flex items-center gap-2">
              <Money size={16} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                Audit_Financier_Direct
              </span>
            </div>

            <div className="border border-slate-200 divide-y divide-slate-100 bg-slate-50/20">
              <FinancialRow label="Base_Hors_Taxe" value={amountHT} isMono />
              <FinancialRow
                label="Taxe_Sur_Valeur_Ajoutée"
                value={vatAmount}
                isMono
              />
              <div className="p-6 bg-white flex justify-between items-center">
                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">
                  Total_Net_A_Payer
                </span>
                <p className="text-[28px] font-mono font-black text-slate-950 tracking-tighter tabular-nums">
                  {new Intl.NumberFormat("fr-CI").format(quote.totalAmount)}
                  <span className="text-[12px] ml-1">CFA</span>
                </p>
              </div>
            </div>
          </div>

          {/* TIMELINE DE PRODUCTION */}
          <div className="col-span-5 space-y-6">
            <div className="flex items-center gap-2 text-slate-400">
              <ClockCounterClockwise size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                Journal_Événements
              </span>
            </div>
            <div className="border-l border-slate-200 ml-2 space-y-6">
              <TimelinePoint
                label="Dossier généré par le système"
                date={quote.createdAt}
                active
              />
              <TimelinePoint
                label="Mise à jour des actifs financiers"
                date={quote.updatedAt}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPOSANTS INTERNES ---

function MetaTile({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="p-5 space-y-1 bg-white">
      <div className="flex items-center gap-2">
        <Icon size={12} weight="bold" className="text-slate-400" />
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="text-[12px] font-bold text-slate-900 uppercase tracking-tight">
        {value}
      </p>
    </div>
  );
}

function FinancialRow({
  label,
  value,
  isMono,
}: {
  label: string;
  value: number;
  isMono?: boolean;
}) {
  return (
    <div className="p-4 flex justify-between items-center bg-white/50">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
        {label}
      </span>
      <span
        className={cn(
          "text-[14px] font-bold text-slate-950",
          isMono && "font-mono"
        )}
      >
        {new Intl.NumberFormat("fr-CI").format(value)}
      </span>
    </div>
  );
}

function TimelinePoint({
  label,
  date,
  active,
}: {
  label: string;
  date: Date;
  active?: boolean;
}) {
  return (
    <div className="relative pl-6">
      <div
        className={cn(
          "absolute -left-[4.5px] top-1 w-2 h-2 border border-white",
          active ? "bg-indigo-600" : "bg-slate-300"
        )}
      />
      <p className="text-[10px] font-bold text-slate-900 uppercase leading-none mb-1">
        {label}
      </p>
      <p className="text-[9px] font-mono text-slate-400 uppercase">
        {format(new Date(date), "dd/MM HH:mm")}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: QuoteStatus }) {
  const config = {
    DRAFT: "text-slate-400 bg-slate-100",
    SENT: "text-amber-600 bg-amber-50",
    ACCEPTED: "text-emerald-600 bg-emerald-50",
    PAID: "text-indigo-600 bg-indigo-50",
    REJECTED: "text-rose-600 bg-rose-50",
  };
  return (
    <span
      className={cn(
        "px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border border-current",
        config[status]
      )}
    >
      {status}
    </span>
  );
}

function InspectorPlaceholder() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-20 bg-slate-50/30">
      <div className="w-16 h-16 border border-slate-200 flex items-center justify-center mb-6">
        <Info size={32} weight="bold" className="text-slate-200" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
        AWAITING_DATA_STREAM
      </p>
    </div>
  );
}
