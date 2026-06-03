"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { QuoteStatus } from "@/app/generated/prisma/client";
import { ActionResponse, QuoteTimelineEvent } from "@/types/quote-registry";

/**
 * LOG : Enregistre un événement dans la timeline du devis
 * Utilisé automatiquement à chaque étape du cycle de vie du devis
 */
export async function logQuoteEventAction(
  quoteId: string,
  type: QuoteTimelineEvent["type"],
  metadata?: Record<string, unknown>,
): Promise<ActionResponse> {
  try {
    const userId = await getClerkUserId();
    if (!userId) return { success: false, error: "Non autorisé" };

    await db.quoteEvent.create({
      data: {
        quoteId,
        userId,
        type,
        metadata: (metadata ?? {}) as any,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[LOG_QUOTE_EVENT_ERROR]:", error);
    return { success: false, error: "Impossible d'enregistrer l'événement" };
  }
}

/**
 * LOG : Enregistre un changement de statut avec les valeurs before/after
 */
export async function logQuoteStatusChangeAction(
  quoteId: string,
  fromStatus: QuoteStatus,
  toStatus: QuoteStatus,
): Promise<ActionResponse> {
  return logQuoteEventAction(quoteId, "status_changed", {
    from: fromStatus,
    to: toStatus,
  });
}

/**
 * FETCH : Récupère les événements de la timeline d'un devis
 * Remplace la timeline synthétique basée sur createdAt/updatedAt
 */
export async function getQuoteEventsAction(
  quoteId: string,
  limit?: number,
): Promise<ActionResponse<QuoteTimelineEvent[]>> {
  try {
    const userId = await getClerkUserId();
    if (!userId) return { success: false, error: "Non autorisé" };

    // Vérifier que le devis appartient à l'utilisateur
    const quote = await db.quote.findFirst({
      where: { id: quoteId, userId },
      select: { id: true },
    });

    if (!quote) {
      return { success: false, error: "Devis non trouvé" };
    }

    const events = await db.quoteEvent.findMany({
      where: { quoteId },
      orderBy: { createdAt: "desc" },
      take: limit ?? 50,
    });

    return {
      success: true,
      data: events.map((e) => ({
        id: e.id,
        quoteId: e.quoteId,
        type: e.type as QuoteTimelineEvent["type"],
        status: e.status ?? undefined,
        metadata: e.metadata as Record<string, unknown> | undefined,
        createdAt: e.createdAt,
        createdBy: e.createdBy ?? undefined,
      })),
    };
  } catch (error) {
    console.error("[GET_QUOTE_EVENTS_ERROR]:", error);
    return { success: false, error: "Impossible de charger la timeline" };
  }
}