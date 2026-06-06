"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { DS_MONO, DS_BENTO_CARD } from "@/lib/design-system";
import { QuoteRegistryItem, QuoteStatus } from "@/types/quote-registry";
import {
  NotePencil,
  ClockClockwise,
  BellRinging,
  CheckCircle,
} from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════
// COMPLETION ALERT — Indicateur intelligent en pleine largeur
// Affiche des actions concrètes : brouillons, attentes, relances
// Ne s'affiche que s'il y a au moins un indicateur actif
// ═══════════════════════════════════════════════════════════════

interface AlertItem {
  icon: React.ReactNode;
  count: number;
  label: string;
  detail: string;
  color: string;
  dotColor: string;
  filterStatus: QuoteStatus;
}

interface CompletionAlertProps {
  quotes: QuoteRegistryItem[];
  /** Callback pour filtrer par statut — relié à setActiveStatus */
  onFilterStatus?: (status: QuoteStatus) => void;
}

const RELANCE_DAYS = 5;

function daysSince(date: Date): number {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function CompletionAlert({ quotes, onFilterStatus }: CompletionAlertProps) {
  const alertItems: AlertItem[] = useMemo(() => {
    const drafts = quotes.filter((q) => q.status === "DRAFT");
    const sent = quotes.filter((q) => q.status === "SENT");
    const sentOld = sent.filter((q) => daysSince(new Date(q.issueDate ?? q.createdAt)) >= RELANCE_DAYS);

    return [
      {
        icon: <NotePencil size={14} weight="duotone" />,
        count: drafts.length,
        label: "brouillon à finaliser",
        detail: `Créé${drafts.length > 1 ? "s" : ""} mais pas envoyé${drafts.length > 1 ? "s" : ""}`,
        color: "text-amber-700",
        dotColor: "bg-amber-400",
        filterStatus: "DRAFT" as QuoteStatus,
      },
      {
        icon: <ClockClockwise size={14} weight="duotone" />,
        count: sent.length,
        label: "en attente client",
        detail: `Envoyé${sent.length > 1 ? "s" : ""} sans réponse`,
        color: "text-indigo-600",
        dotColor: "bg-indigo-400",
        filterStatus: "SENT" as QuoteStatus,
      },
      {
        icon: <BellRinging size={14} weight="duotone" />,
        count: sentOld.length,
        label: "relance à envoyer",
        detail: `J+${RELANCE_DAYS} sans réponse`,
        color: "text-rose-600",
        dotColor: "bg-rose-400",
        filterStatus: "SENT" as QuoteStatus,
      },
    ].filter((item) => item.count > 0);
  }, [quotes]);

  // Tout est vide → état "tout va bien"
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
          Tout est en ordre
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
          <NotePencil size={16} weight="duotone" />
        </span>
        <span className={cn(DS_MONO, "text-[10px] text-amber-700 font-semibold uppercase")}>
          À traiter
        </span>
      </div>

      {/* Séparateur */}
      <div className="w-px h-5 bg-amber-200 shrink-0" />

      {/* Alertes */}
      <div className="flex items-center gap-4 flex-wrap">
        {alertItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onFilterStatus?.(item.filterStatus)}
            className={cn(
              "flex items-center gap-1.5 group",
              "transition-all hover:opacity-80",
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", item.dotColor)} />
            <span className={cn(item.color)}>
              {item.icon}
            </span>
            <span className={cn(DS_MONO, "text-[11px]", item.color, "font-semibold")}>
              {item.count}
            </span>
            <span className={cn(DS_MONO, "text-[10px] text-slate-500 group-hover:text-slate-700 transition-colors")}>
              {item.label}
            </span>
            <span className={cn(DS_MONO, "text-[9px] text-slate-400 hidden sm:inline")}>
              — {item.detail}
            </span>
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