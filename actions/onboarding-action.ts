"use server";

import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { currentUser, createClerkClient } from "@clerk/nextjs/server";

export type OnboardingData = {
  profession: "TECH" | "CREATIVE" | "MARKETING" | "CONTENT" | "CONSULTING";
  businessModel: "PROJECT" | "TIME" | "RECURRING" | "UNIT";
};

export async function completeOnboardingAction(data: OnboardingData) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return { success: false, error: "Utilisateur non identifié." };
    }

    const authId = user.id;
    const email = user.emailAddresses[0]?.emailAddress;

    // 1. Mise à jour ou Création (Upsert) avec les nouveaux champs par défaut
    // On s'assure que même après un reset DB, l'utilisateur a une structure saine.
    await db.user.upsert({
      where: { id: authId },
      update: {
        profession: data.profession,
        businessModel: data.businessModel,
        isOnboarded: true,
      },
      create: {
        id: authId,
        email: email,
        profession: data.profession,
        businessModel: data.businessModel,
        isOnboarded: true,
        // Champs par défaut pour éviter les erreurs de lecture plus tard
        currency: "EUR",
        taxIdLabel: "SIRET",
        quotePrefix: "INV-",
        nextQuoteNumber: 1,
        defaultVatRate: 20.0,
      },
    });

    // 2. Synchronisation Clerk
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    await clerk.users.updateUserMetadata(authId, {
      publicMetadata: {
        onboardingComplete: true,
      },
    });

    // 3. Purge du cache pour que le middleware lise la nouvelle metadata
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("[ONBOARDING_ERROR]:", error);
    return {
      success: false,
      error: "Erreur technique lors de la création du profil.",
    };
  }
}
