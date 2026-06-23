"use client";

import { useState, useCallback, useEffect } from "react";
import { ClientListItem } from "@/types/client";
import {
  getClientsPaginated,
  deleteClient,
  deleteManyClients,
} from "@/actions/client-action";

export function useClients(initialData?: ClientListItem[]) {
  const [clients, setClients] = useState<ClientListItem[]>(initialData || []);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewingClient, setViewingClient] = useState<ClientListItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogTarget, setDeleteDialogTarget] = useState<{
    type: "single" | "many";
    client?: ClientListItem;
    count: number;
  } | null>(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getClientsPaginated({ page, limit, search: searchQuery });
      setClients(result.clients);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (_err) {
      console.error("[FETCH_CLIENTS_ERROR]:", _err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setPage(1);
  }, []);

  const handleSelectClient = useCallback((client: ClientListItem) => {
    setSelectedClientId(client.id);
    setViewingClient(client);
  }, []);

  const handleEditClient = useCallback((client: ClientListItem) => {
    setSelectedClientId(client.id);
    setViewingClient(client);
  }, []);

  const handleSaveSuccess = useCallback(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDeleteClient = useCallback((client: ClientListItem) => {
    setDeleteDialogTarget({ type: "single", client, count: 1 });
    setDeleteDialogOpen(true);
  }, []);

  const handleOpenDeleteMany = useCallback(() => {
    if (selectedIds.size === 0) return;
    setDeleteDialogTarget({ type: "many", count: selectedIds.size });
    setDeleteDialogOpen(true);
  }, [selectedIds]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteDialogTarget) return;
    setDeleteDialogOpen(false);
    setIsLoading(true);
    try {
      if (deleteDialogTarget.type === "single" && deleteDialogTarget.client) {
        await deleteClient(deleteDialogTarget.client.id);
      } else if (deleteDialogTarget.type === "many") {
        const res = await deleteManyClients(Array.from(selectedIds));
        if (res.success) setSelectedIds(new Set());
      }
      await fetchClients();
    } catch {
      console.error("[DELETE_ERROR]");
    } finally {
      setIsLoading(false);
      setDeleteDialogTarget(null);
    }
  }, [deleteDialogTarget, selectedIds, fetchClients]);

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

  const handleCloseProfile = useCallback(() => {
    setSelectedClientId(null);
    setViewingClient(null);
  }, []);

  return {
    clients,
    page,
    limit,
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
    handleToggleSelect,
    handleClearSelection,
    handleSelectClient,
    handleEditClient,
    handleSaveSuccess,
    handleDeleteClient,
    handleOpenDeleteMany,
    handleConfirmDelete,
    handleCloseProfile,
    setDeleteDialogOpen,
    handleDeleteMany: handleOpenDeleteMany,
  };
}