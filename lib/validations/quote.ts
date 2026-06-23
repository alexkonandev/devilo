import { z } from "zod";

// ─── Enums ───
export const QuoteStatusEnum = z.enum([
  "DRAFT",
  "SENT",
  "VIEWED",
  "ACCEPTED",
  "REFUSED",
  "PAID",
  "CANCELLED",
]);

// ─── Upsert Quote ───
export const upsertQuoteSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  client: z.object({
    name: z.string().min(1, "Le nom du client est requis"),
    email: z.string().email("Email invalide").optional().or(z.literal("")).or(z.null()),
    address: z.string().optional().or(z.literal("")).or(z.null()),
    taxId: z.string().optional().or(z.literal("")).or(z.null()),
  }),
  items: z
    .array(
      z.object({
        title: z.string().min(1, "Le titre de la ligne est requis"),
        subtitle: z.string().optional().or(z.literal("")),
        quantity: z.number().positive("La quantité doit être positive"),
        unitPrice: z.number().min(0, "Le prix unitaire ne peut être négatif"),
        baseCost: z.number().min(0).optional().default(0),
      }),
    )
    .min(1, "Au moins une ligne de devis est requise"),
  quote: z.object({
    status: QuoteStatusEnum.optional().default("DRAFT"),
    number: z.string().optional(),
    issueDate: z.string().min(1, "La date d'émission est requise"),
    dueDate: z.string().optional().or(z.literal("")),
    terms: z.string().optional().or(z.literal("")),
  }),
  company: z.object({
    name: z.string().optional().or(z.literal("")),
    email: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    taxId: z.string().optional().or(z.literal("")),
    taxIdLabel: z.string().optional().or(z.literal("")),
    website: z.string().optional().or(z.literal("")),
  }),
  financials: z.object({
    vatRatePercent: z.number().min(0).max(100).optional().default(0),
    discountAmount: z.number().min(0).optional().default(0),
  }),
  currency: z.string().optional().default("XOF"),
  validityDays: z.number().int().positive().optional().default(30),
});

// ─── Inline Quote Line Item ───
export const inlineQuoteLineSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Le titre est requis"),
  subtitle: z.string().optional().or(z.literal("")),
  quantity: z.number().positive("La quantité doit être positive"),
  unitPrice: z.number().min(0, "Le prix unitaire ne peut être négatif"),
});

// ─── Update Inline Quote ───
export const updateQuoteInlineSchema = z.object({
  id: z.string().min(1, "L'ID du devis est requis"),
  data: z.object({
    number: z.string().optional(),
    issueDate: z.string().optional(),
    status: QuoteStatusEnum.optional(),
    vatRatePercent: z.number().min(0).max(100).optional(),
    clientName: z.string().optional(),
    clientEmail: z.string().email("Email invalide").optional().or(z.literal("")),
    clientPhone: z.string().optional().or(z.literal("")),
    clientAddress: z.string().optional(),
    clientCity: z.string().optional().or(z.literal("")),
    clientPostalCode: z.string().optional().or(z.literal("")),
    clientCountry: z.string().optional().or(z.literal("")),
    clientTaxId: z.string().optional().or(z.literal("")),
    lines: z.array(inlineQuoteLineSchema).optional(),
  }),
});

// ─── Update Quote Status ───
export const updateQuoteStatusSchema = z.object({
  id: z.string().min(1, "L'ID du devis est requis"),
  status: QuoteStatusEnum,
});

// ─── Delete Quote ───
export const deleteQuoteSchema = z.object({
  id: z.string().min(1, "L'ID du devis est requis"),
});