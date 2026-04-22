"use server";

import db from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { settingsSchema, SettingsFormValues } from "@/lib/validations/settings";
import { redirect } from "next/navigation";

export async function updateSettings(rawData: unknown) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "UNAUTHORIZED_ACCESS" };

    // 1. Validation Zod (Strict)
    const validated = settingsSchema.parse(rawData);

    // 2. Nettoyage des chaînes vides -> null pour Prisma
    // On type explicitement pour garantir la correspondance avec le modèle Prisma
    const cleanData: Partial<SettingsFormValues> = Object.fromEntries(
      Object.entries(validated).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    );

    // 3. Update atomique sur la table User
    // On s'assure que cleanData ne contient QUE ce que Prisma accepte
    await db.user.update({
      where: { id: userId },
      data: {
        ...cleanData,
        // On force la devise en XOF si nécessaire pour la cohérence business
        currency: "XOF",
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error: any) {
    // Analyse précise de l'erreur pour ne pas rester dans le flou
    console.error("[SETTINGS_SYNC_CRITICAL_ERROR]:", error.message);

    if (error.code === "P2002") {
      return { success: false, error: "CONFLIT_DE_DONNÉES" };
    }

    return { success: false, error: "SYNC_FAILED" };
  }
}

/**
 * SUPPRESSION DÉFINITIVE DU COMPTE (PRISMA + CLERK)
 * Priorité : Nettoyage total pour éviter les frais de stockage inutiles.
 */
export async function deleteAccount() {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "UNAUTHORIZED_ACCESS" };

    // 1. Suppression atomique dans la DB locale (Prisma gère le cascade si configuré)
    // On s'assure que l'utilisateur existe avant de lancer la machine
    await db.user.delete({
      where: { id: userId },
    });

    // 2. Suppression dans Clerk (Le provider d'auth)
    // On retire l'accès au portail immédiatement
    const client = await clerkClient();
    await client.users.deleteUser(userId);

    // LOG DE SUCCÈS (Tracé business)
    console.log(`[ACCOUNT_TERMINATED]: User ${userId} has been purged.`);

  } catch (error: any) {
    console.error("[ACCOUNT_DELETE_CRITICAL_ERROR]:", error.message);
    return { 
      success: false, 
      error: "La suppression a échoué. Veuillez contacter le support technique." 
    };
  }

  // 3. Redirection finale hors du dashboard
  // On ne peut pas mettre le redirect dans le try car il jette une exception interne à Next.js
  revalidatePath("/");
  redirect("/");
}
