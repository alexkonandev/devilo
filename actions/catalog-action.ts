"use server";

import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { CatalogService, ActionResponse, CatalogSource } from "@/types/catalog";
import { UserService, CatalogOffer } from "@/app/generated/prisma/client";

/**
 * TYPE DE TRANSITION : Intersection des modèles Prisma
 * Permet de mapper les données sans 'any' tout en acceptant les deux modèles.
 */
type PrismaCatalogItem = (Partial<UserService> & Partial<CatalogOffer>) & {
  id: string;
  title: string;
  unitPrice: number;
  userId: string;
  createdAt: Date;
};

/**
 * UTILS : Mapping strict
 */
function mapToCatalogService(
  item: PrismaCatalogItem,
  source: CatalogSource
): CatalogService {
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle || "",
    unitPrice: item.unitPrice,
    category: (item as CatalogOffer).category || "MES_SERVICES",
    source: source,
    isPremium: (item as CatalogOffer).isPremium ?? false,
    userId: item.userId,
    createdAt: item.createdAt,
  };
}

/**
 * FETCH : Récupération asymétrique
 */
export async function getInventoryAction(): Promise<{
  userServices: CatalogService[];
  platformServices: CatalogService[];
}> {
  const { userId: clerkId } = await auth();
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
      userServices: userItems.map((i) =>
        mapToCatalogService(i as PrismaCatalogItem, "PERSONAL")
      ),
      platformServices: platformItems.map((i) =>
        mapToCatalogService(i as PrismaCatalogItem, "PLATFORM")
      ),
    };
  } catch (error) {
    console.error("[CATALOG_FETCH_ERROR]", error);
    return { userServices: [], platformServices: [] };
  }
}

/**
 * CORE : Importation (Drop)
 */
export async function importServiceAction(
  platformServiceId: string
): Promise<ActionResponse<CatalogService>> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "AUTH_REQUIRED" };

  try {
    const source = await db.catalogOffer.findUnique({
      where: { id: platformServiceId },
    });

    if (!source) return { success: false, error: "SOURCE_NOT_FOUND" };

    const newService = await db.userService.create({
      data: {
        userId: clerkId,
        title: source.title,
        subtitle: source.subtitle,
        unitPrice: source.unitPrice,
      },
    });

    revalidatePath("/catalog");
    return {
      success: true,
      data: mapToCatalogService(newService as PrismaCatalogItem, "PERSONAL"),
    };
  } catch (error) {
    return { success: false, error: "IMPORT_FAILED" };
  }
}

/**
 * UPDATE : Mutation
 */
export async function updateServiceAction(
  id: string,
  data: Partial<CatalogService>
): Promise<ActionResponse<CatalogService>> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "AUTH_REQUIRED" };

  try {
    const updated = await db.userService.update({
      where: { id, userId: clerkId },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        unitPrice: data.unitPrice,
      },
    });

    revalidatePath("/catalog");
    return {
      success: true,
      data: mapToCatalogService(updated as PrismaCatalogItem, "PERSONAL"),
    };
  } catch (error) {
    return { success: false, error: "UPDATE_FAILED" };
  }
}
