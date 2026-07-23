// types/dashboard.ts — Types enrichis pour le Centre de Commandement

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
  delaiJours: number;
  estUrgent: boolean;
  moyenneClient: number;
  variationMontant: number;
  categorie: string;
  quoteCount: number;
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

export interface MonthlyProgress {
  currentRevenue: number;
  targetRevenue: number;
  percentage: number;
  daysRemaining: number;
}

export interface PipelineBreakdown {
  paid: number;
  sent: number;
  draft: number;
  accepted: number;
  total: number;
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
  // --- Nouveaux champs Centre de Commandement ---
  pipeline: PipelineBreakdown;
  monthlyGoal: MonthlyProgress;
  urgentCount: number;
  totalClients: number;
}