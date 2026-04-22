"use client";

import React, { useTransition, useEffect, useMemo } from "react";
import { useCatalog } from "./catalog-context";
import { SpatialCard } from "@/features/dashboard/components/spatial-card";
import { CatalogService } from "@/types/catalog";
import { cn } from "@/lib/utils";
import {
  TrendUpIcon,
  CheckIcon,
  XIcon,
  FloppyDiskIcon,
  TagIcon,
} from "@phosphor-icons/react";
import { updateServiceAction } from "@/actions/catalog-action";
import { debounce } from "lodash";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface SpatialServiceEditorProps {
  service: CatalogService;
  onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export function SpatialServiceEditor({
  service,
  onClose,
}: SpatialServiceEditorProps) {
  const { updateLocalService } = useCatalog();
  const [isPending, startTransition] = useTransition();

  // ─── Margin / Profit stats ───
  const stats = useMemo(() => {
    const price = service?.unitPrice || 0;
    const cost = service?.baseCost || 0;
    if (price === 0) return { margin: "0.0", profit: 0 };
    const profit = price - cost;
    return {
      margin: ((profit / price) * 100).toFixed(1),
      profit,
    };
  }, [service?.unitPrice, service?.baseCost]);

  // ─── Debounced auto-save ───
  const debouncedSave = useMemo(
    () =>
      debounce(async (id: string, data: Partial<CatalogService>) => {
        startTransition(async () => {
          await updateServiceAction(id, data);
        });
      }, 800),
    []
  );

  useEffect(() => {
    if (service) {
      debouncedSave(service.id, {
        title: service.title,
        subtitle: service.subtitle,
        unitPrice: service.unitPrice,
        baseCost: service.baseCost,
      });
    }
    return () => debouncedSave.cancel();
  }, [service, debouncedSave]);

  if (!service) return null;

  return (
    <SpatialCard
      depth={3}
      variant="glass"
      className="h-full flex flex-col border-l border-slate-200/60 rounded-l-2xl rounded-r-none relative overflow-hidden"
    >
      {/* ─── CLOSE BUTTON ─── */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={onClose}
          className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-600 transition-all hover:scale-105"
        >
          <XIcon size={16} weight="bold" />
        </button>
      </div>

      {/* ─── HEADER ─── */}
      <div className="p-8 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-500">
            Configuration Produit
          </span>
        </div>
        <input
          value={service.title}
          onChange={(e) =>
            updateLocalService(service.id, { title: e.target.value })
          }
          className="w-full bg-transparent text-3xl font-black text-slate-900 tracking-tight outline-none border-b border-transparent focus:border-indigo-500/50 transition-colors placeholder:text-slate-300"
          placeholder="Nom du Service..."
        />
      </div>

      {/* ─── SCROLLABLE BODY ─── */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
        {/* Category badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <TagIcon size={12} weight="bold" className="text-slate-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              {service.category || "Service"}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Description Commerciale
          </label>
          <textarea
            value={service.subtitle || ""}
            onChange={(e) =>
              updateLocalService(service.id, { subtitle: e.target.value })
            }
            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl p-4 text-sm font-bold text-slate-700 outline-none transition-all resize-none h-32"
            placeholder="Détails du service..."
          />
        </div>

        {/* ─── Financial Section ─── */}
        <div className="grid grid-cols-1 gap-6">
          {/* Inputs */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Prix de Vente (XOF)
              </label>
              <input
                type="number"
                value={service.unitPrice}
                onChange={(e) =>
                  updateLocalService(service.id, {
                    unitPrice: Number(e.target.value),
                  })
                }
                className="w-full bg-transparent text-4xl font-mono font-black text-slate-900 tracking-tighter italic border-b border-slate-200 focus:border-emerald-500 outline-none py-2 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Coût de Revient (XOF)
              </label>
              <input
                type="number"
                value={service.baseCost || 0}
                onChange={(e) =>
                  updateLocalService(service.id, {
                    baseCost: Number(e.target.value),
                  })
                }
                className="w-full bg-transparent text-2xl font-mono font-bold text-slate-500 border-b border-slate-200 focus:border-amber-500 outline-none py-2 transition-colors"
              />
            </div>
          </div>

          {/* BI Card — Margin */}
          <div
            className={cn(
              "p-6 rounded-2xl border flex flex-col justify-between transition-colors duration-500",
              Number(stats.margin) > 30
                ? "bg-emerald-50 border-emerald-200"
                : Number(stats.margin) > 0
                ? "bg-amber-50 border-amber-200"
                : "bg-rose-50 border-rose-200"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                Marge Brute
              </span>
              <TrendUpIcon
                size={16}
                className={
                  Number(stats.margin) > 0
                    ? "text-emerald-500"
                    : "text-rose-500"
                }
              />
            </div>
            <div>
              <div
                className={cn(
                  "text-4xl font-mono font-black tracking-tighter italic",
                  Number(stats.margin) > 30
                    ? "text-emerald-600"
                    : Number(stats.margin) > 0
                    ? "text-amber-600"
                    : "text-rose-600"
                )}
              >
                {stats.margin}%
              </div>
              <div className="mt-3 text-xs font-mono text-slate-600 border-t border-slate-200/60 pt-3">
                Profit :{" "}
                {new Intl.NumberFormat("fr-CI", {
                  style: "currency",
                  currency: "XOF",
                  maximumFractionDigits: 0,
                }).format(stats.profit)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SYNC STATUS FOOTER ─── */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Auto-save
        </span>
        {isPending ? (
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-500 flex items-center gap-2">
            <FloppyDiskIcon size={12} weight="bold" className="animate-pulse" />
            Enregistrement...
          </span>
        ) : (
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
            <CheckIcon size={12} weight="bold" />
            Synchronisé
          </span>
        )}
      </div>
    </SpatialCard>
  );
}
