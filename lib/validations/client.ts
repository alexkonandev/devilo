import { z } from "zod";

export const clientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom du client est obligatoire"),
  email: z.string().email("Email invalide").nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  addressLine2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  country: z.string().default("CI"),
  taxId: z.string().nullable().optional(),
  tvaNumber: z.string().nullable().optional(),
  legalForm: z.string().nullable().optional(),
  representativeName: z.string().nullable().optional(),
  representativePosition: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;