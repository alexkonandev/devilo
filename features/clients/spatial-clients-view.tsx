"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ClientListItem } from "@/types/client";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { ClientRowInline } from "./components/client-row-inline";
import { ClientPagination } from "./components/client-pagination";
import { ClientEditForm } from "./components/client-edit-form";
import { ClientInspector } from "./components/client-inspector";
import { getClientsPaginated, deleteClient } from "@/actions/client-action";
import { toast } from "sonner";
import {
  FileTextIcon,
  TrendUpIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  EnvelopeSimpleIcon,
  SparkleIcon,
  PlusIcon,
  CurrencyCircleDollar as CurrencyCircleDollarIcon,
} from "@phosphor-icons/react";

import {
  DS_MICRO,
  DS_MONO,
  DS_INPUT,
  DS_BUTTON,
  DS_BENTO_CARD,
  DS_PAGE_SHELL,
  DS_PAGE_GRID,
  DS_ICON_SM,
  DS_ICON_WRAPPER,
} from "@/lib/design-system";

// ─── Utils ────────────────────────────────────────────────────────────────────

const formatCompact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
};

function healthScore(client: ClientListItem): number {
  const quotes = client.quotes || [];
  if (quotes.length === 0) return 50;
  const paid = quotes.filter((q) => q.status === "PAID");
  const conv = paid.length / quotes.length;
  const rev = Math.min(
    100,
    paid.reduce((s, q) => s + q.totalAmount, 0) / 100_000,
  );
  return Math.round(rev * 0.5 + conv * 50);
}

// ─── Vue 1 : Liste registre ───────────────────────────────────────────────────

