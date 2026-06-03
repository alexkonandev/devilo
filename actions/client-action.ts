"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
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
  } catch (err) {
    console.error("[GET_CLIENTS_ERROR]:", err);
    return [];
  }
}

/**
 * UPSERT CLIENT (Rich Data)
 * Création ou mise à jour avec MERGE intelligent.
 *
 * En mode UPDATE (id présent), seuls les champs explicitement fournis
 * sont écrasés ; tous les autres champs sont préservés depuis la base.
 * Cela garantit qu'une édition unitaire (ex: email) ne détruit pas
 * les autres données (phone, TVA, adresse…).
 *
 * Protection intégrée :
 * - userId extrait côté serveur (auth) → pas d'usurpation possible
 * - Optimistic locking via updatedAt → prévention des race conditions
 * - Valeurs null/undefined transmises telles quelles à Prisma
 */
export async function upsertClient(data: Record<string, unknown>) {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { success: false, error: "Non autorisé" };

    // On retire userId du payload client s'il a été envoyé ; on utilise authId
    if (data.userId) delete data.userId;

    // Validation Zod
    const parsed = clientSchema.parse(data);

    if (parsed.id) {
      // ── UPDATE : merge avec l'existant ──────────────────────────────────
      const existing = await db.client.findFirst({
        where: { id: parsed.id, userId: authId },
      });
      if (!existing) {
        return { success: false, error: "Client introuvable" };
      }

      const has = (key: string) => key in data;

      // Construction du payload : null/undefined sont passés tels quels à Prisma
      const clientData: Prisma.ClientUpdateInput = {
        name: has("name") ? parsed.name ?? "" : existing.name,
        email: has("email") ? parsed.email ?? null : existing.email,
        phone: has("phone") ? parsed.phone ?? null : existing.phone,
        address: has("address") ? parsed.address ?? null : existing.address,
        addressLine2: has("addressLine2")
          ? parsed.addressLine2 ?? null
          : existing.addressLine2,
        city: has("city") ? parsed.city ?? null : existing.city,
        postalCode: has("postalCode")
          ? parsed.postalCode ?? null
          : existing.postalCode,
        country: has("country") ? parsed.country ?? "CI" : existing.country,
        taxId: has("taxId") ? parsed.taxId ?? null : existing.taxId,
        tvaNumber: has("tvaNumber") ? parsed.tvaNumber ?? null : existing.tvaNumber,
        legalForm: has("legalForm")
          ? parsed.legalForm ?? null
          : existing.legalForm,
        representativeName: has("representativeName")
          ? parsed.representativeName ?? null
          : existing.representativeName,
        representativePosition: has("representativePosition")
          ? parsed.representativePosition ?? null
          : existing.representativePosition,
        notes: has("notes") ? parsed.notes ?? null : existing.notes,
        tags: has("tags") ? parsed.tags ?? [] : existing.tags,
      };

      // Optimistic locking : on vérifie que personne n'a modifié le client
      // entre le moment où on l'a lu et maintenant
      try {
        const client = await db.client.update({
          where: {
            id: parsed.id,
            updatedAt: existing.updatedAt,
          },
          data: clientData,
        });

        revalidatePath("/clients");
        revalidatePath("/quotes");

        return { success: true, data: client };
      } catch (updateErr) {
        if (
          updateErr instanceof Prisma.PrismaClientKnownRequestError &&
          updateErr.code === "P2025"
        ) {
          return {
            success: false,
            error:
              "Le client a été modifié par un autre utilisateur. Veuillez rafraîchir.",
          };
        }
        throw updateErr;
      }
    }

    // ── CREATE ──────────────────────────────────────────────────────────
    if (!parsed.name || !parsed.name.trim()) {
      return { success: false, error: "Le nom du client est obligatoire" };
    }

    const clientData: Prisma.ClientCreateInput = {
      name: parsed.name ?? "",
      email: parsed.email ?? null,
      phone: parsed.phone ?? null,
      address: parsed.address ?? null,
      addressLine2: parsed.addressLine2 ?? null,
      city: parsed.city ?? null,
      postalCode: parsed.postalCode ?? null,
      country: parsed.country ?? "CI",
      taxId: parsed.taxId ?? null,
      tvaNumber: parsed.tvaNumber ?? null,
      legalForm: parsed.legalForm ?? null,
      representativeName: parsed.representativeName ?? null,
      representativePosition: parsed.representativePosition ?? null,
      notes: parsed.notes ?? null,
      tags: parsed.tags ?? [],
      user: {
        connect: { id: authId },
      },
    };

    const client = await db.client.create({ data: clientData });

    revalidatePath("/clients");
    revalidatePath("/quotes");

    return { success: true, data: client };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "ZodError") {
      return {
        success: false,
        error: "Données invalides",
        zodErrors: JSON.parse(JSON.stringify(err)),
      };
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
 *
 * Utilise `deleteMany` directement — les contraintes ON DELETE CASCADE
 * définies dans le schéma Prisma se chargent automatiquement de nettoyer
 * les Quote, QuoteLine et ClientActivity associés.
 *
 * Plus besoin de transaction manuelle : la base de données gère
 * la cohérence référentielle, ce qui élimine les risques de timeout (P2028).
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
    return {
      success: false,
      error: "Erreur lors de la suppression groupée",
    };
  }
}