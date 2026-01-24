import * as z from "zod";
 // REGEX pour accepter www. OU https://
const websiteRegex = /^(https?:\/\/|www\.)[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/\S*)?$/;

export const settingsSchema = z.object({
  // IDENTITÉ & BRANDING
  companyName: z.string().min(2, "Nom trop court"),
  companyLogo: z.string().optional().nullable(),
  taxIdLabel: z.string().min(2, "Label requis (ex: NCC)"),
  // Le numéro avec validation Regex
  taxId: z.string().refine(
    (val) => {
      // Regex flexible pour l'Afrique de l'Ouest :
      // - NCC Côte d'Ivoire (7 chiffres + 1 lettre)
      // - Ou format RCCM standardisé
      const nccRegex = /^[0-9]{7}[A-Z]{1}$/;
      const rccmRegex = /^[A-Z]{2}-[A-Z]{3}-[0-9]{2,4}-[A-Z]{1}-[0-9]+$/;

      return nccRegex.test(val) || rccmRegex.test(val) || val.length > 5;
    },
    {
      message:
        "Format d'identifiant fiscal invalide (Ex: 1234567A ou CI-ABJ...)",
    }
  ),

// SCHEMA CONTACT
companyEmail: z
  .string()
  .email("Format email pro requis")
  .min(1, "L'email est obligatoire"),

companyPhone: z
  .string()
  .min(14, "Numéro CI incomplet (10 chiffres requis)") // Compte les espaces : 07 00 00 00 00
  .max(14, "Numéro trop long"),

// REMPLACEMENT DE companyAddress PAR LA STRUCTURE SEGMENTÉE
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
  .min(5, "Donnez plus de précisions pour la livraison")
  .transform((v) => v.toUpperCase()),

companyWebsite: z
  .string()
  .regex(websiteRegex, "Le site doit commencer par www. ou https://")
  .optional()
  .or(z.literal(""))
  .nullable(),
  // FINANCE
  currency: z.string().min(1).default("EUR"),
  paymentDetails: z.string().min(5, "Détails de paiement requis"),
  defaultVatRate: z.number().min(0).default(20),

  // LOGISTIQUE
  quotePrefix: z.string().min(1).max(10).default("INV-"),
  nextQuoteNumber: z.number().int().positive().default(1),
  defaultTerms: z.string().optional().nullable(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
