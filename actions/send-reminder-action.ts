"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

/**
 * ENVOI D'UNE RELANCE — Action serveur légère pour relancer un client
 * sur un devis envoyé mais sans réponse depuis >7 jours.
 *
 * Phase 4 — Enrichissement du tableau Dernières Actions
 */
export async function sendReminderAction(quoteId: string) {
  try {
    const authId = await getClerkUserId();
    if (!authId) return { success: false, error: "Non autorisé" };

    // 1. Récupérer le devis + client
    const quote = await db.quote.findUnique({
      where: { id: quoteId, userId: authId },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
    });

    if (!quote) return { success: false, error: "Devis introuvable" };
    if (quote.status !== "SENT") {
      return { success: false, error: "Ce devis n'est pas en attente de réponse" };
    }

    const client = quote.client;
    if (!client.email) {
      return { success: false, error: "Le client n'a pas d'adresse email renseignée" };
    }

    // 2. Initialiser SendGrid
    if (!SENDGRID_API_KEY) {
      return { success: false, error: "EMAIL_NON_CONFIGURÉ" };
    }
    sgMail.setApiKey(SENDGRID_API_KEY);

    // 3. Construire et envoyer l'email de relance
    const fromEmail = process.env.EMAIL_FROM || "alexkonan.dev@gmail.com";
    const fromName = process.env.EMAIL_FROM_NAME || "Devilo";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://devilo.app";

    // Calcul du nombre de jours depuis l'envoi
    const daysSince = Math.floor(
      (Date.now() - quote.issueDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    await sgMail.send({
      from: `${fromName} <${fromEmail}>`,
      to: [client.email],
      subject: `Relance — Devis ${quote.number} toujours en attente`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f5f4;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display:inline-block;padding:4px 10px;border-radius:6px;background-color:#fef2f2;color:#e11d48;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:12px;">
                      Relance
                    </span>
                    <h1 style="margin:0 0 4px 0;font-size:18px;font-weight:800;color:#1e293b;letter-spacing:-0.3px;">
                      Devis ${quote.number}
                    </h1>
                    <p style="margin:0;font-size:13px;color:#64748b;">
                      En attente depuis <strong>${daysSince} jours</strong>
                    </p>
                  </td>
                  <td align="right">
                    <img src="${baseUrl}/logo.svg" alt="Devilo" width="36" height="36" style="border-radius:8px;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="padding:20px 32px 0 32px;"><div style="height:1px;background-color:#f1f5f9;"></div></td></tr>
          <tr>
            <td style="padding:24px 32px;">
              <p style="margin:0 0 16px 0;font-size:14px;color:#334155;line-height:1.6;">
                Bonjour <strong style="color:#0f172a;">${client.name}</strong>,
              </p>
              <p style="margin:0 0 16px 0;font-size:14px;color:#334155;line-height:1.6;">
                Nous espérons que tout va bien. Nous souhaitions simplement faire un point sur le devis <strong style="color:#0f172a;">${quote.number}</strong> que nous vous avons envoyé il y a <strong>${daysSince} jours</strong>.
              </p>
              <p style="margin:0 0 24px 0;font-size:14px;color:#334155;line-height:1.6;">
                N'hésitez pas à nous faire un retour, même si vous avez besoin de plus de temps ou d'ajustements. Nous restons à votre disposition pour toute question.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="background-color:#6366f1;border-radius:8px;padding:12px 28px;">
                    <a href="${baseUrl}" style="color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">
                      Voir mon devis
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background-color:#f8fafc;">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
                Cet email a été envoyé automatiquement depuis <strong style="color:#64748b;">Devilo</strong>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    // 4. Journaliser l'activité
    await db.clientActivity.create({
      data: {
        clientId: client.id,
        userId: authId,
        type: "EMAIL",
        content: `Relance envoyée pour le devis ${quote.number} (${daysSince} jours d'attente)`,
      },
    });

    // 5. Revalider
    revalidatePath("/home");

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[SEND_REMINDER_ACTION_ERROR]:", err);
    return { success: false, error: msg };
  }
}