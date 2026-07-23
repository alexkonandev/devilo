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
// Modes : grille (responsive 5→3→2→1) ou liste compacte
// ═══════════════════════════════════════════════════════════════

interface ClientDirectoryGridProps {
  /** Liste des clients à afficher (déjà filtrée) */
  clients: ClientListItem[];
  /** Mode d'affichage */
  viewMode: "grid" | "list";
  /** Le panneau de détail est ouvert (passe la grille de 5 à 4 colonnes) */
  detailOpen?: boolean;
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
  /** Callback pour ouvrir le formulaire d'ajout client */
  onAddClient?: () => void;
}

export function ClientDirectoryGrid({
  clients,
  viewMode,
  detailOpen = false,
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
  onAddClient,
}: ClientDirectoryGridProps) {
  // ─── EMPTY STATES ──────────────────────────────────────────
  if (isTotallyEmpty) {
    return <DirectoryEmptyState variant="empty" onAddClient={onAddClient} />;
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

  // ─── GRILLE UNIQUEMENT (vue liste supprimée) ─
  return (
    <>
      <div className={cn(
        "grid gap-3",
        "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
        detailOpen ? "xl:grid-cols-2" : "xl:grid-cols-4"
      )}>
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