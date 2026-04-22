import {
  QuoteStatus as PrismaQuoteStatus,
  Theme as PrismaTheme,
  CatalogOffer as PrismaCatalogOffer,
  UserService as PrismaUserService,
} from "@/app/generated/prisma/client";

/**
 * RÉ-EXPORTS PRISMA
 */
export type EditorQuoteStatus = PrismaQuoteStatus;
export type EditorTheme = PrismaTheme;
export type EditorCatalogOffer = PrismaCatalogOffer;
export type EditorUserService = PrismaUserService;

/**
 * INTERFACE CLIENT MANUELLE (Source de vérité Editor)
 * On définit manuellement pour éviter les erreurs de génération PrismaClient.
 * Doit matcher exactement les colonnes de la DB Neon.
 */
export interface EditorClient {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
  taxId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Alias pour la liste de clients
 */
export type ClientListItem = EditorClient;

/**
 * Ligne de prestation
 */
export interface EditorQuoteItem {
  title: string;
  subtitle: string;
  quantity: number;
  unitPrice: number;
  baseCost?: number; // Pour calculer la marge brute (Phase 1)
}

/**
 * Structure de l'objet Actif (Utilisé par Zustand et l'UI)
 */
export interface EditorActiveQuote {
  id?: string;
  title: string;
  company: {
    name: string;
    email: string;
    address: string;
    taxId: string;
    taxIdLabel: string;
    website: string;
  };
  client: {
    name: string;
    email: string;
    address: string;
    taxId: string;
  };
  quote: {
    number: string;
    issueDate: string;
    dueDate?: string; // Date d'échéance (Phase 1)
    terms: string;
    status: EditorQuoteStatus;
  };
  currency: string; // Devise du devis (Phase 1)
  validityDays: number; // Durée de validité en jours (Phase 1)
  financials: {
    vatRatePercent: number;
    discountAmount: number;
  };
  items: EditorQuoteItem[];
}

/**
 * Interface pour l'injection des settings dans l'éditeur
 */
export interface EditorUserSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  taxId: string;
  taxIdLabel: string;
  companyWebsite: string;
  quotePrefix: string;
  nextQuoteNumber: number;
  defaultVatRate: number;
  defaultTerms: string;
  currency: string; // Devise par défaut (Phase 1)
  // --- COORDONNÉES BANCAIRES (Phase 1 - Bloqueurs Critiques) ---
  bankName?: string;
  bankIBAN?: string;
  bankSWIFT?: string;
  bankBIC?: string;
}

export interface EditorActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}
