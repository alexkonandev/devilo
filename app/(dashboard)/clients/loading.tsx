import { SkeletonBlock, SkeletonCircle } from "@/components/shared/ui/skeleton";

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENTS LOADING — Skeleton page /clients
// Miroir exact de spatial-clients-view.tsx (header h-12, grille responsive
// 1/2/3/4 columns de contact cards, pagination)
// Chaque carte reflète pixel-perfect ContactCard (avatar 10×10 + nom + 3 lignes
// coordonnées avec icônes).
// ═══════════════════════════════════════════════════════════════════════════════

export default function ClientsLoading() {
  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      {/* ─── Header h-12 ─── */}
      <header className="flex items-center h-12 px-3 border-b border-slate-200 bg-white shrink-0 gap-2">
        <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
          <SkeletonBlock className="w-3 h-3 rounded-sm" />
        </div>
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-2 w-12" />
        <div className="flex-1" />
        <SkeletonBlock className="h-7 w-44 rounded-md" />
        <SkeletonBlock className="h-7 w-20 rounded-md" />
        <SkeletonBlock className="h-7 w-7 rounded-md" />
        <SkeletonBlock className="h-7 w-7 rounded-md" />
        <SkeletonBlock className="h-7 w-7 rounded-md" />
      </header>

      {/* ─── Grille clients ─── */}
      <div className="flex w-full flex-1 min-h-0 px-4 pb-4 pt-3 overflow-hidden gap-4">
        <div className="flex flex-col min-h-0 w-full">
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse"
                >
                  {/* En-tête : avatar + nom */}
                  <div className="flex items-center gap-3 mb-3">
                    <SkeletonCircle className="w-10 h-10" />
                    <div className="flex-1 space-y-1.5">
                      <SkeletonBlock className="h-3 w-3/4" />
                    </div>
                  </div>

                  {/* Coordonnées — 3 lignes comme ContactCard */}
                  <div className="space-y-1.5">
                    {/* Email */}
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-slate-50 shrink-0" />
                      <SkeletonBlock className="h-2 w-full" />
                    </div>
                    {/* Téléphone */}
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-slate-50 shrink-0" />
                      <SkeletonBlock className="h-2 w-2/3" />
                    </div>
                    {/* Adresse */}
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded bg-slate-50 shrink-0" />
                      <SkeletonBlock className="h-2 w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Pagination ─── */}
          <div className="flex items-center justify-between mt-4 shrink-0">
            <SkeletonBlock className="h-2 w-32" />
            <div className="flex items-center gap-1">
              <SkeletonBlock className="h-7 w-7 rounded-md" />
              {[1, 2, 3].map((p) => (
                <SkeletonBlock key={p} className="h-7 w-7 rounded-md" />
              ))}
              <SkeletonBlock className="h-7 w-7 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}