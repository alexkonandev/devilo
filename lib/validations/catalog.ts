import { z } from "zod";

export const catalogServiceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Le titre est obligatoire"),
  subtitle: z.string().default(""),
  unitPrice: z.coerce.number().min(0, "Le prix doit être positif"),
  baseCost: z.coerce.number().min(0).default(0),
});

export type CatalogServiceFormValues = z.infer<typeof catalogServiceSchema>;