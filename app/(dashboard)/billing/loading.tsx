import { SkeletonBlock, SkeletonCircle } from "@/components/shared/ui/skeleton";

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
        <SkeletonBlock className="h-2 w-40" />
        <div className="flex-1" />
        <SkeletonBlock className="h-6 w-16 rounded-full" />
      </header>

      {/* ─── Contenu px-6 (le billing réel utilise px-6) ─── */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-4">
        {/* Row 1 — PlanStatusCard + AnalyticsCard */}
        <div className="grid grid-cols-2 gap-4">
          {/* PlanStatusCard */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <SkeletonCircle className="size-5" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
            <SkeletonBlock className="h-6 w-32 mb-2" />
            <SkeletonBlock className="h-4 w-full rounded-full mb-3" />
            <SkeletonBlock className="h-2 w-48 mb-4" />
            <SkeletonBlock className="h-8 w-28 rounded-md" />
          </div>

          {/* AnalyticsCard */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-center gap-2 mb-4">
              <SkeletonCircle className="size-5" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <SkeletonBlock className="h-8 w-16 mb-1" />
                <SkeletonBlock className="h-2 w-12" />
              </div>
              <div>
                <SkeletonBlock className="h-8 w-16 mb-1" />
                <SkeletonBlock className="h-2 w-12" />
              </div>
            </div>
            <SkeletonBlock className="h-28 w-full rounded-md" />
          </div>
        </div>

        {/* Row 2 — FinancialLifecycleCard + BillingManageBlock */}
        <div className="grid grid-cols-2 gap-4">
          {/* FinancialLifecycleCard */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <SkeletonCircle className="size-5" />
              <SkeletonBlock className="h-3 w-32" />
            </div>
            <SkeletonBlock className="h-3 w-48 mb-2" />
            <SkeletonBlock className="h-3 w-40 mb-3" />
            <SkeletonBlock className="h-5 w-20 rounded-full" />
          </div>

          {/* BillingManageBlock */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
            <SkeletonBlock className="h-4 w-28 mb-3" />
            <SkeletonBlock className="h-9 w-40 rounded-md mb-4" />
            <SkeletonBlock className="h-3 w-32 mb-2" />
            <SkeletonBlock className="h-3 w-48" />
          </div>
        </div>
      </div>
    </div>
  );
}