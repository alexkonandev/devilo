import * as z from "zod";

// REGEX pour accepter www. OU https://
const websiteRegex =
  /^(https?:\/\/|www\.)[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/\S*)?$/;

export const settingsSchema = z.object({
  // IDENTITÉ & BRANDING
  companyName: z.string().min(2, "Nom trop court"),
  companyLogo: z.string().optional().nullable(),
  taxIdLabel: z.string().min(2, "Label requis (ex: NCC)"),
  taxId: z.string().refine(
    (val) => {
      const nccRegex = /^[0-9]{7}[A-Z]{1}$/;
      const rccmRegex = /^[A-Z]{2}-[A-Z]{3}-[0-9]{2,4}-[A-Z]{1}-[0-9]+$/;
      return nccRegex.test(val) || rccmRegex.test(val) || val.length > 5;
    },
    { message: "Format d'identifiant fiscal invalide (Ex: 1234567A)" },
  ),

  // SCHEMA CONTACT
  companyEmail: z.string().email("Format email pro requis"),
  companyPhone: z
    .string()
    .min(14, "Numéro CI incomplet") // Format: 00 00 00 00 00
    .max(14, "Numéro trop long"),

  // STRUCTURE GÉOGRAPHIQUE SEGMENTÉE
  companyCity: z
    .string()
    .min(2, "Ville requise")
    .transform((v) => v.toUpperCase()),
  companyDistrict: z
    .string()
    .min(2, "Commune requise")
    .transform((v) => v.toUpperCase()),
  companyArea: z
    .string()
    .min(2, "Quartier requis")
    .transform((v) => v.toUpperCase()),
  companyAddressDetails: z
    .string()
    .min(5, "Précisions requises")
    .transform((v) => v.toUpperCase()),

  companyWebsite: z
    .string()
    .regex(websiteRegex, "Format : www. ou https://")
    .optional()
    .or(z.literal(""))
    .nullable(),

  // FINANCE (ÉPURÉ & SÉCURISÉ)
  currency: z.string().min(1).default("XOF"),
  // SUPPRESSION DE paymentDetails POUR ÉVITER TOUTE RESPONSABILITÉ
  defaultVatRate: z.number().min(0).max(100).default(18), // Standard Côte d'Ivoire

  // LOGISTIQUE (PILOTAGE DE L'EFFICACITÉ)
  quotePrefix: z.string().min(1).max(10).default("QT-"),
  nextQuoteNumber: z.number().int().positive().default(1),
  defaultTerms: z.string().optional().nullable(),

  // IDENTITÉ BANCAIRE (Phase 5 - Coordonnées de paiement)
  bankName: z.string().optional().nullable(),
  bankIBAN: z
    .string()
    .refine(
      (val) => {
        if (!val || val === "") return true; // Optionnel
        // Validation IBAN basique: 14-34 caractères alphanumériques, commence par 2 lettres
        const ibanRegex =
          /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/;
        return ibanRegex.test(val.replace(/\s/g, ""));
      },
      {
        message: "Format IBAN invalide (Ex: FR14 2004 1010 0505 0001 3M02 606)",
      },
    )
    .optional()
    .nullable(),
  bankSWIFT: z
    .string()
    .refine(
      (val) => {
        if (!val || val === "") return true; // Optionnel
        // SWIFT/BIC: 8 ou 11 caractères alphanumériques
        const swiftRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
        return swiftRegex.test(val);
      },
      { message: "Format SWIFT invalide (Ex: SOGEFRPP)" },
    )
    .optional()
    .nullable(),
  bankBIC: z.string().optional().nullable(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
