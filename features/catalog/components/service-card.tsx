"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  DotsThreeVertical,
  PushPinSimple,
  PencilIcon,
  TrashIcon,
  Copy,
  CurrencyCircleDollar as CoinIcon,
} from "@phosphor-icons/react";
import { CatalogService } from "@/types/catalog";
import { DS_MONO, DS_LABEL, DS_PROGRESS_TRACK, DS_PROGRESS_BAR } from "@/lib/design-system";
import { formatCompact } from "./format-utils";
import { useKernelStore } from "@/hooks/use-kernel-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE CARD — Carte moderne, dense, lisible (Phase 2.2)
// ═══════════════════════════════════════════════════════════════════════════════

interface CatalogServiceWithMargin extends CatalogService {
  margin: number;
  revenue: number;
}

interface ServiceCardProps {
  service: CatalogServiceWithMargin;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onInject: (service: CatalogService) => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

// ─── Couleurs de badge par catégorie ───
const categoryBadgeColors: Record<string, string> = {
  GENERAL: "bg-slate-100 text-slate-600 border-slate-200",
  TECHNIC: "bg-blue-100 text-blue-600 border-blue-200",
  CONSULTING: "bg-purple-100 text-purple-600 border-purple-200",
  SUBSCRIPTION: "bg-emerald-100 text-emerald-600 border-emerald-200",
};

// ─── Couleurs de barre de marge ───
const marginBarColor = (margin: number): string => {
  if (margin > 50) return "bg-emerald-500";
  if (margin >= 20) return "bg-amber-500";
  return "bg-rose-500";
};

const marginBarWidth = (margin: number): string => {
  return `${Math.min(100, Math.max(0, margin))}%`;
};

export function ServiceCard({
  service,
  isSelected,
  onSelect,
  onInject,
  onEdit,
  onDuplicate,
  onDelete,
}: ServiceCardProps) {
  const activeQuote = useKernelStore((state) => state.activeQuote);
  const hasActiveQuote = !!activeQuote;

  return (
    <div
      onClick={() => onSelect(service.id)}
      className={cn(
        "bg-white border rounded-md p-4 cursor-pointer transition-all h-56 flex flex-col justify-between",
        isSelected
          ? "border-indigo-400 ring-1 ring-indigo-400"
          : "border-slate-200 hover:border-slate-300",
      )}
    >
      {/* ═══ Groupe haut : Badge + Titre + Description ═══ */}
      <div className="shrink-0">
        {/* Header: Badge catégorie + Menu contextuel */}
        <div className="flex items-center justify-between mb-1.5">
          <span
            className={cn(
              "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border",
              categoryBadgeColors[service.category] || categoryBadgeColors.GENERAL,
            )}
          >
            {service.category === "GENERAL" ? "Général"
              : service.category === "TECHNIC" ? "Technique"
              : service.category === "CONSULTING" ? "Conseil"
              : service.category === "SUBSCRIPTION" ? "Abonnement"
              : service.category}
          </span>

          {/* Menu contextuel (⋮) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <DotsThreeVertical size={14} weight="bold" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {onEdit && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <PencilIcon size={12} className="mr-2" />
                  Éditer
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                  <Copy size={12} className="mr-2" />
                  Dupliquer
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                >
                  <TrashIcon size={12} className="mr-2" />
                  Supprimer
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Nom du service */}
        <p className={cn(DS_MONO, "font-semibold text-slate-900 truncate")}>
          {service.title}
        </p>

        {/* Description optionnelle */}
        {service.subtitle && (
          <p className={cn(DS_LABEL, "text-[8px] text-slate-400 mt-0.5 truncate")}>
            {service.subtitle}
          </p>
        )}
      </div>

      {/* ═══ Groupe bas : Séparateur + Métriques + CTA ═══ */}
      <div className="shrink-0">
        {/* Separator */}
        <div className="mb-2 border-t border-slate-100" />

        {/* Chiffres clés */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className={cn(DS_LABEL, "text-[8px] text-slate-400")}>Prix</span>
            <span className={cn(DS_MONO, "text-slate-900 font-semibold")}>
              {formatCompact(service.unitPrice)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={cn(DS_LABEL, "text-[8px] text-slate-400")}>Marge</span>
            <span className={cn(DS_MONO, "text-slate-900")}>
              {Math.round(service.margin)}%
            </span>
          </div>

          {/* Barre de marge colorée */}
          <div className={cn(DS_PROGRESS_TRACK, "h-1.5")}>
            <div
              className={cn(DS_PROGRESS_BAR, marginBarColor(service.margin))}
              style={{ width: marginBarWidth(service.margin) }}
            />
          </div>
        </div>

        {/* CTA "Injecter dans un devis" — seulement si devis ouvert */}
        {hasActiveQuote && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInject(service);
            }}
            className={cn(
              "mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5",
              "bg-indigo-50 hover:bg-indigo-100 text-indigo-700",
              "rounded-md text-[9px] font-semibold uppercase tracking-wide transition-all",
              "border border-indigo-200",
            )}
          >
            <PushPinSimple size={10} weight="bold" />
            Injecter dans un devis
          </button>
        )}
      </div>
    </div>
  );
}