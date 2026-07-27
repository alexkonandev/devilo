"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { BuildingOfficeIcon } from "@phosphor-icons/react";
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
import { LogoUploadField } from "@/features/settings/components/LogoUploadField";

// ═══════════════════════════════════════════════════════════════════════════════
// CompanyInfoCard — Fusion de Identité + Adresse & Contact (inputs compacts)
// Logo en colonne droite, Adresse en colonne gauche (row-span-2 pour équilibrer)
// ═══════════════════════════════════════════════════════════════════════════════

interface CompanyInfoCardProps {
  register: UseFormRegister<SettingsFormValues>;
  errors: FieldErrors<SettingsFormValues>;
  watchedValues: SettingsFormValues;
  setValue: UseFormSetValue<SettingsFormValues>;
  className?: string;
}

export function CompanyInfoCard({
  register,
  errors,
  watchedValues,
  setValue,
  className,
}: CompanyInfoCardProps) {
  const isComplete = !!(
    watchedValues.companyName &&
    watchedValues.companyEmail &&
    watchedValues.companyCity
  );

  return (
    <div className={cn(STUDIO_V2_CARD, className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
            <BuildingOfficeIcon size={DS_ICON_SM} className="text-indigo-500" />
          </div>
          <span className={cn(DS_MICRO)}>Informations Entreprise</span>
        </div>
        <span className={isComplete ? DS_BADGE_SUCCESS : DS_BADGE_WARNING}>
          {isComplete ? "COMPLET" : "INCOMPLET"}
        </span>
      </div>

      {/* Grille 2 colonnes — placement explicite pour éviter les trous */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        {/* Row 1 — Nom + Téléphone */}
        <div>
          <label className={cn(DS_LABEL, "block mb-0.5")}>Nom Entreprise</label>
          <input
            {...register("companyName")}
            className={cn(
              DS_INPUT,
              DS_ROUNDED,
              "font-sans w-full text-[10px] px-2 py-2"
            )}
            placeholder="ACME Corporation"
          />
          {errors.companyName && (
            <p className="mt-0.5 text-[7px] text-rose-500">
              {errors.companyName.message}
            </p>
          )}
        </div>

        <div>
          <label className={cn(DS_LABEL, "block mb-0.5")}>Téléphone</label>
          <input
            {...register("companyPhone")}
            type="tel"
            className={cn(
              DS_INPUT,
              DS_ROUNDED,
              "font-sans w-full text-[10px] px-2 py-2"
            )}
            placeholder="+225 05 54 86 78 34"
          />
          {errors.companyPhone && (
            <p className="mt-0.5 text-[7px] text-rose-500">
              {errors.companyPhone.message}
            </p>
          )}
        </div>

        {/* Row 2 — Email + Ville */}
        <div>
          <label className={cn(DS_LABEL, "block mb-0.5")}>Email</label>
          <input
            {...register("companyEmail")}
            type="email"
            className={cn(
              DS_INPUT,
              DS_ROUNDED,
              "font-sans w-full text-[10px] px-2 py-2"
            )}
            placeholder="contact@acme.com"
          />
          {errors.companyEmail && (
            <p className="mt-0.5 text-[7px] text-rose-500">
              {errors.companyEmail.message}
            </p>
          )}
        </div>

        <div>
          <label className={cn(DS_LABEL, "block mb-0.5")}>Ville</label>
          <input
            {...register("companyCity")}
            className={cn(
              DS_INPUT,
              DS_ROUNDED,
              "font-sans w-full text-[10px] px-2 py-2"
            )}
            placeholder="ABIDJAN"
          />
          {errors.companyCity && (
            <p className="mt-0.5 text-[7px] text-rose-500">
              {errors.companyCity.message}
            </p>
          )}
        </div>

        {/* Row 3 colonne droite — Adresse */}
        <div className="row-start-3 col-start-2">
          <label className={cn(DS_LABEL, "block mb-0.5")}>Adresse</label>
          <textarea
            {...register("companyAddressDetails")}
            rows={2}
            className={cn(
              DS_INPUT,
              DS_ROUNDED,
              "font-sans w-full resize-none text-[10px] px-2 py-2"
            )}
            placeholder="Rue Prince, Lot 123, Immeuble ABC..."
            onChange={(e) => {
              setValue("companyAddressDetails", e.target.value, {
                shouldDirty: true,
              });
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
          />
        </div>

        {/* Row 3-4 colonne gauche — Logo (2 lignes) */}
        <div className="col-start-1 row-span-2 self-start">
          <LogoUploadField
            value={watchedValues.companyLogo ?? ""}
            setValue={setValue}
          />
        </div>

        {/* Row 4 colonne droite — Site Web */}
        <div className="row-start-4 col-start-2">
          <label className={cn(DS_LABEL, "block mb-0.5")}>Site Web</label>
          <input
            {...register("companyWebsite")}
            type="url"
            className={cn(
              DS_INPUT,
              DS_ROUNDED,
              "font-sans w-full text-[10px] px-2 py-2"
            )}
            placeholder="https://acme.com"
          />
          {errors.companyWebsite && (
            <p className="mt-0.5 text-[7px] text-rose-500">
              {errors.companyWebsite.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}