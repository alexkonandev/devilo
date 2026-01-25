"use client";

import React from "react";
import { useQuotes } from "./quote-context";
import { QuoteRowItem } from "./quote-row-item";
import { FileSearch, PlusCircle, Inbox } from "lucide-react";
import Link from "next/link";

export function QuoteList() {
  const { filteredQuotes, searchQuery, activeStatus, isLoading } = useQuotes();

  // 1. ÉTAT : CHARGEMENT (Optionnel si tu utilises les skeletons en Suspense)
  if (isLoading && filteredQuotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300 mb-4" />
        <p className="text-sm font-medium">Synchronisation du registre...</p>
      </div>
    );
  }

  // 2. ÉTAT : VIDE (Pas de données du tout)
  if (filteredQuotes.length === 0 && !searchQuery && activeStatus === "ALL") {
    return (
      <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 transition-all">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <Inbox className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">
          Aucun devis enregistré
        </h3>
        <p className="text-slate-500 text-sm mb-6 text-center max-w-[280px]">
          Commencez à générer des revenus en créant votre premier devis
          professionnel.
        </p>
        <Link
          href="/quotes/create"
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Nouveau Devis
        </Link>
      </div>
    );
  }

  // 3. ÉTAT : RÉSULTATS VIDE (Filtrage trop restrictif)
  if (filteredQuotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 animate-in fade-in duration-300">
        <FileSearch className="w-12 h-12 text-slate-200 mb-3" />
        <p className="text-sm font-medium">
          Aucun résultat pour cette recherche.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Essayez d&apos;ajuster vos filtres ou le numéro de devis.
        </p>
      </div>
    );
  }

  // 4. LE LEDGER (La Liste)
  return (
    <div className="flex flex-col gap-2 pb-10">
      {/* En-tête de colonnes discret pour la lisibilité */}
      <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 mb-2">
        <div className="col-span-2">Référence</div>
        <div className="col-span-4">Client</div>
        <div className="col-span-2 text-right">Montant HT</div>
        <div className="col-span-2 text-center">Statut</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      <div className="flex flex-col gap-1">
        {filteredQuotes.map((quote) => (
          <QuoteRowItem key={quote.id} quote={quote} />
        ))}
      </div>

      {/* Footer informatif */}
      <div className="mt-4 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
        <p className="text-[10px] text-slate-500 font-medium italic">
          Affichage de {filteredQuotes.length} document(s) correspondant à vos
          critères de sélection.
        </p>
      </div>
    </div>
  );
}
