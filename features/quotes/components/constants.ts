// ═══════════════════════════════════════════════════════════════
// CONSTANTES PARTAGÉES — Quotes Module
// ═══════════════════════════════════════════════════════════════
import { QuoteStatus, DateRange } from "@/types/quote-registry";

export const STATUS_TABS: { label: string; value: QuoteStatus | "ALL" }[] = [
  { label: "Tous", value: "ALL" },
  { label: "Brouillon", value: "DRAFT" },
  { label: "Envoyé", value: "SENT" },
  { label: "Accepté", value: "ACCEPTED" },
  { label: "Payé", value: "PAID" },
  { label: "Refusé", value: "REJECTED" },
  { label: "Annulé", value: "CANCELLED" },
];

export const TAB_ACTIVE =
  "px-3 py-1.5 rounded-md bg-slate-900 text-white transition-all";
export const TAB_INACTIVE =
  "px-3 py-1.5 rounded-md bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700 transition-all";

export const DATE_RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: "7 jours", value: "7d" },
  { label: "30 jours", value: "30d" },
  { label: "Ce mois", value: "month" },
  { label: "Personnalisé", value: "custom" },
];

export const PAGE_SIZE = 20;