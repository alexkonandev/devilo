"use client";

import React from "react";
import { TrendUpIcon, CurrencyCircleDollar, FileTextIcon } from "@phosphor-icons/react";
import { cn, formatPriceCompact } from "@/lib/utils";
import {
  DS_MONO,
  DS_BENTO_CARD,
  DS_ICON_WRAPPER,
  DS_ICON_SM,
} from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════════════════════
// WELCOME BANNER — Carte d'accueil personnalisée avec KPIs denses
// Remplace le PageHeader pour la page d'accueil (UX plus riche)
// ═══════════════════════════════════════════════════════════════════════════════

interface KpiItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  color: string;
}

interface WelcomeBannerProps {
  firstName: string;
  kpis: {
    chiffreAffairesTotal: number;
    enAttentePaiement: number;
    tauxConversion: number;
    devisActifs: number;
  };
}

function KpiCard({ item }: { item: KpiItem }) {
  return (
    <div className={cn(DS_BENTO_CARD, "flex items-center gap-3 p-3")}>
      <div className={cn(DS_ICON_WRAPPER, item.color, "w-8 h-8")}>
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(DS_MONO, "text-[10px] text-slate-400 truncate")}>
          {item.label}
        </p>
        <p className={cn(DS_MONO, "text-sm font-bold text-slate-900")}>
          {item.value}
        </p>
      </div>
    </div>
  );
}

export function WelcomeBanner({ firstName, kpis }: WelcomeBannerProps) {
  const kpiItems: KpiItem[] = [
    {
      label: "Chiffre d'affaires",
      value: formatPriceCompact(kpis.chiffreAffairesTotal),
      icon: <CurrencyCircleDollar size={DS_ICON_SM} weight="bold" />,
      color: "bg-emerald-50 text-emerald-600",
      trend: "up",
    },
    {
      label: "En attente",
      value: formatPriceCompact(kpis.enAttentePaiement),
      icon: <TrendUpIcon size={DS_ICON_SM} weight="bold" className="rotate-180" />,
      color: "bg-amber-50 text-amber-600",
      trend: "down",
    },
    {
      label: "Taux conversion",
      value: `${kpis.tauxConversion.toFixed(0)}%`,
      icon: <TrendUpIcon size={DS_ICON_SM} weight="bold" />,
      color: "bg-indigo-50 text-indigo-600",
      trend: "neutral",
    },
    {
      label: "Devis actifs",
      value: `${kpis.devisActifs}`,
      icon: <FileTextIcon size={DS_ICON_SM} weight="bold" />,
      color: "bg-sky-50 text-sky-600",
      trend: "neutral",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Ligne de bienvenue */}
      <div>
        <h1 className={cn(DS_MONO, "text-xl uppercase tracking-tight text-slate-900")}>
          Bonjour{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className={cn(DS_MONO, "text-[11px] text-slate-400 mt-1")}>
          Voici votre tableau de bord — un aperçu de votre activité.
        </p>
      </div>

      {/* Grille KPIs denses */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}