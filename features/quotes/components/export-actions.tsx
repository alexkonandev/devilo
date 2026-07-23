"use client";

import React, { useCallback, useState } from "react";
import { cn, formatDateShort, computeTotalHT } from "@/lib/utils";
import { QuoteRegistryItem } from "@/types/quote-registry";
import {
  FileCsv,
  DownloadSimple,
  UploadSimple,
} from "@phosphor-icons/react";
import { BTN_SECONDARY } from "@/components/shared/ui/constants";
import { DS_MONO } from "@/lib/design-system";
import { ImportQuotesCSVModal } from "./import-quotes-csv-modal";

interface ExportActionsProps {
  data: QuoteRegistryItem[];
  selectedIds: Set<string>;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  PAID: "Payé",
  REJECTED: "Refusé",
};

function exportCSV(items: QuoteRegistryItem[]) {
  const headers = [
    "N° Devis",
    "Client",
    "Date d'émission",
    "Statut",
    "Montant HT",
    "Email Client",
    "Téléphone Client",
  ];

  const rows = items.map((q) => [
    q.number,
    q.client.name,
    formatDateShort(q.issueDate),
    STATUS_LABELS[q.status] || q.status,
    computeTotalHT(q).toString(),
    q.client.email || "",
    q.client.phone || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const escaped = cell.replace(/"/g, '""');
          return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
        })
        .join(","),
    ),
  ].join("\n");

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

export function ExportActions({ data, selectedIds }: ExportActionsProps) {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const hasSelection = selectedIds.size > 0;

  const handleExportCSV = useCallback(() => {
    const items = hasSelection
      ? data.filter((q) => selectedIds.has(q.id))
      : data;
    exportCSV(items);
  }, [data, selectedIds, hasSelection]);

  const labelSuffix = hasSelection
    ? ` (${selectedIds.size} sél.)`
    : ` (${data.length})`;

  return (
    <div className="flex items-center gap-1.5">
      {/* Import CSV */}
      <button
        onClick={() => setImportModalOpen(true)}
        className={BTN_SECONDARY}
        title="Importer des devis (CSV)"
      >
        <UploadSimple size={12} weight="bold" />
      </button>

      {/* Export CSV */}
      <button
        onClick={handleExportCSV}
        className={BTN_SECONDARY}
        title={`Exporter en CSV${labelSuffix}`}
      >
        <FileCsv size={12} weight="duotone" />
      </button>

      {hasSelection && (
        <span className={cn(DS_MONO, "text-[10px] text-indigo-500 ml-1")}>
          <DownloadSimple size={10} className="inline mr-0.5" weight="bold" />
          {selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}
        </span>
      )}

      <ImportQuotesCSVModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => setImportModalOpen(false)}
      />
    </div>
  );
}