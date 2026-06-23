"use client";

import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DS_PAGE_SHELL,
  DS_PAGE_PADDING,
} from "@/lib/design-system";
import { toast } from "sonner";
import { useKernelStore } from "@/hooks/use-kernel-store";
import { BillingHeader } from "./components/billing-header";
import { PlanStatusCard } from "./components/plan-status-card";
import { AnalyticsCard } from "./components/analytics-card";
import { UpgradeCard } from "./components/upgrade-card";
import { ManageCard } from "./components/manage-card";
import { FinancialLifecycleCard } from "./components/financial-lifecycle-card";
import { InvoicesCard } from "./components/invoices-card";
import type { BillingProfile } from "@/actions/billing-action";

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

  // Détection retour Stripe (?success=true) → refresh données
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Paiement réussi", {
        description: "Votre abonnement PRO est en cours d'activation…",
      });
      router.replace("/billing");
      router.refresh();
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
    <div className={cn(DS_PAGE_SHELL, DS_PAGE_PADDING)}>
      <BillingHeader plan={billingProfile.plan} isPro={isPro} />

      <div className="max-w-3xl mx-auto space-y-4">
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