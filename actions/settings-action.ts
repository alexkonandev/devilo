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

    // 1. Validation Zod (discriminatedUnion strict par zone)
    const data = settingsSchema.parse(rawData);

    // 2. Mapping explicite des champs communs (aucun spread dangereux)
    const commonPayload = {
      companyName: data.companyName,
      companyLogo: data.companyLogo ?? null,
      taxIdLabel: data.taxIdLabel,
      taxId: data.taxId,
      companyEmail: data.companyEmail,
      companyPhone: data.companyPhone,
      companyCity: data.companyCity,
      companyAddressDetails: data.companyAddressDetails,
      companyWebsite: data.companyWebsite ?? null,
      currency: data.currency,
      defaultVatRate: data.defaultVatRate,
      quotePrefix: data.quotePrefix,
      nextQuoteNumber: data.nextQuoteNumber,
      defaultTerms: data.defaultTerms ?? null,
      showBankDetailsOnQuotes: data.showBankDetailsOnQuotes,
      paymentZone: data.paymentZone,
      bankName: data.bankName ?? null,
    };

    // 3. Mapping des champs bancaires selon la zone (colonnes null-safe)
    let bankPayload: Record<string, string | null> = {};

    if (data.paymentZone === "USA") {
      bankPayload = {
        bankRoutingNumber: data.bankRoutingNumber,
        bankAccountNumber: data.bankAccountNumber,
        bankIBAN: null,
        bankSWIFT: null,
        bankBIC: null,
      };
    } else if (data.paymentZone === "EUR") {
      bankPayload = {
        bankIBAN: data.bankIBAN.replace(/\s/g, "").toUpperCase(),
        bankBIC: data.bankBIC.toUpperCase(),
        bankSWIFT: data.bankSWIFT?.toUpperCase() ?? null,
        bankRoutingNumber: null,
        bankAccountNumber: null,
      };
    } else {
      bankPayload = {
        bankSWIFT: data.bankSWIFT.toUpperCase(),
        bankAccountNumber: data.bankAccountNumber,
        bankIBAN: null,
        bankBIC: null,
        bankRoutingNumber: null,
      };
    }

    // 4. Update atomique — uniquement les colonnes connues de Prisma
    await db.user.update({
      where: { id: userId },
      data: { ...commonPayload, ...bankPayload },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    console.error("[SETTINGS_SYNC_CRITICAL_ERROR]:", error.message);
    if (error.code === "P2002")
      return { success: false, error: "CONFLIT_DE_DONNÉES" };
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
      error:
        "La suppression a échoué. Veuillez contacter le support technique.",
    };
  }

  // 3. Redirection finale hors du dashboard
  // On ne peut pas mettre le redirect dans le try car il jette une exception interne à Next.js
  revalidatePath("/");
  redirect("/");
}
