"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  BuildingOfficeIcon,
} from "@phosphor-icons/react";
import type {
  UseFormRegister,
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
// IdentityCard — Identité de l'entreprise (nom, email, téléphone)
// ═══════════════════════════════════════════════════════════════════════════════

interface IdentityCardProps {
  register: UseFormRegister<SettingsFormValues>;
  errors: FieldErrors<SettingsFormValues>;
  watchedValues: SettingsFormValues;
  className?: string;
}

export function IdentityCard({
  register,
  errors,
  watchedValues,
  className,
}: IdentityCardProps) {
  const isComplete = !!(
    watchedValues.companyName &&
    watchedValues.companyEmail
  );

  return (
    <div className={cn(STUDIO_V2_CARD, className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
            <BuildingOfficeIcon size={DS_ICON_SM} className="text-indigo-500" />
          </div>
          <span className={cn(DS_MICRO)}>Identité</span>
        </div>
        <span className={isComplete ? DS_BADGE_SUCCESS : DS_BADGE_WARNING}>
          {isComplete ? "COMPLET" : "INCOMPLET"}
        </span>
      </div>

      <div className="space-y-3">
        {/* Nom Entreprise */}
        <div>
          <label className={DS_LABEL}>Nom Entreprise</label>
          <input
            {...register("companyName")}
            className={cn(DS_INPUT, DS_ROUNDED, "font-sans w-full text-xs")}
            placeholder="ACME Corporation"
          />
          {errors.companyName && (
            <p className="mt-0.5 text-[9px] text-rose-500">{errors.companyName.message}</p>
          )}
        </div>

        {/* Email Professionnel */}
        <div>
          <label className={DS_LABEL}>Email Professionnel</label>
          <input
            {...register("companyEmail")}
            type="email"
            className={cn(DS_INPUT, DS_ROUNDED, "font-sans w-full text-xs")}
            placeholder="contact@acme.com"
          />
          {errors.companyEmail && (
            <p className="mt-0.5 text-[9px] text-rose-500">{errors.companyEmail.message}</p>
          )}
        </div>

        {/* Téléphone */}
        <div>
          <label className={DS_LABEL}>Téléphone</label>
          <input
            {...register("companyPhone")}
            type="tel"
            className={cn(DS_INPUT, DS_ROUNDED, "font-sans w-full text-xs")}
            placeholder="+225 05 54 86 78 34"
          />
          {errors.companyPhone && (
            <p className="mt-0.5 text-[9px] text-rose-500">{errors.companyPhone.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}