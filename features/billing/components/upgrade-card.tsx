"use client";

import React, { useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  STUDIO_V2_CARD,
  DS_ICON_WRAPPER,
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_BADGE_ACTIVE,
  DS_TEL_BLOCK,
  DS_BUTTON,
  DS_ICON_SM,
} from "@/lib/design-system";
import {
  LightningIcon,
  CheckCircleIcon,
  LockKeyIcon,
  CrownSimpleIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { createCheckoutSession } from "@/actions/billing-action";

const PRO_FEATURES = [
  "Devis Illimités",
  "Suppression filigrane",
  "Export PDF Haute Définition",
  "Support Prioritaire 24/7",
  "Thèmes Premium",
  "Historique complet",
];

interface UpgradeCardProps {
  hasStripe: boolean;
  className?: string;
}

export function UpgradeCard({ hasStripe, className }: UpgradeCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleCheckout = () => {
    startTransition(async () => {
      const res = await createCheckoutSession();
      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        toast.error("Erreur Stripe", { description: res.error });
      }
    });
  };

  return (
    <div className={cn(STUDIO_V2_CARD, className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
            <LightningIcon size={DS_ICON_SM} className="text-indigo-500" />
          </div>
          <span className={cn(DS_MICRO)}>Offre Premium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={DS_BADGE_ACTIVE}>RECOMMANDÉ</span>
        </div>
      </div>

      <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
        Plein Potentiel
      </h3>
      <p className={cn(DS_LABEL, "mb-4")}>
        Débloquez toutes les fonctionnalités pour 12 500 FCFA/mois
      </p>

      <div className="space-y-2.5 mb-6">
        {PRO_FEATURES.map((f) => (
          <div key={f} className="flex items-center gap-2">
            <div className={cn(DS_ICON_WRAPPER, "bg-emerald-50")}>
              <CheckCircleIcon size={DS_ICON_SM} className="text-emerald-500" />
            </div>
            <span className="text-xs font-medium text-slate-700">{f}</span>
          </div>
        ))}
      </div>

      <div className={cn(DS_TEL_BLOCK, "bg-indigo-50 border-indigo-200 mb-4")}>
        <div className="flex items-center justify-between">
          <div>
            <span className={cn(DS_LABEL, "text-indigo-500")}>
              Tarif mensuel
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-indigo-700 font-mono tabular-nums">12 500</span>
              <span className={cn(DS_MONO, "text-indigo-500")}>FCFA/mois</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-indigo-400">
            <LockKeyIcon size={DS_ICON_SM} />
            <span className={cn(DS_MONO, "text-[9px]")}>SSL</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={isPending}
        className={cn(DS_BUTTON, "w-full justify-center")}
      >
        {isPending ? (
          <SpinnerIcon size={DS_ICON_SM} className="animate-spin" />
        ) : (
          <CrownSimpleIcon size={DS_ICON_SM} />
        )}
        {isPending ? "Redirection..." : "Passer en PRO — 12 500 FCFA/mois"}
      </button>
      <div className="flex items-center justify-center gap-1.5 mt-2 text-slate-400">
        <LockKeyIcon size={10} />
        <span className="text-[9px] font-bold uppercase tracking-wider">
          Paiement Sécurisé SSL
        </span>
      </div>
    </div>
  );
}