"use client";

import React from "react";
import { useQuotes } from "./quote-context";
import { QuoteStatus } from "@/types/quote-registry";
import { cn } from "@/lib/utils";
import {
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  Clock,
} from "lucide-react";

/**
 * Configuration des onglets de navigation.
 * Associe chaque statut à une icône et une couleur.
 */
const STATUS_CONFIG = [
  {
    id: "ALL",
    label: "Tous les devis",
    icon: LayoutGrid,
    color: "text-slate-500",
  },
  { id: "DRAFT", label: "Brouillons", icon: FileText, color: "text-amber-500" },
  { id: "SENT", label: "Envoyés", icon: Send, color: "text-blue-500" },
  { id: "ACCEPTED", label: "Acceptés", icon: Clock, color: "text-indigo-500" },
  { id: "PAID", label: "Payés", icon: CheckCircle2, color: "text-emerald-500" },
  { id: "REJECTED", label: "Refusés", icon: XCircle, color: "text-rose-500" },
] as const;

export function QuotesStatusNav() {
  const { activeStatus, setActiveStatus, stats } = useQuotes();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {STATUS_CONFIG.map((status) => {
        const Icon = status.icon;
        const isActive = activeStatus === status.id;
        const count =
          stats.countByStatus[status.id as QuoteStatus | "ALL"] || 0;

        return (
          <button
            key={status.id}
            onClick={() => setActiveStatus(status.id as QuoteStatus | "ALL")}
            className={cn(
              "group flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200",
              "hover:bg-slate-100 active:scale-[0.98]",
              isActive ? "bg-slate-100 shadow-sm" : "bg-transparent"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive
                    ? status.color
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive
                    ? "text-slate-900"
                    : "text-slate-500 group-hover:text-slate-700"
                )}
              >
                {status.label}
              </span>
            </div>

            {/* Le Badge Compteur : Crucial pour la visibilité du volume */}
            <span
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors",
                isActive
                  ? "bg-white text-slate-900 border border-slate-200"
                  : "bg-slate-200/50 text-slate-500 group-hover:bg-slate-200"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
