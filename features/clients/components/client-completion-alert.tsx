"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DS_MONO, DS_BENTO_CARD } from "@/lib/design-system";
import {
  UsersThree,
  ClockCountdown,
  WarningCircle,
  CheckCircle,
  ArrowRight,
} from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════
// CLIENT COMPLETION ALERT — Indicateur client en pleine largeur
// Style identique au CompletionAlert des devis
// ═══════════════════════════════════════════════════════════════

interface AlertItem {
  icon: React.ReactNode;
  count: number;
  label: string;
  detail: string;
  color: string;
  dotColor: string;
}

interface ClientCompletionAlertProps {
  clientsSansDevisCount: number;
  inactiveCount: number;
  hasConcentrationAlert: boolean;
  /** Callback pour activer un filtre spécifique */
  onFilter?: (filter: "all" | "relance" | "inactif") => void;
}

export function ClientCompletionAlert({
  clientsSansDevisCount,
  inactiveCount,
  hasConcentrationAlert,
  onFilter,
}: ClientCompletionAlertProps) {
  const alertItems: AlertItem[] = [];

  if (clientsSansDevisCount > 0) {
    alertItems.push({
      icon: <UsersThree size={14} weight="duotone" />,
      count: clientsSansDevisCount,
      label: "client à solliciter",
      detail: "Aucun devis en cours",
      color: "text-amber-700",
      dotColor: "bg-amber-400",
    });
  }

  if (inactiveCount > 0) {
    alertItems.push({
      icon: <ClockCountdown size={14} weight="duotone" />,
      count: inactiveCount,
      label: "client inactif",
      detail: "+90 jours sans contact",
      color: "text-indigo-600",
      dotColor: "bg-indigo-400",
    });
  }

  if (hasConcentrationAlert) {
    alertItems.push({
      icon: <WarningCircle size={14} weight="duotone" />,
      count: 1,
      label: "concentration CA",
      detail: "Un client > 30% du chiffre",
      color: "text-rose-600",
      dotColor: "bg-rose-400",
    });
  }

  // Tout va bien
  if (alertItems.length === 0) {
    return (
      <div
        className={cn(
          DS_BENTO_CARD,
          "flex items-center gap-3 px-4 py-2.5",
          "bg-emerald-50/60 border-emerald-200",
        )}
      >
        <span className="text-emerald-500">
          <CheckCircle size={16} weight="duotone" />
        </span>
        <span className={cn(DS_MONO, "text-[10px] text-emerald-700 font-semibold uppercase")}>
          Portefeuille sain
        </span>
        <span className={cn(DS_MONO, "text-[10px] text-emerald-500")}>
          — Aucune action requise
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        DS_BENTO_CARD,
        "flex items-center gap-4 px-4 py-2.5",
        "bg-amber-50/60 border-amber-200",
      )}
    >
      {/* Icône gauche */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-amber-500">
          <UsersThree size={16} weight="duotone" />
        </span>
        <span className={cn(DS_MONO, "text-[10px] text-amber-700 font-semibold uppercase")}>
          Attention
        </span>
      </div>

      {/* Séparateur */}
      <div className="w-px h-5 bg-amber-200 shrink-0" />

      {/* Alertes */}
      <div className="flex items-center gap-4 flex-wrap">
        {alertItems.map((alert, idx) => (
          <button
            key={alert.label}
            type="button"
            onClick={() => {
              if (alert.label === "client à solliciter") onFilter?.("relance");
              else if (alert.label === "client inactif") onFilter?.("inactif");
            }}
            className={cn(
              "flex items-center gap-1.5 group",
              "transition-all hover:opacity-80",
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", alert.dotColor)} />
            <span className={cn(alert.color)}>
              {alert.icon}
            </span>
            <span className={cn(DS_MONO, "text-[11px]", alert.color, "font-semibold")}>
              {alert.count}
            </span>
            <span className={cn(DS_MONO, "text-[10px] text-slate-500 group-hover:text-slate-700 transition-colors")}>
              {alert.label}{alert.count > 1 ? "s" : ""}
            </span>
            <span className={cn(DS_MONO, "text-[9px] text-slate-400 hidden sm:inline")}>
              — {alert.detail}
            </span>
            {hasConcentrationAlert && idx === alertItems.length - 1 && (
              <ArrowRight size={12} className="text-rose-400 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Hint cliquable à droite */}
      <span className={cn(DS_MONO, "text-[9px] text-amber-500 ml-auto shrink-0 hidden sm:inline")}>
        Cliquez pour filtrer
      </span>
    </div>
  );
}