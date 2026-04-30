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
  totalPipelineValue: number; // Somme HT des SENT (Cash virtuel)
  totalOutstandingValue: number; // En-cours total (DRAFT + SENT + ACCEPTED)
  totalCashCollected: number; // Somme HT des PAID
  conversionRate: number; // % de devis passant de SENT à PAID
  countByStatus: Record<QuoteStatus | "ALL", number>;
  dailyActivity?: Map<string, number>; // Activité des 30 derniers jours pour sparkline
}

/**
 * 4. TIMELINE EVENTS (Pour le panneau de télémétrie)
 */
export interface QuoteTimelineEvent {
  id: string;
  quoteId: string;
  type: "created" | "sent" | "viewed" | "status_changed" | "reminder" | "note";
  status?: QuoteStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  createdBy?: string;
}

/**
 * 5. CONTEXT INTERFACE
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

  // NOUVEAU: Master-Detail Architecture
  activeQuoteId: string | null;
  selectedQuoteIds: Set<string>;
  timeline: QuoteTimelineEvent[];
  isLoadingTimeline: boolean;

  // Setters (UI)
  setSearchQuery: (query: string) => void;
  setSearch: (query: string) => void; // Alias pour compatibilité
  setActiveStatus: (status: QuoteStatus | "ALL") => void;

  // NOUVEAU: Master-Detail
  selectQuote: (quoteId: string | null) => void;
  toggleSelection: (quoteId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // Actions (Mutations)
  updateStatus: (id: string, status: QuoteStatus) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  refresh: () => Promise<void>;

  // NOUVEAU: Quick Actions
  quickStatusChange: (id: string, status: QuoteStatus) => Promise<void>;
}
