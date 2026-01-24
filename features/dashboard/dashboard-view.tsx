"use client";

import React, { useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import {
  TrendingUp,
  Clock,
  Target,
  ArrowUpRight,
  Zap,
  Filter,
  AlertCircle,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AdvancedDashboardData,
  Profession,
  BusinessModel,
} from "@/types/dashboard";
import { QuoteStatus } from "@/app/generated/prisma/enums";

interface DashboardViewProps {
  data: AdvancedDashboardData;
  profile: {
    profession: Profession | null;
    businessModel: BusinessModel | null;
  };
}

export function DashboardView({ data, profile }: DashboardViewProps) {
  const { kpis, activity, topClients } = data;

  const strategy = useMemo(() => {
    const pendingQuotes = activity.filter((a) => a.status === QuoteStatus.SENT);
    const criticalRelances = pendingQuotes.filter(
      (q) => differenceInDays(new Date(), new Date(q.date)) > 3
    );
    const projectedRevenue =
      kpis.totalRevenue + kpis.pendingRevenue * (kpis.conversionRate / 100);

    return {
      criticalRelances,
      projectedRevenue,
      needsAction: criticalRelances.length > 0,
    };
  }, [activity, kpis]);

  return (
    <div className="flex flex-col  bg-white font-sans selection:bg-indigo-600 selection:text-white">
      {/* 00. HEADER TECHNIQUE (SOURCE DE VÉRITÉ) */}
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
            Poste de Contrôle
          </h1>
          <div className="flex items-center gap-2 px-2 py-0.5 border border-indigo-100 bg-indigo-50">
            <ShieldCheck className="w-3 h-3 text-indigo-600" />
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-700">
              Système Actif
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Opérateur
            </span>
            <span className="text-[11px] font-bold text-slate-900 uppercase">
              {profile.profession || "Standard_Unit"}
            </span>
          </div>
          <Button className="bg-indigo-600 text-white rounded-none text-[11px] font-bold uppercase h-9 px-6 hover:bg-indigo-700 transition-colors">
            Nouveau Devis
          </Button>
        </div>
      </header>

      {/* 01. RADAR D'URGENCE (CASH-FLOW AT RISK) */}
      {strategy.needsAction && (
        <div className="bg-slate-900 px-8 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] font-bold text-white uppercase tracking-[0.1em]">
              Protocole Relance : {strategy.criticalRelances.length} actifs en
              stagnation. Risque de perte de capital détecté.
            </p>
          </div>
          <button className="text-[10px] font-black text-indigo-400 uppercase border border-indigo-400/30 px-3 py-1 hover:bg-indigo-400 hover:text-slate-950 transition-all">
            Lancer Audit Relance
          </button>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-16 px-8 w-full space-y-20">
        {/* 02. UNITÉS DE PERFORMANCE (GRILLE CAO) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
              01. Indicateurs_Performance_Clés
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 border border-slate-200 divide-x divide-slate-200">
            <KpiUnit
              label="Chiffre d'Affaires"
              val={kpis.totalRevenue}
              icon={TrendingUp}
              trend="+12.4%"
            />
            <KpiUnit
              label="Revenu Latent"
              val={kpis.pendingRevenue}
              icon={Clock}
              trend="En_Cours"
            />
            <KpiUnit
              label="Taux Conversion"
              val={kpis.conversionRate}
              isPercent
              icon={Target}
            />
            <div className="p-8 bg-slate-950 text-white flex flex-col justify-between h-40">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                Projection Flux
              </span>
              <div>
                <div className="font-mono text-[28px] font-bold tracking-tighter mb-2">
                  {new Intl.NumberFormat("fr-CI", {
                    style: "currency",
                    currency: "XOF",
                    maximumFractionDigits: 0,
                  }).format(strategy.projectedRevenue)}
                </div>
                <div className="h-1 w-full bg-white/10">
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: "72%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-slate-100" />

        {/* 03. REGISTRE & ASSETS */}
        <div className="grid grid-cols-12 gap-16">
          {/* FLUX OPÉRATIONNEL */}
          <section className="col-span-12 lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">
                02. Registre_des_Opérations
              </span>
              <Filter size={14} className="text-slate-400" />
            </div>
            <div className="border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">
                      Montant
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">
                      Entité Client
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">
                      Workflow
                    </th>
                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activity.map((item) => (
                    <tr
                      key={item.id}
                      className="group hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-[14px] font-bold text-slate-950">
                        {item.amount.toLocaleString()}{" "}
                        <span className="text-[10px] text-slate-400">XOF</span>
                      </td>
                      <td className="px-6 py-4 text-[12px] font-bold text-slate-900 uppercase tracking-tight">
                        {item.clientName}
                      </td>
                      <td className="px-6 py-4">
                        <StatusTag status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-[11px] text-slate-400">
                        {format(new Date(item.date), "dd.MM.yy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CLASSEMENT ACTIFS */}
          <section className="col-span-12 lg:col-span-4 space-y-6">
            <div className="border-b border-slate-900 pb-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">
                03. Top_Portefeuilles
              </span>
            </div>
            <div className="border border-slate-200 divide-y divide-slate-100">
              {topClients.slice(0, 5).map((client, i) => (
                <div
                  key={i}
                  className="p-6 hover:bg-slate-50 transition-colors flex justify-between items-center"
                >
                  <div>
                    <div className="text-[11px] font-black text-slate-900 uppercase mb-1">
                      {client.name}
                    </div>
                    <div className="font-mono text-[16px] font-bold text-indigo-600">
                      {client.totalSpent.toLocaleString()}{" "}
                      <span className="text-[10px]">XOF</span>
                    </div>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-slate-200 group-hover:text-indigo-600"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* 04. FOOTER MÉTADONNÉES */}
      <footer className="h-10 border-t border-slate-100 px-8 flex items-center justify-between bg-white shrink-0">
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
          Architecture_v3.5 // PROD_MODE
        </span>
        <div className="flex gap-8">
          <span className="text-[9px] font-bold text-slate-400 uppercase">
            Audit_Log
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">
            Support_Terminal
          </span>
        </div>
      </footer>
    </div>
  );
}

// --- UNITÉS FONCTIONNELLES ---

const KpiUnit = ({
  label,
  val,
  isPercent,
  icon: Icon,
  trend,
}: {
  label: string;
  val: number;
  isPercent?: boolean;
  icon: LucideIcon;
  trend?: string;
}) => (
  <div className="p-8 bg-white flex flex-col justify-between h-40">
    <div className="flex justify-between items-start">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        {label}
      </span>
      <Icon size={14} className="text-slate-300" />
    </div>
    <div>
      <div className="font-mono text-[28px] font-bold text-slate-950 tracking-tighter leading-none">
        {isPercent ? `${val.toFixed(1)}%` : val.toLocaleString()}
      </div>
      {trend && (
        <div className="text-[9px] font-black text-emerald-600 uppercase mt-2 tracking-widest">
          {trend}
        </div>
      )}
    </div>
  </div>
);

const StatusTag = ({ status }: { status: QuoteStatus }) => {
  const styles = {
    [QuoteStatus.SENT]: "border-slate-200 text-slate-600 bg-slate-50",
    [QuoteStatus.ACCEPTED]: "border-indigo-600 text-white bg-indigo-600",
    [QuoteStatus.PAID]: "border-emerald-200 text-emerald-700 bg-emerald-50",
    [QuoteStatus.DRAFT]: "border-slate-100 text-slate-400 bg-white",
    [QuoteStatus.REJECTED]: "border-red-200 text-red-700 bg-red-50",
  };
  return (
    <span
      className={cn(
        "px-2 py-0.5 border text-[9px] font-black uppercase tracking-tighter rounded-none inline-block",
        styles[status]
      )}
    >
      {status}
    </span>
  );
};
