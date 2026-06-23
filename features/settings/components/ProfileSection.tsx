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
import {
  DS_BENTO_CARD,
  DS_LABEL,
  DS_MONO,
  DS_MICRO,
  DS_INPUT,
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
    if (trimmed && !trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
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

  const getAddressLength = useCallback(() => formatAddressForPDF().length, [formatAddressForPDF]);

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


  return (
    <div className={cn(DS_BENTO_CARD, "p-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-indigo-50 flex items-center justify-center">
            <BuildingOfficeIcon size={10} className="text-indigo-500" />
          </div>
          <span className={cn(DS_MICRO, "text-slate-500")}>Conditions Générales</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Conditions Générales */}
        <div>
          <h4 className={cn(DS_MICRO, "text-slate-500 mb-1.5")}>Conditions Générales</h4>
          <textarea {...register("defaultTerms")} rows={2}
            className={cn(DS_INPUT, "font-sans w-full resize-none text-xs rounded-md")} placeholder="Conditions de paiement, délais, clauses..." />
        </div>

        {/* Aperçu PDF */}
        <div className="p-2 bg-slate-50 rounded border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1">
            <FileTextIcon size={9} className="text-slate-400" />
            <span className={cn(DS_MICRO, "text-slate-500")}>Aperçu En-tête PDF</span>
            {getAddressLength() > 80 && <span className="px-1 py-0.5 rounded text-[7px] font-bold bg-amber-50 text-amber-600 border border-amber-200">TROP LONG</span>}
          </div>
          <div className="bg-white p-2 rounded border border-slate-100">
            <div className={cn(DS_MONO, "text-[10px] text-slate-700")}>
              {watchedValues.companyName || "Studio Digital Ivoire"} — {watchedValues.taxIdLabel || "NCC"} : {watchedValues.taxId || "CI-ABJ-2023-A-12345"} — {formatAddressForPDF()}
            </div>
          </div>
          {getAddressLength() > 80 && <p className="mt-1 text-[9px] text-amber-700">L'adresse est trop longue.</p>}
        </div>
      </div>
    </div>
  );
}