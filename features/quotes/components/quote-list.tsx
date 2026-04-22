"use client";

import React from "react";
import { useQuotes } from "./quote-context";
import { QuoteRowItem } from "./quote-row-item";
import { FileSearch, Inbox } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Plus, DownloadSimple, HardDrive } from "@phosphor-icons/react";

/**
 * TRADUCTEUR DE STATUTS (SÉMANTIQUE LOGICIELLE)
 */
const STATUS_MAPPER: Record<string, string> = {
  ALL: "Tous les Devis",
  DRAFT: "Brouillons",
  SENT: "Envoyés",
  ACCEPTED: "Acceptés",
  REJECTED: "Refusés",
  PAID: "Payés",
};

/**
 * LOGIQUE D'EXPORTATION CSV (LOCALISÉE)
 */
const exportToCSV = (data: any[], statusKey: string) => {
  if (!data.length) return;

  const currentLabel = STATUS_MAPPER[statusKey] || statusKey;
  const headers = ["Référence", "Client", "Montant_HT", "État"];

  const csvRows = [
    headers.join(","),
    ...data.map((q) =>
      [q.id, q.clientName, q.amount, STATUS_MAPPER[q.status] || q.status].join(
        ","
      )
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute(
    "download",
    `registre_${currentLabel.toLowerCase().replace(/ /g, "_")}.csv`
  );
  a.click();
  window.URL.revokeObjectURL(url);
};

export function QuoteList() {
  const { filteredQuotes, searchQuery, activeStatus, isLoading } = useQuotes();

  // Traduction dynamique du titre de la vue
  const displayTitle = STATUS_MAPPER[activeStatus] || activeStatus;

  if (isLoading && filteredQuotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white">
        <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-none" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* HEADER ULTRA-COMPACT : H-12 */}
      <header className="h-15 shrink-0 flex items-center px-4 justify-between border-b border-slate-200 bg-white z-20 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-black text-slate-900 uppercase tracking-tighter">
              {displayTitle}
            </span>
            <span className="text-[10px] font-mono font-bold text-indigo-600">
              {"//"} {filteredQuotes.length.toString().padStart(3, "0")}
            </span>
          </div>
        </div>

        {/* TOOLBAR MICRO-ESTHÉTIQUE */}
        <div className="flex items-center gap-1.5">
          {/* Bouton Export Tactile */}
          <button
            onClick={() => exportToCSV(filteredQuotes, activeStatus)}
            title={`Exporter : ${displayTitle}`}
            className=" cursor-pointer h-8 w-8 flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-600 
                       shadow-[inset_0_1px_0_0_rgba(255,255,255,1)] hover:bg-white hover:text-indigo-600 
                       active:shadow-inner active:bg-slate-100 transition-all group outline-none"
          >
            <DownloadSimple size={16} weight="bold" />
          </button>

          <div className="w-px h-4 bg-slate-200 mx-0.5" />

          {/* Bouton Nouveau Primaire Compact */}
          <Link href="/quotes/new" className="outline-none">
            <div
              className="h-8 w-8 flex items-center justify-center gap-2 bg-slate-900 text-white 
                          border-t border-l border-white/20 border-b-2 border-r-2 border-black/50
                          hover:bg-indigo-600 active:translate-y-[1px] active:border-b-0 transition-all group"
            >
              <Plus size={14} weight="bold" />
            </div>
          </Link>
        </div>
      </header>

      {/* HEADER DE COLONNES H-8 (Densité Trading) */}
      <div className="grid grid-cols-12 px-4 h-8 items-center bg-slate-50/50 border-b border-slate-200 sticky top-0 z-10">
        <div className="col-span-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
          Réf.
        </div>
        <div className="col-span-4 text-[8px] font-black uppercase tracking-widest text-slate-400">
          Entité_Client
        </div>
        <div className="col-span-2 text-right text-[8px] font-black uppercase tracking-widest text-slate-400 px-4">
          Valeur_HT
        </div>
        <div className="col-span-2 text-center text-[8px] font-black uppercase tracking-widest text-slate-400">
          État
        </div>
        <div className="col-span-2 text-right text-[8px] font-black uppercase tracking-widest text-slate-400 flex justify-end">
          <HardDrive size={10} weight="bold" />
        </div>
      </div>

      {/* LISTE OU ÉTAT VIDE */}
      <div className="flex-1 overflow-y-auto scrollbar-none divide-y divide-slate-100">
        {filteredQuotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
            <Inbox size={24} className="mb-2 text-slate-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              Aucune donnée détectée
            </span>
          </div>
        ) : (
          filteredQuotes.map((quote) => (
            <QuoteRowItem key={quote.id} quote={quote} />
          ))
        )}
      </div>

      
    </div>
  );
}
