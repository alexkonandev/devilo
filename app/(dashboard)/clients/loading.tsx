import { SkeletonBlock, SkeletonCircle } from "@/components/shared/ui/skeleton";

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENTS LOADING — Skeleton page /clients
// Miroir exact de spatial-clients-view.tsx (header h-12, grille 3×3 contact
// cards, pagination)
// ═══════════════════════════════════════════════════════════════════════════════

export default function ClientsLoading() {
  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      {/* ─── Header h-12 ─── */}
      <header className="flex items-center h-12 px-3 border-b border-slate-200 bg-white shrink-0 gap-2">
        <SkeletonBlock className="w-6 h-6 rounded-md" />
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
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <SkeletonCircle className="w-10 h-10" />
                    <div className="flex-1 space-y-1.5">
                      <SkeletonBlock className="h-3 w-3/4" />
                      <SkeletonBlock className="h-2 w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <SkeletonBlock className="h-2 w-full" />
                    <SkeletonBlock className="h-2 w-2/3" />
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