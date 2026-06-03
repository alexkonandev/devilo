import * as z from "zod";
import { validateIBAN, validateBIC } from "@/lib/iban-validation";
import { Currency } from "@/app/generated/prisma/enums";

// REGEX pour accepter www. OU https://
const websiteRegex =
  /^(https?:\/\/|www\.)[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/\S*)?$/;

// Champs communs à toutes les zones
const baseSettingsSchema = z.object({
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

  // Affichage coordonnées sur devis
  showBankDetailsOnQuotes: z.boolean().default(false),

  // Champ commun banque
  bankName: z.string().max(50, "Max 50 caractères").optional().nullable(),
});

// Schéma USA : routing 9 chiffres + account number
const usaPaymentSchema = baseSettingsSchema.extend({
  paymentZone: z.literal("USA"),
  bankRoutingNumber: z
    .string()
    .regex(/^\d{9}$/, "Le Routing Number doit contenir exactement 9 chiffres"),
  bankAccountNumber: z
    .string()
    .min(4, "Numéro de compte requis")
    .max(17, "Max 17 caractères"),
  bankIBAN: z.string().optional().nullable(),
  bankSWIFT: z.string().optional().nullable(),
  bankBIC: z.string().optional().nullable(),
});

// Schéma EUR : IBAN SEPA obligatoire + BIC
const eurPaymentSchema = baseSettingsSchema.extend({
  paymentZone: z.literal("EUR"),
  bankIBAN: z
    .string()
    .max(34, "IBAN trop long - max 34 caractères")
    .refine(validateIBAN, {
      message: "IBAN invalide - Vérifiez le format (Modulo 97)",
    }),
  bankBIC: z
    .string()
    .max(11, "Max 11 caractères")
    .refine(validateBIC, { message: "Code BIC/SWIFT invalide (ISO 9362)" }),
  bankSWIFT: z.string().max(11).optional().nullable(),
  bankRoutingNumber: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
});

// Schéma AFRI : SWIFT + numéro de compte obligatoires
const afriPaymentSchema = baseSettingsSchema.extend({
  paymentZone: z.literal("AFRI"),
  bankSWIFT: z
    .string()
    .max(11, "Max 11 caractères")
    .refine(validateBIC, { message: "Code SWIFT invalide (ISO 9362)" }),
  bankAccountNumber: z
    .string()
    .min(4, "Numéro de compte / RIB requis")
    .max(30, "Max 30 caractères"),
  bankIBAN: z.string().optional().nullable(),
  bankBIC: z.string().optional().nullable(),
  bankRoutingNumber: z.string().optional().nullable(),
});

export const settingsSchema = z.discriminatedUnion("paymentZone", [
  usaPaymentSchema,
  eurPaymentSchema,
  afriPaymentSchema,
]);

export type SettingsFormValues = z.infer<typeof settingsSchema>;
export type PaymentZone = "USA" | "EUR" | "AFRI";
