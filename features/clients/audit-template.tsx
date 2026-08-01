import { ClientListItem } from "@/types/client";

/**
 * GÉNÉRATEUR DE HTML POUR L'AUDIT CLIENT
 * Designé pour être rendu en PDF via Puppeteer.
 * Utilise un style minimaliste et "data-heavy" pour un rendu pro.
 */
export function generateAuditHtml(client: ClientListItem): string {
  const totalRevenue = client.totalSpent.toLocaleString() + " XOF";
  const date = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const quotesRows = client.quotes
    .map(
      (q) => `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 12px 0; font-size: 11px; font-weight: 700; color: #0f172a;">${q.number}</td>
      <td style="padding: 12px 0; font-size: 11px; color: #64748b;">${new Date(q.createdAt).toLocaleDateString("fr-FR")}</td>
      <td style="padding: 12px 0; font-size: 11px; font-weight: 700; color: #0f172a; text-align: right;">${q.totalAmount.toLocaleString()} XOF</td>
      <td style="padding: 12px 0; text-align: right;">
        <span style="padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase; ${
          q.status === "PAID"
            ? "background-color: #f0fdf4; color: #166534; border: 1px solid #bbf7d0;"
            : q.status === "DRAFT"
            ? "background-color: #fffbeb; color: #92400e; border: 1px solid #fef3c7;"
            : "background-color: #f8fafc; color: #475569; border: 1px solid #e2e8f0;"
        }">${q.status}</span>
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <div style="padding: 40px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #0f172a; background-color: white;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px;">
        <div>
          <div style="font-size: 10px; font-weight: 900; letter-spacing: 0.2em; color: #6366f1; text-transform: uppercase; margin-bottom: 8px;">Audit Client Stratégique</div>
          <h1 style="font-size: 32px; font-weight: 900; letter-spacing: -0.04em; margin: 0; text-transform: uppercase;">${client.name}</h1>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${client.email || "Email non renseigné"}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Généré le</div>
          <div style="font-size: 12px; font-weight: 700;">${date}</div>
        </div>
      </div>

      <!-- KPIs -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 60px;">
        <div style="padding: 20px; background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px;">
          <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">CA Cumulé</div>
          <div style="font-size: 20px; font-weight: 900; color: #6366f1;">${totalRevenue}</div>
        </div>
        <div style="padding: 20px; background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px;">
          <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Volume de Devis</div>
          <div style="font-size: 20px; font-weight: 900; color: #0f172a;">${client.quoteCount}</div>
        </div>
        <div style="padding: 20px; background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px;">
          <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Panier Moyen</div>
          <div style="font-size: 20px; font-weight: 900; color: #0f172a;">${
            client.quoteCount > 0
              ? Math.round(client.totalSpent / client.quoteCount).toLocaleString()
              : 0
          } XOF</div>
        </div>
      </div>

      <!-- Table -->
      <div>
        <h2 style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; color: #64748b; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Historique des Transactions</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="text-align: left;">
              <th style="font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; padding-bottom: 12px;">Référence</th>
              <th style="font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; padding-bottom: 12px;">Date</th>
              <th style="font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; padding-bottom: 12px; text-align: right;">Montant</th>
              <th style="font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; padding-bottom: 12px; text-align: right;">Statut</th>
            </tr>
          </thead>
          <tbody>
            ${quotesRows}
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div style="margin-top: 80px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
        <div style="font-size: 10px; font-weight: 700; color: #cbd5e1; letter-spacing: 0.3em; text-transform: uppercase;">Document Confidentiel — Factouro Performance Console</div>
      </div>
    </div>
  `;
}
