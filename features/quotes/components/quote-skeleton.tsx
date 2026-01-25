"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Une seule ligne fantôme qui imite parfaitement QuoteRowItem
 */
function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 items-center px-4 py-3 bg-white border border-slate-100 rounded-lg animate-pulse">
      {/* RÉFÉRENCE */}
      <div className="col-span-2 flex flex-col gap-2">
        <div className="h-3 w-16 bg-slate-200 rounded" />
        <div className="h-2 w-10 bg-slate-100 rounded" />
      </div>

      {/* CLIENT */}
      <div className="col-span-4 flex flex-col gap-2">
        <div className="h-3.5 w-32 bg-slate-200 rounded" />
        <div className="h-2 w-24 bg-slate-100 rounded" />
      </div>

      {/* MONTANT HT */}
      <div className="col-span-2 flex justify-end">
        <div className="h-4 w-20 bg-slate-200 rounded" />
      </div>

      {/* STATUT */}
      <div className="col-span-2 flex justify-center">
        <div className="h-5 w-16 bg-slate-100 rounded-full" />
      </div>

      {/* ACTIONS */}
      <div className="col-span-2 flex justify-end">
        <div className="h-8 w-8 bg-slate-50 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Le conteneur qui remplit l'espace central en attendant les données
 */
export function QuoteSkeleton() {
  return (
    <div className="flex flex-col gap-2 pb-10">
      {/* En-tête fantôme */}
      <div className="grid grid-cols-12 px-4 py-2 mb-2 border-b border-slate-50">
        <div className="col-span-2 h-2 w-12 bg-slate-100 rounded" />
        <div className="col-span-4 h-2 w-12 bg-slate-100 rounded" />
        <div className="col-span-2 h-2 w-12 bg-slate-100 ml-auto rounded" />
        <div className="col-span-2 h-2 w-12 bg-slate-100 mx-auto rounded" />
        <div className="col-span-2 h-2 w-8 bg-slate-100 ml-auto rounded" />
      </div>

      {/* On génère 8 lignes pour simuler un remplissage réaliste */}
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
