"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";

/**
 * FETCH : Récupère les suggestions de la plateforme depuis la BDD
 * Utilisé par l'éditeur de devis pour la sidebar gauche (onglet Offres → Suggestions)
 * Retourne des CatalogOffer complets (compatibles avec EditorCatalogOffer)
 */
export async function getSuggestionsAction(): Promise<
  Array<{
    id: string;
    category: string;
    title: string;
    subtitle: string;
    userId: string;
    unitPrice: number;
    annualPrice: number | null;
    isPremium: boolean;
    importCount: number;
    createdAt: Date;
  }>
> {
  const clerkId = await getClerkUserId();
  if (!clerkId) return [];

  try {
    const platformItems = await db.catalogOffer.findMany({
      orderBy: { category: "asc" },
    });

    return platformItems.map((item) => ({
      id: item.id,
      category: item.category,
      title: item.title,
      subtitle: item.subtitle || "",
      userId: item.userId,
      unitPrice: item.unitPrice,
      annualPrice: item.annualPrice,
      isPremium: item.isPremium,
      importCount: item.importCount,
      createdAt: item.createdAt,
    }));
  } catch (error) {
    console.error("[SUGGESTION_FETCH_ERROR]", error);
    return [];
  }
}