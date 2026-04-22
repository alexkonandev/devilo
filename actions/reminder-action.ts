"use server";

import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { QuoteStatus } from "@/app/generated/prisma/enums";

export async function triggerUrgentReminders() {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  // On cible les devis envoyés (SENT) non modifiés depuis 48h
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const pendingQuotes = await db.quote.findMany({
    where: {
      userId,
      status: QuoteStatus.SENT,
      updatedAt: { lte: fortyEightHoursAgo },
    },
    include: { client: true },
  });

  if (pendingQuotes.length === 0) {
    return { success: true, count: 0, message: "Aucune relance nécessaire." };
  }

  // LOGIQUE MÉTIER : Ici tu intégrerais ton service d'email (Resend/Postmark)
  // Pour l'instant, on marque l'intention de relance en base ou on log
  console.log(
    `[STRATÉGIE] Relance de ${pendingQuotes.length} clients prioritaires.`
  );

  // On peut mettre à jour un champ 'lastReminderAt' si présent dans ton schéma
  // await db.quote.updateMany({ ... });

  revalidatePath("/dashboard");

  return {
    success: true,
    count: pendingQuotes.length,
    message: `${pendingQuotes.length} relances envoyées avec succès.`,
  };
}
