"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  TimerIcon,
  TrendUpIcon,
  CurrencyCircleDollarIcon,
  UsersThreeIcon,
  FileTextIcon,
  ArrowRightIcon,
  PlusIcon,
  ClockIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { QuoteStatus } from "@/app/generated/prisma/enums";
import { Profession, BusinessModel } from "@/types/dashboard";

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM - Source de Vérité (extrait de la page Quotes)
// ═══════════════════════════════════════════════════════════════════════════════

const DS = {
  text: {
    xs: "text-[11px] font-medium",
    sm: "text-[13px] font-medium",
    mono: "font-mono text-[11px]",
    micro: "text-[9px] font-bold uppercase tracking-wider",
  },
  card: "bg-white border border-slate-200 rounded-lg",
  status: {
    PAID: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    SENT: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
      dot: "bg-blue-500",
    },
    ACCEPTED: {
      bg: "bg-indigo-100",
      text: "text-indigo-700",
      border: "border-indigo-200",
      dot: "bg-indigo-500",
    },
    DRAFT: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
    REJECTED: {
      bg: "bg-rose-100",
      text: "text-rose-700",
      border: "border-rose-200",
      dot: "bg-rose-500",
    },
  },
};

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface DashboardProps {
  data: {
    kpis: {
      chiffreAffairesTotal: number;
      enAttentePaiement: number;
      tauxConversion: number;
      devisActifs: number;
    };
    fluxRecent: Array<{
      id: string;
      clientNom: string;
      projetTitre: string;
      montant: number;
      statut: QuoteStatus;
      date: string;
    }>;
    portefeuilleStrategique: Array<{
      id: string;
      nom: string;
      valeurCumulee: number;
      nombreDevis: number;
      scoreSante: "EXCELLENT" | "GOOD" | "SLOW";
      delaiMoyen: number;
    }>;
  };
  profile: {
    profession: Profession | null;
    businessModel: BusinessModel | null;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const formatCFA = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompact = (amount: number) => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}k`;
  return amount.toString();
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT - Command Center Design
// ═══════════════════════════════════════════════════════════════════════════════

export function DashboardView({ data }: DashboardProps) {
  const { kpis, fluxRecent, portefeuilleStrategique } = data;

  const totalValeurPortefeuille = useMemo(
    () => portefeuilleStrategique.reduce((acc, c) => acc + c.valeurCumulee, 0),
    [portefeuilleStrategique],
  );

  // Sparkline data simulation (would come from API in real app)
  const sparklineData = [
    12, 18, 15, 25, 22, 30, 28, 35, 40, 38, 45, 50, 48, 55, 60, 58, 65, 70, 68,
    75, 80, 78, 85, 90, 88, 95, 100, 98, 105, 110,
  ];
  const maxValue = Math.max(...sparklineData);
  const sparklinePath = sparklineData
    .map((value, i) => {
      const x = (i / (sparklineData.length - 1)) * 60;
      const y = 20 - (value / maxValue) * 20;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════════════
          PHASE 1: TOP TELEMETRY ROW (Style Quotes Page)
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-4 gap-0 border-b border-slate-200 bg-white">
        {/* KPI 1: CA Global */}
        <div className="flex items-center gap-3 p-3 border-r border-slate-200">
          <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center">
            <CurrencyCircleDollarIcon
              size={16}
              className="text-emerald-600"
              weight="bold"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900 tabular-nums truncate">
                {formatCompact(kpis.chiffreAffairesTotal)}
              </span>
              <span className="text-[10px] text-slate-400">XOF</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={DS.text.micro + " text-slate-500"}>
                CA Global
              </span>
              <span className="text-[9px] text-slate-400">·</span>
              <span className="text-[9px] text-emerald-600 font-medium">
                +12%
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: En Attente Signature */}
        <div className="flex items-center gap-3 p-3 border-r border-slate-200">
          <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center">
            <ClockIcon size={16} className="text-blue-600" weight="bold" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900 tabular-nums truncate">
                {formatCompact(kpis.enAttentePaiement)}
              </span>
              <span className="text-[10px] text-slate-400">XOF</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={DS.text.micro + " text-slate-500"}>
                En Attente
              </span>
              <span className="text-[9px] text-slate-400">·</span>
              <span className="text-[9px] text-blue-600 font-medium">
                {kpis.devisActifs} devis
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Taux Conversion */}
        <div className="flex items-center gap-3 p-3 border-r border-slate-200">
          <div className="w-8 h-8 rounded-md bg-indigo-50 flex items-center justify-center">
            <TrendUpIcon size={16} className="text-indigo-600" weight="bold" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {kpis.tauxConversion.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400">%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={DS.text.micro + " text-slate-500"}>
                Conversion
              </span>
              <span className="text-[9px] text-slate-400">·</span>
              <span className="text-[9px] text-indigo-600 font-medium">
                Global
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Sparkline + Nouveaux */}
        <div className="flex items-center gap-3 p-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className={DS.text.micro + " text-slate-500"}>
                Activité 30j
              </span>
              <span className="text-[10px] font-bold text-slate-900">
                {portefeuilleStrategique.length}
              </span>
            </div>
            <svg width="60" height="20" className="text-indigo-500">
              <path
                d={sparklinePath}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center">
            <ArrowUpRightIcon size={14} className="text-white" weight="bold" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PHASE 2: BENTO GRID LAYOUT
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ═══ PANNEAU PRINCIPAL GAUCHE (65%) ═══ */}
        <div className="w-[65%] flex flex-col border-r border-slate-200 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <TrendUpIcon size={14} className="text-indigo-500" />
              <span className={DS.text.micro + " text-slate-600"}>
                Activité Récente
              </span>
            </div>
            <Link
              href="/quotes"
              className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 hover:text-indigo-700"
            >
              Voir tout
              <ArrowRightIcon size={10} weight="bold" />
            </Link>
          </div>

          {/* Zone Graphique (placeholder pour Area Chart) */}
          <div className="h-48 border-b border-slate-200 bg-slate-50 p-4">
            <div className="h-full flex items-end gap-1">
              {sparklineData.slice(-20).map((value, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${(value / maxValue) * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.02 }}
                  className="flex-1 bg-indigo-200 hover:bg-indigo-400 rounded-t-sm transition-colors cursor-pointer"
                />
              ))}
            </div>
          </div>

          {/* Tableau Dense des 5 dernières actions */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-slate-50 sticky top-0">
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-4 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                  <th className="text-left py-2 px-4 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Client
                  </th>
                  <th className="text-right py-2 px-4 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Montant
                  </th>
                  <th className="text-center py-2 px-4 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fluxRecent.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-50 cursor-pointer group"
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-6 h-6 rounded flex items-center justify-center",
                            item.statut === "PAID"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-slate-100 text-slate-500",
                          )}
                        >
                          {item.statut === "PAID" ? (
                            <CheckCircleIcon size={12} weight="bold" />
                          ) : (
                            <FileTextIcon size={12} />
                          )}
                        </div>
                        <span className="text-[12px] font-medium text-slate-900 truncate max-w-[200px]">
                          {item.projetTitre}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-[11px] text-slate-600">
                        {item.clientNom}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="text-[12px] font-mono font-bold text-slate-900 tabular-nums">
                        {formatCFA(item.montant)}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <StatusBadge status={item.statut} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ═══ PANNEAU SECONDAIRE DROIT (35%) ═══ */}
        <div className="w-[35%] flex flex-col bg-slate-50">
          {/* Section: Pipeline / Brouillons */}
          <div className="flex-1 flex flex-col border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileTextIcon size={14} className="text-amber-500" />
                <span className={DS.text.micro + " text-slate-600"}>
                  Brouillons en cours
                </span>
              </div>
              <Link
                href="/quotes/new"
                className="flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon size={10} weight="bold" />
                Créer
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {fluxRecent
                .filter((item) => item.statut === "DRAFT")
                .slice(0, 4)
                .map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/quotes?id=${item.id}`}
                    className="block p-2.5 rounded-md border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-900 truncate max-w-[140px]">
                        {item.projetTitre}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-700 tabular-nums">
                        {formatCompact(item.montant)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        {item.clientNom}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {item.date}
                      </span>
                    </div>
                  </Link>
                ))}
              {fluxRecent.filter((item) => item.statut === "DRAFT").length ===
                0 && (
                <div className="text-center py-8">
                  <p className="text-[11px] text-slate-400">Aucun brouillon</p>
                  <p className="text-[10px] text-slate-300 mt-1">
                    Créez un nouveau devis
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section: Top Clients */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <UsersThreeIcon size={14} className="text-indigo-500" />
                <span className={DS.text.micro + " text-slate-600"}>
                  Top Clients
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {formatCompact(totalValeurPortefeuille)}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {portefeuilleStrategique.map((client, index) => {
                const partDuCA =
                  totalValeurPortefeuille > 0
                    ? (client.valeurCumulee / totalValeurPortefeuille) * 100
                    : 0;
                const isTop = index === 0;

                return (
                  <Link
                    key={client.id}
                    href={`/clients?id=${client.id}`}
                    className="block p-2.5 rounded-md border border-slate-200 bg-white hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={cn(
                          "w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold",
                          isTop
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-slate-100 text-slate-500",
                        )}
                      >
                        {client.nom.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-900 truncate">
                          {client.nom}
                        </p>
                        <p className="text-[9px] text-slate-500">
                          {client.nombreDevis} devis · {client.delaiMoyen}j
                          paiement
                        </p>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-700 tabular-nums">
                        {formatCompact(client.valeurCumulee)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            isTop ? "bg-indigo-500" : "bg-slate-300",
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${partDuCA}%` }}
                          transition={{
                            duration: 0.5,
                            delay: 0.1 + index * 0.05,
                          }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 w-8 text-right">
                        {partDuCA.toFixed(0)}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: QuoteStatus }) {
  const style = DS.status[status];
  const labels: Record<QuoteStatus, string> = {
    PAID: "Payé",
    SENT: "Envoyé",
    ACCEPTED: "Signé",
    DRAFT: "Brouillon",
    REJECTED: "Refusé",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
        style.bg,
        style.text,
        style.border,
      )}
    >
      <span className={cn("w-1 h-1 rounded-full", style.dot)} />
      {labels[status]}
    </span>
  );
}
