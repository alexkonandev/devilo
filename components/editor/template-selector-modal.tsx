"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { getAvailableTemplates, type TemplateDefinition } from "@/lib/template-system";
import {
  XIcon,
  LockSimpleIcon,
  CrownIcon,
  StarIcon,
  PaletteIcon,
} from "@phosphor-icons/react";
import { useRouter, usePathname } from "next/navigation";
import { useKernelStore } from "@/hooks/use-kernel-store";

// ═══════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════
interface TemplateSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (templateId: string) => void;
  billingPlan?: string;
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════
export const TemplateSelectorModal = ({
  open,
  onClose,
  onExport,
  billingPlan = "FREE",
}: TemplateSelectorModalProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isDemo = pathname.startsWith("/demo");
  const activeTemplateId = useKernelStore((s) => s.activeTemplateId);
  const setActiveTemplateId = useKernelStore((s) => s.setActiveTemplateId);
  const templates = getAvailableTemplates();
  const [selectedId, setSelectedId] = useState<string>(activeTemplateId || templates[0]?.id || "");

  const isFreePlan = billingPlan === "FREE";

  const handleSelect = (tpl: TemplateDefinition) => {
    if (tpl.tier === "premium" && isFreePlan) {
      router.push(isDemo ? "/demo/billing" : "/billing");
      return;
    }
    setSelectedId(tpl.id);
    setActiveTemplateId(tpl.id);
  };

  const handleExport = () => {
    if (selectedId) {
      onExport(selectedId);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[640px] max-w-[90vw] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <PaletteIcon size={16} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-slate-900 tracking-tight">
                Choisissez votre template
              </h2>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                {"Le template sera appliqué au moment de l'export PDF"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <XIcon size={14} />
          </button>
        </div>

        {/* Grid des templates */}
        <div className="p-4 overflow-y-auto max-h-[55vh]">
          <div className="grid grid-cols-2 gap-3">
            {templates.map((tpl) => {
              const isSelected = selectedId === tpl.id;
              const isPremiumLocked = tpl.tier === "premium" && isFreePlan;

              return (
                <button
                  key={tpl.id}
                  onClick={() => handleSelect(tpl)}
                  className={cn(
                    "relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 text-left",
                    isSelected && !isPremiumLocked
                      ? "border-indigo-500 bg-indigo-50/50 shadow-sm shadow-indigo-100"
                      : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50",
                    isPremiumLocked && "opacity-60 grayscale",
                  )}
                >
                  {/* Badge Premium / Free */}
                  <div className="absolute top-3 right-3">
                    {tpl.tier === "premium" ? (
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[7px] font-mono font-bold uppercase tracking-wider",
                        isPremiumLocked
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-amber-50 text-amber-600 border border-amber-200",
                      )}>
                        <CrownIcon size={8} weight="fill" />
                        Premium
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[7px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <StarIcon size={8} weight="fill" />
                        Free
                      </span>
                    )}
                  </div>

                  {/* Preview emoji */}
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl mb-3 shrink-0">
                    {tpl.preview}
                  </div>

                  {/* Nom + description */}
                  <h3 className="text-[11px] font-mono font-bold text-slate-900 mb-1">
                    {tpl.name}
                  </h3>
                  <p className="text-[8px] font-mono text-slate-500 leading-relaxed line-clamp-2">
                    {tpl.description}
                  </p>

                  {/* Lock overlay */}
                  {isPremiumLocked && (
                    <div className="absolute inset-0 rounded-xl bg-white/20 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-1">
                        <LockSimpleIcon size={20} className="text-slate-400" />
                        <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                          Passage Pro requis
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-mono text-slate-500">
              Template actuel : <strong className="text-slate-700">{templates.find(t => t.id === selectedId)?.name || "—"}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleExport}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[9px] font-mono font-bold transition-all",
                isFreePlan && templates.find(t => t.id === selectedId)?.tier === "premium"
                  ? "bg-amber-500 text-white hover:bg-amber-600 cursor-pointer"
                  : "bg-indigo-600 text-white hover:bg-indigo-700",
              )}
            >
              Exporter avec ce template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};