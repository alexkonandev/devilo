// @/lib/email.ts
// Module d'envoi d'emails via Resend

import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Créer l'instance Resend uniquement si la clé est disponible
function createResend(): Resend | null {
  if (!RESEND_API_KEY) {
    console.warn("[EMAIL] RESEND_API_KEY non configurée — emails désactivés");
    return null;
  }
  return new Resend(RESEND_API_KEY);
}

export interface SendQuoteEmailParams {
  to: string | string[];
  subject: string;
  quoteNumber: string;
  clientName: string;
  pdfBuffer: Buffer;
  pdfFileName: string;
  message?: string;
}

export async function sendQuoteEmail(params: SendQuoteEmailParams) {
  const resend = createResend();
  if (!resend) {
    return { success: false, error: "EMAIL_NON_CONFIGURÉ" };
  }

  const fromEmail = process.env.EMAIL_FROM || "noreply@devis-express.app";
  const fromName = process.env.EMAIL_FROM_NAME || "Devis Express";

  try {
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: buildQuoteEmailHtml({
        clientName: params.clientName,
        quoteNumber: params.quoteNumber,
        message: params.message,
      }),
      attachments: [
        {
          filename: params.pdfFileName,
          content: params.pdfBuffer.toString("base64"),
        },
      ],
    });

    if (error) {
      console.error("[EMAIL_SEND_ERROR]:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Erreur inconnue lors de l'envoi";
    console.error("[EMAIL_SEND_EXCEPTION]:", err);
    return { success: false, error: msg };
  }
}

/**
 * Template HTML pour l'email de devis
 */
function buildQuoteEmailHtml({
  clientName,
  quoteNumber,
  message,
}: {
  clientName: string;
  quoteNumber: string;
  message?: string;
}): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://devis-express.app";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f4;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin:0 0 4px 0;font-size:18px;font-weight:800;color:#1e293b;letter-spacing:-0.3px;">
                      Votre devis
                    </h1>
                    <p style="margin:0;font-size:13px;color:#64748b;font-weight:500;">
                      Réf: <strong style="color:#1e293b;">${quoteNumber}</strong>
                    </p>
                  </td>
                  <td align="right">
                    <img src="${baseUrl}/logo.svg" alt="Devis Express" width="36" height="36" style="border-radius:8px;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Separator -->
          <tr><td style="padding:20px 32px 0 32px;"><div style="height:1px;background-color:#f1f5f9;"></div></td></tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 32px;">
              <p style="margin:0 0 16px 0;font-size:14px;color:#334155;line-height:1.6;">
                Bonjour <strong style="color:#0f172a;">${clientName}</strong>,
              </p>
              <p style="margin:0 0 16px 0;font-size:14px;color:#334155;line-height:1.6;">
                Veuillez trouver ci-joint votre devis <strong style="color:#0f172a;">${quoteNumber}</strong>.
              </p>
              ${
                message
                  ? `<p style="margin:0 0 16px 0;font-size:13px;color:#475569;font-style:italic;border-left:3px solid #6366f1;padding-left:16px;">${message}</p>`
                  : ""
              }
              <p style="margin:0 0 24px 0;font-size:13px;color:#475569;">
                Le PDF est joint à cet email. Vous pouvez également le consulter dans votre espace client.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="background-color:#6366f1;border-radius:8px;padding:12px 28px;">
                    <a href="${baseUrl}" style="color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">
                      Accéder à mon espace
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#f8fafc;">
              <p style="margin:0 0 8px 0;font-size:11px;color:#94a3b8;text-align:center;">
                Cet email a été envoyé automatiquement depuis <strong style="color:#64748b;">Devis Express</strong>.
              </p>
              <p style="margin:0;font-size:10px;color:#cbd5e1;text-align:center;">
                © ${new Date().getFullYear()} Devis Express — Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}