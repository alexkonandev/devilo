"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useTransition,
} from "react";
import {
  QuoteRegistryItem,
  QuoteRegistryStats,
  QuoteContextType,
  QuoteStatus,
} from "@/types/quote-registry";
import {
  updateQuoteStatusAction,
  deleteQuoteAction,
  getQuotesAction,
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

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const matchSearch =
        q.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.client.name.toLowerCase().includes(searchQuery.toLowerCase());
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
      ACCEPTED: 0, // Ajouté ici
      PAID: 0,
      REJECTED: 0,
    };

    let pipeline = 0;
    let collected = 0;

    quotes.forEach((q) => {
      counts[q.status]++;
      const totalHT = q.lines.reduce(
        (acc, ln) => acc + ln.unitPrice * ln.quantity,
        0
      );

      // Logique financière : DRAFT, SENT et ACCEPTED font partie du pipeline (argent potentiel)
      if (["DRAFT", "SENT", "ACCEPTED"].includes(q.status)) pipeline += totalHT;
      if (q.status === "PAID") collected += totalHT;
    });

    const sentCount =
      counts["SENT"] + counts["ACCEPTED"] + counts["PAID"] + counts["REJECTED"];
    const conversionRate =
      sentCount > 0 ? (counts["PAID"] / sentCount) * 100 : 0;

    return {
      totalPipelineValue: pipeline,
      totalCashCollected: collected,
      conversionRate,
      countByStatus: counts,
    };
  }, [quotes]);

  // Utilisation de startTransition pour le refresh (non-bloquant pour l'UI)
  const refresh = async () => {
    startTransition(async () => {
      const res = await getQuotesAction();
      if (res.success && res.data) setQuotes(res.data);
    });
  };

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
        `Le devis est maintenant marqué comme ${status}.`
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
        setSearchQuery,
        activeStatus,
        setActiveStatus,
        updateStatus,
        deleteQuote,
        refresh,
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
