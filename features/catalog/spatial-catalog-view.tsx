"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  ArrowUpRightIcon,
  MagnifyingGlassIcon,
  StorefrontIcon,
  CubeIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CatalogService } from "@/types/catalog";
import { createServiceAction } from "@/actions/catalog-action";

import { useCatalog } from "./components/catalog-context";
import { SpatialCard } from "@/features/dashboard/components/spatial-card";
import { ServiceCard } from "./components/spatial-service-card";
import { SpatialServiceEditor } from "./components/spatial-service-editor";
import { PlatformServiceCard } from "./components/marketplace-dialog";

// ═══════════════════════════════════════════════════════════════
// ANIMATION VARIANTS (Spatial Intelligence DS)
// ═══════════════════════════════════════════════════════════════

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type CatalogTab = "INVENTORY" | "MARKETPLACE";

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

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

  // ─── Derived: active service for editor ───
  const activeService = useMemo(
    () => userServices.find((s) => s.id === selectedServiceId),
    [userServices, selectedServiceId]
  );

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
    toast.success("Module importé avec succès");
    setActiveTab("INVENTORY");
  };

  return (
    <div className="relative min-h-[80vh] font-sans">
      <main className="relative z-10 max-w-[1600px] mx-auto py-8 space-y-8">
        {/* ─── HEADER ─── */}
        <motion.header
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
                Catalogue des Services
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 italic">
              Inventaire<span className="text-indigo-500">.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddNew}
              className="group flex items-center gap-2.5 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40"
            >
              <PlusIcon size={16} weight="bold" />
              Créer un service
              <ArrowUpRightIcon
                size={14}
                weight="bold"
                className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
              />
            </button>
          </div>
        </motion.header>

        {/* ─── TAB NAVIGATION + SEARCH ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60">
            <TabButton
              active={activeTab === "INVENTORY"}
              onClick={() => setActiveTab("INVENTORY")}
              icon={<CubeIcon size={16} weight="duotone" />}
              label="Mon Inventaire"
              count={userServices.length}
            />
            <TabButton
              active={activeTab === "MARKETPLACE"}
              onClick={() => setActiveTab("MARKETPLACE")}
              icon={<StorefrontIcon size={16} weight="duotone" />}
              label="Services Plateforme"
              count={platformServices.length}
            />
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <MagnifyingGlassIcon
              size={16}
              weight="bold"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un service..."
              className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* ─── TAB CONTENT ─── */}
        <AnimatePresence mode="wait">
          {activeTab === "INVENTORY" ? (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            >
              <InventoryGrid
                services={userServices}
                selectedServiceId={selectedServiceId}
                onSelect={selectService}
                onDelete={deleteLocalService}
              />
            </motion.div>
          ) : (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            >
              <MarketplaceGrid
                services={platformServices}
                onImport={handleImport}
                isLoading={isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── EDITOR DRAWER ─── */}
        <AnimatePresence mode="wait">
          {activeService && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => selectService(null)}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 cursor-pointer"
              />
              {/* Drawer */}
              <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed inset-y-0 right-0 w-full md:w-[500px] z-50 shadow-2xl"
              >
                <SpatialServiceEditor
                  service={activeService}
                  onClose={() => selectService(null)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── Tab Button ───

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}

function TabButton({ active, onClick, icon, label, count }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2.5 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
        active
          ? "bg-white text-indigo-600 border border-indigo-200/60 shadow-sm"
          : "text-slate-400 hover:text-slate-900 hover:bg-white/60 border border-transparent"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span
        className={cn(
          "text-[9px] font-mono font-black px-2 py-0.5 rounded-lg",
          active
            ? "bg-indigo-50 text-indigo-500"
            : "bg-slate-100 text-slate-400"
        )}
      >
        {count}
      </span>
    </button>
  );
}

// ─── Inventory Grid ───

interface InventoryGridProps {
  services: CatalogService[];
  selectedServiceId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => Promise<void>;
}

function InventoryGrid({
  services,
  selectedServiceId,
  onSelect,
  onDelete,
}: InventoryGridProps) {
  if (services.length === 0) {
    return (
      <SpatialCard depth={1} variant="glass" className="p-16">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center mb-6">
            <CubeIcon size={40} weight="duotone" className="text-indigo-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">
            Inventaire vide
          </h3>
          <p className="text-sm text-slate-400 max-w-md">
            Créez votre premier service ou importez-en depuis les Services
            Plateforme pour constituer votre catalogue.
          </p>
        </div>
      </SpatialCard>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {services.map((service) => (
        <motion.div key={service.id} variants={itemVariants}>
          <ServiceCard
            service={service}
            isActive={selectedServiceId === service.id}
            onClick={() => onSelect(service.id)}
            onDelete={(e) => {
              e.stopPropagation();
              if (confirm("Supprimer ce service ?")) onDelete(service.id);
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Marketplace Grid ───

interface MarketplaceGridProps {
  services: CatalogService[];
  onImport: (id: string) => Promise<void>;
  isLoading: boolean;
}

function MarketplaceGrid({ services, onImport, isLoading }: MarketplaceGridProps) {
  const [importingId, setImportingId] = useState<string | null>(null);

  const handleImport = async (id: string) => {
    setImportingId(id);
    await onImport(id);
    setImportingId(null);
  };

  if (services.length === 0) {
    return (
      <SpatialCard depth={1} variant="glass" className="p-16">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200/60 flex items-center justify-center mb-6">
            <StorefrontIcon
              size={40}
              weight="duotone"
              className="text-amber-500"
            />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">
            Aucun service disponible
          </h3>
          <p className="text-sm text-slate-400 max-w-md">
            La plateforme ne propose aucun service pour le moment.
          </p>
        </div>
      </SpatialCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <SectionHeader
        icon={<StorefrontIcon size={20} weight="duotone" />}
        label={`${services.length} services disponibles — Sélectionnez pour ajouter à votre inventaire`}
        iconBg="bg-amber-50 text-amber-500"
      />

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {services.map((service) => (
          <motion.div key={service.id} variants={itemVariants}>
            <PlatformServiceCard
              service={service}
              onImport={() => handleImport(service.id)}
              isImporting={importingId === service.id}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Section Header ───

interface SectionHeaderProps {
  icon: React.ReactNode;
  label: string;
  iconBg: string;
}

function SectionHeader({ icon, label, iconBg }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className={cn("p-2 rounded-xl", iconBg)}>{icon}</div>
      <h2 className="font-bold uppercase tracking-[0.2em] text-[11px] text-slate-400">
        {label}
      </h2>
    </div>
  );
}
