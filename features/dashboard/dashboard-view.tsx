"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  TrendUpIcon,
  CurrencyCircleDollarIcon,
  UsersThreeIcon,
  FileTextIcon,
  ArrowRightIcon,
  PlusIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_BENTO_CARD,
  DS_SECTION_HEADER,
  DS_ICON_WRAPPER,
  DS_ICON_SM,
  DS_BADGE_ACTIVE,
  DS_BADGE_SUCCESS,
  DS_BADGE_WARNING,
  DS_BADGE_DANGER,
  DS_TEL_BLOCK,
  DS_PROGRESS_TRACK,
  DS_PROGRESS_BAR,
  DS_BUTTON,
  DS_BUTTON_SECONDARY,
} from "@/lib/design-system";
import { QuoteStatus } from "@/app/generated/prisma/enums";
import { PageShell } from "@/components/layout/page-shell";
import { TelemetryStrip, type TelemetryCell } from "@/components/layout/telemetry-strip";

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
// MAIN COMPONENT — via PageShell + TelemetryStrip
// ═══════════════════════════════════════════════════════════════════════════════

export function DashboardView({ data }: DashboardProps) {
  const { kpis, fluxRecent, portefeuilleStrategique } = data;

  const totalValeurPortefeuille = useMemo(
    () => portefeuilleStrategique.reduce((acc, c) => acc + c.valeurCumulee, 0),
    [portefeuilleStrategique],
  );

  const sparklineData = [
    12, 18, 15, 25, 22, 30, 28, 35, 40, 38, 45, 50, 48, 55, 60, 58, 65, 70, 68,
    75, 80, 78, 85, 90, 88, 95, 100, 98, 105, 110,
  ];

  const telemetryCells: TelemetryCell[] = [
    {
      icon: CurrencyCircleDollarIcon,
      value: formatCompact(kpis.chiffreAffairesTotal),
      unit: "XOF",
      label: "CA Global",
      detail: "+12%",
      detailColor: "text-indigo-500",
    },
    {
      icon: ClockIcon,
      value: formatCompact(kpis.enAttentePaiement),
      unit: "XOF",
      label: "En Attente",
      detail: `${kpis.devisActifs} devis`,
    },
    {
      icon: TrendUpIcon,
      value: kpis.tauxConversion.toFixed(1),
      unit: "%",
      label: "Conversion",
      detail: "Global",
    },
    {
      variant: "sparkline",
      label: "Activité 30j",
      value: String(portefeuilleStrategique.length),
      sparklineData,
    },
  ];

  return (
    <PageShell
      telemetry={<TelemetryStrip cells={telemetryCells} />}
      main={
        <div className="h-full overflow-y-auto p-4">
          <div className="grid grid-cols-12 gap-4">
            {/* COLONNE GAUCHE (8 cols) — Activité + Table */}
            <div className="col-span-8 space-y-3">
              {/* CARD 1 — Graphique Activité (compact) */}
              <div className={cn(DS_BENTO_CARD, "p-0 overflow-hidden")}>
                <div
                  className={cn(
                    DS_SECTION_HEADER,
                    "px-3 py-2 border-b border-slate-100/60 bg-slate-50/50 mb-0",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
                      <TrendUpIcon size={DS_ICON_SM} className="text-indigo-500" />
                    </div>
                    <span className={cn(DS_MICRO, "text-slate-600")}>
                      Activité Récente
                    </span>
                  </div>
                  <Link
                    href="/quotes"
                    className={cn(DS_BUTTON_SECONDARY, "px-2.5 py-1 text-[9px]")}
                  >
                    Voir tout
                    <ArrowRightIcon size={DS_ICON_SM} weight="bold" />
                  </Link>
                </div>
                <div className={cn(DS_TEL_BLOCK, "h-24 rounded-none border-0")}>
                  <div className="h-full flex items-end gap-1">
                    {sparklineData.slice(-20).map((value, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${(value / Math.max(...sparklineData)) * 100}%` }}
                        transition={{ duration: 0.5, delay: i * 0.02 }}
                        className="flex-1 bg-indigo-200 hover:bg-indigo-400 rounded-t-sm transition-colors cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* CARD 2 — Table Dernières Actions */}
              <div className={cn(DS_BENTO_CARD, "p-0 overflow-hidden bg-white")}>
                <div
                  className={cn(
                    DS_SECTION_HEADER,
                    "px-3 py-2 border-b border-slate-100/60 mb-0",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(DS_ICON_WRAPPER, "bg-slate-100")}>
                      <FileTextIcon size={DS_ICON_SM} className="text-slate-500" />
                    </div>
                    <span className={cn(DS_MICRO, "text-slate-600")}>
                      Dernières Actions
                    </span>
                  </div>
                  <span className={cn(DS_MONO, "text-slate-400")}>
                    {fluxRecent.length} entrées
                  </span>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100/60 bg-slate-50/80">
                      <th className={cn(DS_LABEL, "text-left py-2 px-4")}>Action</th>
                      <th className={cn(DS_LABEL, "text-left py-2 px-4")}>Client</th>
                      <th className={cn(DS_LABEL, "text-right py-2 px-4")}>Montant</th>
                      <th className={cn(DS_LABEL, "text-center py-2 px-4")}>Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {fluxRecent.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-slate-50/50 cursor-pointer group"
                      >
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                DS_ICON_WRAPPER,
                                item.statut === "PAID"
                                  ? "bg-indigo-50 text-indigo-600"
                                  : "bg-slate-50 text-slate-500",
                              )}
                            >
                              {item.statut === "PAID" ? (
                                <CheckCircleIcon size={DS_ICON_SM} weight="bold" />
                              ) : (
                                <FileTextIcon size={DS_ICON_SM} />
                              )}
                            </div>
                            <span className="text-xs font-medium text-slate-900 truncate max-w-[200px]">
                              {item.projetTitre}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <span className={cn(DS_MONO, "text-slate-600")}>{item.clientNom}</span>
                        </td>
                        <td className="py-2 px-4 text-right">
                          <span className={cn(DS_MONO, "font-bold text-slate-900")}>
                            {formatCFA(item.montant)}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-center">
                          <StatusBadge status={item.statut} />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* COLONNE DROITE (4 cols) — Brouillons + Top Clients */}
            <div className="col-span-4 space-y-3">
              {/* CARD 3 — Brouillons */}
              <div className={cn(DS_BENTO_CARD, "p-0 overflow-hidden")}>
                <div
                  className={cn(
                    DS_SECTION_HEADER,
                    "px-3 py-2 border-b border-slate-100/60 bg-slate-50/50 mb-0",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
                      <FileTextIcon size={DS_ICON_SM} className="text-indigo-500" />
                    </div>
                    <span className={cn(DS_MICRO, "text-slate-600")}>
                      Brouillons en cours
                    </span>
                  </div>
                  <Link href="/quotes/new" className={DS_BUTTON}>
                    <PlusIcon size={DS_ICON_SM} weight="bold" />
                    Créer
                  </Link>
                </div>
                <div className="max-h-48 overflow-y-auto p-2 space-y-1.5">
                  {fluxRecent
                    .filter((item) => item.statut === "DRAFT")
                    .slice(0, 6)
                    .map((item) => (
                      <Link
                        key={item.id}
                        href={`/quotes?id=${item.id}`}
                        className={cn(
                          DS_BENTO_CARD,
                          "block hover:border-indigo-300 hover:shadow-sm transition-all",
                        )}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span
                            className={cn(
                              DS_MONO,
                              "font-bold text-slate-900 truncate max-w-[140px]",
                            )}
                          >
                            {item.projetTitre}
                          </span>
                          <span className={cn(DS_MONO, "font-bold text-slate-700")}>
                            {formatCompact(item.montant)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={cn(DS_LABEL, "text-slate-500")}>{item.clientNom}</span>
                          <span className={cn(DS_MICRO, "text-slate-400")}>{item.date}</span>
                        </div>
                      </Link>
                    ))}
                  {fluxRecent.filter((item) => item.statut === "DRAFT").length === 0 && (
                    <div className="text-center py-8">
                      <p className={cn(DS_MONO, "text-slate-400")}>Aucun brouillon</p>
                      <p className={cn(DS_LABEL, "text-slate-300 mt-1")}>
                        Créez un nouveau devis
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 4 — Top Clients */}
              <div className={cn(DS_BENTO_CARD, "p-0 overflow-hidden")}>
                <div
                  className={cn(
                    DS_SECTION_HEADER,
                    "px-3 py-2 border-b border-slate-100/60 bg-slate-50/50 mb-0",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
                      <UsersThreeIcon size={DS_ICON_SM} className="text-indigo-500" />
                    </div>
                    <span className={cn(DS_MICRO, "text-slate-600")}>Top Clients</span>
                  </div>
                  <span className={cn(DS_MONO, "text-slate-500")}>
                    {formatCompact(totalValeurPortefeuille)}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto p-2 space-y-1.5">
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
                        className={cn(
                          DS_BENTO_CARD,
                          "block hover:border-indigo-300 transition-all",
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={cn(
                              DS_ICON_WRAPPER,
                              "text-[10px] font-bold",
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
                            <p className={cn(DS_MICRO, "text-slate-500")}>
                              {client.nombreDevis} devis · {client.delaiMoyen}j paiement
                            </p>
                          </div>
                          <span className={cn(DS_MONO, "font-bold text-slate-700")}>
                            {formatCompact(client.valeurCumulee)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn(DS_PROGRESS_TRACK, "flex-1")}>
                            <motion.div
                              className={cn(DS_PROGRESS_BAR, isTop ? "bg-indigo-500" : "bg-slate-300")}
                              initial={{ width: 0 }}
                              animate={{ width: `${partDuCA}%` }}
                              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
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
            </div>
          </div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BADGE
// ═══════════════════════════════════════════════════════════════════════════════

const STATUS_BADGE_MAP: Record<QuoteStatus, { className: string; label: string }> = {
  PAID: { className: DS_BADGE_SUCCESS, label: "Payé" },
  SENT: { className: DS_BADGE_ACTIVE, label: "Envoyé" },
  ACCEPTED: { className: DS_BADGE_ACTIVE, label: "Signé" },
  DRAFT: { className: DS_BADGE_WARNING, label: "Brouillon" },
  REJECTED: { className: DS_BADGE_DANGER, label: "Refusé" },
};

function StatusBadge({ status }: { status: QuoteStatus }) {
  const config = STATUS_BADGE_MAP[status];
  return <span className={config.className}>{config.label}</span>;
}