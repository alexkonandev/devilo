import {
  Quote,
  Client,
  QuoteLine,
  QuoteStatus as PrismaStatus,
} from "@/app/generated/prisma/client";

/**
 * 1. SHARED & STATUS
 */
export type QuoteStatus = PrismaStatus;

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * 2. REGISTRY DATA (Le Ledger)
 */
export type QuoteRegistryItem = Quote & {
  client: Client;
  lines: QuoteLine[];
};

/**
 * 3. FINANCIAL INTELLIGENCE (Le Dashboard)
 */
export interface QuoteRegistryStats {
  totalPipelineValue: number; // Somme HT des DRAFT + SENT
  totalCashCollected: number; // Somme HT des PAID
  conversionRate: number; // % de devis passant de SENT à PAID
  countByStatus: Record<QuoteStatus | "ALL", number>;
}

/**
 * 4. CONTEXT INTERFACE
 * Ce contrat définit comment l'UI communique avec tes données.
 */
export interface QuoteContextType {
  // Data
  quotes: QuoteRegistryItem[]; // Source brute
  filteredQuotes: QuoteRegistryItem[]; // Source filtrée (Recherche + Statut)
  stats: QuoteRegistryStats; // Calculs financiers

  // State
  isLoading: boolean;
  searchQuery: string;
  search: string; // Alias pour compatibilité
  activeStatus: QuoteStatus | "ALL";

  // Setters (UI)
  setSearchQuery: (query: string) => void;
  setSearch: (query: string) => void; // Alias pour compatibilité
  setActiveStatus: (status: QuoteStatus | "ALL") => void;

  // Actions (Mutations)
  updateStatus: (id: string, status: QuoteStatus) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}
