"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  QuoteStatus as PrismaQuoteStatus,
  Quote,
} from "@/app/generated/prisma/client";

// ✅ Importation de la langue unique (Contrat Frontend/Backend)
import {
  ActiveQuote,
  ActionResponse,
} from "@/types/quote-editor";


export async function upsertQuoteAction(
  data: ActiveQuote,
  id: string | null
): Promise<ActionResponse<Quote>> {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { success: false, error: "Non autorisé" };

    // Gestion du Client
    let client = await db.client.findFirst({
      where: { name: data.client.name, userId: authId },
    });

    if (!client) {
      client = await db.client.create({
        data: {
          name: data.client.name,
          email: data.client.email,
          address: data.client.address,
          siret: data.client.siret,
          userId: authId,
        },
      });
    }

    const linesData = data.items.map((item) => ({
      title: item.title,
      subtitle: item.subtitle,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    const quoteData = {
      number: data.quote.number,
      status: data.quote.status as PrismaQuoteStatus,
      vatRatePercent: data.financials.vatRatePercent,
      discountEuros: data.financials.discountAmountEuros,
      terms: data.quote.terms,
      clientId: client.id,
      userId: authId,
    };

    let quote;

    if (id) {
      quote = await db.quote.update({
        where: { id, userId: authId },
        data: {
          ...quoteData,
          lines: {
            deleteMany: {},
            create: linesData,
          },
        },
      });
    } else {
      quote = await db.quote.create({
        data: {
          ...quoteData,
          lines: {
            create: linesData,
          },
        },
      });
    }

    revalidatePath("/quotes");
    revalidatePath(`/quotes/${quote.id}`);

    return { success: true, data: quote };
  } catch (err) {
    console.error("[UPSERT_QUOTE_ERROR]:", err);
    return { success: false, error: "Erreur serveur lors de la sauvegarde" };
  }
}
