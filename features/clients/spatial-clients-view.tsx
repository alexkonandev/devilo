"use client";

import React, { useMemo } from "react";
import { ClientListItem } from "@/types/client";
import { cn } from "@/lib/utils";
import { DS_MONO } from "@/lib/design-system";
import { BTN_PRIMARY, BTN_SECONDARY } from "@/components/shared/ui/constants";
import { PageHeader } from "@/components/shared/layout/page-header";
import { SearchBar } from "@/components/shared/ui/search-bar";
import { PlusIcon, Upload } from "@phosphor-icons/react";

import { useClients } from "./hooks/use-clients";
import { ClientDirectoryGrid } from "./components/directory-grid";
import { ClientProfileView } from "./components/client-profile-view";
import { ViewToggle } from "./components/view-toggle";
import { ImportCSVModal } from "./components/import-csv-modal";
import ClientCreationSheet from "./components/client-creation-sheet";
import { DeleteClientDialog } from "./components/delete-client-dialog";

export default function SpatialClientsView({
  initialData,
}: {
  initialData?: ClientListItem[];
}) {
  const {
    clients,
    page,
    total,
    totalPages,
    isLoading,
    searchQuery,
    selectedClientId,
    selectedIds,
    viewingClient,
    deleteDialogOpen,
    deleteDialogTarget,
    setPage,
    setSearchQuery,
    handleSearch,
    handleSelectClient,
    handleEditClient,
    handleSaveSuccess,
    handleDeleteClient,
    handleOpenDeleteMany,
    handleConfirmDelete,
    handleCloseProfile,
    setDeleteDialogOpen,
  } = useClients(initialData);

  const isTotallyEmpty = clients.length === 0;

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  const isSearchEmpty = !!(searchQuery && filteredClients.length === 0 && !isTotallyEmpty);

  const selectedClient = useMemo(
    () =>
      viewingClient
        ? viewingClient
        : clients.find((c) => c.id === selectedClientId) || null,
    [viewingClient, selectedClientId, clients]
  );

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      {/* HEADER */}
      <div className="shrink-0 px-6 pt-6">
        <PageHeader
          title="Répertoire"
          description={`${total} contact${total > 1 ? "s" : ""}`}
          actions={
            <>
              <SearchBar
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Rechercher un contact…"
                isLoading={isLoading}
              />
              <ViewToggle viewMode="grid" onChange={() => {}} />
              <button onClick={() => {}} className={BTN_SECONDARY}>
                <Upload size={12} weight="bold" /> Importer
              </button>
              <button onClick={() => {}} className={BTN_PRIMARY}>
                <PlusIcon size={12} weight="bold" /> Nouveau contact
              </button>
            </>
          }
        />
      </div>

      {/* LAYOUT */}
      <div className="flex w-full flex-1 min-h-0 px-6 pb-6 pt-4 overflow-hidden gap-6">
        <div className={cn(
          "flex flex-col min-w-0 transition-all duration-300",
          selectedClientId ? "flex-[6]" : "flex-1"
        )}>
          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="mb-3 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between">
              <span className={cn(DS_MONO, "text-[10px] text-amber-700 font-semibold")}>
                {selectedIds.size} contact{selectedIds.size > 1 ? "s" : ""} sélectionné{selectedIds.size > 1 ? "s" : ""}
              </span>
              <button
                onClick={handleOpenDeleteMany}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 text-[8px] font-mono font-bold uppercase tracking-wider"
              >
                <Upload size={10} /> Supprimer
              </button>
            </div>
          )}

          {/* Grille */}
          <div className="flex-1 overflow-y-auto">
            <ClientDirectoryGrid
              clients={filteredClients}
              viewMode="grid"
              selectedClientId={selectedClientId}
              copiedEmailId={null}
              isTotallyEmpty={isTotallyEmpty}
              isSearchEmpty={isSearchEmpty}
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={setPage}
              onSelect={handleSelectClient}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
              onCopyEmail={() => {}}
              onResetFilters={() => {
                setSearchQuery("");
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Détail panel */}
        {selectedClient && (
          <aside className="flex-[5] min-w-0 overflow-y-auto bg-white border border-slate-200 rounded-md">
            <ClientProfileView
              client={selectedClient}
              onClose={handleCloseProfile}
              onUpdate={handleSaveSuccess}
            />
          </aside>
        )}
      </div>

      {/* Modals */}
      <ClientCreationSheet open={false} onOpenChange={() => {}} onSuccess={handleSaveSuccess} />
      <ImportCSVModal isOpen={false} onClose={() => {}} onSuccess={handleSaveSuccess} />
      <DeleteClientDialog
        open={deleteDialogOpen}
        target={deleteDialogTarget}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}