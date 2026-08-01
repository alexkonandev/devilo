"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendQuoteEmail } from "@/lib/email";
import { logQuoteEventAction } from "./quote-event-action";

export interface SendQuoteEmailParams {
  quoteId: string;
  message?: string;
  templateId?: string;
}

export async function sendQuoteEmailAction({
  quoteId,
  message,
  templateId,
}: SendQuoteEmailParams) {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { success: false, error: "Non autorisé" };

    // 1. Récupérer le devis (séparément pour éviter les soucis de typage Prisma custom)
    const quote = await db.quote.findUnique({
      where: { id: quoteId, userId: authId },
    });

    if (!quote) {
      return { success: false, error: "Devis introuvable" };
    }

    // 2. Récupérer le client
    const client = await db.client.findUnique({
      where: { id: quote.clientId },
    });

    if (!client) {
      return { success: false, error: "Client introuvable" };
    }

    if (!client.email) {
      return {
        success: false,
        error: "Le client n'a pas d'adresse email renseignée",
      };
    }

    // 3. Récupérer les lignes
    const lines = await db.quoteLine.findMany({
      where: { quoteId },
    });

    // 4. Récupérer les infos utilisateur
    const user = await db.user.findUnique({
      where: { id: authId },
      select: {
        companyName: true,
        companyEmail: true,
        companyAddressDetails: true,
        companyWebsite: true,
        taxId: true,
        taxIdLabel: true,
        currency: true,
      },
    });

    // 5. Construire les données pour le template PDF
    const quoteData = {
      title: quote.title,
      items: lines.map((line) => ({
        title: line.title,
        subtitle: line.subtitle,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        baseCost: line.baseCost,
      })),
      financials: {
        discountAmount: quote.discount,
        vatRatePercent: quote.vatRatePercent,
      },
      company: {
        name: user?.companyName || "",
        email: user?.companyEmail || "",
        address: user?.companyAddressDetails || "",
        website: user?.companyWebsite || "",
        taxId: user?.taxId || "",
        taxIdLabel: user?.taxIdLabel || "RCCM",
      },
      client: {
        name: quote.clientName || client.name,
        email: quote.clientEmail || client.email || "",
        address: quote.clientAddress || client.address || "",
        taxId: quote.clientTaxId || client.taxId || "",
      },
      quote: {
        number: quote.number,
        issueDate: quote.issueDate.toLocaleDateString("fr-FR"),
        dueDate: quote.dueDate
          ? new Date(quote.dueDate).toLocaleDateString("fr-FR")
          : undefined,
        terms: quote.terms || "",
      },
      currency: quote.currency,
      validityDays: quote.validityDays,
    };

    // 6. Appeler l'API print pour générer le PDF
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const pdfResponse = await fetch(`${appUrl}/api/print`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...quoteData, templateId: templateId || "classic-indigo" }),
    });

    if (!pdfResponse.ok) {
      const errBody = await pdfResponse.json().catch(() => ({}));
      return {
        success: false,
        error: `Erreur génération PDF: ${errBody.error || pdfResponse.statusText}`,
      };
    }

    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

    // 7. Envoyer l'email via Resend
    const emailResult = await sendQuoteEmail({
      to: client.email,
      subject: `Votre devis ${quote.number} — ${user?.companyName || "Factouro"}`,
      quoteNumber: quote.number,
      clientName: quote.clientName || client.name,
      pdfBuffer,
      pdfFileName: `Devis-${quote.number}.pdf`,
      message,
    });

    if (!emailResult.success) {
      return {
        success: false,
        error: emailResult.error === "EMAIL_NON_CONFIGURÉ"
          ? "L'envoi d'emails n'est pas configuré (RESEND_API_KEY manquante)"
          : `Erreur d'envoi: ${emailResult.error}`,
      };
    }

    // 8. Logger l'activité dans ClientActivity
    await db.clientActivity.create({
      data: {
        clientId: quote.clientId,
        userId: authId,
        type: "EMAIL",
        content: `Devis ${quote.number} envoyé par email à ${client.email}${message ? ` — ${message}` : ""}`,
      },
    });

    // 9. Logger l'événement d'envoi
    await logQuoteEventAction(quoteId, "sent", {
      email: client.email,
      subject: `Votre devis ${quote.number}`,
      quoteNumber: quote.number,
    });

    // 10. Mettre à jour le statut en SENT si encore en DRAFT
    if (quote.status === "DRAFT") {
      await db.quote.update({
        where: { id: quoteId },
        data: { status: "SENT" },
      });
    }

    revalidatePath("/quotes");
    revalidatePath(`/quotes/${quoteId}`);

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[SEND_QUOTE_EMAIL_ACTION_ERROR]:", err);
    return { success: false, error: msg };
  }
}