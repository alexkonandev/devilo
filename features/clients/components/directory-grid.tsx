"use client";

import React from "react";
import { ClientListItem } from "@/types/client";
import { cn } from "@/lib/utils";
import { DS_MONO } from "@/lib/design-system";
import { ContactCard } from "./contact-card";
import { DirectoryEmptyState } from "./directory-empty-state";
import { ClientPagination } from "./client-pagination";

// ═══════════════════════════════════════════════════════════════
// CLIENT DIRECTORY GRID — Grille de fiches contacts
// Modes : grille (responsive 4→3→2→1) ou liste compacte
// ═══════════════════════════════════════════════════════════════

interface ClientDirectoryGridProps {
  /** Liste des clients à afficher (déjà filtrée) */
  clients: ClientListItem[];
  /** Mode d'affichage */
  viewMode: "grid" | "list";
  /** Client sélectionné (pour highlight) */
  selectedClientId: string | null;
  /** ID du client dont l'email vient d'être copié */
  copiedEmailId: string | null;
  /** État vide global (aucun client) */
  isTotallyEmpty: boolean;
  /** État vide lié à la recherche */
  isSearchEmpty: boolean;
  /** Pagination */
  page?: number;
  totalPages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  /** Callback de sélection d'un client */
  onSelect: (client: ClientListItem) => void;
  /** Callback d'édition */
  onEdit: (client: ClientListItem) => void;
  /** Callback de suppression */
  onDelete: (client: ClientListItem) => void;
  /** Callback de copie d'email */
  onCopyEmail: (clientId: string, email: string) => void;
  /** Callback de réinitialisation des filtres */
  onResetFilters: () => void;
}

export function ClientDirectoryGrid({
  clients,
  viewMode,
  selectedClientId,
  copiedEmailId,
  isTotallyEmpty,
  isSearchEmpty,
  page,
  totalPages,
  total,
  onPageChange,
  onSelect,
  onEdit,
  onDelete,
  onCopyEmail,
  onResetFilters,
}: ClientDirectoryGridProps) {
  // ─── EMPTY STATES ──────────────────────────────────────────
  if (isTotallyEmpty) {
    return <DirectoryEmptyState variant="empty" />;
  }

  if (isSearchEmpty) {
    return (
      <DirectoryEmptyState
        variant="search"
        onReset={onResetFilters}
      />
    );
  }

  const showPagination = !!(page && totalPages && total && onPageChange);

  // ─── MODE GRILLE (responsive 4→3→2→1) ────────────────────
  if (viewMode === "grid") {
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {clients.map((client) => (
            <ContactCard
              key={client.id}
              client={client}
              isSelected={selectedClientId === client.id}
              copiedEmailId={copiedEmailId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onCopyEmail={onCopyEmail}
            />
          ))}
        </div>
        {showPagination && (
          <ClientPagination
            page={page!}
            totalPages={totalPages!}
            total={total!}
            onPageChange={onPageChange!}
          />
        )}
      </>
    );
  }

  // ─── MODE LISTE COMPACTE ──────────────────────────────────
  return (
    <>
      <div className="flex flex-col gap-1">
        {clients.map((client) => {
          const initials = client.name
            .split(" ")
            .map((n) => n.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <div
              key={client.id}
              onClick={() => onSelect(client)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all",
                "hover:bg-white hover:border-stone-200 border border-transparent",
              selectedClientId === client.id
                ? "bg-teal-50 dark:bg-teal-900/50 border-teal-200 dark:border-teal-700"
                : "bg-white/50 dark:bg-stone-800/50"
            )}
          >
            {/* Avatar / Initiales */}
            <div className="w-8 h-8 rounded-md bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-[10px] font-bold text-stone-600 dark:text-stone-400 shrink-0">
                {initials}
              </div>

              {/* Infos principales */}
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <span className={cn(DS_MONO, "font-semibold text-stone-800 dark:text-stone-200 truncate")}>
                  {client.name}
                </span>
                {client.email && (
                  <span className={cn(DS_MONO, "text-[10px] text-stone-400 hidden sm:inline truncate")}>
                    {client.email}
                  </span>
                )}
              </div>

              {/* Métadonnées */}
              <div className="flex items-center gap-3 shrink-0">
                {client.phone && (
                  <span className={cn(DS_MONO, "text-[9px] text-stone-400 hidden md:inline")}>
                    {client.phone}
                  </span>
                )}
                <span className="text-[9px] font-mono text-stone-300 tabular-nums">
                  {client.quotes?.length ?? 0} devis
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {showPagination && (
        <ClientPagination
          page={page!}
          totalPages={totalPages!}
          total={total!}
          onPageChange={onPageChange!}
        />
      )}
    </>
  );
}