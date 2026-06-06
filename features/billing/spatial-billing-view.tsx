
"use client";

import React, { useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DS_BENTO_CARD,
  DS_SECTION_HEADER,
  DS_ICON_WRAPPER,
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_TITLE,
  DS_BADGE_ACTIVE,
  DS_BADGE_SUCCESS,
  DS_BADGE_WARNING,
  DS_BADGE_DANGER,
  DS_TEL_BLOCK,
  DS_PROGRESS_TRACK,
  DS_PROGRESS_BAR,
  DS_BUTTON,
  DS_ICON_SM,
  DS_PAGE_SHELL,
  DS_PAGE_PADDING,
  DS_PAGE_GRID,
  DS_GAP_ITEMS,
  DS_GAP_SECTIONS,
} from "@/lib/design-system";
import {
  CrownSimpleIcon,
  LightningIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ReceiptIcon,
  ArrowSquareOutIcon,
  SpinnerIcon,
  LockKeyIcon,
  CalendarIcon,
  ChartBarIcon,
  TrendUpIcon,
  FileTextIcon,
  CurrencyCircleDollarIcon,
  PuzzlePieceIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useKernelStore } from "@/hooks/use-kernel-store";
import { PlanComparator, DEFAULT_PLAN_COMPARISON } from "./components/plan-comparator";
import {
  type BillingProfile,
  createCheckoutSession,
  createPortalSession,
} from "@/actions/billing-action";

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN VIEW
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
      <div className="w-full">
        <div className={DS_PAGE_GRID}>
          {/* Row 1 — Statut + Analytics */}
          <BentoPlanStatus
            billingProfile={billingProfile}
            className="col-span-12 md:col-span-6 lg:col-span-5"
          />
          <BentoAnalytics
            billingProfile={billingProfile}
            className="col-span-12 md:col-span-6 lg:col-span-7"
          />

          {/* Row 2 — Manage/Upgrade + Financial Lifecycle */}
          {isPro ? (
            <BentoManage
              hasStripe={hasStripe}
              className="col-span-12 md:col-span-6 lg:col-span-5"
            />
          ) : (
            <BentoUpgrade
              hasStripe={hasStripe}
              className="col-span-12 md:col-span-6 lg:col-span-5"
            />
          )}
          <BentoFinancialLifecycle
            billingProfile={billingProfile}
            isPro={isPro}
            className="col-span-12 md:col-span-6 lg:col-span-7"
          />

          {/* Row 3 — Factures */}
          <BentoInvoices
            invoices={billingProfile.invoices}
            className="col-span-12"
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TUILE A — Statut du plan
// ═══════════════════════════════════════════════════════════════════════════════

