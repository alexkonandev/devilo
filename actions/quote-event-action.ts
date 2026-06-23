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

/**
 * DELETE : Supprime un événement de la timeline
 */
export async function deleteQuoteEventAction(
  eventId: string,
): Promise<ActionResponse> {
  try {
    const userId = await getClerkUserId();
    if (!userId) return { success: false, error: "Non autorisé" };

    // Vérifier que l'événement appartient à un devis de l'utilisateur
    const event = await db.quoteEvent.findUnique({
      where: { id: eventId },
      include: { quote: { select: { userId: true } } },
    });

    if (!event) return { success: false, error: "Événement non trouvé" };
    if (event.quote.userId !== userId) return { success: false, error: "Non autorisé" };

    await db.quoteEvent.delete({
      where: { id: eventId },
    });

    revalidatePath("/quotes");
    return { success: true };
  } catch (error) {
    console.error("[DELETE_QUOTE_EVENT_ERROR]:", error);
    return { success: false, error: "Impossible de supprimer l'événement" };
  }
}

/**
 * ADD NOTE : Ajoute une note personnalisée à la timeline
 */
export async function addQuoteNoteAction(
  quoteId: string,
  content: string,
): Promise<ActionResponse> {
  return logQuoteEventAction(quoteId, "note", { content });
}

/**
 * UPDATE NOTE : Met à jour le contenu d'une note existante
 */
export async function updateQuoteNoteAction(
  eventId: string,
  content: string,
): Promise<ActionResponse> {
  try {
    const userId = await getClerkUserId();
    if (!userId) return { success: false, error: "Non autorisé" };

    const event = await db.quoteEvent.findUnique({
      where: { id: eventId },
      include: { quote: { select: { userId: true } } },
    });

    if (!event) return { success: false, error: "Note non trouvée" };
    if (event.quote.userId !== userId) return { success: false, error: "Non autorisé" };
    if (event.type !== "note") return { success: false, error: "L'événement n'est pas une note" };

    await db.quoteEvent.update({
      where: { id: eventId },
      data: {
        metadata: { ...(event.metadata as Record<string, unknown> || {}), content },
      },
    });

    revalidatePath("/quotes");
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_QUOTE_NOTE_ERROR]:", error);
    return { success: false, error: "Impossible de mettre à jour la note" };
  }
}
