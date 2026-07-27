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
  DS_BADGE_SUCCESS,
  DS_BADGE_WARNING,
  DS_BADGE_DANGER,
  DS_TEL_BLOCK,
  DS_BUTTON,
  DS_ICON_SM,
} from "@/lib/design-system";
import {
  CreditCardIcon,
  ShieldCheckIcon,
  ArrowSquareOutIcon,
  ReceiptIcon,
  LightningIcon,
  CheckCircleIcon,
  LockKeyIcon,
  CrownSimpleIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  createCheckoutSession,
  createPortalSession,
} from "@/actions/billing-action";
import type { BillingProfile } from "@/actions/billing-action";

const PRO_FEATURES = [
  "Devis Illimités",
  "Suppression filigrane",
  "Export PDF Haute Définition",
  "Support Prioritaire 24/7",
  "Thèmes Premium",
  "Historique complet",
];

interface BillingManageBlockProps {
  billingProfile: BillingProfile;
  isPro: boolean;
  className?: string;
}

export function BillingManageBlock({
  billingProfile,
  isPro,
  className,
}: BillingManageBlockProps) {
  const hasStripe = !!billingProfile.stripeCustomerId;
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
      {/* ── Gestion & Paiement ── */}
      {isPro ? (
        <>
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
          <span className="text-[11px] font-sans font-medium text-slate-700">
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
        </>
      ) : (
        <>
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

          <div className="space-y-2.5 mb-4">
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
                  <span className="text-[11px] font-sans font-semibold text-indigo-500">FCFA/mois</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-indigo-400">
                <LockKeyIcon size={DS_ICON_SM} />
                <span className="text-[9px] font-sans font-semibold uppercase tracking-wider">SSL</span>
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
        </>
      )}

      {/* ── Séparateur ── */}
      <div className="border-t border-slate-100 my-4" />

      {/* ── Historique Factures ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className={cn(DS_ICON_WRAPPER, "bg-slate-50")}>
              <ReceiptIcon size={DS_ICON_SM} className="text-slate-400" />
            </div>
            <span className={cn(DS_MICRO)}>
              Historique Factures
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-sans font-medium text-slate-500">
              {billingProfile.invoices.length} facture{billingProfile.invoices.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {billingProfile.invoices.length === 0 ? (
          <div className="py-6 text-center">
            <div
              className={cn(
                DS_ICON_WRAPPER,
                "bg-slate-50 mx-auto mb-3 w-10 h-10",
              )}
            >
              <ReceiptIcon size={16} className="text-slate-300" />
            </div>
            <p className="text-xs text-slate-500 mb-1">Aucune facture</p>
            <p className="text-[10px] text-slate-500">
              Vos factures apparaîtront ici après votre premier paiement.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {billingProfile.invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-2.5 rounded border border-slate-200 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(DS_ICON_WRAPPER, "bg-slate-50")}>
                    <ReceiptIcon size={DS_ICON_SM} className="text-slate-400" />
                  </div>
                  <div>
                  <span className="text-[11px] font-sans font-medium text-slate-700 block">
                    {new Date(inv.date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                    <span className="text-[9px] text-slate-500">
                      {inv.id.slice(0, 16)}...
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                <span className="text-[11px] font-sans font-bold text-slate-900 tabular-nums">
                  {inv.amount.toLocaleString("fr-FR")} {inv.currency}
                </span>
                  <span
                    className={
                      inv.status === "paid"
                        ? DS_BADGE_SUCCESS
                        : inv.status === "open"
                          ? DS_BADGE_WARNING
                          : DS_BADGE_DANGER
                    }
                  >
                    {inv.status === "paid"
                      ? "PAYÉ"
                      : inv.status === "open"
                        ? "EN ATTENTE"
                        : inv.status.toUpperCase()}
                  </span>
                  {inv.pdfUrl && (
                    <a
                      href={inv.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-500 hover:text-indigo-600"
                    >
                      <ArrowSquareOutIcon size={DS_ICON_SM} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}