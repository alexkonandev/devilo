"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ClientListItem } from "@/types/client";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CurrencyCircleDollarIcon,
  FileTextIcon,
} from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM - Source de Vérité
// ═══════════════════════════════════════════════════════════════════════════════

const DS = {
  micro: "text-[9px] uppercase font-bold tracking-tighter",
  mono: "font-mono text-[11px] tabular-nums leading-none",
  label: "text-[9px] uppercase font-bold tracking-wider text-slate-400",
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const formatCompact = (amount: number): string => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`;
  return amount.toString();
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT - Grid CSS Strict (3 Lignes)
// ═══════════════════════════════════════════════════════════════════════════════

interface ClientMasterListProps {
  clients: ClientListItem[];
  selectedId: string | null;
  onSelect: (client: ClientListItem | null) => void;
  onCreate: () => void;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

export function ClientMasterList({
  clients,
  selectedId,
  onSelect,
  onCreate,
  searchQuery = "",
  onSearch,
  isLoading,
}: ClientMasterListProps) {
  // Local state for uncontrolled mode (backward compat)
  const [localSearch, setLocalSearch] = useState("");
  const effectiveQuery = onSearch ? searchQuery : localSearch;
  const handleSearch = onSearch ? onSearch : setLocalSearch;

  return (
    // ═══════════════════════════════════════════════════════════════════════════
    // GRID PRINCIPALE - 3 Lignes Strictes
    // grid-template-rows: [Header] auto [Search] auto [List] 1fr
    // ═══════════════════════════════════════════════════════════════════════════
    <div className="h-full w-[300px] bg-white border-r border-slate-200/60 grid grid-rows-[auto_auto_1fr] overflow-hidden">
      {/* ═══ LIGNE 1: HEADER (auto) ═══ */}
      <header className="px-3 py-2.5 border-b border-slate-200/60 bg-slate-50/30">
        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
          {/* Titre + Compteur */}
          <div className="flex items-center gap-1.5 min-w-0">
            <UsersIcon
              size={13}
              className="text-indigo-500 shrink-0"
              weight="bold"
            />
            <h2 className={cn(DS.micro, "text-slate-600 truncate")}>
              CARNET D&apos;ADRESSES
            </h2>
            <span className={cn(DS.mono, "text-slate-400 shrink-0")}>
              {clients.length}
              {isLoading && <span className="ml-1">⟳</span>}
            </span>
          </div>

          {/* Bouton Nouveau - Dense, Monochrome */}
          <button
            onClick={onCreate}
            className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[9px] font-bold uppercase tracking-wider transition-colors shrink-0"
          >
            <PlusIcon size={10} weight="bold" />
            <span className="hidden">Ajouter</span>
          </button>
        </div>
      </header>

      {/* ═══ LIGNE 2: SEARCH (auto) ═══ */}
      <div className="px-3 py-2 border-b border-slate-200/60">
        <div className="relative">
          <MagnifyingGlassIcon
            size={12}
            weight="bold"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={effectiveQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher un client..."
            className="w-full h-7 pl-8 pr-3 bg-slate-100 border border-slate-200/60 hover:border-slate-300 focus:border-indigo-400/60 focus:bg-white rounded-md text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all"
          />
        </div>
      </div>

      {/* ═══ LIGNE 3: LIST (1fr) ═══ */}
      <div className="relative overflow-y-auto">
        <AnimatePresence mode="wait">
          {clients.length > 0 ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="divide-y divide-slate-100"
            >
              {clients.map((client, index) => (
                <ClientListItemRow
                  key={client.id}
                  client={client}
                  isSelected={selectedId === client.id}
                  index={index}
                  onClick={() => onSelect(client)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-4"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center mb-2">
                <UsersIcon size={18} className="text-slate-400" />
              </div>
              <p className="text-xs font-medium text-slate-500">
                {searchQuery ? "Aucun résultat" : "Aucun client"}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {searchQuery
                  ? "Essayez une autre recherche"
                  : "Ajoutez votre premier client"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT LIST ITEM - Grid Interne (Bento Compact)
// Architecture: [Avatar] [Nom+Email] [KPIs]
// ═══════════════════════════════════════════════════════════════════════════════

interface ClientListItemRowProps {
  client: ClientListItem;
  isSelected: boolean;
  index: number;
  onClick: () => void;
}

function ClientListItemRow({
  client,
  isSelected,
  index,
  onClick,
}: ClientListItemRowProps) {
  const isVIP = client.totalSpent > 1_000_000;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.15,
        delay: index * 0.02,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={onClick}
      className={cn(
        "group grid grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-1.5 cursor-pointer transition-all border-l-2",
        "hover:bg-slate-50/70 border-transparent",
        isSelected && "bg-indigo-50/70 border-indigo-500",
      )}
    >
      {/* ═══ COLONNE 1: AVATAR ═══ */}
      <div
        className={cn(
          "w-7 h-7 rounded-md flex items-center justify-center font-black text-[10px] shrink-0 transition-colors",
          isSelected
            ? "bg-indigo-100 text-indigo-600"
            : isVIP
              ? "bg-amber-50 text-amber-600 border border-amber-200/60"
              : "bg-slate-100 text-slate-500 group-hover:bg-slate-200",
        )}
      >
        {client.name.slice(0, 2).toUpperCase()}
      </div>

      {/* ═══ COLONNE 2: NOM & EMAIL (Flex-Col) ═══ */}
      <div className="min-w-0 flex flex-col justify-center">
        <span
          className={cn(
            "text-[12px] font-semibold truncate leading-tight",
            isSelected ? "text-indigo-900" : "text-slate-800",
            "group-hover:text-indigo-700 transition-colors",
          )}
        >
          {client.name}
        </span>
        {client.email && (
          <span className="text-[10px] text-slate-400 truncate leading-tight">
            {client.email}
          </span>
        )}
      </div>

      {/* ═══ COLONNE 3: KPIs (CA & Devis) ═══ */}
      <div className="flex flex-col items-end justify-center shrink-0">
        {/* CA Total - Monospace */}
        <div className="flex items-center gap-0.5">
          <CurrencyCircleDollarIcon
            size={9}
            className={cn(
              "shrink-0",
              isVIP ? "text-amber-500" : "text-slate-400",
            )}
          />
          <span
            className={cn(
              DS.mono,
              "font-bold",
              isVIP ? "text-amber-600" : "text-slate-700",
            )}
          >
            {formatCompact(client.totalSpent)}
          </span>
        </div>

        {/* Devis Count - Monospace */}
        <div className="flex items-center gap-0.5 mt-0.5">
          <FileTextIcon size={8} className="text-slate-300 shrink-0" />
          <span className={cn(DS.mono, "text-slate-400 text-[10px]")}>
            {client.quoteCount}d
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS & UTILS
// ═══════════════════════════════════════════════════════════════════════════════

export function useClientSearch(clients: ClientListItem[]) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q),
    );
  }, [clients, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredClients,
  };
}

export { formatCompact };
export type { ClientListItem };
