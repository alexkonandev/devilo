"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ClientListItem } from "@/types/client";
import { clientSchema } from "@/lib/validations/client";

interface GetClientsPaginatedResult {
  clients: ClientListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * RÉCUPÉRATION PAGINÉE DES CLIENTS + SEARCH
 * Supporte pagination côté serveur pour scaler à 10K+ clients.
 */
export async function getClientsPaginated(
  page: number = 1,
  limit: number = 50,
  search?: string,
): Promise<GetClientsPaginatedResult> {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { clients: [], total: 0, page, limit, totalPages: 0 };

    const skip = (page - 1) * limit;

    // Build search filter
    const whereClause: {
      userId: string;
      OR?: Array<{ [key: string]: { [key: string]: string } }>;
    } = { userId: authId };
    if (search && search.trim()) {
      whereClause.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
        { taxId: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    // Get total count for pagination
    const total = await db.client.count({ where: whereClause });

    const clients = await db.client.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        _count: {
          select: { quotes: true },
        },
        quotes: {
          select: {
            id: true,
            number: true,
            status: true,
            createdAt: true,
            lines: {
              select: {
                quantity: true,
                unitPrice: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { name: "asc" },
    });

    const mappedClients = clients.map((client) => {
      const mappedQuotes = client.quotes.map((quote) => ({
        id: quote.id,
        number: quote.number,
        status: quote.status,
        createdAt: quote.createdAt,
        totalAmount: quote.lines.reduce(
          (sum, line) => sum + line.quantity * line.unitPrice,
          0,
        ),
      }));

      const totalSpent = mappedQuotes.reduce(
        (acc, q) => acc + q.totalAmount,
        0,
      );

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        addressLine2: client.addressLine2,
        city: client.city,
        postalCode: client.postalCode,
        country: client.country,
        taxId: client.taxId,
        tvaNumber: client.tvaNumber,
        legalForm: client.legalForm,
        representativeName: client.representativeName,
        representativePosition: client.representativePosition,
        notes: client.notes,
        tags: client.tags || [],
        createdAt: client.createdAt,
        quoteCount: client._count.quotes,
        totalSpent: totalSpent,
        quotes: mappedQuotes,
      };
    });

    return {
      clients: mappedClients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.error("[GET_CLIENTS_PAGINATED_ERROR]:", err);
    return { clients: [], total: 0, page, limit, totalPages: 0 };
  }
}

/**
 * RÉCUPÉRATION DES CLIENTS + KPIS (LEGACY - sans pagination)
 * Calcule le nombre de devis et le CA total par client pour l'UI.
 * @deprecated Utiliser getClientsPaginated pour de nouvelles implémentations
 */
export async function getClients(): Promise<ClientListItem[]> {
  try {
    const authId = await getClerkUserId();
    if (!authId) return [];

    const clients = await db.client.findMany({
      where: { userId: authId },
      include: {
        _count: {
          select: { quotes: true },
        },
        quotes: {
          select: {
            id: true,
            number: true,
            status: true,
            createdAt: true,
            // Note: Vérifie que ton modèle Quote a bien une relation 'lines' ou 'items'
            // Ici on suit ta logique 'lines'
            lines: {
              select: {
                quantity: true,
                unitPrice: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return clients.map((client) => {
      // Mapping des devis avec calcul du total par devis
      const mappedQuotes = client.quotes.map((quote) => ({
        id: quote.id,
        number: quote.number,
        status: quote.status,
        createdAt: quote.createdAt,
        totalAmount: quote.lines.reduce(
          (sum, line) => sum + line.quantity * line.unitPrice,
          0,
        ),
      }));

      // Calcul du CA total (ROI direct pour le business)
      const totalSpent = mappedQuotes.reduce(
        (acc, q) => acc + q.totalAmount,
        0,
      );

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        addressLine2: client.addressLine2,
        city: client.city,
        postalCode: client.postalCode,
        country: client.country,
        taxId: client.taxId,
        tvaNumber: client.tvaNumber,
        legalForm: client.legalForm,
        representativeName: client.representativeName,
        representativePosition: client.representativePosition,
        notes: client.notes,
        tags: client.tags || [],
        createdAt: client.createdAt,
        quoteCount: client._count.quotes,
        totalSpent: totalSpent,
        quotes: mappedQuotes,
      };
    });
  } catch (err) {
    console.error("[GET_CLIENTS_ERROR]:", err);
    return [];
  }
}

/**
 * UPSERT CLIENT (Rich Data)
 * Création ou mise à jour complète avec tous les champs.
 */
export async function upsertClient(data: Record<string, unknown>) {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { success: false, error: "Non autorisé" };

    // Validation Zod
    const parsed = clientSchema.parse(data);

    const clientData = {
      name: parsed.name,
      email: parsed.email || null,
      phone: parsed.phone || null,
      address: parsed.address || null,
      addressLine2: parsed.addressLine2 || null,
      city: parsed.city || null,
      postalCode: parsed.postalCode || null,
      country: parsed.country || "CI",
      taxId: parsed.taxId || null,
      tvaNumber: parsed.tvaNumber || null,
      legalForm: parsed.legalForm || null,
      representativeName: parsed.representativeName || null,
      representativePosition: parsed.representativePosition || null,
      notes: parsed.notes || null,
      tags: parsed.tags || [],
      userId: authId,
    };

    const client = parsed.id
      ? await db.client.update({
          where: { id: parsed.id, userId: authId },
          data: clientData,
        })
      : await db.client.create({ data: clientData });

    revalidatePath("/clients");
    revalidatePath("/quotes");

    return { success: true, data: client };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "ZodError") {
      return { success: false, error: "Données invalides", zodErrors: (err as any).errors };
    }
    console.error("[UPSERT_CLIENT_ERROR]:", err);
    return { success: false, error: "Erreur technique lors de la sauvegarde" };
  }
}

/**
 * GET CLIENT BY ID (Full data)
 * Récupère un client complet avec tous les champs rich.
 */
export async function getClientById(clientId: string) {
  try {
    const authId = await getClerkUserId();
    if (!authId) return null;

    const client = await db.client.findFirst({
      where: { id: clientId, userId: authId },
      include: {
        quotes: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            number: true,
            status: true,
            createdAt: true,
            lines: {
              select: {
                quantity: true,
                unitPrice: true,
              },
            },
          },
        },
      },
    });

    if (!client) return null;

    return {
      ...client,
      tags: client.tags || [],
    };
  } catch (err) {
    console.error("[GET_CLIENT_BY_ID_ERROR]:", err);
    return null;
  }
}

/**
 * SUPPRESSION UNITAIRE
 */
export async function deleteClient(clientId: string) {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { success: false, error: "Non autorisé" };

    await db.client.delete({
      where: {
        id: clientId,
        userId: authId,
      },
    });

    revalidatePath("/clients");
    return { success: true };
  } catch (err) {
    console.error("[DELETE_CLIENT_ERROR]:", err);
    return {
      success: false,
      error: "Impossible de supprimer un client lié à des devis existants",
    };
  }
}

/**
 * SUPPRESSION GROUPÉE
 */
export async function deleteManyClients(clientIds: string[]) {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { success: false, error: "Non autorisé" };

    const result = await db.client.deleteMany({
      where: {
        id: { in: clientIds },
        userId: authId,
      },
    });

    revalidatePath("/clients");
    return { success: true, count: result.count };
  } catch (err) {
    console.error("[DELETE_MANY_CLIENTS_ERROR]:", err);
    return { success: false, error: "Erreur lors de la suppression groupée" };
  }
}
