"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { QuoteStatus as PrismaQuoteStatus } from "@/app/generated/prisma/client";
import { AdvancedDashboardData, QuoteStatus } from "@/types/dashboard";

/**
 * LOGIQUE MÉTIER COMPLEXE :
 * 1. Analyse de la LTV (Lifetime Value) par client.
 * 2. Calcul de la vélocité de paiement (Temps moyen entre SENT et PAID).
 * 3. Segmentation du flux opérationnel vs patrimoine stratégique.
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

    const activity = user.quotes.slice(0, 5).map((q) => ({
      id: q.id,
      amount: getQuoteTotal(q.lines),
      status: q.status as unknown as QuoteStatus,
      clientName: q.client.name,
      projectName: q.lines[0]?.title || "Prestation de service",
      quoteNumber: q.number,
      date: q.updatedAt,
    }));

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
    };
  } catch (error) {
    console.error("[GET_ADVANCED_DASHBOARD_DATA_ERROR]", error);
    return null;
  }
}