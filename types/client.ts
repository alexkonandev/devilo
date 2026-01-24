
import { Client, QuoteStatus } from "@/app/generated/prisma/client";
import { ActionResponse } from "./quote"; // On réutilise l'interface générique

export interface ClientListItem {
  id: string;
  name: string;
  email: string | null;
  siret: string | null;
  address: string | null;
  totalSpent: number; // Somme des devis payés
  quoteCount: number; // Nombre total de dossiers
  createdAt: Date;

  // Relation réelle pour le Registre_Flux_Récents
  quotes: Array<{
    id: string;
    number: string;
    totalAmount: number; // Somme des lignes du devis
    status: QuoteStatus;
    createdAt: Date;
  }>;
}
export type ClientActionResponse = ActionResponse<Client>;
