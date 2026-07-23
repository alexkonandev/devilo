"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useTransition,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  QuoteRegistryItem,
  QuoteRegistryStats,
  QuoteContextType,
  QuoteStatus,
  QuoteTimelineEvent,
  DateRange,
} from "@/types/quote-registry";
import {
  updateQuoteStatusAction,
  deleteQuoteAction,
  deleteQuotesAction,
  getQuotesAction,
  getQuoteTimelineAction,
} from "@/actions/quote-registry-action";
import { notify } from "@/lib/notifications";
import { computeTotalHT } from "@/lib/utils";

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({
  children,
  initialQuotes,
}: {
  children: React.ReactNode;
  initialQuotes: QuoteRegistryItem[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Utilisation de startTransition pour les rafraîchissements lourds
  const [isPending, startTransition] = useTransition();

  const [quotes, setQuotes] = useState<QuoteRegistryItem[]>(initialQuotes);

  // ─── Filtres de base ───
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [activeStatus, setActiveStatus] = useState<QuoteStatus | "ALL">(
    (searchParams.get("status") as QuoteStatus | "ALL") || "ALL"
  );

  // ─── Filtres avancés (déplacés depuis SpatialQuotesView — Phase 3.2) ───
  const [dateRange, setDateRange] = useState<DateRange>(
    searchParams.get("dateRange") as DateRange || null
  );
  const [customStartDate, setCustomStartDate] = useState<string | null>(
    searchParams.get("customStart") ?? null
  );
  const [customEndDate, setCustomEndDate] = useState<string | null>(
    searchParams.get("customEnd") ?? null
  );
  const [amountMin, setAmountMin] = useState(searchParams.get("amountMin") ?? "");
  const [amountMax, setAmountMax] = useState(searchParams.get("amountMax") ?? "");
  const [highlightThreshold, setHighlightThreshold] = useState<number | null>(
    searchParams.get("highlight")
      ? parseFloat(searchParams.get("highlight")!)
      : null
  );

  // ─── Master-Detail ───
  // Initialisation : si des devis existent, sélectionner automatiquement le premier
  // (le plus récent dans la liste) pour éviter l'affichage "Aucune sélection" dans la sidebar
  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(
    initialQuotes.length > 0 ? initialQuotes[0].id : null
  );
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<Set<string>>(new Set());
  const [timeline, setTimeline] = useState<QuoteTimelineEvent[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  // ─── Synchronisation URL (Phase 3.3) ───
  const syncUrl = useCallback(
    (params: Record<string, string | null>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === "") {
          sp.delete(key);
        } else {
          sp.set(key, value);
        }
      }
      const newUrl = sp.toString() ? `?${sp.toString()}` : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    },
    [router, searchParams],
  );

  // ─── Wrappers setters qui synchronisent l'URL ───
  const handleSetSearchQuery = useCallback(
    (q: string) => {
      setSearchQuery(q);
      syncUrl({ q: q || null });
    },
    [syncUrl],
  );

  const handleSetActiveStatus = useCallback(
    (s: QuoteStatus | "ALL") => {
      setActiveStatus(s);
      syncUrl({ status: s === "ALL" ? null : s });
    },
    [syncUrl],
  );

  const handleSetDateRange = useCallback(
    (v: DateRange) => {
      setDateRange(v);
      syncUrl({ dateRange: v });
    },
    [syncUrl],
  );

  const handleSetCustomStartDate = useCallback(
    (v: string | null) => {
      setCustomStartDate(v);
      syncUrl({ customStart: v });
    },
    [syncUrl],
  );

  const handleSetCustomEndDate = useCallback(
    (v: string | null) => {
      setCustomEndDate(v);
      syncUrl({ customEnd: v });
    },
    [syncUrl],
  );

  const handleSetAmountMin = useCallback(
    (v: string) => {
      setAmountMin(v);
      syncUrl({ amountMin: v || null });
    },
    [syncUrl],
  );

  const handleSetAmountMax = useCallback(
    (v: string) => {
      setAmountMax(v);
      syncUrl({ amountMax: v || null });
    },
    [syncUrl],
  );

  const handleSetHighlightThreshold = useCallback(
    (v: number | null) => {
      setHighlightThreshold(v);
      syncUrl({ highlight: v !== null ? String(v) : null });
    },
    [syncUrl],
  );

  // ─── Constantes i18n pour le smart search ───
  const SEARCH_KEYWORDS = {
    lastMonth: [
      "dernier mois", "last month", "le mois dernier",
      "ce mois-ci", "this month", "ce mois",
    ],
    lastWeek: [
      "dernière semaine", "last week", "cette semaine",
      "this week", "cette semaine-ci",
    ],
  };

  // ─── Filtrage global combiné : statut × texte × smart search × date × montant ───
  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const totalHT = computeTotalHT(q);

      // ── Filtre statut ──
      if (activeStatus !== "ALL" && q.status !== activeStatus) return false;

      // ── Recherche texte standard + smart search ──
      const qLower = searchQuery.toLowerCase();
      let matchSearch =
        !searchQuery ||
        q.number.toLowerCase().includes(qLower) ||
        q.client.name.toLowerCase().includes(qLower) ||
        q.lines.some(
          (ln) =>
            ln.title.toLowerCase().includes(qLower) ||
            ln.subtitle.toLowerCase().includes(qLower) ||
            ln.unitPrice.toString().includes(qLower) ||
            ln.quantity.toString().includes(qLower),
        );

      // Smart filtering: plage de prix (ex: >5000, <10000, 5000-10000)
      const priceMatch = searchQuery.match(/(>|<|>=|<=)?\s*(\d+)/);
      if (priceMatch) {
        const operator = priceMatch[1] || "=";
        const value = parseInt(priceMatch[2], 10);
        switch (operator) {
          case ">":
            matchSearch = matchSearch || totalHT > value;
            break;
          case ">=":
            matchSearch = matchSearch || totalHT >= value;
            break;
          case "<":
            matchSearch = matchSearch || totalHT < value;
            break;
          case "<=":
            matchSearch = matchSearch || totalHT <= value;
            break;
          default:
            matchSearch = matchSearch || totalHT === value;
            break;
        }
      }

      // Smart filtering: plage de dates (i18n fr + en)
      const quoteDate = new Date(q.createdAt);
      const now = new Date();

      const isLastMonthQuery = SEARCH_KEYWORDS.lastMonth.some(
        (kw) => qLower.includes(kw)
      );
      if (isLastMonthQuery) {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        matchSearch = matchSearch || quoteDate >= startOfMonth;
      }

      const isLastWeekQuery = SEARCH_KEYWORDS.lastWeek.some(
        (kw) => qLower.includes(kw)
      );
      if (isLastWeekQuery) {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchSearch = matchSearch || quoteDate >= weekAgo;
      }

      if (searchQuery.match(/^\d{4}[-/]\d{2}$/)) {
        const [year, month] = searchQuery.split(/[-/]/);
        const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
        const monthEnd = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
        matchSearch = matchSearch || (quoteDate >= monthStart && quoteDate <= monthEnd);
      }

      if (!matchSearch) return false;

      // ── Filtre date (local) ──
      if (dateRange) {
        let dateStart: Date | null = null;
        let dateEnd: Date | null = null;

        switch (dateRange) {
          case "7d":
            dateStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "30d":
            dateStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            dateStart = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "custom":
            if (customStartDate) dateStart = new Date(customStartDate);
            if (customEndDate) {
              dateEnd = new Date(customEndDate);
              dateEnd.setHours(23, 59, 59, 999);
            }
            break;
        }

        if (dateStart && quoteDate < dateStart) return false;
        if (dateEnd && quoteDate > dateEnd) return false;
      }

      // ── Filtre montant ──
      if (amountMin !== "") {
        const min = parseFloat(amountMin);
        if (!isNaN(min) && totalHT < min) return false;
      }
      if (amountMax !== "") {
        const max = parseFloat(amountMax);
        if (!isNaN(max) && totalHT > max) return false;
      }

      return true;
    });
  }, [quotes, searchQuery, activeStatus, dateRange, customStartDate, customEndDate, amountMin, amountMax]);

  const stats = useMemo<QuoteRegistryStats>(() => {
    const counts: Record<QuoteStatus | "ALL", number> = {
      ALL: quotes.length,
      DRAFT: 0,
      SENT: 0,
      PAID: 0,
      REJECTED: 0,
      ACCEPTED: 0,
      CANCELLED: 0,
    };

    let pipeline = 0;
    let outstanding = 0;
    let collected = 0;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dailyActivity = new Map<string, number>();

    quotes.forEach((q) => {
      counts[q.status]++;
      const totalHT = computeTotalHT(q);

      if (q.status === "CANCELLED") return;
      if (q.status === "SENT") pipeline += totalHT;
      if (["DRAFT", "SENT"].includes(q.status)) outstanding += totalHT;
      if (q.status === "PAID") collected += totalHT;

      const quoteDate = new Date(q.createdAt);
      if (quoteDate >= thirtyDaysAgo) {
        const dateKey = quoteDate.toISOString().split("T")[0];
        dailyActivity.set(dateKey, (dailyActivity.get(dateKey) || 0) + 1);
      }
    });

    const sentCount = counts["SENT"] + counts["PAID"] + counts["REJECTED"];
    const conversionRate = sentCount > 0 ? (counts["PAID"] / sentCount) * 100 : 0;

    return {
      totalPipelineValue: pipeline,
      totalOutstandingValue: outstanding,
      totalCashCollected: collected,
      conversionRate,
      countByStatus: counts,
      dailyActivity,
    };
  }, [quotes]);

  const hasActiveFilters = dateRange !== null || amountMin !== "" || amountMax !== "";

  // ─── Refresh ───
  const refresh = async () => {
    startTransition(async () => {
      const res = await getQuotesAction();
      if (res.success && res.data) setQuotes(res.data);
    });
  };

  // ─── Timeline ───
  const loadTimeline = useCallback(async (quoteId: string) => {
    setIsLoadingTimeline(true);
    const res = await getQuoteTimelineAction(quoteId);
    if (res.success && res.data) {
      setTimeline(res.data);
    }
    setIsLoadingTimeline(false);
  }, []);

  const refreshTimeline = useCallback(async () => {
    if (activeQuoteId) {
      await loadTimeline(activeQuoteId);
    }
  }, [activeQuoteId, loadTimeline]);

  // Charger la timeline au montage si un devis est déjà sélectionné
  // (cas de l'initialisation avec le premier devis de la liste)
  React.useEffect(() => {
    if (activeQuoteId) {
      loadTimeline(activeQuoteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Reset tous les filtres ───
  const resetFilters = useCallback(() => {
    setDateRange(null);
    setCustomStartDate(null);
    setCustomEndDate(null);
    setAmountMin("");
    setAmountMax("");
    setHighlightThreshold(null);
    // Reset URL
    router.replace(window.location.pathname, { scroll: false });
  }, [router]);

  // ─── Sélection ───
  const selectQuote = useCallback(
    (quoteId: string | null) => {
      setActiveQuoteId(quoteId);
      setSelectedQuoteIds(new Set());
      if (quoteId) {
        loadTimeline(quoteId);
      } else {
        setTimeline([]);
      }
    },
    [loadTimeline],
  );

  const toggleSelection = useCallback((quoteId: string) => {
    setSelectedQuoteIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(quoteId)) newSet.delete(quoteId);
      else newSet.add(quoteId);
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedQuoteIds(new Set(filteredQuotes.map((q) => q.id)));
  }, [filteredQuotes]);

  const clearSelection = useCallback(() => {
    setSelectedQuoteIds(new Set());
  }, []);

  // ─── Quick Status Switch ───
  const quickStatusChange = useCallback(
    async (id: string, newStatus: QuoteStatus) => {
      const previousQuotes = [...quotes];
      setQuotes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q)),
      );

      const res = await updateQuoteStatusAction(id, newStatus);
      if (!res.success) {
        setQuotes(previousQuotes);
        notify.error("ERREUR_SYSTÈME", "Impossible de mettre à jour le statut.");
      } else {
        notify.success("STATUT_MIS_À_JOUR", `Devis marqué comme ${newStatus}`);
        if (activeQuoteId === id) loadTimeline(id);
      }
    },
    [quotes, activeQuoteId, loadTimeline],
  );

  const updateStatus = async (id: string, status: QuoteStatus) => {
    const previousQuotes = [...quotes];
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));

    const res = await updateQuoteStatusAction(id, status);
    if (!res.success) {
      setQuotes(previousQuotes);
      notify.error("ERREUR_SYSTÈME", "Impossible de mettre à jour le statut.");
    } else {
      notify.success("STATUT_MIS_À_JOUR", `Le devis est maintenant marqué comme ${status}.`);
    }
  };

  const deleteQuote = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce devis ?")) return;

    const previousQuotes = [...quotes];
    setQuotes((prev) => prev.filter((q) => q.id !== id));

    const res = await deleteQuoteAction(id);
    if (!res.success) {
      setQuotes(previousQuotes);
      notify.error("ERREUR_SUPPRESSION", "Échec de la suppression.");
    } else {
      notify.success("DEVIS_SUPPRIMÉ", "L'entrée a été retirée du registre.");
    }
  };

  const deleteMultipleQuotes = async (ids: string[]) => {
    const previousQuotes = [...quotes];
    setQuotes((prev) => prev.filter((q) => !ids.includes(q.id)));
    setSelectedQuoteIds(new Set());

    const res = await deleteQuotesAction(ids);
    if (!res.success) {
      setQuotes(previousQuotes);
      notify.error("ERREUR_SUPPRESSION", "Échec de la suppression multiple.");
    } else {
      notify.success("DEVIS SUPPRIMÉS", `${ids.length} devis supprimés.`);
      if (activeQuoteId && ids.includes(activeQuoteId)) {
        setActiveQuoteId(null);
        setTimeline([]);
      }
    }
  };

  return (
    <QuoteContext.Provider
      value={{
        quotes,
        filteredQuotes,
        stats,
        isLoading: isPending,
        searchQuery,
        search: searchQuery,
        setSearchQuery: handleSetSearchQuery,
        setSearch: handleSetSearchQuery,
        activeStatus,
        setActiveStatus: handleSetActiveStatus,
        // Filtres avancés centralisés
        dateRange,
        customStartDate,
        customEndDate,
        amountMin,
        amountMax,
        highlightThreshold,
        setDateRange: handleSetDateRange,
        setCustomStartDate: handleSetCustomStartDate,
        setCustomEndDate: handleSetCustomEndDate,
        setAmountMin: handleSetAmountMin,
        setAmountMax: handleSetAmountMax,
        setHighlightThreshold: handleSetHighlightThreshold,
        resetFilters,
        hasActiveFilters,
        // Master-Detail
        activeQuoteId,
        selectedQuoteIds,
        timeline,
        isLoadingTimeline,
        selectQuote,
        toggleSelection,
        selectAll,
        clearSelection,
        loadTimeline,
        // Actions
        updateStatus,
        deleteQuote,
        deleteMultipleQuotes,
        refresh,
        quickStatusChange,
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
}

export const useQuotes = () => {
  const context = useContext(QuoteContext);
  if (!context)
    throw new Error("useQuotes must be used within a QuoteProvider");
  return context;
};