function ClientListView() {
  // === Pagination State ===
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // === Selection State ===
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // === Detail View State ===
  const [viewingClient, setViewingClient] = useState<ClientListItem | null>(
    null,
  );

  // === Edit Modal State ===
  const [editingClient, setEditingClient] = useState<ClientListItem | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // === Feature 1: Feedback copie email ===
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAllEmails = useCallback(() => {
    const emails = clients
      .map((c) => c.email)
      .filter(Boolean)
      .join(", ");
    if (emails) {
      navigator.clipboard.writeText(emails);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  }, [clients]);

  // === Feature 2: Export CSV clients ===
  const exportClientsToCSV = useCallback(() => {
    if (!clients.length) return;

    const headers = [
      "ID",
      "Nom",
      "Email",
      "Adresse",
      "SIRET_TaxID",
      "CA_Total",
      "Nombre_Devis",
      "Date_Creation",
    ];

    const rows = clients.map((client) => {
      const paidQuotes = (client.quotes || []).filter(
        (q) => q.status === "PAID",
      );
      const revenue = paidQuotes.reduce((s, q) => s + q.totalAmount, 0);

      return [
        client.id,
        client.name,
        client.email || "",
        client.address || "",
        client.taxId || "",
        revenue,
        client.quotes?.length ?? 0,
        new Date(client.createdAt).toISOString().split("T")[0],
      ];
    });

    const csvContent =
      "\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [clients]);

  // === Edit Modal Handlers ===
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
    // Refresh clients list
    const fetchClients = async () => {
      const result = await getClientsPaginated(page, limit, searchQuery);
      setClients(result.clients);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    };
    fetchClients();
  }, [handleCloseEdit, page, limit, searchQuery]);

  // === Selection Handlers ===
  const handleToggleSelect = useCallback((clientId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  }, []);

  // === View Detail Handler ===
  const handleViewClient = useCallback((client: ClientListItem) => {
    setViewingClient(client);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setViewingClient(null);
  }, []);

  // === Delete Handler ===
  const handleDeleteClient = useCallback(
    async (client: ClientListItem) => {
      if (!confirm(`Supprimer le client "${client.name}" ?`)) return;
      try {
        await deleteClient(client.id);
        toast.success("Client supprimé");
        // Refresh list
        const result = await getClientsPaginated(page, limit, searchQuery);
        setClients(result.clients);
        setTotal(result.total);
      } catch {
        toast.error("Erreur lors de la suppression");
      }
    },
    [page, limit, searchQuery],
  );

  // Fetch paginated clients
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

  // Global stats from current page
  const globalStats = useMemo(() => {
    const totalRevenue = clients.reduce(
      (sum, c) =>
        sum +
        (c.quotes
          ?.filter((q) => q.status === "PAID")
          .reduce((s, q) => s + q.totalAmount, 0) ?? 0),
      0,
    );
    const totalQuotes = clients.reduce(
      (sum, c) => sum + (c.quotes?.length ?? 0),
      0,
    );
    const avgHealth = clients.length
      ? Math.round(
          clients.reduce((sum, c) => sum + healthScore(c), 0) / clients.length,
        )
      : 0;
    return { totalRevenue, totalQuotes, avgHealth };
  }, [clients]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setPage(1);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Clients"
        subtitle={`${total} client${total > 1 ? "s" : ""}`}
        actions={
          <a href="/clients/new" className={cn(DS_BUTTON)}>
            <PlusIcon size={DS_ICON_SM} weight="bold" />
            Nouveau client
          </a>
        }
      />

      <div className={DS_PAGE_SHELL}>
        <div className={cn(DS_PAGE_GRID, "p-4")}>
          {/* KPIs */}
          <div
            className={cn(DS_BENTO_CARD, "col-span-3 flex items-center gap-3")}
          >
            <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
              <UsersIcon
                size={DS_ICON_SM}
                className="text-indigo-600"
                weight="bold"
              />
            </div>
            <div>
              <p
                className={cn(
                  DS_MONO,
                  "font-bold text-slate-900 text-lg leading-none",
                )}
              >
                {total}
              </p>
              <p className={cn(DS_MICRO, "text-slate-400 mt-0.5")}>Clients</p>
            </div>
          </div>

          <div
            className={cn(DS_BENTO_CARD, "col-span-3 flex items-center gap-3")}
          >
            <div className={cn(DS_ICON_WRAPPER, "bg-emerald-50")}>
              <CurrencyCircleDollarIcon
                size={DS_ICON_SM}
                className="text-emerald-600"
                weight="bold"
              />
            </div>
            <div>
              <p
                className={cn(
                  DS_MONO,
                  "font-bold text-slate-900 text-lg leading-none",
                )}
              >
                {formatCompact(globalStats.totalRevenue)}
              </p>
              <p className={cn(DS_MICRO, "text-slate-400 mt-0.5")}>
                CA Total XOF
              </p>
            </div>
          </div>

          <div
            className={cn(DS_BENTO_CARD, "col-span-3 flex items-center gap-3")}
          >
            <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
              <TrendUpIcon
                size={DS_ICON_SM}
                className="text-indigo-600"
                weight="bold"
              />
            </div>
            <div>
              <p
                className={cn(
                  DS_MONO,
                  "font-bold text-slate-900 text-lg leading-none",
                )}
              >
                {globalStats.totalQuotes}
              </p>
              <p className={cn(DS_MICRO, "text-slate-400 mt-0.5")}>
                Devis totaux
              </p>
            </div>
          </div>

          <div
            className={cn(DS_BENTO_CARD, "col-span-3 flex items-center gap-3")}
          >
            <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
              <SparkleIcon
                size={DS_ICON_SM}
                className="text-indigo-600"
                weight="bold"
              />
            </div>
            <div>
              <p
                className={cn(
                  DS_MONO,
                  "font-bold text-slate-900 text-lg leading-none",
                )}
              >
                {globalStats.avgHealth}
              </p>
              <p className={cn(DS_MICRO, "text-slate-400 mt-0.5")}>
                Health moy.
              </p>
            </div>
          </div>

          {/* Recherche */}
          <div className="col-span-12">
            <div className="relative">
              <MagnifyingGlassIcon
                size={DS_ICON_SM}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Rechercher un client..."
                className={cn(DS_INPUT, "w-full pl-8")}
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Layout: Liste principale (8 cols) + Features sidebar (4 cols) */}
          <div className="col-span-12 grid grid-cols-12 gap-4">
            {/* Liste clients principale */}
            <div
              className={cn(DS_BENTO_CARD, "col-span-8 p-0 overflow-hidden")}
            >
              <div className="flex items-center h-8 px-3 bg-slate-50 border-b border-slate-200 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                <div className="w-5 mr-2" /> {/* Checkbox */}
                <div className="w-2 mr-2" /> {/* Pastille */}
                <div className="w-5 mr-2" /> {/* Avatar */}
                <div className="w-36 mr-4">Client</div>
                <div className="w-16 mr-4">CA</div>
                <div className="w-12 mr-4">Devis</div>
                <div className="w-12 mr-4">Conv.</div>
                <div className="w-10 mr-4">Health</div>
                <div className="flex-1">Contact</div>
                <div className="w-16" /> {/* Actions */}
              </div>

              {/* Lignes inline */}
              <div className="overflow-y-auto h-[420px]">
                {isLoading && clients.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className={cn(DS_MICRO, "text-slate-400")}>
                      Chargement...
                    </p>
                  </div>
                ) : clients.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className={cn(DS_MICRO, "text-slate-300 italic")}>
                      Aucun client trouvé
                    </p>
                  </div>
                ) : (
                  clients.map((client) => (
                    <ClientRowInline
                      key={client.id}
                      client={client}
                      isSelected={selectedIds.has(client.id)}
                      onSelect={handleViewClient}
                      onEdit={handleEditClient}
                      onDelete={handleDeleteClient}
                      onToggleSelect={handleToggleSelect}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              <ClientPagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={setPage}
                isLoading={isLoading}
              />
            </div>

            {/* Sidebar features */}
            <div className="col-span-4 flex flex-col gap-3">
              {/* Top clients par CA */}
              <div className={cn(DS_BENTO_CARD, "p-3")}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(DS_ICON_WRAPPER, "bg-amber-50 w-6 h-6")}>
                    <TrendUpIcon
                      size={14}
                      className="text-amber-600"
                      weight="bold"
                    />
                  </div>
                  <span className={cn(DS_MICRO, "text-slate-600 font-bold")}>
                    Top CA
                  </span>
                </div>
                <div className="space-y-2">
                  {[...clients]
                    .sort((a, b) => {
                      const revA = (a.quotes || [])
                        .filter((q) => q.status === "PAID")
                        .reduce((s, q) => s + q.totalAmount, 0);
                      const revB = (b.quotes || [])
                        .filter((q) => q.status === "PAID")
                        .reduce((s, q) => s + q.totalAmount, 0);
                      return revB - revA;
                    })
                    .slice(0, 3)
                    .map((client, i) => {
                      const revenue = (client.quotes || [])
                        .filter((q) => q.status === "PAID")
                        .reduce((s, q) => s + q.totalAmount, 0);
                      return (
                        <div
                          key={client.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 w-4">
                              {i + 1}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[100px]">
                              {client.name}
                            </span>
                          </div>
                          <span
                            className={cn(
                              DS_MONO,
                              "text-[11px] font-bold text-amber-600",
                            )}
                          >
                            {formatCompact(revenue)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Clients récents */}
              <div className={cn(DS_BENTO_CARD, "p-3")}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50 w-6 h-6")}>
                    <UsersIcon
                      size={14}
                      className="text-indigo-600"
                      weight="bold"
                    />
                  </div>
                  <span className={cn(DS_MICRO, "text-slate-600 font-bold")}>
                    Récemment ajoutés
                  </span>
                </div>
                <div className="space-y-2">
                  {[...clients]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                    )
                    .slice(0, 3)
                    .map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-indigo-100 border border-indigo-200 flex items-center justify-center text-[8px] font-black text-indigo-600">
                            {client.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-[11px] text-slate-600 truncate max-w-[120px]">
                            {client.name}
                          </span>
                        </div>
                        <span className={cn(DS_MICRO, "text-slate-400")}>
                          {new Date(client.createdAt).toLocaleDateString(
                            "fr-FR",
                            { day: "2-digit", month: "2-digit" },
                          )}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Clients à relancer */}
              <div className={cn(DS_BENTO_CARD, "p-3")}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(DS_ICON_WRAPPER, "bg-rose-50 w-6 h-6")}>
                    <SparkleIcon
                      size={14}
                      className="text-rose-600"
                      weight="bold"
                    />
                  </div>
                  <span className={cn(DS_MICRO, "text-slate-600 font-bold")}>
                    À relancer
                  </span>
                </div>
                <div className="space-y-2">
                  {clients
                    .filter(
                      (c) =>
                        !c.quotes ||
                        c.quotes.length === 0 ||
                        c.quotes.every((q) => q.status === "DRAFT"),
                    )
                    .slice(0, 3)
                    .map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-[11px] text-slate-600 truncate max-w-[140px]">
                          {client.name}
                        </span>
                        <span className={cn(DS_MICRO, "text-rose-500")}>
                          {client.quotes?.length
                            ? `${client.quotes.length} brouillon`
                            : "Aucun devis"}
                        </span>
                      </div>
                    ))}
                  {clients.filter((c) => !c.quotes || c.quotes.length === 0)
                    .length === 0 && (
                    <span className={cn(DS_MICRO, "text-slate-400 italic")}>
                      Tous les clients sont actifs
                    </span>
                  )}
                </div>
              </div>

              {/* Export CSV */}
              <button
                onClick={exportClientsToCSV}
                className={cn(
                  DS_BENTO_CARD,
                  "p-3 flex items-center gap-2 hover:bg-emerald-50 transition-colors cursor-pointer text-left",
                )}
              >
                <div className={cn(DS_ICON_WRAPPER, "bg-emerald-50 w-6 h-6")}>
                  <FileTextIcon
                    size={14}
                    className="text-emerald-600"
                    weight="bold"
                  />
                </div>
                <div>
                  <span
                    className={cn(DS_MICRO, "text-slate-600 font-bold block")}
                  >
                    Exporter CSV
                  </span>
                  <span className={cn(DS_MICRO, "text-slate-400")}>
                    {clients.length} lignes
                  </span>
                </div>
              </button>

              {/* Copier tous les emails */}
              <button
                onClick={handleCopyAllEmails}
                className={cn(
                  DS_BENTO_CARD,
                  "p-3 flex items-center gap-2 hover:bg-indigo-50 transition-colors cursor-pointer text-left relative",
                )}
              >
                <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50 w-6 h-6")}>
                  <EnvelopeSimpleIcon
                    size={14}
                    className={cn(
                      "transition-colors",
                      copiedAll ? "text-emerald-600" : "text-indigo-600",
                    )}
                    weight="bold"
                  />
                </div>
                <div className="flex-1">
                  <span
                    className={cn(
                      DS_MICRO,
                      "font-bold block transition-colors",
                      copiedAll ? "text-emerald-600" : "text-slate-600",
                    )}
                  >
                    {copiedAll ? "Emails copiés !" : "Copier tous les emails"}
                  </span>
                  <span className={cn(DS_MICRO, "text-slate-400")}>
                    {clients.filter((c) => c.email).length} contacts
                  </span>
                </div>
                {copiedAll && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail View */}
      {viewingClient && (
        <div className="fixed top-10 left-16 right-0 bottom-0 z-40 bg-white">
          <ClientInspector
            client={viewingClient}
            onBack={handleCloseDetail}
            onEdit={handleEditClient}
          />
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingClient && (
        <ClientEditForm
          client={{
            id: editingClient.id,
            name: editingClient.name,
            email: editingClient.email,
            taxId: editingClient.taxId,
            address: editingClient.address,
          }}
          onClose={handleCloseEdit}
          onSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────────────

export default function SpatialClientsView() {
  return <ClientListView />;
}
