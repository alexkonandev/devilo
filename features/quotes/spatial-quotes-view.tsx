"use client";

import React from "react";
import { useQuotes } from "./components/quote-context";
import { QuoteRow } from "./components/spatial-quote-card";
import { AnimatePresence, motion } from "framer-motion";
import {
  PlusIcon,
  ArrowUpRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  FileTextIcon,
  FilesIcon,
  PencilSimpleIcon,
  PaperPlaneTiltIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { QuoteStatus } from "@/types/quote-registry";
import { SpatialCard } from "@/features/dashboard/components/spatial-card";

// ═══════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT_EXPO },
  },
};

// ═══════════════════════════════════════════════════════════════
// STATUS TABS CONFIG
// ═══════════════════════════════════════════════════════════════

const STATUS_TABS: Array<{
  id: QuoteStatus | "ALL";
  label: string;
  icon: React.ElementType;
}> = [
  { id: "ALL", label: "Tous", icon: FilesIcon },
  { id: "DRAFT", label: "Brouillons", icon: PencilSimpleIcon },
  { id: "SENT", label: "Envoyés", icon: PaperPlaneTiltIcon },
  { id: "PAID", label: "Payés", icon: CheckCircleIcon },
  { id: "REJECTED", label: "Refusés", icon: XCircleIcon },
];

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function SpatialQuotesView() {
  const {
    filteredQuotes,
    stats,
    searchQuery,
    setSearchQuery,
    activeStatus,
    setActiveStatus,
    isLoading,
  } = useQuotes();

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
                Gestion des Devis
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 italic">
              Devis<span className="text-indigo-500">.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/quotes/new"
              className="group flex items-center gap-2.5 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40"
            >
              <PlusIcon size={16} weight="bold" />
              Nouveau Devis
              <ArrowUpRightIcon
                size={14}
                weight="bold"
                className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
              />
            </Link>
          </div>
        </motion.header>

        {/* ─── FILTERS: STATUS TABS + SEARCH ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 overflow-x-auto scrollbar-none">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStatus(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shrink-0",
                  activeStatus === tab.id
                    ? "bg-white text-indigo-600 border border-indigo-200/60 shadow-sm"
                    : "text-slate-400 hover:text-slate-900 hover:bg-white/60 border border-transparent"
                )}
              >
                <tab.icon
                  size={14}
                  weight={activeStatus === tab.id ? "fill" : "regular"}
                />
                <span className="hidden sm:inline">{tab.label}</span>
                <span
                  className={cn(
                    "text-[9px] font-mono font-black px-1.5 py-0.5 rounded-lg",
                    activeStatus === tab.id
                      ? "bg-indigo-50 text-indigo-500"
                      : "bg-slate-100 text-slate-400"
                  )}
                >
                  {stats.countByStatus[tab.id] || 0}
                </span>
              </button>
            ))}
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
              placeholder="Rechercher par n° ou client..."
              className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* ─── DATA TABLE ─── */}
        <SpatialCard depth={1} variant="glass" className="overflow-hidden" mountDelay={0.1}>
          {/* Column Headers */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <div className="col-span-2">Référence</div>
            <div className="col-span-3">Client</div>
            <div className="col-span-2 text-right">Montant HT</div>
            <div className="col-span-2 text-center">Statut</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                // Skeleton rows
                [...Array(5)].map((_, i) => (
                  <motion.div
                    key={`skel-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-12 gap-4 px-6 py-5 items-center"
                  >
                    <div className="col-span-2">
                      <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                    </div>
                    <div className="col-span-3">
                      <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                    </div>
                    <div className="col-span-2">
                      <div className="h-4 w-24 bg-slate-100 rounded animate-pulse ml-auto" />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <div className="h-6 w-20 bg-slate-100 rounded-xl animate-pulse" />
                    </div>
                    <div className="col-span-2">
                      <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                    </div>
                    <div className="col-span-1">
                      <div className="h-6 w-6 bg-slate-100 rounded animate-pulse ml-auto" />
                    </div>
                  </motion.div>
                ))
              ) : filteredQuotes.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredQuotes.map((quote) => (
                    <motion.div key={quote.id} variants={itemVariants}>
                      <QuoteRow quote={quote} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center mb-6">
                    <FunnelIcon
                      size={32}
                      weight="duotone"
                      className="text-indigo-500"
                    />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">
                    Aucun devis trouvé
                  </h3>
                  <p className="text-sm text-slate-400 max-w-sm">
                    Essayez de modifier vos filtres ou créez un nouveau devis.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SpatialCard>
      </main>
    </div>
  );
}
