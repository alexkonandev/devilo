"use client";

import React from "react";
import { ClientListItem } from "@/types/client";
import { cn } from "@/lib/utils";
import {
  Check,
  DotsThreeVertical,
  EnvelopeSimpleIcon,
  Trash,
  PencilSimple,
  UserCircle,
  MagnifyingGlass,
  Funnel,
  SpinnerGap,
} from "@phosphor-icons/react";
import { TablePagination } from "@/features/quotes/components/table-pagination";
import {
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_TITLE,
  DS_BADGE_NEUTRAL,
  DS_BADGE_SUCCESS,
  DS_BADGE_ACTIVE,
} from "@/lib/design-system";
import { BTN_SECONDARY } from "@/components/shared/ui/constants";

// ─── Utils ────────────────────────────────────────────────────────────────────

const formatCompact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
};

const totalPaid = (quotes: ClientListItem["quotes"]) =>
  quotes
    .filter((q) => q.status === "PAID")
    .reduce((sum, q) => sum + q.totalAmount, 0);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ClientTableProps {
  clients: ClientListItem[];
  selectedIds: Set<string>;
  selectedClientId: string | null;
  openDropdownId: string | null;
  copiedEmailId: string | null;
  activeFilter: "all" | "relance" | "inactif";
  clientsSansDevis: ClientListItem[];
  inactiveCount: number;
  hasConcentrationAlert: boolean;
  derniersAjouts: ClientListItem[];
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  isLoading: boolean;
  searchQuery: string;
  onToggleSelect: (clientId: string) => void;
  onSelectClient: (client: ClientListItem) => void;
  onEditClient: (client: ClientListItem) => void;
  onDeleteClient: (client: ClientListItem) => void;
  onDeleteMany: () => void;
  onClearSelection: () => void;
  onCopyEmail: (clientId: string, email: string) => void;
  onSetOpenDropdownId: (id: string | null) => void;
  onSetActiveFilter: (filter: "all" | "relance" | "inactif") => void;
  onPageChange: (page: number) => void;
  onSearchChange: (q: string) => void;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function ClientTable({
  clients,
  selectedIds,
  selectedClientId,
  openDropdownId,
  copiedEmailId,
  activeFilter,
  clientsSansDevis,
  inactiveCount,
  hasConcentrationAlert,
  derniersAjouts,
  page,
  totalPages,
  total,
  limit,
  isLoading,
  searchQuery,
  onToggleSelect,
  onSelectClient,
  onEditClient,
  onDeleteClient,
  onDeleteMany,
  onClearSelection,
  onCopyEmail,
  onSetOpenDropdownId,
  onSetActiveFilter,
  onPageChange,
  onSearchChange,
}: ClientTableProps) {
  return (
    <div className="w-full">
      <div className="border-0 rounded-md">
        {/* Header interne avec filtres rapides + compteurs */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className={DS_LABEL}>CLIENTS</span>
            <div className="flex items-center gap-1 ml-4">
              {(
                [
                  { key: "all", label: "Tous" },
                  {
                    key: "relance",
                    label: `À relancer (${clientsSansDevis.length})`,
                  },
                  {
                    key: "inactif",
                    label: `Inactifs (${inactiveCount})`,
                  },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    onSetActiveFilter(f.key);
                    onPageChange(1);
                  }}
                  className={cn(
                    DS_LABEL,
                    "rounded transition-colors relative",
                    activeFilter === f.key
                      ? "bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5"
                      : "text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200 px-2 py-0.5"
                  )}
                >
                  {f.label}
                  {/* Notification dot for critical alerts */}
                  {f.key === "all" && hasConcentrationAlert && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={DS_MICRO}>RÉCENTS</span>
            <div className="flex items-center -space-x-1.5">
              {derniersAjouts.map((client) => (
                <div
                  key={client.id}
                  className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[6px] font-black text-indigo-600 cursor-pointer hover:z-10 relative transition-transform hover:scale-110"
                  onClick={() => onSelectClient(client)}
                  title={`${client.name} — ${new Date(
                    client.createdAt
                  ).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                  })}`}
                >
                  {client.name.slice(0, 2).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between px-3 py-2 bg-indigo-50 border-b border-indigo-200">
            <span className={cn(DS_MONO, "text-indigo-700 font-bold")}>
              {selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}
            </span>
            <button
              onClick={onDeleteMany}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-600 text-white rounded text-[10px] font-medium hover:bg-red-700 transition-colors"
            >
              <Trash size={12} /> Supprimer
            </button>
          </div>
        )}

        {/* ═══ CONTENT: clients list OR empty/loading states ═══ */}
        {clients.length > 0 ? (
          <>
            {/* Liste clients */}
            <div className="divide-y divide-slate-50">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className={cn(
                    "grid grid-cols-[1fr_auto] gap-x-2 px-3 py-2 hover:bg-slate-50/50 transition-colors cursor-pointer",
                    selectedClientId === client.id && "bg-indigo-50/60"
                  )}
                  onClick={() => onSelectClient(client)}
                >
                  {/* ── Gauche : checkbox + nom + email ── */}
                  <div className="flex items-start gap-2 min-w-0">
                    {/* Checkbox */}
                    <div className="shrink-0 mt-0.5">
                      <div
                        className={cn(
                          "w-4 h-4 rounded border border-slate-300 flex items-center justify-center cursor-pointer transition-colors",
                          selectedIds.has(client.id)
                            ? "bg-indigo-600 border-indigo-600"
                            : "hover:border-indigo-400"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSelect(client.id);
                        }}
                      >
                        {selectedIds.has(client.id) && (
                          <Check
                            size={10}
                            className="text-white"
                            weight="bold"
                          />
                        )}
                      </div>
                    </div>

                    {/* Texte : nom + email */}
                    <div className="min-w-0 flex-1">
                      <span className={cn(DS_TITLE, "truncate text-sm block leading-5")}>
                        {client.name}
                      </span>
                      {client.email && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={cn(DS_MONO, "text-slate-500 truncate")}>
                            {client.email}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCopyEmail(client.id, client.email!);
                            }}
                            className="shrink-0 p-0.5 rounded hover:bg-slate-100 transition-colors"
                            title="Copier l'email"
                          >
                            {copiedEmailId === client.id ? (
                              <Check size={10} className="text-emerald-500" />
                            ) : (
                              <EnvelopeSimpleIcon
                                size={10}
                                className="text-slate-400"
                              />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Droite : badge devis + CA + actions ── */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Badge nombre de devis */}
                    <span
                      className={cn(
                        DS_BADGE_NEUTRAL,
                        client.quotes && client.quotes.length > 0
                          ? client.quotes.some((q) => q.status === "PAID")
                            ? DS_BADGE_SUCCESS
                            : client.quotes.some((q) => q.status === "SENT")
                            ? DS_BADGE_ACTIVE
                            : DS_BADGE_NEUTRAL
                          : DS_BADGE_NEUTRAL
                      )}
                    >
                      {client.quotes ? client.quotes.length : 0}
                    </span>
                    {/* CA total */}
                    <span className={cn(DS_MONO, "text-slate-900 font-bold")}>
                      {formatCompact(totalPaid(client.quotes || []))}
                    </span>
                    {/* Actions dropdown */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetOpenDropdownId(
                            openDropdownId === client.id ? null : client.id
                          );
                        }}
                        className="p-1 rounded hover:bg-slate-100 transition-colors"
                      >
                        <DotsThreeVertical
                          size={12}
                          className="text-slate-400"
                        />
                      </button>
                      {openDropdownId === client.id && (
                        <div
                          className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              onEditClient(client);
                              onSetOpenDropdownId(null);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-slate-700 hover:bg-slate-50 w-full text-left"
                          >
                            <PencilSimple size={12} /> Modifier
                          </button>
                          <button
                            onClick={() => {
                              onDeleteClient(client);
                              onSetOpenDropdownId(null);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-red-600 hover:bg-red-50 w-full text-left"
                          >
                            <Trash size={12} /> Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <TablePagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              onPageChange={onPageChange}
              mode="server"
              isLoading={isLoading}
              pageSize={limit}
            />
          </>
        ) : (
          /* ═══ EMPTY & LOADING STATES ═══ */
          <>
            {/* 3.4 — Loading state */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border-t border-slate-200">
                <SpinnerGap
                  size={24}
                  className="text-slate-300 animate-spin"
                  weight="bold"
                />
                <span className={cn(DS_MONO, "text-slate-400")}>
                  Chargement...
                </span>
              </div>
            )}

            {/* 3.2 — Search empty state */}
            {!isLoading && searchQuery && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border-t border-slate-200">
                <MagnifyingGlass
                  size={48}
                  className="text-slate-200"
                  weight="duotone"
                />
                <span className={cn(DS_MONO, "text-slate-400")}>
                  Aucun client ne correspond à votre recherche
                </span>
                <button
                  onClick={() => {
                    onSearchChange("");
                    onSetActiveFilter("all");
                    onPageChange(1);
                  }}
                  className={BTN_SECONDARY}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            {/* 3.3 — Filter empty state */}
            {!isLoading && !searchQuery && activeFilter !== "all" && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border-t border-slate-200">
                <Funnel size={48} className="text-slate-200" weight="duotone" />
                <span className={cn(DS_MONO, "text-slate-400")}>
                  {activeFilter === "relance"
                    ? "Aucun client à relancer"
                    : "Aucun client inactif"}
                </span>
                <button
                  onClick={() => {
                    onSetActiveFilter("all");
                    onPageChange(1);
                  }}
                  className={BTN_SECONDARY}
                >
                  Voir tous les clients
                </button>
              </div>
            )}

            {/* 3.1 — Truly empty state (no clients at all) */}
            {!isLoading && !searchQuery && activeFilter === "all" && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border-t border-slate-200">
                <UserCircle
                  size={48}
                  className="text-slate-200"
                  weight="duotone"
                />
                <span className={cn(DS_MONO, "text-slate-400")}>
                  Aucun client trouvé
                </span>
                <span className={cn(DS_MONO, "text-slate-300")}>
                  Ajoutez votre premier client pour commencer
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}