function BentoPlanStatus({
  billingProfile,
  className,
}: {
  billingProfile: BillingProfile;
  className?: string;
}) {
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
    <div className={cn(DS_BENTO_CARD, className)}>
      {/* Header */}
      <div className={DS_SECTION_HEADER}>
        <div className="flex items-center gap-2">
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
          <span className={cn(DS_MICRO, "text-slate-600")}>
            Statut Abonnement
          </span>
        </div>
        <span className={isPro ? DS_BADGE_ACTIVE : DS_BADGE_WARNING}>
          {billingProfile.plan}
        </span>
      </div>

      {/* Plan name */}
      <div className="mb-6">
        <h2 className={cn(DS_TITLE, "mb-0")}>
          {isPro ? "Plein Potentiel" : "Plan Gratuit"}
        </h2>
        <p className={cn(DS_LABEL, "mt-1")}>
          {isPro
            ? "Accès illimité à toutes les fonctionnalités"
            : "Usage limité — upgrade disponible"}
        </p>
      </div>

      {/* Quota gauge */}
      <div className="space-y-2">
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

      {/* Telemetry block */}
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
              ? new Date(billingProfile.subscriptionEndsAt).toLocaleDateString(
                  "fr-FR",
                )
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

// ═══════════════════════════════════════════════════════════════════════════════
// TUILE — Analytics (consommation mensuelle)
// ═══════════════════════════════════════════════════════════════════════════════

function BentoAnalytics({
  billingProfile,
  className,
}: {
  billingProfile: BillingProfile;
  className?: string;
}) {
  const { monthlyStats } = billingProfile;
  const isPro =
    billingProfile.plan === "PRO" || billingProfile.plan === "ENTERPRISE";

  const stats = [
    {
      label: "Devis ce mois",
      value: monthlyStats.quotesThisMonth,
      icon: FileTextIcon,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      barColor: "bg-indigo-400",
    },
    {
      label: "Acceptés / Payés",
      value: monthlyStats.quotesAccepted,
      icon: CheckCircleIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      barColor: "bg-emerald-400",
    },
    {
      label: "Total historique",
      value: monthlyStats.quotesTotal,
      icon: ChartBarIcon,
      color: "text-slate-500",
      bg: "bg-slate-50",
      barColor: "bg-slate-400",
    },
  ];

  const maxVal = Math.max(...stats.map((s) => s.value), 1);

  return (
    <div className={cn(DS_BENTO_CARD, className)}>
      <div className={DS_SECTION_HEADER}>
        <div className="flex items-center gap-2">
          <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
            <TrendUpIcon size={DS_ICON_SM} className="text-indigo-500" />
          </div>
          <span className={cn(DS_MICRO, "text-slate-600")}>
            Activité Mensuelle
          </span>
        </div>
        <span className={cn(DS_MONO, "text-[9px] text-slate-400")}>
          {new Date().toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Revenue highlight */}
      {isPro && (
        <div
          className={cn(DS_TEL_BLOCK, "bg-emerald-50 border-emerald-200 mb-4")}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className={cn(DS_LABEL, "text-emerald-500")}>
                Revenu HT ce mois
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-emerald-700 font-mono tabular-nums">
                    {monthlyStats.revenueThisMonth.toLocaleString("fr-FR")}
                  </span>
                <span className={cn(DS_MONO, "text-emerald-500")}>
                  {billingProfile.nextPayment?.currency ?? "XOF"}
                </span>
              </div>
            </div>
            <CurrencyCircleDollarIcon size={20} className="text-emerald-300" />
          </div>
        </div>
      )}

      {/* Mini bar chart */}
      <div className="space-y-3">
        {stats.map((s) => {
          const Icon = s.icon;
          const barWidth = Math.max((s.value / maxVal) * 100, 4);
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={cn(DS_ICON_WRAPPER, s.bg)}>
                    <Icon size={DS_ICON_SM} className={s.color} />
                  </div>
                  <span className={cn(DS_LABEL, "text-slate-500")}>
                    {s.label}
                  </span>
                </div>
                <span className={cn(DS_MONO, "text-slate-800 font-bold")}>
                  {s.value}
                </span>
              </div>
              <div className={DS_PROGRESS_TRACK}>
                <div
                  className={cn(DS_PROGRESS_BAR, s.barColor)}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TUILE B — Upgrade (plan FREE)
// ═══════════════════════════════════════════════════════════════════════════════

const PRO_FEATURES = [
  "Devis Illimités",
  "Suppression filigrane",
  "Export PDF Haute Définition",
  "Support Prioritaire 24/7",
  "Thèmes Premium",
  "Historique complet",
];

function BentoUpgrade({
  hasStripe,
  className,
}: {
  hasStripe: boolean;
  className?: string;
}) {
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
    <div className={cn(DS_BENTO_CARD, className)}>
      {/* Header */}
      <div className={DS_SECTION_HEADER}>
        <div className="flex items-center gap-2">
          <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
            <LightningIcon size={DS_ICON_SM} className="text-indigo-500" />
          </div>
          <span className={cn(DS_MICRO, "text-slate-600")}>Offre Premium</span>
        </div>
        <span className={DS_BADGE_ACTIVE}>RECOMMANDÉ</span>
      </div>

      <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
        Plein Potentiel
      </h3>
      <p className={cn(DS_LABEL, "mb-4")}>
        Débloquez toutes les fonctionnalités pour 12 500 FCFA/mois
      </p>

      {/* Features checklist — style identique aux checkmarks SecuritySection */}
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

      {/* Price block */}
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

      {/* CTA button */}
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

// ═══════════════════════════════════════════════════════════════════════════════
// TUILE B-alt — Manage (plan PRO)
// ═══════════════════════════════════════════════════════════════════════════════

function BentoManage({
  hasStripe,
  className,
}: {
  hasStripe: boolean;
  className?: string;
}) {
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
    <div className={cn(DS_BENTO_CARD, className)}>
      <div className={DS_SECTION_HEADER}>
        <div className="flex items-center gap-2">
          <div className={cn(DS_ICON_WRAPPER, "bg-emerald-50")}>
            <CreditCardIcon size={DS_ICON_SM} className="text-emerald-500" />
          </div>
          <span className={cn(DS_MICRO, "text-slate-600")}>
            Gestion &amp; Paiement
          </span>
        </div>
        <span className={DS_BADGE_SUCCESS}>ACTIF</span>
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

// ═══════════════════════════════════════════════════════════════════════════════
// TUILE — Financial Lifecycle
// ═══════════════════════════════════════════════════════════════════════════════

function BentoFinancialLifecycle({
  billingProfile,
  isPro,
  className,
}: {
  billingProfile: BillingProfile;
  isPro: boolean;
  className?: string;
}) {
  const { nextPayment } = billingProfile;

  return (
    <div className={cn(DS_BENTO_CARD, className)}>
      <div className={DS_SECTION_HEADER}>
        <div className="flex items-center gap-2">
          <div className={cn(DS_ICON_WRAPPER, "bg-violet-50")}>
            <CalendarIcon size={DS_ICON_SM} className="text-violet-500" />
          </div>
          <span className={cn(DS_MICRO, "text-slate-600")}>
            Cycle de Facturation
          </span>
        </div>
        {isPro && nextPayment && (
          <span className={DS_BADGE_SUCCESS}>AUTOMATIQUE</span>
        )}
      </div>

      {/* Next payment block */}
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
                <span className={cn(DS_MONO, "text-violet-400 ml-2")}>
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

          {/* Card info */}
          {nextPayment.cardLast4 && (
            <div className={DS_TEL_BLOCK}>
              <div className="flex items-center gap-2">
                <CreditCardIcon size={DS_ICON_SM} className="text-slate-400" />
                <span className={cn(DS_LABEL, "text-slate-500")}>
                  Moyen de paiement
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={cn(DS_MONO, "text-slate-800 font-bold")}>
                  {(nextPayment.cardBrand ?? "carte").toUpperCase()}
                </span>
                <span className={cn(DS_MONO, "text-slate-500")}>
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

      {/* Plan comparator — composant réutilisable */}
      <PlanComparator
        rows={DEFAULT_PLAN_COMPARISON}
        isPro={isPro}
        title={isPro ? "Ce que vous avez débloqué" : "Comparatif des plans"}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TUILE D — Historique factures
// ═══════════════════════════════════════════════════════════════════════════════

function BentoInvoices({
  invoices,
  className,
}: {
  invoices: BillingProfile["invoices"];
  className?: string;
}) {
  return (
    <div className={cn(DS_BENTO_CARD, className)}>
      <div className={DS_SECTION_HEADER}>
        <div className="flex items-center gap-2">
          <div className={cn(DS_ICON_WRAPPER, "bg-slate-50")}>
            <ReceiptIcon size={DS_ICON_SM} className="text-slate-400" />
          </div>
          <span className={cn(DS_MICRO, "text-slate-600")}>
            Historique Factures
          </span>
        </div>
        <span className={cn(DS_MONO, "text-[9px] text-slate-400")}>
          {invoices.length} facture{invoices.length !== 1 ? "s" : ""}
        </span>
      </div>

      {invoices.length === 0 ? (
        <div className="py-8 text-center">
          <div
            className={cn(
              DS_ICON_WRAPPER,
              "bg-slate-50 mx-auto mb-3 w-10 h-10",
            )}
          >
            <ReceiptIcon size={16} className="text-slate-300" />
          </div>
          <p className="text-xs text-slate-400 mb-1">Aucune facture</p>
          <p className="text-[10px] text-slate-300">
            Vos factures apparaîtront ici après votre premier paiement.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between p-2.5 rounded border border-slate-200 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn(DS_ICON_WRAPPER, "bg-slate-50")}>
                  <ReceiptIcon size={DS_ICON_SM} className="text-slate-400" />
                </div>
                <div>
                  <span className={cn(DS_MONO, "text-slate-700 block")}>
                    {new Date(inv.date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {inv.id.slice(0, 16)}...
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(DS_MONO, "text-slate-900 font-bold")}>
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
  );
}
