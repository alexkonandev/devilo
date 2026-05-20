import { Client, QuoteStatus } from "@/app/generated/prisma/client";
import { ActionResponse } from "./quote-editor";

/**
 * Interface pour les listes (lightweight)
 * Champs essentiels pour l'affichage en liste
 */
export interface ClientListItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  taxId: string | null; // Identifiant fiscal (ex: RCCM, SIRET, etc.)
  address: string | null;
  // Champs "rich data" (optionnels en liste; utilisés par l'inspector/export)
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string;
  tvaNumber?: string | null;
  legalForm?: string | null;
  representativeName?: string | null;
  representativePosition?: string | null;
  notes?: string | null;
  tags?: string[];
  totalSpent: number; // Calculé via agrégation pour le ROI business
  quoteCount: number; // KPI de volume
  createdAt: Date;

  // Relation pour l'historique dans l'interface
  quotes: Array<{
    id: string;
    number: string;
    totalAmount: number;
    status: QuoteStatus;
    createdAt: Date;
  }>;
}

/**
 * Interface complète pour la fiche client
 * Inclut tous les champs rich data
 */
export interface ClientFull {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  addressLine2: string | null;
  city: string | null;
  postalCode: string | null;
  country: string;
  taxId: string | null; // SIRET / NCC / RCCM
  tvaNumber: string | null; // TVA intracommunautaire
  notes: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type pour le formulaire d'édition/création
 * Tous les champs optionnels sauf name
 */
export interface EditorClient {
  id?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  taxId?: string | null; // RCCM / SIRET
  tvaNumber?: string | null; // Numéro de TVA
  legalForm?: string | null; // Forme juridique (SARL, SAS, etc.)
  representativeName?: string | null; // Nom du représentant légal
  representativePosition?: string | null; // Fonction (DG, PDG, etc.)
  address?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  notes?: string | null;
  tags?: string[];
}

export type ClientActionResponse = ActionResponse<Client>;
