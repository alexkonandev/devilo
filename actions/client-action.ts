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

interface GetClientsPaginatedParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * RÉCUPÉRATION PAGINÉE DES CLIENTS + SEARCH
 */
export async function getClientsPaginated(
  params: GetClientsPaginatedParams = {}
): Promise<GetClientsPaginatedResult> {
  const { page = 1, limit = 50, search } = params;
  try {
    const authId = await getClerkUserId();
    if (!authId) return { clients: [], total: 0, page, limit, totalPages: 0 };

    const skip = (page - 1) * limit;

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

    const total = await db.client.count({ where: whereClause });

    const clients = await db.client.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        _count: { select: { quotes: true } },
        quotes: {
          select: {
            id: true,
            number: true,
            status: true,
            createdAt: true,
            lines: { select: { quantity: true, unitPrice: true } },
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
          0
        ),
      }));

      const totalSpent = mappedQuotes.reduce(
        (acc, q) => acc + q.totalAmount,
        0
      );

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        taxId: client.taxId,
        notes: client.notes,
        createdAt: client.createdAt,
        quoteCount: client._count.quotes,
        totalSpent,
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
 * @deprecated Utiliser getClientsPaginated pour de nouvelles implémentations
 */
export async function getClients(): Promise<ClientListItem[]> {
  try {
    const authId = await getClerkUserId();
    if (!authId) return [];

    const clients = await db.client.findMany({
      where: { userId: authId },
      include: {
        _count: { select: { quotes: true } },
        quotes: {
          select: {
            id: true,
            number: true,
            status: true,
            createdAt: true,
            lines: { select: { quantity: true, unitPrice: true } },
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
          0
        ),
      }));

      const totalSpent = mappedQuotes.reduce(
        (acc, q) => acc + q.totalAmount,
        0
      );

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        taxId: client.taxId,
        notes: client.notes,
        createdAt: client.createdAt,
        quoteCount: client._count.quotes,
        totalSpent,
        quotes: mappedQuotes,
      };
    });
  } catch (err) {
    console.error("[GET_CLIENTS_ERROR]:", err);
    return [];
  }
}

/**
 * UPSERT CLIENT
 */
export async function upsertClient(data: Record<string, unknown>) {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { success: false, error: "Non autorisé" };

    if (data.userId) delete data.userId;

    const parsed = clientSchema.parse(data);

    if (parsed.id) {
      const existing = await db.client.findFirst({
        where: { id: parsed.id, userId: authId },
      });
      if (!existing) {
        return { success: false, error: "Client introuvable" };
      }

      const has = (key: string) => key in data;

      const clientData: Prisma.ClientUpdateInput = {
        name: has("name") ? parsed.name ?? "" : existing.name,
        email: has("email") ? parsed.email ?? null : existing.email,
        phone: has("phone") ? parsed.phone ?? null : existing.phone,
        address: has("address") ? parsed.address ?? null : existing.address,
        taxId: has("taxId") ? parsed.taxId ?? null : existing.taxId,
        notes: has("notes") ? parsed.notes ?? null : existing.notes,
      };

      try {
        const client = await db.client.update({
          where: { id: parsed.id, updatedAt: existing.updatedAt },
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

    if (!parsed.name || !parsed.name.trim()) {
      return { success: false, error: "Le nom du client est obligatoire" };
    }

    const clientData: Prisma.ClientCreateInput = {
      name: parsed.name ?? "",
      email: parsed.email ?? null,
      phone: parsed.phone ?? null,
      address: parsed.address ?? null,
      taxId: parsed.taxId ?? null,
      notes: parsed.notes ?? null,
      user: { connect: { id: authId } },
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
 * GET CLIENT BY ID
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
            lines: { select: { quantity: true, unitPrice: true } },
          },
        },
      },
    });

    if (!client) return null;

    return client;
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

    await db.client.delete({ where: { id: clientId, userId: authId } });

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
      where: { id: { in: clientIds }, userId: authId },
    });

    revalidatePath("/clients");
    return { success: true, count: result.count };
  } catch (err) {
    console.error("[DELETE_MANY_CLIENTS_ERROR]:", err);
    return { success: false, error: "Erreur lors de la suppression groupée" };
  }
}
