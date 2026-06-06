"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  PlusIcon,
  PackageIcon,
  MagnifyingGlassIcon,
  FunnelSimple,
  CubeIcon,
  StorefrontIcon,
  PushPinSimple,
  FileCsv,
} from "@phosphor-icons/react";
import {
  createServiceAction,
  deleteServiceAction,
} from "@/actions/catalog-action";
import { notify } from "@/lib/notifications";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/shared/layout/page-header";
import { SearchBar } from "@/components/shared/ui/search-bar";
import { BTN_PRIMARY, BTN_SECONDARY } from "@/components/shared/ui/constants";
import {
  DS_MONO,
  DS_LABEL,
} from "@/lib/design-system";
import { useCatalog } from "./components/catalog-context";
import { paginate } from "@/features/quotes/components/table-pagination";
import { PAGE_SIZE, CATEGORY_LABELS } from "./components/constants";
import { CategoryFilter } from "./components/types";
import { ServiceGrid } from "./components/service-grid";
import { ServiceDetailSidebar } from "./components/service-detail-sidebar";
import { FiltersDropdown } from "./components/filters-dropdown";
import { useKernelStore } from "@/hooks/use-kernel-store";

// ═══════════════════════════════════════════════════════════════════════════════
// CATALOG VIEW — Orchestrateur pur (pattern Business App, comme Quotes)
// Phase 2 : Nouveau layout grille + inline tabs + KPIs réels
// Phase 3 : FiltersDropdown + Export CSV + Injecter dans le header
// ═══════════════════════════════════════════════════════════════════════════════

