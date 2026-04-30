"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useTransition,
  useCallback,
} from "react";
import {
  QuoteRegistryItem,
  QuoteRegistryStats,
  QuoteContextType,
  QuoteStatus,
  QuoteTimelineEvent,
} from "@/types/quote-registry";
import {
  updateQuoteStatusAction,
  deleteQuoteAction,
  getQuotesAction,
  getQuoteTimelineAction,
} from "@/actions/quote-registry-action";
import { notify } from "@/lib/notifications";

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({
  children,
  initialQuotes,
}: {
  children: React.ReactNode;
  initialQuotes: QuoteRegistryItem[];
}) {
  // 1. Utilisation de startTransition pour les rafraîchissements lourds
  const [isPending, startTransition] = useTransition();

  const [quotes, setQuotes] = useState<QuoteRegistryItem[]>(initialQuotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<QuoteStatus | "ALL">("ALL");

  // NOUVEAU: Devis actif sélectionné (Master-Detail)
  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(null);

  // NOUVEAU: Multi-sélection pour export batch
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<Set<string>>(
    new Set(),
  );

  // NOUVEAU: Timeline du devis actif
  const [timeline, setTimeline] = useState<QuoteTimelineEvent[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  // NOUVEAU: Smart filtering avec support plage de prix et dates
  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const totalHT = q.lines.reduce(
        (acc, ln) => acc + ln.unitPrice * ln.quantity,
        0,
      );

      // Recherche texte standard
      let matchSearch =
        q.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.client.name.toLowerCase().includes(searchQuery.toLowerCase());

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

      // Smart filtering: plage de dates (ex: "2024-01", "jan", "dernier mois")
      if (
        searchQuery.toLowerCase().includes("dernier") ||
        searchQuery.match(/^\d{4}[-/]\d{2}$/)
      ) {
        const quoteDate = new Date(q.createdAt);
        const now = new Date();
        if (searchQuery.includes("dernier mois")) {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          matchSearch = matchSearch || quoteDate >= lastMonth;
        }
      }

      const matchStatus = activeStatus === "ALL" || q.status === activeStatus;
      return matchSearch && matchStatus;
    });
  }, [quotes, searchQuery, activeStatus]);

  const stats = useMemo<QuoteRegistryStats>(() => {
    // Correction de l'erreur ts(2741) : On inclut tous les statuts possibles de Prisma
    const counts: Record<QuoteStatus | "ALL", number> = {
      ALL: quotes.length,
      DRAFT: 0,
      SENT: 0,
      ACCEPTED: 0,
      PAID: 0,
      REJECTED: 0,
    };

    let pipeline = 0; // En-cours : SENT (Cash virtuel)
    let outstanding = 0; // En-cours total
    let collected = 0;

    // Pour le sparkline des 30 derniers jours
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dailyActivity = new Map<string, number>();

    quotes.forEach((q) => {
      counts[q.status]++;
      const totalHT = q.lines.reduce(
        (acc, ln) => acc + ln.unitPrice * ln.quantity,
        0,
      );

      // Logique financière : SENT = En-cours (Cash virtuel)
      if (q.status === "SENT") pipeline += totalHT;
      if (["DRAFT", "SENT", "ACCEPTED"].includes(q.status))
        outstanding += totalHT;
      if (q.status === "PAID") collected += totalHT;

      // Activité pour sparkline
      const quoteDate = new Date(q.createdAt);
      if (quoteDate >= thirtyDaysAgo) {
        const dateKey = quoteDate.toISOString().split("T")[0];
        dailyActivity.set(dateKey, (dailyActivity.get(dateKey) || 0) + 1);
      }
    });

    const sentCount =
      counts["SENT"] + counts["ACCEPTED"] + counts["PAID"] + counts["REJECTED"];
    const conversionRate =
      sentCount > 0 ? (counts["PAID"] / sentCount) * 100 : 0;

    return {
      totalPipelineValue: pipeline,
      totalOutstandingValue: outstanding,
      totalCashCollected: collected,
      conversionRate,
      countByStatus: counts,
      dailyActivity,
    };
  }, [quotes]);

  // Utilisation de startTransition pour le refresh (non-bloquant pour l'UI)
  const refresh = async () => {
    startTransition(async () => {
      const res = await getQuotesAction();
      if (res.success && res.data) setQuotes(res.data);
    });
  };

  // NOUVEAU: Charger la timeline du devis actif
  const loadTimeline = useCallback(async (quoteId: string) => {
    setIsLoadingTimeline(true);
    const res = await getQuoteTimelineAction(quoteId);
    if (res.success && res.data) {
      setTimeline(res.data);
    }
    setIsLoadingTimeline(false);
  }, []);

  // NOUVEAU: Sélectionner un devis (active)
  const selectQuote = useCallback(
    (quoteId: string | null) => {
      setActiveQuoteId(quoteId);
      if (quoteId) {
        loadTimeline(quoteId);
      } else {
        setTimeline([]);
      }
    },
    [loadTimeline],
  );

  // NOUVEAU: Toggle multi-sélection
  const toggleSelection = useCallback((quoteId: string) => {
    setSelectedQuoteIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(quoteId)) {
        newSet.delete(quoteId);
      } else {
        newSet.add(quoteId);
      }
      return newSet;
    });
  }, []);

  // NOUVEAU: Sélectionner tous les devis filtrés
  const selectAll = useCallback(() => {
    setSelectedQuoteIds(new Set(filteredQuotes.map((q) => q.id)));
  }, [filteredQuotes]);

  // NOUVEAU: Désélectionner tout
  const clearSelection = useCallback(() => {
    setSelectedQuoteIds(new Set());
  }, []);

  // NOUVEAU: Quick Status Switch avec transition fluide
  const quickStatusChange = useCallback(
    async (id: string, newStatus: QuoteStatus) => {
      const previousQuotes = [...quotes];
      // Optimistic update
      setQuotes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q)),
      );

      const res = await updateQuoteStatusAction(id, newStatus);
      if (!res.success) {
        setQuotes(previousQuotes);
        notify.error(
          "ERREUR_SYSTÈME",
          "Impossible de mettre à jour le statut.",
        );
      } else {
        notify.success("STATUT_MIS_À_JOUR", `Devis marqué comme ${newStatus}`);
        // Recharger la timeline si c'est le devis actif
        if (activeQuoteId === id) {
          loadTimeline(id);
        }
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
      notify.success(
        "STATUT_MIS_À_JOUR",
        `Le devis est maintenant marqué comme ${status}.`,
      );
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

  return (
    <QuoteContext.Provider
      value={{
        quotes,
        filteredQuotes,
        stats,
        isLoading: isPending,
        searchQuery,
        search: searchQuery, // Alias pour compatibilité
        setSearchQuery,
        setSearch: setSearchQuery, // Alias pour compatibilité
        activeStatus,
        setActiveStatus,
        // NOUVEAU: Master-Detail
        activeQuoteId,
        selectedQuoteIds,
        timeline,
        isLoadingTimeline,
        selectQuote,
        toggleSelection,
        selectAll,
        clearSelection,
        // Actions existantes
        updateStatus,
        deleteQuote,
        refresh,
        // NOUVEAU: Quick Actions
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
