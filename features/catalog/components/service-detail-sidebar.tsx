"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  PackageIcon,
  PencilIcon,
  CheckIcon,
  XIcon,
  TrashIcon,
  PushPinSimple,
  CurrencyCircleDollar as CoinIcon,
} from "@phosphor-icons/react";
import {
  DS_MICRO,
  DS_MONO,
  DS_LABEL,
  DS_INPUT,
  DS_BADGE_ACTIVE,
  DS_PROGRESS_TRACK,
  DS_PROGRESS_BAR,
} from "@/lib/design-system";
import { BTN_DANGER } from "@/components/shared/ui/constants";
import { SectionCard, InfoRow } from "@/components/shared/layout/section-card";
import { useCatalog } from "./catalog-context";
import { useKernelStore } from "@/hooks/use-kernel-store";
import { formatCompact } from "./format-utils";

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE DETAIL SIDEBAR - Fiche service + Analytics
// ═══════════════════════════════════════════════════════════════════════════════

// Type local : étend CatalogService avec margin
interface ServiceDetailItem {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  unitPrice: number;
  baseCost: number | null;
  margin: number;
}

interface ServiceDetailSidebarProps {
  service: ServiceDetailItem | undefined;
  onClose: () => void;
  onDelete: () => void;
}

export function ServiceDetailSidebar({
  service,
  onClose,
  onDelete,
}: ServiceDetailSidebarProps) {
  const { updateLocalService, injectIntoActiveQuote } = useCatalog();
  const hasActiveQuote = useKernelStore((state) => !!state.activeQuote);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ServiceDetailItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!service) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className={cn("w-14 h-14 mb-4 bg-slate-100 rounded-md flex items-center justify-center")}>
          <PackageIcon size={24} className="text-slate-400" />
        </div>
        <h3 className="text-sm font-bold text-slate-700 mb-1">
          Sélectionnez un service
        </h3>
        <p className={cn(DS_LABEL, "max-w-[180px]")}>
          Cliquez sur un service pour voir les détails et analytics
        </p>
      </div>
    );
  }

  // Local edit state = fusion du service avec les modifications en cours
  const localData = editData ?? service;

  const handleEditStart = () => {
    setEditData({ ...service });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editData) return;
    setIsSaving(true);
    try {
      updateLocalService(service.id, {
        title: editData.title,
        subtitle: editData.subtitle ?? undefined,
        unitPrice: editData.unitPrice,
        baseCost: editData.baseCost ?? undefined,
        category: editData.category,
      });
      setIsEditing(false);
      setEditData(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(null);
    setIsEditing(false);
  };

  const handleEditChange = (
    field: keyof ServiceDetailItem,
    value: string | number | null,
  ) => {
    setEditData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <span className={cn(DS_MICRO, "text-slate-400")}>Fiche Service</span>
        <div className="flex items-center gap-1">
          {!isEditing ? (
            <button
              onClick={handleEditStart}
              className={cn("w-7 h-7 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-400")}
            >
              <PencilIcon size={14} />
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center",
                  isSaving
                    ? "bg-slate-100 text-slate-400 cursor-wait"
                    : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200",
                )}
              >
                {isSaving ? (
                  <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckIcon size={14} weight="bold" />
                )}
              </button>
              <button
                onClick={handleCancel}
                className={cn("w-7 h-7 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-400")}
              >
                <XIcon size={14} />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className={cn("w-7 h-7 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-400")}
          >
            <XIcon size={14} />
          </button>
        </div>
      </div>

      {/* Content — SectionCard pattern */}
      <div className="flex-1 p-5 space-y-4">
        {/* ═══ Section 1 : Détails du Service ═══ */}
        <SectionCard title="Détails du Service">
          {isEditing ? (
            <div className="space-y-2">
              <InfoRow
                label="Nom"
                icon={<PackageIcon size={14} />}
                value={
                  <input
                    type="text"
                    value={localData.title}
                    onChange={(e) => handleEditChange("title", e.target.value)}
                    className={cn(DS_INPUT, "w-full py-1 px-2 rounded text-sm")}
                  />
                }
              />
              <InfoRow
                label="Description"
                value={
                  <textarea
                    value={localData.subtitle || ""}
                    onChange={(e) => handleEditChange("subtitle", e.target.value)}
                    placeholder="Description..."
                    rows={2}
                    className={cn(DS_INPUT, "w-full py-1 px-2 rounded text-xs resize-none")}
                  />
                }
              />
              <InfoRow
                label="Catégorie"
                value={
                  <select
                    value={localData.category}
                    onChange={(e) => handleEditChange("category", e.target.value)}
                    className={cn(DS_INPUT, "w-full py-1 px-2 rounded text-xs")}
                  >
                    <option value="GENERAL">Général</option>
                    <option value="TECHNIC">Technique</option>
                    <option value="CONSULTING">Conseil</option>
                    <option value="SUBSCRIPTION">Abonnement</option>
                  </select>
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              <InfoRow
                label="Nom"
                icon={<PackageIcon size={14} />}
                mono
                value={service.title}
              />
              <InfoRow
                label="Description"
                value={service.subtitle || "Aucune description"}
              />
              <InfoRow
                label="Catégorie"
                badge={
                  <span className={cn(DS_BADGE_ACTIVE)}>
                    {service.category}
                  </span>
                }
              />
            </div>
          )}
        </SectionCard>

        {/* ═══ Section 2 : Tarification ═══ */}
        <SectionCard title="Tarification" icon={<CoinIcon size={14} />}>
          <div className="space-y-3">
            {isEditing ? (
              <>
                <InfoRow
                  label="Prix unitaire"
                  value={
                    <input
                      type="number"
                      value={localData.unitPrice}
                      onChange={(e) => handleEditChange("unitPrice", Number(e.target.value))}
                      className={cn(DS_INPUT, DS_MONO, "w-full py-1 px-2 rounded text-sm")}
                    />
                  }
                />
                <InfoRow
                  label="Coût de revient"
                  value={
                    <input
                      type="number"
                      value={localData.baseCost || 0}
                      onChange={(e) => handleEditChange("baseCost", Number(e.target.value))}
                      className={cn(DS_INPUT, DS_MONO, "w-full py-1 px-2 rounded text-sm")}
                    />
                  }
                />
              </>
            ) : (
              <>
                <InfoRow
                  label="Prix unitaire"
                  icon={<CoinIcon size={14} />}
                  mono
                  value={formatCompact(service.unitPrice)}
                />
                <InfoRow
                  label="Coût de revient"
                  mono
                  value={formatCompact(service.baseCost || 0)}
                />
              </>
            )}

            {/* Rentabilité — barre colorée */}
            <div className="pt-2 border-t border-slate-100">
              <InfoRow
                label="Rentabilité"
                mono
                value={
                  <span className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900">
                      {Math.round(service.margin)}%
                    </span>
                  </span>
                }
              />
              <div className={cn(DS_PROGRESS_TRACK, "mt-2")}>
                <div
                  className={cn(
                    DS_PROGRESS_BAR,
                    service.margin > 50 ? "bg-emerald-500"
                      : service.margin >= 20 ? "bg-amber-500"
                      : "bg-rose-500",
                  )}
                  style={{ width: `${Math.min(100, Math.max(0, service.margin))}%` }}
                />
              </div>
              <p className={cn(DS_MONO, "text-[10px] text-slate-400 mt-1")}>
                Profit: {formatCompact(service.unitPrice - (service.baseCost || 0))} XOF / unité
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ═══ Section 3 : Actions ═══ */}
        <SectionCard title="Actions">
          {hasActiveQuote && (
            <button
              onClick={() => injectIntoActiveQuote({
                id: service.id,
                title: service.title,
                subtitle: service.subtitle || "",
                category: service.category,
                unitPrice: service.unitPrice,
                baseCost: service.baseCost ?? 0,
                source: "PERSONAL",
                isPremium: false,
                userId: "",
                createdAt: new Date(),
              })}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 mb-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-semibold uppercase tracking-wide transition-all border border-indigo-200"
            >
              <PushPinSimple size={12} weight="bold" />
              Injecter dans un devis
            </button>
          )}
          <button
            onClick={onDelete}
            className={cn(BTN_DANGER, "w-full justify-center")}
          >
            <TrashIcon size={12} weight="bold" />
            Supprimer ce service
          </button>
        </SectionCard>
      </div>
    </div>
  );
}