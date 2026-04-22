import { Client, QuoteStatus } from "@/app/generated/prisma/client";
import { ActionResponse } from "./quote-editor";

/**
 * Interface pour le store et les listes
 * Note : 'taxId' est utilisé à la place de 'siret' pour la cohérence Prisma/React
 */
export interface ClientListItem {
  id: string;
  name: string;
  email: string | null;
  taxId: string | null; // Identifiant fiscal (ex: RCCM, SIRET, etc.)
  address: string | null;
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
 * Type pour le dialogue de création (EditorClient)
 * Utilisé dans StudioSidebarLeft et ClientFormDialog
 */
export interface EditorClient {
  id?: string; // Optionnel lors de la création
  name: string;
  email: string | null;
  taxId: string | null;
  address: string | null;
}

export type ClientActionResponse = ActionResponse<Client>;
