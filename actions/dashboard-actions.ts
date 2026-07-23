"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { QuoteStatus as PrismaQuoteStatus } from "@/app/generated/prisma/client";
import { AdvancedDashboardData, QuoteStatus } from "@/types/dashboard";

/**
 * LOGIQUE MÉTIER CENTRE DE COMMANDEMENT :
 * 1. Analyse de la LTV (Lifetime Value) par client.
 * 2. Calcul de la vélocité de paiement.
 * 3. Pipeline breakdown + objectif mensuel.
 * 4. Segmentation du flux opérationnel vs patrimoine stratégique.
 */
export async function getAdvancedDashboardData(): Promise<AdvancedDashboardData | null> {
  const userId = await getClerkUserId();
  if (!userId) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        quotes: {
          include: {
            client: true,
            lines: true,
          },
          orderBy: { updatedAt: "desc" },
        },
        clients: {
          include: {
            quotes: {
              include: { lines: true },
            },
            _count: { select: { quotes: true } },
          },
        },
        catalogOffers: { take: 3 },
      },
    });

    if (!user) return null;

    const getQuoteTotal = (lines: { unitPrice: number; quantity: number }[]) =>
      lines.reduce((acc, line) => acc + line.unitPrice * line.quantity, 0);

    const quotesValidees = user.quotes.filter(
      (q) =>
        q.status === PrismaQuoteStatus.PAID ||
        q.status === PrismaQuoteStatus.ACCEPTED
    );

    const totalRevenue = quotesValidees.reduce(
      (acc, q) => acc + getQuoteTotal(q.lines),
      0
    );

    const pendingRevenue = user.quotes
      .filter((q) => q.status === PrismaQuoteStatus.SENT)
      .reduce((acc, q) => acc + getQuoteTotal(q.lines), 0);

    const conversionRate =
      user.quotes.length > 0
        ? (quotesValidees.length / user.quotes.length) * 100
        : 0;

    // Pipeline breakdown
    const paidTotal = user.quotes
      .filter((q) => q.status === PrismaQuoteStatus.PAID)
      .reduce((acc, q) => acc + getQuoteTotal(q.lines), 0);

    const sentTotal = pendingRevenue;

    const draftTotal = user.quotes
      .filter((q) => q.status === PrismaQuoteStatus.DRAFT)
      .reduce((acc, q) => acc + getQuoteTotal(q.lines), 0);

    const acceptedTotal = user.quotes
      .filter((q) => q.status === PrismaQuoteStatus.ACCEPTED)
      .reduce((acc, q) => acc + getQuoteTotal(q.lines), 0);

    // Objectif mensuel (heuristique : basé sur 1.5x le total du mois dernier)
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthRevenue = user.quotes
      .filter((q) => {
        const d = q.issueDate;
        return d >= firstOfMonth && (q.status === PrismaQuoteStatus.PAID || q.status === PrismaQuoteStatus.ACCEPTED);
      })
      .reduce((acc, q) => acc + getQuoteTotal(q.lines), 0);

    const targetRevenue = Math.max(currentMonthRevenue * 1.5, 100000);
    const percentage = targetRevenue > 0 ? Math.min((currentMonthRevenue / targetRevenue) * 100, 100) : 0;
    const daysRemaining = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();

    // Comptage des urgences
    const urgentCount = user.quotes.filter((q) => {
      if (q.status !== PrismaQuoteStatus.SENT) return false;
      const diffMs = now.getTime() - q.issueDate.getTime();
      const delaiJours = Math.round(diffMs / (1000 * 3600 * 24));
      return delaiJours > 7;
    }).length;

    // Pré-calcul : moyenne des montants par client + quoteCount
    const clientStats = new Map<string, { moyenne: number; quoteCount: number }>();
    for (const c of user.clients) {
      const totalClient = c.quotes.reduce((acc, q) => acc + getQuoteTotal(q.lines), 0);
      clientStats.set(c.id, {
        moyenne: c._count.quotes > 0 ? totalClient / c._count.quotes : 0,
        quoteCount: c._count.quotes,
      });
    }

    // Heuristique simple pour déduire une catégorie à partir du titre d'une ligne
    function deduireCategorie(titre: string): string {
      const t = titre.toLowerCase();
      if (t.includes("site") || t.includes("dev") || t.includes("code") || t.includes("technique")) return "Tech";
      if (t.includes("logo") || t.includes("design") || t.includes("graph") || t.includes("créatif")) return "Créatif";
      if (t.includes("marketing") || t.includes("seo") || t.includes("pub") || t.includes("réseau")) return "Marketing";
      if (t.includes("contenu") || t.includes("redac") || t.includes("copy") || t.includes("blog")) return "Content";
      if (t.includes("conseil") || t.includes("consult") || t.includes("stratégie")) return "Consulting";
      return "Prestation";
    }

    const activity = user.quotes.slice(0, 10).map((q) => {
      const montant = getQuoteTotal(q.lines);
      const clientInfo = clientStats.get(q.clientId);
      const moyenneClient = clientInfo?.moyenne ?? 0;
      const quoteCount = clientInfo?.quoteCount ?? 0;

      const diffMs = now.getTime() - q.issueDate.getTime();
      const delaiJours = Math.max(0, Math.round(diffMs / (1000 * 3600 * 24)));

      const estUrgent = q.status === PrismaQuoteStatus.SENT && delaiJours > 7;
      const categorie = q.lines[0]?.title ? deduireCategorie(q.lines[0].title) : "Prestation";
      const variationMontant = moyenneClient > 0
        ? Math.round(((montant - moyenneClient) / moyenneClient) * 100)
        : 0;

      return {
        id: q.id,
        amount: montant,
        status: q.status as unknown as QuoteStatus,
        clientName: q.client.name,
        projectName: q.lines[0]?.title || "Prestation de service",
        quoteNumber: q.number,
        date: q.updatedAt,
        delaiJours,
        estUrgent,
        moyenneClient,
        variationMontant,
        categorie,
        quoteCount,
      };
    });

    const topClients = user.clients
      .map((c) => {
        const quotesPayees = c.quotes.filter(
          (q) => q.status === PrismaQuoteStatus.PAID
        );

        const delaiPaiementMoyen =
          quotesPayees.length > 0
            ? quotesPayees.reduce((acc, q) => {
                const diff = q.updatedAt.getTime() - q.issueDate.getTime();
                return acc + diff / (1000 * 3600 * 24);
              }, 0) / quotesPayees.length
            : 0;

        const totalSpent = c.quotes
          .filter(
            (q) =>
              q.status === PrismaQuoteStatus.PAID ||
              q.status === PrismaQuoteStatus.ACCEPTED
          )
          .reduce((acc, q) => acc + getQuoteTotal(q.lines), 0);

        return {
          id: c.id,
          name: c.name,
          totalSpent,
          quoteCount: c._count.quotes,
          healthScore: (
            delaiPaiementMoyen < 7
              ? "EXCELLENT"
              : delaiPaiementMoyen < 15
              ? "GOOD"
              : "SLOW"
          ) as "EXCELLENT" | "GOOD" | "SLOW",
          averagePaymentDays: Math.round(delaiPaiementMoyen),
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    return {
      kpis: {
        totalRevenue,
        pendingRevenue,
        conversionRate,
        activeQuotes: user.quotes.filter(
          (q) => q.status === PrismaQuoteStatus.SENT
        ).length,
      },
      activity,
      topClients,
      suggestedServices: user.catalogOffers.map((o) => ({
        id: o.id,
        title: o.title,
        price: o.unitPrice,
        category: o.category,
      })),
      // --- Nouveaux champs Centre de Commandement ---
      pipeline: {
        paid: paidTotal,
        sent: sentTotal,
        draft: draftTotal,
        accepted: acceptedTotal,
        total: totalRevenue + pendingRevenue + draftTotal,
      },
      monthlyGoal: {
        currentRevenue: currentMonthRevenue,
        targetRevenue,
        percentage,
        daysRemaining,
      },
      urgentCount,
      totalClients: user.clients.length,
    };
  } catch (error) {
    console.error("[GET_ADVANCED_DASHBOARD_DATA_ERROR]", error);
    return null;
  }
}