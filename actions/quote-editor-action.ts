"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  QuoteStatus as PrismaQuoteStatus,
  Quote,
} from "@/app/generated/prisma/client";

import { ActiveQuote, ActionResponse } from "@/types/quote-editor";

export async function upsertQuoteAction(
  data: ActiveQuote,
  id: string | null | undefined,
): Promise<ActionResponse<Quote>> {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { success: false, error: "Non autorisé" };

    // ─── VALIDATION STRICTE (Phase 2 - Bloqueurs Critiques) ───
    if (!data.client.name || data.client.name.trim() === "") {
      return {
        success: false,
        error: "Le nom du client est obligatoire pour la conformité légale",
      };
    }

    if (!data.client.address || data.client.address.trim() === "") {
      return {
        success: false,
        error: "L'adresse du client est obligatoire pour la conformité fiscale",
      };
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

    // Récupérer les coordonnées bancaires de l'utilisateur pour le snapshot
    const userBankInfo = await db.user.findUnique({
      where: { id: authId },
      select: {
        bankName: true,
        bankIBAN: true,
        bankSWIFT: true,
        bankBIC: true,
      },
    });

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
      currency: data.currency || "XOF",
      validityDays: validityDays,
      // Snapshot des coordonnées bancaires pour figer les infos au moment de la création
      bankName: userBankInfo?.bankName || null,
      bankIBAN: userBankInfo?.bankIBAN || null,
      bankSWIFT: userBankInfo?.bankSWIFT || null,
      bankBIC: userBankInfo?.bankBIC || null,
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
      quote = await db.quote.update({
        where: { id: existingQuote.id },
        data: {
          ...quoteDataBase,
          number: data.quote.number, // On garde le numéro envoyé par le client en update
          lines: {
            deleteMany: {},
            create: linesData,
          },
        },
      });
    } else {
      // --- MODE CRÉATION : GESTION DE L'INC RÉMENTATION AVEC SÉCURITÉ ---

      // 1. Récupérer les réglages de l'utilisateur
      const userSettings = await db.user.findUnique({
        where: { id: authId },
        select: { quotePrefix: true, nextQuoteNumber: true },
      });

      const prefix = userSettings?.quotePrefix || "INV-";
      let currentNum = userSettings?.nextQuoteNumber || 1;
      let finalGeneratedNumber = `${prefix}${String(currentNum).padStart(
        3,
        "0",
      )}`;

      // 2. 🛡️ BOUCLE DE SÉCURITÉ : Vérifier si le numéro existe déjà
      // Si INV-001 existe, on essaie INV-002, etc., jusqu'à trouver un trou libre.
      let isUnique = false;
      while (!isUnique) {
        const existing = await db.quote.findUnique({
          where: { number: finalGeneratedNumber },
        });

        if (existing) {
          currentNum++; // On incrémente si déjà pris
          finalGeneratedNumber = `${prefix}${String(currentNum).padStart(
            3,
            "0",
          )}`;
        } else {
          isUnique = true;
        }
      }

      // 3. Création de la Quote avec le numéro garanti unique
      quote = await db.quote.create({
        data: {
          ...quoteDataBase,
          number: finalGeneratedNumber,
          lines: {
            create: linesData,
          },
        },
      });

      // 4. ✅ SYNCHRONISATION : On met à jour l'utilisateur avec le prochain numéro réel
      await db.user.update({
        where: { id: authId },
        data: {
          nextQuoteNumber: currentNum + 1,
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

// ✅ Ajoute ceci à ton fichier d'actions server
export async function deleteQuoteAction(
  id: string,
): Promise<ActionResponse<void>> {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { success: false, error: "Non autorisé" };

    await db.quote.delete({
      where: { id, userId: authId },
    });

    revalidatePath("/quotes");
    return { success: true };
  } catch (err) {
    console.error("[DELETE_QUOTE_ERROR]:", err);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}
