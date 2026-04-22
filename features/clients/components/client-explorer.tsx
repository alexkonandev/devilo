"use client";

import React, { useState, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  TrendUpIcon,
  ClockIcon,
  UserListIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ClientListItem } from "@/types/client";
import { CreateClientDialog } from "../create-client-dialog";

interface ClientExplorerProps {
  clients: ClientListItem[];
  activeId?: string;
  onSelect: (id: string) => void;
}

type TensionFilter = "ALL" | "LATENCY" | "HIGH_VALUE" | "INACTIVE";

const SectionHeader = ({ title, icon: Icon }: { title: string; icon: any }) => (
  <div className="flex items-center gap-2 px-4 mb-3 shrink-0">
    <Icon size={14} weight="bold" className="text-indigo-600" />
    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-900">
      {title}
    </span>
  </div>
);

export function ClientExplorer({
  clients,
  activeId,
  onSelect,
}: ClientExplorerProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TensionFilter>("ALL");

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      switch (filter) {
        case "LATENCY":
          return c.quoteCount > 0 && c.totalSpent < 100000;
        case "HIGH_VALUE":
          return c.totalSpent > 1000000;
        case "INACTIVE":
          return c.quoteCount === 0;
        default:
          return true;
      }
    });
  }, [clients, search, filter]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-[320px] overflow-hidden rounded-none shadow-none">
      {/* 00. HEADER : SYNC H-15 */}
      <header className="h-15 shrink-0 flex items-center px-4 justify-between border-b border-slate-200 bg-white z-10">
        <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-1">
              Base_Actifs
            </span>
          <span className="text-[14px] font-bold text-slate-900 tracking-tight">
            Radar_Contacts
          </span>
        </div>
        <CreateClientDialog />
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col min-h-0">
        {/* MODULE 01 : RECHERCHE & FILTRES DE TENSION */}
        <section className="py-5 border-b border-slate-100 bg-slate-50/30">
          <SectionHeader title="Scan_Database" icon={UserListIcon} />
          <div className="px-4 space-y-3">
            <div className="relative group">
              <MagnifyingGlassIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                size={14}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="RECHERCHE RAPIDE..."
                className="w-full bg-white border border-slate-200 pl-9 pr-3 h-9 text-[11px] font-bold uppercase outline-none focus:border-indigo-600 transition-all placeholder:text-slate-200"
              />
            </div>

            <div className="flex divide-x divide-slate-200 border border-slate-200">
              <TensionButton
                active={filter === "ALL"}
                onClick={() => setFilter("ALL")}
                label="ALL"
              />
              <TensionButton
                active={filter === "LATENCY"}
                onClick={() => setFilter("LATENCY")}
                label="LAT"
                icon={ClockIcon}
              />
              <TensionButton
                active={filter === "HIGH_VALUE"}
                onClick={() => setFilter("HIGH_VALUE")}
                label="VIP"
                icon={TrendUpIcon}
              />
            </div>
          </div>
        </section>

        {/* MODULE 02 : FEED DE PRODUCTION */}
        <section className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto scrollbar-none">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => onSelect(client.id)}
                  className={cn(
                    "w-full p-4 flex flex-col items-start gap-1.5 border-b border-slate-100 transition-none group relative text-left",
                    activeId === client.id ? "bg-white" : "hover:bg-slate-50/50"
                  )}
                >
                  {activeId === client.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                  )}

                  <div className="w-full flex items-center justify-between">
                    <span
                      className={cn(
                        "text-[12px] font-bold uppercase tracking-tight truncate",
                        activeId === client.id
                          ? "text-slate-900"
                          : "text-slate-500"
                      )}
                    >
                      {client.name}
                    </span>
                    <div
                      className={cn(
                        "w-1.5 h-1.5",
                        client.totalSpent > 0
                          ? "bg-emerald-500"
                          : "bg-slate-200"
                      )}
                    />
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      LTV_MONITOR
                    </span>
                    <span className="text-[13px] font-mono font-bold text-slate-900">
                      {new Intl.NumberFormat("fr-CI").format(client.totalSpent)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      CFA
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-12 text-center opacity-20">
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Zero_Result
                </span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* FOOTER SYNC AVEC SOURCE VÉRITÉ */}
      <footer className="mt-auto border-t border-slate-900 bg-white p-5 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Flux_Actif
          </span>
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase">
              Ready
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TensionButton({ active, onClick, label, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 h-8 flex items-center justify-center gap-1.5 px-1 transition-none",
        active
          ? "bg-slate-900 text-white"
          : "bg-white text-slate-400 hover:text-slate-900"
      )}
    >
      {Icon && <Icon size={10} weight="bold" />}
      <span className="text-[8px] font-black uppercase tracking-tighter">
        {label}
      </span>
    </button>
  );
}
