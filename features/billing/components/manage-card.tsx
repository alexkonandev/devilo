"use client";

import React, { useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  STUDIO_V2_CARD,
  DS_ICON_WRAPPER,
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_BADGE_SUCCESS,
  DS_TEL_BLOCK,
  DS_BUTTON,
  DS_ICON_SM,
} from "@/lib/design-system";
import {
  CreditCardIcon,
  ShieldCheckIcon,
  ArrowSquareOutIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { createPortalSession } from "@/actions/billing-action";

interface ManageCardProps {
  hasStripe: boolean;
  className?: string;
}

export function ManageCard({ hasStripe, className }: ManageCardProps) {
  const [isPending, startTransition] = useTransition();

  const handlePortal = () => {
    startTransition(async () => {
      const res = await createPortalSession();
      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        toast.error("Erreur", { description: res.error });
      }
    });
  };

  return (
    <div className={cn(STUDIO_V2_CARD, className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className={cn(DS_ICON_WRAPPER, "bg-emerald-50")}>
            <CreditCardIcon size={DS_ICON_SM} className="text-emerald-500" />
          </div>
          <span className={cn(DS_MICRO)}>
            Gestion & Paiement
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={DS_BADGE_SUCCESS}>ACTIF</span>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed mb-4">
        {hasStripe
          ? "Gérez votre moyen de paiement, modifiez ou annulez votre abonnement depuis le portail sécurisé Stripe."
          : "Votre plan PRO est actif. Le portail de gestion sera disponible une fois la synchronisation Stripe terminée."}
      </p>

      <div className={cn(DS_TEL_BLOCK, "mb-4")}>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheckIcon size={DS_ICON_SM} className="text-emerald-500" />
          <span className={cn(DS_LABEL, "text-emerald-600")}>
            Abonnement Plein Potentiel
          </span>
        </div>
        <span className={cn(DS_MONO, "text-slate-700")}>
          12 500 FCFA / mois — renouvellement automatique
        </span>
      </div>

      {hasStripe && (
        <button
          onClick={handlePortal}
          disabled={isPending}
          className={cn(
            DS_BUTTON,
            "w-full justify-center bg-slate-700 hover:bg-slate-600",
          )}
        >
          {isPending ? (
            <SpinnerIcon size={DS_ICON_SM} className="animate-spin" />
          ) : (
            <ArrowSquareOutIcon size={DS_ICON_SM} />
          )}
          {isPending ? "Ouverture..." : "Gérer mon abonnement"}
        </button>
      )}
    </div>
  );
}