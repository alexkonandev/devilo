"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ClockIcon,
  CheckCircleIcon,
  ReceiptIcon,
  CrownIcon,
  HandCoinsIcon,
  ShieldCheckIcon,
  TimerIcon,
  PlusIcon,
  FileTextIcon,
  CalendarBlankIcon,
  TrendUpIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { QuoteStatus } from "@/app/generated/prisma/enums";
import { Profession, BusinessModel } from "@/types/dashboard";

import { SpatialCard } from "./components/spatial-card";
import { AnimatedCounter } from "./components/animated-counter";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// STAGGER ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function DashboardView({ data }: DashboardProps) {
  const { kpis, fluxRecent, portefeuilleStrategique } = data;

  const totalValeurPortefeuille = useMemo(
    () => portefeuilleStrategique.reduce((acc, c) => acc + c.valeurCumulee, 0),
    [portefeuilleStrategique]
  );

  return (
    <div className="relative min-h-[80vh] font-sans">
      {/* ═══ Z=1+ : CONTENT LAYERS ═══ */}

      <main className="relative z-10 max-w-[1600px] mx-auto  py-8 space-y-10">
        {/* ─── HEADER ─── */}
        <motion.header
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200/60"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
                Spatial Intelligence
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 italic">
              Console<span className="text-indigo-500">.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/quotes/new"
              className="group flex items-center gap-2.5 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40"
            >
              <PlusIcon size={16} weight="bold" />
              Nouveau Devis
              <ArrowUpRightIcon
                size={14}
                weight="bold"
                className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
              />
            </Link>
          </div>
        </motion.header>

        {/* ─── KPI HERO — Z=2 Main Surface ─── */}
        <SpatialCard depth={1} variant="glass" className="p-10 lg:p-14" mountDelay={0.1}>
          {/* Ghost icon */}
          <div className="absolute -top-8 -right-8 opacity-[0.03] pointer-events-none">
            <ReceiptIcon size={350} weight="duotone" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero value */}
            <div className="lg:col-span-7">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-6">
                Volume Financier Total
              </p>
              <AnimatedCounter
                value={kpis.chiffreAffairesTotal}
                format="currency"
                currencySuffix="XOF"
                className="text-[6rem] lg:text-[7rem] font-black tracking-tighter text-slate-900 leading-none"
                suffixClassName="text-2xl lg:text-3xl font-black text-indigo-500 uppercase italic"
              />
            </div>

            {/* Secondary KPIs */}
            <motion.div
              className="lg:col-span-5 grid grid-cols-2 gap-y-10 gap-x-8 lg:border-l lg:border-slate-200/60 lg:pl-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <KpiMini
                  label="En attente"
                  value={kpis.enAttentePaiement}
                  format="currency"
                  color="text-amber-500"
                  icon={<ClockIcon size={22} weight="duotone" />}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <KpiMini
                  label="Devis actifs"
                  value={kpis.devisActifs}
                  format="count"
                  color="text-indigo-500"
                  icon={<FileTextIcon size={22} weight="duotone" />}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <KpiMini
                  label="Conversion"
                  value={kpis.tauxConversion}
                  format="percent"
                  color="text-emerald-500"
                  icon={<ShieldCheckIcon size={22} weight="duotone" />}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <KpiMini
                  label="Tendance"
                  value={kpis.chiffreAffairesTotal}
                  format="currency"
                  color="text-slate-900"
                  icon={<TrendUpIcon size={22} weight="duotone" />}
                />
              </motion.div>
            </motion.div>
          </div>
        </SpatialCard>

        {/* ─── DUAL ZONE : FLUX + PORTEFEUILLE ─── */}
        <div className="grid grid-cols-12 gap-8">
          {/* FLUX OPÉRATIONNEL — 7 cols */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <SectionHeader
              icon={<HandCoinsIcon size={20} weight="duotone" />}
              label="Flux Opérationnel"
              iconBg="bg-indigo-50 text-indigo-500"
            />

            <SpatialCard
              depth={2}
              variant="glass"
              className="p-4 lg:p-6"
              mountDelay={0.2}
            >
              <div className="divide-y divide-slate-100">
                {fluxRecent.map((item, i) => (
                  <FluxItem key={item.id} item={item} index={i} />
                ))}
              </div>
            </SpatialCard>
          </div>

          {/* PORTEFEUILLE STRATÉGIQUE — 5 cols */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <SectionHeader
              icon={<CrownIcon size={20} weight="duotone" />}
              label="Actifs Stratégiques"
              iconBg="bg-amber-50 text-amber-500"
            />

            <motion.div
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {portefeuilleStrategique.map((client, index) => (
                <motion.div key={client.id} variants={itemVariants}>
                  <PortfolioCard
                    client={client}
                    index={index}
                    totalValeur={totalValeurPortefeuille}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS (Zero `any`)
// ═══════════════════════════════════════════════════════════════

interface SectionHeaderProps {
  icon: React.ReactNode;
  label: string;
  iconBg: string;
}

function SectionHeader({ icon, label, iconBg }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className={cn("p-2 rounded-xl", iconBg)}>{icon}</div>
      <h2 className="font-bold uppercase tracking-[0.2em] text-[11px] text-slate-400">
        {label}
      </h2>
    </div>
  );
}

// ─── KPI Mini ───

interface KpiMiniProps {
  label: string;
  value: number;
  format: "currency" | "percent" | "count";
  color: string;
  icon: React.ReactNode;
}

function KpiMini({ label, value, format, color, icon }: KpiMiniProps) {
  return (
    <div className="flex items-start gap-4 group">
      <div
        className={cn(
          "w-11 h-11 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-200/60 transition-colors group-hover:bg-slate-100",
          color
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
          {label}
        </p>
        <AnimatedCounter
          value={value}
          format={format}
          className={cn(
            "font-mono text-3xl font-black tracking-tighter italic leading-none",
            color
          )}
          duration={1.8}
        />
      </div>
    </div>
  );
}

// ─── Flux Item ───

interface FluxItemData {
  id: string;
  clientNom: string;
  projetTitre: string;
  montant: number;
  statut: QuoteStatus;
  date: string;
}

interface FluxItemProps {
  item: FluxItemData;
  index: number;
}

function FluxItem({ item, index }: FluxItemProps) {
  return (
    <Link
      href="/quotes"
      className="group flex items-center justify-between p-5 hover:bg-slate-50 transition-all rounded-2xl cursor-pointer active:scale-[0.995]"
    >
      <div className="flex items-center gap-5">
        <motion.div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
            item.statut === "PAID"
              ? "bg-emerald-50 text-emerald-500"
              : "bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + index * 0.06 }}
        >
          {item.statut === "PAID" ? (
            <CheckCircleIcon size={24} weight="bold" />
          ) : (
            <TimerIcon size={24} weight="duotone" />
          )}
        </motion.div>

        <div>
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">
            {item.clientNom}
          </p>
          <h4 className="text-sm font-bold text-slate-800 leading-tight tracking-tight">
            {item.projetTitre}
          </h4>
          <div className="flex items-center gap-1.5 mt-1.5">
            <CalendarBlankIcon
              size={11}
              weight="bold"
              className="text-slate-300"
            />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              {item.date}
            </span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <p className="font-mono font-black text-lg text-slate-800 tracking-tighter">
          {(item.montant / 1000).toFixed(1)}k
        </p>
        <StatusBadge status={item.statut} />
      </div>
    </Link>
  );
}

// ─── Portfolio Card ───

interface PortfolioClientData {
  id: string;
  nom: string;
  valeurCumulee: number;
  nombreDevis: number;
  scoreSante: "EXCELLENT" | "GOOD" | "SLOW";
  delaiMoyen: number;
}

interface PortfolioCardProps {
  client: PortfolioClientData;
  index: number;
  totalValeur: number;
}

function PortfolioCard({ client, index, totalValeur }: PortfolioCardProps) {
  const isTopClient = index === 0;
  const partDuCA =
    totalValeur > 0 ? (client.valeurCumulee / totalValeur) * 100 : 0;

  return (
    <SpatialCard
      depth={isTopClient ? 3 : 2}
      variant={isTopClient ? "glow" : "glass"}
      className="p-6"
      mountDelay={0.3 + index * 0.1}
    >
      <Link href={`/clients?id=${client.id}`} className="block">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm transition-all",
                isTopClient
                  ? "bg-indigo-50 text-indigo-600 border border-indigo-200/60"
                  : "bg-slate-50 text-slate-500 border border-slate-200/60"
              )}
            >
              {client.nom.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 uppercase text-sm tracking-tight">
                {client.nom}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full shadow-sm",
                    client.scoreSante === "EXCELLENT"
                      ? "bg-emerald-400 shadow-emerald-400/50"
                      : client.scoreSante === "GOOD"
                      ? "bg-amber-400 shadow-amber-400/50"
                      : "bg-rose-400 shadow-rose-400/50"
                  )}
                />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {client.delaiMoyen}j délai
                </span>
              </div>
            </div>
          </div>

          <p className="font-mono text-xl font-black tracking-tighter italic text-slate-800">
            {(client.valeurCumulee / 1000).toFixed(0)}k
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300">
            <span>Poids Portefeuille</span>
            <span className={isTopClient ? "text-indigo-500" : "text-slate-400"}>
              {partDuCA.toFixed(1)}%
            </span>
          </div>
          <div className="h-1 w-full rounded-full overflow-hidden bg-slate-100">
            <motion.div
              className={cn(
                "h-full rounded-full",
                isTopClient
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-400"
                  : "bg-slate-300"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${partDuCA}%` }}
              transition={{
                duration: 1.2,
                delay: 0.5 + index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </div>
        </div>
      </Link>
    </SpatialCard>
  );
}

// ─── Status Badge ───

function StatusBadge({ status }: { status: QuoteStatus }) {
  const config: Record<
    QuoteStatus,
    { label: string; className: string }
  > = {
    PAID: {
      label: "Encaissé",
      className: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    SENT: {
      label: "Envoyé",
      className: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    ACCEPTED: {
      label: "Signé",
      className: "text-amber-600 bg-amber-50 border-amber-200",
    },
    DRAFT: {
      label: "Brouillon",
      className: "text-slate-500 bg-slate-50 border-slate-200",
    },
    REJECTED: {
      label: "Refusé",
      className: "text-rose-600 bg-rose-50 border-rose-200",
    },
  };

  return (
    <span
      className={cn(
        "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border mt-1 inline-block",
        config[status].className
      )}
    >
      {config[status].label}
    </span>
  );
}
