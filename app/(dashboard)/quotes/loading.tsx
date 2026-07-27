import { cn } from "@/lib/utils";
import {
  SkeletonBlock,
  SkeletonCircle,
} from "@/components/shared/ui/skeleton";

// ═══════════════════════════════════════════════════════════════════════════════
// QUOTES LOADING — Skeleton screen inspiré Figma
// Imite la structure de SpatialQuotesView (header + tableau + sidebar).
// ═══════════════════════════════════════════════════════════════════════════════

export default function QuotesLoading() {
  return (
    <div className="flex flex-col h-full w-full bg-slate-50">

      {/* ═══ HEADER SKELETON ═══ */}
      <header className="flex items-center h-12 px-3 border-b border-slate-200 bg-white shrink-0 gap-2">
        {/* Icône + titre */}
        <SkeletonBlock className="w-6 h-6 rounded-md" />
        <SkeletonBlock className="h-2.5 w-12" />
        <SkeletonBlock className="h-2 w-10" />

        <div className="flex-1" />

        {/* Search bar */}
        <SkeletonBlock className="h-7 w-44 rounded-md" />
        {/* Filtres */}
        <SkeletonBlock className="h-7 w-20 rounded-md" />
        {/* Export */}
        <SkeletonBlock className="h-7 w-20 rounded-md" />
        {/* CTA nouveau devis */}
        <SkeletonBlock className="h-7 w-7 rounded-md" />
      </header>

      {/* ═══ COMPLETION ALERT SKELETON ═══ */}
      <div className="shrink-0 px-4 pt-3">
        <SkeletonBlock className="h-8 w-full rounded-md" />
      </div>

      {/* ═══ CONTENU PRINCIPAL ═══ */}
      <div className="flex w-full flex-1 min-h-0 px-4 pb-4 pt-3 overflow-hidden gap-4">

        {/* ═══ TABLEAU SKELETON ═══ */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
              {/* En-tête de tableau (5 colonnes) */}
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
              {Array.from({ length: 8 }).map((_, rowIdx) => (
                <div
                  key={rowIdx}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5",
                    rowIdx < 7 && "border-b border-slate-100",
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
          </div>

          {/* Pagination skeleton */}
          <div className="flex items-center justify-between mt-4">
            <SkeletonBlock className="h-2.5 w-36" />
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-7 w-7 rounded-md" />
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-7 w-7 rounded-md" />
              ))}
              <SkeletonBlock className="h-7 w-7 rounded-md" />
            </div>
          </div>
        </div>

        {/* ═══ SIDEBAR SKELETON ═══ */}
        <aside className="w-80 flex flex-col gap-3 min-h-0 overflow-hidden shrink-0">
          {/* Carte client */}
          <div className="bg-white border border-slate-200 rounded-md p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <SkeletonCircle className="w-10 h-10" />
              <div className="space-y-2 flex-1">
                <SkeletonBlock className="h-3 w-3/4" />
                <SkeletonBlock className="h-2 w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-2 w-full" />
              ))}
            </div>
          </div>

          {/* Timeline skeleton */}
          <div className="bg-white border border-slate-200 rounded-md p-4 animate-pulse">
            <SkeletonBlock className="h-3 w-20 mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 mb-3">
                <SkeletonCircle className="w-2 h-2 mt-1.5" />
                <div className="flex-1 space-y-1.5">
                  <SkeletonBlock className="h-2 w-3/4" />
                  <SkeletonBlock className="h-2 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
}