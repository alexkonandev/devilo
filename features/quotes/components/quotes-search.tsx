"use client";

import React from "react";
import { useQuotes } from "./quote-context";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function QuotesSearch() {
  const { searchQuery, setSearchQuery } = useQuotes();

  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <div className="relative flex-1 h-full bg-white group">
      {/* Icône Structurelle */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
        <MagnifyingGlass size={16} weight="bold" />
      </div>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="RECHERCHER DANS LE REGISTRE..."
        className={cn(
          "w-full h-full pl-14 pr-12 bg-transparent",
          "text-[10px] font-black uppercase tracking-widest text-slate-900",
          "placeholder:text-slate-300 placeholder:font-black placeholder:tracking-[0.2em]",
          "rounded-none border-none outline-none",
          "focus:ring-0 focus:bg-slate-50/30 transition-all"
        )}
      />

      {/* Actions de recherche */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
        {searchQuery ? (
          <button
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-rose-600 transition-all active:scale-90"
            title="RÉINITIALISER"
          >
            <X size={14} weight="bold" />
          </button>
        ) : (
          <span className="text-[8px] font-mono text-slate-300 border border-slate-100 px-1 py-0.5 select-none">
            ESC
          </span>
        )}
      </div>

      {/* Indicateur de traitement (Actif sur filtrage) */}
      {searchQuery && (
        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-indigo-600 animate-progress origin-left" />
        </div>
      )}
    </div>
  );
}