export function SpatialCatalogView() {
  const {
    userServices,
    platformServices,
    selectService,
    selectedServiceId,
    deleteLocalService,
    addService,
    searchQuery,
    setSearchQuery,
    importService,
    injectIntoActiveQuote,
    isLoading,
  } = useCatalog();

  const activeQuote = useKernelStore((state) => state.activeQuote);
  const hasActiveQuote = !!activeQuote;

  const [activeTab, setActiveTab] = useState<"INVENTORY" | "MARKETPLACE">("INVENTORY");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Reset page quand les filtres changent ───
  useEffect(() => { setCurrentPage(1); }, [searchQuery, categoryFilter, activeTab]);

  // ─── Compute margin for each service ───
  const servicesWithMargin = useMemo(() => {
    const source = activeTab === "INVENTORY" ? userServices : platformServices;
    return source.map((s) => {
      const margin = s.unitPrice > 0 ? ((s.unitPrice - (s.baseCost || 0)) / s.unitPrice) * 100 : 0;
      return { ...s, margin, revenue: (s.unitPrice * 12) };
    });
  }, [userServices, platformServices, activeTab]);

  // ─── Filtered services ───
  const filteredServices = useMemo(() =>
    servicesWithMargin.filter((s) => {
      const matchesSearch = !searchQuery
        || s.title.toLowerCase().includes(searchQuery.toLowerCase())
        || s.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "ALL" || s.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }), [servicesWithMargin, searchQuery, categoryFilter]);

  // ─── KPIs ───
  const averagePrice = useMemo(() => {
    if (filteredServices.length === 0) return 0;
    return filteredServices.reduce((sum, s) => sum + s.unitPrice, 0) / filteredServices.length;
  }, [filteredServices]);

  const totalPrice = useMemo(() => {
    return filteredServices.reduce((sum, s) => sum + s.unitPrice, 0);
  }, [filteredServices]);

  // ─── États vides ───
  const isEmptyState = activeTab === "INVENTORY" && userServices.length === 0;
  const isSearchEmpty = !!searchQuery && filteredServices.length === 0 && userServices.length > 0;
  const isFilterEmpty = categoryFilter !== "ALL" && filteredServices.length === 0 && !searchQuery;

  // ─── Selected service (compatible avec ServiceDetailItem) ───
  const activeService = useMemo(() => {
    const s = filteredServices.find((s) => s.id === selectedServiceId);
    if (!s) return undefined;
    return {
      id: s.id,
      title: s.title,
      subtitle: s.subtitle ?? null,
      category: s.category,
      unitPrice: s.unitPrice,
      baseCost: s.baseCost ?? null,
      margin: s.margin,
    };
  }, [filteredServices, selectedServiceId]);

  // ─── Pagination ───
  const totalPages = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE));
  const paginatedServices = paginate(filteredServices, currentPage, PAGE_SIZE);

  // ─── Service sélectionné pour injection rapide ───
  const selectedServiceForInject = useMemo(() => {
    if (!selectedServiceId) return null;
    return filteredServices.find((s) => s.id === selectedServiceId) ?? null;
  }, [filteredServices, selectedServiceId]);

  // ─── Handlers ───
  const handleAddNew = async () => {
    try {
      const newService = await createServiceAction({ title: "NOUVEAU SERVICE", unitPrice: 0, baseCost: 0, category: "GENERAL" });
      if (newService.success && newService.data) {
        addService(newService.data);
        selectService(newService.data.id);
        notify.success("SERVICE_CREATED", "Service créé");
      }
    } catch { notify.error("CREATION_ERROR", "Erreur création"); }
  };

  const handleImport = async (serviceId: string) => {
    await importService(serviceId);
    notify.success("MODULE_IMPORTED", "Module importé");
    setActiveTab("INVENTORY");
  };

  const handleDelete = (id: string) => setServiceToDelete(id);

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteServiceAction(serviceToDelete);
      await deleteLocalService(serviceToDelete);
      notify.success("SERVICE_DELETED", "Service supprimé");
    } catch { notify.error("DELETE_ERROR", "Erreur suppression"); }
    finally { setServiceToDelete(null); }
  };

  // ─── Export CSV (Phase 3.2) ───
  const handleExportCSV = useCallback(() => {
    const headers = ["Titre", "Description", "Catégorie", "Prix unitaire", "Coût de base", "Marge (%)"];
    const rows = filteredServices.map((s) => [
      s.title,
      s.subtitle || "",
      CATEGORY_LABELS[s.category] || s.category,
      s.unitPrice.toString(),
      (s.baseCost || 0).toString(),
      Math.round(s.margin).toString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const escaped = cell.replace(/"/g, '""');
            return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `catalogue-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    notify.success("EXPORT_OK", `Export CSV : ${filteredServices.length} services`);
  }, [filteredServices]);

  // ─── KPI description (Phase 2.5) ───
  const kpiSlot = (
    <span className="inline-flex items-center gap-3">
      <span className={cn(DS_MONO, "text-slate-500")}>
        {filteredServices.length} service{filteredServices.length > 1 ? "s" : ""}
        {activeTab === "INVENTORY" ? "" : " (plateforme)"}
      </span>
      {filteredServices.length > 0 && (
        <>
          <span className="w-px h-3 bg-slate-200" />
          <span className={cn(DS_MONO, "text-slate-500")}>
            Moy. {Math.round(averagePrice).toLocaleString()} XOF
          </span>
        </>
      )}
      {filteredServices.length > 0 && activeTab === "INVENTORY" && (
        <>
          <span className="w-px h-3 bg-slate-200" />
          <span className={cn(DS_MONO, "text-indigo-600 font-semibold")}>
            Total {Math.round(totalPrice).toLocaleString()} XOF
          </span>
        </>
      )}
    </span>
  );

  // ─── Actions slot (Phase 3.2 : SearchBar + FiltersDropdown + Export + Inject + New) ───
  const actionsSlot = (
    <>
      <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher un service…" width="w-56" />
      <FiltersDropdown categoryFilter={categoryFilter} onCategoryChange={setCategoryFilter} />
      {filteredServices.length > 0 && (
        <button onClick={handleExportCSV} className={BTN_SECONDARY} title="Exporter en CSV">
          <FileCsv size={12} weight="duotone" />
          CSV
        </button>
      )}
      {selectedServiceForInject && hasActiveQuote && (
        <button
          onClick={() => injectIntoActiveQuote(selectedServiceForInject)}
          className={BTN_SECONDARY}
          title="Injecter le service sélectionné dans le devis actif"
        >
          <PushPinSimple size={12} weight="bold" />
          Injecter
        </button>
      )}
      <button onClick={handleAddNew} className={BTN_PRIMARY}>
        <PlusIcon size={12} weight="bold" /> Nouveau service
      </button>
    </>
  );

  // ─── Source Tabs inline (Phase 2.4) ───
  const sourceTabs = (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={() => setActiveTab("INVENTORY")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wide transition-all",
          activeTab === "INVENTORY"
            ? "bg-slate-900 text-white"
            : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700",
        )}
      >
        <CubeIcon size={12} weight={activeTab === "INVENTORY" ? "fill" : "regular"} />
        Mes services
        <span className={cn(
          "ml-1 px-1 py-0.5 rounded text-[9px]",
          activeTab === "INVENTORY"
            ? "bg-slate-700 text-slate-200"
            : "bg-slate-100 text-slate-500",
        )}>
          {userServices.length}
        </span>
      </button>
      <button
        onClick={() => setActiveTab("MARKETPLACE")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wide transition-all",
          activeTab === "MARKETPLACE"
            ? "bg-slate-900 text-white"
            : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700",
        )}
      >
        <StorefrontIcon size={12} weight={activeTab === "MARKETPLACE" ? "fill" : "regular"} />
        Plateforme
        <span className={cn(
          "ml-1 px-1 py-0.5 rounded text-[9px]",
          activeTab === "MARKETPLACE"
            ? "bg-slate-700 text-slate-200"
            : "bg-slate-100 text-slate-500",
        )}>
          {platformServices.length}
        </span>
      </button>
    </div>
  );

  // ─── Empty state content ───
  const emptyContent = (
    <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-slate-200 rounded-md">
      {isEmptyState ? (
        <>
          <PackageIcon size={48} className="text-slate-200" weight="duotone" />
          <p className={cn(DS_MONO, "text-slate-400")}>Aucun service dans votre inventaire</p>
          <p className={cn(DS_LABEL, "text-slate-400")}>Créez votre premier service ou importez-le depuis la plateforme</p>
          <button onClick={handleAddNew} className={BTN_PRIMARY}><PlusIcon size={12} weight="bold" /> Créer un service</button>
        </>
      ) : isSearchEmpty ? (
        <>
          <MagnifyingGlassIcon size={48} className="text-slate-200" />
          <p className={cn(DS_MONO, "text-slate-400")}>Aucun service ne correspond à votre recherche</p>
          <button onClick={() => { setSearchQuery(""); setCategoryFilter("ALL"); }} className={BTN_SECONDARY}>Réinitialiser les filtres</button>
        </>
      ) : (
        <>
          <FunnelSimple size={48} className="text-slate-200" />
          <p className={cn(DS_MONO, "text-slate-400")}>Aucun service dans la catégorie {CATEGORY_LABELS[categoryFilter]}</p>
          <button onClick={() => setCategoryFilter("ALL")} className={BTN_SECONDARY}>Voir tous les services</button>
        </>
      )}
    </div>
  );

  // ─── Pagination UI ───
  const pagination = filteredServices.length > PAGE_SIZE && (
    <div className="shrink-0 px-4 pb-1">
      <div className="flex items-center justify-between mt-1">
        <span className={cn(DS_MONO, "text-[10px] text-slate-400")}>
          {filteredServices.length} services · Page {currentPage}/{totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}
            className={cn("w-7 h-7 flex items-center justify-center rounded text-[10px] font-semibold transition-all",
              currentPage <= 1 ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:bg-slate-100")}>
            ←
          </button>
          <span className={cn(DS_MONO, "text-[10px] text-slate-500 px-1")}>{currentPage}/{totalPages}</span>
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
            className={cn("w-7 h-7 flex items-center justify-center rounded text-[10px] font-semibold transition-all",
              currentPage >= totalPages ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:bg-slate-100")}>
            →
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col h-full w-full bg-slate-50">
        <div className="shrink-0 px-6 pt-6">
          <PageHeader title="Catalogue" description={kpiSlot} actions={actionsSlot} />
        </div>
        <div className="flex w-full flex-1 min-h-0 px-6 pb-6 pt-4 overflow-hidden gap-6">
          <div className="flex-[4] min-w-0 flex flex-col overflow-hidden">
            {/* Source Tabs */}
            <div className="shrink-0">
              {sourceTabs}
            </div>

            {/* Main content area */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {isEmptyState || isFilterEmpty || isSearchEmpty ? emptyContent
                : (
                  <ServiceGrid
                    services={paginatedServices}
                    selectedId={selectedServiceId}
                    onSelect={selectService}
                    onInject={injectIntoActiveQuote}
                    onDelete={handleDelete}
                  />
                )}
            </div>

            {/* Pagination */}
            {pagination}
          </div>

          {/* Detail sidebar */}
          {activeService && (
            <aside className="flex-[6] flex flex-col min-h-0 overflow-hidden">
              <ServiceDetailSidebar service={activeService} onClose={() => selectService(null)}
                onDelete={() => activeService && handleDelete(activeService.id)} />
            </aside>
          )}
        </div>
      </div>
      <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setServiceToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-rose-600 hover:bg-rose-700">
              Confirmer la suppression
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}