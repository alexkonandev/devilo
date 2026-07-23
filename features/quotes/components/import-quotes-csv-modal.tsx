"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { cn } from "@/lib/utils";
import { DS_MICRO } from "@/lib/design-system";
import {
  UploadSimple,
  FileCsv,
  X,
  CheckCircle,
  Warning,
} from "@phosphor-icons/react";
import { toast } from "sonner";

interface ImportQuotesCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CSVRow {
  title?: string;
  clientName?: string;
  clientEmail?: string;
  issueDate?: string;
  status?: string;
  totalHT?: string;
}

interface ParsedResult {
  data: CSVRow[];
  preview: CSVRow[];
  validRows: number;
  errorsCount: number;
}

export function ImportQuotesCSVModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportQuotesCSVModalProps) {
  const [parsedData, setParsedData] = useState<ParsedResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      complete: (results) => {
        const transformedData: CSVRow[] = results.data.map((rawRow) => ({
          title: rawRow["Titre"] || rawRow["title"] || rawRow["N° Devis"] || "",
          clientName: rawRow["Client"] || rawRow["clientName"] || rawRow["client_name"] || "",
          clientEmail: rawRow["Email Client"] || rawRow["clientEmail"] || rawRow["client_email"] || "",
          issueDate: rawRow["Date d'émission"] || rawRow["issueDate"] || rawRow["issue_date"] || "",
          status: rawRow["Statut"] || rawRow["status"] || "",
          totalHT: rawRow["Montant HT"] || rawRow["totalHT"] || rawRow["total_ht"] || "",
        }));

        setParsedData({
          data: transformedData,
          preview: transformedData.slice(0, 10),
          validRows: transformedData.length,
          errorsCount: 0,
        });
        setImportDone(false);
      },
      error: (error) => {
        toast.error("Erreur lors du parsing CSV: " + error.message);
      },
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  const handleImport = async () => {
    if (!parsedData || parsedData.validRows === 0) return;

    setIsImporting(true);
    try {
      // Simuler un délai d'import
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success(`${parsedData.validRows} devis importés avec succès`);
      setImportDone(true);
      onSuccess();
    } catch {
      toast.error("Erreur lors de l'import");
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setParsedData(null);
    setImportDone(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center">
              <FileCsv size={18} className="text-indigo-600" />
            </div>
            <h2 className={cn(DS_MICRO, "font-semibold text-slate-900")}>
              Importer des devis (CSV)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!parsedData ? (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-300 hover:border-slate-400",
              )}
            >
              <input {...getInputProps()} />
              <div className="w-12 h-12 mx-auto mb-4 rounded bg-slate-100 flex items-center justify-center">
                <UploadSimple size={24} className="text-slate-400" />
              </div>
              <p className={cn(DS_MICRO, "text-slate-600 mb-1")}>
                {isDragActive
                  ? "Déposez le fichier ici..."
                  : "Glissez-déposez un fichier CSV ici"}
              </p>
              <p className={cn(DS_MICRO, "text-slate-400")}>
                ou cliquez pour sélectionner
              </p>
              <p className={cn(DS_MICRO, "text-slate-300 mt-4")}>
                Format attendu: title, clientName, clientEmail, issueDate, status, totalHT
              </p>
            </div>
          ) : importDone ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded bg-emerald-50 flex items-center justify-center">
                <CheckCircle size={24} className="text-emerald-600" />
              </div>
              <h3 className={cn(DS_MICRO, "font-semibold text-slate-900 mb-1")}>
                Import terminé
              </h3>
              <p className={cn(DS_MICRO, "text-slate-500")}>
                {parsedData.validRows} devis importés
              </p>
              <button
                onClick={handleReset}
                className="mt-4 px-4 py-2 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Importer un autre fichier
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={cn(DS_MICRO, "font-medium text-slate-700")}>
                  Aperçu ({parsedData.preview.length} lignes)
                </h3>
                <span className={cn(DS_MICRO, "text-emerald-600")}>
                  {parsedData.validRows} lignes valides
                </span>
              </div>

              {/* Preview table */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className={cn(DS_MICRO, "px-3 py-2 text-slate-500")}>Titre</th>
                      <th className={cn(DS_MICRO, "px-3 py-2 text-slate-500")}>Client</th>
                      <th className={cn(DS_MICRO, "px-3 py-2 text-slate-500")}>Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedData.preview.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className={cn(DS_MICRO, "px-3 py-2 text-slate-900 truncate max-w-[200px]")}>
                          {row.title || "-"}
                        </td>
                        <td className={cn(DS_MICRO, "px-3 py-2 text-slate-600 truncate max-w-[150px]")}>
                          {row.clientName || "-"}
                        </td>
                        <td className={cn(DS_MICRO, "px-3 py-2 text-slate-600")}>
                          {row.status || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {parsedData.errorsCount > 0 && (
                <div className="p-3 rounded bg-rose-50 border border-rose-200 flex items-center gap-2">
                  <Warning size={16} className="text-rose-500" />
                  <span className={cn(DS_MICRO, "text-rose-600")}>
                    {parsedData.errorsCount} erreurs détectées
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {parsedData && !importDone && (
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-200">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleImport}
              disabled={parsedData.validRows === 0 || isImporting}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-600 text-white hover:bg-indigo-700 transition-colors",
                (parsedData.validRows === 0 || isImporting) &&
                  "opacity-50 cursor-not-allowed",
              )}
            >
              {isImporting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UploadSimple size={14} />
                  Importer {parsedData.validRows} devis
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}