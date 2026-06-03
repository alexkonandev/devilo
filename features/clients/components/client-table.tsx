"use client";

import React, { useState } from "react";
import { ClientListItem } from "@/types/client";
import { cn } from "@/lib/utils";
import {
  Check,
  DotsThreeVertical,
  EnvelopeSimpleIcon,
  Trash,
  PencilSimple,
} from "@phosphor-icons/react";
import { ClientPagination } from "./client-pagination";
import {
  DS_MICRO,
  DS_LABEL,
} from "@/lib/design-system";

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
}: ClientTableProps) {
  return (
    <div className="w-full">
      <div className="border-0 rounded-md">
        {/* Header interne avec filtres rapides + compteurs */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className={cn(DS_LABEL, "text-[9px]")}>CLIENTS</span>
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
                    "px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wide transition-colors relative",
                    activeFilter === f.key
                      ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                      : "text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200"
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
            <span className={cn(DS_MICRO, "text-[8px]")}>RÉCENTS</span>
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
            <span className="text-[11px] font-medium text-indigo-700">
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
                      <Check size={10} className="text-white" weight="bold" />
                    )}
                  </div>
                </div>

                {/* Texte : nom + email */}
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-slate-900 truncate text-sm block leading-5">
                    {client.name}
                  </span>
                  {client.email && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-slate-500 font-mono truncate">
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
                    "px-1.5 py-0.5 text-[9px] font-bold rounded-sm border",
                    client.quotes && client.quotes.length > 0
                      ? client.quotes.some((q) => q.status === "PAID")
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : client.quotes.some((q) => q.status === "SENT")
                          ? "bg-blue-50 text-blue-600 border-blue-200"
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      : "bg-slate-50 text-slate-400 border-slate-200"
                  )}
                >
                  {client.quotes ? client.quotes.length : 0}
                </span>
                {/* CA total */}
                <span className="text-[11px] font-medium tabular-nums text-slate-900">
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
                    <DotsThreeVertical size={12} className="text-slate-400" />
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
        <ClientPagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={onPageChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}