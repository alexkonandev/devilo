"use server";

import { prisma } from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";

export interface ClientImportRow {
  name: string;
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

export async function importClientsAction(data: ClientImportRow[]) {
  const authId = await getClerkUserId();
  if (!authId) {
    return { success: 0, errors: 0, duplicates: 0, error: "Non autorisé" };
  }

  let success = 0;
  let errors = 0;
  let duplicates = 0;

  // Get existing emails for duplicate detection
  const existingEmails = new Set<string>();
  const existingClients = await prisma.client.findMany({
    where: { userId: authId },
    select: { email: true },
  });
  existingClients.forEach((c) => {
    if (c.email) existingEmails.add(c.email.toLowerCase());
  });

  for (const row of data) {
    try {
      if (!row.name || row.name.trim() === "") {
        errors++;
        continue;
      }

      // Check for duplicate by email
      if (row.email && existingEmails.has(row.email.toLowerCase())) {
        duplicates++;
        continue;
      }

      // Parse tags
      const tags = row.tags
        ? row.tags.split(";").map((t) => t.trim()).filter(Boolean)
        : [];

      await prisma.client.create({
        data: {
          name: row.name.trim(),
          email: row.email?.trim() || null,
          phone: row.phone?.trim() || null,
          address: row.address?.trim() || null,
          addressLine2: row.addressLine2?.trim() || null,
          city: row.city?.trim() || null,
          postalCode: row.postalCode?.trim() || null,
          country: row.country?.trim() || "CI",
          taxId: row.taxId?.trim() || null,
          tvaNumber: row.tvaNumber?.trim() || null,
          legalForm: row.legalForm?.trim() || null,
          representativeName: row.representativeName?.trim() || null,
          representativePosition: row.representativePosition?.trim() || null,
          notes: row.notes?.trim() || null,
          tags: tags.length > 0 ? tags : [],
          userId: authId,
        },
      });

      success++;
      if (row.email) existingEmails.add(row.email.toLowerCase());
    } catch {
      errors++;
    }
  }

  return { success, errors, duplicates };
}
