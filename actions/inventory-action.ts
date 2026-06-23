"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";

/**
 * TYPE DE TRANSITION : Intersection des modèles Prisma
 */
type PrismaCatalogItem = {
  id: string;
  title: string;
  subtitle: string | null;
  unitPrice: number;
  baseCost: number;
  userId: string;
  createdAt: Date;
};

interface CatalogOfferLike extends PrismaCatalogItem {
  annualPrice: number | null;
  category: string | null;
  isPremium: boolean;
  importCount: number;
}

/**
 * UTILS : Mapping strict
 */
function mapToCatalogService(
  item: PrismaCatalogItem,
): {
  id: string;
  title: string;
  subtitle: string;
  unitPrice: number;
  baseCost: number;
  userId: string;
  createdAt: Date;
} {
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle || "",
    unitPrice: item.unitPrice,
    baseCost: item.baseCost || 0,
    userId: item.userId,
    createdAt: item.createdAt,
  };
}

/**
 * FETCH : Récupère les services de l'utilisateur depuis la BDD
 * Utilisé par l'éditeur de devis pour la sidebar gauche (onglet Offres)
 */
export async function getInventoryAction(): Promise<{
  userServices: any[];
  platformServices: any[];
}> {
  const clerkId = await getClerkUserId();
  if (!clerkId) return { userServices: [], platformServices: [] };

  try {
    const [userItems, platformItems] = await Promise.all([
      db.userService.findMany({
        where: { userId: clerkId },
        orderBy: { title: "asc" },
      }),
      db.catalogOffer.findMany({
        orderBy: { category: "asc" },
      }),
    ]);

    return {
      userServices: userItems.map((i: any) =>
        mapToCatalogService(i as PrismaCatalogItem)
      ),
      platformServices: platformItems.map((i: any) =>
        mapToCatalogService(i as PrismaCatalogItem)
      ),
    };
  } catch (error) {
    console.error("[INVENTORY_FETCH_ERROR]", error);
    return { userServices: [], platformServices: [] };
  }
}