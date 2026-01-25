"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { QuoteStatus } from "@/app/generated/prisma/client";
import { QuoteRegistryItem, ActionResponse } from "@/types/quote-registry";

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
  status: QuoteStatus
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
