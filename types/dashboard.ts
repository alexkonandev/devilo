// types/dashboard.ts

export type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "PAID";

export type Profession =
  | "TECH"
  | "CREATIVE"
  | "MARKETING"
  | "CONTENT"
  | "CONSULTING";

export type BusinessModel = "PROJECT" | "TIME" | "RECURRING" | "UNIT";

export interface DashboardActivity {
  id: string;
  amount: number;
  status: QuoteStatus;
  clientName: string;
  projectName: string;
  quoteNumber: string;
  date: Date | string;
  // --- Nouveaux champs Phase 1 ---
  delaiJours: number;
  estUrgent: boolean;
  moyenneClient: number;
  variationMontant: number;
  categorie: string;
  quoteCount: number; // Nombre total de devis du client
}

export interface TopClient {
  id: string;
  name: string;
  totalSpent: number;
  quoteCount: number;
  healthScore: "EXCELLENT" | "GOOD" | "SLOW";
  averagePaymentDays: number;
}

export interface SuggestedService {
  id: string;
  title: string;
  price: number;
  category: string;
}

export interface AdvancedDashboardData {
  kpis: {
    totalRevenue: number;
    pendingRevenue: number;
    conversionRate: number;
    activeQuotes: number;
  };
  activity: DashboardActivity[];
  topClients: TopClient[];
  suggestedServices: SuggestedService[];
}