"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lightning,
  Crown,
  CheckCircle,
  CrownSimple,
  LockKey,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { SpatialCard } from "@/features/dashboard/components/spatial-card";
import { AnimatedCounter } from "@/features/dashboard/components/animated-counter";

interface SpatialBillingViewProps {
  estPro: boolean;
  quotaUtilise: number;
}

const LIMITE_GRATUITE = 5;
const PRIX_PRO = 12500;

export function SpatialBillingView({
  estPro,
  quotaUtilise,
}: SpatialBillingViewProps) {
  const usagePercent = Math.min((quotaUtilise / LIMITE_GRATUITE) * 100, 100);

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 min-h-[600px] items-center justify-center p-6">
      
      {/* ─── LEFT: LICENSE TICKET ─── */}
      <div className="perspective-[2000px] z-10">
        <SpatialCard
          depth={3}
          variant={estPro ? "glow" : "glass"}
          className={cn(
            "w-full max-w-[420px] aspect-[4/5] p-8 relative flex flex-col justify-between overflow-hidden",
            estPro ? "border-indigo-300" : "border-slate-200"
          )}
        >

          {/* HEADER */}
          <div className="relative space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/60 backdrop-blur-md">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      Licence UEMOA
                    </span>
                </div>
                <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center bg-slate-50">
                    <Lightning size={24} weight="fill" className={estPro ? "text-amber-500" : "text-slate-300"} />
                </div>
            </div>
            
            <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter mt-6">
                {estPro ? "PRO ACCESS" : "STANDARD"}
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                {estPro ? "Validité Illimitée" : "Usage Restreint"}
            </p>
          </div>

          {/* MIDDLE: USAGE GAUGE */}
          <div className="relative py-12">
            <div className="flex justify-between items-end mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Consommation Quota
                </span>
                <div className="text-right">
                     <span className={cn("text-3xl font-black italic", estPro ? "text-indigo-500" : "text-slate-900")}>
                        {estPro ? "∞" : quotaUtilise}
                     </span>
                     <span className="text-sm font-bold text-slate-400">/{estPro ? "∞" : LIMITE_GRATUITE}</span>
                </div>
            </div>

            {/* Bar */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: estPro ? "100%" : `${usagePercent}%` }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                        "h-full relative",
                        estPro ? "bg-indigo-500" : usagePercent > 80 ? "bg-rose-500" : "bg-emerald-500"
                    )}
                >
                    <div className="absolute inset-0 bg-white/30 w-full h-full animate-shine" />
                </motion.div>
            </div>
            {!estPro && (
                <p className="text-[10px] text-right mt-2 font-bold uppercase tracking-wider text-amber-500">
                    {usagePercent >= 80 && "Approche Critique"}
                </p>
            )}
          </div>

          {/* FOOTER */}
          <div className="relative">
             <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Prochaine Facture
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                        {estPro ? "30 Mars 2026" : "Jamais (Gratuit)"}
                    </p>
                </div>
                {estPro && <div className="text-indigo-500"><CheckCircle size={24} weight="fill" /></div>}
             </div>
             
             {/* ID */}
             <div className="mt-6 flex justify-between items-end opacity-30">
                <div className="space-y-1">
                    <div className="w-24 h-[2px] bg-slate-300" />
                    <div className="w-16 h-[2px] bg-slate-300" />
                    <div className="w-8 h-[2px] bg-slate-300" />
                </div>
                <div className="font-mono text-[8px] text-slate-500">
                    Key: {estPro ? "PRO_88X_LVR" : "STD_001_F4"}
                </div>
             </div>
          </div>

        </SpatialCard>
      </div>

      {/* ─── RIGHT: UPGRADE / PROMO (If not Pro) ─── */}
      {!estPro && (
        <div className="max-w-md w-full animate-fade-in-left">
            <h2 className="text-3xl font-black italic tracking-tight text-slate-900 mb-6">
                Débloquez le <span className="text-indigo-500">Plein Potentiel.</span>
            </h2>
            
            <div className="space-y-4 mb-10">
                <FeatureRow label="Devis Illimités" />
                <FeatureRow label="Suppression filigrane" />
                <FeatureRow label="Export PDF Haute Définition" />
                <FeatureRow label="Support Prioritaire 24/7" />
            </div>

            <div className="p-1 rounded-[20px] bg-gradient-to-b from-indigo-500 to-indigo-700 shadow-[0_20px_40px_-10px_rgba(99,102,241,0.3)]">
                <button className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl py-4 px-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="text-left">
                           <span className="block text-[10px] font-bold uppercase tracking-widest text-indigo-100 group-hover:text-white/80">
                               Accès Immédiat
                           </span>
                           <span className="text-xl font-black text-white italic">
                               12 500 FCFA <span className="text-sm not-italic opacity-70">/mois</span>
                           </span>
                        </div>
                        <div className="h-10 w-10 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                            <CrownSimple size={20} weight="fill" />
                        </div>
                    </div>
                </button>
            </div>
            
            <p className="text-center mt-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2">
                <LockKey size={12} weight="fill" /> Paiement Sécurisé SSL
            </p>
        </div>
      )}

      {/* ─── RIGHT: PRO DASHBOARD (If Pro) ─── */}
      {estPro && (
        <div className="max-w-md w-full animate-fade-in text-center lg:text-left">
            <div className="inline-block p-4 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-500 mb-6">
                <Crown size={32} weight="fill" />
            </div>
            <h2 className="text-3xl font-black italic tracking-tight text-slate-900 mb-4">
                Mode Élite Activé
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Votre espace est optimisé pour la performance. Aucune limite ne s'applique à votre croissance. Profitez de votre suite d'outils complète.
            </p>
            <button className="px-8 py-3 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-700 transition-colors">
                Gérer l'abonnement
            </button>
        </div>
      )}

    </div>
  );
}

function FeatureRow({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle size={14} weight="fill" />
            </div>
            <span className="text-sm font-bold text-slate-600">{label}</span>
        </div>
    )
}
