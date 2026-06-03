"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Currency } from "@/app/generated/prisma/client";

/**
 * RÉCUPÉRER LE PROFIL COMPLET (POUR LE DASHBOARD & SETTINGS)
 */
export async function getUserProfile() {
  try {
    const authId = await getClerkUserId();
    if (!authId) return null;

    return await db.user.findUnique({
      where: { id: authId },
      include: {
        subscription: true,
      },
    });
  } catch {
    return null;
  }
}

/**
 * METTRE À JOUR LES INFOS ENTREPRISE
 */
export async function updateCompanySettings(data: {
  companyName?: string;
  companyEmail?: string;
  companyAddress?: string;
  companySiret?: string;
  quotePrefix?: string;
  currency?: string;
}) {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { success: false, error: "Non autorisé" };

    const { currency: currencyRaw, ...rest } = data;
    await db.user.update({
      where: { id: authId },
      data: {
        ...rest,
        ...(currencyRaw ? { currency: currencyRaw as Currency } : {}),
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    console.error("[UPDATE_USER_ERROR]:", err);
    return { success: false, error: "Erreur de mise à jour" };
  }
}