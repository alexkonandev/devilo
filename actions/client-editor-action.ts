"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { EditorClient } from "@/types/editor";

/**
 * Récupère la liste des clients optimisée pour l'auto-complétion dans l'éditeur.
 * Pas de calculs de CA lourds ici, on veut de la performance.
 */
export async function getEditorClientsAction(): Promise<EditorClient[]> {
  try {
    const authId = await getClerkUserId();
    if (!authId) return [];

    const clients = await db.client.findMany({
      where: { userId: authId },
      orderBy: { name: "asc" },
      // On prend tout pour matcher l'interface EditorClient
    });

    // On s'assure que le retour match exactement EditorClient
    return clients.map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      address: client.address,
      taxId: client.taxId,
      userId: client.userId,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    }));
  } catch (err) {
    console.error("[GET_EDITOR_CLIENTS_ERROR]:", err);
    return [];
  }
}
