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
  date: Date | string; // Ajout de string car les dates venant du serveur peuvent être sérialisées
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
  price: number; // MODIFICATION : Doit correspondre au 'price' de ton action
  category: string; // Gardé car présent dans ton action
  // billingModel est supprimé ici car ton action ne le renvoie pas
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
