import { SkeletonBlock } from "@/components/shared/ui/skeleton";

// ═══════════════════════════════════════════════════════════════════════════════
// BILLING LOADING — Skeleton page /billing
// Miroir exact de spatial-billing-view.tsx (header h-12, 2×2 grid des 4 cartes
// PlanStatus, Analytics, FinancialLifecycle, BillingManage)
// ═══════════════════════════════════════════════════════════════════════════════

export default function BillingLoading() {
  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      {/* ─── Header h-12 ─── */}
      <header className="flex items-center h-12 px-3 border-b border-slate-200 bg-white shrink-0 gap-2">
        <SkeletonBlock className="w-6 h-6 rounded-md" />
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-2 w-48" />
        <div className="flex-1" />
        <SkeletonBlock className="h-4 w-12 rounded-md" />
      </header>

      {/* ─── Contenu px-6 (le billing réel utilise px-6) ─── */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-4">
        {/* Row 1 — PlanStatusCard + AnalyticsCard */}
        <div className="grid grid-cols-2 gap-4">
          {/* ── PlanStatusCard ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <SkeletonBlock className="w-6 h-6 rounded-md" />
                <SkeletonBlock className="h-2 w-24" />
              </div>
              <SkeletonBlock className="h-4 w-14 rounded-md" />
            </div>
            {/* Titre + description */}
            <div className="mb-6">
              <SkeletonBlock className="h-4 w-28 mb-1" />
              <SkeletonBlock className="h-2 w-44 mt-1" />
            </div>
            {/* Barre quota */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <SkeletonBlock className="h-2 w-28" />
                <SkeletonBlock className="h-2 w-16" />
              </div>
              <SkeletonBlock className="h-1.5 w-full rounded-full" />
            </div>
            {/* 2 blocs info */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="p-2 bg-slate-50 rounded-md border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <SkeletonBlock className="w-3 h-3 rounded-md" />
                  <SkeletonBlock className="h-2 w-20" />
                </div>
                <SkeletonBlock className="h-2 w-16" />
              </div>
              <div className="p-2 bg-slate-50 rounded-md border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <SkeletonBlock className="w-3 h-3 rounded-md" />
                  <SkeletonBlock className="h-2 w-10" />
                </div>
                <SkeletonBlock className="h-2 w-12" />
              </div>
            </div>
          </div>

          {/* ── AnalyticsCard ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <SkeletonBlock className="w-6 h-6 rounded-md" />
                <SkeletonBlock className="h-2 w-24" />
              </div>
              <SkeletonBlock className="h-2 w-20" />
            </div>
            {/* Bloc revenu (PRO) */}
            <div className="p-2 bg-emerald-50 rounded-md border border-emerald-200 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <SkeletonBlock className="h-2 w-24 mb-1" />
                  <div className="flex items-baseline gap-1 mt-1">
                    <SkeletonBlock className="h-6 w-20" />
                    <SkeletonBlock className="h-2 w-8" />
                  </div>
                </div>
                <SkeletonBlock className="w-5 h-5 rounded-md" />
              </div>
            </div>
            {/* 3 stats avec barres */}
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <SkeletonBlock className="w-5 h-5 rounded-md" />
                      <SkeletonBlock className="h-2 w-24" />
                    </div>
                    <SkeletonBlock className="h-2 w-8" />
                  </div>
                  <SkeletonBlock className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2 — FinancialLifecycleCard + BillingManageBlock */}
        <div className="grid grid-cols-2 gap-4">
          {/* ── FinancialLifecycleCard ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <SkeletonBlock className="w-6 h-6 rounded-md" />
                <SkeletonBlock className="h-2 w-28" />
              </div>
              <SkeletonBlock className="h-4 w-20 rounded-md" />
            </div>
            {/* Bloc prochain prélèvement */}
            <div className="p-2 bg-violet-50 rounded-md border border-violet-200 mb-4">
              <SkeletonBlock className="h-2 w-28 mb-1" />
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-baseline gap-1">
                  <SkeletonBlock className="h-5 w-24" />
                  <SkeletonBlock className="h-2 w-32" />
                </div>
              </div>
            </div>
            {/* Infos carte */}
            <div className="p-2 bg-slate-50 rounded-md border border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <SkeletonBlock className="w-3 h-3 rounded-md" />
                <SkeletonBlock className="h-2 w-24" />
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <SkeletonBlock className="h-2 w-16" />
                <SkeletonBlock className="h-2 w-20" />
              </div>
            </div>
            {/* PlanComparator */}
            <SkeletonBlock className="h-2 w-36 mb-3" />
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <SkeletonBlock className="w-3 h-3 rounded-full" />
                  <SkeletonBlock className="h-2 flex-1" />
                </div>
              ))}
            </div>
          </div>

          {/* ── BillingManageBlock ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <SkeletonBlock className="w-6 h-6 rounded-md" />
                <SkeletonBlock className="h-2 w-28" />
              </div>
              <SkeletonBlock className="h-4 w-14 rounded-md" />
            </div>
            {/* Description */}
            <SkeletonBlock className="h-2 w-full mb-1" />
            <SkeletonBlock className="h-2 w-3/4 mb-4" />
            {/* Bloc infos */}
            <div className="p-2 bg-slate-50 rounded-md border border-slate-200 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <SkeletonBlock className="w-3 h-3 rounded-md" />
                <SkeletonBlock className="h-2 w-36" />
              </div>
              <SkeletonBlock className="h-2 w-40" />
            </div>
            {/* Bouton */}
            <SkeletonBlock className="h-8 w-full rounded-md mb-4" />
            {/* Séparateur */}
            <div className="border-t border-slate-100 my-4" />
            {/* Section factures */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <SkeletonBlock className="w-6 h-6 rounded-md" />
                <SkeletonBlock className="h-2 w-24" />
              </div>
              <SkeletonBlock className="h-2 w-12" />
            </div>
            {/* Liste factures vides */}
            <div className="py-6 text-center">
              <SkeletonBlock className="w-10 h-10 rounded-md mx-auto mb-3" />
              <SkeletonBlock className="h-2 w-24 mx-auto mb-1" />
              <SkeletonBlock className="h-2 w-48 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}