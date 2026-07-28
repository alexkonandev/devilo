import { SkeletonBlock, SkeletonCircle } from "@/components/shared/ui/skeleton";

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS LOADING — Skeleton page /settings
// Miroir exact de spatial-settings-view.tsx (header h-12 avec boutons Reset+Save,
// 2 rows × 2 colonnes : CompanyInfo + FiscalConfig, PasswordSecurity + SessionDanger)
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
      {/* ─── Header h-12 avec boutons Reset + Save ─── */}
      <header className="flex items-center h-12 px-3 border-b border-slate-200 bg-white shrink-0 gap-2">
        <SkeletonBlock className="w-6 h-6 rounded-md" />
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-2 w-48" />
        <div className="flex-1" />
        <SkeletonBlock className="w-7 h-7 rounded-md" />
        <SkeletonBlock className="w-7 h-7 rounded-md" />
      </header>

      {/* ─── Contenu px-6 (le settings réel utilise px-6) ─── */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-4">
        {/* Row 1 — CompanyInfoCard + FiscalConfigCard */}
        <div className="grid grid-cols-2 gap-4">
          {/* ── CompanyInfoCard ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <SkeletonBlock className="w-6 h-6 rounded-md" />
                <SkeletonBlock className="h-2 w-28" />
              </div>
              <SkeletonBlock className="h-4 w-16 rounded-md" />
            </div>
            {/* Grille 2 colonnes */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {/* Nom + Téléphone */}
              <div>
                <SkeletonBlock className="h-2 w-20 mb-1" />
                <SkeletonBlock className="h-7 w-full rounded-md" />
              </div>
              <div>
                <SkeletonBlock className="h-2 w-16 mb-1" />
                <SkeletonBlock className="h-7 w-full rounded-md" />
              </div>
              {/* Email + Ville */}
              <div>
                <SkeletonBlock className="h-2 w-12 mb-1" />
                <SkeletonBlock className="h-7 w-full rounded-md" />
              </div>
              <div>
                <SkeletonBlock className="h-2 w-10 mb-1" />
                <SkeletonBlock className="h-7 w-full rounded-md" />
              </div>
              {/* Adresse (colonne droite) */}
              <div className="row-start-3 col-start-2">
                <SkeletonBlock className="h-2 w-12 mb-1" />
                <SkeletonBlock className="h-10 w-full rounded-md" />
              </div>
              {/* Logo (colonne gauche, 2 rows) */}
              <div className="col-start-1 row-span-2">
                <SkeletonBlock className="h-8 w-24 rounded-md" />
                <SkeletonBlock className="h-2 w-16 mt-1" />
              </div>
              {/* Site Web (colonne droite, row 4) */}
              <div className="row-start-4 col-start-2">
                <SkeletonBlock className="h-2 w-14 mb-1" />
                <SkeletonBlock className="h-7 w-full rounded-md" />
              </div>
            </div>
          </div>

          {/* ── FiscalConfigCard ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <SkeletonBlock className="w-6 h-6 rounded-md" />
                <SkeletonBlock className="h-2 w-28" />
              </div>
              <SkeletonBlock className="h-4 w-16 rounded-md" />
            </div>
            <div className="space-y-3">
              {/* Devise + Taux TVA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SkeletonBlock className="h-2 w-12 mb-1" />
                  <SkeletonBlock className="h-7 w-full rounded-md" />
                </div>
                <div>
                  <SkeletonBlock className="h-2 w-16 mb-1" />
                  <SkeletonBlock className="h-7 w-full rounded-md" />
                </div>
              </div>
              {/* Bloc Identification Fiscale */}
              <div className="rounded-md border border-slate-200 bg-slate-50/40 px-2.5 py-2 space-y-2">
                <SkeletonBlock className="h-2 w-28" />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <SkeletonBlock className="h-7 w-full rounded-md" />
                    <SkeletonBlock className="h-2 w-16 mt-0.5" />
                  </div>
                  <div>
                    <SkeletonBlock className="h-7 w-full rounded-md" />
                    <SkeletonBlock className="h-2 w-12 mt-0.5" />
                  </div>
                </div>
              </div>
              {/* Bloc Numérotation */}
              <div className="rounded-md border border-slate-200 bg-slate-50/40 px-2.5 py-2 space-y-2">
                <SkeletonBlock className="h-2 w-28" />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <SkeletonBlock className="h-7 w-full rounded-md" />
                    <SkeletonBlock className="h-2 w-12 mt-0.5" />
                  </div>
                  <div>
                    <SkeletonBlock className="h-7 w-full rounded-md" />
                    <SkeletonBlock className="h-2 w-20 mt-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 — PasswordSecurityCard + SessionDangerCard */}
        <div className="grid grid-cols-2 gap-4">
          {/* ── PasswordSecurityCard ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <SkeletonBlock className="w-5 h-5 rounded-md" />
                <SkeletonBlock className="h-2 w-20" />
              </div>
              <SkeletonBlock className="h-4 w-14 rounded-md" />
            </div>
            {/* StatutEmail */}
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/60 px-2 py-1.5 mb-3">
              <SkeletonBlock className="h-2 w-10" />
              <SkeletonBlock className="h-2 w-32" />
              <span className="text-[7px] text-slate-300">·</span>
              <SkeletonBlock className="h-2 w-16" />
              <span className="text-[7px] text-slate-300">·</span>
              <SkeletonBlock className="h-2 w-12" />
            </div>
            {/* ChangePasswordForm */}
            <div className="rounded-md border border-slate-200 bg-slate-50/60 px-2 py-2 space-y-3">
              <SkeletonBlock className="h-2 w-32" />
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-4">
                  <SkeletonBlock className="h-2 w-24 mb-1" />
                  <SkeletonBlock className="h-7 w-full rounded-md" />
                </div>
                <div className="col-span-3">
                  <SkeletonBlock className="h-2 w-20 mb-1" />
                  <SkeletonBlock className="h-7 w-full rounded-md" />
                </div>
                <div className="col-span-3">
                  <SkeletonBlock className="h-2 w-20 mb-1" />
                  <SkeletonBlock className="h-7 w-full rounded-md" />
                </div>
                <div className="col-span-2">
                  <SkeletonBlock className="h-7 w-full rounded-md" />
                </div>
              </div>
            </div>
          </div>

          {/* ── SessionDangerCard ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <SkeletonBlock className="w-5 h-5 rounded-md" />
                <SkeletonBlock className="h-2 w-24" />
              </div>
              <SkeletonBlock className="h-4 w-20 rounded-md" />
            </div>
            {/* Sessions actives */}
            <div className="space-y-2 mb-3">
              <SkeletonBlock className="h-2 w-20 mb-1" />
              <div className="flex items-center px-2 py-1.5 rounded-md border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <SkeletonBlock className="w-1.5 h-1.5 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <SkeletonBlock className="h-2 w-28" />
                    <SkeletonBlock className="h-2 w-20 mt-0.5" />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <SkeletonBlock className="h-2 w-10" />
                  <SkeletonBlock className="h-2 w-12" />
                </div>
              </div>
              <div className="flex items-center px-2 py-1.5 rounded-md border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <SkeletonBlock className="w-1.5 h-1.5 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <SkeletonBlock className="h-2 w-32" />
                    <SkeletonBlock className="h-2 w-24 mt-0.5" />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <SkeletonBlock className="h-2 w-10" />
                  <SkeletonBlock className="h-2 w-14" />
                </div>
              </div>
            </div>
            {/* DangerZone */}
            <div className="rounded-md border border-rose-200 bg-rose-50/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SkeletonBlock className="w-5 h-5 rounded-md shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <SkeletonBlock className="h-2 w-24" />
                    <SkeletonBlock className="h-2 w-48" />
                  </div>
                </div>
                <SkeletonBlock className="h-7 w-20 rounded-md shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}