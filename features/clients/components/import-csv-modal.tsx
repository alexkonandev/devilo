"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { cn } from "@/lib/utils";
import { DS_MICRO, DS_BUTTON, DS_ICON_WRAPPER } from "@/lib/design-system";
import {
  UploadSimple,
  FileCsv,
  X,
  CheckCircle,
  Warning,
  UserPlus,
} from "@phosphor-icons/react";
import { importClientsAction, ClientImportRow } from "@/actions/client-import-action";
import { toast } from "sonner";

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CSVRow {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  taxId?: string;
  tvaNumber?: string;
  legalForm?: string;
  representativeName?: string;
  representativePosition?: string;
  notes?: string;
  tags?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ParsedResult {
  data: CSVRow[]; // full parsed data (used for import)
  preview: CSVRow[]; // first rows for UI preview
  errors: ValidationError[];
  validRows: number;
}

export function ImportCSVModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportCSVModalProps) {
  const [parsedData, setParsedData] = useState<ParsedResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: number;
    duplicates: number;
  } | null>(null);

  const validateRow = (row: CSVRow, index: number): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!row.name || row.name.trim() === "") {
      errors.push({
        row: index + 1,
        field: "name",
        message: "Nom obligatoire",
      });
    }

    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push({
        row: index + 1,
        field: "email",
        message: "Email invalide",
      });
    }

    return errors;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";", // Match export format (French CSV uses semicolon)
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        const allErrors: ValidationError[] = [];
        let validRows = 0;

        // Map old French headers to new English headers
        const headerMap: Record<string, keyof CSVRow> = {
          Nom: "name",
          nom: "name",
          name: "name",
          Email: "email",
          email: "email",
          Téléphone: "phone",
          telephone: "phone",
          phone: "phone",
          Adresse: "address",
          adresse: "address",
          address: "address",
          SIRET_TaxID: "taxId",
          taxId: "taxId",
          TVA: "tvaNumber",
          tvaNumber: "tvaNumber",
          "Forme juridique": "legalForm",
          legalForm: "legalForm",
          Représentant: "representativeName",
          representativeName: "representativeName",
          Fonction: "representativePosition",
          representativePosition: "representativePosition",
          Tags: "tags",
          tags: "tags",
        };

        // Transform rows to handle both old and new formats
        const transformedData: CSVRow[] = results.data.map((rawRow) => {
          const row: CSVRow = {};
          Object.entries(rawRow).forEach(([key, value]) => {
            const mappedKey = headerMap[key];
            if (mappedKey) {
              // Ensure 'name' is always a string
              if (mappedKey === "name") {
                row[mappedKey] = value || "";
              } else {
                row[mappedKey] = value;
              }
            }
          });
          return row;
        });

        transformedData.forEach((row, index) => {
          const rowErrors = validateRow(row, index);
          allErrors.push(...rowErrors);
          if (rowErrors.length === 0) validRows++;
        });

        setParsedData({
          data: transformedData,
          preview: transformedData.slice(0, 10),
          errors: allErrors,
          validRows,
        });
        setImportResult(null);
      },
      error: (error: { message: string }) => {
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
      // Import all rows, not just the preview slice
      const result = await importClientsAction(parsedData.data as ClientImportRow[]);
      setImportResult(result);
      if (result.success > 0) {
        toast.success(`${result.success} clients importés avec succès`);
        onSuccess();
      }
      if (result.errors > 0) {
        toast.error(`${result.errors} erreurs lors de l'import`);
      }
      if (result.duplicates > 0) {
        toast.info(`${result.duplicates} doublons ignorés`);
      }
    } catch {
      toast.error("Erreur lors de l'import");
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setParsedData(null);
    setImportResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
              <FileCsv size={18} className="text-indigo-600" />
            </div>
            <h2 className={cn(DS_MICRO, "font-semibold text-slate-900")}>
              Importer des clients (CSV)
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
                Format attendu: name, email, phone, address, taxId, tvaNumber,
                tags
              </p>
            </div>
          ) : importResult ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded bg-emerald-50 flex items-center justify-center">
                  <CheckCircle size={24} className="text-emerald-600" />
                </div>
                <h3
                  className={cn(DS_MICRO, "font-semibold text-slate-900 mb-1")}
                >
                  Import terminé
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded bg-emerald-50 text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {importResult.success}
                  </div>
                  <div className={cn(DS_MICRO, "text-emerald-700")}>
                    Importés
                  </div>
                </div>
                <div className="p-3 rounded bg-amber-50 text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {importResult.duplicates}
                  </div>
                  <div className={cn(DS_MICRO, "text-amber-700")}>Doublons</div>
                </div>
                <div className="p-3 rounded bg-rose-50 text-center">
                  <div className="text-2xl font-bold text-rose-600">
                    {importResult.errors}
                  </div>
                  <div className={cn(DS_MICRO, "text-rose-700")}>Erreurs</div>
                </div>
              </div>

              <button onClick={handleReset} className={cn(DS_BUTTON, "w-full")}>
                Importer un autre fichier
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview header */}
              <div className="flex items-center justify-between">
                <h3 className={cn(DS_MICRO, "font-medium text-slate-700")}>
                  Aperçu ({parsedData.preview.length} lignes)
                </h3>
                <div className="flex items-center gap-3">
                  {parsedData.errors.length > 0 && (
                    <span className={cn(DS_MICRO, "text-rose-600")}>
                      {parsedData.errors.length} erreurs
                    </span>
                  )}
                  <span className={cn(DS_MICRO, "text-emerald-600")}>
                    {parsedData.validRows} valides
                  </span>
                </div>
              </div>

              {/* Errors */}
              {parsedData.errors.length > 0 && (
                <div className="p-3 rounded bg-rose-50 border border-rose-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Warning size={16} className="text-rose-500" />
                    <span className={cn(DS_MICRO, "font-medium text-rose-700")}>
                      Erreurs de validation
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {parsedData.errors.slice(0, 5).map((err, idx) => (
                      <li key={idx} className={cn(DS_MICRO, "text-rose-600")}>
                        Ligne {err.row}: {err.message}
                      </li>
                    ))}
                    {parsedData.errors.length > 5 && (
                      <li className={cn(DS_MICRO, "text-rose-400")}>
                        ...et {parsedData.errors.length - 5} autres erreurs
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Preview table */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className={cn(DS_MICRO, "px-3 py-2 text-slate-500")}>
                        Nom
                      </th>
                      <th className={cn(DS_MICRO, "px-3 py-2 text-slate-500")}>
                        Email
                      </th>
                      <th className={cn(DS_MICRO, "px-3 py-2 text-slate-500")}>
                        Téléphone
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedData.preview.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td
                          className={cn(
                            DS_MICRO,
                            "px-3 py-2 text-slate-900 truncate max-w-[150px]",
                          )}
                        >
                          {row.name || "-"}
                        </td>
                        <td
                          className={cn(
                            DS_MICRO,
                            "px-3 py-2 text-slate-600 truncate max-w-[150px]",
                          )}
                        >
                          {row.email || "-"}
                        </td>
                        <td
                          className={cn(
                            DS_MICRO,
                            "px-3 py-2 text-slate-600 truncate max-w-[120px]",
                          )}
                        >
                          {row.phone || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {parsedData && !importResult && (
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-200">
            <button
              onClick={handleReset}
              className={cn(
                DS_BUTTON,
                "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              Annuler
            </button>
            <button
              onClick={handleImport}
              disabled={parsedData.validRows === 0 || isImporting}
              className={cn(
                DS_BUTTON,
                "bg-indigo-600 text-white hover:bg-indigo-700",
                (parsedData.validRows === 0 || isImporting) &&
                  "opacity-50 cursor-not-allowed",
              )}
            >
              {isImporting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} />
                  Importer {parsedData.validRows} clients
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
