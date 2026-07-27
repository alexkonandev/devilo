"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  STUDIO_V2_CARD,
  DS_ICON_WRAPPER,
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_BADGE_SUCCESS,
  DS_TEL_BLOCK,
  DS_ICON_SM,
} from "@/lib/design-system";
import {
  CalendarIcon,
  CreditCardIcon,
} from "@phosphor-icons/react";
import { PlanComparator, DEFAULT_PLAN_COMPARISON } from "./plan-comparator";
import type { BillingProfile } from "@/actions/billing-action";

interface FinancialLifecycleCardProps {
  billingProfile: BillingProfile;
  isPro: boolean;
  className?: string;
}

export function FinancialLifecycleCard({ billingProfile, isPro, className }: FinancialLifecycleCardProps) {
  const { nextPayment } = billingProfile;

  return (
    <div className={cn(STUDIO_V2_CARD, className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className={cn(DS_ICON_WRAPPER, "bg-violet-50")}>
            <CalendarIcon size={DS_ICON_SM} className="text-violet-500" />
          </div>
          <span className={cn(DS_MICRO)}>
            Cycle de Facturation
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isPro && nextPayment && (
            <span className={DS_BADGE_SUCCESS}>AUTOMATIQUE</span>
          )}
        </div>
      </div>

      {isPro && nextPayment && nextPayment.date ? (
        <div className="space-y-3 mb-4">
          <div className={cn(DS_TEL_BLOCK, "bg-violet-50 border-violet-200")}>
            <span className={cn(DS_LABEL, "text-violet-500")}>
              Prochain prélèvement
            </span>
            <div className="flex items-center justify-between mt-1.5">
              <div>
                <span className="text-lg font-black text-violet-700">
                  {nextPayment.amount.toLocaleString("fr-FR")}{" "}
                  {nextPayment.currency}
                </span>
                <span className="text-[11px] font-sans font-medium text-violet-500 ml-2">
                  le{" "}
                  {new Date(nextPayment.date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {nextPayment.cardLast4 && (
            <div className={DS_TEL_BLOCK}>
              <div className="flex items-center gap-2">
                <CreditCardIcon size={DS_ICON_SM} className="text-slate-400" />
                <span className={cn(DS_LABEL, "text-slate-500")}>
                  Moyen de paiement
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] font-sans font-bold text-slate-800 uppercase">
                  {(nextPayment.cardBrand ?? "carte").toUpperCase()}
                </span>
                <span className="text-[11px] font-sans font-medium text-slate-500">
                  •••• {nextPayment.cardLast4}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : isPro ? (
        <div className={cn(DS_TEL_BLOCK, "mb-4")}>
          <p className="text-xs text-slate-500">
            Aucune information de paiement liée. Connectez votre compte Stripe
            pour suivre vos prélèvements.
          </p>
        </div>
      ) : null}

      <PlanComparator
        rows={DEFAULT_PLAN_COMPARISON}
        isPro={isPro}
        title={isPro ? "Ce que vous avez débloqué" : "Comparatif des plans"}
      />
    </div>
  );
}