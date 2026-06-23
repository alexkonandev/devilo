"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ConfigHeader } from "@/components/shared/layout/config-header";
import { CreditCardIcon } from "@phosphor-icons/react";
import { DS_BADGE_ACTIVE, DS_BADGE_WARNING } from "@/lib/design-system";

interface BillingHeaderProps {
  plan: string;
  isPro: boolean;
}

export function BillingHeader({ plan, isPro }: BillingHeaderProps) {
  return (
    <div className={cn("-mx-4 -mt-4 pt-4 pb-4 px-4")}>
      <div className="max-w-3xl mx-auto">
        <ConfigHeader
          title="Facturation"
          description="Abonnement · Quota · Factures"
          category={{ icon: CreditCardIcon, label: "Plan & Paiement" }}
          accent="violet"
          badge={
            <span className={isPro ? DS_BADGE_ACTIVE : DS_BADGE_WARNING}>
              {plan}
            </span>
          }
        />
      </div>
    </div>
  );
}