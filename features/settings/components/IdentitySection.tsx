"use client";

import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { uploadFiles } from "@/lib/uploadthing";
import { updateCompanyLogo } from "@/actions/logo-action";
import {
  BuildingOfficeIcon,
  CaretRightIcon,
  TrashIcon,
  UploadSimple,
} from "@phosphor-icons/react";
import type {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import type { SettingsFormValues } from "@/lib/validations/settings";
import { Currency } from "@/app/generated/prisma/enums";
import {
  DS_BENTO_CARD,
  DS_MONO,
  DS_MICRO,
  DS_INPUT,
  DS_LABEL,
  DS_ICON_WRAPPER,
  DS_BADGE_SUCCESS,
  DS_BADGE_WARNING,
  DS_ICON_SM,
  DS_ICON_XS,
  DS_ROUNDED,
} from "@/lib/design-system";

// ─── Données de référence ─────────────────────────────────────────────────────

export const CURRENCIES = [
  { code: "XOF", name: "Franc CFA", symbol: "CFA", region: "UEMOA" },
  { code: "EUR", name: "Euro", symbol: "€", region: "Europe" },
  { code: "USD", name: "Dollar Américain", symbol: "$", region: "Amérique" },
  { code: "GBP", name: "Livre Sterling", symbol: "£", region: "Royaume-Uni" },
  { code: "JPY", name: "Yen Japonais", symbol: "¥", region: "Asie" },
  { code: "CAD", name: "Dollar Canadien", symbol: "C$", region: "Amérique" },
  { code: "AUD", name: "Dollar Australien", symbol: "A$", region: "Océanie" },
  { code: "CHF", name: "Franc Suisse", symbol: "CHF", region: "Europe" },
  { code: "CNY", name: "Yuan Chinois", symbol: "¥", region: "Asie" },
  { code: "INR", name: "Roupie Indienne", symbol: "₹", region: "Asie" },
];

export const TAX_LABELS = {
  XOF: "NCC",
  EUR: { FR: "SIRET", DE: "Steuernummer", IT: "Partita IVA" },
  USD: "EIN",
  GBP: "VAT",
  JPY: "法人番号",
  CAD: "BN",
  AUD: "ABN",
  CHF: "UID",
  CNY: "统一社会信用代码",
  INR: "GSTIN",
};

export const TAX_LABEL_OPTIONS = [
  { value: "NCC", label: "NCC - Numéro de Contribuable", country: "CI" },
  { value: "SIRET", label: "SIRET - France", country: "FR" },
  { value: "RCCM", label: "RCCM - Registre Commerce", country: "CI" },
  { value: "NIF", label: "NIF - Numéro Identification", country: "FR" },
  { value: "EIN", label: "EIN - Employer ID", country: "US" },
  { value: "VAT", label: "VAT - VAT Number", country: "UK" },
  { value: "TVA", label: "TVA - Numéro TVA", country: "FR" },
  { value: "Steuernummer", label: "Steuernummer - Allemagne", country: "DE" },
  { value: "Partita IVA", label: "Partita IVA - Italie", country: "IT" },
];

export const TAX_MASKS: Record<string, string> = {
  NCC: "CI-ABJ-2023-A-12345",
  SIRET: "123 456 789 00012",
  RCCM: "CI-ABJ-2023-B-12345",
  NIF: "FR 12 345678901",
  EIN: "12-3456789",
  VAT: "GB123456789",
  TVA: "FR 12 345678901",
  Steuernummer: "123/456/78901",
  "Partita IVA": "IT12345678901",
};

export const COUNTRIES = [
  {
    code: "CI",
    name: "Côte d'Ivoire",
    flag: "",
    dialCode: "+225",
    currency: "XOF",
  },
  { code: "FR", name: "France", flag: "", dialCode: "+33", currency: "EUR" },
  { code: "US", name: "États-Unis", flag: "", dialCode: "+1", currency: "USD" },
  { code: "GB", name: "Royaume-Uni", flag: "", dialCode: "+44", currency: "GBP" },
  { code: "DE", name: "Allemagne", flag: "", dialCode: "+49", currency: "EUR" },
  { code: "IT", name: "Italie", flag: "", dialCode: "+39", currency: "EUR" },
  { code: "CA", name: "Canada", flag: "", dialCode: "+1", currency: "CAD" },
  { code: "AU", name: "Australie", flag: "", dialCode: "+61", currency: "AUD" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// BentoIdentityCard
// ═══════════════════════════════════════════════════════════════════════════════

interface BentoIdentityCardProps {
  register: UseFormRegister<SettingsFormValues>;
  errors: FieldErrors<SettingsFormValues>;
  watchedValues: SettingsFormValues;
  setValue: UseFormSetValue<SettingsFormValues>;
  className?: string;
}

export function BentoIdentityCard({
  register,
  errors,
  watchedValues,
  setValue,
  className,
}: BentoIdentityCardProps) {
  const [currencySearch, setCurrencySearch] = useState("");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showTaxLabelDropdown, setShowTaxLabelDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [taxMask, setTaxMask] = useState<string>("CI-ABJ-2023-A-12345");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

  const [isUploading, setIsUploading] = useState(false);

  const triggerLogoUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) { input.remove(); return; }
      setIsUploading(true);
      try {
        const res = await uploadFiles("companyLogo", { files: [file] });
        if (res?.[0]?.url) {
          setValue("companyLogo", res[0].url);
          updateCompanyLogo(res[0].url);
        }
      } catch (error) {
        console.error("[UPLOAD_ERROR]:", error);
      } finally {
        setIsUploading(false);
        input.remove();
      }
    };
    document.body.appendChild(input);
    input.click();
  }, [setValue]);

  const normalizeWebsite = useCallback((url: string) => {
    if (!url) return url;
    const trimmed = url.trim();
    if (trimmed && !trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }, []);

  const normalizePhone = useCallback((phone: string) => {
    if (!phone) return phone;
    return phone.replace(/\s+/g, "").replace(/[^\d+]/g, "");
  }, []);

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.symbol.toLowerCase().includes(currencySearch.toLowerCase()),
  );

  const selectedCurrency = CURRENCIES.find((c) => c.code === watchedValues.currency);

  const suggestedTaxLabel = useMemo(() => {
    const currency = watchedValues.currency;
    if (!currency) return "NCC";
    const taxConfig = TAX_LABELS[currency as keyof typeof TAX_LABELS];
    if (typeof taxConfig === "string") return taxConfig;
    if (typeof taxConfig === "object") return (taxConfig as Record<string, string>).FR || "NCC";
    return "NCC";
  }, [watchedValues.currency]);

  void suggestedTaxLabel;
  void taxMask;
  void setShowCurrencyDropdown;
  void showCurrencyDropdown;
  void currencySearch;
  void setCurrencySearch;
  void filteredCurrencies;
  void selectedCurrency;
  void showTaxLabelDropdown;
  void setShowTaxLabelDropdown;
  void normalizeWebsite;


  // Statut de complétion
  const isComplete = !!(watchedValues.companyName && watchedValues.taxId && watchedValues.companyCity);

  // ─── Logo compact ───────────────────────────────────────────────────────────
  const logoHasValue = !!watchedValues.companyLogo;

  return (
    <div className={cn(DS_BENTO_CARD, "p-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
            <BuildingOfficeIcon size={DS_ICON_SM} className="text-indigo-500" />
          </div>
          <span className={cn(DS_MICRO)}>Identité</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn(isComplete ? DS_BADGE_SUCCESS : DS_BADGE_WARNING)}>
            {isComplete ? "COMPLET" : "INCOMPLET"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* ── Row 1 : Nom + Email côte à côte ── */}
        <div className="grid grid-cols-2 gap-3">
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
        </div>

        {/* ── Row 2 : Téléphone + Adresse côte à côte ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Téléphone */}
          <div>
            <label className={DS_LABEL}>Téléphone</label>
            <div className="relative">
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center gap-1 px-1.5 py-2 bg-slate-100 border border-slate-200 rounded-l-md text-[10px]"
                >
                  {selectedCountry.flag ? (
                    <span>{selectedCountry.flag}</span>
                  ) : (
                    <span className="text-[9px]">{selectedCountry.dialCode}</span>
                  )}
                  <CaretRightIcon size={8} className="text-slate-400" />
                </button>
                <input
                  {...register("companyPhone")}
                  type="tel"
                  className={cn(DS_INPUT, DS_MONO, "flex-1 rounded-l-none rounded-r-md text-xs")}
                  placeholder={`${selectedCountry.dialCode} 05 54 86 78 34`}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (selectedCountry.code === "CI") {
                      value = value.replace(/\D/g, "");
                      if (value.length > 8) value = value.slice(-8);
                      if (value.length >= 4) {
                        value = value.slice(0, 2) + " " + value.slice(2, 4) + " " + value.slice(4, 6) + " " + value.slice(6);
                      }
                      value = selectedCountry.dialCode + " " + value;
                    } else {
                      value = normalizePhone(value);
                    }
                    setValue("companyPhone", value, { shouldDirty: true });
                  }}
                />
              </div>
              {showCountryDropdown && (
                <div className="absolute top-full left-0 z-10 mt-1 bg-white border border-slate-100 rounded-md max-h-32 overflow-y-auto shadow-sm">
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(country);
                        setShowCountryDropdown(false);
                        if (watchedValues.companyPhone) {
                          const phoneWithoutCode = watchedValues.companyPhone.replace(/^\+\d+\s*/, "");
                          setValue("companyPhone", country.dialCode + " " + phoneWithoutCode, { shouldDirty: true });
                        }
                      }}
                      className="w-full px-2 py-1.5 text-[10px] text-left hover:bg-slate-50 flex items-center gap-2"
                    >
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.companyPhone && (
              <p className="mt-0.5 text-[9px] text-rose-500">{errors.companyPhone.message}</p>
            )}
          </div>

          {/* Adresse */}
          <div>
            <label className={DS_LABEL}>Adresse</label>
            <textarea
              {...register("companyAddressDetails")}
              rows={1}
              className={cn(DS_INPUT, DS_ROUNDED, "font-sans w-full resize-none text-xs")}
              placeholder="Rue Prince, Lot 123, Immeuble ABC..."
              onChange={(e) => {
                setValue("companyAddressDetails", e.target.value, { shouldDirty: true });
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
            />
          </div>
        </div>

        {/* ── Row 3 : Logo (full width) ── */}
        <div>
          <label className={DS_LABEL}>Logo</label>
          <div className="flex items-center gap-3">
            {logoHasValue ? (
              <div className="relative inline-flex cursor-pointer group" onClick={triggerLogoUpload}>
                <div className="w-16 h-16 shrink-0 bg-slate-100 border border-slate-200 rounded-md flex items-center justify-center overflow-hidden">
                  <Image
                    src={watchedValues.companyLogo!}
                    alt="Logo"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                    <UploadSimple size={20} weight="bold" className="text-white" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setValue("companyLogo", "");
                    updateCompanyLogo("");
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center shadow-sm transition-colors"
                  title="Supprimer le logo"
                >
                  <TrashIcon size={10} weight="bold" className="text-white" />
                </button>
              </div>
            ) : (
              <div
                className="w-16 h-16 shrink-0 bg-slate-50 border border-dashed border-slate-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                onClick={triggerLogoUpload}
              >
                <UploadSimple size={24} className="text-slate-400" />
              </div>
            )}
            {isUploading ? (
              <div className="flex items-center gap-2 text-[10px] text-indigo-600 font-medium">
                <span className="animate-spin w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full" />
                Upload en cours…
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-600 font-medium">
                  {logoHasValue ? "Cliquez sur le logo pour le changer" : "Ajoutez le logo de votre entreprise"}
                </span>
                <span className="text-[10px] text-slate-400">
                  PNG, JPG ou SVG — 2 Mo max
                </span>
              </div>
            )}
          </div>
          <input {...register("companyLogo")} type="hidden" />
          <p className="mt-1.5 text-[10px] text-slate-600 font-medium">
            <strong>Safe Area :</strong> Redimensionné automatiquement pour les en-têtes de devis.
          </p>
        </div>
      </div>
    </div>
  );
}