import { cn } from "@/lib/utils";
import {
  SkeletonBlock,
  SkeletonCircle,
} from "@/components/shared/ui/skeleton";

// ═══════════════════════════════════════════════════════════════════════════════
// QUOTES LOADING — Skeleton screen pixel-perfect
// Miroir exact de SpatialQuotesView (header + completion alert + tableau 6 cols
// + sidebar flex-1 + pagination).
// ═══════════════════════════════════════════════════════════════════════════════

export default function QuotesLoading() {
  return (
    <div className="flex flex-col h-full w-full bg-slate-50">

      {/* ═══ HEADER SKELETON ═══ */}
      <header className="flex items-center h-12 px-3 border-b border-slate-200 bg-white shrink-0 gap-2">
        {/* Icône + titre */}
        <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
          <SkeletonBlock className="w-3 h-3 rounded-sm" />
        </div>
        <SkeletonBlock className="h-2.5 w-10" />
        <SkeletonBlock className="h-2 w-12" />

        <div className="flex-1" />

        {/* Search bar */}
        <SkeletonBlock className="h-7 w-44 rounded-md" />
        {/* Filtres */}
        <SkeletonBlock className="h-7 w-16 rounded-md" />
        {/* Import CSV */}
        <SkeletonBlock className="h-7 w-7 rounded-md" />
        {/* Export CSV */}
        <SkeletonBlock className="h-7 w-7 rounded-md" />
        {/* CTA nouveau devis */}
        <SkeletonBlock className="h-7 w-7 rounded-md" />
      </header>

      {/* ═══ COMPLETION ALERT SKELETON ═══ */}
      <div className="shrink-0 px-4 pt-3">
        <SkeletonBlock className="h-8 w-full rounded-md" />
      </div>

      {/* ═══ CONTENU PRINCIPAL ═══ */}
      <div className="flex w-full flex-1 min-h-0 px-4 pb-4 pt-3 overflow-hidden gap-4">

        {/* ═══ PANNEAU TABLEAU (wrapper blanc) ═══ */}
        <div className="flex-1 min-w-0 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden">
          {/* Bulk selection bar (optionnelle, visible quand sélection) */}
          <div className="shrink-0 px-3 py-2 flex items-center justify-between border-b border-slate-100">
            <SkeletonBlock className="h-2.5 w-28" />
            <SkeletonBlock className="h-5 w-16 rounded-md" />
          </div>

          <div className="flex-1 min-h-0 overflow-auto">
            {/* En-tête de tableau (6 colonnes : checkbox + client + N° + date + statut + montant) */}
            <div className="flex items-center gap-0 px-3 py-3 border-b border-slate-100 bg-white">
              <SkeletonBlock className="w-[36px] h-3 shrink-0" />
              <SkeletonBlock className="h-2.5 min-w-[160px]" />
              <SkeletonBlock className="h-2.5 w-[110px]" />
              <SkeletonBlock className="h-2.5 w-[80px]" />
              <SkeletonBlock className="h-2.5 w-[90px]" />
              <SkeletonBlock className="h-2.5 w-[100px]" />
            </div>

            {/* Lignes de données */}
            {Array.from({ length: 8 }).map((_, rowIdx) => (
              <div
                key={rowIdx}
                className={cn(
                  "flex items-center gap-0 px-3 py-3",
                  rowIdx < 7 && "border-b border-slate-100",
                )}
              >
                {/* Checkbox */}
                <SkeletonBlock className="w-[36px] h-3 shrink-0" />
                {/* Client */}
                <SkeletonBlock className="h-3 min-w-[160px]" />
                {/* N° Devis */}
                <SkeletonBlock className="h-3 w-[110px]" />
                {/* Date */}
                <SkeletonBlock className="h-3 w-[80px]" />
                {/* Statut */}
                <SkeletonBlock className="h-3 w-[90px]" />
                {/* Montant */}
                <SkeletonBlock className="h-3 w-[100px]" />
              </div>
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className="shrink-0 flex items-center justify-between px-3 py-3 border-t border-slate-100">
            <SkeletonBlock className="h-2.5 w-36" />
            <div className="flex items-center gap-1">
              <SkeletonBlock className="h-7 w-7 rounded-lg" />
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-7 w-7 rounded-lg" />
              ))}
              <SkeletonBlock className="h-7 w-7 rounded-lg" />
            </div>
          </div>
        </div>

        {/* ═══ PANNEAU SIDEBAR (wrapper blanc) ═══ */}
        <aside className="flex-1 flex flex-col gap-3 min-h-0 overflow-hidden bg-white border border-slate-200 rounded-xl p-4">
          {/* Carte client */}
          <div className="animate-pulse">
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
          <div className="animate-pulse">
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