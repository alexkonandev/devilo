import { Client, QuoteStatus } from "@/app/generated/prisma/client";
import { ActionResponse } from "./quote-editor";

/**
 * Interface pour les listes (lightweight)
 */
export interface ClientListItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  address: string | null;
  notes: string | null;
  totalSpent: number;
  quoteCount: number;
  createdAt: Date;

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
 */
export interface ClientFull {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type pour le formulaire d'édition/création
 */
export interface EditorClient {
  id?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  taxId?: string | null;
  address?: string | null;
  notes?: string | null;
}

export type ClientActionResponse = ActionResponse<Client>;