"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CaretRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CheckCircleIcon,
  WarningIcon,
  BellIcon,
  FileTextIcon,
  UsersThreeIcon,
  XIcon,
  CommandIcon,
} from "@phosphor-icons/react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { useQuotes } from "@/features/quotes/components/quote-context";
import { QuoteRegistryStats } from "@/types/quote-registry";

// Hook sécurisé pour récupérer les stats hors contexte QuoteProvider
function useSafeQuotes() {
  try {
    return useQuotes();
  } catch {
    // Fallback quand on est hors du QuoteProvider
    return {
      stats: {
        countByStatus: {
          DRAFT: 0,
          SENT: 0,
          ACCEPTED: 0,
          PAID: 0,
          REJECTED: 0,
          ALL: 0,
        },
        totalPipelineValue: 0,
        totalOutstandingValue: 0,
        totalCashCollected: 0,
        conversionRate: 0,
      } as QuoteRegistryStats,
    };
  }
}

const PATH_MAP: Record<string, { label: string; icon: React.ElementType }> = {
  dashboard: { label: "Dashboard", icon: CommandIcon },
  clients: { label: "Clients", icon: UsersThreeIcon },
  catalog: { label: "Catalogue", icon: CommandIcon },
  quotes: { label: "Devis", icon: FileTextIcon },
  new: { label: "Nouveau", icon: PlusIcon },
  settings: { label: "Paramètres", icon: CommandIcon },
  editor: { label: "Éditeur", icon: CommandIcon },
  billing: { label: "Facturation", icon: CommandIcon },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS BAR MONOLITHIQUE - High Density Information Architecture
// ═══════════════════════════════════════════════════════════════════════════════

export function SpatialStatusBar() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split("/").filter(Boolean);
  const { stats } = useSafeQuotes();

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // System health (simulated - in real app, this would come from a health check)
  const [systemHealth] = useState<"healthy" | "warning" | "error">("healthy");
  const [unreadNotifications] = useState(0);

  // Focus search when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Keyboard shortcut: Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Draft count for quick indicator
  const draftCount = stats.countByStatus?.DRAFT || 0;

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 h-10 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-0 select-none"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ═══ GAUCHE : Breadcrumb + Contexte ═══ */}
      <div className="flex items-center h-full">
        {/* Logo minimal */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-16 h-full border-r border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <Logo variant="icon" className="h-4 w-4 text-slate-700" />
        </Link>

        {/* Breadcrumb interactif */}
        <nav className="flex items-center h-full px-3">
          {segments.length === 0 ? (
            <span className="text-[11px] font-semibold text-slate-400 tracking-wide">
              Accueil
            </span>
          ) : (
            <div className="flex items-center gap-1">
              {segments.map((segment, index) => {
                const href = `/${segments.slice(0, index + 1).join("/")}`;
                const isLast = index === segments.length - 1;
                const pathInfo = PATH_MAP[segment];
                const label = pathInfo?.label || segment;

                return (
                  <React.Fragment key={href}>
                    {index > 0 && (
                      <CaretRightIcon
                        size={10}
                        weight="bold"
                        className="text-slate-300 mx-0.5"
                      />
                    )}
                    {isLast ? (
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded">
                        {label}
                      </span>
                    ) : (
                      <Link
                        href={href}
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        {label}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </nav>

        {/* Séparateur fin */}
        <div className="w-px h-5 bg-slate-200 mx-2" />

        {/* Barre de recherche intégrée style macOS */}
        <div className="relative flex items-center">
          <AnimatePresence mode="wait">
            {isSearchOpen ? (
              <motion.div
                initial={{ width: 32, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 32, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md border border-slate-200 w-full">
                  <MagnifyingGlassIcon size={14} className="text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Rechercher..."
                    className="flex-1 bg-transparent text-[11px] text-slate-700 placeholder:text-slate-400 outline-none min-w-0"
                  />
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchValue("");
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <XIcon size={12} weight="bold" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-1.5 px-2 py-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all"
              >
                <MagnifyingGlassIcon size={14} weight="bold" />
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  ⌘K
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══ DROITE : Status & Actions ═══ */}
      <div className="flex items-center h-full">
        {/* Indicateurs de Santé Système */}
        <div className="flex items-center gap-2 px-3 h-full border-l border-slate-200">
          {/* Status Synchro */}
          <div
            className={cn(
              "flex items-center gap-1 text-[10px] font-medium",
              systemHealth === "healthy" && "text-emerald-600",
              systemHealth === "warning" && "text-amber-600",
              systemHealth === "error" && "text-rose-600",
            )}
          >
            {systemHealth === "healthy" ? (
              <CheckCircleIcon size={12} weight="fill" />
            ) : (
              <WarningIcon size={12} weight="fill" />
            )}
            <span className="hidden sm:inline">
              {systemHealth === "healthy" ? "Sync OK" : "Sync..."}
            </span>
          </div>

          {/* Notifications */}
          <button className="relative flex items-center justify-center w-6 h-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-all">
            <BellIcon size={14} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            )}
          </button>
        </div>

        {/* Quick Actions Contextuelles */}
        <div className="flex items-center h-full border-l border-slate-200">
          {/* Bouton + Création rapide */}
          <div className="flex items-center gap-0.5 px-2">
            <button
              onClick={() => router.push("/quotes/new")}
              className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-semibold transition-colors"
            >
              <PlusIcon size={12} weight="bold" />
              <span>Devis</span>
            </button>
            {draftCount > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded">
                {draftCount}
              </span>
            )}
          </div>

          {/* Bouton + Client */}
          <button
            onClick={() => router.push("/clients")}
            className="flex items-center gap-1 px-2 py-1 ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-[10px] font-medium transition-colors"
          >
            <UsersThreeIcon size={12} />
            <span>Client</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}
