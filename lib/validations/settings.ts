import * as z from "zod";
import { Currency } from "@/app/generated/prisma/enums";

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

  // CONTACT
  companyEmail: z.string().email("Format email pro requis"),
  companyPhone: z
    .string()
    .min(8, "Numéro incomplet")
    .max(20, "Numéro trop long"),

  // ADRESSE
  companyCity: z
    .string()
    .min(2, "Ville requise")
    .transform((v) => v.toUpperCase()),
  companyAddressDetails: z
    .string()
    .min(5, "Adresse requise")
    .transform((v) => v.toUpperCase()),
  companyWebsite: z
    .string()
    .regex(websiteRegex, "Format : www. ou https://")
    .optional()
    .or(z.literal(""))
    .nullable(),

  // FINANCE
  currency: z.nativeEnum(Currency).default("XOF"),
  defaultVatRate: z.number().min(0).max(100).default(18),

  // LOGISTIQUE
  quotePrefix: z.string().min(1).max(10).default("QT-"),
  nextQuoteNumber: z.number().int().positive().default(1),
  defaultTerms: z.string().optional().nullable(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;