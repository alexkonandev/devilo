import { SkeletonBlock } from "@/components/shared/ui/skeleton";

// ═══════════════════════════════════════════════════════════════════════════════
// HOME LOADING — Skeleton page /home
// Miroir exact de home-view.tsx (header px-6 pt-6 pb-4, grid 3 quick actions,
// 3 stats badges, 5 lignes de devis récents)
// ═══════════════════════════════════════════════════════════════════════════════

export default function HomeLoading() {
  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      {/* ─── Header ─── */}
      <header className="shrink-0 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <SkeletonBlock className="h-5 w-48" />
            <SkeletonBlock className="h-3 w-64" />
          </div>
          <SkeletonBlock className="h-9 w-32 rounded-xl" />
        </div>
      </header>

      {/* ─── Contenu ─── */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
        {/* Quick Actions — 3 cartes */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <SkeletonBlock className="w-8 h-8 rounded-md" />
                <SkeletonBlock className="h-3 w-16" />
              </div>
              <SkeletonBlock className="h-2 w-24 mb-2" />
              <SkeletonBlock className="h-2 w-14" />
            </div>
          ))}
        </div>

        {/* Stats mini — 3 badges */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-7 w-24 rounded-xl" />
          ))}
        </div>

        {/* Derniers devis */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-2 w-12" />
          </div>
          <div className="space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg py-2.5 px-3 animate-pulse"
              >
                <SkeletonBlock className="w-7 h-7 rounded-lg shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <SkeletonBlock className="h-3 w-3/5" />
                  <SkeletonBlock className="h-2 w-2/5" />
                </div>
                <div className="text-right space-y-1 shrink-0">
                  <SkeletonBlock className="h-3 w-16 ml-auto" />
                  <SkeletonBlock className="h-4 w-12 rounded-full ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}