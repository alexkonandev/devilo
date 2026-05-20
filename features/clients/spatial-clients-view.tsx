"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ClientListItem } from "@/types/client";
import { cn } from "@/lib/utils";
import {
  getClientsPaginated,
  deleteClient,
  deleteManyClients,
} from "@/actions/client-action";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  Upload,
  EnvelopeSimpleIcon,
  DotsThreeVertical,
  Check,
  X,
  ArrowSquareOut,
  PencilSimple,
  Trash,
  ArrowLeft,
  FileText,
  CalendarBlank,
  CurrencyCircleDollar,
  BellRinging,
  Sparkle,
  Lightbulb,
  ClockClockwise,
} from "@phosphor-icons/react";
import { ClientPagination } from "./components/client-pagination";
import { ClientEditForm } from "./components/client-edit-form";
import { ImportCSVModal } from "./components/import-csv-modal";

import {
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_TITLE,
  DS_INPUT,
  DS_BUTTON,
  DS_BUTTON_SECONDARY,
  DS_BENTO_CARD,
  DS_ICON_SM,
  DS_PAGE_SHELL,
  DS_PAGE_PADDING,
  DS_PAGE_GRID,
  DS_PAGE_CONTAINER,
  DS_BADGE_DANGER,
  DS_BADGE_SUCCESS,
  DS_BADGE_WARNING,
  DS_SECTION_TITLE,
  DS_BODY,
  DS_TEL_BLOCK,
} from "@/lib/design-system";

// ─── Utils ────────────────────────────────────────────────────────────────────

const formatCompact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
};

const daysSince = (date: Date | string | null | undefined): number | null => {
  if (!date) return null;
  const d = new Date(date);
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
};

// ─── MAIN VIEW ────────────────────────────────────────────────────────────────

