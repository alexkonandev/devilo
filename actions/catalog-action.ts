"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CatalogService, ActionResponse, CatalogSource } from "@/types/catalog";
import { UserService, CatalogOffer } from "@/app/generated/prisma/client";
import { catalogServiceSchema } from "@/lib/validations/catalog";

/**
 * TYPE DE TRANSITION : Intersection des modèles Prisma
 * Ajout de baseCost pour le calcul de rentabilité.
 */
type PrismaCatalogItem = (Partial<UserService> & Partial<CatalogOffer>) & {
  id: string;
  title: string;
  unitPrice: number;
  baseCost: number;
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
    baseCost: item.baseCost || 0,
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
 * CORE : Importation (Injection depuis plateforme)
 */
export async function importServiceAction(
  platformServiceId: string
): Promise<ActionResponse<CatalogService>> {
  const clerkId = await getClerkUserId();
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
        baseCost: 0,
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
 * UPDATE : Mutation avec persistence de la rentabilité
 */
export async function updateServiceAction(
  id: string,
  data: Partial<CatalogService>
): Promise<ActionResponse<CatalogService>> {
  const clerkId = await getClerkUserId();
  if (!clerkId) return { success: false, error: "AUTH_REQUIRED" };

  try {
    const parsed = catalogServiceSchema.parse(data);

    const updatePayload: Record<string, unknown> = {
      title: parsed.title,
      subtitle: parsed.subtitle,
      unitPrice: parsed.unitPrice,
      baseCost: parsed.baseCost,
    };

    const updated = await db.userService.update({
      where: {
        id,
        userId: clerkId,
      },
      data: updatePayload,
    });

    revalidatePath("/catalog");

    return {
      success: true,
      data: mapToCatalogService(updated as PrismaCatalogItem, "PERSONAL"),
    };
  } catch (error) {
    console.error("[UPDATE_SERVICE_ERROR]", error);
    return { success: false, error: "UPDATE_FAILED" };
  }
}

/**
 * DELETE : Destruction
 */
export async function deleteServiceAction(
  id: string
): Promise<ActionResponse<boolean>> {
  const clerkId = await getClerkUserId();
  if (!clerkId) return { success: false, error: "AUTH_REQUIRED" };

  try {
    await db.userService.delete({
      where: { id, userId: clerkId },
    });

    revalidatePath("/catalog");
    return { success: true, data: true };
  } catch (error) {
    console.error("[DELETE_SERVICE_ERROR]", error);
    return { success: false, error: "DELETE_FAILED" };
  }
}

/**
 * CREATE : Création
 */
export async function createServiceAction(
  data: Partial<CatalogService>
): Promise<ActionResponse<CatalogService>> {
  const clerkId = await getClerkUserId();
  if (!clerkId) return { success: false, error: "AUTH_REQUIRED" };

  try {
    const parsed = catalogServiceSchema.parse(data);

    const newService = await db.userService.create({
      data: {
        userId: clerkId,
        title: parsed.title,
        subtitle: parsed.subtitle,
        unitPrice: parsed.unitPrice,
        baseCost: parsed.baseCost,
      },
    });

    revalidatePath("/catalog");
    return {
      success: true,
      data: mapToCatalogService(newService as PrismaCatalogItem, "PERSONAL"),
    };
  } catch (error) {
    console.error("[CREATE_SERVICE_ERROR]", error);
    return { success: false, error: "CREATE_FAILED" };
  }
}