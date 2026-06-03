"use client";

import React, { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { UploadButton } from "@/lib/uploadthing";
import { updateCompanyLogo } from "@/actions/logo-action";
import {
  BuildingOfficeIcon,
  FileTextIcon,
  DatabaseIcon,
  CalendarIcon,
  GlobeIcon,
  CheckCircleIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import type {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import type { SettingsFormValues } from "@/lib/validations/settings";
import { Currency } from "@/app/generated/prisma/enums";

// ─── Design System tokens (locaux) ───────────────────────────────────────────
const DS = {
  micro: "text-[9px] uppercase font-bold tracking-tighter",
  label: "text-[10px] uppercase font-bold tracking-wider text-slate-400",
  mono: "font-mono text-[11px] tabular-nums leading-none",
  card: "bg-white border border-slate-100/60",
  input:
    "bg-slate-100/50 border-0 border-b border-slate-200 focus:border-indigo-400 focus:bg-white focus:ring-0 transition-all",
};

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
  {
    code: "GB",
    name: "Royaume-Uni",
    flag: "",
    dialCode: "+44",
    currency: "GBP",
  },
  { code: "DE", name: "Allemagne", flag: "", dialCode: "+49", currency: "EUR" },
  { code: "IT", name: "Italie", flag: "", dialCode: "+39", currency: "EUR" },
  { code: "CA", name: "Canada", flag: "", dialCode: "+1", currency: "CAD" },
  { code: "AU", name: "Australie", flag: "", dialCode: "+61", currency: "AUD" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// BentoProfileCard
// ═══════════════════════════════════════════════════════════════════════════════

interface BentoProfileCardProps {
  register: UseFormRegister<SettingsFormValues>;
  errors: FieldErrors<SettingsFormValues>;
  watchedValues: SettingsFormValues;
  setValue: UseFormSetValue<SettingsFormValues>;
  className?: string;
}

export function BentoProfileCard({
  register,
  errors,
  watchedValues,
  setValue,
  className,
}: BentoProfileCardProps) {
  const [currencySearch, setCurrencySearch] = useState("");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showTaxLabelDropdown, setShowTaxLabelDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [taxMask, setTaxMask] = useState<string>("CI-ABJ-2023-A-12345");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

  const normalizeWebsite = useCallback((url: string) => {
    if (!url) return url;
    const trimmed = url.trim();
    if (
      trimmed &&
      !trimmed.startsWith("http://") &&
      !trimmed.startsWith("https://")
    ) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }, []);

  const normalizePhone = useCallback((phone: string) => {
    if (!phone) return phone;
    return phone.replace(/\s+/g, "").replace(/[^\d+]/g, "");
  }, []);

  const formatAddressForPDF = useCallback(() => {
    const address = watchedValues.companyAddressDetails || "";
    const city = watchedValues.companyCity || "Abidjan";
    return address ? `${address}, ${city}` : city;
  }, [watchedValues.companyAddressDetails, watchedValues.companyCity]);

  const getAddressLength = useCallback(() => {
    return formatAddressForPDF().length;
  }, [formatAddressForPDF]);

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.symbol.toLowerCase().includes(currencySearch.toLowerCase()),
  );

  const selectedCurrency = CURRENCIES.find(
    (c) => c.code === watchedValues.currency,
  );

  const suggestedTaxLabel = useMemo(() => {
    const currency = watchedValues.currency;
    if (!currency) return "NCC";
    const taxConfig = TAX_LABELS[currency as keyof typeof TAX_LABELS];
    if (typeof taxConfig === "string") return taxConfig;
    if (typeof taxConfig === "object")
      return (taxConfig as Record<string, string>).FR || "NCC";
    return "NCC";
  }, [watchedValues.currency]);

  // suggestedTaxLabel used for auto-fill on mount awareness — kept for future use
  void suggestedTaxLabel;

  return (
    <div
      className={cn(
        DS.card,
        "rounded-lg p-4 overflow-y-auto max-h-[calc(100vh-200px)]",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center">
            <BuildingOfficeIcon size={12} className="text-indigo-500" />
          </div>
          <span className={cn(DS.micro, "text-slate-600")}>
            Identité & Branding
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200/60">
            ACTIF
          </span>
          <span
            className={cn(
              DS.mono,
              "text-[9px] px-1.5 py-0.5 rounded",
              watchedValues.companyName &&
                watchedValues.taxId &&
                watchedValues.companyCity
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-amber-50 text-amber-600 border border-amber-200",
            )}
          >
            {watchedValues.companyName &&
            watchedValues.taxId &&
            watchedValues.companyCity
              ? "COMPLET"
              : "INCOMPLET"}
          </span>
        </div>
      </div>

      {/* Branding Preview HUD */}
      <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <FileTextIcon size={12} className="text-slate-400" />
          <span className={cn(DS.micro, "text-slate-600")}>
            Aperçu En-tête Devis
          </span>
        </div>
        <div className="bg-white p-3 rounded border border-slate-100 text-xs">
          <div className="font-bold text-slate-900 mb-1">
            {watchedValues.companyName || "Nom de l’entreprise"}
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <span className={cn(DS.mono)}>
              {watchedValues.taxIdLabel || "NCC"}:{" "}
              {watchedValues.taxId || "0000000A"}
            </span>
            <span>•</span>
            <span>{watchedValues.companyCity || "VILLE"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Nom Entreprise + Devise */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Nom Entreprise
              </label>
              <input
                {...register("companyName")}
                className={cn(DS.input, "w-full px-3 py-2 text-sm rounded-t")}
                placeholder="ACME Corporation"
              />
              {errors.companyName && (
                <p className="mt-1 text-[10px] text-rose-500">
                  {errors.companyName.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Devise
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                  className={cn(
                    DS.input,
                    DS.mono,
                    "w-full px-3 py-2 text-sm rounded-t text-left flex items-center justify-between",
                  )}
                >
                  <span>
                    {selectedCurrency
                      ? `${selectedCurrency.code} - ${selectedCurrency.name}`
                      : "Sélectionner..."}
                  </span>
                  <CaretRightIcon size={12} className="text-slate-400" />
                </button>
                {showCurrencyDropdown && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-slate-100 rounded shadow-lg max-h-48 overflow-y-auto">
                    <input
                      type="text"
                      value={currencySearch}
                      onChange={(e) => setCurrencySearch(e.target.value)}
                      placeholder="Rechercher une devise..."
                      className="w-full px-3 py-2 text-xs border-b border-slate-100 focus:outline-none"
                    />
                    {filteredCurrencies.map((currency) => (
                      <button
                        key={currency.code}
                        type="button"
                        onClick={() => {
                          setValue("currency", currency.code as Currency);
                          setShowCurrencyDropdown(false);
                          setCurrencySearch("");
                          if (
                            !watchedValues.taxIdLabel ||
                            watchedValues.taxIdLabel === "NCC"
                          ) {
                            const taxConfig =
                              TAX_LABELS[
                                currency.code as keyof typeof TAX_LABELS
                              ];
                            const suggestedLabel =
                              typeof taxConfig === "string"
                                ? taxConfig
                                : (taxConfig as Record<string, string>)?.FR ||
                                  "NCC";
                            setValue("taxIdLabel", suggestedLabel);
                          }
                        }}
                        className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-mono">{currency.code}</span>
                        <span className="text-slate-600">{currency.name}</span>
                        <span className="text-slate-400">
                          {currency.symbol}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Logo Professionnel */}
        <div>
          <h4 className={cn(DS.label, "mb-3")}>Logo Professionnel</h4>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-indigo-400 transition-colors">
            <div className="text-center space-y-4">
              {watchedValues.companyLogo ? (
                <div className="space-y-3">
                  <div className="w-24 h-24 mx-auto bg-slate-100 rounded flex items-center justify-center">
                    <Image
                      src={watchedValues.companyLogo}
                      alt="Logo"
                      width={96}
                      height={96}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-xs text-slate-600">Logo chargé</p>
                  <div className="flex items-center justify-center gap-2">
                    <UploadButton
                      endpoint="companyLogo"
                      className="ut-button:bg-indigo-600 ut-button:h-8 ut-button:text-xs ut-button:rounded ut-button:px-3 ut-button:py-1 ut-allowed-content:hidden ut-button:ut-uploading:bg-indigo-400"
                      onClientUploadComplete={(res) => {
                        if (res?.[0]?.url) {
                          setValue("companyLogo", res[0].url);
                          updateCompanyLogo(res[0].url);
                        }
                      }}
                      onUploadError={(error: Error) => {
                        console.error("[UPLOAD_ERROR]:", error.message);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setValue("companyLogo", "");
                        updateCompanyLogo("");
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-24 h-24 mx-auto bg-slate-100 rounded flex items-center justify-center">
                    <BuildingOfficeIcon size={32} className="text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-600">
                    Glissez-déposez votre logo
                  </p>
                  <p className="text-[9px] text-slate-400">
                    PNG ou SVG, max 2MB
                  </p>
                  <UploadButton
                    endpoint="companyLogo"
                    className="ut-button:bg-indigo-600 ut-button:h-8 ut-button:text-xs ut-button:rounded ut-button:px-4 ut-allowed-content:hidden ut-button:ut-uploading:bg-indigo-400"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]?.url) {
                        setValue("companyLogo", res[0].url);
                        updateCompanyLogo(res[0].url);
                      }
                    }}
                    onUploadError={(error: Error) => {
                      console.error("[UPLOAD_ERROR]:", error.message);
                    }}
                  />
                </div>
              )}
            </div>
            <input
              {...register("companyLogo")}
              type="hidden"
            />
          </div>
          <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
            <p className="text-[10px] text-amber-700">
              <strong>Safe Area:</strong> Votre logo sera redimensionné pour
              s'adapter aux en-têtes de devis.
            </p>
          </div>
        </div>

        {/* Identifiant Fiscal */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Label
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTaxLabelDropdown(!showTaxLabelDropdown)}
                  className={cn(
                    DS.input,
                    DS.mono,
                    "w-full px-3 py-2 text-sm rounded-t text-left flex items-center justify-between uppercase",
                  )}
                >
                  <span>{watchedValues.taxIdLabel || "Sélectionner..."}</span>
                  <CaretRightIcon size={12} className="text-slate-400" />
                </button>
                {showTaxLabelDropdown && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-slate-100 rounded shadow-lg max-h-48 overflow-y-auto">
                    {TAX_LABEL_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setValue("taxIdLabel", option.value);
                          setShowTaxLabelDropdown(false);
                          if (TAX_MASKS[option.value]) {
                            setTaxMask(TAX_MASKS[option.value]);
                          }
                        }}
                        className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-mono">{option.value}</span>
                        <span className="text-slate-600">
                          {option.label.split(" - ")[1]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Numéro
              </label>
              <div className="relative">
                <input
                  {...register("taxId")}
                  className={cn(
                    DS.input,
                    DS.mono,
                    "w-full px-3 py-2 text-sm rounded-t",
                  )}
                  placeholder={taxMask || "CI-ABJ-2023-A-12345"}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    const cleaned = target.value
                      .replace(/\s+/g, " ")
                      .replace(/-+/g, "-")
                      .replace(/\/+/g, "/")
                      .trim();
                    setValue("taxId", cleaned);
                  }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">
                  {watchedValues.taxIdLabel || "NCC"}
                </span>
              </div>
              {errors.taxId && (
                <p className="mt-1 text-[10px] text-rose-500">
                  {errors.taxId.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Email Professionnel
              </label>
              <input
                {...register("companyEmail")}
                type="email"
                className={cn(DS.input, "w-full px-3 py-2 text-sm rounded-t")}
                placeholder="contact@acme.com"
              />
              {errors.companyEmail && (
                <p className="mt-1 text-[10px] text-rose-500">
                  {errors.companyEmail.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Téléphone
              </label>
              <div className="relative">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center gap-1 px-2 py-2 bg-slate-100 border-b border-slate-200 rounded-l text-xs"
                  >
                    <span>{selectedCountry.flag}</span>
                    <CaretRightIcon size={10} className="text-slate-400" />
                  </button>
                  <input
                    {...register("companyPhone")}
                    type="tel"
                    className={cn(
                      DS.input,
                      DS.mono,
                      "flex-1 px-3 py-2 text-sm rounded-l-none",
                    )}
                    placeholder={`${selectedCountry.dialCode} 05 54 86 78 34`}
                    onChange={(e) => {
                      let value = e.target.value;
                      if (selectedCountry.code === "CI") {
                        value = value.replace(/\D/g, "");
                        if (value.length > 8) value = value.slice(-8);
                        if (value.length >= 4) {
                          value =
                            value.slice(0, 2) +
                            " " +
                            value.slice(2, 4) +
                            " " +
                            value.slice(4, 6) +
                            " " +
                            value.slice(6);
                        }
                        value = selectedCountry.dialCode + " " + value;
                      } else {
                        value = normalizePhone(value);
                      }
                      setValue("companyPhone", value);
                    }}
                  />
                </div>
                {showCountryDropdown && (
                  <div className="absolute top-full left-0 z-10 mt-1 bg-white border border-slate-100 rounded shadow-lg max-h-32 overflow-y-auto">
                    {COUNTRIES.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(country);
                          setShowCountryDropdown(false);
                          if (watchedValues.companyPhone) {
                            const phoneWithoutCode =
                              watchedValues.companyPhone.replace(
                                /^\+\d+\s*/,
                                "",
                              );
                            setValue(
                              "companyPhone",
                              country.dialCode + " " + phoneWithoutCode,
                            );
                          }
                        }}
                        className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center gap-2"
                      >
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                        <span className="text-slate-400">
                          {country.dialCode}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.companyPhone && (
                <p className="mt-1 text-[10px] text-rose-500">
                  {errors.companyPhone.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Site Web
              </label>
              <div className="relative">
                <input
                  {...register("companyWebsite")}
                  className={cn(DS.input, "w-full px-3 py-2 text-sm rounded-t")}
                  placeholder="www.acme.com"
                  onChange={(e) => {
                    setValue(
                      "companyWebsite",
                      normalizeWebsite(e.target.value),
                    );
                  }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">
                  https:// auto
                </span>
              </div>
              {errors.companyWebsite && (
                <p className="mt-1 text-[10px] text-rose-500">
                  {errors.companyWebsite.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Adresse & Précisions
              </label>
              <textarea
                {...register("companyAddressDetails")}
                rows={2}
                className={cn(
                  DS.input,
                  "w-full px-3 py-2 text-sm rounded resize-none",
                )}
                placeholder="Rue Prince, Lot 123, Immeuble ABC..."
                onChange={(e) => {
                  setValue("companyAddressDetails", e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Ville
              </label>
              <input
                {...register("companyCity")}
                className={cn(DS.input, "w-full px-3 py-2 text-sm rounded-t")}
                placeholder="ABIDJAN"
              />
            </div>

            {/* Preview PDF */}
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <FileTextIcon size={12} className="text-slate-400" />
                <span className={cn(DS.micro, "text-slate-600")}>
                  Aperçu En-tête PDF
                </span>
                {getAddressLength() > 80 && (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                    TROP LONG
                  </span>
                )}
              </div>
              <div className="bg-white p-3 rounded border border-slate-100">
                <div className={cn(DS.mono, "text-xs text-slate-700")}>
                  {watchedValues.companyName || "Studio Digital Ivoire"} —{" "}
                  {watchedValues.taxIdLabel || "NCC"} :{" "}
                  {watchedValues.taxId || "CI-ABJ-2023-A-12345"} —{" "}
                  {formatAddressForPDF()}
                </div>
              </div>
              {getAddressLength() > 80 && (
                <p className="mt-2 text-[10px] text-amber-700">
                  ⚠️ L&apos;adresse est trop longue pour une ligne de devis et
                  risque de casser le layout.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Paramètres Opérationnels */}
        <div>
          <div className="space-y-6">
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                    Préfixe Devis
                  </label>
                  <input
                    {...register("quotePrefix")}
                    className={cn(
                      DS.input,
                      DS.mono,
                      "w-full px-3 py-2 text-sm rounded-t uppercase",
                    )}
                    placeholder="INV-"
                  />
                  {errors.quotePrefix && (
                    <p className="mt-1 text-[10px] text-rose-500">
                      {errors.quotePrefix.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                    Prochain N°
                  </label>
                  <input
                    {...register("nextQuoteNumber", { valueAsNumber: true })}
                    type="number"
                    className={cn(
                      DS.input,
                      DS.mono,
                      "w-full px-3 py-2 text-sm rounded-t",
                    )}
                    placeholder="1"
                  />
                  {errors.nextQuoteNumber && (
                    <p className="mt-1 text-[10px] text-rose-500">
                      {errors.nextQuoteNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                    Devise
                  </label>
                  <input
                    {...register("currency")}
                    className={cn(
                      DS.input,
                      DS.mono,
                      "w-full px-3 py-2 text-sm rounded-t text-center uppercase",
                    )}
                    maxLength={3}
                    placeholder="XOF"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                    Taux TVA (%)
                  </label>
                  <input
                    {...register("defaultVatRate", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className={cn(
                      DS.input,
                      DS.mono,
                      "w-full px-3 py-2 text-sm rounded-t text-right",
                    )}
                    placeholder="18.00"
                  />
                  {errors.defaultVatRate && (
                    <p className="mt-1 text-[10px] text-rose-500">
                      {errors.defaultVatRate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className={cn(DS.label, "mb-3")}>Conditions Générales</h4>
              <textarea
                {...register("defaultTerms")}
                rows={4}
                className={cn(
                  DS.input,
                  "w-full px-3 py-2 text-xs rounded resize-none",
                )}
                placeholder="Conditions de paiement, délais, clauses..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BentoProfileTelemetry
// ═══════════════════════════════════════════════════════════════════════════════

interface BentoProfileTelemetryProps {
  watchedValues: SettingsFormValues;
  className?: string;
}

export function BentoProfileTelemetry({
  watchedValues,
  className,
}: BentoProfileTelemetryProps) {
  return (
    <div className={cn(DS.card, "rounded-lg p-4", className)}>
      <div className="space-y-3">
        <div className="p-2 bg-slate-50 rounded border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <DatabaseIcon size={12} className="text-slate-400" />
            <span className={cn(DS.label, "text-slate-500")}>ID Compte</span>
          </div>
          <span className={cn(DS.mono, "text-slate-700 uppercase")}>
            {watchedValues.companyName
              ? watchedValues.companyName
                  .replace(/\s+/g, "")
                  .slice(0, 6)
                  .toUpperCase()
              : "---"}
          </span>
        </div>

        <div className="p-2 bg-slate-50 rounded border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon size={12} className="text-slate-400" />
            <span className={cn(DS.label, "text-slate-500")}>
              Préfixe Devis
            </span>
          </div>
          <span className={cn(DS.mono, "text-slate-700")}>
            {watchedValues.quotePrefix || "—"}
          </span>
        </div>

        <div className="p-2 bg-slate-50 rounded border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <GlobeIcon size={12} className="text-slate-400" />
            <span className={cn(DS.label, "text-slate-500")}>Localisation</span>
          </div>
          <span className={cn(DS.mono, "text-slate-700")}>UEMOA / XOF</span>
        </div>

        <div className="p-2 bg-emerald-50 rounded border border-emerald-100">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircleIcon size={12} className="text-emerald-500" />
            <span className={cn(DS.label, "text-emerald-600")}>Statut</span>
          </div>
          <span className={cn(DS.mono, "text-emerald-700")}>VÉRIFIÉ</span>
        </div>
      </div>
    </div>
  );
}
