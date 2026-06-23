import { z } from "zod";

// ─── Regex helpers ──────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s]{7,15}$/;

// ─── Per-field validators (for real-time client-side feedback) ──────────────

export const validateField = {
  email: (v: string | null | undefined): string | null => {
    if (!v || v.trim() === "") return null; // nullable
    if (!EMAIL_REGEX.test(v.trim())) return "Format email invalide";
    return null;
  },
  phone: (v: string | null | undefined): string | null => {
    if (!v || v.trim() === "") return null; // nullable
    if (!PHONE_REGEX.test(v.trim())) return "Format téléphone invalide (ex: +22501234567)";
    return null;
  },
  name: (v: string | null | undefined): string | null => {
    if (!v || v.trim().length < 1) return "Le nom du client est obligatoire";
    return null;
  },
} as const;

// ─── Main schema ────────────────────────────────────────────────────────────

export const clientSchema = z.object({
  id: z.string().optional(),

  // userId est extrait côté serveur via auth(), jamais du payload client
  userId: z.string().min(1).optional(),

  name: z
    .string()
    .min(1, "Le nom du client est obligatoire")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .email("Format email invalide")
    .nullable()
    .optional(),

  phone: z
    .string()
    .regex(PHONE_REGEX, "Format téléphone invalide (ex: +22501234567)")
    .nullable()
    .optional(),

  address: z
    .string()
    .nullable()
    .optional(),

  taxId: z
    .string()
    .nullable()
    .optional(),

  notes: z
    .string()
    .nullable()
    .optional(),

  tags: z.array(z.string()).default([]),
});

export type ClientFormValues = z.infer<typeof clientSchema>;