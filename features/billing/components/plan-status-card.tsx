"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  DS_BENTO_CARD,
  DS_ICON_WRAPPER,
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_BADGE_ACTIVE,
  DS_BADGE_WARNING,
  DS_TEL_BLOCK,
  DS_PROGRESS_TRACK,
  DS_PROGRESS_BAR,
  DS_ICON_SM,
} from "@/lib/design-system";
import {
  CrownSimpleIcon,
  PuzzlePieceIcon,
  CalendarIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import type { BillingProfile } from "@/actions/billing-action";

interface PlanStatusCardProps {
  billingProfile: BillingProfile;
  className?: string;
}

export function PlanStatusCard({ billingProfile, className }: PlanStatusCardProps) {
  const isPro =
    billingProfile.plan === "PRO" || billingProfile.plan === "ENTERPRISE";
  const usagePercent =
    billingProfile.quotaLimit === Infinity
      ? 100
      : Math.min(
          (billingProfile.quotaUsed / billingProfile.quotaLimit) * 100,
          100,
        );
  const isNearLimit = !isPro && usagePercent >= 80;

  return (
    <div className={cn(DS_BENTO_CARD, "p-3", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              DS_ICON_WRAPPER,
              isPro ? "bg-indigo-50" : "bg-slate-50",
            )}
          >
            {isPro ? (
              <CrownSimpleIcon size={DS_ICON_SM} className="text-indigo-500" />
            ) : (
              <PuzzlePieceIcon size={DS_ICON_SM} className="text-slate-400" />
            )}
          </div>
          <span className={cn(DS_MICRO)}>
            Statut Abonnement
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={isPro ? DS_BADGE_ACTIVE : DS_BADGE_WARNING}>
            {billingProfile.plan}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-sans text-base font-bold text-slate-900 tracking-tight mb-0">
          {isPro ? "Plein Potentiel" : "Plan Gratuit"}
        </h2>
        <p className={cn(DS_LABEL, "mt-1")}>
          {isPro
            ? "Accès illimité à toutes les fonctionnalités"
            : "Usage limité — upgrade disponible"}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={DS_LABEL}>Consommation Quota</span>
          <span className={cn(DS_MONO, "text-slate-700")}>
            {isPro ? "∞" : billingProfile.quotaUsed}/
            {isPro ? "∞" : billingProfile.quotaLimit}
          </span>
        </div>
        <div className={DS_PROGRESS_TRACK}>
          <div
            className={cn(
              DS_PROGRESS_BAR,
              isPro
                ? "bg-indigo-500"
                : isNearLimit
                  ? "bg-rose-500"
                  : "bg-emerald-500",
            )}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        {isNearLimit && (
          <p className="text-[10px] font-bold text-amber-600">
            ⚠ Approche de la limite — passez en PRO pour continuer
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className={DS_TEL_BLOCK}>
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon size={DS_ICON_SM} className="text-slate-400" />
            <span className={cn(DS_LABEL, "text-slate-500")}>
              Renouvellement
            </span>
          </div>
          <span className={cn(DS_MONO, "text-slate-700")}>
            {billingProfile.subscriptionEndsAt
              ? new Date(billingProfile.subscriptionEndsAt).toLocaleDateString("fr-FR")
              : isPro
                ? "Automatique"
                : "—"}
          </span>
        </div>
        <div
          className={cn(
            DS_TEL_BLOCK,
            isPro ? "bg-emerald-50 border-emerald-200" : "",
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheckIcon
              size={DS_ICON_SM}
              className={isPro ? "text-emerald-500" : "text-slate-400"}
            />
            <span
              className={cn(
                DS_LABEL,
                isPro ? "text-emerald-600" : "text-slate-500",
              )}
            >
              État
            </span>
          </div>
          <span
            className={cn(
              DS_MONO,
              isPro ? "text-emerald-700" : "text-slate-700",
            )}
          >
            {isPro ? "ACTIF" : "LIMITÉ"}
          </span>
        </div>
      </div>
    </div>
  );
}