export default function SpatialClientsView({
  initialData,
}: {
  initialData?: ClientListItem[];
}) {
  // ─── STATE MANAGEMENT ──────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
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

  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

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

  const handleViewClient = useCallback((client: ClientListItem) => {
    setViewingClient(client);
    setViewMode("detail");
    setSelectedClientId(client.id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setViewingClient(null);
    setViewMode("list");
    setSelectedClientId(null);
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

  const handleDeleteClient = useCallback(
    async (client: ClientListItem) => {
      if (!confirm(`Supprimer le client "${client.name}" ?`)) return;
      try {
        await deleteClient(client.id);
        const result = await getClientsPaginated(page, limit, searchQuery);
        setClients(result.clients);
        setTotal(result.total);
      } catch {
        console.error("[DELETE_CLIENT_ERROR]");
      }
    },
    [page, limit, searchQuery],
  );

  const handleDeleteMany = useCallback(async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    if (!confirm(`Supprimer définitivement les ${count} client${count > 1 ? "s" : ""} ?`)) return;
    try {
      setIsLoading(true);
      const res = await deleteManyClients(Array.from(selectedIds));
      if (res.success) {
        setSelectedIds(new Set());
        const result = await getClientsPaginated(page, limit, searchQuery);
        setClients(result.clients);
        setTotal(result.total);
      }
    } catch {
      console.error("[DELETE_MANY_CLIENTS_ERROR]");
    } finally {
      setIsLoading(false);
    }
  }, [selectedIds, page, limit, searchQuery]);

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

  // ─── SMART TIPS ────────────────────────────────────────────────────────────
  const smartTips = useMemo(() => {
    const tips: { icon: React.ReactNode; title: string; desc: string; filter: "all" | "relance" | "inactif" }[] = [];

    // Tip 1 : Client avec le plus gros CA
    const topClient = [...clients].sort((a, b) => {
      const revenueA = (a.quotes || []).filter(q => q.status === "PAID").reduce((s, q) => s + q.totalAmount, 0);
      const revenueB = (b.quotes || []).filter(q => q.status === "PAID").reduce((s, q) => s + q.totalAmount, 0);
      return revenueB - revenueA;
    })[0];
    if (topClient) {
      const topRevenue = (topClient.quotes || []).filter(q => q.status === "PAID").reduce((s, q) => s + q.totalAmount, 0);
      const totalRevenue = clients.reduce((sum, c) =>
        sum + (c.quotes || []).filter(q => q.status === "PAID").reduce((s, q) => s + q.totalAmount, 0), 0);
      if (totalRevenue > 0 && topRevenue / totalRevenue > 0.3) {
        tips.push({
                  icon: <Sparkle size={12} className="text-amber-500" weight="bold" />,
          title: "Concentration CA",
          desc: `${topClient.name} représente ${Math.round(topRevenue / totalRevenue * 100)}% de votre CA. Pensez à diversifier.`,
          filter: "all",
        });
      }
    }

    // Tip 2 : Devis en attente depuis +15 jours
    const oldDraftClients = clientsSansDevis.filter(c => {
      const lastContact = c.quotes && c.quotes.length > 0
        ? new Date(c.quotes[c.quotes.length - 1].createdAt)
        : new Date(c.createdAt);
      const days = daysSince(lastContact);
      return days !== null && days > 15;
    });
    if (oldDraftClients.length >= 2) {
      tips.push({
        icon: <Lightbulb size={12} className="text-rose-500" weight="fill" />,
        title: "Relance prioritaire",
        desc: `${oldDraftClients.length} client${oldDraftClients.length > 1 ? "s" : ""} sans devis récent depuis +15 jours. Une relance aujourd'hui augmenterait vos chances.`,
        filter: "relance",
      });
    }

    // Tip 3 : Client inactif depuis longtemps
    const inactiveClients = clients.filter(c => {
      const lastContact = c.quotes && c.quotes.length > 0
        ? new Date(c.quotes[c.quotes.length - 1].createdAt)
        : new Date(c.createdAt);
      const days = daysSince(lastContact);
      return days !== null && days > 90;
    });
    const oldestInactive = inactiveClients.sort((a, b) => {
      const lastA = a.quotes && a.quotes.length > 0 ? new Date(a.quotes[a.quotes.length - 1].createdAt) : new Date(a.createdAt);
      const lastB = b.quotes && b.quotes.length > 0 ? new Date(b.quotes[b.quotes.length - 1].createdAt) : new Date(b.createdAt);
      return new Date(lastA).getTime() - new Date(lastB).getTime();
    })[0];
    if (oldestInactive && inactiveClients.length > 0) {
      const days = daysSince(
        oldestInactive.quotes && oldestInactive.quotes.length > 0
          ? oldestInactive.quotes[oldestInactive.quotes.length - 1].createdAt
          : oldestInactive.createdAt
      );
      tips.push({
        icon: <ClockClockwise size={12} className="text-indigo-500" weight="bold" />,
        title: "Rétention client",
        desc: `${oldestInactive.name} n'a pas eu de nouveau devis depuis ${days} jours. Proposez-lui une mise à jour.`,
        filter: "inactif",
      });
    }

    return tips;
  }, [clients, clientsSansDevis]);

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
        return daysSince(lastContact) !== null && daysSince(lastContact)! > 90;
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
    <div className={DS_PAGE_SHELL}>
      {viewMode === "list" ? (
        <div className={DS_PAGE_PADDING}>
          <div className={DS_PAGE_GRID}>
            {/* ════════════════════════════════════════════════════════════
                HEADER (col-span-12)
               ════════════════════════════════════════════════════════════ */}
            <div className="col-span-12">
              <div className={cn(DS_BENTO_CARD, "p-3 flex items-center justify-between")}>
                <div className="flex items-center gap-4">
                  <span className={cn(DS_TITLE, "text-sm")}>CLIENTS</span>
                  <a href="/clients/new" className={cn(DS_BUTTON, "px-3 py-1.5 text-[9px]")}>
                    <PlusIcon size={10} weight="bold" /> NOUVEAU CLIENT
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative max-w-xs">
                    <MagnifyingGlassIcon size={DS_ICON_SM} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Rechercher..." className={cn(DS_INPUT, "w-48 pl-8 py-1.5 text-[11px]")} />
                    {isLoading && <div className="absolute right-2.5 top-1/2 -translate-y-1/2"><div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}
                  </div>
                  <button onClick={() => setIsImportModalOpen(true)} className={cn(DS_BUTTON_SECONDARY, "px-2.5 py-1.5 text-[9px]")}>
                    <Upload size={10} weight="bold" /> Importer
                  </button>
                </div>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                SMART TIPS — Intelligence Bar (col-span-12)
               ════════════════════════════════════════════════════════════ */}
            {smartTips.length > 0 && (
              <div className="col-span-12">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {smartTips.map((tip, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setActiveFilter(tip.filter); setPage(1); }}
                      className={cn(
                        DS_BENTO_CARD,
                        "p-4 text-left transition-all hover:shadow-sm hover:-translate-y-0.5 cursor-pointer text-left w-full",
                        activeFilter === tip.filter && "ring-1 ring-indigo-400",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(DS_TEL_BLOCK, "w-7 h-7 flex items-center justify-center shrink-0")}>
                          {tip.icon}
                        </div>
                        <div className="min-w-0">
                          <span className={cn(DS_SECTION_TITLE, "block mb-1")}>{tip.title}</span>
                          <p className={cn(DS_BODY, "text-[11px] leading-snug")}>{tip.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════
                TABLE CLIENTS (col-span-12) — Fusionnée avec intelligence
               ════════════════════════════════════════════════════════════ */}
            <div className="col-span-12">
              <div className={cn(DS_BENTO_CARD, "p-0 overflow-hidden")}>
                {/* Header interne avec filtres rapides */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={cn(DS_LABEL, "text-[9px]")}>CLIENTS</span>
                    <div className="flex items-center gap-1 ml-4">
                      {([
                        { key: "all", label: "Tous" },
                        { key: "relance", label: `À relancer (${clientsSansDevis.length})` },
                        { key: "inactif", label: "Inactifs" },
                      ] as const).map((f) => (
                        <button
                          key={f.key}
                          onClick={() => { setActiveFilter(f.key); setPage(1); }}
                          className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wide transition-colors",
                            activeFilter === f.key
                              ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                              : "text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200",
                          )}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={cn(DS_MICRO, "text-[8px]")}>RÉCENTS</span>
                    <div className="flex items-center -space-x-1.5">
                      {derniersAjouts.map((client) => (
                        <div key={client.id} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[6px] font-black text-indigo-600 cursor-pointer hover:z-10 relative transition-transform hover:scale-110"
                          onClick={() => handleViewClient(client)}
                          title={`${client.name} — ${new Date(client.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}`}>
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
                    <button onClick={handleDeleteMany} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-600 text-white rounded text-[10px] font-medium hover:bg-red-700 transition-colors">
                      <Trash size={12} /> Supprimer
                    </button>
                  </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="w-5 px-3 py-1.5 text-left">
                          <button onClick={() => { if (selectedIds.size === filteredAndSortedClients.length) setSelectedIds(new Set()); else setSelectedIds(new Set(filteredAndSortedClients.map((c) => c.id))); }}
                            className={cn("w-3 h-3 rounded border transition-colors flex items-center justify-center", selectedIds.size === filteredAndSortedClients.length && filteredAndSortedClients.length > 0 ? "bg-indigo-600 border-indigo-600" : selectedIds.size > 0 ? "bg-indigo-200 border-indigo-400" : "border-slate-300 hover:border-indigo-400")}>
                            {selectedIds.size === filteredAndSortedClients.length && filteredAndSortedClients.length > 0 && <Check size={8} className="text-white" />}
                            {selectedIds.size > 0 && selectedIds.size < filteredAndSortedClients.length && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-sm" />}
                          </button>
                        </th>
                        <th className={cn(DS_LABEL, "w-5 px-0 py-1.5 text-left")}>#</th>
                        <th className={cn(DS_LABEL, "w-5 px-0 py-1.5 text-left")}><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /></th>
                        <th className={cn(DS_LABEL, "px-0 py-1.5 text-left")}>CLIENT</th>
                        <th className={cn(DS_LABEL, "w-20 px-0 py-1.5 text-right")}>CA</th>
                        <th className={cn(DS_LABEL, "w-12 px-0 py-1.5 text-right")}>DEVIS</th>
                        <th className={cn(DS_LABEL, "w-12 px-0 py-1.5 text-right")}>CONV.</th>
                        <th className={cn(DS_LABEL, "w-24 px-0 py-1.5 text-right")}>DERNIER CONTACT</th>
                        <th className={cn(DS_LABEL, "w-20 px-0 py-1.5 text-center")}>STATUT</th>
                        <th className={cn(DS_LABEL, "w-28 px-0 py-1.5 text-left")}>PROCHAINE ACTION</th>
                        <th className="w-14 px-0 py-1.5 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading && filteredAndSortedClients.length === 0 ? (
                        <tr><td colSpan={11} className="py-16 text-center"><div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className={cn(DS_MICRO, "text-slate-400")}>Chargement...</p></td></tr>
                      ) : filteredAndSortedClients.length === 0 ? (
                        <tr><td colSpan={11} className="py-16 text-center"><p className={cn(DS_MICRO, "text-slate-300 italic")}>Aucun client trouvé</p></td></tr>
                      ) : (
                        filteredAndSortedClients.map((client) => {
                          const quotes = client.quotes || [];
                          const paid = quotes.filter((q) => q.status === "PAID");
                          const revenue = paid.reduce((s, q) => s + q.totalAmount, 0);
                          const quotesCount = quotes.length;
                          const convRate = quotesCount ? Math.round((paid.length / quotesCount) * 100) : 0;
                          const isSelected = selectedIds.has(client.id);
                          const isDropdownOpen = openDropdownId === client.id;

                          // Santé
                          let healthDotClass = "bg-rose-500";
                          if (revenue > 0) healthDotClass = "bg-emerald-500";
                          else if (quotesCount > 0) healthDotClass = "bg-indigo-500";

                          // Dernier contact
                          const lastQuote = quotes.length > 0 ? quotes[quotes.length - 1] : null;
                          const lastContactDate = lastQuote ? new Date(lastQuote.createdAt) : new Date(client.createdAt);
                          const daysSinceLastContact = daysSince(lastContactDate);

                          // Statut relance
                          const needsRelance = !quotes.length || quotes.every((q) => q.status === "DRAFT" || q.status === "REJECTED");
                          const isInactive = daysSinceLastContact !== null && daysSinceLastContact > 90;

                          // Prochaine action
                          let nextAction = "—";
                          let nextActionClass = "text-slate-300";
                          if (needsRelance) {
                            nextAction = "Relancer";
                            nextActionClass = "text-rose-500 font-medium";
                          } else if (isInactive) {
                            nextAction = "Réactiver";
                            nextActionClass = "text-amber-500 font-medium";
                          } else if (paid.length === 0 && quotesCount > 0) {
                            nextAction = "Suivi paiement";
                            nextActionClass = "text-indigo-500 font-medium";
                          }

                          return (
                            <tr key={client.id} className={cn("hover:bg-slate-50 transition-colors cursor-pointer select-none group", isSelected && "bg-indigo-50/50 hover:bg-indigo-100")} onClick={() => handleViewClient(client)}>
                              <td className="w-5 px-3 py-1.5 align-middle">
                                <div className="flex items-center justify-center" onClick={(e) => { e.stopPropagation(); handleToggleSelect(client.id); }}>
                                  <button className={cn("w-3 h-3 rounded border transition-colors flex items-center justify-center", isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300 hover:border-indigo-400")} onClick={(e) => e.stopPropagation()}>
                                    {isSelected && <Check size={8} className="text-white" weight="bold" />}
                                  </button>
                                </div>
                              </td>
                              <td className="w-5 px-0 py-1.5 align-middle text-center"><span className={cn(DS_MONO, "text-[9px] text-slate-300")}>·</span></td>
                              <td className="w-5 px-0 py-1.5 align-middle text-center">
                                {needsRelance ? (
                                  <div className="relative flex items-center justify-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-400 animate-ping opacity-75" />
                                  </div>
                                ) : (
                                  <div className={cn("w-1.5 h-1.5 rounded-full mx-auto", healthDotClass)} />
                                )}
                              </td>
                              <td className="px-0 py-1.5 align-middle">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded bg-indigo-100 border border-indigo-200 flex items-center justify-center text-[6px] font-black text-indigo-600 shrink-0">{client.name.slice(0, 2).toUpperCase()}</div>
                                  <span className="font-mono text-[10px] uppercase tracking-tight text-slate-900 truncate">{client.name}</span>
                                </div>
                              </td>
                              <td className="w-20 px-0 py-1.5 align-middle text-right">
                                <span className={cn(DS_MONO, "text-[10px] font-bold", revenue === 0 ? "text-slate-300" : "text-slate-900")}>{revenue === 0 ? "\u2014" : formatCompact(revenue)}</span>
                              </td>
                              <td className="w-12 px-0 py-1.5 align-middle text-right">
                                <span className={cn(DS_MONO, "text-[9px]", quotesCount === 0 ? "text-slate-300" : "text-slate-700")}>{quotesCount || "\u2014"}</span>
                              </td>
                              <td className="w-12 px-0 py-1.5 align-middle text-right">
                                <span className={cn(DS_MONO, "text-[9px] font-bold", convRate === 0 ? "text-slate-300" : convRate > 50 ? "text-emerald-600" : "text-slate-600")}>{convRate || "\u2014"}%</span>
                              </td>
                              <td className="w-24 px-0 py-1.5 align-middle text-right">
                                <span className={cn(DS_MONO, "text-[9px]", daysSinceLastContact !== null && daysSinceLastContact > 30 ? "text-rose-400" : "text-slate-400")}>
                                  {lastContactDate ? lastContactDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "\u2014"}
                                </span>
                              </td>
                              <td className="w-20 px-0 py-1.5 align-middle text-center">
                                {needsRelance ? (
                                  <span className={cn(DS_BADGE_DANGER, "text-[7px]")}>
                                    <BellRinging size={8} weight="bold" className="inline mr-0.5 -mt-0.5" />
                                    Relance
                                  </span>
                                ) : isInactive ? (
                                  <span className={cn(DS_BADGE_WARNING, "text-[7px]")}>Inactif</span>
                                ) : (
                                  <span className={cn(DS_BADGE_SUCCESS, "text-[7px]")}>OK</span>
                                )}
                              </td>
                              <td className="w-28 px-0 py-1.5 align-middle">
                                <span className={cn(DS_MONO, "text-[9px]", nextActionClass)}>{nextAction}</span>
                              </td>
                              <td className="w-14 px-0 py-1.5 align-middle">
                                <div className="flex items-center justify-end gap-0.5">
                                  {client.email && (
                                    <button onClick={(e) => { e.stopPropagation(); copyEmail(client.id, client.email!); }} className="p-0.5 hover:bg-slate-200 rounded transition-all opacity-0 group-hover:opacity-100" title="Copier l'email">
                                      {copiedEmailId === client.id ? <Check size={9} className="text-emerald-500" weight="bold" /> : <EnvelopeSimpleIcon size={9} className="text-slate-400" />}
                                    </button>
                                  )}
                                  <div className="relative">
                                    <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(isDropdownOpen ? null : client.id); }} className="p-0.5 hover:bg-slate-200 rounded transition-all opacity-0 group-hover:opacity-100">
                                      <DotsThreeVertical size={9} className="text-slate-400" />
                                    </button>
                                    {isDropdownOpen && (
                                      <>
                                        <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                                        <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md border border-slate-200 py-1 z-50 shadow-sm">
                                          <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleViewClient(client); }} className="w-full px-2.5 py-1 text-left text-[9px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"><ArrowSquareOut size={10} className="text-slate-400" /> Fiche</button>
                                          <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleEditClient(client); }} className="w-full px-2.5 py-1 text-left text-[9px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"><PencilSimple size={10} className="text-slate-400" /> Éditer</button>
                                          <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleDeleteClient(client); }} className="w-full px-2.5 py-1 text-left text-[9px] font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"><Trash size={10} className="text-rose-400" /> Suppr.</button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <ClientPagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={setPage} isLoading={isLoading} />
              </div>
            </div>
          </div>

          {/* Barre d'actions flottante (Bulk) */}
          <div className={cn("fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out", selectedIds.size > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none")}>
            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-lg">
              <span className="text-[11px] font-medium text-white">{selectedIds.size} client{selectedIds.size > 1 ? "s" : ""} sélectionné{selectedIds.size > 1 ? "s" : ""}</span>
              <div className="w-px h-4 bg-slate-600" />
              <button onClick={handleDeleteMany} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-medium transition-colors"><Trash size={12} /> Supprimer</button>
              <button onClick={handleClearSelection} className="flex items-center gap-1 px-2 py-1.5 text-slate-400 hover:text-white rounded text-[10px] transition-colors"><X size={12} /> Annuler</button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ═══════════════════════════════════════════════════════════════════
          OVERLAY FICHE CLIENT — Interface Bento structurée (DS compliant)
         ═══════════════════════════════════════════════════════════════════ */}
      {viewMode === "detail" && selectedClient && (
        <div className={cn(DS_PAGE_SHELL, "fixed inset-0 left-16 z-40 min-h-screen")}>
          <div className={cn(DS_PAGE_CONTAINER, DS_PAGE_PADDING, "pt-10 pb-20")}>
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-6">
                <button onClick={handleCloseDetail} className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-slate-900 transition-colors group">
                  <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                  RETOUR
                </button>
                <div className="w-px h-6 bg-slate-200" />
                <h1 className={cn(DS_TITLE, "text-lg")}>{selectedClient.name}</h1>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEditClient(selectedClient)} className={cn(DS_BUTTON_SECONDARY, "px-3 py-1.5 text-[9px]")}>
                  <PencilSimple size={10} weight="bold" /> ÉDITER
                </button>
                <button className={cn(DS_BUTTON, "px-3 py-1.5 text-[9px]")}>
                  <PlusIcon size={10} weight="bold" /> NOUVEAU DEVIS
                </button>
              </div>
            </div>
            <div className={DS_PAGE_GRID}>
              <div className="col-span-12 lg:col-span-8 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className={DS_BENTO_CARD}>
                    <div className="flex items-center gap-2 mb-2">
                      <CurrencyCircleDollar size={14} className="text-emerald-500" />
                      <span className={DS_LABEL}>Total encaissé</span>
                    </div>
                    <span className={cn(DS_MONO, "text-xl font-bold text-slate-900")}>
                      {formatCompact((selectedClient.quotes || []).filter(q => q.status === "PAID").reduce((s, q) => s + q.totalAmount, 0))}
                    </span>
                  </div>
                  <div className={DS_BENTO_CARD}>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={14} className="text-indigo-500" />
                      <span className={DS_LABEL}>Nombre de devis</span>
                    </div>
                    <span className={cn(DS_MONO, "text-xl font-bold text-slate-900")}>{selectedClient.quotes?.length || 0}</span>
                  </div>
                  <div className={DS_BENTO_CARD}>
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarBlank size={14} className="text-amber-500" />
                      <span className={DS_LABEL}>Date de création</span>
                    </div>
                    <span className={cn(DS_MONO, "text-sm font-bold text-slate-900")}>
                      {new Date(selectedClient.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <div className={DS_BENTO_CARD}>
                  <span className={cn(DS_LABEL, "block mb-4")}>DEVIS</span>
                  {(selectedClient.quotes || []).length === 0 ? (
                    <p className={cn(DS_MICRO, "text-slate-300 italic")}>Aucun devis pour ce client</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className={cn(DS_LABEL, "pr-4 py-2 text-left w-16")}>N°</th>
                            <th className={cn(DS_LABEL, "pr-4 py-2 text-left")}>Statut</th>
                            <th className={cn(DS_LABEL, "pr-4 py-2 text-right")}>Date</th>
                            <th className={cn(DS_LABEL, "py-2 text-right w-24")}>Montant</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedClient.quotes!.slice(0, 10).map((quote, idx) => (
                            <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                              <td className="pr-4 py-2.5">
                                <span className={cn(DS_MONO, "text-[10px] text-slate-400")}>{idx + 1}</span>
                              </td>
                              <td className="pr-4 py-2.5">
                                <span className={cn("px-2 py-0.5 rounded text-[8px] font-bold border",
                                  quote.status === "PAID" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                  quote.status === "DRAFT" ? "bg-slate-50 text-slate-500 border-slate-200" :
                                  quote.status === "SENT" ? "bg-blue-50 text-blue-600 border-blue-200" :
                                  "bg-amber-50 text-amber-600 border-amber-200"
                                )}>
                                  {quote.status === "PAID" ? "Payé" : quote.status === "DRAFT" ? "Brouillon" : quote.status === "SENT" ? "Envoyé" : quote.status || "—"}
                                </span>
                              </td>
                              <td className="pr-4 py-2.5 text-right">
                                <span className={cn(DS_MONO, "text-[10px] text-slate-400")}>
                                  {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                </span>
                              </td>
                              <td className="py-2.5 text-right">
                                <span className={cn(DS_MONO, "text-[11px] font-bold", quote.totalAmount === 0 ? "text-slate-300" : "text-slate-900")}>
                                  {quote.totalAmount === 0 ? "\u2014" : formatCompact(quote.totalAmount)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-12 lg:col-span-4">
                <div className={DS_BENTO_CARD}>
                  <span className={cn(DS_LABEL, "block mb-5")}>CONTACT</span>
                  <div className="space-y-4">
                    <div>
                      <span className={cn(DS_LABEL, "block mb-1")}>EMAIL</span>
                      {selectedClient.email ? <span className={cn(DS_MONO, "text-[11px] text-slate-900")}>{selectedClient.email}</span> : <span className="italic text-[10px] text-slate-400">Non renseigné</span>}
                    </div>
                    <div className="border-t border-slate-100" />
                    <div>
                      <span className={cn(DS_LABEL, "block mb-1")}>TÉLÉPHONE</span>
                      {selectedClient.phone ? <span className={cn(DS_MONO, "text-[11px] text-slate-900")}>{selectedClient.phone}</span> : <span className="italic text-[10px] text-slate-400">Non renseigné</span>}
                    </div>
                    <div className="border-t border-slate-100" />
                    <div>
                      <span className={cn(DS_LABEL, "block mb-1")}>ADRESSE</span>
                      {selectedClient.address ? <span className={cn(DS_MONO, "text-[11px] text-slate-900")}>{selectedClient.address}{selectedClient.city ? `, ${selectedClient.city}` : ""}</span> : <span className="italic text-[10px] text-slate-400">Non renseigné</span>}
                    </div>
                    <div className="border-t border-slate-100" />
                    <div>
                      <span className={cn(DS_LABEL, "block mb-1")}>N° TVA</span>
                      {selectedClient.tvaNumber ? <span className={cn(DS_MONO, "text-[11px] text-slate-900")}>{selectedClient.tvaNumber}</span> : <span className="italic text-[10px] text-slate-400">Non renseigné</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}