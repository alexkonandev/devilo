"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ClientActivityType = "CALL" | "EMAIL" | "NOTE" | "STATUS_CHANGE";

export interface ClientActivityItem {
  id: string;
  clientId: string;
  type: ClientActivityType;
  content: string;
  createdAt: Date;
}

export async function getClientActivitiesAction(
  clientId: string,
): Promise<ClientActivityItem[]> {
  try {
    const authId = await getClerkUserId();
    if (!authId) return [];

    const rows = await db.clientActivity.findMany({
      where: { clientId, userId: authId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        clientId: true,
        type: true,
        content: true,
        createdAt: true,
      },
    });

    return rows as ClientActivityItem[];
  } catch (err) {
    console.error("[GET_CLIENT_ACTIVITIES_ERROR]:", err);
    return [];
  }
}

export async function addClientNoteAction(clientId: string, content: string) {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { success: false, error: "Non autorisé" };

    const clean = content.trim();
    if (!clean) return { success: false, error: "Note vide" };

    await db.clientActivity.create({
      data: {
        clientId,
        userId: authId,
        type: "NOTE",
        content: clean,
      },
    });

    revalidatePath("/clients");
    return { success: true };
  } catch (err) {
    console.error("[ADD_CLIENT_NOTE_ERROR]:", err);
    return { success: false, error: "Erreur lors de l'ajout" };
  }
}

