import { SkeletonBlock } from "@/components/shared/ui/skeleton";

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS LOADING — Skeleton page /settings
// Miroir exact de spatial-settings-view.tsx (header h-12, 3 rows × 2 colonnes
// de cartes formulaire : CompanyInfo + FiscalConfig, Identity + Address,
// Security + DangerZone)
// ═══════════════════════════════════════════════════════════════════════════════

function FormFieldSkeleton() {
  return (
    <div className="mb-3">
      <SkeletonBlock className="h-3 w-20 mb-1" />
      <SkeletonBlock className="h-9 w-full rounded-md" />
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      {/* ─── Header h-12 ─── */}
      <header className="flex items-center h-12 px-3 border-b border-slate-200 bg-white shrink-0 gap-2">
        <SkeletonBlock className="w-6 h-6 rounded-md" />
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-2 w-44" />
      </header>

      {/* ─── Contenu px-6 (le settings réel utilise px-6) ─── */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-4">
        {/* Row 1 — CompanyInfoCard + FiscalConfigCard */}
        <div className="grid grid-cols-2 gap-4">
          {/* CompanyInfoCard */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
            <SkeletonBlock className="h-4 w-28 mb-4" />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
          </div>

          {/* FiscalConfigCard */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
            <SkeletonBlock className="h-4 w-36 mb-4" />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
          </div>
        </div>

        {/* Row 2 — IdentityCard + AddressCard */}
        <div className="grid grid-cols-2 gap-4">
          {/* IdentityCard */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
            <SkeletonBlock className="h-4 w-32 mb-4" />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
          </div>

          {/* AddressCard */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
            <SkeletonBlock className="h-4 w-24 mb-4" />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
          </div>
        </div>

        {/* Row 3 — SecuritySection + DangerZoneSection */}
        <div className="grid grid-cols-2 gap-4">
          {/* PasswordSecurityCard */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
            <SkeletonBlock className="h-4 w-20 mb-4" />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <div className="flex items-center justify-between mt-2">
              <SkeletonBlock className="h-3 w-36" />
              <SkeletonBlock className="h-5 w-10 rounded-full" />
            </div>
          </div>

          {/* SessionDangerCard */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
            <SkeletonBlock className="h-4 w-32 mb-2" />
            <SkeletonBlock className="h-3 w-56 mb-4" />
            <SkeletonBlock className="h-9 w-36 rounded-md mb-2" />
            <SkeletonBlock className="h-9 w-52 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}