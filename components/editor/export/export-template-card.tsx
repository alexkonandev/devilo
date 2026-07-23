"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { TemplateDefinition } from "@/lib/template-system";
import {
  CrownIcon,
  LockSimpleIcon,
  StarIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

interface ExportTemplateCardProps {
  template: TemplateDefinition;
  isSelected: boolean;
  isPremiumLocked: boolean;
  onSelect: () => void;
}

export function ExportTemplateCard({
  template,
  isSelected,
  isPremiumLocked,
  onSelect,
}: ExportTemplateCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (isPremiumLocked) {
      router.push("/billing");
      return;
    }
    onSelect();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "h-36 relative w-full flex flex-col items-start justify-between p-3.5 rounded-xl border-2 transition-all duration-200 text-left",
        isSelected && !isPremiumLocked
          ? "border-indigo-500 bg-indigo-50/60 shadow-sm shadow-indigo-100 ring-1 ring-indigo-200"
          : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50",
        isPremiumLocked && "opacity-60 grayscale",
      )}
    >
      {/* Badge */}
      <div className="absolute top-2.5 right-2.5">
        {template.tier === "premium" ? (
          <span className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[6px] font-mono font-bold uppercase tracking-wider",
            isPremiumLocked
              ? "bg-amber-100 text-amber-700 border border-amber-200"
              : "bg-amber-50 text-amber-600 border border-amber-200",
          )}>
            <CrownIcon size={7} weight="fill" />
            Premium
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[6px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
            <StarIcon size={7} weight="fill" />
            Free
          </span>
        )}
      </div>

      {/* Couleurs du template */}
      <div className="flex gap-1 items-center mb-2">
        <div className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: template.colors.primary }} />
        <div className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: template.colors.accent }} />
        <div className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: template.colors.surface }} />
      </div>

      {/* Nom + description */}
      <h3 className="text-[11px] font-mono font-bold text-slate-900 mb-0.5">
        {template.name}
      </h3>
      <p className="text-[8px] font-mono text-slate-500 leading-relaxed line-clamp-4">
        {template.description}
      </p>

      {/* Typo + spacing info */}
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 w-full">
        <span className="text-[6px] font-mono text-slate-400 uppercase tracking-wider">
          {template.typography.fontFamily}
        </span>
        <span className="text-[6px] font-mono text-slate-300">·</span>
        <span className="text-[6px] font-mono text-slate-400 uppercase tracking-wider">
          {template.typography.labelCase}
        </span>
      </div>

      {/* Lock overlay */}
      {isPremiumLocked && (
        <div className="absolute inset-0 rounded-xl bg-white/30 flex items-center justify-center backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-1">
            <LockSimpleIcon size={18} className="text-slate-400" />
            <span className="text-[7px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              Passage Pro requis
            </span>
          </div>
        </div>
      )}
    </button>
  );
}