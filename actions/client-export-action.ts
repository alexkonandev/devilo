"use server";

import { prisma } from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";

export interface ClientExportRow {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  tvaNumber: string;
  legalForm: string;
  representativeName: string;
  representativePosition: string;
  notes: string;
  quoteCount: number;
  totalSpent: string;
}

/**
 * Exporte tous les clients de l'utilisateur au format CSV
 * Retourne une chaîne CSV complète avec BOM pour Excel
 */
export async function exportClientsAction(): Promise<{
  success: boolean;
  csv?: string;
  error?: string;
}> {
  try {
    const authId = await getClerkUserId();
    if (!authId) {
      return { success: false, error: "Non autorisé" };
    }

    const clients = await prisma.client.findMany({
      where: { userId: authId },
      include: {
        _count: { select: { quotes: true } },
        quotes: {
          select: {
            lines: { select: { quantity: true, unitPrice: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Construire les lignes d'export
    const rows: ClientExportRow[] = clients.map((client) => {
      const totalSpent = client.quotes.reduce(
        (sum, q) => sum + q.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0),
        0,
      );

      return {
        name: client.name ?? "",
        email: client.email ?? "",
        phone: client.phone ?? "",
        address: client.address ?? "",
        taxId: client.taxId ?? "",
        tvaNumber: client.tvaNumber ?? "",
        legalForm: client.legalForm ?? "",
        representativeName: client.representativeName ?? "",
        representativePosition: client.representativePosition ?? "",
        notes: client.notes ?? "",
        quoteCount: client._count.quotes,
        totalSpent: totalSpent.toString(),
      };
    });

    // Entête CSV (délimiteur point-virgule pour Excel / locale française)
    const headers = [
      "Nom",
      "Email",
      "Téléphone",
      "Adresse",
      "SIRET / TaxID",
      "N° TVA",
      "Forme juridique",
      "Représentant",
      "Fonction",
      "Notes",
      "Nombre de devis",
      "Total dépensé",
    ];

    // Générer le CSV à la main (sans librairie externe)
    const escapeCsv = (val: string): string => {
      if (val.includes(";") || val.includes("\n") || val.includes('"')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    let csv = headers.join(";") + "\n";

    for (const row of rows) {
      const line = [
        escapeCsv(row.name),
        escapeCsv(row.email),
        escapeCsv(row.phone),
        escapeCsv(row.address),
        escapeCsv(row.taxId),
        escapeCsv(row.tvaNumber),
        escapeCsv(row.legalForm),
        escapeCsv(row.representativeName),
        escapeCsv(row.representativePosition),
        escapeCsv(row.notes),
        row.quoteCount.toString(),
        row.totalSpent,
      ];
      csv += line.join(";") + "\n";
    }

    // BOM UTF-8 pour Excel
    const bom = "\uFEFF";
    return { success: true, csv: bom + csv };
  } catch (err) {
    console.error("[EXPORT_CLIENTS_ERROR]:", err);
    return { success: false, error: "Erreur lors de l'export" };
  }
}