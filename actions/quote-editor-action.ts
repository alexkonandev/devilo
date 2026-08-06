"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  QuoteStatus as PrismaQuoteStatus,
  Quote,
  Currency,
} from "@/app/generated/prisma/client";

import { ActiveQuote, ActionResponse } from "@/types/quote-editor";
import { upsertQuoteSchema, updateQuoteInlineSchema } from "@/lib/validations/quote";
import { MAX_QUOTE_LINES } from "@/lib/constants";
import { logQuoteEventAction } from "./quote-event-action";
import { canCreateQuote } from "@/lib/subscription";

export async function upsertQuoteAction(
  data: ActiveQuote,
  id: string | null | undefined,
): Promise<ActionResponse<Quote>> {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { success: false, error: "Non autorisé" };

    // ─── VALIDATION ZOD ───
    const parsed = upsertQuoteSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      };
    }

    // ─── VALIDATION LIMITE DE LIGNES ───
    if (data.items.length > MAX_QUOTE_LINES) {
      return {
        success: false,
        error: `Le devis ne peut pas contenir plus de ${MAX_QUOTE_LINES} lignes. Veuillez réduire le nombre de prestations.`,
      };
    }

    // ─── VÉRIFICATION DU QUOTA DE CRÉATION ───
    const isCreation = !id;
    if (isCreation) {
      const quota = await canCreateQuote();
      if (!quota.allowed) {
        return {
          success: false,
          error: `Quota de devis atteint (${quota.quotaUsed}/${quota.quotaLimit}). Supprimez un devis existant ou réinitialisez les données de test en mode démo.`,
        };
      }
    }

    // 1. Gestion du Client (Idempotent)
    let client = await db.client.findFirst({
      where: { name: data.client.name, userId: authId },
    });

    if (!client && data.client.name) {
      client = await db.client.create({
        data: {
          name: data.client.name,
          email: data.client.email || "",
          address: data.client.address || "",
          taxId: data.client.taxId || "",
          userId: authId,
        },
      });
    }

    if (!client) {
      return {
        success: false,
        error: "Un client valide est requis pour sauvegarder le devis",
      };
    }

    // Préparation des lignes avec baseCost
    const linesData = data.items.map((item) => ({
      title: item.title,
      subtitle: item.subtitle || "",
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      baseCost: Number(item.baseCost) || 0,
    }));

    // Calcul automatique de la date d'échéance si non fournie
    const issueDate = new Date(data.quote.issueDate);
    const validityDays = data.validityDays || 30;
    const dueDate = data.quote.dueDate
      ? new Date(data.quote.dueDate)
      : new Date(issueDate.getTime() + validityDays * 24 * 60 * 60 * 1000);

    const validClientId: string = client.id;

    // Base des données pour la Quote (sans le numéro pour l'instant)
    // ─── SNAPSHOT ÉTENDU (Phase 2 - Bloqueurs Critiques) ───
    const currency = (data.currency || "XOF") as Currency;
    const quoteDataBase = {
      title: data.title,
      status: (data.quote.status as PrismaQuoteStatus) || "DRAFT",
      companyName: data.company.name,
      companyEmail: data.company.email,
      companyAddress: data.company.address,
      companyTaxId: data.company.taxId,
      companyTaxIdL: data.company.taxIdLabel,
      companyWebsite: data.company.website,
      clientName: data.client.name,
      clientEmail: data.client.email,
      clientAddress: data.client.address,
      clientTaxId: data.client.taxId,
      // Nouveaux champs légaux
      dueDate: dueDate,
      currency,
      validityDays: validityDays,
      vatRatePercent: Number(data.financials.vatRatePercent) || 0,
      discount: Number(data.financials.discountAmount) || 0,
      terms: data.quote.terms || "",
      clientId: validClientId,
      userId: authId,
    };

    let quote: Quote;

    // 2. LOGIQUE DE SAUVEGARDE INTELLIGENTE
    const existingQuote = id
      ? await db.quote.findUnique({ where: { id, userId: authId } })
      : null; // On ne cherche plus par numéro ici pour éviter les conflits lors de la création

    if (existingQuote) {
      // --- MODE UPDATE ---
      console.log("[UPSERT_UPDATE] Mode UPDATE pour le devis:", existingQuote.id);
      console.log("[UPSERT_UPDATE] linesData reçues:", JSON.stringify(linesData));
      console.log("[UPSERT_UPDATE] data.items.length:", data.items.length);
      console.log("[UPSERT_UPDATE] Nombre de lignes à créer:", linesData.length);
      console.log("[UPSERT_UPDATE] Lignes existantes en DB avant update: non chargées (findUnique sans include lines)");

      quote = await db.quote.update({
        where: { id: existingQuote.id, userId: authId },
        data: {
          ...quoteDataBase,
          lines: {
            deleteMany: {},
            create: linesData,
          },
        },
      });

      console.log("[UPSERT_UPDATE] UPDATE réussi, quote.lines après update:", "non inclus dans le retour");
    } else {
      // --- MODE CRÉATION : incrémentation atomique ---
      // Numérotation purement numérique : 001, 002, 003...
      // Retourner l'objet créé directement depuis la transaction
      // (évite un findUniqueOrThrow après la transaction qui peut échouer)
      const [createdQuote] = await db.$transaction(async (tx) => {
        const currentNum = await tx.user.findUnique({
          where: { id: authId },
          select: { nextQuoteNumber: true },
        });

        const nextNum = currentNum?.nextQuoteNumber || 1;
        const finalNumber = String(nextNum).padStart(3, "0");

        const newQuote = await tx.quote.create({
          data: {
            ...quoteDataBase,
            number: finalNumber,
            lines: { create: linesData },
          },
        });

        await tx.user.update({
          where: { id: authId },
          data: { nextQuoteNumber: nextNum + 1 },
        });

        return [newQuote] as const;
      });

      quote = createdQuote;
    }

    // Logger la création si c'est bien une création (pas un update)
    if (!existingQuote) {
      await logQuoteEventAction(quote.id, "created", {
        number: quote.number,
        clientName: data.client.name,
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

/**
 * Mise à jour inline d'un devis depuis la sidebar
 * Seuls les champs éditables inline sont modifiés
 */
/**
 * Récupère les N derniers brouillons pour le sélecteur de devis
 */
export async function listDraftQuotesAction(limit = 20, clientName?: string) {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { success: false, error: "Non autorisé", data: [] };

    const whereClause: Record<string, unknown> = { userId: authId };
    if (clientName) {
      whereClause.clientName = clientName;
    }

    const quotes = await db.quote.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: {
        id: true,
        number: true,
        clientName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, data: quotes };
  } catch (err) {
    console.error("[LIST_DRAFT_QUOTES_ERROR]:", err);
    return { success: false, error: "Erreur de récupération", data: [] };
  }
}

/**
 * Récupère un devis complet par son ID pour édition
 */
export async function getQuoteByIdAction(id: string) {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { success: false, error: "Non autorisé" };

    const quote = await db.quote.findUnique({
      where: { id, userId: authId },
      include: { lines: true, client: true },
    });

    if (!quote) return { success: false, error: "Devis non trouvé" };

    // Transformer en format EditorActiveQuote
    const activeQuote: ActiveQuote = {
      id: quote.id,
      title: quote.title,
      company: {
        name: quote.companyName || "",
        email: quote.companyEmail || "",
        address: quote.companyAddress || "",
        taxId: quote.companyTaxId || "",
        taxIdLabel: quote.companyTaxIdL || "NCC",
        website: quote.companyWebsite || "",
      },
      client: {
        name: quote.clientName || "",
        email: quote.clientEmail || "",
        address: quote.clientAddress || "",
        taxId: quote.clientTaxId || "",
      },
      quote: {
        number: quote.number,
        issueDate: quote.issueDate?.toISOString().split("T")[0] || "",
        dueDate: quote.dueDate?.toISOString().split("T")[0],
        terms: quote.terms || "",
        status: quote.status as PrismaQuoteStatus,
      },
      currency: quote.currency || "XOF",
      validityDays: quote.validityDays || 30,
      financials: {
        vatRatePercent: quote.vatRatePercent || 0,
        discountAmount: quote.discount || 0,
      },
      items: quote.lines.map((line) => ({
        title: line.title,
        subtitle: line.subtitle || "",
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        baseCost: line.baseCost || 0,
      })),
    };

    return { success: true, data: activeQuote };
  } catch (err) {
    console.error("[GET_QUOTE_BY_ID_ERROR]:", err);
    return { success: false, error: "Erreur de récupération" };
  }
}

/**
 * Mise à jour inline d'un devis depuis la sidebar
 * Seuls les champs éditables inline sont modifiés
 */
export async function updateQuoteInlineAction(
  id: string,
  data: {
    number?: string;
    issueDate?: string;
    status?: string;
    vatRatePercent?: number;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    clientAddress?: string;
    clientCity?: string;
    clientPostalCode?: string;
    clientCountry?: string;
    clientTaxId?: string;
    lines?: Array<{
      id?: string;
      title: string;
      subtitle?: string;
      quantity: number;
      unitPrice: number;
    }>;
  },
): Promise<ActionResponse<Quote>> {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { success: false, error: "Non autorisé" };

    // ─── VALIDATION ZOD ───
    const parsed = updateQuoteInlineSchema.safeParse({ id, data });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      };
    }

    // Valider que l'utilisateur a accès à ce devis
    const existing = await db.quote.findUnique({
      where: { id, userId: authId },
      include: { client: true },
    });
    if (!existing) {
      return { success: false, error: "Devis non trouvé" };
    }

    // Mise à jour des champs du devis
    const quoteUpdate: Record<string, unknown> = {};
    if (data.number !== undefined) quoteUpdate.number = data.number;
    if (data.issueDate !== undefined) quoteUpdate.issueDate = new Date(data.issueDate);
    if (data.status !== undefined) quoteUpdate.status = data.status as PrismaQuoteStatus;
    if (data.vatRatePercent !== undefined) quoteUpdate.vatRatePercent = data.vatRatePercent;

    // Mise à jour des champs du client
    const clientUpdate: Record<string, unknown> = {};
    if (data.clientName !== undefined) clientUpdate.name = data.clientName;
    if (data.clientEmail !== undefined) clientUpdate.email = data.clientEmail;
    if (data.clientPhone !== undefined) clientUpdate.phone = data.clientPhone;
    if (data.clientAddress !== undefined) clientUpdate.address = data.clientAddress;
    if (data.clientCity !== undefined) clientUpdate.city = data.clientCity;
    if (data.clientPostalCode !== undefined) clientUpdate.postalCode = data.clientPostalCode;
    if (data.clientCountry !== undefined) clientUpdate.country = data.clientCountry;
    if (data.clientTaxId !== undefined) clientUpdate.taxId = data.clientTaxId;

    // ─── VALIDATION LIMITE DE LIGNES ───
    if (data.lines !== undefined && data.lines.length > MAX_QUOTE_LINES) {
      return {
        success: false,
        error: `Le devis ne peut pas contenir plus de ${MAX_QUOTE_LINES} lignes. Veuillez réduire le nombre de prestations.`,
      };
    }

    // Mise à jour des lignes si fournies
    if (data.lines !== undefined) {
      quoteUpdate.lines = {
        deleteMany: {},
        create: data.lines.map((line) => ({
          title: line.title,
          subtitle: line.subtitle || "",
          quantity: Number(line.quantity),
          unitPrice: Number(line.unitPrice),
        })),
      };
    }

    // Appliquer les mises à jour
    const quote = await db.quote.update({
      where: { id },
      data: {
        ...quoteUpdate,
        client: Object.keys(clientUpdate).length > 0
          ? { update: clientUpdate }
          : undefined,
      },
    });

    // Si le statut a changé, logger l'événement
    if (data.status !== undefined && data.status !== existing.status) {
      await logQuoteEventAction(quote.id, "status_changed", {
        from: existing.status,
        to: data.status,
      });
    }

    revalidatePath("/quotes");
    return { success: true, data: quote };
  } catch (err) {
    console.error("[UPDATE_QUOTE_INLINE_ERROR]:", err);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

