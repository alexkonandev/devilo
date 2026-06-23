"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { UploadButton } from "@/lib/uploadthing";
import { updateCompanyLogo } from "@/actions/logo-action";
import {
  PaintBucketIcon,
} from "@phosphor-icons/react";
import type {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import type { SettingsFormValues } from "@/lib/validations/settings";
import {
  DS_BENTO_CARD,
  DS_MONO,
  DS_MICRO,
  DS_LABEL,
  DS_INPUT,
  DS_ICON_WRAPPER,
  DS_BADGE_SUCCESS,
  DS_BADGE_WARNING,
  DS_BADGE_ACTIVE,
  DS_TEL_BLOCK,
  DS_ICON_SM,
} from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════════════════════
// BentoBrandingCard
// ═══════════════════════════════════════════════════════════════════════════════

interface BentoBrandingCardProps {
  register: UseFormRegister<SettingsFormValues>;
  errors: FieldErrors<SettingsFormValues>;
  watchedValues: SettingsFormValues;
  setValue: UseFormSetValue<SettingsFormValues>;
  className?: string;
}

export function BentoBrandingCard({
  register,
  errors,
  watchedValues,
  setValue,
  className,
}: BentoBrandingCardProps) {
  const LABEL = DS_LABEL;

  // Statut branding
  const hasLogo = !!watchedValues.companyLogo;
  const hasPrefix = !!watchedValues.quotePrefix;

  return (
    <div className={cn(DS_BENTO_CARD, "p-3 overflow-y-auto", className)}>
      {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
              <PaintBucketIcon size={DS_ICON_SM} className="text-indigo-500" />
            </div>
            <span className={cn(DS_MICRO, "text-slate-500")}>Branding</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={DS_BADGE_ACTIVE}>ACTIF</span>
            <span className={cn(hasLogo && hasPrefix ? DS_BADGE_SUCCESS : DS_BADGE_WARNING)}>
              {hasLogo && hasPrefix ? "COMPLET" : "INCOMPLET"}
            </span>
          </div>
        </div>

      <div className="space-y-4">
        {/* Logo */}
        <div>
          <h4 className={cn(DS_MICRO, "text-slate-500 mb-2")}>Logo Professionnel</h4>
          <div className="border border-dashed border-slate-300 rounded p-3 hover:border-indigo-400 transition-colors">
            <div className="text-center space-y-2">
              {watchedValues.companyLogo ? (
                <div className="space-y-2">
                  <div className="w-16 h-16 mx-auto bg-slate-100 rounded flex items-center justify-center">
                    <Image src={watchedValues.companyLogo} alt="Logo" width={64} height={64} className="object-contain" />
                  </div>
                  <p className="text-[10px] text-slate-500">Logo chargé</p>
                  <div className="flex items-center justify-center gap-2">
                    <UploadButton endpoint="companyLogo" className="ut-button:bg-indigo-600 ut-button:h-6 ut-button:text-[10px] ut-button:rounded ut-button:px-2 ut-button:py-0.5 ut-allowed-content:hidden ut-button:ut-uploading:bg-indigo-400"
                      onClientUploadComplete={(res) => { if (res?.[0]?.url) { setValue("companyLogo", res[0].url); updateCompanyLogo(res[0].url); } }}
                      onUploadError={(error) => console.error("[UPLOAD_ERROR]:", error.message)} />
                    <button type="button" onClick={() => { setValue("companyLogo", ""); updateCompanyLogo(""); }}
                      className="text-[10px] text-rose-600 hover:text-rose-700">Supprimer</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-16 h-16 mx-auto bg-slate-100 rounded flex items-center justify-center">
                    <PaintBucketIcon size={24} className="text-slate-400" />
                  </div>
                  <p className="text-[10px] text-slate-500">Glissez-déposez votre logo</p>
                  <p className="text-[8px] text-slate-400">PNG ou SVG, max 2MB</p>
                  <UploadButton endpoint="companyLogo" className="ut-button:bg-indigo-600 ut-button:h-6 ut-button:text-[10px] ut-button:rounded ut-button:px-3 ut-allowed-content:hidden ut-button:ut-uploading:bg-indigo-400"
                    onClientUploadComplete={(res) => { if (res?.[0]?.url) { setValue("companyLogo", res[0].url); updateCompanyLogo(res[0].url); } }}
                    onUploadError={(error) => console.error("[UPLOAD_ERROR]:", error.message)} />
                </div>
              )}
            </div>
            <input {...register("companyLogo")} type="hidden" />
          </div>
          <div className={cn(DS_TEL_BLOCK, "p-1.5")}>
            <p className="text-[8px] text-amber-700"><strong>Safe Area:</strong> Redimensionné pour les en-têtes de devis.</p>
          </div>
        </div>

        {/* Préfixe Devis + Prochain N° */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={DS_LABEL}>Préfixe Devis</label>
            <input {...register("quotePrefix")} className={cn(DS_INPUT, DS_MONO, "w-full text-xs uppercase")} placeholder="INV-" />
            {errors.quotePrefix && <p className="mt-0.5 text-[9px] text-rose-500">{errors.quotePrefix.message}</p>}
          </div>
          <div>
            <label className={DS_LABEL}>Prochain N°</label>
            <input {...register("nextQuoteNumber", { valueAsNumber: true })} type="number"
              className={cn(DS_INPUT, DS_MONO, "w-full text-xs")} placeholder="1" />
            {errors.nextQuoteNumber && <p className="mt-0.5 text-[9px] text-rose-500">{errors.nextQuoteNumber.message}</p>}
          </div>
        </div>

      </div>
    </div>
  );
}