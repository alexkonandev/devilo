"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  MapPinIcon,
} from "@phosphor-icons/react";
import type {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import type { SettingsFormValues } from "@/lib/validations/settings";
import {
  STUDIO_V2_CARD,
  DS_MICRO,
  DS_LABEL,
  DS_INPUT,
  DS_ICON_WRAPPER,
  DS_BADGE_SUCCESS,
  DS_BADGE_WARNING,
  DS_ICON_SM,
  DS_ROUNDED,
} from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════════════════════
// AddressCard — Adresse & Contact (ville, adresse, site web)
// ═══════════════════════════════════════════════════════════════════════════════

interface AddressCardProps {
  register: UseFormRegister<SettingsFormValues>;
  errors: FieldErrors<SettingsFormValues>;
  watchedValues: SettingsFormValues;
  setValue: UseFormSetValue<SettingsFormValues>;
  className?: string;
}

export function AddressCard({
  register,
  errors,
  watchedValues,
  setValue,
  className,
}: AddressCardProps) {
  const isComplete = !!(
    watchedValues.companyCity &&
    watchedValues.companyAddressDetails
  );

  return (
    <div className={cn(STUDIO_V2_CARD, className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className={cn(DS_ICON_WRAPPER, "bg-amber-50")}>
            <MapPinIcon size={DS_ICON_SM} className="text-amber-500" />
          </div>
          <span className={cn(DS_MICRO)}>Adresse & Contact</span>
        </div>
        <span className={isComplete ? DS_BADGE_SUCCESS : DS_BADGE_WARNING}>
          {isComplete ? "RENSEIGNÉ" : "NON RENSEIGNÉ"}
        </span>
      </div>

      <div className="space-y-3">
        {/* Ville */}
        <div>
          <label className={DS_LABEL}>Ville</label>
          <input
            {...register("companyCity")}
            className={cn(DS_INPUT, DS_ROUNDED, "font-sans w-full text-xs")}
            placeholder="ABIDJAN"
          />
          {errors.companyCity && (
            <p className="mt-0.5 text-[9px] text-rose-500">{errors.companyCity.message}</p>
          )}
        </div>

        {/* Adresse détaillée */}
        <div>
          <label className={DS_LABEL}>Adresse</label>
          <textarea
            {...register("companyAddressDetails")}
            rows={2}
            className={cn(DS_INPUT, DS_ROUNDED, "font-sans w-full resize-none text-xs")}
            placeholder="Rue Prince, Lot 123, Immeuble ABC..."
            onChange={(e) => {
              setValue("companyAddressDetails", e.target.value, { shouldDirty: true });
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
          />
        </div>

        {/* Site Web */}
        <div>
          <label className={DS_LABEL}>Site Web</label>
          <input
            {...register("companyWebsite")}
            type="url"
            className={cn(DS_INPUT, DS_ROUNDED, "font-sans w-full text-xs")}
            placeholder="https://acme.com"
          />
          {errors.companyWebsite && (
            <p className="mt-0.5 text-[9px] text-rose-500">{errors.companyWebsite.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}