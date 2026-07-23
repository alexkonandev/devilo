"use client";

import React, { useMemo } from "react";
import { ClientListItem } from "@/types/client";
import { cn } from "@/lib/utils";
import { DS_MONO, STUDIO_V2_BTN_PRIMARY, STUDIO_V2_BTN, STUDIO_V2_CARD } from "@/lib/design-system";
import { SearchBar } from "@/components/shared/ui/search-bar";
import { PlusIcon, Upload, DownloadSimple, AddressBook } from "@phosphor-icons/react";
import { useSearchParams, useRouter } from "next/navigation";

import { useClients } from "./hooks/use-clients";
import { ClientDirectoryGrid } from "./components/directory-grid";
import { ClientProfileView } from "./components/client-profile-view";
import { ClientFiltersDropdown } from "./components/client-filters-dropdown";
import { DirectoryEmptyState } from "./components/directory-empty-state";
import { ImportCSVModal } from "./components/import-csv-modal";
import { exportClientsAction } from "@/actions/client-export-action";
import ClientCreationSheet from "./components/client-creation-sheet";
import { DeleteClientDialog } from "./components/delete-client-dialog";

export default function SpatialClientsView({
  initialData,
}: {
  initialData?: ClientListItem[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeFilter, setActiveFilter] = React.useState(
    searchParams.get("filter") || "all"
  );

  // Synchroniser l'URL quand le filtre change
  const handleFilterChange = React.useCallback(
    (filter: string) => {
      setActiveFilter(filter);
      const sp = new URLSearchParams(searchParams.toString());
      if (filter === "all" || !filter) {
        sp.delete("filter");
      } else {
        sp.set("filter", filter);
      }
      const newUrl = sp.toString()
        ? `${window.location.pathname}?${sp.toString()}`
        : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    },
    [router, searchParams]
  );

  const {
    clients,
    page,
    total,
    totalPages,
    isLoading,
    searchQuery,
    viewMode,
    setViewMode,
    creationSheetOpen,
    setCreationSheetOpen,
    importModalOpen,
    setImportModalOpen,
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

  // Seuil d'inactivité (90 jours) — calculé une fois, pas dans useMemo
  const inactivityCutoff = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d;
  }, []);

  const filteredClients = useMemo(() => {
    // Appliquer le filtre de recherche
    let result = clients;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q)
      );
    }

    // Appliquer le filtre actif (depuis ClientFiltersDropdown)
    if (activeFilter === "relance") {
      // Clients ayant des devis en brouillon
      result = result.filter((c) =>
        c.quotes?.some((q) => q.status === "DRAFT")
      );
    } else if (activeFilter === "inactif") {
      // Clients sans devis depuis plus de 90 jours
      result = result.filter((c) => {
        if (!c.quotes || c.quotes.length === 0) return true;
        const latestQuote = c.quotes.reduce((latest, q) =>
          new Date(q.createdAt) > new Date(latest.createdAt) ? q : latest
        );
        return new Date(latestQuote.createdAt) < inactivityCutoff;
      });
    }

    return result;
  }, [clients, searchQuery, activeFilter, inactivityCutoff]);

  const isSearchEmpty = !!(searchQuery && filteredClients.length === 0 && !isTotallyEmpty);
  const isFilterEmpty = activeFilter !== "all" && filteredClients.length === 0 && !isTotallyEmpty && !searchQuery;

  const selectedClient = useMemo(
    () =>
      viewingClient
        ? viewingClient
        : clients.find((c) => c.id === selectedClientId) || null,
    [viewingClient, selectedClientId, clients]
  );

  // Pleine page empty state pour les nouveaux utilisateurs (aucun client du tout)
  if (isTotallyEmpty) {
    return (
      <div className="flex flex-col h-full w-full bg-slate-50">
        <div className="flex-1 flex items-center justify-center">
          <DirectoryEmptyState variant="empty" onAddClient={() => setCreationSheetOpen(true)} />
        </div>
        <ClientCreationSheet open={creationSheetOpen} onOpenChange={setCreationSheetOpen} onSuccess={handleSaveSuccess} />
        <ImportCSVModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} onSuccess={handleSaveSuccess} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      {/* === HEADER V2 === */}
      <header className="flex items-center h-12 px-3 border-b border-slate-200 bg-white shrink-0 gap-2">
        <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
          <AddressBook size={12} className="text-indigo-600" weight="bold" />
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-800 tracking-tight">
          Répertoire
        </span>
        <span className="text-[8px] font-mono text-slate-400">
          {total} contact{total > 1 ? "s" : ""}
        </span>
        <div className="flex-1" />
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Rechercher un contact…"
          isLoading={isLoading}
        />
        <ClientFiltersDropdown
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          searchQuery={searchQuery}
          onResetSearch={() => setSearchQuery("")}
        />
        <button
          onClick={() => setImportModalOpen(true)}
          className={STUDIO_V2_BTN}
          title="Importer"
        >
          <Upload size={12} weight="bold" />
        </button>
        <button
          onClick={async () => {
            const result = await exportClientsAction();
            if (result.success && result.csv) {
              const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `clients_${new Date().toISOString().slice(0, 10)}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          }}
          className={STUDIO_V2_BTN}
          title="Exporter"
        >
          <DownloadSimple size={12} weight="bold" />
        </button>
        <button onClick={() => setCreationSheetOpen(true)} className={STUDIO_V2_BTN_PRIMARY}>
          <PlusIcon size={12} weight="bold" />
        </button>
      </header>

      {/* === LAYOUT === */}
      <div className="flex w-full flex-1 min-h-0 px-4 pb-4 pt-3 overflow-hidden gap-4">
        <div className={cn(
          "flex flex-col min-w-0 transition-all duration-300",
          selectedClientId ? "flex-4" : "flex-1"
        )}>
          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className={cn(STUDIO_V2_CARD, "mb-2 px-3 py-2 flex items-center justify-between")}>
              <span className={cn(DS_MONO, "text-[10px] text-slate-700 font-semibold")}>
                {selectedIds.size} contact{selectedIds.size > 1 ? "s" : ""} sélectionné{selectedIds.size > 1 ? "s" : ""}
              </span>
              <button
                onClick={handleOpenDeleteMany}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-mono font-bold uppercase tracking-wider",
                  "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all"
                )}
              >
                Supprimer
              </button>
            </div>
          )}

          {/* Grille */}
          <div className="flex-1 overflow-y-auto">
            <ClientDirectoryGrid
              clients={filteredClients}
              viewMode={viewMode}
              detailOpen={!!selectedClientId}
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
              onAddClient={() => setCreationSheetOpen(true)}
            />
          </div>
        </div>

        {/* Détail panel */}
        {selectedClient && (
          <aside
            key={selectedClient.id}
            className={cn(
              STUDIO_V2_CARD,
              "flex-[3] min-w-0 overflow-y-auto",
              "animate-in slide-in-from-right duration-300 ease-out"
            )}
          >
            <ClientProfileView
              client={selectedClient}
              onClose={handleCloseProfile}
              onEdit={handleEditClient}
              onUpdate={handleSaveSuccess}
              onDelete={handleDeleteClient}
            />
          </aside>
        )}
      </div>

      {/* Modals */}
      <ClientCreationSheet open={creationSheetOpen} onOpenChange={setCreationSheetOpen} onSuccess={handleSaveSuccess} />
      <ImportCSVModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} onSuccess={handleSaveSuccess} />
      <DeleteClientDialog
        open={deleteDialogOpen}
        target={deleteDialogTarget}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}