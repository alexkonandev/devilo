"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ReminderType =
  | "NO_QUOTES_90D"      // Client sans devis depuis 90j
  | "SENT_NO_RESPONSE_14D" // Devis envoyé sans réponse depuis 14j
  | "VIP_INACTIVE_30D";    // Client VIP pas de nouveau devis depuis 30j

export interface ReminderItem {
  id: string;
  type: ReminderType;
  clientId: string;
  clientName: string;
  clientEmail: string | null;
  quoteId?: string;
  quoteNumber?: string;
  quoteStatus?: string;
  daysSinceLastAction: number;
  label: string;
  actionLabel: string;
}

export interface GetRemindersResponse {
  success: boolean;
  error?: string;
  data?: ReminderItem[];
}

export async function getRemindersAction(): Promise<GetRemindersResponse> {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { success: false, error: "Non autorisé" };

    const now = new Date();
    const reminders: ReminderItem[] = [];

    // ─── RÈGLE 1: Client sans devis depuis 90j ───
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const clientsWithoutRecentQuotes = await db.client.findMany({
      where: {
        userId: authId,
        OR: [
          { quotes: { none: {} } },
          {
            quotes: {
              every: { createdAt: { lt: ninetyDaysAgo } },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        quotes: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    });

    for (const client of clientsWithoutRecentQuotes) {
      const lastQuoteDate = client.quotes[0]?.createdAt || client.createdAt;
      const daysSince = Math.floor(
        (now.getTime() - lastQuoteDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSince >= 90) {
        reminders.push({
          id: `no-quotes-${client.id}`,
          type: "NO_QUOTES_90D",
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          daysSinceLastAction: daysSince,
          label: `Aucun devis depuis ${daysSince} jours`,
          actionLabel: "Créer un devis",
        });
      }
    }

    // ─── RÈGLE 2: Devis SENT sans réponse depuis 14j ───
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const staleSentQuotes = await db.quote.findMany({
      where: {
        userId: authId,
        status: "SENT",
        updatedAt: { lt: fourteenDaysAgo },
      },
      select: {
        id: true,
        number: true,
        status: true,
        updatedAt: true,
        client: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    for (const quote of staleSentQuotes) {
      const daysSince = Math.floor(
        (now.getTime() - quote.updatedAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      reminders.push({
        id: `stale-sent-${quote.id}`,
        type: "SENT_NO_RESPONSE_14D",
        clientId: quote.client.id,
        clientName: quote.client.name,
        clientEmail: quote.client.email,
        quoteId: quote.id,
        quoteNumber: quote.number,
        quoteStatus: quote.status,
        daysSinceLastAction: daysSince,
        label: `Devis ${quote.number} sans réponse depuis ${daysSince} jours`,
        actionLabel: "Relancer le client",
      });
    }

    // ─── RÈGLE 3: Client VIP (tag "VIP") pas de devis depuis 30j ───
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const vipClients = await db.client.findMany({
      where: {
        userId: authId,
        tags: { has: "VIP" },
        OR: [
          { quotes: { none: {} } },
          {
            quotes: {
              every: { createdAt: { lt: thirtyDaysAgo } },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        quotes: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    });

    for (const client of vipClients) {
      const lastQuoteDate = client.quotes[0]?.createdAt || client.createdAt;
      const daysSince = Math.floor(
        (now.getTime() - lastQuoteDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSince >= 30) {
        reminders.push({
          id: `vip-${client.id}`,
          type: "VIP_INACTIVE_30D",
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          daysSinceLastAction: daysSince,
          label: `Client VIP inactif depuis ${daysSince} jours`,
          actionLabel: "Check-in client",
        });
      }
    }

    // Trier par urgence (daysSince décroissant)
    reminders.sort((a, b) => b.daysSinceLastAction - a.daysSinceLastAction);

    return { success: true, data: reminders };
  } catch (err) {
    console.error("[GET_REMINDERS_ERROR]:", err);
    return { success: false, error: "Erreur lors de la récupération des rappels" };
  }
}