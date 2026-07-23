"use client";

import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useKernelStore } from "@/hooks/use-kernel-store";
import { PlanStatusCard } from "./components/plan-status-card";
import { AnalyticsCard } from "./components/analytics-card";
import { UpgradeCard } from "./components/upgrade-card";
import { ManageCard } from "./components/manage-card";
import { FinancialLifecycleCard } from "./components/financial-lifecycle-card";
import { InvoicesCard } from "./components/invoices-card";
import { activateProFromSession } from "@/actions/billing-action";
import type { BillingProfile } from "@/actions/billing-action";
import { CreditCardIcon } from "@phosphor-icons/react";
import { DS_BADGE_ACTIVE, DS_BADGE_WARNING } from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN VIEW — Orchestrateur métier uniquement
// ═══════════════════════════════════════════════════════════════════════════════

interface SpatialBillingViewProps {
  billingProfile: BillingProfile;
}

export function SpatialBillingView({
  billingProfile,
}: SpatialBillingViewProps) {
  const setBilling = useKernelStore((s) => s.setBilling);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Sync store Zustand au montage
  useEffect(() => {
    setBilling({
      plan: billingProfile.plan,
      quotaUsed: billingProfile.quotaUsed,
      quotaLimit: billingProfile.quotaLimit,
    });
  }, [billingProfile, setBilling]);

  // Détection retour Stripe (?success=true) → activation PRO + refresh
  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");

    if (success === "true") {
      if (sessionId) {
        toast.loading("Activation de votre abonnement…", { id: "stripe-activation" });
        activateProFromSession(sessionId).then((res) => {
          if (res.success) {
            toast.success("Abonnement PRO activé !", { id: "stripe-activation" });
          } else {
            toast.error("Erreur d'activation", {
              id: "stripe-activation",
              description: res.error ?? "Contactez le support",
            });
          }
          router.replace("/billing");
          router.refresh();
        });
      } else {
        toast.success("Paiement réussi", {
          description: "Votre abonnement PRO est en cours d'activation…",
        });
        router.replace("/billing");
        router.refresh();
      }
    }
    if (searchParams.get("canceled") === "true") {
      toast.info("Paiement annulé", {
        description: "Vous pouvez réessayer à tout moment.",
      });
      router.replace("/billing");
    }
  }, [searchParams, router]);

  const isPro =
    billingProfile.plan === "PRO" || billingProfile.plan === "ENTERPRISE";
  const hasStripe = !!billingProfile.stripeCustomerId;

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      {/* === HEADER === */}
      <header className="flex items-center h-12 px-3 border-b border-slate-200 bg-white shrink-0 gap-2">
        <div className="w-6 h-6 rounded-md bg-violet-50 flex items-center justify-center">
          <CreditCardIcon size={12} className="text-violet-600" weight="bold" />
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-800 tracking-tight">
          Facturation
        </span>
        <span className="text-[8px] font-mono text-slate-400">
          Abonnement · Quota · Factures
        </span>
        <div className="flex-1" />
        <span className={isPro ? DS_BADGE_ACTIVE : DS_BADGE_WARNING}>
          {billingProfile.plan}
        </span>
      </header>

      {/* === CONTENU === */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-4">
        {/* 1. Statut abonnement — information prioritaire */}
        <PlanStatusCard billingProfile={billingProfile} />

        {/* 2. Cycle de facturation — prochain prélèvement, comparateur */}
        <FinancialLifecycleCard billingProfile={billingProfile} isPro={isPro} />

        {/* 3. Action primaire : upgrade (FREE) ou gestion (PRO) */}
        {isPro ? (
          <ManageCard hasStripe={hasStripe} />
        ) : (
          <UpgradeCard hasStripe={hasStripe} />
        )}

        {/* 4. Statistiques mensuelles d'utilisation */}
        <AnalyticsCard billingProfile={billingProfile} />

        {/* 5. Historique des factures */}
        <InvoicesCard invoices={billingProfile.invoices} />
      </div>
    </div>
  );
}