"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { QuoteStatus } from "@/app/generated/prisma/client";
import {
  QuoteRegistryItem,
  ActionResponse,
  QuoteTimelineEvent,
} from "@/types/quote-registry";

/**
 * FETCH : Récupère tous les devis de l'utilisateur avec relations
 * C'est le moteur de ton Ledger central.
 */
export async function getQuotesAction(): Promise<
  ActionResponse<QuoteRegistryItem[]>
> {
  try {
    const userId = await getClerkUserId();
    if (!userId) return { success: false, error: "Non autorisé" };

    const quotes = await db.quote.findMany({
      where: { userId },
      include: {
        client: true,
        lines: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: quotes };
  } catch (error) {
    console.error("[GET_QUOTES_ERROR]:", error);
    return { success: false, error: "Impossible de charger les devis" };
  }
}

/**
 * UPDATE_STATUS : Change l'état d'un devis (Workflow rapide)
 * Utile pour passer de SENT à PAID sans ouvrir l'éditeur.
 */
export async function updateQuoteStatusAction(
  id: string,
  status: QuoteStatus,
): Promise<ActionResponse> {
  try {
    const userId = await getClerkUserId();
    if (!userId) return { success: false, error: "Non autorisé" };

    await db.quote.update({
      where: { id, userId },
      data: { status },
    });

    revalidatePath("/quotes");
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_QUOTE_STATUS_ERROR]:", error);
    return { success: false, error: "Échec de la mise à jour du statut" };
  }
}

/**
 * DELETE : Nettoyage d'archives
 */
export async function deleteQuoteAction(id: string): Promise<ActionResponse> {
  try {
    const userId = await getClerkUserId();
    if (!userId) return { success: false, error: "Non autorisé" };

    await db.quote.delete({
      where: { id, userId },
    });

    revalidatePath("/quotes");
    return { success: true };
  } catch (error) {
    console.error("[DELETE_QUOTE_ERROR]:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

/**
 * GET_TIMELINE : Récupère l'historique d'un devis (Audit Trail)
 * Pour le panneau de télémétrie dans l'UI Master-Detail
 */
export async function getQuoteTimelineAction(
  quoteId: string,
): Promise<ActionResponse<QuoteTimelineEvent[]>> {
  try {
    const userId = await getClerkUserId();
    if (!userId) return { success: false, error: "Non autorisé" };

    // Vérifier que le devis appartient à l'utilisateur
    const quote = await db.quote.findFirst({
      where: { id: quoteId, userId },
      select: { id: true, createdAt: true, status: true, updatedAt: true },
    });

    if (!quote) {
      return { success: false, error: "Devis non trouvé" };
    }

    // Construire une timeline synthétique à partir des données existantes
    const timeline: QuoteTimelineEvent[] = [
      {
        id: `${quoteId}-created`,
        quoteId,
        type: "created",
        createdAt: quote.createdAt,
        metadata: { initialStatus: quote.status },
      },
    ];

    // Si le statut a changé depuis la création, ajouter un événement
    if (
      quote.status !== "DRAFT" ||
      quote.updatedAt.getTime() !== quote.createdAt.getTime()
    ) {
      timeline.push({
        id: `${quoteId}-status-${quote.updatedAt.getTime()}`,
        quoteId,
        type: "status_changed",
        status: quote.status,
        createdAt: quote.updatedAt,
      });
    }

    return { success: true, data: timeline };
  } catch (error) {
    console.error("[GET_TIMELINE_ERROR]:", error);
    return { success: false, error: "Impossible de charger la timeline" };
  }
}
