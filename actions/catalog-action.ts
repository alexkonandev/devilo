"use server";

import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { CatalogService, ActionResponse, CatalogSource } from "@/types/catalog";
import { UserService, CatalogOffer } from "@/app/generated/prisma/client";

/**
 * TYPE DE TRANSITION : Intersection des modèles Prisma
 * Ajout de baseCost pour le calcul de rentabilité.
 */
type PrismaCatalogItem = (Partial<UserService> & Partial<CatalogOffer>) & {
  id: string;
  title: string;
  unitPrice: number;
  baseCost: number; // Inclus suite à la migration
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
    baseCost: item.baseCost || 0, // Mapping du nouveau champ
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
 * CORE : Importation (Injection depuis plateforme)
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

    // On initialise le baseCost à 0 lors de l'import : c'est à l'user de définir sa marge.
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
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "AUTH_REQUIRED" };

  try {
    // STRATÉGIE : On construit l'objet data de manière explicite
    // pour éviter d'envoyer des undefined à Prisma
    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.subtitle !== undefined) updatePayload.subtitle = data.subtitle;

    // On force le cast en Number pour Neon/Prisma
    if (data.unitPrice !== undefined)
      updatePayload.unitPrice = Number(data.unitPrice);
    if (data.baseCost !== undefined)
      updatePayload.baseCost = Number(data.baseCost);

    console.log("[PRISMA_INPUT]", updatePayload);

    const updated = await db.userService.update({
      where: {
        id,
        userId: clerkId, // Sécurité : on vérifie que l'user possède bien le service
      },
      data: updatePayload,
    });

    revalidatePath("/catalog");

    return {
      success: true,
      data: mapToCatalogService(updated as PrismaCatalogItem, "PERSONAL"),
    };
  } catch (error: any) {
    // LOG CRUCIAL : C'est ici que tu verras pourquoi Neon rejette le 0
    console.error("[UPDATE_SERVICE_DETAILED_ERROR]", {
      message: error.message,
      code: error.code, // Cherche P2002, P2025, etc.
      stack: error.stack,
    });

    return {
      success: false,
      error: `UPDATE_FAILED: ${error.code || "UNKNOWN"}`,
    };
  }
}

/**
 * DELETE : Destruction
 */
export async function deleteServiceAction(
  id: string
): Promise<ActionResponse<boolean>> {
  const { userId: clerkId } = await auth();
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
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "AUTH_REQUIRED" };

  try {
    const newService = await db.userService.create({
      data: {
        userId: clerkId,
        title: data.title || "Nouveau Service",
        subtitle: data.subtitle || "",
        unitPrice: Number(data.unitPrice) || 0,
        baseCost: Number(data.baseCost) || 0,
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
