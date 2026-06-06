"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { UsersThreeIcon } from "@phosphor-icons/react";
import { cn, formatPriceCompact } from "@/lib/utils";
import {
  DS_MICRO,
  DS_MONO,
  DS_BENTO_CARD,
  DS_SECTION_HEADER,
  DS_ICON_WRAPPER,
  DS_ICON_SM,
  DS_PROGRESS_TRACK,
  DS_PROGRESS_BAR,
} from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════════════════════
// TOP CLIENTS CARD — Portefeuille stratégique densifié
// ═══════════════════════════════════════════════════════════════════════════════

const HEALTH_BADGE: Record<string, { label: string; class: string }> = {
  EXCELLENT: { label: "EXCELLENT", class: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
  GOOD: { label: "BON", class: "bg-amber-50 text-amber-600 border border-amber-200" },
  SLOW: { label: "LENT", class: "bg-rose-50 text-rose-600 border border-rose-200" },
};

interface TopClientItem {
  id: string;
  nom: string;
  valeurCumulee: number;
  nombreDevis: number;
  scoreSante: "EXCELLENT" | "GOOD" | "SLOW";
  delaiMoyen: number;
}

interface TopClientsCardProps {
  items: TopClientItem[];
}

export function TopClientsCard({ items }: TopClientsCardProps) {
  const totalValeurPortefeuille = useMemo(
    () => items.reduce((acc, c) => acc + c.valeurCumulee, 0),
    [items],
  );

  return (
    <div className={cn(DS_BENTO_CARD, "p-0 overflow-hidden")}>
      <div
        className={cn(
          DS_SECTION_HEADER,
          "px-3 py-2 border-b border-slate-100/60 mb-0",
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
            <UsersThreeIcon size={DS_ICON_SM} className="text-indigo-500" />
          </div>
          <span className={cn(DS_MICRO, "text-slate-600")}>Top Clients</span>
        </div>
        <span className={cn(DS_MONO, "text-slate-500")}>
          {formatPriceCompact(totalValeurPortefeuille)}
        </span>
      </div>
      <div className="p-2 space-y-1.5">
        {items.map((client, index) => {
          const partDuCA =
            totalValeurPortefeuille > 0
              ? (client.valeurCumulee / totalValeurPortefeuille) * 100
              : 0;
          const isTop = index === 0;
          const health = HEALTH_BADGE[client.scoreSante];

          return (
            <Link
              key={client.id}
              href={`/clients?id=${client.id}`}
              className={cn(
                DS_BENTO_CARD,
                "block hover:border-indigo-300 transition-colors",
              )}
            >
              {/* Ligne 1 : Initiales + Nom + Valeur */}
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={cn(
                    DS_ICON_WRAPPER,
                    "rounded-md text-[10px] font-bold",
                    isTop
                      ? "bg-indigo-50 text-indigo-600"
                      : "bg-slate-50 text-slate-500",
                  )}
                >
                  {client.nom.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(DS_MONO, "font-bold text-slate-900 truncate")}>
                    {client.nom}
                  </p>
                </div>
                <span className={cn(DS_MONO, "font-bold text-slate-700")}>
                  {formatPriceCompact(client.valeurCumulee)}
                </span>
              </div>

              {/* Ligne 2 : HealthScore + stats */}
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={cn(
                    "inline-flex items-center px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
                    health.class,
                  )}
                >
                  {health.label}
                </span>
                <span className={cn(DS_MICRO, "text-slate-400")}>
                  {client.nombreDevis} devis
                </span>
                <span className={cn(DS_MICRO, "text-slate-400")}>
                  {client.delaiMoyen}j paiement
                </span>
              </div>

              {/* Barre de progression */}
              <div className="flex items-center gap-2">
                <div className={cn(DS_PROGRESS_TRACK, "flex-1")}>
                  <div
                    className={cn(DS_PROGRESS_BAR, isTop ? "bg-indigo-500" : "bg-slate-300")}
                    style={{ width: `${partDuCA}%` }}
                  />
                </div>
                <span className={cn(DS_MICRO, "text-slate-400 w-8 text-right")}>
                  {partDuCA.toFixed(0)}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}