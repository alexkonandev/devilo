"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ClientListItem } from "@/types/client";
import {
  getClientsPaginated,
  deleteClient,
  deleteManyClients,
} from "@/actions/client-action";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClientEditForm } from "./components/client-edit-form";
import { ImportCSVModal } from "./components/import-csv-modal";
import ClientTable from "./components/client-table";
import ClientDetailPanel from "./components/client-detail-panel";
import ClientCreationSheet from "./components/client-creation-sheet";
import { PageHeader } from "@/components/shared/layout/page-header";
import { SearchBar } from "@/components/shared/ui/search-bar";
import { PlusIcon, Upload } from "@phosphor-icons/react";
import { BTN_PRIMARY, BTN_SECONDARY } from "@/components/shared/ui/constants";

// ─── Utils ────────────────────────────────────────────────────────────────────

const daysSince = (date: Date | string | null | undefined): number | null => {
  if (!date) return null;
  const d = new Date(date);
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
};

const formatCompact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
};

// ─── MAIN VIEW ────────────────────────────────────────────────────────────────

export default function SpatialClientsView({
  initialData,
}: {
  initialData?: ClientListItem[];
}) {
  // ─── STATE MANAGEMENT ──────────────────────────────────────────────────────
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const [clients, setClients] = useState<ClientListItem[]>(initialData || []);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "relance" | "inactif">("all");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [viewingClient, setViewingClient] = useState<ClientListItem | null>(null);
  const [editingClient, setEditingClient] = useState<ClientListItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  // ─── AlertDialog state ────────────────────────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogTarget, setDeleteDialogTarget] = useState<{
    type: "single" | "many";
    client?: ClientListItem;
    count: number;
  } | null>(null);

  // ─── DATA FETCHING ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const result = await getClientsPaginated(page, limit, searchQuery);
        setClients(result.clients);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (_err) {
        console.error("[FETCH_CLIENTS_ERROR]:", _err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, [page, limit, searchQuery]);

  // ─── HANDLERS (useCallback pour perf) ──────────────────────────────────────
  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setPage(1);
  }, []);

  const handleToggleSelect = useCallback((clientId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) newSet.delete(clientId);
      else newSet.add(clientId);
      return newSet;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleSelectClient = useCallback((client: ClientListItem) => {
    setSelectedClientId(client.id);
    setViewingClient(client);
  }, []);

  const handleEditClient = useCallback((client: ClientListItem) => {
    setEditingClient(client);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingClient(null);
  }, []);

  const handleSaveSuccess = useCallback(() => {
    handleCloseEdit();
    const refetch = async () => {
      const result = await getClientsPaginated(page, limit, searchQuery);
      setClients(result.clients);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    };
    refetch();
  }, [handleCloseEdit, page, limit, searchQuery]);

  // ─── Delete handlers ──────────────────────────────────────────────────────

  /** Ouvre l'AlertDialog pour suppression unitaire */
  const handleDeleteClient = useCallback((client: ClientListItem) => {
    setDeleteDialogTarget({ type: "single", client, count: 1 });
    setDeleteDialogOpen(true);
  }, []);

  /** Ouvre l'AlertDialog pour suppression groupée */
  const handleOpenDeleteMany = useCallback(() => {
    const count = selectedIds.size;
    if (count === 0) return;
    setDeleteDialogTarget({ type: "many", count });
    setDeleteDialogOpen(true);
  }, [selectedIds]);

  /** Exécute la suppression confirmée */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteDialogTarget) return;
    setDeleteDialogOpen(false);

    try {
      setIsLoading(true);

      if (deleteDialogTarget.type === "single" && deleteDialogTarget.client) {
        await deleteClient(deleteDialogTarget.client.id);
      } else if (deleteDialogTarget.type === "many") {
        const res = await deleteManyClients(Array.from(selectedIds));
        if (res.success) {
          setSelectedIds(new Set());
        }
      }

      // Refetch après suppression
      const result = await getClientsPaginated(page, limit, searchQuery);
      setClients(result.clients);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      console.error("[DELETE_ERROR]");
    } finally {
      setIsLoading(false);
      setDeleteDialogTarget(null);
    }
  }, [deleteDialogTarget, selectedIds, page, limit, searchQuery]);

  const copyEmail = useCallback((clientId: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(clientId);
    setTimeout(() => setCopiedEmailId(null), 1500);
  }, []);

  // ─── DERIVED DATA ──────────────────────────────────────────────────────────
  const clientsSansDevis = useMemo(
    () =>
      clients.filter(
        (c) =>
          !c.quotes ||
          c.quotes.length === 0 ||
          c.quotes.every((q) => q.status === "DRAFT" || q.status === "REJECTED"),
      ),
    [clients],
  );

  const derniersAjouts = useMemo(
    () =>
      [...clients]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [clients],
  );

  const inactiveCount = useMemo(
    () =>
      clients.filter((c) => {
        const lastContact =
          c.quotes && c.quotes.length > 0
            ? new Date(c.quotes[c.quotes.length - 1].createdAt)
            : new Date(c.createdAt);
        const d = daysSince(lastContact);
        return d !== null && d > 90;
      }).length,
    [clients],
  );

  // Critical alert: concentration CA > 30%
  const hasConcentrationAlert = useMemo(() => {
    const topClient = [...clients].sort((a, b) => {
      const revenueA = (a.quotes || [])
        .filter((q) => q.status === "PAID")
        .reduce((s, q) => s + q.totalAmount, 0);
      const revenueB = (b.quotes || [])
        .filter((q) => q.status === "PAID")
        .reduce((s, q) => s + q.totalAmount, 0);
      return revenueB - revenueA;
    })[0];
    if (!topClient) return false;
    const topRevenue = (topClient.quotes || [])
      .filter((q) => q.status === "PAID")
      .reduce((s, q) => s + q.totalAmount, 0);
    const totalRevenue = clients.reduce(
      (sum, c) =>
        sum +
        (c.quotes || [])
          .filter((q) => q.status === "PAID")
          .reduce((s, q) => s + q.totalAmount, 0),
      0,
    );
    return totalRevenue > 0 && topRevenue / totalRevenue > 0.3;
  }, [clients]);

  const selectedClient = useMemo(
    () => (viewingClient ? viewingClient : clients.find((c) => c.id === selectedClientId) || null),
    [viewingClient, selectedClientId, clients],
  );

  // Filtrage + tri : clients "À relancer" en haut
  const filteredAndSortedClients = useMemo(() => {
    let result = [...clients];

    // Filtre
    if (activeFilter === "relance") {
      result = result.filter(
        (c) =>
          !c.quotes ||
          c.quotes.length === 0 ||
          c.quotes.every((q) => q.status === "DRAFT" || q.status === "REJECTED"),
      );
    } else if (activeFilter === "inactif") {
      result = result.filter((c) => {
        const lastContact = c.quotes && c.quotes.length > 0
          ? new Date(c.quotes[c.quotes.length - 1].createdAt)
          : new Date(c.createdAt);
        const d = daysSince(lastContact);
        return d !== null && d > 90;
      });
    }

    // Tri : relances en haut
    result.sort((a, b) => {
      const aNeedsRelance =
        !a.quotes || a.quotes.length === 0 ||
        a.quotes.every((q) => q.status === "DRAFT" || q.status === "REJECTED");
      const bNeedsRelance =
        !b.quotes || b.quotes.length === 0 ||
        b.quotes.every((q) => q.status === "DRAFT" || q.status === "REJECTED");
      if (aNeedsRelance && !bNeedsRelance) return -1;
      if (!aNeedsRelance && bNeedsRelance) return 1;
      return 0;
    });

    return result;
  }, [clients, activeFilter]);

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full py-6">
      {/* ── Contenu principal avec header intégré dans la pile Bento ── */}
      <div className="flex-1 overflow-hidden bg-slate-50">
        <div className="flex flex-col gap-6 h-full">
          {/* Header — PageHeader générique */}
          <div className="shrink-0 px-6">
            <PageHeader
              title="Clients"
              description={`${total} client${total > 1 ? "s" : ""}`}
              actions={
                <>
                  {/* Barre de recherche (composant partagé avec Devis) */}
                  <SearchBar
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Rechercher..."
                    isLoading={isLoading}
                  />

                  {/* Bouton Importer */}
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className={BTN_SECONDARY}
                  >
                    <Upload size={12} weight="bold" />
                    Importer
                  </button>

                  {/* Bouton Nouveau Client */}
                  <button
                    onClick={() => setIsSheetOpen(true)}
                    className={BTN_PRIMARY}
                  >
                    <PlusIcon size={12} weight="bold" />
                    Nouveau Client
                  </button>
                </>
              }
            />
          </div>

          {/* Flex layout horizontal : table + panel détail */}
          <div className="flex-1 flex overflow-hidden px-6 gap-6">
            {/* Colonne gauche : Table */}
            <div className="w-1/3 min-w-[350px] max-w-[500px] shrink-0 bg-white border border-slate-200 rounded-md overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200">
              <ClientTable
                clients={filteredAndSortedClients}
                selectedIds={selectedIds}
                selectedClientId={selectedClientId}
                openDropdownId={openDropdownId}
                copiedEmailId={copiedEmailId}
                activeFilter={activeFilter}
                clientsSansDevis={clientsSansDevis}
                inactiveCount={inactiveCount}
                hasConcentrationAlert={hasConcentrationAlert}
                derniersAjouts={derniersAjouts}
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                isLoading={isLoading}
                onToggleSelect={handleToggleSelect}
                onSelectClient={handleSelectClient}
                onEditClient={handleEditClient}
                onDeleteClient={handleDeleteClient}
                onDeleteMany={handleOpenDeleteMany}
                onClearSelection={handleClearSelection}
                onCopyEmail={copyEmail}
                onSetOpenDropdownId={setOpenDropdownId}
                onSetActiveFilter={setActiveFilter}
                onPageChange={setPage}
              />
            </div>

              {/* Colonne droite : Panel détail */}
              <div className="flex-1 overflow-y-auto">
                <ClientDetailPanel
                  client={selectedClient}
                  onEditClient={handleEditClient}
                  onUpdate={async () => {
                    const result = await getClientsPaginated(page, limit, searchQuery);
                    setClients(result.clients);
                    setTotal(result.total);
                    setTotalPages(result.totalPages);
                    // Mettre à jour viewingClient avec les données fraîches
                    // pour que selectedClient reflète immédiatement les changements
                    const updated = result.clients.find((c) => c.id === selectedClientId);
                    if (updated) {
                      setViewingClient(updated);
                    }
                  }}
                />
              </div>
          </div>
        </div>
      </div>

      {/* SHEET CRÉATION CLIENT */}
      <ClientCreationSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSuccess={handleSaveSuccess}
      />

      {/* MODALS */}
      {isEditModalOpen && editingClient && (
        <ClientEditForm
          client={editingClient}
          onClose={handleCloseEdit}
          onSuccess={handleSaveSuccess}
        />
      )}

      <ImportCSVModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleSaveSuccess}
      />

      {/* AlertDialog de confirmation suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialogTarget?.type === "single"
                ? `Supprimer "${deleteDialogTarget?.client?.name}" ?`
                : `Supprimer ${deleteDialogTarget?.count} client${(deleteDialogTarget?.count ?? 0) > 1 ? "s" : ""} ?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialogTarget?.type === "single"
                ? "Ce client et toutes ses données associées seront définitivement supprimés. Cette action est irréversible."
                : `Les ${deleteDialogTarget?.count} client${(deleteDialogTarget?.count ?? 0) > 1 ? "s" : ""} sélectionné${(deleteDialogTarget?.count ?? 0) > 1 ? "s" : ""} et toutes leurs données associées seront définitivement supprimés. Cette action est irréversible.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}