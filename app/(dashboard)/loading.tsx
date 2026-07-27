import { cn } from "@/lib/utils";
import {
  SkeletonBlock,
  SkeletonCircle,
} from "@/components/shared/ui/skeleton";

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD LOADING — Skeleton screen inspiré Figma
// Seul le contenu principal est squeletté : le layout parent fournit déjà
// la topbar et le dock latéral réels, qui persistent entre les navigations.
// ═══════════════════════════════════════════════════════════════════════════════

export default function DashboardLoading() {
  return (
    <div className="h-full overflow-y-auto p-6">

      {/* En-tête de page */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-48" />
          <SkeletonBlock className="h-2.5 w-32" />
        </div>
        <SkeletonBlock className="h-8 w-28 rounded-md" />
      </div>

      {/* Grille de KPIs (4 cartes) */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-md p-4 animate-pulse"
          >
            <div className="flex items-center gap-2 mb-3">
              <SkeletonCircle className="w-6 h-6" />
              <SkeletonBlock className="h-2 w-16" />
            </div>
            <SkeletonBlock className="h-7 w-24 mb-1.5" />
            <SkeletonBlock className="h-2 w-14" />
          </div>
        ))}
      </div>

      {/* Section : titre + filtre */}
      <div className="flex items-center justify-between mb-4">
        <SkeletonBlock className="h-3 w-32" />
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-7 w-20 rounded-md" />
          <SkeletonBlock className="h-7 w-20 rounded-md" />
        </div>
      </div>

      {/* Tableau skeleton (5 lignes) */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        {/* En-tête de tableau */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-200 bg-slate-50/50">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock
              key={i}
              className={cn(
                "h-2.5",
                i === 0 ? "w-1/4" : "w-1/6",
              )}
            />
          ))}
        </div>

        {/* Lignes de données */}
        {Array.from({ length: 5 }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className={cn(
              "flex items-center gap-4 px-4 py-3.5",
              rowIdx < 4 && "border-b border-slate-100",
            )}
          >
            {Array.from({ length: 5 }).map((_, colIdx) => (
              <SkeletonBlock
                key={colIdx}
                className={cn(
                  "h-3",
                  colIdx === 0 ? "w-1/4" : "w-1/6",
                )}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between mt-4">
        <SkeletonBlock className="h-2.5 w-32" />
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-7 w-7 rounded-md" />
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-7 w-7 rounded-md" />
          ))}
          <SkeletonBlock className="h-7 w-7 rounded-md" />
        </div>
      </div>

    </div>
  );
}