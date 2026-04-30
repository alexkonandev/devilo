"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CatalogService } from "@/types/catalog";
import { createServiceAction } from "@/actions/catalog-action";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  StorefrontIcon,
  CubeIcon,
  CurrencyCircleDollarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PackageIcon,
  TagIcon,
} from "@phosphor-icons/react";

import { useCatalog } from "./components/catalog-context";
import { SpatialServiceEditor } from "./components/spatial-service-editor";

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM - Source de Vérité (Dashboard/Quotes)
// ═══════════════════════════════════════════════════════════════════════════════

const DS = {
  micro: "text-[9px] uppercase font-bold tracking-tighter",
  mono: "font-mono text-[11px] tabular-nums leading-none",
  label: "text-[9px] uppercase font-bold tracking-wider text-slate-400",
  card: "bg-white border border-slate-200/60",
};

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const formatCompact = (amount: number): string => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`;
  return amount.toString();
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT - Grid CSS Strict (3 Zones)
// ═══════════════════════════════════════════════════════════════════════════════
// Zone 1: Telemetry (KPIs)
// Zone 2: Inventory Stage [Filters 260px | Main-Grid 1fr]
// ═══════════════════════════════════════════════════════════════════════════════

type CatalogTab = "INVENTORY" | "MARKETPLACE";
type CategoryFilter =
  | "ALL"
  | "GENERAL"
  | "TECHNIC"
  | "CONSULTING"
  | "SUBSCRIPTION";

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
    isLoading,
  } = useCatalog();

  const [activeTab, setActiveTab] = useState<CatalogTab>("INVENTORY");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");

  // ─── Derived: active service for editor ───
  const activeService = useMemo(
    () => userServices.find((s) => s.id === selectedServiceId),
    [userServices, selectedServiceId],
  );

  // ─── Filtered services ───
  const filteredServices = useMemo(() => {
    const source = activeTab === "INVENTORY" ? userServices : platformServices;
    return source.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "ALL" || s.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [userServices, platformServices, activeTab, searchQuery, categoryFilter]);

  // ─── KPI Stats ───
  const kpiStats = useMemo(() => {
    const services =
      activeTab === "INVENTORY" ? userServices : platformServices;
    const totalValue = services.reduce((sum, s) => sum + (s.unitPrice || 0), 0);
    return {
      totalServices: services.length,
      totalValue,
      activeCount: services.length, // All services are considered active
    };
  }, [userServices, platformServices, activeTab]);

  // ─── Create new service ───
  const handleAddNew = async () => {
    try {
      const newService = await createServiceAction({
        title: "NOUVEAU SERVICE",
        unitPrice: 0,
        baseCost: 0,
        category: "GENERAL",
      });
      if (newService.success && newService.data) {
        addService(newService.data);
        selectService(newService.data.id);
        toast.success("Service créé");
      }
    } catch {
      toast.error("Erreur création");
    }
  };

  // ─── Import from marketplace ───
  const handleImport = async (serviceId: string) => {
    await importService(serviceId);
    toast.success("Module importé");
    setActiveTab("INVENTORY");
  };

  return (
    // ═══════════════════════════════════════════════════════════════════════════
    // GRID GLOBAL - 2 Lignes Strictes
    // grid-rows-[auto_1fr] : [Telemetry] [Inventory Stage]
    // ═══════════════════════════════════════════════════════════════════════════
    <div className="h-full grid grid-rows-[auto_1fr] overflow-hidden bg-slate-50">
      {/* ═══ ZONE 1: TÉLÉMÉTRIE (KPIs) - Hauteur auto ═══ */}
      <TelemetryHUD
        stats={kpiStats}
        activeTab={activeTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreate={handleAddNew}
      />

      {/* ═══ ZONE 2: INVENTORY STAGE - 1fr ═══ */}
      <div className="grid grid-cols-[260px_1fr] overflow-hidden">
        {/* ─── Colonne Gauche: Filtres/Catégories (260px) ─── */}
        <FilterSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          userServiceCount={userServices.length}
          platformServiceCount={platformServices.length}
        />

        {/* ─── Colonne Droite: Main-Grid (1fr) ─── */}
        <MainGrid
          services={filteredServices}
          selectedServiceId={selectedServiceId}
          onSelect={selectService}
          onDelete={deleteLocalService}
          onImport={handleImport}
          isLoading={isLoading}
          activeTab={activeTab}
        />
      </div>

      {/* ─── EDITOR DRAWER ─── */}
      <AnimatePresence mode="wait">
        {activeService && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => selectService(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 w-full md:w-[480px] z-50 shadow-2xl"
            >
              <SpatialServiceEditor
                service={activeService}
                onClose={() => selectService(null)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ZONE 1: TELEMETRY HUD (3 KPIs + Search + Create Button)
// ═══════════════════════════════════════════════════════════════════════════════

interface TelemetryHUDProps {
  stats: { totalServices: number; totalValue: number; activeCount: number };
  activeTab: CatalogTab;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onCreate: () => void;
}

function TelemetryHUD({
  stats,
  activeTab,
  searchQuery,
  setSearchQuery,
  onCreate,
}: TelemetryHUDProps) {
  const hudItems = [
    {
      icon: PackageIcon,
      label: "Total Services",
      value: String(stats.totalServices),
      subtext: activeTab === "INVENTORY" ? "Mon inventaire" : "Disponibles",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      icon: CurrencyCircleDollarIcon,
      label: "Valeur Stock",
      value: formatCompact(stats.totalValue),
      subtext: "XOF cumulés",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: CheckCircleIcon,
      label: "Services Actifs",
      value: String(stats.activeCount),
      subtext: "En production",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 border-b border-slate-200/60 bg-white shrink-0">
      {/* KPIs - 3 colonnes */}
      <div className="grid grid-cols-3 gap-3">
        {hudItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 p-2 rounded border border-slate-200/60 bg-slate-50/50"
          >
            <div
              className={cn(
                "w-7 h-7 rounded flex items-center justify-center shrink-0",
                item.bg,
              )}
            >
              <item.icon size={14} className={item.color} weight="bold" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-[13px] font-bold tabular-nums truncate",
                    item.color,
                  )}
                >
                  {item.value}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className={cn(DS.micro, "text-slate-500")}>
                  {item.label}
                </span>
                <span className="text-[8px] text-slate-300">·</span>
                <span className="text-[9px] text-slate-400 truncate">
                  {item.subtext}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Create */}
      <div className="flex items-center gap-2">
        <div className="relative w-56">
          <MagnifyingGlassIcon
            size={12}
            weight="bold"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full h-7 pl-8 pr-3 bg-slate-100 border border-slate-200/60 hover:border-slate-300 focus:border-indigo-400/60 focus:bg-white rounded text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all"
          />
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[9px] font-bold uppercase tracking-wider transition-colors"
        >
          <PlusIcon size={12} weight="bold" />
          Créer
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ZONE 2A: FILTER SIDEBAR (260px) - Navigation verticale
// ═══════════════════════════════════════════════════════════════════════════════

interface FilterSidebarProps {
  activeTab: CatalogTab;
  setActiveTab: (tab: CatalogTab) => void;
  categoryFilter: CategoryFilter;
  setCategoryFilter: (c: CategoryFilter) => void;
  userServiceCount: number;
  platformServiceCount: number;
}

function FilterSidebar({
  activeTab,
  setActiveTab,
  categoryFilter,
  setCategoryFilter,
  userServiceCount,
  platformServiceCount,
}: FilterSidebarProps) {
  const categories: { key: CategoryFilter; label: string; count?: number }[] = [
    { key: "ALL", label: "Tous les services" },
    { key: "GENERAL", label: "Général" },
    { key: "TECHNIC", label: "Technique" },
    { key: "CONSULTING", label: "Conseil" },
    { key: "SUBSCRIPTION", label: "Abonnement" },
  ];

  return (
    <div className="flex flex-col bg-white border-r border-slate-200/60 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-slate-200/60 bg-slate-50/30">
        <div className="flex items-center gap-1.5">
          <TagIcon size={13} className="text-indigo-500" weight="bold" />
          <span className={cn(DS.micro, "text-slate-600")}>CATALOGUE</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="p-2 border-b border-slate-200/60">
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-md">
          <button
            onClick={() => setActiveTab("INVENTORY")}
            className={cn(
              "flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[9px] font-bold uppercase transition-all",
              activeTab === "INVENTORY"
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            <CubeIcon
              size={12}
              weight={activeTab === "INVENTORY" ? "bold" : "regular"}
            />
            <span>Mes</span>
            <span
              className={cn(
                DS.mono,
                "text-[10px] bg-slate-200/50 px-1 rounded",
              )}
            >
              {userServiceCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("MARKETPLACE")}
            className={cn(
              "flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[9px] font-bold uppercase transition-all",
              activeTab === "MARKETPLACE"
                ? "bg-white text-amber-600 shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            <StorefrontIcon
              size={12}
              weight={activeTab === "MARKETPLACE" ? "bold" : "regular"}
            />
            <span>Plateforme</span>
            <span
              className={cn(
                DS.mono,
                "text-[10px] bg-slate-200/50 px-1 rounded",
              )}
            >
              {platformServiceCount}
            </span>
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className={cn(DS.label, "px-2 py-1.5 mb-1")}>Catégories</div>
        <div className="space-y-0.5">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={cn(
                "w-full flex items-center justify-between px-2 py-1.5 rounded text-left text-xs transition-all",
                categoryFilter === cat.key
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <span>{cat.label}</span>
              {cat.count !== undefined && (
                <span className={cn(DS.mono, "text-[10px] text-slate-400")}>
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ZONE 2B: MAIN GRID (1fr) - Grille de cartes Bento
// ═══════════════════════════════════════════════════════════════════════════════

interface MainGridProps {
  services: CatalogService[];
  selectedServiceId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => Promise<void>;
  onImport: (id: string) => Promise<void>;
  isLoading: boolean;
  activeTab: CatalogTab;
}

function MainGrid({
  services,
  selectedServiceId,
  onSelect,
  onDelete,
  onImport,
  isLoading,
  activeTab,
}: MainGridProps) {
  if (services.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center mx-auto mb-3">
            <PackageIcon size={24} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">
            Aucun service trouvé
          </p>
          <p className="text-xs text-slate-400">
            {activeTab === "INVENTORY"
              ? "Créez votre premier service"
              : "Aucun service disponible"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <AnimatePresence mode="popLayout">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{
                duration: 0.15,
                delay: index * 0.02,
                ease: EASE_OUT_EXPO,
              }}
            >
              {activeTab === "INVENTORY" ? (
                <BentoServiceCard
                  service={service}
                  isSelected={selectedServiceId === service.id}
                  onClick={() => onSelect(service.id)}
                  onDelete={(e) => {
                    e.stopPropagation();
                    if (confirm("Supprimer ce service ?")) onDelete(service.id);
                  }}
                />
              ) : (
                <BentoPlatformCard
                  service={service}
                  onImport={() => onImport(service.id)}
                  isImporting={isLoading}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BENTO SERVICE CARD - Unité de données compacte
// ═══════════════════════════════════════════════════════════════════════════════

interface BentoServiceCardProps {
  service: CatalogService;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function BentoServiceCard({
  service,
  isSelected,
  onClick,
  onDelete,
}: BentoServiceCardProps) {
  const categoryColors: Record<string, { bg: string; text: string }> = {
    GENERAL: { bg: "bg-slate-100", text: "text-slate-600" },
    TECHNIC: { bg: "bg-blue-50", text: "text-blue-600" },
    CONSULTING: { bg: "bg-purple-50", text: "text-purple-600" },
    SUBSCRIPTION: { bg: "bg-emerald-50", text: "text-emerald-600" },
  };

  const catStyle = categoryColors[service.category] || categoryColors.GENERAL;

  return (
    <div
      onClick={onClick}
      className={cn(
        DS.card,
        "rounded-lg p-3 cursor-pointer transition-all hover:border-slate-300",
        isSelected && "border-indigo-400/60 bg-indigo-50/30",
      )}
    >
      {/* Header: Badge + Status */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
            catStyle.bg,
            catStyle.text,
          )}
        >
          {service.category}
        </span>
        <div className="flex items-center gap-1">
          {isSelected && (
            <CheckCircleIcon
              size={12}
              className="text-indigo-500"
              weight="bold"
            />
          )}
        </div>
      </div>

      {/* Body: Title + Description */}
      <h3 className="font-bold text-sm text-slate-900 mb-1 line-clamp-1 leading-tight">
        {service.title}
      </h3>
      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
        {service.subtitle || "Aucune description"}
      </p>

      {/* Footer: Price + Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-baseline gap-0.5">
          <span className={cn(DS.mono, "text-base font-bold text-slate-900")}>
            {formatCompact(service.unitPrice || 0)}
          </span>
          <span className={cn(DS.mono, "text-[9px] text-slate-400")}>XOF</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={cn(DS.mono, "text-[9px] text-slate-400")}>
            #{service.id.slice(0, 4)}
          </span>
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors"
          >
            <span className="sr-only">Supprimer</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path
                d="M2.5 2.5L7.5 7.5M7.5 2.5L2.5 7.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BENTO PLATFORM CARD - Pour Marketplace
// ═══════════════════════════════════════════════════════════════════════════════

interface BentoPlatformCardProps {
  service: CatalogService;
  onImport: () => void;
  isImporting: boolean;
}

function BentoPlatformCard({
  service,
  onImport,
  isImporting,
}: BentoPlatformCardProps) {
  const categoryColors: Record<string, { bg: string; text: string }> = {
    GENERAL: { bg: "bg-slate-100", text: "text-slate-600" },
    TECHNIC: { bg: "bg-blue-50", text: "text-blue-600" },
    CONSULTING: { bg: "bg-purple-50", text: "text-purple-600" },
    SUBSCRIPTION: { bg: "bg-emerald-50", text: "text-emerald-600" },
  };

  const catStyle = categoryColors[service.category] || categoryColors.GENERAL;

  return (
    <div
      className={cn(
        DS.card,
        "rounded-lg p-3 transition-all hover:border-amber-300",
      )}
    >
      {/* Header: Badge + Icon */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
            catStyle.bg,
            catStyle.text,
          )}
        >
          {service.category}
        </span>
        <StorefrontIcon size={12} className="text-amber-500" />
      </div>

      {/* Body: Title + Description */}
      <h3 className="font-bold text-sm text-slate-900 mb-1 line-clamp-1 leading-tight">
        {service.title}
      </h3>
      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
        {service.subtitle || "Service disponible sur la plateforme"}
      </p>

      {/* Footer: Price + Import */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-baseline gap-0.5">
          <span className={cn(DS.mono, "text-base font-bold text-slate-900")}>
            {formatCompact(service.unitPrice || 0)}
          </span>
          <span className={cn(DS.mono, "text-[9px] text-slate-400")}>XOF</span>
        </div>
        <button
          onClick={onImport}
          disabled={isImporting}
          className="flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60 rounded text-[9px] font-bold uppercase transition-all disabled:opacity-50"
        >
          {isImporting ? (
            <span className="w-3 h-3 border border-amber-300 border-t-amber-600 rounded-full animate-spin" />
          ) : (
            <>
              <ArrowRightIcon size={10} weight="bold" />
              Importer
            </>
          )}
        </button>
      </div>
    </div>
  );
}
