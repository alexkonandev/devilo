"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CatalogService, DragData } from "@/types/catalog";
import { cn } from "@/lib/utils";
import {
  DotsSixVertical,
  PencilSimple,
  TrendUp,
  Crown,
} from "@phosphor-icons/react";

// Import du studio d'édition
import { EditServiceDialog } from "./edit-service-dialog";

interface ServiceCardProps {
  service: CatalogService;
  mode: "source" | "target";
}

export function ServiceCard({ service, mode }: ServiceCardProps) {
  // 1. LOGIQUE DND-KIT (SORTABLE vs DRAGGABLE)
  const sortable = useSortable({
    id: service.id,
    disabled: mode === "source",
    data: { type: "CATALOG_ITEM", source: "PERSONAL", service } as DragData,
  });

  const draggable = useDraggable({
    id: service.id,
    disabled: mode === "target",
    data: { type: "CATALOG_ITEM", source: "PLATFORM", service } as DragData,
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = mode === "target" ? sortable : draggable;

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-white border border-slate-200 p-3 transition-all",
        "hover:border-indigo-600 hover:shadow-[4px_4px_0px_0px_rgba(79,70,229,0.1)]",
        isDragging && "opacity-30 grayscale",
        mode === "source"
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-default"
      )}
    >
      <div className="flex items-start gap-3">
        {/* DRAG HANDLE */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "mt-1 text-slate-300 hover:text-slate-900 transition-colors",
            mode === "source" ? "cursor-grab" : "cursor-row-resize"
          )}
        >
          <DotsSixVertical size={18} weight="bold" />
        </div>

        <div className="flex-1 min-w-0">
          {/* HEADER : CATEGORY & BADGES */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600 truncate">
              {service.category}
            </span>
            {service.isPremium && (
              <Crown size={12} weight="fill" className="text-amber-500" />
            )}
          </div>

          {/* CONTENT : TITLE & SUBTITLE */}
          <h3 className="text-[12px] font-black text-slate-950 uppercase leading-none mb-1 truncate">
            {service.title}
          </h3>
          <p className="text-[10px] text-slate-500 line-clamp-1 font-medium">
            {service.subtitle || "AUCUNE_DESCRIPTION_DISPONIBLE"}
          </p>

          {/* FOOTER : PRICE & ACTIONS */}
          <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-slate-400 uppercase">
                Unit_Price
              </span>
              <span className="text-[13px] font-mono font-black text-slate-950">
                {new Intl.NumberFormat("fr-CI").format(service.unitPrice)}
                <span className="ml-1 text-[10px]">CFA</span>
              </span>
            </div>

            {/* ACTION DYNAMIQUE : ÉDITION OU INDICATEUR DE MARCHÉ */}
            {mode === "target" ? (
              <EditServiceDialog
                service={service}
                trigger={
                  <button className="p-1.5 bg-slate-50 hover:bg-slate-900 hover:text-white transition-colors">
                    <PencilSimple size={14} weight="bold" />
                  </button>
                }
              />
            ) : (
              <div className="flex items-center gap-1 text-emerald-600">
                <TrendUp size={14} weight="bold" />
                <span className="text-[9px] font-black uppercase">
                  Market_Rate
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OVERLAY INDICATOR (MODE SOURCE) */}
      {mode === "source" && (
        <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-indigo-600 text-white text-[7px] font-black px-1 py-0.5 uppercase">
            Sourcing_Available
          </div>
        </div>
      )}
    </div>
  );
}
