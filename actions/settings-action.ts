"use server";

import db from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { getClerkUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { settingsSchema, SettingsFormValues } from "@/lib/validations/settings";
import { redirect } from "next/navigation";
import { Currency } from "@/app/generated/prisma/client";

export async function updateSettings(rawData: unknown) {
  try {
    const userId = await getClerkUserId();
    if (!userId) return { success: false, error: "UNAUTHORIZED_ACCESS" };

    // 1. Validation Zod simplifiée (plus de discriminatedUnion)
    const data = settingsSchema.parse(rawData);

    // 2. Mapping direct — uniquement les champs essentiels
    await db.user.update({
      where: { id: userId },
      data: {
        companyName: data.companyName,
        companyLogo: data.companyLogo ?? null,
        taxIdLabel: data.taxIdLabel,
        taxId: data.taxId,
        companyEmail: data.companyEmail,
        companyPhone: data.companyPhone,
        companyCity: data.companyCity,
        companyAddressDetails: data.companyAddressDetails,
        companyWebsite: data.companyWebsite ?? null,
        currency: data.currency as Currency,
        defaultVatRate: data.defaultVatRate,
        quotePrefix: data.quotePrefix,
        nextQuoteNumber: data.nextQuoteNumber,
        defaultTerms: data.defaultTerms ?? null,
      },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    console.error("[SETTINGS_SYNC_ERROR]:", error.message);
    if (error.code === "P2002")
      return { success: false, error: "CONFLIT_DE_DONNÉES" };
    return { success: false, error: "SYNC_FAILED" };
  }
}

/**
 * SUPPRESSION DÉFINITIVE DU COMPTE (PRISMA + CLERK)
 */
export async function deleteAccount() {
  try {
    const userId = await getClerkUserId();
    if (!userId) return { success: false, error: "UNAUTHORIZED_ACCESS" };

    await db.user.delete({
      where: { id: userId },
    });

    const client = await clerkClient();
    await client.users.deleteUser(userId);

    console.log(`[ACCOUNT_TERMINATED]: User ${userId} has been purged.`);
  } catch (error: any) {
    console.error("[ACCOUNT_DELETE_ERROR]:", error.message);
    return {
      success: false,
      error:
        "La suppression a échoué. Veuillez contacter le support technique.",
    };
  }

  revalidatePath("/");
  redirect("/");
}