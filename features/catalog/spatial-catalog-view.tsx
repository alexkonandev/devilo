"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CatalogService } from "@/types/catalog";
import {
  createServiceAction,
  deleteServiceAction,
} from "@/actions/catalog-action";
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
  StarIcon,
  DiamondIcon,
  CowIcon,
  SkullIcon,
  PencilIcon,
  TrashIcon,
  XIcon,
  TrendUpIcon,
  TrendDownIcon,
  ChartPieIcon,
} from "@phosphor-icons/react";

import { useCatalog } from "./components/catalog-context";

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM TOKENS - Source de Vérité
// ═══════════════════════════════════════════════════════════════════════════════

import {
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_CARD,
  DS_INPUT,
  DS_BUTTON,
  DS_BENTO_CARD,
  DS_SECTION_HEADER,
  DS_ICON_WRAPPER,
  DS_ICON_SM,
  DS_ICON_XS,
  DS_BADGE_ACTIVE,
  DS_BADGE_SUCCESS,
  DS_BADGE_WARNING,
  DS_BADGE_DANGER,
  DS_TEL_BLOCK,
  DS_PROGRESS_TRACK,
  DS_PROGRESS_BAR,
  DS_GAP_GRID,
  DS_GAP_ITEMS,
  DS_PAGE_SHELL,
  DS_PAGE_GRID,
} from "@/lib/design-system";
import { SearchBar } from "@/components/shared/ui/search-bar";
import { BTN_PRIMARY, BTN_SECONDARY } from "@/components/shared/ui/constants";

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const formatCompact = (amount: number): string => {
  if (amount >= 1_000_000)
    return `${(amount / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}K`;
  return amount.toString();
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// ═══════════════════════════════════════════════════════════════════════════════
// QUADRANT TYPES - Product Portfolio Matrix
// ═══════════════════════════════════════════════════════════════════════════════

type QuadrantType = "STARS" | "DIAMONDS" | "COWS" | "DEAD";

interface QuadrantConfig {
  key: QuadrantType;
  label: string;
  icon: typeof StarIcon;
  color: string;
  bg: string;
  border: string;
  description: string;
  action: string;
}

const QUADRANTS: QuadrantConfig[] = [
  {
    key: "STARS",
    label: "Stars",
    icon: StarIcon,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    description: "Haute marge + Haut volume",
    action: "Doubler les efforts",
  },
  {
    key: "DIAMONDS",
    label: "Diamants",
    icon: DiamondIcon,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    description: "Haute marge + Faible volume",
    action: "Promouvoir",
  },
  {
    key: "COWS",
    label: "Vaches à Lait",
    icon: CowIcon,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    description: "Basse marge + Haut volume",
    action: "Optimiser",
  },
  {
    key: "DEAD",
    label: "Services Morts",
    icon: SkullIcon,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    description: "Basse marge + Faible volume",
    action: "Revoir ou supprimer",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT - Grid CSS Strict (3 Zones)
// ═══════════════════════════════════════════════════════════════════════════════
// Zone 1: Telemetry (KPIs)
// Zone 2: Inventory Stage [Filters 260px | Main-Grid 1fr]
// ═══════════════════════════════════════════════════════════════════════════════

type CategoryFilter =
  | "ALL"
  | "GENERAL"
  | "TECHNIC"
  | "CONSULTING"
  | "SUBSCRIPTION";

// Service avec métriques de portfolio
interface ServiceMetrics extends CatalogService {
  margin: number; // Pourcentage
  revenue: number; // CA estimé
  quadrant: QuadrantType;
}

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

  const [activeTab, setActiveTab] = useState<"INVENTORY" | "MARKETPLACE">(
    "INVENTORY",
  );
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [viewMode, setViewMode] = useState<"MATRIX" | "LIST">("MATRIX");

  // ─── Calculate metrics and quadrants ───
  const servicesWithMetrics = useMemo((): ServiceMetrics[] => {
    const source = activeTab === "INVENTORY" ? userServices : platformServices;

    // Calculer les marges
    const withMargins = source.map((s) => {
      const margin =
        s.unitPrice > 0
          ? ((s.unitPrice - (s.baseCost || 0)) / s.unitPrice) * 100
          : 0;
      // Revenue simulé de façon déterministe via hash de l'id
      const hash = s.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const revenue = (hash % 1000) * 1000;
      return { ...s, margin, revenue };
    });

    // Calculer médianes pour positionnement
    const margins = withMargins.map((s) => s.margin).sort((a, b) => a - b);
    const revenues = withMargins.map((s) => s.revenue).sort((a, b) => a - b);
    const medianMargin = margins[Math.floor(margins.length / 2)] || 30;
    const medianRevenue = revenues[Math.floor(revenues.length / 2)] || 500000;

    // Assigner quadrants
    return withMargins.map((s) => {
      let quadrant: QuadrantType;
      if (s.margin >= medianMargin && s.revenue >= medianRevenue) {
        quadrant = "STARS";
      } else if (s.margin >= medianMargin && s.revenue < medianRevenue) {
        quadrant = "DIAMONDS";
      } else if (s.margin < medianMargin && s.revenue >= medianRevenue) {
        quadrant = "COWS";
      } else {
        quadrant = "DEAD";
      }
      return { ...s, quadrant };
    });
  }, [userServices, platformServices, activeTab]);

  // ─── Filtered services ───
  const filteredServices = useMemo(() => {
    return servicesWithMetrics.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "ALL" || s.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [servicesWithMetrics, searchQuery, categoryFilter]);

  // ─── Selected service ───
  const activeService = useMemo(
    () => filteredServices.find((s) => s.id === selectedServiceId),
    [filteredServices, selectedServiceId],
  );

  // ─── KPI Stats ───
  const kpiStats = useMemo(() => {
    const totalValue = filteredServices.reduce(
      (sum, s) => sum + (s.unitPrice || 0),
      0,
    );
    const avgMargin =
      filteredServices.length > 0
        ? filteredServices.reduce((sum, s) => sum + s.margin, 0) /
          filteredServices.length
        : 0;
    return {
      totalServices: filteredServices.length,
      totalValue,
      avgMargin: Math.round(avgMargin),
    };
  }, [filteredServices]);

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

  // ─── Delete service ───
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce service ?")) return;
    try {
      await deleteServiceAction(id);
      await deleteLocalService(id);
      toast.success("Service supprimé");
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const leftSlot = (
    <div className="flex flex-col gap-2 p-2 bg-slate-50 overflow-y-auto h-full">
      {/* Card Search */}
      <div className={cn(DS_BENTO_CARD, "p-2")}>
        <p className={cn(DS_MICRO, "text-slate-400 mb-1.5")}>Recherche</p>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher..."
          width="w-full"
        />
      </div>

      {/* Card Source */}
      <div className={cn(DS_BENTO_CARD, "p-2")}>
        <p className={cn(DS_MICRO, "text-slate-400 mb-1.5")}>Source</p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("INVENTORY")}
            className={cn(
              "flex items-center justify-between px-2 py-1.5 rounded text-[11px] font-medium transition-all",
              activeTab === "INVENTORY"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "text-slate-600 hover:bg-slate-100 border border-transparent",
            )}
          >
            <div className="flex items-center gap-1.5">
              <CubeIcon
                size={12}
                weight={activeTab === "INVENTORY" ? "fill" : "regular"}
                className={
                  activeTab === "INVENTORY"
                    ? "text-indigo-500"
                    : "text-slate-400"
                }
              />
              <span>Mes services</span>
            </div>
            <span
              className={cn(
                DS_MONO,
                "text-[10px] px-1.5 py-0.5 rounded",
                activeTab === "INVENTORY"
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {userServices.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("MARKETPLACE")}
            className={cn(
              "flex items-center justify-between px-2 py-1.5 rounded text-[11px] font-medium transition-all",
              activeTab === "MARKETPLACE"
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "text-slate-600 hover:bg-slate-100 border border-transparent",
            )}
          >
            <div className="flex items-center gap-1.5">
              <StorefrontIcon
                size={12}
                weight={activeTab === "MARKETPLACE" ? "fill" : "regular"}
                className={
                  activeTab === "MARKETPLACE"
                    ? "text-amber-500"
                    : "text-slate-400"
                }
              />
              <span>Plateforme</span>
            </div>
            <span
              className={cn(
                DS_MONO,
                "text-[10px] px-1.5 py-0.5 rounded",
                activeTab === "MARKETPLACE"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {platformServices.length}
            </span>
          </button>
        </div>
      </div>

      {/* Card Catégories */}
      <div className={cn(DS_BENTO_CARD, "p-2 flex-1")}>
        <p className={cn(DS_MICRO, "text-slate-400 mb-1.5")}>Catégories</p>
        <div className="flex flex-col gap-1">
          {[
            { key: "ALL", label: "Tous", color: "slate" },
            { key: "GENERAL", label: "Général", color: "slate" },
            { key: "TECHNIC", label: "Technique", color: "blue" },
            { key: "CONSULTING", label: "Conseil", color: "purple" },
            { key: "SUBSCRIPTION", label: "Abonnement", color: "emerald" },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key as CategoryFilter)}
              className={cn(
                "w-full flex items-center px-2 py-1.5 rounded text-left text-[11px] font-medium transition-all border",
                categoryFilter === cat.key
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "text-slate-600 hover:bg-slate-50 border-transparent",
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full mr-2 shrink-0",
                  categoryFilter === cat.key ? "bg-indigo-500" : "bg-slate-300",
                )}
              />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card KPIs */}
      <div className={cn(DS_BENTO_CARD, "p-2")}>
        <p className={cn(DS_MICRO, "text-slate-400 mb-2")}>Vue d'ensemble</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-1.5 bg-slate-50 rounded border border-slate-100">
            <p className={cn(DS_MONO, "text-base font-bold text-slate-900")}>
              {kpiStats.totalServices}
            </p>
            <p className={cn(DS_MICRO, "text-slate-400 mt-0.5")}>Services</p>
          </div>
          <div className="text-center p-1.5 bg-slate-50 rounded border border-slate-100">
            <p className={cn(DS_MONO, "text-base font-bold text-slate-900")}>
              {kpiStats.avgMargin}%
            </p>
            <p className={cn(DS_MICRO, "text-slate-400 mt-0.5")}>Marge</p>
          </div>
        </div>
      </div>
    </div>
  );

  const mainSlot =
    viewMode === "MATRIX" ? (
      <PortfolioMatrix
        services={filteredServices}
        selectedId={selectedServiceId}
        onSelect={selectService}
      />
    ) : (
      <ServiceList
        services={filteredServices}
        selectedId={selectedServiceId}
        onSelect={selectService}
        onDelete={handleDelete}
        onImport={handleImport}
        isMarketplace={activeTab === "MARKETPLACE"}
      />
    );

  const detailSlot = (
    <ServiceDetailSidebar
      service={activeService}
      onClose={() => selectService(null)}
      onDelete={() => activeService && handleDelete(activeService.id)}
    />
  );

  const actionsSlot = (
    <>
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded">
        <button
          onClick={() => setViewMode("MATRIX")}
          className={cn(
            "px-2 py-1 rounded text-[9px] font-bold uppercase transition-all",
            viewMode === "MATRIX"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          Matrix
        </button>
        <button
          onClick={() => setViewMode("LIST")}
          className={cn(
            "px-2 py-1 rounded text-[9px] font-bold uppercase transition-all",
            viewMode === "LIST"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          Liste
        </button>
      </div>
      <button onClick={handleAddNew} className={cn(DS_BUTTON)}>
        <PlusIcon size={DS_ICON_SM} weight="bold" />
        Nouveau
      </button>
    </>
  );

  return (
    <div className={cn(DS_PAGE_SHELL, "px-4 py-3")}>
      <div className={DS_PAGE_GRID}>
        {/* ROW 0 — Filtres + Vue principale + Détail */}
        <div className="col-span-2 overflow-hidden">{leftSlot}</div>
        <div
          className={cn(
            "overflow-hidden",
            activeService ? "col-span-6" : "col-span-10",
          )}
        >
          {mainSlot}
        </div>
        {activeService && (
          <div className="col-span-4 overflow-hidden">{detailSlot}</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PORTFOLIO MATRIX - 2x2 Grid avec vos services positionnés
// ═══════════════════════════════════════════════════════════════════════════════

interface PortfolioMatrixProps {
  services: ServiceMetrics[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function PortfolioMatrix({
  services,
  selectedId,
  onSelect,
}: PortfolioMatrixProps) {
  const quadrants: { key: QuadrantType; services: ServiceMetrics[] }[] = [
    { key: "STARS", services: services.filter((s) => s.quadrant === "STARS") },
    {
      key: "DIAMONDS",
      services: services.filter((s) => s.quadrant === "DIAMONDS"),
    },
    { key: "COWS", services: services.filter((s) => s.quadrant === "COWS") },
    { key: "DEAD", services: services.filter((s) => s.quadrant === "DEAD") },
  ];

  return (
    <div className="h-full overflow-y-auto p-4">
      {/* Header Matrix */}
      <div className={cn(DS_SECTION_HEADER, "mb-4")}>
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Product Portfolio Matrix
          </h2>
          <p className={cn(DS_LABEL, "mt-0.5")}>
            Positionnement stratégique par marge et volume
          </p>
        </div>
      </div>

      {/* Grid 2x2 */}
      <div className="grid grid-cols-2 grid-rows-2 gap-3 h-[calc(100%-40px)]">
        {quadrants.map(({ key, services: quadrantServices }) => {
          const config = QUADRANTS.find((q) => q.key === key)!;
          const Icon = config.icon;

          return (
            <motion.div
              key={key}
              className={cn(
                DS_BENTO_CARD,
                "flex flex-col overflow-hidden",
                config.border,
              )}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {/* Quadrant Header */}
              <div
                className={cn(
                  "flex items-center justify-between p-3 border-b",
                  config.border,
                  config.bg,
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} className={config.color} weight="fill" />
                  <span className={cn("text-xs font-bold", config.color)}>
                    {config.label}
                  </span>
                </div>
                <span className={cn(DS_MONO, "text-[10px] text-slate-500")}>
                  {quadrantServices.length} services
                </span>
              </div>

              {/* Services List */}
              <div className="flex-1 overflow-y-auto p-2">
                <AnimatePresence>
                  {quadrantServices.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <Icon
                        size={24}
                        className={cn("opacity-20", config.color)}
                      />
              <p className={cn(DS_LABEL, "mt-2")}>
                {config.description}
              </p>
                    </div>
                  ) : (
                    <div className={DS_GAP_ITEMS}>
                      {quadrantServices.map((service, index) => (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => onSelect(service.id)}
                          className={cn(
                            DS_CARD,
                            "p-2 rounded cursor-pointer transition-all hover:border-slate-300",
                            selectedId === service.id &&
                              "border-indigo-400 bg-indigo-50/30",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate">
                                {service.title}
                              </p>
                              <p
                                className={cn(
                                  DS_MONO,
                                  "text-[10px] text-slate-500 mt-0.5",
                                )}
                              >
                                Marge: {Math.round(service.margin)}%
                              </p>
                            </div>
                            <span
                              className={cn(
                                DS_MONO,
                                "text-xs font-bold text-slate-700",
                              )}
                            >
                              {formatCompact(service.unitPrice)}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Footer */}
              <div className={cn("p-2 border-t", config.border, config.bg)}>
                <p className={cn(DS_MICRO, config.color)}>{config.action}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE LIST - Vue liste alternative
// ═══════════════════════════════════════════════════════════════════════════════

interface ServiceListProps {
  services: ServiceMetrics[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onImport: (id: string) => void;
  isMarketplace: boolean;
}

function ServiceList({
  services,
  selectedId,
  onSelect,
  onDelete,
  onImport,
  isMarketplace,
}: ServiceListProps) {
  const categoryColors: Record<string, string> = {
    GENERAL: "bg-slate-100 text-slate-600",
    TECHNIC: "bg-blue-100 text-blue-600",
    CONSULTING: "bg-purple-100 text-purple-600",
    SUBSCRIPTION: "bg-emerald-100 text-emerald-600",
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className={DS_GAP_ITEMS}>
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onSelect(service.id)}
            className={cn(
              DS_CARD,
              "flex items-center justify-between p-3 rounded cursor-pointer transition-all",
              selectedId === service.id
                ? "border-indigo-400 bg-indigo-50/30"
                : "hover:border-slate-300",
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                  categoryColors[service.category] || categoryColors.GENERAL,
                )}
              >
                {service.category.slice(0, 3)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {service.title}
                </p>
                <p className={cn(DS_MONO, "text-[10px] text-slate-500")}>
                  Marge: {Math.round(service.margin)}% ·{" "}
                  {formatCompact(service.revenue)} CA
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn(DS_MONO, "text-sm font-bold text-slate-900")}>
                {formatCompact(service.unitPrice)}
              </span>
              {isMarketplace ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onImport(service.id);
                  }}
                  className={cn(
                    DS_BUTTON,
                    "bg-amber-100 text-amber-700 hover:bg-amber-200",
                  )}
                >
                  <ArrowRightIcon size={DS_ICON_XS} weight="bold" />
                  Importer
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(service.id);
                  }}
                  className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <TrashIcon size={14} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE DETAIL SIDEBAR - Fiche service + Analytics
// ═══════════════════════════════════════════════════════════════════════════════

interface ServiceDetailSidebarProps {
  service: ServiceMetrics | undefined;
  onClose: () => void;
  onDelete: () => void;
}

function ServiceDetailSidebar({
  service,
  onClose,
  onDelete,
}: ServiceDetailSidebarProps) {
  const { updateLocalService } = useCatalog();
  const [isEditing, setIsEditing] = useState(false);

  if (!service) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className={cn(DS_ICON_WRAPPER, "w-14 h-14 mb-4 bg-slate-100")}>
          <PackageIcon size={24} className="text-slate-400" />
        </div>
        <h3 className="text-sm font-bold text-slate-700 mb-1">
          Sélectionnez un service
        </h3>
        <p className={cn(DS_LABEL, "max-w-[180px]")}>
          Cliquez sur un service pour voir les détails et analytics
        </p>
      </div>
    );
  }

  const quadrant = QUADRANTS.find((q) => q.key === service.quadrant)!;
  const QuadrantIcon = quadrant.icon;

  const handleUpdate = (
    field: keyof CatalogService,
    value: string | number,
  ) => {
    updateLocalService(service.id, { [field]: value });
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <span className={cn(DS_MICRO, "text-slate-400")}>Fiche Service</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              DS_ICON_WRAPPER,
              isEditing
                ? "bg-indigo-100 text-indigo-600"
                : "hover:bg-slate-100 text-slate-400",
            )}
          >
            <PencilIcon size={14} weight={isEditing ? "fill" : "regular"} />
          </button>
          <button
            onClick={onClose}
            className={cn(DS_ICON_WRAPPER, "hover:bg-slate-100 text-slate-400")}
          >
            <XIcon size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        {/* Titre Editable */}
        <div>
          <span className={cn(DS_BADGE_ACTIVE, "mb-2 inline-block")}>
            {service.category}
          </span>

          {isEditing ? (
            <>
              <input
                type="text"
                value={service.title}
                onChange={(e) => handleUpdate("title", e.target.value)}
                className={cn(
                  DS_INPUT,
                  "w-full py-1.5 px-2 rounded text-sm font-bold mb-2",
                )}
              />
              <textarea
                value={service.subtitle || ""}
                onChange={(e) => handleUpdate("subtitle", e.target.value)}
                placeholder="Description..."
                rows={2}
                className={cn(
                  DS_INPUT,
                  "w-full py-1.5 px-2 rounded text-xs resize-none",
                )}
              />
            </>
          ) : (
            <>
              <h2 className="text-base font-bold text-slate-900">
                {service.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {service.subtitle || "Aucune description"}
              </p>
            </>
          )}
        </div>

        {/* Quadrant Badge */}
        <div className={cn(DS_BENTO_CARD, quadrant.bg, quadrant.border)}>
          <div className="flex items-center gap-2">
            <QuadrantIcon size={20} className={quadrant.color} weight="fill" />
            <div>
              <p className={cn("text-xs font-bold", quadrant.color)}>
                {quadrant.label}
              </p>
              <p className={cn(DS_MICRO, "text-slate-500")}>
                {quadrant.description}
              </p>
            </div>
          </div>
        </div>

        {/* Prix Editable */}
        <div className={cn(DS_GAP_GRID, "grid-cols-2")}>
          <div className={DS_TEL_BLOCK}>
            <p className={cn(DS_MICRO, "text-slate-400")}>Prix unitaire</p>
            {isEditing ? (
              <input
                type="number"
                value={service.unitPrice}
                onChange={(e) =>
                  handleUpdate("unitPrice", Number(e.target.value))
                }
                className={cn(
                  DS_INPUT,
                  DS_MONO,
                  "w-full py-1 px-2 rounded text-sm mt-1",
                )}
              />
            ) : (
              <p className={cn(DS_MONO, "text-lg font-bold text-slate-900")}>
                {formatCompact(service.unitPrice)}
              </p>
            )}
          </div>
          <div className={DS_TEL_BLOCK}>
            <p className={cn(DS_MICRO, "text-slate-400")}>Coût de revient</p>
            {isEditing ? (
              <input
                type="number"
                value={service.baseCost || 0}
                onChange={(e) =>
                  handleUpdate("baseCost", Number(e.target.value))
                }
                className={cn(
                  DS_INPUT,
                  DS_MONO,
                  "w-full py-1 px-2 rounded text-sm mt-1",
                )}
              />
            ) : (
              <p className={cn(DS_MONO, "text-lg font-bold text-slate-900")}>
                {formatCompact(service.baseCost || 0)}
              </p>
            )}
          </div>
        </div>

        {/* Marge Calculée */}
        <div className={DS_BENTO_CARD}>
          <div className="flex items-center justify-between mb-2">
            <span className={cn(DS_LABEL, "mb-0")}>Marge nette</span>
            <span className={cn(DS_MONO, "text-lg font-bold text-slate-900")}>
              {Math.round(service.margin)}%
            </span>
          </div>
          <div className={DS_PROGRESS_TRACK}>
            <div
              className={cn(DS_PROGRESS_BAR, "bg-indigo-500")}
              style={{ width: `${Math.min(100, service.margin)}%` }}
            />
          </div>
          <p className={cn(DS_MONO, "text-[10px] text-slate-400 mt-1")}>
            Profit: {formatCompact(service.unitPrice - (service.baseCost || 0))}{" "}
            XOF / unité
          </p>
        </div>

        {/* Catégorie Editable */}
        {isEditing && (
          <div className={DS_BENTO_CARD}>
            <p className={cn(DS_MICRO, "text-slate-400 mb-2")}>Catégorie</p>
            <select
              value={service.category}
              onChange={(e) => handleUpdate("category", e.target.value)}
              className={cn(DS_INPUT, "w-full py-1.5 px-2 rounded text-xs")}
            >
              <option value="GENERAL">Général</option>
              <option value="TECHNIC">Technique</option>
              <option value="CONSULTING">Conseil</option>
              <option value="SUBSCRIPTION">Abonnement</option>
            </select>
          </div>
        )}

        {/* Actions */}
        <div className={DS_GAP_ITEMS}>
          <button
            onClick={onDelete}
            className={cn(
              DS_BUTTON,
              "w-full justify-center bg-rose-100 text-rose-700 hover:bg-rose-200",
            )}
          >
            <TrashIcon size={DS_ICON_SM} weight="bold" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
