"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  FileTextIcon,
  TrendUpIcon,
  WarningCircleIcon,
  ClockUserIcon,
  ArrowRightIcon,
  BellRingingIcon,
  ActivityIcon,
  PlusIcon,
  UsersThreeIcon,
  SignOutIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { useUser, useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuotes } from "@/features/quotes/components/quote-context";
import type { QuoteRegistryStats } from "@/types/quote-registry";
import { useReminders } from "@/features/reminders/use-reminders";
import type { ReminderItem } from "@/actions/reminder-action";
import { getRecentQuotesAction, type RecentQuoteItem } from "@/actions/quote-registry-action";
import {
  DS_LABEL,
  DS_MONO,
  DS_CARD,
  DS_ICON_SM,
  DS_ICON_XS,
} from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS SÉCURISÉS
// ═══════════════════════════════════════════════════════════════════════════════

function useSafeQuotes() {
  try {
    const ctx = useQuotes();
    return { stats: ctx.stats };
  } catch {
    return {
      stats: {
        countByStatus: {
          DRAFT: 0,
          SENT: 0,
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

// ═══════════════════════════════════════════════════════════════════════════════
// FORMATTEURS & UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════════

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "auj.";
  if (diffDays === 1) return "hier";
  if (diffDays < 7) return `il y a ${diffDays}j`;
  if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)}sem`;
  return `il y a ${Math.floor(diffDays / 30)}mois`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG — Actions pour la command palette (2 groupes)
// ═══════════════════════════════════════════════════════════════════════════════

interface PaletteAction {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  desc?: string;
  group: string;
}

const PALETTE_ACTIONS: PaletteAction[] = [
  // Groupe DEVIS
  { id: "new-quote", label: "Nouveau devis", href: "/quotes/new", icon: PlusIcon, desc: "Créer un devis personnalisé", group: "Devis" },
  { id: "all-quotes", label: "Tous les devis", href: "/quotes", icon: FileTextIcon, desc: "Registre complet", group: "Devis" },
  { id: "pending-quotes", label: "En attente", href: "/quotes?status=SENT", icon: ClockUserIcon, desc: "Devis envoyés sans réponse", group: "Devis" },
  { id: "draft-quotes", label: "Brouillons", href: "/quotes?status=DRAFT", icon: FileTextIcon, desc: "Devis non finalisés", group: "Devis" },
  { id: "paid-quotes", label: "Payés", href: "/quotes?status=PAID", icon: CheckCircleIcon, desc: "Devis encaissés", group: "Devis" },
  // Groupe CLIENTS
  { id: "new-client", label: "Nouveau client", href: "/clients", icon: UsersThreeIcon, desc: "Ajouter un client", group: "Clients" },
  { id: "all-clients", label: "Tous les clients", href: "/clients", icon: UsersThreeIcon, desc: "Répertoire complet", group: "Clients" },
  { id: "active-clients", label: "Actifs", href: "/clients?filter=active", icon: CheckCircleIcon, desc: "Avec activité récente", group: "Clients" },
  { id: "inactive-clients", label: "Inactifs", href: "/clients?filter=inactive", icon: ClockUserIcon, desc: "Sans devis depuis 90j", group: "Clients" },
];

// Status badges pour les devis récents — aligné sur DESIGN_SYSTEM.md §6
const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Brouillon",  color: "text-amber-700",  bg: "bg-amber-100" },
  SENT: { label: "Envoyé",     color: "text-blue-700",    bg: "bg-blue-100" },
  ACCEPTED: { label: "Accepté", color: "text-indigo-700", bg: "bg-indigo-100" },
  REJECTED: { label: "Refusé",  color: "text-rose-700",   bg: "bg-rose-100" },
  PAID: { label: "Payé",       color: "text-emerald-700", bg: "bg-emerald-100" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

interface SpatialStatusBarProps {
  isDemoMode?: boolean;
}

export function SpatialStatusBar({ isDemoMode = false }: SpatialStatusBarProps) {
  const { stats } = useSafeQuotes();

  // Search / Command palette state
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState("");
  const paletteInputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  // 3 popovers de notification indépendants
  const [isRappelsOpen, setIsRappelsOpen] = useState(false);
  const [isAlertesOpen, setIsAlertesOpen] = useState(false);
  const [isActiviteOpen, setIsActiviteOpen] = useState(false);

  // Reminders
  const { reminders, totalCount: reminderCount, isLoading: isRemindersLoading } = useReminders();

  // Recent quotes — remonté ici pour éviter de refetcher à chaque ouverture de la palette
  const [recentQuotes, setRecentQuotes] = useState<RecentQuoteItem[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(true);
  const recentQuotesLoadedRef = useRef(false);

  useEffect(() => {
    if (recentQuotesLoadedRef.current) return;
    recentQuotesLoadedRef.current = true;
    let cancelled = false;
    getRecentQuotesAction(6).then((result) => {
      if (!cancelled) {
        setRecentQuotes(result.data ?? []);
        setIsLoadingQuotes(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Focus search when palette opens
  useEffect(() => {
    if (isPaletteOpen && paletteInputRef.current) {
      paletteInputRef.current.focus();
    }
  }, [isPaletteOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsPaletteOpen(true);
        setIsRappelsOpen(false);
        setIsAlertesOpen(false);
        setIsActiviteOpen(false);
      }
      if (e.key === "Escape") {
        setIsPaletteOpen(false);
        setPaletteSearch("");
        setIsRappelsOpen(false);
        setIsAlertesOpen(false);
        setIsActiviteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close palette on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        const isTrigger = (e.target as HTMLElement).closest("[data-palette-trigger]");
        if (!isTrigger) {
          setIsPaletteOpen(false);
          setPaletteSearch("");
        }
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const openPalette = useCallback(() => {
    setIsPaletteOpen(true);
    setIsRappelsOpen(false);
    setIsAlertesOpen(false);
    setIsActiviteOpen(false);
  }, []);

  // Toggle helpers : ouvre un popover, ferme les autres
  const toggleRappels = useCallback(() => {
    setIsRappelsOpen((v) => !v);
    setIsAlertesOpen(false);
    setIsActiviteOpen(false);
    setIsPaletteOpen(false);
  }, []);

  const toggleAlertes = useCallback(() => {
    setIsAlertesOpen((v) => !v);
    setIsRappelsOpen(false);
    setIsActiviteOpen(false);
    setIsPaletteOpen(false);
  }, []);

  const toggleActivite = useCallback(() => {
    setIsActiviteOpen((v) => !v);
    setIsRappelsOpen(false);
    setIsAlertesOpen(false);
    setIsPaletteOpen(false);
  }, []);

  // Profil utilisateur / Déconnexion
  const { user } = useUser();
  const { signOut } = useClerk();

  // Métriques
  const pipelineValue = stats.totalPipelineValue || 0;
  const cashCollected = stats.totalCashCollected || 0;
  const conversionRate = stats.conversionRate || 0;
  const draftCount = stats.countByStatus?.DRAFT || 0;
  const sentCount = stats.countByStatus?.SENT || 0;
  const totalAlerts = sentCount + draftCount;

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 h-10 bg-white/80 backdrop-blur-md border-b border-slate-200 grid grid-cols-3 items-center select-none"
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ═══ GAUCHE : Logo + KPI compacts ═══ */}
      <div className="flex items-center gap-1 pl-2 h-full">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-12 h-full hover:bg-slate-100 transition-colors rounded shrink-0"
        >
          <Logo variant="icon" className="h-4 w-4 text-slate-700" />
        </Link>
      </div>

      {/* ═══ CENTRE : Barre de recherche (ouvre la palette) ═══ */}
      <div className="flex items-center justify-center h-full px-3">
        <button
          data-palette-trigger
          onClick={openPalette}
          className="flex items-center gap-2 px-2.5 py-1 w-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md border border-slate-200 hover:border-slate-400 transition-all"
        >
          <MagnifyingGlassIcon
            size={DS_ICON_SM}
            weight="bold"
            className="shrink-0"
          />
          <span className="text-[10px] truncate flex-1 text-left font-medium">
            Rechercher client, devis...
          </span>
          <kbd className="text-[8px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* ═══ DROITE : Boutons notifications ═══ */}
      <div className="flex justify-end items-center gap-x-2 pr-1">
        {/* Bouton Rappels */}
        <div className="relative">
          <button
            onClick={toggleRappels}
            className={cn(
              "relative flex items-center justify-between px-3 h-7 w-24 rounded-md transition-all",
              isRappelsOpen
                ? "text-indigo-700 bg-indigo-50 border border-indigo-300"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200"
            )}
            title="Rappels"
          >
            <span className="relative">
              <BellRingingIcon
                size={DS_ICON_SM}
                weight={isRappelsOpen || reminderCount > 0 ? "fill" : "regular"}
              />
              {reminderCount > 0 && (
                <span className="absolute -top-2 -right-2 w-3 h-3 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {reminderCount > 9 ? "9+" : reminderCount}
                </span>
              )}
            </span>
            <span className={DS_LABEL}>Rappels</span>
          </button>
          {isRappelsOpen && (
            <RappelsPopover
              reminders={reminders}
              isLoading={isRemindersLoading}
              onClose={() => setIsRappelsOpen(false)}
            />
          )}
        </div>

        {/* Bouton Alertes */}
        <div className="relative">
          <button
            onClick={toggleAlertes}
            className={cn(
              "relative flex items-center justify-between px-3 h-7 w-24 rounded-md transition-all",
              isAlertesOpen
                ? "text-amber-700 bg-amber-50 border border-amber-300"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200"
            )}
            title="Alertes"
          >
            <span className="relative">
              <WarningCircleIcon
                size={DS_ICON_SM}
                weight={isAlertesOpen || totalAlerts > 0 ? "fill" : "regular"}
              />
              {totalAlerts > 0 && (
                <span className="absolute -top-2 -right-2 w-3 h-3 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {totalAlerts > 9 ? "9+" : totalAlerts}
                </span>
              )}
            </span>
            <span className={DS_LABEL}>Alertes</span>
          </button>
          {isAlertesOpen && (
            <AlertesPopover
              sentCount={sentCount}
              draftCount={draftCount}
              onClose={() => setIsAlertesOpen(false)}
            />
          )}
        </div>

        {/* Bouton Activité */}
        <div className="relative">
          <button
            onClick={toggleActivite}
            className={cn(
              "relative flex items-center justify-between px-3 h-7 w-24 rounded-md transition-all",
              isActiviteOpen
                ? "text-emerald-700 bg-emerald-50 border border-emerald-300"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200"
            )}
            title="Activité"
          >
            <ActivityIcon
              size={DS_ICON_SM}
              weight={isActiviteOpen ? "fill" : "regular"}
            />
            <span className={DS_LABEL}>Activité</span>
          </button>
          {isActiviteOpen && (
            <ActivitePopover onClose={() => setIsActiviteOpen(false)} />
          )}
        </div>

        {/* Séparateur vertical */}
        <div className="w-px h-5 bg-slate-200 mx-1.5" />

        {isDemoMode ? (
          /* ── MODE DÉMO : badge Invité + CTA S'inscrire ── */
          <>
            <span className="flex items-center gap-1 px-2 h-7 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700">
              <UserCircleIcon size={12} weight="fill" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                Invité / Démo
              </span>
            </span>
            <Link
              href="/sign-up"
              className="flex items-center justify-center px-2.5 h-7 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-[9px] font-mono font-bold uppercase tracking-wider transition-all"
            >
              {"S'inscrire"}
            </Link>
          </>
        ) : (
          /* ── MODE NORMAL : Profil utilisateur / Déconnexion ── */
          <button
            onClick={() => signOut()}
            className="flex items-center justify-center w-7 h-7 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
            title="Déconnexion"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-200">
              <Avatar className="w-full h-full">
                <AvatarImage src={user?.imageUrl} className="object-cover" />
                <AvatarFallback className="bg-slate-100 text-slate-500 text-[7px] font-bold">
                  {user?.firstName?.charAt(0) ||
                    user?.emailAddresses[0]?.emailAddress?.charAt(0) ||
                    "?"}
                </AvatarFallback>
              </Avatar>
            </div>
          </button>
        )}
      </div>

      {/* ═══ COMMAND PALETTE ═══ */}
      <AnimatePresence>
        {isPaletteOpen && (
          <SearchCommandPalette
            ref={paletteRef}
            search={paletteSearch}
            onSearchChange={setPaletteSearch}
            onClose={() => {
              setIsPaletteOpen(false);
              setPaletteSearch("");
            }}
            inputRef={paletteInputRef}
            recentQuotes={recentQuotes}
            isLoadingQuotes={isLoadingQuotes}
          />
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMAND PALETTE — Recherche + Actions (2 groupes) + Devis récents
// ═══════════════════════════════════════════════════════════════════════════════

interface SearchCommandPaletteProps {
  search: string;
  onSearchChange: (v: string) => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  recentQuotes: RecentQuoteItem[];
  isLoadingQuotes: boolean;
}

const SearchCommandPalette = React.forwardRef<HTMLDivElement, SearchCommandPaletteProps>(
  function SearchCommandPalette({ search, onSearchChange, onClose, inputRef, recentQuotes, isLoadingQuotes }, ref) {
    const router = useRouter();
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Actions filtrées selon la recherche
    const filteredActions = useMemo(() => {
      if (!search.trim()) return PALETTE_ACTIONS;
      const q = search.toLowerCase();
      return PALETTE_ACTIONS.filter(
        (a) =>
          a.label.toLowerCase().includes(q) ||
          a.desc?.toLowerCase().includes(q) ||
          a.group.toLowerCase().includes(q),
      );
    }, [search]);

    // Devis récents filtrés selon la recherche
    const filteredRecentQuotes = useMemo(() => {
      if (!search.trim()) return recentQuotes;
      const q = search.toLowerCase();
      return recentQuotes.filter(
        (qt) =>
          qt.clientName?.toLowerCase().includes(q) ||
          qt.number?.toLowerCase().includes(q) ||
          qt.title?.toLowerCase().includes(q),
      );
    }, [recentQuotes, search]);

    // Actions groupées
    const actionsByGroup = useMemo(() => {
      const groups = new Map<string, PaletteAction[]>();
      for (const action of filteredActions) {
        if (!groups.has(action.group)) groups.set(action.group, []);
        groups.get(action.group)!.push(action);
      }
      return Array.from(groups.entries());
    }, [filteredActions]);

    // Flat list pour la navigation clavier
    const flatItems = useMemo(() => {
      const items: { type: "action" | "quote"; id: string }[] = [];
      for (const [, actions] of actionsByGroup) {
        for (const a of actions) items.push({ type: "action", id: a.id });
      }
      for (const q of filteredRecentQuotes) items.push({ type: "quote", id: q.id });
      return items;
    }, [actionsByGroup, filteredRecentQuotes]);

    // Navigation clavier
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && flatItems[selectedIndex]) {
          e.preventDefault();
          const item = flatItems[selectedIndex];
          if (item.type === "action") {
            const action = filteredActions.find((a) => a.id === item.id);
            if (action) router.push(action.href);
          } else {
            router.push(`/quotes/${item.id}`);
          }
          onClose();
        }
      },
      [flatItems, selectedIndex, filteredActions, router, onClose],
    );

    const hasActions = filteredActions.length > 0;
    const hasQuotes = filteredRecentQuotes.length > 0;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
        className="fixed top-14 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg bg-white border border-slate-200 rounded-lg overflow-hidden"
      >
        {/* Barre de recherche */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-200">
          <MagnifyingGlassIcon size={DS_ICON_SM} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un client, un devis..."
            className="flex-1 bg-transparent font-mono text-[10px] text-slate-800 placeholder:text-slate-400 outline-none min-w-0"
          />
          <kbd className="text-[8px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Contenu */}
        <div className="max-h-[340px] overflow-y-auto">
          {/* Sections Actions par groupe */}
          {actionsByGroup.map(([group, actions], groupIdx) => (
            <div key={group}>
              {groupIdx > 0 && <div className="border-t border-slate-200 mx-3" />}
              <div className="px-3 pt-2 pb-1">
                <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  {group}
                </span>
              </div>
              <div className={groupIdx === actionsByGroup.length - 1 ? "pb-1" : ""}>
                {actions.map((action) => {
                  const globalIdx = flatItems.findIndex((f) => f.id === action.id);
                  const isSelected = globalIdx === selectedIndex;
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.id}
                      href={action.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 transition-colors",
                        isSelected ? "bg-indigo-50" : "hover:bg-slate-50",
                      )}
                    >
                      <div
                        className={cn(
                          "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                          isSelected ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500",
                        )}
                      >
                        <Icon size={DS_ICON_SM} weight={isSelected ? "fill" : "regular"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "font-mono text-[10px] font-bold truncate",
                            isSelected ? "text-indigo-800" : "text-slate-800",
                          )}
                        >
                          {action.label}
                        </p>
                        {action.desc && (
                          <p className="text-[8px] font-medium text-slate-500 truncate">
                            {action.desc}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Separator entre actions et devis récents */}
          {hasActions && hasQuotes && (
            <div className="border-t border-slate-200 mx-3" />
          )}

          {/* Section Devis récents */}
          {hasQuotes && (
            <div>
              <div className="px-3 pt-2 pb-1">
                <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Devis récents
                </span>
              </div>
              <div className="pb-2">
                {filteredRecentQuotes.map((quote) => {
                  const globalIdx = flatItems.findIndex((f) => f.id === quote.id);
                  const isSelected = globalIdx === selectedIndex;
                  const badge = STATUS_BADGE[quote.status] || STATUS_BADGE.DRAFT;
                  return (
                    <Link
                      key={quote.id}
                      href={`/quotes/${quote.id}`}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 transition-colors",
                        isSelected ? "bg-indigo-50" : "hover:bg-slate-50",
                      )}
                    >
                      <div
                        className={cn(
                          "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                          isSelected ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500",
                        )}
                      >
                        <FileTextIcon size={DS_ICON_SM} weight={isSelected ? "fill" : "regular"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "font-mono text-[10px] font-bold truncate",
                            isSelected ? "text-indigo-800" : "text-slate-800",
                          )}
                        >
                          {quote.clientName}
                        </p>
                        <p className="text-[8px] font-medium text-slate-500 truncate">
                          {quote.number}
                          {quote.title ? ` — ${quote.title}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[8px] font-bold font-mono",
                          badge.bg,
                          badge.color,
                        )}>
                          {badge.label}
                        </span>
                        <span className={cn("tabular-nums", DS_MONO, "text-slate-700 font-extrabold")}>
                          {formatCurrency(quote.amount)}
                        </span>
                        <span className="text-[7px] font-mono text-slate-400">
                          {formatRelativeTime(quote.createdAt)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoadingQuotes && !hasActions && (
            <div className="py-10 text-center">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className={DS_MONO}>Chargement...</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoadingQuotes && !hasActions && !hasQuotes && (
            <div className="py-10 text-center">
              <MagnifyingGlassIcon size={20} className="text-slate-200 mx-auto mb-2" weight="duotone" />
              <p className={cn(DS_MONO, "text-slate-400 italic")}>
                Aucun résultat pour &ldquo;{search}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200 bg-slate-50">
          <span className="text-[8px] font-mono text-slate-400">
            {flatItems.length > 0
              ? `${flatItems.length} résultat${flatItems.length > 1 ? "s" : ""}`
              : "Aucun résultat"}
          </span>
          <span className="text-[8px] font-mono text-slate-400">
            ↑↓ Naviguer · ↵ Ouvrir
          </span>
        </div>
      </motion.div>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════════════
// REMINDER TYPE CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const REMINDER_TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  NO_QUOTES_90D: {
    icon: WarningCircleIcon,
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
  SENT_NO_RESPONSE_14D: {
    icon: ClockUserIcon,
    color: "text-rose-700",
    bg: "bg-rose-50",
  },
  VIP_INACTIVE_30D: {
    icon: UsersThreeIcon,
    color: "text-indigo-700",
    bg: "bg-indigo-50",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// POPOVER RAPPELS
// ═══════════════════════════════════════════════════════════════════════════════

function RappelsPopover({
  reminders,
  isLoading,
  onClose,
}: {
  reminders: ReminderItem[];
  isLoading: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener("click", handleClick), 0);
    return () => document.removeEventListener("click", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={cn(DS_CARD, "absolute top-8 right-0 z-50 w-[320px] max-h-[400px] overflow-hidden")}
    >
      <div className="px-3 py-2.5 border-b border-slate-200 bg-white">
        <span className={DS_MONO}>Rappels</span>
      </div>
      <div className="overflow-y-auto max-h-[320px]">
        <RemindersTab reminders={reminders} isLoading={isLoading} onClose={onClose} />
      </div>
      <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200 bg-slate-50">
        <span className="text-[8px] font-mono text-slate-500">
          {reminders.length > 0
            ? `${reminders.length} action${reminders.length > 1 ? "s" : ""} recommandée${reminders.length > 1 ? "s" : ""}`
            : "Aucun rappel"}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// POPOVER ALERTES
// ═══════════════════════════════════════════════════════════════════════════════

function AlertesPopover({
  sentCount,
  draftCount,
  onClose,
}: {
  sentCount: number;
  draftCount: number;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const totalAlerts = sentCount + draftCount;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener("click", handleClick), 0);
    return () => document.removeEventListener("click", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={cn(DS_CARD, "absolute top-8 right-0 z-50 w-[320px] max-h-[400px] overflow-hidden")}
    >
      <div className="px-3 py-2.5 border-b border-slate-200 bg-white">
        <span className={DS_MONO}>Alertes</span>
      </div>
      <div className="overflow-y-auto max-h-[320px]">
        <AlertsTab sentCount={sentCount} draftCount={draftCount} onClose={onClose} />
      </div>
      <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200 bg-slate-50">
        <span className="text-[8px] font-mono text-slate-500">
          {totalAlerts > 0 ? `${totalAlerts} alerte${totalAlerts > 1 ? "s" : ""}` : "Aucune alerte"}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// POPOVER ACTIVITÉ
// ═══════════════════════════════════════════════════════════════════════════════

function ActivitePopover({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener("click", handleClick), 0);
    return () => document.removeEventListener("click", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={cn(DS_CARD, "absolute top-8 right-0 z-50 w-[320px] max-h-[400px] overflow-hidden")}
    >
      <div className="px-3 py-2.5 border-b border-slate-200 bg-white">
        <span className={DS_MONO}>Activité</span>
      </div>
      <div className="overflow-y-auto max-h-[320px]">
        <ActivityTab onClose={onClose} />
      </div>
      <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200 bg-slate-50">
        <span className="text-[8px] font-mono text-slate-500">Dernière activité</span>
      </div>
    </div>
  );
}

// ═══ Onglet Rappels ═══

function RemindersTab({
  reminders,
  isLoading,
  onClose,
}: {
  reminders: ReminderItem[];
  isLoading: boolean;
  onClose: () => void;
}) {
  if (isLoading && reminders.length === 0) {
    return (
      <div className="py-10 text-center">
        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className={DS_MONO}>Analyse en cours...</p>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="py-10 text-center">
        <BellRingingIcon size={20} className="text-slate-200 mx-auto mb-2" weight="duotone" />
        <p className={cn(DS_MONO, "text-slate-400 italic")}>Aucun rappel</p>
        <p className={cn(DS_MONO, "text-slate-400 mt-0.5")}>Tout est à jour !</p>
      </div>
    );
  }

  return (
    <div>
      {reminders.map((reminder) => {
        const config = REMINDER_TYPE_CONFIG[reminder.type] || {
          icon: BellRingingIcon,
          color: "text-slate-700",
          bg: "bg-slate-50",
        };
        const Icon = config.icon;
        const actionHref =
          reminder.type === "NO_QUOTES_90D"
            ? `/quotes/new?clientId=${reminder.clientId}`
            : reminder.quoteId
              ? `/quotes/${reminder.quoteId}`
              : `/clients`;

        return (
          <div
            key={reminder.id}
            className="px-3 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
          >
            <div className="flex items-start gap-2.5">
              <div className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5", config.bg)}>
                <Icon size={DS_ICON_SM} className={config.color} weight="bold" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn(DS_MONO, "font-bold text-slate-800 truncate")}>
                    {reminder.clientName}
                  </p>
                  <span className="text-[8px] font-mono text-slate-500 shrink-0">
                    J-{reminder.daysSinceLastAction}
                  </span>
                </div>
                <p className="text-[8px] font-mono text-slate-600 mt-0.5">
                  {reminder.label}
                </p>
                <Link
                  href={actionHref}
                  onClick={onClose}
                  className={cn(
                    "inline-flex items-center gap-1 mt-1.5 text-[8px] font-bold",
                    config.color,
                    "hover:underline",
                  )}
                >
                  {reminder.actionLabel}
                  <ArrowRightIcon size={9} weight="bold" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══ Onglet Alertes ═══

function AlertsTab({
  sentCount,
  draftCount,
  onClose,
}: {
  sentCount: number;
  draftCount: number;
  onClose: () => void;
}) {
  const alerts: { icon: React.ElementType; color: string; bg: string; title: string; desc: string; href: string }[] = [];

  if (sentCount > 0) {
    alerts.push({
      icon: ClockUserIcon,
      color: "text-amber-700",
      bg: "bg-amber-50",
      title: `${sentCount} devis envoyé${sentCount > 1 ? "s" : ""} en attente`,
      desc: sentCount > 1 ? "Ces devis n'ont pas encore reçu de réponse" : "Ce devis n'a pas encore reçu de réponse",
      href: "/quotes?status=SENT",
    });
  }

  if (draftCount > 0) {
    alerts.push({
      icon: FileTextIcon,
      color: "text-rose-700",
      bg: "bg-rose-50",
      title: `${draftCount} brouillon${draftCount > 1 ? "s" : ""} à finaliser`,
      desc: draftCount > 1 ? "Ces devis sont en attente de finalisation" : "Ce devis est en attente de finalisation",
      href: "/quotes?status=DRAFT",
    });
  }

  if (alerts.length === 0) {
    return (
      <div className="py-10 text-center">
        <CheckCircleIcon size={20} className="text-slate-200 mx-auto mb-2" weight="duotone" />
        <p className={cn(DS_MONO, "text-slate-400 italic")}>Aucune alerte</p>
        <p className={cn(DS_MONO, "text-slate-400 mt-0.5")}>Tout est sous contrôle</p>
      </div>
    );
  }

  return (
    <div>
      {alerts.map((alert, i) => {
        const Icon = alert.icon;
        return (
          <Link
            key={i}
            href={alert.href}
            onClick={onClose}
            className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
          >
            <div className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5", alert.bg)}>
              <Icon size={DS_ICON_SM} className={alert.color} weight="bold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(DS_MONO, "font-bold text-slate-800")}>
                {alert.title}
              </p>
              <p className="text-[8px] font-mono text-slate-600 mt-0.5">
                {alert.desc}
              </p>
            </div>
            <ArrowRightIcon size={11} className="text-slate-400 shrink-0 mt-1" />
          </Link>
        );
      })}
    </div>
  );
}

// ═══ Onglet Activité ═══

function ActivityTab({ onClose }: { onClose: () => void }) {
  const { stats } = useSafeQuotes();

  const activities: { icon: React.ElementType; color: string; bg: string; title: string; desc: string; href: string }[] = [];

  if (stats.totalCashCollected > 0) {
    activities.push({
      icon: CheckCircleIcon,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      title: `${formatCurrency(stats.totalCashCollected)} encaissé${stats.countByStatus.PAID > 1 ? "s" : ""}`,
      desc: `${stats.countByStatus.PAID} devis payé${stats.countByStatus.PAID > 1 ? "s" : ""}`,
      href: "/quotes?status=PAID",
    });
  }

  if (stats.totalPipelineValue > 0) {
    activities.push({
      icon: TrendUpIcon,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      title: `${formatCurrency(stats.totalPipelineValue)} dans le pipeline`,
      desc: `${stats.countByStatus.SENT} devis envoyé${stats.countByStatus.SENT > 1 ? "s" : ""}`,
      href: "/quotes?status=SENT",
    });
  }

  if (stats.conversionRate > 0) {
    activities.push({
      icon: TrendUpIcon,
      color: "text-amber-700",
      bg: "bg-amber-50",
      title: `Taux de conversion : ${Math.round(stats.conversionRate)}%`,
      desc: "Devis envoyés → payés",
      href: "/dashboard",
    });
  }

  if (activities.length === 0) {
    return (
      <div className="py-10 text-center">
        <ActivityIcon size={20} className="text-slate-200 mx-auto mb-2" weight="duotone" />
        <p className={cn(DS_MONO, "text-slate-400 italic")}>Aucune activité récente</p>
        <p className={cn(DS_MONO, "text-slate-400 mt-0.5")}>Créez votre premier devis</p>
      </div>
    );
  }

  return (
    <div>
      {activities.map((act, i) => {
        const Icon = act.icon;
        return (
          <Link
            key={i}
            href={act.href}
            onClick={onClose}
            className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
          >
            <div className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5", act.bg)}>
              <Icon size={DS_ICON_SM} className={act.color} weight="bold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(DS_MONO, "font-bold text-slate-800")}>
                {act.title}
              </p>
              <p className="text-[8px] font-mono text-slate-600 mt-0.5">
                {act.desc}
              </p>
            </div>
            <ArrowRightIcon size={11} className="text-slate-400 shrink-0 mt-1" />
          </Link>
        );
      })}
    </div>
  );
}