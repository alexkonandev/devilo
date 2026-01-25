import { QuoteStatus as PrismaQuoteStatus } from "@/app/generated/prisma/client";

/**
 * Source de vérité pour les statuts de devis.
 * On utilise l'enum généré par Prisma pour garantir la cohérence avec la DB.
 */
export type QuoteStatus = PrismaQuoteStatus;

/**
 * Structure d'une ligne de prestation au sein d'un devis.
 */
export interface QuoteItemLine {
  title: string;
  subtitle: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Interface "Langue Unique" pour l'éditeur de devis.
 * Elle correspond exactement à l'objet manipulé par le frontend
 * et envoyé à l'action upsertQuoteAction.
 */
export interface ActiveQuote {
  title: string;
  company: {
    name: string;
    email: string;
    address: string;
    siret: string;
    website: string;
  };
  client: {
    name: string;
    email: string;
    address: string;
    siret: string;
  };
  quote: {
    number: string;
    issueDate: string; // ISO string pour faciliter le transit client/serveur
    terms: string;
    status: QuoteStatus | string; // Flexible pour le cast final côté serveur
  };
  financials: {
    vatRatePercent: number;
    discountAmountEuros: number;
  };
  items: QuoteItemLine[];
}
export interface QuoteFilters {
  page: number;
  pageSize: number;
  search?: string;
  status: QuoteStatus | "all";
  sortBy: "updatedAt" | "totalAmount" | "number";
  sortDir: "asc" | "desc";
}

export interface QuoteListItem {
  id: string;
  number: string;
  clientName: string;
  totalAmount: number;
  status: QuoteStatus;
  updatedAt: Date;
  createdAt: Date;
}

export interface PaginatedQuotes {
  items: QuoteListItem[];
  totalCount: number;
  totalPages: number;
}

/**
 * Type utilitaire pour la réponse des actions liées aux devis.
 * Évite l'usage de 'any' dans les retours de promesses.
 */
export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}