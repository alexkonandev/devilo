"use client";

import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON — Blocs de chargement fantômes (inspiré Figma)
// Utilise animate-pulse de Tailwind pour un shimmer subtil.
// ═══════════════════════════════════════════════════════════════════════════════

interface SkeletonProps {
  className?: string;
}

/**
 * Bloc rectangulaire générique avec animation pulse.
 * Usage : <SkeletonBlock className="h-4 w-24" />
 */
export function SkeletonBlock({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-slate-200/70 rounded-md animate-pulse",
        className,
      )}
    />
  );
}

/**
 * Cercle skeleton (pour avatars, icônes).
 * Usage : <SkeletonCircle size="w-8 h-8" />
 */
export function SkeletonCircle({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-slate-200/70 rounded-full animate-pulse",
        className,
      )}
    />
  );
}

/**
 * Ligne de texte skeleton (largeur variable).
 * Usage : <SkeletonText width="w-3/4" />
 */
export function SkeletonText({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-slate-200/70 rounded animate-pulse h-3",
        className,
      )}
    />
  );
}

/**
 * Carte skeleton complète (wrapper + contenu).
 * Usage : <SkeletonCard className="h-32" />
 */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-md p-4 animate-pulse",
        className,
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <SkeletonCircle className="w-8 h-8" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-3 w-1/2" />
          <SkeletonBlock className="h-2 w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonBlock className="h-2 w-full" />
        <SkeletonBlock className="h-2 w-5/6" />
        <SkeletonBlock className="h-2 w-2/3" />
      </div>
    </div>
  );
}

/**
 * Rangée de tableau skeleton.
 * Usage : <SkeletonTableRow cols={4} />
 */
export function SkeletonTableRow({ cols = 4, className }: { cols?: number } & SkeletonProps) {
  return (
    <div className={cn("flex items-center gap-4 px-4 py-3", className)}>
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className={cn(
            "h-3",
            i === 0 ? "w-1/3" : "w-1/6",
          )}
        />
      ))}
    </div>
  );
}

/**
 * Grille de KPIs skeleton (4 cartes).
 */
export function SkeletonKpiGrid() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-md p-4 animate-pulse"
        >
          <div className="flex items-center gap-2 mb-3">
            <SkeletonCircle className="w-6 h-6" />
            <SkeletonBlock className="h-2 w-16" />
          </div>
          <SkeletonBlock className="h-6 w-20 mb-1" />
          <SkeletonBlock className="h-2 w-12" />
        </div>
      ))}
    </div>
  );
}