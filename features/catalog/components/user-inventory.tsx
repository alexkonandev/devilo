"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { useCatalog } from "./catalog-context";
import { ServiceCard } from "./service-card";
import { ServiceListSkeleton } from "./service-card-skeleton"; // Import du skeleton
import { cn } from "@/lib/utils";
import { Package, Tray } from "@phosphor-icons/react";

export function UserInventory() {
  // Supposons que tu as ajouté 'isLoading' à ton CatalogContext
  const { userServices, isDragging, activeId, isLoading } = useCatalog();

  const { setNodeRef, isOver } = useDroppable({
    id: "user-inventory-zone",
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 flex flex-col min-h-full transition-all duration-200 ease-in-out",
        isOver
          ? "bg-indigo-50/50 ring-2 ring-inset ring-indigo-500/50"
          : "bg-white",
        isDragging && !isOver && "bg-slate-50/30"
      )}
    >
      {/* HEADER DE ZONE */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-inherit border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Package
            size={14}
            weight="bold"
            className={cn(isOver ? "text-indigo-600" : "text-slate-400")}
          />
          <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">
            {isLoading
              ? "Synchronisation..."
              : `${userServices.length} Services_Actifs`}
          </span>
        </div>
        {isOver && (
          <span className="text-[9px] font-black text-indigo-600 animate-pulse uppercase tracking-widest">
            Relâcher_pour_importer
          </span>
        )}
      </div>

      {/* LOGIQUE D'AFFICHAGE : SKELETON > LISTE > EMPTY_STATE */}
      <div className="p-2 space-y-2 flex-1">
        {isLoading ? (
          <ServiceListSkeleton count={5} />
        ) : userServices.length > 0 ? (
          userServices.map((service) => (
            <ServiceCard key={service.id} service={service} mode="target" />
          ))
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 m-4">
            <Tray size={32} weight="thin" className="text-slate-300 mb-2" />
            <p className="text-[11px] font-mono text-slate-400 text-center px-8 uppercase leading-relaxed">
              Votre_Catalogue_Est_Vide.
              <br />
              Glissez_un_actif_ici.
            </p>
          </div>
        )}

        {/* INDICATEUR DE DROP (FANTÔME) */}
        {isOver &&
          !userServices.some((s) => s.id === activeId) &&
          !isLoading && (
            <div className="h-24 border-2 border-dashed border-indigo-300 bg-indigo-50/50 animate-pulse flex items-center justify-center">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                Nouveau_Slot_Disponible
              </span>
            </div>
          )}
      </div>
    </div>
  );
}
