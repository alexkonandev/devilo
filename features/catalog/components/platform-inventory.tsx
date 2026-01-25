"use client";

import React from "react";
import { useCatalog } from "./catalog-context";
import { ServiceCard } from "./service-card";
import { ServiceListSkeleton } from "./service-card-skeleton"; // Import du skeleton
import { MagnifyingGlass, Strategy, ChartLineUp } from "@phosphor-icons/react";

export function PlatformInventory() {
  // Récupération de l'état de chargement et des services
  const { platformServices, isLoading } = useCatalog();

  return (
    <div className="flex flex-col min-h-full bg-slate-50/50">
      {/* HEADER DE SOURCE (INSIGHTS) */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Strategy size={14} weight="bold" className="text-indigo-600" />
          <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-600">
            {isLoading
              ? "SCANNING_MARKET..."
              : `Market_Opportunities (${platformServices.length})`}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 border border-emerald-100">
          <ChartLineUp size={10} weight="bold" />
          <span>READY_TO_IMPORT</span>
        </div>
      </div>

      {/* LISTE DES SERVICES PLATEFORME : SKELETON > DATA > EMPTY */}
      <div className="p-2 space-y-2">
        {isLoading ? (
          <ServiceListSkeleton count={8} /> // Densité plus haute pour le sourcing
        ) : platformServices.length > 0 ? (
          platformServices.map((service) => (
            <ServiceCard key={service.id} service={service} mode="source" />
          ))
        ) : (
          <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 m-4 grayscale opacity-50">
            <MagnifyingGlass size={24} weight="thin" className="mb-2" />
            <p className="text-[10px] font-mono text-center">
              AUCUN_SERVICE_DISPONIBLE_DANS_LE_POOL.
            </p>
          </div>
        )}
      </div>

      {/* FOOTER DE CONSEIL STRATÉGIQUE */}
      {!isLoading && platformServices.length > 0 && (
        <div className="mt-auto p-4 bg-slate-900 text-white m-2 border-l-4 border-indigo-500">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] mb-1 opacity-70 text-indigo-400">
            Conseil_Business :
          </p>
          <p className="text-[10px] leading-relaxed font-medium">
            Importez des services avec une marge potentielle {">"} 30% pour
            optimiser votre rentabilité de nomade.
          </p>
        </div>
      )}
    </div>
  );
}
