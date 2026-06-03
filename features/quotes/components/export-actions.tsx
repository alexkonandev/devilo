"use client";

import React, { useCallback } from "react";
import { cn, formatDateShort, formatPriceCompact, computeTotalHT } from "@/lib/utils";
import { QuoteRegistryItem } from "@/types/quote-registry";
import {
  FileCsv,
  FilePdf,
  DownloadSimple,
} from "@phosphor-icons/react";
import { BTN_SECONDARY } from "@/components/shared/ui/constants";
import { DS_MONO } from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface ExportActionsProps {
  data: QuoteRegistryItem[];
  selectedIds: Set<string>;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  ACCEPTED: "Accepté",
  PAID: "Payé",
  REJECTED: "Refusé",
};

// ═══════════════════════════════════════════════════════════════
// EXPORT CSV
// ═══════════════════════════════════════════════════════════════

function exportCSV(items: QuoteRegistryItem[]) {
  // En-têtes CSV
  const headers = [
    "N° Devis",
    "Client",
    "Date d'émission",
    "Statut",
    "Montant HT",
    "Email Client",
    "Téléphone Client",
  ];

  // Lignes
  const rows = items.map((q) => [
    q.number,
    q.client.name,
    formatDateShort(q.issueDate),
    STATUS_LABELS[q.status] || q.status,
    computeTotalHT(q).toString(),
    q.client.email || "",
    q.client.phone || "",
  ]);

  // Construction du contenu CSV
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Échapper les guillemets et entourer de guillemets si nécessaire
          const escaped = cell.replace(/"/g, '""');
          return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
        })
        .join(","),
    ),
  ].join("\n");

  // Téléchargement
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `devis-export-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════
// EXPORT PDF (via l'API existante)
// ═══════════════════════════════════════════════════════════════

async function exportPDF(items: QuoteRegistryItem[]) {
  // Construire un HTML simple listant les devis exportés
  const totalGlobal = items.reduce((sum, q) => sum + computeTotalHT(q), 0);

  const rowsHtml = items
    .map(
      (q) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: monospace; font-size: 11px;">${q.number}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: monospace; font-size: 11px;">${q.client.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: monospace; font-size: 11px;">${formatDateShort(q.issueDate)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: monospace; font-size: 11px;">${STATUS_LABELS[q.status] || q.status}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: monospace; font-size: 11px; text-align: right;">${computeTotalHT(q).toLocaleString("fr-FR")}</td>
      </tr>
    `,
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; }
          h1 { font-size: 18px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
          .date { font-size: 11px; color: #666; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; }
          th { padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; color: #666; border-bottom: 2px solid #333; }
          td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 11px; }
          .total { margin-top: 24px; text-align: right; font-size: 14px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Export Devis</h1>
        <div class="date">Généré le ${new Date().toLocaleDateString("fr-FR")} — ${items.length} devis</div>
        <table>
          <thead>
            <tr>
              <th>N° Devis</th>
              <th>Client</th>
              <th>Date</th>
              <th>Statut</th>
              <th style="text-align: right;">Montant HT</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="total">Total général : ${totalGlobal.toLocaleString("fr-FR")} XOF</div>
      </body>
    </html>
  `;

  try {
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        html,
        fileName: `devis-export-${new Date().toISOString().split("T")[0]}`,
      }),
    });

    if (!res.ok) throw new Error("Erreur lors de la génération du PDF");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devis-export-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF export error:", error);
    // Fallback: sauvegarder en HTML si le PDF échoue
    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devis-export-${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════

export function ExportActions({ data, selectedIds }: ExportActionsProps) {
  const hasSelection = selectedIds.size > 0;

  const handleExportCSV = useCallback(() => {
    const items = hasSelection
      ? data.filter((q) => selectedIds.has(q.id))
      : data;
    exportCSV(items);
  }, [data, selectedIds, hasSelection]);

  const handleExportPDF = useCallback(() => {
    const items = hasSelection
      ? data.filter((q) => selectedIds.has(q.id))
      : data;
    exportPDF(items);
  }, [data, selectedIds, hasSelection]);

  const labelSuffix = hasSelection
    ? ` (${selectedIds.size} sél.)`
    : ` (${data.length})`;

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleExportCSV}
        className={BTN_SECONDARY}
        title={`Exporter en CSV${labelSuffix}`}
      >
        <FileCsv size={12} weight="duotone" />
        CSV
      </button>
      <button
        onClick={handleExportPDF}
        className={BTN_SECONDARY}
        title={`Exporter en PDF${labelSuffix}`}
      >
        <FilePdf size={12} weight="duotone" />
        PDF
      </button>
      {hasSelection && (
        <span className={cn(DS_MONO, "text-[10px] text-indigo-500 ml-1")}>
          <DownloadSimple size={10} className="inline mr-0.5" weight="bold" />
          {selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}