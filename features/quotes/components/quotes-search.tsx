"use client";

import { useQuotes } from "./quote-context";
import { Search, X, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuotesSearch() {
  const { searchQuery, setSearchQuery } = useQuotes();

  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <div className="relative w-full px-3 py-2">
      <div className="relative group">
        {/* Icône de recherche / Focus visuel */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="N° de devis ou client..."
          className={cn(
            "w-full h-9 pl-9 pr-9 bg-slate-100/50 border border-transparent rounded-md",
            "text-sm placeholder:text-slate-400 font-medium",
            "focus:outline-none focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-indigo-500/10",
            "transition-all duration-200"
          )}
        />

        {/* Indicateur de raccourci ou Bouton Reset */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery ? (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-slate-200 rounded-md text-slate-500 transition-colors"
              title="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 border border-slate-200 rounded bg-white text-[10px] text-slate-400 font-mono">
              <Hash className="w-2.5 h-2.5" />
              <span>SEARCH</span>
            </div>
          )}
        </div>
      </div>

      {/* Petit indicateur de résultat actif */}
      {searchQuery && (
        <p className="absolute -bottom-4 left-4 text-[10px] font-medium text-indigo-500 animate-in fade-in slide-in-from-top-1">
          Filtrage actif...
        </p>
      )}
    </div>
  );
}
